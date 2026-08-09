/**
 * A3OS-6.6 — Descript Precision-Edit via Playwright
 * Bead: A3OS-6.6 (precision-edit)
 *
 * Executes the 7 Video Change Beads (VCBs) specified in
 * beads/checkpoints/A3OS-6.6-precision-edit-plan.md
 * against the ASC3ND Reel 01 "Why We Started" project in Descript.
 *
 * Constraints:
 *  - Works only in a REVIEW composition or approved duplicate
 *  - Source/master is immutable — never touch the original
 *  - No publish, no schedule, no auto-hook
 *  - Stops at review export; human gate (A3OS-6.7/6.8) follows
 *  - Records all VCB state, IDs, before/after, verification, rollback
 *  - No secrets logged or posted
 *
 * Usage:
 *   npx playwright test scripts/descript-precision-edit.spec.mjs --headed
 *
 * Or run directly:
 *   node --experimental-vm-modules node_modules/.bin/playwright test scripts/descript-precision-edit.spec.mjs
 *
 * Requires: Descript session active in browser (user must be logged in)
 */

import { test, expect, chromium } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = resolve(__dirname, '..');
const EVIDENCE   = resolve(REPO_ROOT, 'beads', 'checkpoints', 'A3OS-6.6-evidence.json');
const DESCRIPT_URL = 'https://web.descript.com';

// ── Locked edit spec (from A3OS-6.4 brief) ─────────────────────────────────
const SPEC = {
  bead:           'A3OS-6.6',
  missionId:      'A3OS-6.6-precision-edit',
  targetDurationMin: 25,
  targetDurationMax: 35,
  aspectRatio:    '9:16',
  beatA: { start: 190.412, end: 199.998, label: 'Cold-open: mentor-absence' },
  beatB: { start: 226.952, end: 243.568, label: 'Insight/future' },
  beatC: { start: 260.0,   end: 273.1,   label: 'Mission-lift (optional)' },
  excluded: [
    { start: 200.2,  end: 222.6,  reason: 'Sensitivity: incarceration/streets — not approved' },
    { start: 349.0,  end: 382.0,  reason: 'High sensitivity: family-history — not approved for Reel 01' },
  ],
  autohook:       false,
  published:      false,
};

// ── Evidence accumulator ────────────────────────────────────────────────────
const evidence = {
  runId:         `RUN-${Date.now()}`,
  missionId:     SPEC.missionId,
  beadId:        SPEC.bead,
  timestamp:     new Date().toISOString(),
  projectId:     null,
  compositionId: null,
  checkpointRef: null,
  vcbs:          [],
  duration:      null,
  aspectRatio:   null,
  captionQA:     null,
  cost:          '$0',
  autohook:      false,
  published:     false,
  exportPath:    null,
  selfQAResult:  null,
  blockers:      [],
};

function saveEvidence() {
  writeFileSync(EVIDENCE, JSON.stringify(evidence, null, 2));
}

function vcb(id, action, status, before, after, verification, rollback, notes = '') {
  const rec = { id, action, status, before, after, verification, rollback, notes, ts: new Date().toISOString() };
  evidence.vcbs.push(rec);
  saveEvidence();
  console.log(`[VCB] ${id} → ${status}: ${action}`);
  return rec;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function waitForDescriptReady(page) {
  // Wait for the main Descript editor to be present
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  // Look for editor canvas or project list
  const hasEditor = await page.locator('[data-testid="editor"], .editor-canvas, #editor-root, [class*="EditorContainer"]').count() > 0;
  const hasList   = await page.locator('[class*="project"], [class*="Project"]').count() > 0;
  return hasEditor || hasList;
}

async function captureScreenshot(page, name) {
  const dir = resolve(REPO_ROOT, 'beads', 'checkpoints', 'screenshots');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = resolve(dir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

// ── Main test ───────────────────────────────────────────────────────────────
test.describe('A3OS-6.6 — Descript precision-edit', () => {
  test.setTimeout(300_000); // 5 min max

  test('Execute 7 VCBs for ASC3ND Reel 01 Why We Started', async ({ browser }) => {
    // Launch headed browser connected to existing Descript session if possible,
    // otherwise open fresh and require login.
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // ── Navigate to Descript ───────────────────────────────────────────────
    console.log('[VCB-6.6-00] Navigating to Descript...');
    await page.goto(DESCRIPT_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check if already logged in
    const url = page.url();
    if (url.includes('login') || url.includes('signin') || url.includes('auth')) {
      evidence.blockers.push({
        vcb: 'VCB-6.6-00',
        type: 'AUTH_REQUIRED',
        message: 'Descript requires login. Worker cannot authenticate without credentials. Jeremy must log in to Descript in the browser session.',
        path: url,
      });
      saveEvidence();

      vcb('VCB-6.6-00', 'Navigate to Descript', 'BLOCKED_AUTH',
        'Not authenticated',
        'Login page shown',
        'URL contains login/signin indicator',
        'N/A — no edit made',
        `Auth URL: ${url}`);

      // Screenshot the login state as evidence
      const shot = await captureScreenshot(page, 'VCB-6.6-00-auth-required');
      evidence.blockers[0].screenshot = shot;
      saveEvidence();

      test.fail(false); // Don't hard-fail — let the result post gracefully
      return;
    }

    // ── Detect project list / current project ──────────────────────────────
    await waitForDescriptReady(page);
    const shot0 = await captureScreenshot(page, 'VCB-6.6-00-descript-home');

    // Record page title and URL as project context
    const pageTitle = await page.title();
    const pageUrl   = page.url();
    evidence.projectId = `detected:${pageUrl}`;
    console.log(`[INFO] Descript page: "${pageTitle}" @ ${pageUrl}`);

    vcb('VCB-6.6-00', 'Navigate and detect Descript state', 'OK',
      'Unknown Descript state',
      `Page: "${pageTitle}" @ ${pageUrl}`,
      'Page loaded, not on login screen',
      'N/A',
      `Screenshot: ${shot0}`);

    // ── VCB-6.6-01: Identify REVIEW composition or project ─────────────────
    console.log('[VCB-6.6-01] Looking for ASC3ND / REVIEW composition...');

    // Search for ASC3ND project
    const projectSelectors = [
      'text=ASC3ND',
      'text=Reel',
      'text=REVIEW',
      'text=Why We Started',
      '[class*="project-title"]',
      '[class*="ProjectCard"]',
    ];

    let foundProject = false;
    for (const sel of projectSelectors) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        const txt = await el.textContent();
        console.log(`[VCB-6.6-01] Found element: "${txt}" with selector: ${sel}`);
        foundProject = true;
        evidence.compositionId = `selector:${sel}:${txt}`;
        break;
      }
    }

    const shot1 = await captureScreenshot(page, 'VCB-6.6-01-project-scan');

    if (!foundProject) {
      evidence.blockers.push({
        vcb: 'VCB-6.6-01',
        type: 'PROJECT_NOT_FOUND',
        message: 'Could not locate ASC3ND / REVIEW / "Why We Started" project in visible Descript UI. Worker needs Jeremy to open the correct Descript project and run this script again, OR provide the exact project URL.',
        screenshot: shot1,
      });
      saveEvidence();

      vcb('VCB-6.6-01', 'Locate REVIEW composition', 'BLOCKED_PROJECT_NOT_FOUND',
        'Descript project list / home',
        'ASC3ND project not found in visible UI',
        'None of the project name selectors matched',
        'N/A',
        `Screenshot: ${shot1}`);

      await context.close();
      return;
    }

    vcb('VCB-6.6-01', 'Locate REVIEW composition', 'OK',
      'Descript project list',
      `Project/composition detected: ${evidence.compositionId}`,
      'Element found in UI',
      'Close composition without saving if checkpoint fails',
      `Screenshot: ${shot1}`);

    // ── Record current state as checkpoint reference ─────────────────────
    evidence.checkpointRef = `PRE-EDIT-${Date.now()}`;
    console.log(`[VCB-6.6-01] Checkpoint reference: ${evidence.checkpointRef}`);
    saveEvidence();

    // ── VCBs 02-07: Transcript-based editing ──────────────────────────────
    // Descript's web app requires knowing the exact composition URL.
    // Without a project URL, we cannot navigate to the timeline directly.
    // Record what we found and surface the gap.

    const remainingVcbs = ['VCB-6.6-02', 'VCB-6.6-03', 'VCB-6.6-04', 'VCB-6.6-05', 'VCB-6.6-06', 'VCB-6.6-07'];
    for (const id of remainingVcbs) {
      vcb(id, 'Awaiting project URL / navigation to composition timeline', 'PENDING',
        'Not started',
        'Not started',
        'Cannot verify without composition URL',
        'N/A',
        'Blocked by VCB-6.6-01 needing exact project URL');
    }

    evidence.blockers.push({
      vcb: 'VCB-6.6-02+',
      type: 'COMPOSITION_URL_REQUIRED',
      message: 'Descript transcript-based editing requires the exact project/composition URL (e.g. https://web.descript.com/p/{project-id}/edit/{composition-id}). Worker found the project list but cannot navigate to the timeline without the canonical ID. Provide the Descript project URL for ASC3ND Reel 01 REVIEW composition via [A2A COMMAND] and this script will resume.',
      screenshot: shot1,
    });

    saveEvidence();
    await context.close();
  });
});
