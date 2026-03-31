import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Interceptor that automatically logs all mutations (POST, PUT, PATCH, DELETE)
 * to the ActivityLog table. Captures the entity type, entity ID, changes diff,
 * user info, IP address, and user agent.
 *
 * Usage: Apply @Audit({ entityType: 'Regulation', action: 'UPDATE' }) to the handler.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(AUDIT_KEY, context.getHandler());

    // Only audit endpoints marked with @Audit decorator
    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    const ipAddress =
      request.ip || request.connection?.remoteAddress || request.headers['x-forwarded-for'];
    const userAgent = request.headers['user-agent'] || '';
    const method = request.method;

    // Capture the request body as "before" context for creates, or for reference
    const requestBody = { ...request.body };
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const duration = Date.now() - startTime;

          // Extract entity ID from the response or route params
          const entityId =
            responseData?.id || request.params?.id || request.params?.regulationId || null;

          // Compute a simple diff for update operations
          const changes = this.computeChanges(auditMetadata.action, requestBody, responseData);

          await this.prisma.activityLog.create({
            data: {
              entityType: auditMetadata.entityType,
              entityId: entityId ? String(entityId) : 'unknown',
              action: auditMetadata.action,
              changes: changes as any,
              userId: user?.sub || 'system',
              ipAddress: ipAddress ?? null,
              userAgent: userAgent,
              metadata: {
                method,
                path: request.originalUrl || request.url,
                statusCode: context.switchToHttp().getResponse().statusCode,
                duration,
                userName: user?.name || user?.email || 'system',
              },
            },
          });
        } catch (error) {
          // Audit logging should never block the main request
          this.logger.error(`Failed to write audit log: ${(error as Error).message}`, (error as Error).stack);
        }
      }),
    );
  }

  /**
   * Computes a simplified diff between the request (what was sent) and the response (what was saved).
   * For CREATE actions, the entire entity is the "change". For UPDATE, we show the fields that were sent.
   */
  private computeChanges(
    action: string,
    requestBody: Record<string, any>,
    responseData: any,
  ): Record<string, any> {
    if (action === 'CREATE') {
      return { created: true, fields: Object.keys(requestBody) };
    }

    if (action === 'DELETE') {
      return { deleted: true };
    }

    // For UPDATE/PATCH, list the fields that were modified
    const changedFields: Record<string, { from: any; to: any }> = {};
    for (const key of Object.keys(requestBody)) {
      if (responseData && responseData[key] !== undefined) {
        changedFields[key] = {
          from: '(previous value)',
          to: responseData[key],
        };
      }
    }

    return changedFields;
  }
}
