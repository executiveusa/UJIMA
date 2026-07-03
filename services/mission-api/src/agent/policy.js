import { buildAgentPolicy } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function getAgentPolicy(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const policy = buildAgentPolicy({ tenantId });
    return agentSuccess(res, policy);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
