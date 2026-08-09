#!/usr/bin/env node
/**
 * A2A Worker Bridge — Agenix Studio Local Worker
 * Bead: A3OS-6.13
 *
 * Polls GitHub issue #36 for [A2A COMMAND] comments from the ChatGPT governor.
 * Posts [A2A ACK] immediately on receipt, executes the bounded command,
 * posts [A2A RESULT] when done.
 *
 * Rules:
 *  - Never publish, merge to main, spend paid credits, expose secrets,
 *    or cross a human approval gate without explicit approval.
 *  - Beads (bd CLI) remains canonical work state.
 *  - Poll no faster than every 60 seconds.
 *  - Persist last-consumed comment ID to avoid replaying old commands on restart.
 *  - No secrets in logs or GitHub comments.
 *
 * Usage:
 *   node scripts/a2a-worker-bridge.mjs [--once] [--dry-run]
 *
 *   --once      Process any pending commands and exit (no loop).
 *   --dry-run   Print what would be done without posting or executing.
 *
 * Requires:
 *   gh CLI authenticated (gh auth status)
 *   bd CLI in PATH
 *   GITHUB_REPO env var or defaults to executiveusa/ascend-social-purpose-agentic-systems-
 *   ISSUE_NUMBER env var or defaults to 36
 */

import { execSync, exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// ── Configuration ──────────────────────────────────────────────────────────
const REPO         = process.env.GITHUB_REPO   ?? 'executiveusa/ascend-social-purpose-agentic-systems-';
const ISSUE        = process.env.ISSUE_NUMBER  ?? '36';
const POLL_MS      = parseInt(process.env.A2A_POLL_MS ?? '60000', 10);
const STATE_FILE   = resolve(REPO_ROOT, '.a2a-state.json');
const AGENT_ID     = 'gemini-local-worker-agenix-studio';
const COMMAND_TAG  = '[A2A COMMAND]';
const ACK_TAG      = '[A2A ACK]';
const RESULT_TAG   = '[A2A RESULT]';
const ONCE         = process.argv.includes('--once');
const DRY_RUN      = process.argv.includes('--dry-run');

// ── State persistence ───────────────────────────────────────────────────────
function loadState() {
  if (!existsSync(STATE_FILE)) return { lastConsumedCommentId: null };
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return { lastConsumedCommentId: null }; }
}

function saveState(state) {
  if (DRY_RUN) return;
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── Shell helpers ───────────────────────────────────────────────────────────
function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', ...opts }).trim();
}

function shAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: REPO_ROOT, encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout.trim());
    });
  });
}

function log(msg) {
  // Never log secrets; keep output operational
  const safe = msg.replace(/ghp_[A-Za-z0-9]+/g, '[TOKEN_REDACTED]')
                   .replace(/GITHUB_TOKEN=[^\s]*/g, 'GITHUB_TOKEN=[REDACTED]');
  console.log(`[${new Date().toISOString()}] ${safe}`);
}

// ── GitHub helpers ──────────────────────────────────────────────────────────
function fetchComments() {
  const raw = sh(`gh issue view ${ISSUE} --repo ${REPO} --json comments --jq ".comments"`);
  return JSON.parse(raw);
}

function postComment(body) {
  if (DRY_RUN) { log(`[DRY-RUN] Would post:\n${body}`); return; }
  // Escape body for shell — write to temp file to avoid quoting nightmares
  const tmpFile = resolve(REPO_ROOT, '.a2a-comment-tmp.md');
  writeFileSync(tmpFile, body);
  try {
    sh(`gh issue comment ${ISSUE} --repo ${REPO} -F "${tmpFile}"`);
  } finally {
    try { sh(`del /f "${tmpFile}" 2>nul || rm -f "${tmpFile}"`); } catch {}
  }
}

// ── Guard: approval-required patterns ──────────────────────────────────────
const HARD_STOP_PATTERNS = [
  /publish|schedule|post to social|go live/i,
  /merge.*main|push.*main/i,
  /opus.*clip|paid.*api|spend.*credit/i,
  /rm\s+-rf|drop\s+table|truncate|delete.*data/i,
  /A3OS-6\.10/i,  // human publish gate
];

function requiresHumanApproval(commandBody) {
  return HARD_STOP_PATTERNS.some(p => p.test(commandBody));
}

// ── Command dispatcher ──────────────────────────────────────────────────────
async function dispatchCommand(comment) {
  const body = comment.body;
  const cmdId = comment.databaseId ?? comment.id ?? 'unknown';

  log(`Dispatching command ID=${cmdId}`);

  if (requiresHumanApproval(body)) {
    return {
      status: 'BLOCKED_APPROVAL_REQUIRED',
      note: 'Command contains approval-required action. Halted. Human review needed.',
    };
  }

  // ── Extract bounded instruction block (everything after [A2A COMMAND] line)
  const lines = body.split('\n');
  const cmdStart = lines.findIndex(l => l.includes(COMMAND_TAG));
  const instruction = lines.slice(cmdStart + 1).join('\n').trim();

  // ── Simple command routing by keyword ──────────────────────────────────
  const results = [];

  // bd show
  const bdShowMatch = instruction.match(/bd show\s+(A3OS-[\d.]+)/i);
  if (bdShowMatch) {
    const out = sh(`bd show ${bdShowMatch[1]}`);
    results.push({ command: `bd show ${bdShowMatch[1]}`, output: out });
  }

  // bd ready
  if (/bd ready/i.test(instruction)) {
    const out = sh('bd ready');
    results.push({ command: 'bd ready', output: out });
  }

  // bd close with reason
  const bdCloseMatch = instruction.match(/bd close\s+(A3OS-[\d.]+)\s+--reason\s+"([^"]+)"/i);
  if (bdCloseMatch) {
    if (!DRY_RUN) sh(`bd close ${bdCloseMatch[1]} --reason "${bdCloseMatch[2]}"`);
    results.push({ command: `bd close ${bdCloseMatch[1]}`, output: 'CLOSED' });
  }

  // git status
  if (/git status/i.test(instruction)) {
    const out = sh('git status --short');
    results.push({ command: 'git status', output: out });
  }

  // Fallback: unrecognized — report as needs-human-routing
  if (results.length === 0) {
    return {
      status: 'NEEDS_ROUTING',
      note: 'Command not matched to a built-in handler. Governor should decompose into specific bounded actions or Jeremy should clarify.',
      instruction: instruction.slice(0, 500),
    };
  }

  return { status: 'OK', results };
}

// ── Main poll loop ──────────────────────────────────────────────────────────
async function pollOnce() {
  const state = loadState();
  const comments = fetchComments();

  // Find unhandled [A2A COMMAND] comments
  const commands = comments.filter(c =>
    c.body.includes(COMMAND_TAG) &&
    !c.body.includes(ACK_TAG) &&
    (state.lastConsumedCommentId === null ||
     String(c.databaseId) > String(state.lastConsumedCommentId))
  );

  if (commands.length === 0) {
    log('No new [A2A COMMAND] comments found.');
    return;
  }

  for (const cmd of commands) {
    const cmdId = cmd.databaseId ?? 'unknown';
    const activeBead = (() => { try { return sh('bd ready --json | head -c 200'); } catch { return 'unknown'; } })();

    // Post ACK immediately
    const ack = `${ACK_TAG}
command-comment-id: ${cmdId}
bead: A3OS-6.13
agent: ${AGENT_ID}
branch: feat/asc3nd-reel-proof-beads
watcher: running (PID ${process.pid})
active-asc3nd-bead: A3OS-6.6 (precision-edit, IN_PROGRESS)
direct-a2a-endpoint: no
last-consumed-before-this: ${state.lastConsumedCommentId ?? 'none'}`;

    log(`Posting ACK for command ${cmdId}`);
    postComment(ack);

    // Execute
    let result;
    try {
      result = await dispatchCommand(cmd);
    } catch (err) {
      result = { status: 'ERROR', error: err.message };
    }

    // Post RESULT
    const resultBody = `${RESULT_TAG}
command-comment-id: ${cmdId}
bead: A3OS-6.13
agent: ${AGENT_ID}
status: ${result.status}
${result.results ? 'output:\n' + result.results.map(r => `  [${r.command}]\n${r.output}`).join('\n') : ''}
${result.note ? 'note: ' + result.note : ''}
${result.error ? 'error: ' + result.error : ''}
cost: $0
next: awaiting next [A2A COMMAND]`;

    log(`Posting RESULT for command ${cmdId}`);
    postComment(resultBody);

    // Update state
    state.lastConsumedCommentId = String(cmdId);
    saveState(state);
  }
}

async function main() {
  log(`A2A Worker Bridge starting — repo=${REPO} issue=#${ISSUE} poll=${POLL_MS}ms once=${ONCE} dry-run=${DRY_RUN}`);

  // Verify gh auth without logging token
  try {
    sh('gh auth status 2>&1 | Select-String "Logged in"', { shell: 'powershell.exe' });
  } catch {
    // gh auth status exits non-zero if not logged in; just warn
    log('WARNING: gh auth check inconclusive. Proceeding — will fail fast if unauthenticated.');
  }

  await pollOnce();

  if (ONCE) {
    log('--once mode: exiting.');
    return;
  }

  // Recurring poll
  log(`Entering poll loop every ${POLL_MS / 1000}s. Ctrl+C to stop.`);
  const interval = setInterval(async () => {
    try { await pollOnce(); }
    catch (err) { log(`Poll error: ${err.message}`); }
  }, POLL_MS);

  // Graceful shutdown
  process.on('SIGINT', () => { clearInterval(interval); log('Bridge stopped.'); process.exit(0); });
  process.on('SIGTERM', () => { clearInterval(interval); log('Bridge stopped.'); process.exit(0); });
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1); });
