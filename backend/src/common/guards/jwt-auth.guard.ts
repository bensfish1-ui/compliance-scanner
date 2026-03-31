import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { promisify } from 'util';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * JWT Authentication Guard that validates AWS Cognito tokens.
 * Verifies the token signature using the Cognito JWKS endpoint,
 * checks expiration, issuer, and token_use claims.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private jwksClient: jwksRsa.JwksClient;
  private readonly issuer: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    const userPoolId = this.configService.get<string>('aws.cognito.userPoolId');
    const region = this.configService.get<string>('aws.cognito.region', 'eu-west-1');

    this.issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    this.jwksClient = new jwksRsa.JwksClient({
      jwksUri: `${this.issuer}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const decoded = await this.verifyToken(token);
      // Map Cognito claims to our internal user representation
      request.user = this.mapCognitoClaimsToUser(decoded);
      return true;
    } catch (error) {
      this.logger.warn(`JWT verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private async verifyToken(token: string): Promise<any> {
    // Decode the token header to get the key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || typeof decodedHeader === 'string') {
      throw new Error('Invalid token format');
    }

    const kid = decodedHeader.header.kid;
    if (!kid) {
      throw new Error('Token missing kid header');
    }

    // Get the signing key from Cognito JWKS
    const getSigningKey = promisify(this.jwksClient.getSigningKey.bind(this.jwksClient));
    const key = await getSigningKey(kid);
    const signingKey = (key as jwksRsa.SigningKey).getPublicKey();

    // Verify the token signature, expiration, and issuer
    return jwt.verify(token, signingKey, {
      issuer: this.issuer,
      algorithms: ['RS256'],
    });
  }

  /**
   * Maps AWS Cognito JWT claims to our internal AuthenticatedUser type.
   * Cognito groups are used for role-based access control.
   */
  private mapCognitoClaimsToUser(claims: any): AuthenticatedUser {
    const groups: string[] = claims['cognito:groups'] || [];

    return {
      sub: claims.sub,
      email: claims.email || '',
      name: claims.name || claims['cognito:username'] || '',
      roles: groups,
      organizationId: claims['custom:organizationId'] || '',
      tenantId: claims['custom:tenantId'] || '',
      cognitoGroups: groups,
    };
  }
}
