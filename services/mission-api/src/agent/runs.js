import { createAgentRun, completeAgentRun, getAgentRun } from '@asc3nd/core/agent-service';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';

export function createRun(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { agentSlug, stage, task, riskClass, traceId } = req.body || {};
    const result = createAgentRun({ tenantId, agentSlug, stage, task, riskClass, actor: req.operator.id, traceId });
    if (!result.ok) {
      return agentError(res, 'APPROVAL_REQUIRED', result.message || result.reason, 403);
    }
    return agentSuccess(res, { run: result.run }, 201);
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}

export function completeRun(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { id } = req.params;
    const { status, artifactIds, traceIds } = req.body || {};
    const result = completeAgentRun({ tenantId, runId: id, status, artifactIds: artifactIds || [], traceIds: traceIds || [] });
    return agentSuccess(res, { run: result.run });
  } catch (e) {
    const isNotFound = e.message?.includes('not found');
    return agentError(res, isNotFound ? 'NOT_FOUND' : 'AGENT_ERROR', e.message, isNotFound ? 404 : 500);
  }
}

export function getRun(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const { id } = req.params;
    const run = getAgentRun({ tenantId, runId: id });
    if (!run) return agentError(res, 'NOT_FOUND', `Run ${id} not found`, 404);
    return agentSuccess(res, { run });
  } catch (e) {
    return agentError(res, 'AGENT_ERROR', e.message, 500);
  }
}
