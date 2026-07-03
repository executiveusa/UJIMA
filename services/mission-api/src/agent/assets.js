import { registerAgentAsset, getAgentAsset } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function createAsset(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { runId, title, storagePath, mimeType, approvalClass } = req.body || {};
    const asset = registerAgentAsset({ tenantId, runId, title, storagePath, mimeType, approvalClass });
    return agentSuccess(res, { asset }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}

export function getAsset(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { id } = req.params;
    const asset = getAgentAsset({ tenantId, assetId: id });
    if (!asset) return agentError(res, 'NOT_FOUND', `Asset ${id} not found`, 404);
    return agentSuccess(res, { asset });
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
