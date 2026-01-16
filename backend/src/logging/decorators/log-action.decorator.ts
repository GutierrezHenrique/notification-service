import { SetMetadata } from '@nestjs/common';

export const LOG_ACTION_KEY = 'log_action';
export const LOG_AUDIT_KEY = 'log_audit';

export interface LogActionOptions {
  action: string;
  resource: string;
  audit?: boolean;
}

/**
 * Decorator to automatically log business actions
 * @param action - The action being performed (e.g., 'create', 'update', 'delete')
 * @param resource - The resource type (e.g., 'album', 'photo', 'user')
 * @param audit - Whether this action should be logged in audit log
 */
export const LogAction = (action: string, resource: string, audit = false) => {
  return SetMetadata(LOG_ACTION_KEY, { action, resource, audit });
};

/**
 * Decorator to mark methods that require audit logging
 */
export const AuditLog = () => SetMetadata(LOG_AUDIT_KEY, true);
