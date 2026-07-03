import { validateOperatorKey } from '@asc3nd/core/auth';
import { emitEvent } from '@asc3nd/core/events';
import { operatorError } from './response.js';

function extractTenantId(key) {
  if (!key || !key.startsWith('ok_')) return null;
  const parts = key.split('_');
  return parts.length >= 3 ? parts[1] : null;
}

export function agentAuth() {
  return (req, res, next) => {
    try {
      const header = req.headers['authorization'] || '';
      const match = /^Bearer\s+(.+)$/i.exec(header);
      if (!match) {
        return operatorError(res, 'MISSING_KEY', 'Authorization header with Bearer key required', 401);
      }
      const rawKey = match[1];
      const tenantId = req.headers['x-tenant-id'] || extractTenantId(rawKey);
      if (!tenantId) {
        return operatorError(res, 'INVALID_KEY', 'Cannot determine tenant from agent key', 401);
      }
      const opKey = validateOperatorKey({ key: rawKey, tenantId });
      req.operator = { ...opKey, tenantId };
      try {
        emitEvent({
          tenantId,
          type: 'AGENT.API.REQUEST',
          actor: opKey.id,
          subject: opKey.id,
          payload: { label: opKey.label, path: req.path, method: req.method }
        });
      } catch {}
      next();
    } catch {
      return operatorError(res, 'FORBIDDEN', 'Invalid or missing agent key', 401);
    }
  };
}

export function requireTenantMatch() {
  return (req, res, next) => {
    const paramTenantId = req.params.tenantId;
    if (paramTenantId && paramTenantId !== req.operator?.tenantId) {
      return operatorError(res, 'CROSS_TENANT', 'Cross-tenant access is not allowed', 403);
    }
    next();
  };
}
