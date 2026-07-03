import { buildAgentContext } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function getAgentContext(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const context = buildAgentContext({ tenantId });
    return agentSuccess(res, context);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
