import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Development-only auth guard that injects a mock admin user.
 * Used when NODE_ENV=development and no Cognito is configured.
 */
@Injectable()
export class DevAuthGuard implements CanActivate {
  private readonly logger = new Logger(DevAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    this.logger.warn('⚠️  DEV AUTH GUARD ACTIVE — all requests authenticated as admin');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Inject a mock admin user for development
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
}
