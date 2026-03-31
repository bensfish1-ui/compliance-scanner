import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

/**
 * Passport strategy for validating AWS Cognito JWTs.
 * Uses the JWKS endpoint to dynamically fetch signing keys.
 */
@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  private readonly logger = new Logger(CognitoStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const userPoolId = configService.get<string>('aws.cognito.userPoolId');
    const region = configService.get<string>('aws.cognito.region', 'eu-west-1');
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer,
      algorithms: ['RS256'],
      // Dynamically fetch the signing key from Cognito JWKS endpoint
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
    });
  }

  /**
   * Validate callback called by Passport after JWT verification.
   * Maps Cognito claims to our internal user representation.
   */
  async validate(payload: any): Promise<AuthenticatedUser> {
    return {
      sub: payload.sub,
      email: payload.email || '',
      name: payload.name || payload['cognito:username'] || '',
      roles: payload['cognito:groups'] || [],
      organizationId: payload['custom:organizationId'] || '',
      tenantId: payload['custom:tenantId'] || '',
      cognitoGroups: payload['cognito:groups'] || [],
    };
  }
}
