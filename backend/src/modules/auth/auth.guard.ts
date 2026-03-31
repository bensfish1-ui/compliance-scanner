import { Injectable, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark an endpoint as public (no auth required).
 * Usage: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Cognito JWT auth guard that integrates with Passport.
 * In development mode without Cognito configured, injects a mock admin user.
 */
@Injectable()
export class CognitoAuthGuard extends AuthGuard('cognito') {
  private readonly isDevMode: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
    const cognitoPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    this.isDevMode = !cognitoPoolId || cognitoPoolId === '';
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Dev mode: bypass Cognito and inject mock admin user
    if (this.isDevMode) {
      const request = context.switchToHttp().getRequest();
      request.user = {
        sub: 'dev-admin-001',
        email: 'admin@compliancescanner.dev',
        name: 'Admin User',
        roles: ['ADMIN'],
        organizationId: 'dev-org',
        tenantId: 'dev-tenant',
        cognitoGroups: ['ADMIN'],
      };
      return true;
    }

    return super.canActivate(context);
  }
}
