import { requestAgentApproval } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function requestApproval(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { runId, action, riskClass, payload } = req.body || {};
    const result = requestAgentApproval({
      tenantId,
      runId,
      action,
      riskClass,
      payload: payload || {},
      actor: 'hermes'
    });
    if (!result.ok) {
      return agentError(res, 'POLICY_BLOCKED', result.message || result.reason, 403);
    }
    return agentSuccess(res, { approval: result.approval }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
