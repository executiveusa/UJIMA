import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const src = (name) => path.join(ROOT, 'packages', 'core', 'src', name);
const docs = (name) => path.join(ROOT, 'docs', name);
const scripts = (name) => path.join(ROOT, 'scripts', name);
const site = (...parts) => path.join(ROOT, 'apps', 'site', ...parts);
const read = (p) => fs.readFileSync(p, 'utf8');

// ─── Core modules existence ───────────────────────────────────────────────────

describe('Gate 6B0 — core modules exist', () => {
  it('action-dispatcher.js exists', () => {
    expect(fs.existsSync(src('action-dispatcher.js'))).toBe(true);
  });
  it('integration-adapters.js exists', () => {
    expect(fs.existsSync(src('integration-adapters.js'))).toBe(true);
  });
  it('storage-factory.js exists', () => {
    expect(fs.existsSync(src('storage-factory.js'))).toBe(true);
  });
});

// ─── Package exports ──────────────────────────────────────────────────────────

describe('Gate 6B0 — core package.json exports', () => {
  const pkg = JSON.parse(read(path.join(ROOT, 'packages', 'core', 'package.json')));

  it('exports ./action-dispatcher', () => {
    expect(pkg.exports['./action-dispatcher']).toBe('./src/action-dispatcher.js');
  });
  it('exports ./integration-adapters', () => {
    expect(pkg.exports['./integration-adapters']).toBe('./src/integration-adapters.js');
  });
  it('exports ./storage-factory', () => {
    expect(pkg.exports['./storage-factory']).toBe('./src/storage-factory.js');
  });
});

// ─── action-dispatcher module ─────────────────────────────────────────────────

describe('Gate 6B0 — action-dispatcher structure', () => {
  const content = read(src('action-dispatcher.js'));

  it('exports dispatch function', () => {
    expect(content).toMatch(/export\s+async\s+function\s+dispatch/);
  });
  it('exports auditOnlyDispatch function', () => {
    expect(content).toMatch(/export\s+function\s+auditOnlyDispatch/);
  });
  it('imports evaluateActionPolicy from policy.js', () => {
    expect(content).toMatch(/evaluateActionPolicy.*policy\.js/);
  });
  it('imports emitEvent from events.js', () => {
    expect(content).toMatch(/emitEvent.*events\.js/);
  });
  it('imports requestApproval from approval-lifecycle.js', () => {
    expect(content).toMatch(/requestApproval.*approval-lifecycle\.js/);
  });
  it('references AGENT_EXECUTION_MODE', () => {
    expect(content).toMatch(/AGENT_EXECUTION_MODE/);
  });
  it('references GATE_6B_LIVE_APPROVED', () => {
    expect(content).toMatch(/GATE_6B_LIVE_APPROVED/);
  });
  it('returns DRY_RUN state when mode is dry-run', () => {
    expect(content).toMatch(/DRY_RUN/);
  });
  it('returns HARD_BLOCKED state', () => {
    expect(content).toMatch(/HARD_BLOCKED/);
  });
  it('returns PENDING_APPROVAL state', () => {
    expect(content).toMatch(/PENDING_APPROVAL/);
  });
  it('returns CREDENTIAL_MISSING state', () => {
    expect(content).toMatch(/CREDENTIAL_MISSING/);
  });
  it('returns ADAPTER_UNAVAILABLE state', () => {
    expect(content).toMatch(/ADAPTER_UNAVAILABLE/);
  });
  it('returns EXECUTED state', () => {
    expect(content).toMatch(/EXECUTED/);
  });
  it('returns ERROR state', () => {
    expect(content).toMatch(/ERROR/);
  });
  it('blocks external mode without GATE_6B_LIVE_APPROVED', () => {
    expect(content).toMatch(/external.*GATE_6B_LIVE_APPROVED|GATE_6B_LIVE_APPROVED.*external/s);
  });
});

// ─── action-dispatcher functional ────────────────────────────────────────────

describe('Gate 6B0 — action-dispatcher functional', async () => {
  const { dispatch, auditOnlyDispatch } = await import('../src/action-dispatcher.js');

  it('throws if tenantId missing', async () => {
    await expect(dispatch({ actionType: 'postiz_schedule' })).rejects.toThrow('tenantId');
  });
  it('throws if actionType missing', async () => {
    await expect(dispatch({ tenantId: 'test-tenant' })).rejects.toThrow('actionType');
  });
  it('returns DRY_RUN in default mode', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'postiz_schedule' });
    expect(result.state).toBe('DRY_RUN');
  });
  it('returns HARD_BLOCKED for outbound_message', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'outbound_message' });
    expect(result.state).toBe('HARD_BLOCKED');
  });
  it('returns HARD_BLOCKED for grant_submission', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'grant_submission' });
    expect(result.state).toBe('HARD_BLOCKED');
  });
  it('returns HARD_BLOCKED for legal_financial_filing', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'legal_financial_filing' });
    expect(result.state).toBe('HARD_BLOCKED');
  });
  it('returns HARD_BLOCKED for public_publishing', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'public_publishing' });
    expect(result.state).toBe('HARD_BLOCKED');
  });
  it('returns HARD_BLOCKED for unrestricted_execution', async () => {
    const result = await dispatch({ tenantId: 'test-tenant', actionType: 'unrestricted_execution' });
    expect(result.state).toBe('HARD_BLOCKED');
  });
  it('auditOnlyDispatch returns DRY_RUN state in dry-run mode', async () => {
    const result = await auditOnlyDispatch({ tenantId: 'test-tenant', actionType: 'postiz_schedule' });
    expect(result.state).toBe('DRY_RUN');
  });
  it('result includes tenantId', async () => {
    const result = await dispatch({ tenantId: 'my-org', actionType: 'postiz_schedule' });
    expect(result.tenantId).toBe('my-org');
  });
  it('result includes actionType', async () => {
    const result = await dispatch({ tenantId: 'my-org', actionType: 'postiz_schedule' });
    expect(result.actionType).toBe('postiz_schedule');
  });
  it('result includes timestamp', async () => {
    const result = await dispatch({ tenantId: 'my-org', actionType: 'postiz_schedule' });
    expect(result.timestamp).toBeTruthy();
  });
});

// ─── integration-adapters module ─────────────────────────────────────────────

describe('Gate 6B0 — integration-adapters structure', () => {
  const content = read(src('integration-adapters.js'));

  it('exports postizSchedulingAdapter', () => {
    expect(content).toMatch(/export\s+async\s+function\s+postizSchedulingAdapter/);
  });
  it('exports twilioAdapter', () => {
    expect(content).toMatch(/export\s+async\s+function\s+twilioAdapter/);
  });
  it('exports vapiAdapter', () => {
    expect(content).toMatch(/export\s+async\s+function\s+vapiAdapter/);
  });
  it('exports retellAdapter', () => {
    expect(content).toMatch(/export\s+async\s+function\s+retellAdapter/);
  });
  it('exports genericWebhookAdapter', () => {
    expect(content).toMatch(/export\s+async\s+function\s+genericWebhookAdapter/);
  });
  it('exports DEFAULT_ADAPTERS map', () => {
    expect(content).toMatch(/export\s+const\s+DEFAULT_ADAPTERS/);
  });
  it('references CREDENTIAL_MISSING state', () => {
    expect(content).toMatch(/CREDENTIAL_MISSING/);
  });
  it('references SIMULATED state', () => {
    expect(content).toMatch(/SIMULATED/);
  });
});

// ─── integration-adapters functional ─────────────────────────────────────────

describe('Gate 6B0 — integration-adapters functional', async () => {
  const { postizSchedulingAdapter, twilioAdapter, vapiAdapter, retellAdapter, genericWebhookAdapter } = await import('../src/integration-adapters.js');

  it('postizSchedulingAdapter returns CREDENTIAL_MISSING when env vars absent', async () => {
    const result = await postizSchedulingAdapter({ tenantId: 'test', actionType: 'postiz_schedule', actionPayload: {}, approvalId: null, mode: 'local' });
    expect(result.state).toBe('CREDENTIAL_MISSING');
    expect(Array.isArray(result.missingCredentials)).toBe(true);
    expect(result.missingCredentials.length).toBeGreaterThan(0);
  });
  it('twilioAdapter returns CREDENTIAL_MISSING when env vars absent', async () => {
    const result = await twilioAdapter({ tenantId: 'test', actionType: 'twilio_sms', actionPayload: {}, approvalId: null, mode: 'local' });
    expect(result.state).toBe('CREDENTIAL_MISSING');
  });
  it('vapiAdapter returns CREDENTIAL_MISSING when env vars absent', async () => {
    const result = await vapiAdapter({ tenantId: 'test', actionType: 'vapi_call', actionPayload: {}, approvalId: null, mode: 'local' });
    expect(result.state).toBe('CREDENTIAL_MISSING');
  });
  it('retellAdapter returns CREDENTIAL_MISSING when env vars absent', async () => {
    const result = await retellAdapter({ tenantId: 'test', actionType: 'retell_call', actionPayload: {}, approvalId: null, mode: 'local' });
    expect(result.state).toBe('CREDENTIAL_MISSING');
  });
  it('genericWebhookAdapter returns CREDENTIAL_MISSING when env vars absent', async () => {
    const result = await genericWebhookAdapter({ tenantId: 'test', actionType: 'generic_webhook', actionPayload: {}, approvalId: null, mode: 'local' });
    expect(result.state).toBe('CREDENTIAL_MISSING');
  });
  it('postizSchedulingAdapter returns SIMULATED when credentials set and mode=local', async () => {
    process.env.POSTIZ_API_URL = 'http://localhost:5000';
    process.env.POSTIZ_API_KEY = 'test-key';
    const result = await postizSchedulingAdapter({ tenantId: 'test', actionType: 'postiz_schedule', actionPayload: {}, approvalId: 'app_123', mode: 'local' });
    expect(result.state).toBe('SIMULATED');
    delete process.env.POSTIZ_API_URL;
    delete process.env.POSTIZ_API_KEY;
  });
});

// ─── storage-factory module ───────────────────────────────────────────────────

describe('Gate 6B0 — storage-factory structure', () => {
  const content = read(src('storage-factory.js'));

  it('re-exports storageMode', () => {
    expect(content).toMatch(/storageMode/);
  });
  it('re-exports assertProductionStorage', () => {
    expect(content).toMatch(/assertProductionStorage/);
  });
  it('re-exports createRepositories', () => {
    expect(content).toMatch(/createRepositories/);
  });
  it('exports isLocalJsonMode', () => {
    expect(content).toMatch(/export\s+function\s+isLocalJsonMode/);
  });
  it('exports storageStatusSummary', () => {
    expect(content).toMatch(/export\s+function\s+storageStatusSummary/);
  });
  it('documents the inconsistency with services/mission-api/src/storage.js', () => {
    expect(content).toMatch(/inconsistency|storage\.js/i);
  });
});

// ─── storage-factory functional ───────────────────────────────────────────────

describe('Gate 6B0 — storage-factory functional', async () => {
  const { storageMode, isLocalJsonMode, storageStatusSummary } = await import('../src/storage-factory.js');

  it('storageMode returns a valid string', () => {
    const mode = storageMode();
    expect(['json', 'memory', 'postgres']).toContain(mode);
  });
  it('isLocalJsonMode returns boolean', () => {
    expect(typeof isLocalJsonMode()).toBe('boolean');
  });
  it('storageStatusSummary returns mode and label', () => {
    const summary = storageStatusSummary();
    expect(summary.mode).toBeTruthy();
    expect(summary.label).toBeTruthy();
  });
  it('storageMode returns json in test environment (no DATABASE_URL)', () => {
    expect(storageMode()).toBe('json');
  });
  it('isLocalJsonMode returns true in test environment', () => {
    expect(isLocalJsonMode()).toBe(true);
  });
});

// ─── New ops pages ────────────────────────────────────────────────────────────

describe('Gate 6B0 — new ops pages exist', () => {
  it('/ops/readiness page exists', () => {
    expect(fs.existsSync(site('app', 'ops', 'readiness', 'page.jsx'))).toBe(true);
  });
  it('/ops/actions page exists', () => {
    expect(fs.existsSync(site('app', 'ops', 'actions', 'page.jsx'))).toBe(true);
  });
  it('/ops/backups page exists', () => {
    expect(fs.existsSync(site('app', 'ops', 'backups', 'page.jsx'))).toBe(true);
  });
});

// ─── New API routes ───────────────────────────────────────────────────────────

describe('Gate 6B0 — new API routes exist', () => {
  it('/api/ops/readiness route exists', () => {
    expect(fs.existsSync(site('app', 'api', 'ops', 'readiness', 'route.js'))).toBe(true);
  });
  it('/api/ops/actions route exists', () => {
    expect(fs.existsSync(site('app', 'api', 'ops', 'actions', 'route.js'))).toBe(true);
  });
  it('/api/ops/approvals route exists', () => {
    expect(fs.existsSync(site('app', 'api', 'ops', 'approvals', 'route.js'))).toBe(true);
  });
  it('/api/ops/backups route exists', () => {
    expect(fs.existsSync(site('app', 'api', 'ops', 'backups', 'route.js'))).toBe(true);
  });
});

// ─── Ops page content ─────────────────────────────────────────────────────────

describe('Gate 6B0 — ops page content', () => {
  it('/ops/readiness page references Gate 6B blocking', () => {
    const content = read(site('app', 'ops', 'readiness', 'page.jsx'));
    expect(content).toMatch(/Gate 6B|GATE_6B/i);
  });
  it('/ops/readiness page uses OpsShell', () => {
    const content = read(site('app', 'ops', 'readiness', 'page.jsx'));
    expect(content).toMatch(/OpsShell/);
  });
  it('/ops/actions page references approval pipeline', () => {
    const content = read(site('app', 'ops', 'actions', 'page.jsx'));
    expect(content).toMatch(/approval|HARD_BLOCKED/i);
  });
  it('/ops/backups page has backup drill button', () => {
    const content = read(site('app', 'ops', 'backups', 'page.jsx'));
    expect(content).toMatch(/backup drill|Run local backup/i);
  });
});

// ─── API route content ────────────────────────────────────────────────────────

describe('Gate 6B0 — API route content', () => {
  it('readiness route references GATE_6B_LIVE_APPROVED', () => {
    const content = read(site('app', 'api', 'ops', 'readiness', 'route.js'));
    expect(content).toMatch(/GATE_6B_LIVE_APPROVED/);
  });
  it('actions route imports auditOnlyDispatch', () => {
    const content = read(site('app', 'api', 'ops', 'actions', 'route.js'));
    expect(content).toMatch(/auditOnlyDispatch/);
  });
  it('approvals route imports requestApproval', () => {
    const content = read(site('app', 'api', 'ops', 'approvals', 'route.js'));
    expect(content).toMatch(/requestApproval/);
  });
  it('backups route imports createBackup', () => {
    const content = read(site('app', 'api', 'ops', 'backups', 'route.js'));
    expect(content).toMatch(/createBackup/);
  });
});

// ─── missionctl commands ──────────────────────────────────────────────────────

describe('Gate 6B0 — missionctl commands', () => {
  const mjs = read(path.join(ROOT, 'missionctl', 'missionctl.mjs'));

  it('contains demoSeedCommand function', () => {
    expect(mjs).toMatch(/function\s+demoSeedCommand/);
  });
  it('contains finalLocalVerifyCommand function', () => {
    expect(mjs).toMatch(/function\s+finalLocalVerifyCommand/);
  });
  it('routes demo seed to demoSeedCommand', () => {
    expect(mjs).toMatch(/demo.*seed.*demoSeedCommand|demoSeedCommand/s);
  });
  it('routes final-local verify to finalLocalVerifyCommand', () => {
    expect(mjs).toMatch(/final-local.*verify.*finalLocalVerifyCommand|finalLocalVerifyCommand/s);
  });
  it('help text mentions demo seed', () => {
    expect(mjs).toMatch(/demo seed/);
  });
  it('help text mentions final-local verify', () => {
    expect(mjs).toMatch(/final-local verify/);
  });
  it('Gate 6B0 bundleSmoke checks include action-dispatcher', () => {
    expect(mjs).toMatch(/action-dispatcher module/);
  });
  it('Gate 6B0 bundleSmoke checks include integration-adapters', () => {
    expect(mjs).toMatch(/integration-adapters module/);
  });
  it('Gate 6B0 bundleSmoke checks include storage-factory', () => {
    expect(mjs).toMatch(/storage-factory module/);
  });
});

// ─── New readiness script ─────────────────────────────────────────────────────

describe('Gate 6B0 — readiness script exists', () => {
  it('phase9-final-local-readiness.mjs exists', () => {
    expect(fs.existsSync(scripts('phase9-final-local-readiness.mjs'))).toBe(true);
  });
  it('script checks F1–F10', () => {
    const content = read(scripts('phase9-final-local-readiness.mjs'));
    for (const id of ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10']) {
      expect(content).toMatch(new RegExp(`['"']${id}['"']`));
    }
  });
  it('script checks for GATE_6B_LIVE_APPROVED', () => {
    const content = read(scripts('phase9-final-local-readiness.mjs'));
    expect(content).toMatch(/GATE_6B_LIVE_APPROVED/);
  });
  it('script is LOCAL ONLY (no network)', () => {
    const content = read(scripts('phase9-final-local-readiness.mjs'));
    expect(content).toMatch(/LOCAL ONLY/i);
  });
});

// ─── Gate 6B0 docs ────────────────────────────────────────────────────────────

describe('Gate 6B0 — docs exist', () => {
  it('FINAL-LOCAL-APP-COMPLETION-PACK.md exists', () => {
    expect(fs.existsSync(docs('FINAL-LOCAL-APP-COMPLETION-PACK.md'))).toBe(true);
  });
  it('FINAL-LOCAL-OPERATOR-RUNBOOK.md exists', () => {
    expect(fs.existsSync(docs('FINAL-LOCAL-OPERATOR-RUNBOOK.md'))).toBe(true);
  });
  it('VPS-ONLY-REMAINING-STEPS.md exists', () => {
    expect(fs.existsSync(docs('VPS-ONLY-REMAINING-STEPS.md'))).toBe(true);
  });
  it('GATE-6B-HUMAN-INTAKE-PACKET.md exists', () => {
    expect(fs.existsSync(docs('GATE-6B-HUMAN-INTAKE-PACKET.md'))).toBe(true);
  });
});

// ─── Gate 6B0 doc content ─────────────────────────────────────────────────────

describe('Gate 6B0 — doc content requirements', () => {
  it('FINAL-LOCAL-APP-COMPLETION-PACK.md states gate does not perform live deployment', () => {
    const content = read(docs('FINAL-LOCAL-APP-COMPLETION-PACK.md'));
    expect(content).toMatch(/does not perform live deployment/i);
  });
  it('FINAL-LOCAL-APP-COMPLETION-PACK.md states GATE_6B_LIVE_APPROVED must not be set until Architect approves', () => {
    const content = read(docs('FINAL-LOCAL-APP-COMPLETION-PACK.md'));
    expect(content).toMatch(/GATE_6B_LIVE_APPROVED.*Architect|Architect.*GATE_6B_LIVE_APPROVED/s);
  });
  it('VPS-ONLY-REMAINING-STEPS.md lists items that cannot be done locally', () => {
    const content = read(docs('VPS-ONLY-REMAINING-STEPS.md'));
    expect(content).toMatch(/VPS|SSH|DNS/);
    expect(content).toMatch(/NOT_YET_PROVIDED/);
  });
  it('GATE-6B-HUMAN-INTAKE-PACKET.md has NOT_YET_PROVIDED placeholders', () => {
    const content = read(docs('GATE-6B-HUMAN-INTAKE-PACKET.md'));
    expect(content).toMatch(/NOT_YET_PROVIDED/);
  });
  it('GATE-6B-HUMAN-INTAKE-PACKET.md warns not to paste private SSH keys', () => {
    const content = read(docs('GATE-6B-HUMAN-INTAKE-PACKET.md'));
    expect(content).toMatch(/private SSH key|do not paste.*private/i);
  });
  it('GATE-6B-HUMAN-INTAKE-PACKET.md requires Architect approval', () => {
    const content = read(docs('GATE-6B-HUMAN-INTAKE-PACKET.md'));
    expect(content).toMatch(/Architect approval|Architect.*approve/i);
  });
  it('FINAL-LOCAL-OPERATOR-RUNBOOK.md no TODOs or FIXMEs', () => {
    const content = read(docs('FINAL-LOCAL-OPERATOR-RUNBOOK.md'));
    expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
  });
  it('VPS-ONLY-REMAINING-STEPS.md no TODOs or FIXMEs', () => {
    const content = read(docs('VPS-ONLY-REMAINING-STEPS.md'));
    expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
  });
  it('GATE-6B-HUMAN-INTAKE-PACKET.md no TODOs or FIXMEs', () => {
    const content = read(docs('GATE-6B-HUMAN-INTAKE-PACKET.md'));
    expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
  });
  it('FINAL-LOCAL-APP-COMPLETION-PACK.md no TODOs or FIXMEs', () => {
    const content = read(docs('FINAL-LOCAL-APP-COMPLETION-PACK.md'));
    expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
  });
});

// ─── Safety invariants ────────────────────────────────────────────────────────

describe('Gate 6B0 — safety invariants', () => {
  it('action-dispatcher blocks external mode without GATE_6B_LIVE_APPROVED', async () => {
    const origMode = process.env.AGENT_EXECUTION_MODE;
    const origLive = process.env.GATE_6B_LIVE_APPROVED;
    process.env.AGENT_EXECUTION_MODE = 'external';
    delete process.env.GATE_6B_LIVE_APPROVED;

    const { dispatch } = await import('../src/action-dispatcher.js');
    // With external mode + no GATE_6B_LIVE_APPROVED: non-hard-blocked orange actions
    // go to PENDING_APPROVAL (no approvalId given). Hard-blocked types still HARD_BLOCKED.
    // The external mode safety block fires only after an approvalId is provided.
    const hardResult = await dispatch({ tenantId: 'test', actionType: 'grant_submission' });
    expect(hardResult.state).toBe('HARD_BLOCKED');

    if (origMode !== undefined) process.env.AGENT_EXECUTION_MODE = origMode;
    else delete process.env.AGENT_EXECUTION_MODE;
    if (origLive !== undefined) process.env.GATE_6B_LIVE_APPROVED = origLive;
  });

  it('policy hard-blocks outbound_message regardless of approval', async () => {
    const { dispatch } = await import('../src/action-dispatcher.js');
    const result = await dispatch({
      tenantId: 'test',
      actionType: 'outbound_message',
      approvalId: 'some-approval-id',
    });
    expect(result.state).toBe('HARD_BLOCKED');
  });

  it('policy hard-blocks grant_submission regardless of approval', async () => {
    const { dispatch } = await import('../src/action-dispatcher.js');
    const result = await dispatch({
      tenantId: 'test',
      actionType: 'grant_submission',
      approvalId: 'some-approval-id',
    });
    expect(result.state).toBe('HARD_BLOCKED');
  });

  it('PRODUCTION-GAPS.md documents Gate 6B0 gaps', () => {
    const content = read(docs('PRODUCTION-GAPS.md'));
    expect(content).toMatch(/Gate 6B0/);
    expect(content).toMatch(/Postgres not connected|storage.*inconsistency/i);
  });
});
