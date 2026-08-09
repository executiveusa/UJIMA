/**
 * A3OS-6.6 — Descript Precision-Edit via Playwright (direct, no test runner)
 * Bead: A3OS-6.6 (precision-edit)
 *
 * Pure Node.js script using playwright directly (not @playwright/test).
 * Executes the 7 Video Change Beads (VCBs) against ASC3ND Reel 01 in Descript.
 *
 * Usage:
 *   node --experimental-vm-modules scripts/descript-edit.mjs [--headless]
 *
 * The script:
 *  1. Opens Descript web app
 *  2. Detects login state — reports AUTH_REQUIRED if not logged in
 *  3. Locates the ASC3ND / REVIEW composition
 *  4. Records evidence at each VCB step
 *  5. Writes beads/checkpoints/A3OS-6.6-evidence.json
 *  6. Never publishes, never edits source/master
 */

import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = resolve(__dirname, '..');
const EVIDENCE_PATH = resolve(REPO_ROOT, 'beads', 'checkpoints', 'A3OS-6.6-evidence.json');
const SCREENSHOTS   = resolve(REPO_ROOT, 'beads', 'checkpoints', 'screenshots');
const HEADLESS   = process.argv.includes('--headless');
const DESCRIPT   = 'https://web.descript.com';

// Locked spec from A3OS-6.4
const SPEC = {
  beatA: { start: 190.412, end: 199.998 },
  beatB: { start: 226.952, end: 243.568 },
  beatC: { start: 260.0,   end: 273.1,  optional: true },
  targetDurationMin: 25,
  targetDurationMax: 35,
};

const ev = {
  runId:         `RUN-${Date.now()}`,
  missionId:     'A3OS-6.6-precision-edit',
  beadId:        'A3OS-6.6',
  timestamp:     new Date().toISOString(),
  spec:          SPEC,
  projectUrl:    null,
  projectId:     null,
  compositionId: null,
  checkpointRef: null,
  vcbs:          [],
  finalStatus:   null,
  cost:          '$0',
  published:     false,
  autohook:      false,
  exportPath:    null,
  blockers:      [],
};

function save() { writeFileSync(EVIDENCE_PATH, JSON.stringify(ev, null, 2)); }
function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

function vcb(id, action, status, before, after, verification, rollback, notes = '') {
  const rec = { id, action, status, before, after, verification, rollback, notes, ts: new Date().toISOString() };
  ev.vcbs.push(rec); save();
  log(`[VCB] ${id} → ${status}`);
  return rec;
}

async function screenshot(page, name) {
  if (!existsSync(SCREENSHOTS)) mkdirSync(SCREENSHOTS, { recursive: true });
  const p = resolve(SCREENSHOTS, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: p });
  return p;
}

async function main() {
  log('Launching browser...');
  // playwright@1.62.1 expects chromium_headless_shell-1234 which may not be downloaded.
  // Use system Chrome (already installed) or the cached full chromium-1228.
  let browser;
  const sysChromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  try {
    // Try system Chrome first (most reliable in this environment)
    if (existsSync(sysChromeExe)) {
      log('Using system Chrome executable');
      browser = await chromium.launch({ headless: HEADLESS, slowMo: 100, executablePath: sysChromeExe });
    } else {
      // Fall back to cached chromium-1228 full browser
      const cachedChrome = 'C:\\Users\\execu\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win\\chrome.exe';
      log(`Using cached Chromium: ${cachedChrome}`);
      browser = await chromium.launch({ headless: HEADLESS, slowMo: 100, executablePath: cachedChrome });
    }
  } catch (launchErr) {
    log(`Browser launch error: ${launchErr.message}`);
    throw launchErr;
  }
  const ctx  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    // ── Navigate ──────────────────────────────────────────────────────────
    log(`Navigating to ${DESCRIPT}...`);
    await page.goto(DESCRIPT, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const url   = page.url();
    const title = await page.title();
    log(`Landed: "${title}" @ ${url}`);

    const shot0 = await screenshot(page, 'VCB-6.6-00-landing');

    // ── Auth check ────────────────────────────────────────────────────────
    const isAuthPage = /login|signin|auth|account/.test(url);
    if (isAuthPage) {
      ev.blockers.push({
        type: 'AUTH_REQUIRED',
        vcb:  'VCB-6.6-00',
        url, title,
        message: 'Descript requires authentication. Playwright opened a fresh Chromium with no saved session. Fix: either (A) provide Descript credentials in a .env file for the worker to use, or (B) Jeremy logs in to Descript in this browser window and re-runs the script. No edit made.',
        screenshot: shot0,
      });
      vcb('VCB-6.6-00', 'Navigate to Descript', 'BLOCKED_AUTH',
        'Not authenticated', `Login page: ${url}`,
        'URL contains auth indicator', 'N/A', `Shot: ${shot0}`);
      ev.finalStatus = 'BLOCKED_AUTH';
      save();
      return;
    }

    vcb('VCB-6.6-00', 'Navigate to Descript', 'OK',
      'Unknown', `"${title}" @ ${url}`, 'No auth wall', 'N/A', `Shot: ${shot0}`);

    ev.projectUrl = url;

    // ── Project discovery ─────────────────────────────────────────────────
    log('Scanning for ASC3ND project...');
    await page.waitForTimeout(2000);

    const shot1 = await screenshot(page, 'VCB-6.6-01-project-scan');

    // Look for ASC3ND / Reel / REVIEW in any visible text
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasAsc3nd = /asc3nd|reel|why we started|review/i.test(bodyText);
    const hasProject = bodyText.length > 200; // Something rendered

    log(`Body text length: ${bodyText.length}; hasASC3ND: ${hasAsc3nd}`);

    if (!hasProject || bodyText.length < 100) {
      ev.blockers.push({
        type: 'EMPTY_PAGE',
        vcb: 'VCB-6.6-01',
        message: 'Descript page rendered with minimal content. May need login or page load time.',
        bodyPreview: bodyText.slice(0, 300),
        screenshot: shot1,
      });
      vcb('VCB-6.6-01', 'Scan for ASC3ND project', 'BLOCKED_EMPTY',
        'Descript home', 'Minimal content', 'body.innerText < 100 chars',
        'N/A', `Shot: ${shot1}`);
      ev.finalStatus = 'BLOCKED_EMPTY';
      save();
      return;
    }

    // Extract any project links
    const projectLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/project/"]'))
        .map(a => ({ href: a.href, text: a.innerText.trim() }))
        .slice(0, 20)
    );
    log(`Project links found: ${JSON.stringify(projectLinks)}`);

    const ascndLink = projectLinks.find(l =>
      /asc3nd|reel|review|why we started/i.test(l.text) ||
      /asc3nd|reel|review/i.test(l.href)
    );

    vcb('VCB-6.6-01', 'Scan for ASC3ND project', hasAsc3nd ? 'OK' : 'PARTIAL',
      'Descript home',
      `bodyLength=${bodyText.length}; hasASC3ND=${hasAsc3nd}; projectLinks=${projectLinks.length}; ascndLink=${JSON.stringify(ascndLink)}`,
      'Page rendered with content',
      'N/A',
      `Shot: ${shot1}; bodyPreview: ${bodyText.slice(0, 200)}`);

    if (!ascndLink) {
      // Take a full-page screenshot with all visible project names
      const shot1b = await screenshot(page, 'VCB-6.6-01b-all-projects');

      // Collect all text nodes that look like project names
      const projectCards = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[class*="project"], [class*="Project"], [class*="card"], [class*="Card"], [role="button"], [role="listitem"]'))
          .map(el => ({ tag: el.tagName, class: el.className?.slice(0, 60), text: el.innerText?.trim().slice(0, 80) }))
          .filter(el => el.text)
          .slice(0, 30)
      );

      ev.blockers.push({
        type: 'ASC3ND_PROJECT_NOT_FOUND',
        vcb: 'VCB-6.6-02',
        message: `Could not find ASC3ND / Reel 01 / REVIEW project link in Descript UI. Worker needs the exact Descript project URL for the ASC3ND "Why We Started" REVIEW composition. Send via [A2A COMMAND]: { "descriptProjectUrl": "https://web.descript.com/p/{project-id}/..." }`,
        visibleProjects: projectLinks,
        projectCards: projectCards,
        screenshots: [shot1, shot1b],
      });

      // Mark remaining VCBs pending
      for (const id of ['VCB-6.6-02','VCB-6.6-03','VCB-6.6-04','VCB-6.6-05','VCB-6.6-06','VCB-6.6-07']) {
        vcb(id, 'Pending — ASC3ND project URL required', 'PENDING',
          'N/A', 'N/A', 'N/A', 'N/A', 'Blocked by VCB-6.6-01');
      }

      ev.finalStatus = 'BLOCKED_PROJECT_URL_REQUIRED';
      save();
      log('BLOCKED: ASC3ND project not found. Evidence saved. Posting result.');
      return;
    }

    // Found it — navigate in
    log(`Navigating to ASC3ND project: ${ascndLink.href}`);
    ev.projectId = ascndLink.href;
    ev.compositionId = ascndLink.href;
    vcb('VCB-6.6-01b', 'Navigate to ASC3ND project', 'OK',
      'Descript home', `Project: ${ascndLink.text} @ ${ascndLink.href}`,
      'Link found and navigating', 'Navigate back to home', '');

    await page.goto(ascndLink.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const shot2 = await screenshot(page, 'VCB-6.6-02-project-open');
    ev.checkpointRef = `BEFORE-EDIT-${Date.now()}`;

    vcb('VCB-6.6-02', 'Open project & establish checkpoint', 'OK',
      'Project list', `Inside project: ${page.url()}`,
      'Screenshot taken as pre-edit checkpoint', `Checkpoint ref: ${ev.checkpointRef}`,
      `Shot: ${shot2}`);

    // ── Remaining VCBs require Descript editor interactions ───────────────
    // These require DOM knowledge of the Descript editor which varies by
    // version. Mark as IN_PROGRESS and record what's visible.
    const editorText  = await page.evaluate(() => document.body.innerText);
    const shot3 = await screenshot(page, 'VCB-6.6-03-editor-state');

    for (const id of ['VCB-6.6-03','VCB-6.6-04','VCB-6.6-05','VCB-6.6-06','VCB-6.6-07']) {
      vcb(id, 'Editor state captured — requires Descript DOM spec for transcript trim', 'REQUIRES_DOM_SPEC',
        'Project editor open', `Editor content length: ${editorText.length}`,
        'Screenshot captured', 'Back button in Descript',
        `Shot: ${shot3}; Transcript beads require Descript transcript panel selectors.`);
    }

    ev.blockers.push({
      type: 'DESCRIPT_DOM_SPEC_REQUIRED',
      vcb: 'VCB-6.6-03+',
      message: 'Project is open in Descript. To perform transcript-based trim (VCBs 03-07), the worker needs the current Descript editor DOM selectors for: (1) transcript word click/timestamp navigation, (2) timeline trim handles, (3) "Create composition from selection" or scene split, (4) caption panel, (5) export panel. Send the Descript project URL + composition name + editor version via [A2A COMMAND] and the worker will read current docs and produce the specific selectors.',
      projectUrl: page.url(),
      editorContentLength: editorText.length,
      screenshots: [shot3],
    });

    ev.finalStatus = 'PARTIAL_BLOCKED_DOM_SPEC';
    save();

  } catch (err) {
    log(`Error: ${err.message}`);
    ev.blockers.push({ type: 'RUNTIME_ERROR', message: err.message, stack: err.stack?.slice(0, 500) });
    ev.finalStatus = 'ERROR';
    save();
  } finally {
    await browser.close();
    log(`Evidence saved to: ${EVIDENCE_PATH}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
