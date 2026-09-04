import fs from 'node:fs';
import path from 'node:path';
import { getArtifacts } from '@asc3nd/core/artifacts';
import { listApprovals, requestApproval, updateApprovalStatus, APPROVAL_STATES } from '@asc3nd/core/approval-lifecycle';
import { readEvents } from '@asc3nd/core/events';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';

const getDataDir = () => process.env.DATA_DIR || path.resolve(process.cwd(), 'mission-data');

function refs(value = []) { return Array.isArray(value) ? value.map(String) : []; }
function missionRef(missionId) { return `mission:${missionId}`; }
function isInside(root, candidate) { return candidate === root || candidate.startsWith(`${root}${path.sep}`); }

function conversationMissions({ tenantId, userId, conversationId, read = readEvents }) {
  return (read({ tenantId, type: CLIENT_MISSION_EVENT }) || [])
    .map((event) => event.payload?.handoff)
    .filter((mission) => mission && mission.tenant_id === tenantId && mission.user_id === userId && mission.conversation_id === conversationId);
}

function findMissionEvent({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  return (read({ tenantId, type: CLIENT_MISSION_EVENT }) || []).find((event) => {
    const mission = event.payload?.handoff;
    return mission && mission.mission_id === missionId && mission.tenant_id === tenantId && mission.user_id === userId && mission.conversation_id === conversationId;
  }) || null;
}

function actionTypeForMission(mission) {
  if (mission.domain === 'grants') return 'GRANT_SUBMISSION';
  if (mission.domain === 'content') return 'PUBLIC_PUBLISHING';
  if (mission.domain === 'crm') return 'OUTBOUND_MESSAGE';
  return 'UNRESTRICTED_EXECUTION';
}

export function listMissionArtifacts({ tenantId, missionId, listArtifacts = getArtifacts }) {
  return (listArtifacts({ tenantId }) || []).filter((artifact) => artifact.tenantId === tenantId && refs(artifact.sourceRefs).includes(missionRef(missionId)));
}

export function findMissionApproval({ tenantId, missionId, approvals = listApprovals({ tenantId }) }) {
  return [...approvals]
    .filter((approval) => approval.tenantId === tenantId && (approval.actionPayload?.missionId === missionId || approval.actionPayload?.mission_id === missionId))
    .sort((a, b) => String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')))
    .at(-1) || null;
}

export function ensureMissionApproval({ tenantId, userId, conversationId, missionId, requester = 'firstmate', read = readEvents }) {
  const event = findMissionEvent({ tenantId, userId, conversationId, missionId, read });
  if (!event) throw new Error('MISSION_NOT_FOUND');
  const mission = event.payload.handoff;
  const historicallyApprovalGated = mission.approval?.required === true || mission.status === 'needs_you';
  if (!historicallyApprovalGated) return null;
  const existing = findMissionApproval({ tenantId, missionId });
  if (existing) return existing;
  return requestApproval({
    tenantId,
    actionType: actionTypeForMission(mission),
    actionPayload: { missionId, conversationId, userId, objective: mission.objective, domain: mission.domain },
    requester
  });
}

export function missionEvidence({ tenantId, userId, conversationId, missionId, read = readEvents, recoverApproval = false }) {
  const event = findMissionEvent({ tenantId, userId, conversationId, missionId, read });
  if (!event) throw new Error('MISSION_NOT_FOUND');
  const approval = recoverApproval
    ? ensureMissionApproval({ tenantId, userId, conversationId, missionId, read })
    : findMissionApproval({ tenantId, missionId });
  const artifacts = listMissionArtifacts({ tenantId, missionId }).map((artifact) => ({
    id: artifact.id,
    title: artifact.title || artifact.kind || 'Artifact',
    kind: artifact.kind || 'artifact',
    mimeType: artifact.mimeType || 'application/octet-stream',
    approvalStatus: artifact.approvalStatus || null,
    createdAt: artifact.createdAt,
    previewUrl: `/api/agent/client-chat/conversations/${encodeURIComponent(conversationId)}/missions/${encodeURIComponent(missionId)}/artifacts/${encodeURIComponent(artifact.id)}`,
    downloadUrl: `/api/agent/client-chat/conversations/${encodeURIComponent(conversationId)}/missions/${encodeURIComponent(missionId)}/artifacts/${encodeURIComponent(artifact.id)}?download=1`
  }));
  return { artifacts, approval };
}

export function conversationEvidenceRefs({ tenantId, userId, conversationId, read = readEvents }) {
  const missionIds = [...new Set(conversationMissions({ tenantId, userId, conversationId, read }).map((mission) => mission.mission_id))];
  const artifactRefs = [];
  const approvalRefs = [];
  const approvals = listApprovals({ tenantId });
  for (const missionId of missionIds) {
    for (const artifact of listMissionArtifacts({ tenantId, missionId })) artifactRefs.push(`artifact:${artifact.id}`);
    const approval = findMissionApproval({ tenantId, missionId, approvals });
    if (approval) approvalRefs.push(`approval:${approval.id}`);
  }
  return { artifactRefs: [...new Set(artifactRefs)], approvalRefs: [...new Set(approvalRefs)] };
}

export function resolveMissionArtifactFile({ tenantId, userId, conversationId, missionId, artifactId, read = readEvents }) {
  if (!findMissionEvent({ tenantId, userId, conversationId, missionId, read })) throw new Error('MISSION_NOT_FOUND');
  const artifact = listMissionArtifacts({ tenantId, missionId }).find((row) => row.id === artifactId);
  if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
  const tenantRoot = path.resolve(getDataDir(), tenantId);
  const absolute = path.resolve(tenantRoot, artifact.storagePath || '');
  if (!isInside(tenantRoot, absolute)) throw new Error('ARTIFACT_PATH_OUT_OF_SCOPE');
  if (!fs.existsSync(absolute)) return { artifact, absolute, exists: false };
  if (fs.lstatSync(absolute).isSymbolicLink()) throw new Error('ARTIFACT_SYMLINK_FORBIDDEN');
  const realTenantRoot = fs.realpathSync(tenantRoot);
  const realAbsolute = fs.realpathSync(absolute);
  if (!isInside(realTenantRoot, realAbsolute)) throw new Error('ARTIFACT_PATH_OUT_OF_SCOPE');
  const exists = fs.statSync(realAbsolute).isFile();
  return { artifact, absolute: realAbsolute, exists };
}

export function decideMissionApproval({ tenantId, userId, conversationId, missionId, decision, actor, comments, read = readEvents }) {
  if (!findMissionEvent({ tenantId, userId, conversationId, missionId, read })) throw new Error('MISSION_NOT_FOUND');
  const approval = ensureMissionApproval({ tenantId, userId, conversationId, missionId, requester: userId, read });
  if (!approval) throw new Error('APPROVAL_NOT_REQUIRED');
  if (decision === 'reject') {
    if (![APPROVAL_STATES.DRAFT, APPROVAL_STATES.REVIEW].includes(approval.status)) throw new Error('APPROVAL_NOT_DECIDABLE');
    return updateApprovalStatus({ tenantId, approvalId: approval.id, nextStatus: APPROVAL_STATES.REJECTED, actor, comments: comments || 'Rejected in client workspace.' });
  }
  if (decision !== 'approve') throw new Error('INVALID_APPROVAL_DECISION');
  let current = approval;
  if (current.status === APPROVAL_STATES.DRAFT) current = updateApprovalStatus({ tenantId, approvalId: current.id, nextStatus: APPROVAL_STATES.REVIEW, actor, comments });
  if (current.status === APPROVAL_STATES.REVIEW) current = updateApprovalStatus({ tenantId, approvalId: current.id, nextStatus: APPROVAL_STATES.APPROVED, actor, comments });
  return current;
}