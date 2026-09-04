import { registerAgentArtifact } from '@asc3nd/core/agent-service';
import { readEvents } from '@asc3nd/core/events';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';

function validateMissionRef({ tenantId, missionId }) {
  if (!missionId) return [];
  const exists = (readEvents({ tenantId, type: CLIENT_MISSION_EVENT }) || []).some((event) => {
    const mission = event.payload?.handoff;
    return mission?.mission_id === missionId && mission?.tenant_id === tenantId;
  });
  if (!exists) throw new Error('MISSION_NOT_FOUND');
  return [`mission:${missionId}`];
}

export function createArtifact(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { runId, missionId, kind, title, storagePath, approvalClass, mimeType } = req.body || {};
    const sourceRefs = validateMissionRef({ tenantId, missionId });
    const artifact = registerAgentArtifact({ tenantId, runId, kind, title, storagePath, approvalClass, mimeType, sourceRefs });
    return agentSuccess(res, { artifact }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
