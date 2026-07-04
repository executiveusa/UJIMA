#!/usr/bin/env node
/**
 * phase9-live-staging-readiness.mjs — Gate 6A local readiness checks
 *
 * LOCAL ONLY. No network calls. No SSH. No DNS lookups. No Docker commands.
 *
 * Checks:
 *   L1 — Required Gate 6A docs exist
 *   L2 — .env files not tracked by git
 *   L3 — No private SSH keys committed
 *   L4 — Caddyfile uses placeholder domains (if Caddyfile present)
 *   L5 — No private key PEM headers in tracked files
 *   L6 — No known plaintext API key patterns in tracked files
 *   L7 — Required scripts exist
 *   L8 — Required test suite files exist
 *   L9 — No TODO / FIXME stubs in Gate 6A docs
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

function gitLsFiles() {
  try {
    return execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const trackedFiles = gitLsFiles();

// ─── L1 — Required Gate 6A docs exist ────────────────────────────────────────

check('L1', 'Required Gate 6A docs exist', () => {
  const required = [
    'docs/LIVE-STAGING-PREPARATION-PACK.md',
    'docs/VPS-DOMAIN-INTAKE-FORM.md',
    'docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md',
    'docs/DEPLOYMENT-DAY-RUNBOOK.md',
    'docs/STAGING-ROLLBACK-RUNBOOK.md',
    'docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md',
    'docs/ENVIRONMENT-READINESS-VALIDATOR-SPEC.md',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length > 0) {
    return { pass: false, message: `Missing: ${missing.join(', ')}` };
  }
  return { pass: true };
});

// ─── L2 — Real .env files not tracked by git ──────────────────────────────────
// .env.example and *.env.example files are intentional placeholder templates — skip them.
// Only flag files that look like real env files with secrets.

check('L2', 'No real .env files tracked by git', () => {
  // Only flag files whose basename starts with '.env' (Unix dotfile convention)
  // Intentional templates (.env.example, *.env.example) are excluded
  // Named files like 'frontend.env' in handoff/ are reference docs with public-only vars — excluded
  const envFiles = trackedFiles.filter(f => {
    const base = path.basename(f);
    if (!base.startsWith('.env')) return false; // only dotfiles
    if (/\.example$/.test(base)) return false;  // .env.example templates are intentional
    return true;
  });
  if (envFiles.length > 0) {
    return { pass: false, message: `Tracked real .env dotfiles: ${envFiles.join(', ')}` };
  }
  return { pass: true };
});

// ─── L3 — No private SSH keys committed ──────────────────────────────────────

check('L3', 'No private SSH keys committed', () => {
  const keyPatterns = /id_rsa$|id_ed25519$|id_ecdsa$|id_dsa$|\.pem$|_rsa$|_ed25519$/;
  const keyFiles = trackedFiles.filter(f => keyPatterns.test(f));
  if (keyFiles.length > 0) {
    return { pass: false, message: `Possible private key files tracked: ${keyFiles.join(', ')}` };
  }
  return { pass: true };
});

// ─── L4 — Caddyfile uses placeholder domains ──────────────────────────────────

check('L4', 'Caddyfile uses placeholder domains (if present)', () => {
  const caddyPaths = [
    path.join(ROOT, 'caddy', 'Caddyfile'),
    path.join(ROOT, 'Caddyfile'),
  ];
  const found = caddyPaths.find(p => fs.existsSync(p));
  if (!found) {
    return { pass: true, message: 'No Caddyfile found — skipped' };
  }
  const content = fs.readFileSync(found, 'utf8');
  const hasPlaceholder = /STAGING_DOMAIN_PLACEHOLDER|STAGING_API_DOMAIN_PLACEHOLDER/.test(content);
  if (!hasPlaceholder) {
    return {
      pass: false,
      message: 'Caddyfile does not contain placeholder domain strings — confirm it was intentionally configured or restore placeholders',
    };
  }
  return { pass: true };
});

// ─── L5 — No private key PEM headers in tracked files ────────────────────────

check('L5', 'No private key PEM headers in tracked files', () => {
  const pemPattern = /BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY/;
  const offenders = [];
  for (const f of trackedFiles) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    try {
      const stat = fs.statSync(abs);
      if (!stat.isFile() || stat.size > 1_000_000) continue;
      const content = fs.readFileSync(abs, 'utf8');
      if (pemPattern.test(content)) offenders.push(f);
    } catch {
      // binary or unreadable — skip
    }
  }
  if (offenders.length > 0) {
    return { pass: false, message: `Private key content found in: ${offenders.join(', ')}` };
  }
  return { pass: true };
});

// ─── L6 — No known plaintext API key patterns in tracked files ───────────────

check('L6', 'No known plaintext API key patterns in tracked files', () => {
  // Match actual key patterns, not instructions or comments referencing them
  const patterns = [
    { name: 'OpenAI API key', re: /\bsk-[A-Za-z0-9]{32,}\b/ },
    { name: 'Anthropic API key', re: /\bsk-ant-[A-Za-z0-9-]{32,}\b/ },
    { name: 'GitHub PAT', re: /\bghp_[A-Za-z0-9]{36}\b/ },
    { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  ];
  const offenders = [];
  const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.gz'];
  for (const f of trackedFiles) {
    if (skipExtensions.some(ext => f.endsWith(ext))) continue;
    // Skip test files that reference key patterns in regex form
    if (f.includes('phase9-live-staging-readiness')) continue;
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    try {
      const stat = fs.statSync(abs);
      if (!stat.isFile() || stat.size > 500_000) continue;
      const content = fs.readFileSync(abs, 'utf8');
      for (const { name, re } of patterns) {
        if (re.test(content)) {
          offenders.push(`${f} (${name})`);
        }
      }
    } catch {
      // binary or unreadable — skip
    }
  }
  if (offenders.length > 0) {
    return { pass: false, message: `API key patterns found in: ${offenders.join(', ')}` };
  }
  return { pass: true };
});

// ─── L7 — Required scripts exist ─────────────────────────────────────────────

check('L7', 'Required scripts exist', () => {
  const required = [
    'scripts/phase9-live-staging-readiness.mjs',
    'scripts/verify-v06.mjs',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length > 0) {
    return { pass: false, message: `Missing scripts: ${missing.join(', ')}` };
  }
  return { pass: true };
});

// ─── L8 — Required test suite files exist ────────────────────────────────────

check('L8', 'Required test suite files exist', () => {
  const required = [
    'packages/core/tests/phase9-live-staging-preparation.test.js',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length > 0) {
    return { pass: false, message: `Missing test files: ${missing.join(', ')}` };
  }
  return { pass: true };
});

// ─── L9 — No TODO / FIXME stubs in Gate 6A docs ──────────────────────────────

check('L9', 'No TODO / FIXME stubs in Gate 6A docs', () => {
  const gate6aDocs = [
    'docs/LIVE-STAGING-PREPARATION-PACK.md',
    'docs/VPS-DOMAIN-INTAKE-FORM.md',
    'docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md',
    'docs/DEPLOYMENT-DAY-RUNBOOK.md',
    'docs/STAGING-ROLLBACK-RUNBOOK.md',
    'docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md',
    'docs/ENVIRONMENT-READINESS-VALIDATOR-SPEC.md',
  ];
  const offenders = [];
  for (const f of gate6aDocs) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    if (/\bTODO\b|\bFIXME\b/.test(content)) offenders.push(f);
  }
  if (offenders.length > 0) {
    return { pass: false, message: `TODO/FIXME stubs found in: ${offenders.join(', ')}` };
  }
  return { pass: true };
});

// ─── Output ───────────────────────────────────────────────────────────────────

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const errors = results.filter(r => r.status === 'ERROR').length;
const total = results.length;
const ready = failed === 0 && errors === 0;

const output = {
  phase: 'L',
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
  console.error(`\n${failed} check(s) failed. Resolve before proceeding to Gate 6B.`);
  process.exit(1);
} else {
  console.error(`\nAll ${total} local readiness checks passed.`);
  process.exit(0);
}
