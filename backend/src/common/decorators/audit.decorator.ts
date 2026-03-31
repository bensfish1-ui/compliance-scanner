import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  /** The entity type being modified (e.g., 'Regulation', 'Task') */
  entityType: string;
  /** The action being performed (e.g., 'CREATE', 'UPDATE', 'DELETE') */
  action: string;
}

/**
 * Decorator to mark an endpoint for automatic audit logging.
 * The audit interceptor will capture before/after state and log the diff.
 * Usage: @Audit({ entityType: 'Regulation', action: 'UPDATE' })
 */
export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_KEY, metadata);
