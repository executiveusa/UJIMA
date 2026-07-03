import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  buildAgentContext,
  buildAgentPolicy,
  createAgentRun,
  completeAgentRun,
  getAgentRun,
  recordAgentEvent,
  registerAgentArtifact,
  registerAgentAsset,
  getAgentAsset,
  requestAgentApproval
} from '../src/agent-service.js';

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-svc-test-'));
  process.env.DATA_DIR = tmp;
  process.env.ICM_ROOT = tmp;
});
afterEach(() => {
  delete process.env.DATA_DIR;
  delete process.env.ICM_ROOT;
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('buildAgentContext', () => {
  it('returns ok:true with required shape', () => {
    const ctx = buildAgentContext({ tenantId: 'test-org' });
    expect(ctx.ok).toBe(true);
    expect(ctx.tenantId).toBe('test-org');
    expect(ctx.icm).toBeDefined();
    expect(ctx.policy).toBeDefined();
    expect(ctx.budgets).toBeDefined();
    expect(ctx.capabilities).toBeInstanceOf(Array);
    expect(ctx.redaction).toBeDefined();
    expect(ctx.mode).toBe('dry-run');
  });

  it('excludes secrets — no raw keys in response', () => {
    const ctx = buildAgentContext({ tenantId: 'test-org' });
    const json = JSON.stringify(ctx);
    expect(json).not.toContain('ok_');
    expect(json).not.toContain('sk-');
    expect(json).not.toContain('NEXTAUTH_SECRET');
    expect(json).not.toContain('POSTGRES_PASSWORD');
  });

  it('includes hard blocks list in policy', () => {
    const ctx = buildAgentContext({ tenantId: 'test-org' });
    expect(ctx.policy.hardBlocks).toContain('GRANT_SUBMISSION');
    expect(ctx.policy.hardBlocks).toContain('LEGAL_FINANCIAL_FILING');
    expect(ctx.policy.hardBlocks).toContain('OUTBOUND_MESSAGE');
    expect(ctx.policy.selfApprovalProhibited).toBe(true);
  });

  it('refuses invalid tenant id', () => {
    expect(() => buildAgentContext({ tenantId: '../escape' })).toThrow(/Unsafe path|Invalid tenant/);
  });
});

describe('buildAgentPolicy', () => {
  it('includes all hard block action types', () => {
    const policy = buildAgentPolicy({ tenantId: 'test-org' });
    expect(policy.ok).toBe(true);
    expect(policy.hardBlocks).toContain('GRANT_SUBMISSION');
    expect(policy.hardBlocks).toContain('LEGAL_FINANCIAL_FILING');
    expect(policy.hardBlocks).toContain('OUTBOUND_MESSAGE');
    expect(policy.hardBlocks).toContain('PUBLIC_PUBLISHING');
    expect(policy.hardBlocks).toContain('UNRESTRICTED_EXECUTION');
    expect(policy.hardBlocks).toContain('CROSS_TENANT_ACCESS');
  });

  it('marks self approval as prohibited', () => {
    const policy = buildAgentPolicy({ tenantId: 'test-org' });
    expect(policy.selfApprovalProhibited).toBe(true);
  });

  it('shows orange and red are blocked', () => {
    const policy = buildAgentPolicy({ tenantId: 'test-org' });
    expect(policy.riskGates.orange).toMatch(/blocked/i);
    expect(policy.riskGates.red).toMatch(/blocked/i);
  });
});

describe('createAgentRun', () => {
  it('creates a dry-run queued run for green risk', () => {
    const result = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes-programs', task: 'Summarize grants', riskClass: 'green' });
    expect(result.ok).toBe(true);
    expect(result.run.id).toMatch(/^arn_/);
    expect(result.run.tenantId).toBe('test-org');
    expect(result.run.status).toBe('queued');
    expect(result.run.mode).toBe('dry-run');
  });

  it('creates a dry-run run for yellow risk', () => {
    const result = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes-comms', task: 'Draft newsletter', riskClass: 'yellow' });
    expect(result.ok).toBe(true);
    expect(result.run.status).toBe('queued');
  });

  it('blocks orange risk with approval required', () => {
    const result = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes-comms', task: 'Send donor email', riskClass: 'orange' });
    expect(result.ok).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.approvalClass).toBe('orange');
  });

  it('blocks red risk with approval required', () => {
    const result = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes-grants', task: 'Submit grant', riskClass: 'red' });
    expect(result.ok).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.approvalClass).toBe('red');
  });

  it('is tenant-scoped — run stored under correct tenant', () => {
    createAgentRun({ tenantId: 'tenant-a', agentSlug: 'hermes', task: 'Task A', riskClass: 'green' });
    createAgentRun({ tenantId: 'tenant-b', agentSlug: 'hermes', task: 'Task B', riskClass: 'green' });
    const runsA = JSON.parse(fs.readFileSync(path.join(tmp, 'tenant-a', 'agent-runs.json'), 'utf8'));
    const runsB = JSON.parse(fs.readFileSync(path.join(tmp, 'tenant-b', 'agent-runs.json'), 'utf8'));
    expect(runsA.every((r) => r.tenantId === 'tenant-a')).toBe(true);
    expect(runsB.every((r) => r.tenantId === 'tenant-b')).toBe(true);
  });

  it('throws when agentSlug is missing', () => {
    expect(() => createAgentRun({ tenantId: 'test-org', task: 'Task' })).toThrow('agentSlug is required');
  });

  it('throws when task is missing', () => {
    expect(() => createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes' })).toThrow('task is required');
  });
});

describe('completeAgentRun', () => {
  it('updates run status to completed', () => {
    const { run } = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes', task: 'Task', riskClass: 'green' });
    const result = completeAgentRun({ tenantId: 'test-org', runId: run.id, status: 'completed', artifactIds: ['art_abc'], traceIds: ['trc_xyz'] });
    expect(result.ok).toBe(true);
    expect(result.run.status).toBe('completed');
    expect(result.run.artifactIds).toContain('art_abc');
    expect(result.run.traceIds).toContain('trc_xyz');
    expect(result.run.completedAt).toBeDefined();
  });

  it('rejects invalid status', () => {
    const { run } = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes', task: 'Task', riskClass: 'green' });
    expect(() => completeAgentRun({ tenantId: 'test-org', runId: run.id, status: 'live' })).toThrow(/status must be one of/);
  });

  it('throws for unknown runId', () => {
    expect(() => completeAgentRun({ tenantId: 'test-org', runId: 'arn_notexist', status: 'completed' })).toThrow(/not found/);
  });
});

describe('getAgentRun', () => {
  it('retrieves a run by id', () => {
    const { run } = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes', task: 'Task', riskClass: 'green' });
    const found = getAgentRun({ tenantId: 'test-org', runId: run.id });
    expect(found).not.toBeNull();
    expect(found.id).toBe(run.id);
  });

  it('returns null for unknown run', () => {
    const result = getAgentRun({ tenantId: 'test-org', runId: 'arn_notexist' });
    expect(result).toBeNull();
  });
});

describe('recordAgentEvent', () => {
  it('emits a tenant-scoped event', () => {
    const { run } = createAgentRun({ tenantId: 'test-org', agentSlug: 'hermes', task: 'Task', riskClass: 'green' });
    const event = recordAgentEvent({ tenantId: 'test-org', runId: run.id, type: 'CONTEXT_LOADED', payload: { stage: '02_opportunity_scan' } });
    expect(event.tenantId).toBe('test-org');
    expect(event.type).toBe('AGENT.CONTEXT_LOADED');
    expect(event.subject).toBe(run.id);
  });

  it('redacts sensitive keys in payload', () => {
    const event = recordAgentEvent({ tenantId: 'test-org', type: 'TEST', payload: { secret: 'mysecret', data: 'ok' } });
    const stored = fs.readFileSync(path.join(tmp, 'test-org', 'events.jsonl'), 'utf8');
    expect(stored).toContain('[REDACTED]');
    expect(stored).not.toContain('mysecret');
  });
});

describe('registerAgentArtifact', () => {
  it('registers artifact with kind and title', () => {
    const artifact = registerAgentArtifact({ tenantId: 'test-org', kind: 'grant-draft', title: 'Grant Draft', storagePath: 'stages/03/output/draft.md' });
    expect(artifact.id).toMatch(/^art_/);
    expect(artifact.tenantId).toBe('test-org');
    expect(artifact.kind).toBe('grant-draft');
    expect(artifact.createdBy).toBe('hermes');
  });

  it('marks orange artifacts as pending', () => {
    const artifact = registerAgentArtifact({ tenantId: 'test-org', kind: 'campaign', title: 'Campaign', storagePath: 'output/camp.md', approvalClass: 'orange' });
    expect(artifact.approvalStatus).toBe('pending');
  });

  it('marks green artifacts as approved', () => {
    const artifact = registerAgentArtifact({ tenantId: 'test-org', kind: 'report', title: 'Report', storagePath: 'output/report.md', approvalClass: 'green' });
    expect(artifact.approvalStatus).toBe('approved');
  });
});

describe('registerAgentAsset', () => {
  it('registers asset with kind=asset', () => {
    const asset = registerAgentAsset({ tenantId: 'test-org', title: 'Outcome Chart', storagePath: 'output/chart.png' });
    expect(asset.kind).toBe('asset');
    expect(asset.tenantId).toBe('test-org');
  });
});

describe('getAgentAsset', () => {
  it('retrieves asset metadata by id', () => {
    const asset = registerAgentAsset({ tenantId: 'test-org', title: 'Chart', storagePath: 'output/chart.png' });
    const found = getAgentAsset({ tenantId: 'test-org', assetId: asset.id });
    expect(found).not.toBeNull();
    expect(found.id).toBe(asset.id);
  });

  it('returns null for unknown asset', () => {
    const result = getAgentAsset({ tenantId: 'test-org', assetId: 'art_notexist' });
    expect(result).toBeNull();
  });
});

describe('requestAgentApproval', () => {
  it('creates approval request with hermes as requester', () => {
    const result = requestAgentApproval({ tenantId: 'test-org', action: 'GENERATE_DRAFT', riskClass: 'yellow', payload: { task: 'Draft grant summary' } });
    expect(result.ok).toBe(true);
    expect(result.approval.requester).toBe('hermes');
    expect(result.approval.approver).toBeNull();
    expect(result.approval.actionPayload.selfApprovalProhibited).toBe(true);
  });

  it('blocks hard-blocked action types', () => {
    const result = requestAgentApproval({ tenantId: 'test-org', action: 'GRANT_SUBMISSION', riskClass: 'red', payload: {} });
    expect(result.ok).toBe(false);
    expect(result.blocked).toBe(true);
  });

  it('blocks OUTBOUND_MESSAGE', () => {
    const result = requestAgentApproval({ tenantId: 'test-org', action: 'OUTBOUND_MESSAGE', riskClass: 'orange', payload: {} });
    expect(result.ok).toBe(false);
    expect(result.blocked).toBe(true);
  });

  it('hermes cannot be the approver — approver field is null on creation', () => {
    const result = requestAgentApproval({ tenantId: 'test-org', action: 'GENERATE_DRAFT', riskClass: 'yellow', payload: {} });
    expect(result.ok).toBe(true);
    expect(result.approval.approver).toBeNull();
    expect(result.approval.requester).toBe('hermes');
  });

  it('blocks LEGAL_FINANCIAL_FILING', () => {
    const result = requestAgentApproval({ tenantId: 'test-org', action: 'LEGAL_FINANCIAL_FILING', riskClass: 'red', payload: {} });
    expect(result.ok).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

describe('cross-tenant protection', () => {
  it('refuses invalid tenant id in buildAgentContext', () => {
    expect(() => buildAgentContext({ tenantId: '../etc/passwd' })).toThrow();
  });

  it('refuses invalid tenant id in createAgentRun', () => {
    expect(() => createAgentRun({ tenantId: '../escape', agentSlug: 'hermes', task: 'x', riskClass: 'green' })).toThrow();
  });

  it('refuses invalid tenant id in recordAgentEvent', () => {
    expect(() => recordAgentEvent({ tenantId: '../escape', type: 'TEST' })).toThrow();
  });
});

describe('docs include required endpoints', () => {
  const docsPath = path.resolve(__dirname, '../../../docs/HERMES-AGENT-SERVICE-API.md');

  it('docs file exists', () => {
    expect(fs.existsSync(docsPath)).toBe(true);
  });

  it('docs include all required endpoints', () => {
    const content = fs.readFileSync(docsPath, 'utf8');
    expect(content).toContain('GET /api/agent/context/:tenantId');
    expect(content).toContain('GET /api/agent/policy/:tenantId');
    expect(content).toContain('POST /api/agent/runs');
    expect(content).toContain('POST /api/agent/events');
    expect(content).toContain('POST /api/agent/artifacts');
    expect(content).toContain('POST /api/agent/assets');
    expect(content).toContain('POST /api/agent/approvals/request');
    expect(content).toContain('POST /api/agent/runs/:id/complete');
    expect(content).toContain('GET /api/agent/runs/:id');
    expect(content).toContain('GET /api/agent/assets/:id');
  });

  it('docs do not claim live Hermes execution', () => {
    const content = fs.readFileSync(docsPath, 'utf8').toLowerCase();
    expect(content).not.toContain('hermes is live');
    expect(content).not.toContain('agent is running live');
    expect(content).not.toContain('live execution enabled');
  });
});
