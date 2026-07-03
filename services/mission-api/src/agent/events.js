import { recordAgentEvent } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function emitAgentEvent(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { runId, type, payload } = req.body || {};
    const event = recordAgentEvent({ tenantId, runId, type, payload: payload || {} });
    return agentSuccess(res, { event }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
