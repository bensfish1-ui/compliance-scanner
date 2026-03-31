import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AuthFlowType,
  GetUserCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthResponseDto, UserProfileDto } from './dto/login.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const region = this.configService.get<string>('aws.cognito.region', 'eu-west-1');

    this.cognitoClient = new CognitoIdentityProviderClient({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey', ''),
      },
    });

    this.clientId = this.configService.get<string>('aws.cognito.clientId', '');
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new UnauthorizedException('Authentication failed');
      }

      const { AccessToken, IdToken, RefreshToken, ExpiresIn } = response.AuthenticationResult;

      // Sync user profile to local database on login
      await this.syncUserProfile(AccessToken!);

      return {
        accessToken: AccessToken!,
        idToken: IdToken!,
        refreshToken: RefreshToken!,
        expiresIn: ExpiresIn!,
      };
    } catch (error: any) {
      this.logger.warn(`Login failed for ${email}: ${error.message}`);

      if (error.name === 'NotAuthorizedException') {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new UnauthorizedException('Please confirm your email address first');
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new UnauthorizedException('Token refresh failed');
      }

      const { AccessToken, IdToken, ExpiresIn } = response.AuthenticationResult;

      return {
        accessToken: AccessToken!,
        idToken: IdToken!,
        refreshToken, // Cognito does not return a new refresh token
        expiresIn: ExpiresIn!,
      };
    } catch (error: any) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Token refresh failed. Please login again.');
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });
      await this.cognitoClient.send(command);
    } catch (error: any) {
      this.logger.warn(`Logout failed: ${error.message}`);
    }
  }

  async getProfile(user: AuthenticatedUser): Promise<UserProfileDto> {
    const dbUser = await this.prisma.user.findUnique({
      where: { cognitoId: user.sub },
    });

    return {
      sub: user.sub,
      email: user.email,
      name: dbUser?.name || user.name,
      roles: user.roles,
      organizationId: user.organizationId,
    };
  }

  private async syncUserProfile(accessToken: string): Promise<void> {
    try {
      const command = new GetUserCommand({ AccessToken: accessToken });
      const response = await this.cognitoClient.send(command);

      const attributes = new Map(
        response.UserAttributes?.map((attr) => [attr.Name, attr.Value]) || [],
      );

      const sub = attributes.get('sub');
      if (!sub) return;

      await this.prisma.user.upsert({
        where: { cognitoId: sub },
        create: {
          cognitoId: sub,
          email: attributes.get('email') || '',
          name: attributes.get('name') || attributes.get('cognito:username') || '',
          role: 'VIEWER',
        },
        update: {
          email: attributes.get('email') || '',
          name: attributes.get('name') || '',
          lastLoginAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to sync user profile: ${error.message}`);
    }
  }
}
