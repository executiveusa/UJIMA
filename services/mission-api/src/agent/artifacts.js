import { registerAgentArtifact } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function createArtifact(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { runId, kind, title, storagePath, approvalClass, mimeType } = req.body || {};
    const artifact = registerAgentArtifact({ tenantId, runId, kind, title, storagePath, approvalClass, mimeType });
    return agentSuccess(res, { artifact }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
