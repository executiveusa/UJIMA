#!/usr/bin/env node
/**
 * phase9-final-local-readiness.mjs — Gate 6B0 local completion readiness checks
 *
 * LOCAL ONLY. No network calls. No SSH. No DNS lookups. No Docker commands.
 *
 * Checks:
 *   F1 — Gate 6B execution is blocked (GATE_6B_LIVE_APPROVED not set)
 *   F2 — Agent execution mode is not 'external'
 *   F3 — Core modules exist (action-dispatcher, integration-adapters, storage-factory)
 *   F4 — New ops pages exist (readiness, actions, backups)
 *   F5 — New API routes exist (readiness, actions, approvals, backups)
 *   F6 — New missionctl commands present (demo, final-local)
 *   F7 — Gate 6B0 docs exist
 *   F8 — Gate 6B0 test suite exists
 *   F9 — No TODO / FIXME stubs in Gate 6B0 docs
 *   F10 — Gate 6A local readiness checks (L1–L9) still pass
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — one or more checks failed
 *   2 — validator error (unrecoverable)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const results = [];

function check(id, name, fn) {
  try {
    const { pass, message } = fn();
    results.push({ id, name, status: pass ? 'PASS' : 'FAIL', message: message || null });
  } catch (err) {
    results.push({ id, name, status: 'ERROR', message: err.message });
  }
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ─── F1 — Gate 6B execution blocked ──────────────────────────────────────────

check('F1', 'Gate 6B execution blocked (GATE_6B_LIVE_APPROVED not set)', () => {
  const live = process.env.GATE_6B_LIVE_APPROVED;
  if (live === 'true') {
    return { pass: false, message: 'GATE_6B_LIVE_APPROVED=true is set. This env var must not be set until Architect approves Gate 6B.' };
  }
  return { pass: true };
});

// ─── F2 — Agent execution mode safe ──────────────────────────────────────────

check('F2', 'Agent execution mode is not external', () => {
  const mode = process.env.AGENT_EXECUTION_MODE || 'dry-run';
  if (mode === 'external') {
    return { pass: false, message: 'AGENT_EXECUTION_MODE=external is set. External live mode must not be active before Gate 6B.' };
  }
  return { pass: true, message: `AGENT_EXECUTION_MODE=${mode}` };
});

// ─── F3 — Core modules exist ──────────────────────────────────────────────────

check('F3', 'Core modules exist (action-dispatcher, integration-adapters, storage-factory)', () => {
  const required = [
    'packages/core/src/action-dispatcher.js',
    'packages/core/src/integration-adapters.js',
    'packages/core/src/storage-factory.js',
  ];
  const missing = required.filter(f => !exists(f));
  if (missing.length > 0) return { pass: false, message: `Missing: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F4 — New ops pages exist ─────────────────────────────────────────────────

check('F4', 'New ops pages exist (readiness, actions, backups)', () => {
  const required = [
    'apps/site/app/ops/readiness/page.jsx',
    'apps/site/app/ops/actions/page.jsx',
    'apps/site/app/ops/backups/page.jsx',
  ];
  const missing = required.filter(f => !exists(f));
  if (missing.length > 0) return { pass: false, message: `Missing: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F5 — New API routes exist ───────────────────────────────────────────────

check('F5', 'New API routes exist (readiness, actions, approvals, backups)', () => {
  const required = [
    'apps/site/app/api/ops/readiness/route.js',
    'apps/site/app/api/ops/actions/route.js',
    'apps/site/app/api/ops/approvals/route.js',
    'apps/site/app/api/ops/backups/route.js',
  ];
  const missing = required.filter(f => !exists(f));
  if (missing.length > 0) return { pass: false, message: `Missing: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F6 — missionctl commands present ────────────────────────────────────────

check('F6', 'missionctl demo and final-local commands present', () => {
  const mjs = fs.readFileSync(path.join(ROOT, 'missionctl', 'missionctl.mjs'), 'utf8');
  const checks = [
    ['demoSeedCommand', mjs.includes('demoSeedCommand')],
    ['finalLocalVerifyCommand', mjs.includes('finalLocalVerifyCommand')],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([n]) => n);
  if (missing.length > 0) return { pass: false, message: `Missing functions: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F7 — Gate 6B0 docs exist ────────────────────────────────────────────────

check('F7', 'Gate 6B0 docs exist', () => {
  const required = [
    'docs/FINAL-LOCAL-APP-COMPLETION-PACK.md',
    'docs/FINAL-LOCAL-OPERATOR-RUNBOOK.md',
    'docs/VPS-ONLY-REMAINING-STEPS.md',
    'docs/GATE-6B-HUMAN-INTAKE-PACKET.md',
  ];
  const missing = required.filter(f => !exists(f));
  if (missing.length > 0) return { pass: false, message: `Missing: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F8 — Gate 6B0 test suite exists ─────────────────────────────────────────

check('F8', 'Gate 6B0 test suite exists', () => {
  const required = ['packages/core/tests/phase9-final-local-app-completion.test.js'];
  const missing = required.filter(f => !exists(f));
  if (missing.length > 0) return { pass: false, message: `Missing: ${missing.join(', ')}` };
  return { pass: true };
});

// ─── F9 — No TODO / FIXME in Gate 6B0 docs ───────────────────────────────────

check('F9', 'No TODO / FIXME stubs in Gate 6B0 docs', () => {
  const gate6b0Docs = [
    'docs/FINAL-LOCAL-APP-COMPLETION-PACK.md',
    'docs/FINAL-LOCAL-OPERATOR-RUNBOOK.md',
    'docs/VPS-ONLY-REMAINING-STEPS.md',
    'docs/GATE-6B-HUMAN-INTAKE-PACKET.md',
  ];
  const offenders = [];
  for (const f of gate6b0Docs) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    if (/\bTODO\b|\bFIXME\b/.test(content)) offenders.push(f);
  }
  if (offenders.length > 0) return { pass: false, message: `TODO/FIXME found in: ${offenders.join(', ')}` };
  return { pass: true };
});

// ─── F10 — Gate 6A checks still pass (re-run L-script) ───────────────────────

check('F10', 'Gate 6A readiness script exits 0', () => {
  try {
    execSync(`node ${path.join(ROOT, 'scripts', 'phase9-live-staging-readiness.mjs')}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { pass: true };
  } catch (err) {
    const out = err.stdout || '';
    let failCount = '?';
    try { failCount = JSON.parse(out).summary.failed; } catch {}
    return { pass: false, message: `Gate 6A readiness script failed (${failCount} check(s) failing)` };
  }
});

// ─── Output ───────────────────────────────────────────────────────────────────

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const errors = results.filter(r => r.status === 'ERROR').length;
const total = results.length;
const ready = failed === 0 && errors === 0;

const output = {
  phase: 'F',
  timestamp: new Date().toISOString(),
  checks: results.map(r => ({
    id: r.id,
    name: r.name,
    status: r.status,
    ...(r.message ? { message: r.message } : {}),
  })),
  summary: { total, passed, failed, errors },
  ready,
};

console.log(JSON.stringify(output, null, 2));

if (!ready) {
  console.error(`\n${failed} check(s) failed. Resolve before completing Gate 6B0.`);
  process.exit(1);
} else {
  console.error(`\nAll ${total} Gate 6B0 local readiness checks passed.`);
  process.exit(0);
}
