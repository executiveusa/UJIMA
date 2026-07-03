import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { assertTenantBoundary } from './safety.js';
import { emitEvent } from './events.js';
import { registerArtifact, getArtifacts } from './artifacts.js';
import { requestApproval } from './approval-lifecycle.js';
import { getModelBudget } from './model-budgets.js';
import { listIcmTree } from './icm.js';
import { evaluateActionPolicy, HARD_BLOCK_KEYWORDS } from './policy.js';

const HARD_BLOCKED_ACTIONS = Object.keys(HARD_BLOCK_KEYWORDS).map((k) => HARD_BLOCK_KEYWORDS[k].toUpperCase());
const DRY_RUN_NOTE = 'Live Hermes execution deferred to Phase 9B.';

const getDataDir = () => process.env.DATA_DIR || path.resolve(process.cwd(), 'mission-data');
const getIcmRoot = () => process.env.ICM_ROOT || path.resolve(process.cwd(), 'icm');

function runsPath(tenantId) {
  return path.join(getDataDir(), tenantId, 'agent-runs.json');
}

function readAgentRuns(tenantId) {
  try { return JSON.parse(fs.readFileSync(runsPath(tenantId), 'utf8')); } catch { return []; }
}

function saveAgentRuns(tenantId, runs) {
  const file = runsPath(tenantId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(runs, null, 2), 'utf8');
}

export function buildAgentContext({ tenantId }) {
  assertTenantBoundary(tenantId);
  const icmRoot = getIcmRoot();
  const icmPath = `icm/tenants/${tenantId}`;
  const stages = listIcmTree({ base: icmRoot, tenantId });

  const budget = getModelBudget(tenantId);
  const safeBudget = {
    monthlyBudgetUsd: budget.monthlyBudgetUsd,
    warningThresholdPct: budget.warningThresholdPct,
    hardBlockThresholdPct: budget.hardBlockThresholdPct
  };

  return {
    ok: true,
    tenantId,
    icm: { workspacePath: icmPath, stages },
    policy: {
      hardBlocks: [
        'GRANT_SUBMISSION', 'LEGAL_FINANCIAL_FILING', 'OUTBOUND_MESSAGE',
        'PUBLIC_PUBLISHING', 'UNRESTRICTED_EXECUTION', 'CROSS_TENANT_ACCESS'
      ],
      orangeRequired: ['social', 'email-draft', 'outbound'],
      selfApprovalProhibited: true
    },
    budgets: safeBudget,
    capabilities: [
      'read_context', 'create_run', 'emit_event',
      'register_artifact', 'register_asset', 'request_approval'
    ],
    redaction: {
      alwaysRedact: ['secret', 'password', 'token', 'key', 'jwt', 'credential'],
      noRawKeysInResponse: true
    },
    mode: 'dry-run'
  };
}

export function buildAgentPolicy({ tenantId }) {
  assertTenantBoundary(tenantId);
  return {
    ok: true,
    tenantId,
    hardBlocks: [
      'GRANT_SUBMISSION', 'LEGAL_FINANCIAL_FILING', 'OUTBOUND_MESSAGE',
      'PUBLIC_PUBLISHING', 'UNRESTRICTED_EXECUTION', 'CROSS_TENANT_ACCESS'
    ],
    riskGates: {
      green: 'allowed — dry-run queued',
      yellow: 'allowed — draft/artifact mode',
      orange: 'blocked — approval required',
      red: 'blocked — restricted approval required'
    },
    selfApprovalProhibited: true,
    approvalClasses: {
      orange: 'Human review required. Approver role: operator or owner.',
      red: 'Human review required. Approver role: owner only.'
    },
    mode: 'dry-run'
  };
}

export function createAgentRun({ tenantId, agentSlug, stage, task, riskClass = 'green', actor = 'hermes', traceId }) {
  assertTenantBoundary(tenantId);
  if (!task) throw new Error('task is required');
  if (!agentSlug) throw new Error('agentSlug is required');

  if (riskClass === 'orange' || riskClass === 'red') {
    return {
      ok: false,
      blocked: true,
      reason: `Risk class ${riskClass} requires approval before dispatch.`,
      approvalClass: riskClass,
      message: `Run blocked: risk class ${riskClass} requires human approval. Use requestAgentApproval first.`
    };
  }

  const runId = `arn_${crypto.randomBytes(8).toString('hex')}`;
  const run = {
    id: runId,
    tenantId,
    agentSlug,
    stage: stage || null,
    task,
    riskClass,
    actor,
    status: 'queued',
    mode: 'dry-run',
    traceId: traceId || `trc_${crypto.randomBytes(8).toString('hex')}`,
    artifactIds: [],
    traceIds: [],
    createdAt: new Date().toISOString()
  };

  const runs = readAgentRuns(tenantId);
  runs.unshift(run);
  saveAgentRuns(tenantId, runs);

  try {
    emitEvent({
      tenantId,
      type: 'AGENT.RUN.CREATED',
      actor,
      subject: runId,
      payload: { agentSlug, stage: stage || null, riskClass, mode: 'dry-run' }
    });
  } catch {}

  return { ok: true, run };
}

export function completeAgentRun({ tenantId, runId, status, artifactIds = [], traceIds = [] }) {
  assertTenantBoundary(tenantId);
  if (!runId) throw new Error('runId is required');
  const allowed = ['completed', 'failed', 'cancelled'];
  if (!allowed.includes(status)) throw new Error(`status must be one of: ${allowed.join(', ')}`);

  const runs = readAgentRuns(tenantId);
  const idx = runs.findIndex((r) => r.id === runId);
  if (idx < 0) throw new Error(`Agent run ${runId} not found`);
  if (runs[idx].tenantId !== tenantId) throw new Error('Tenant boundary violation');

  runs[idx] = { ...runs[idx], status, artifactIds, traceIds, completedAt: new Date().toISOString() };
  saveAgentRuns(tenantId, runs);

  try {
    emitEvent({
      tenantId,
      type: 'AGENT.RUN.COMPLETED',
      actor: 'hermes',
      subject: runId,
      payload: { status, artifactIds }
    });
  } catch {}

  return { ok: true, run: runs[idx] };
}

export function getAgentRun({ tenantId, runId }) {
  assertTenantBoundary(tenantId);
  const runs = readAgentRuns(tenantId);
  const run = runs.find((r) => r.id === runId);
  if (!run) return null;
  if (run.tenantId !== tenantId) throw new Error('Tenant boundary violation');
  return run;
}

export function recordAgentEvent({ tenantId, runId, type, payload = {} }) {
  assertTenantBoundary(tenantId);
  if (!type) throw new Error('type is required');
  return emitEvent({
    tenantId,
    type: `AGENT.${type}`,
    actor: 'hermes',
    subject: runId || null,
    payload
  });
}

export function registerAgentArtifact({ tenantId, runId, kind, title, storagePath, approvalClass = 'green', mimeType = 'application/octet-stream' }) {
  assertTenantBoundary(tenantId);
  if (!kind) throw new Error('kind is required');
  if (!title) throw new Error('title is required');
  if (!storagePath) throw new Error('storagePath is required');

  const approvalStatus = (approvalClass === 'orange' || approvalClass === 'red') ? 'pending' : 'approved';
  return registerArtifact({
    tenantId,
    runId: runId || null,
    kind,
    title,
    mimeType,
    storagePath,
    approvalClass,
    approvalStatus,
    createdBy: 'hermes'
  });
}

export function registerAgentAsset({ tenantId, runId, title, storagePath, mimeType = 'application/octet-stream', approvalClass = 'green' }) {
  return registerAgentArtifact({ tenantId, runId, kind: 'asset', title, storagePath, mimeType, approvalClass });
}

export function getAgentAsset({ tenantId, assetId }) {
  assertTenantBoundary(tenantId);
  const all = getArtifacts({ tenantId });
  const asset = all.find((a) => a.id === assetId);
  if (!asset) return null;
  if (asset.tenantId !== tenantId) throw new Error('Tenant boundary violation');
  return asset;
}

export function requestAgentApproval({ tenantId, runId, action, riskClass, payload = {}, actor = 'hermes' }) {
  assertTenantBoundary(tenantId);
  if (!action) throw new Error('action is required');

  // Hard blocks cannot be approved
  if (HARD_BLOCKED_ACTIONS.includes(action.toUpperCase())) {
    const policy = evaluateActionPolicy({ actionType: action.toUpperCase(), actionPayload: payload });
    return {
      ok: false,
      blocked: true,
      reason: policy.reason,
      approvalClass: policy.approvalClass,
      message: `Approval request blocked: ${policy.reason}`
    };
  }

  const approval = requestApproval({
    tenantId,
    actionType: action,
    actionPayload: {
      ...payload,
      runId: runId || null,
      requestedBy: actor,
      selfApprovalProhibited: true,
      note: DRY_RUN_NOTE
    },
    requester: actor
  });

  return { ok: true, approval };
}
