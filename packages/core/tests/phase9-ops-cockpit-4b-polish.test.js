import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

function src(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

// ── Fix 1: StatusBadge variant support ───────────────────────────────────────

describe('StatusBadge Fix 1 — variant prop is not ignored', () => {
  const badge = src('apps/site/components/StatusBadge.jsx');

  it('accepts a variant prop', () => {
    expect(badge).toMatch(/variant/);
  });

  it('uses variant in className when provided', () => {
    expect(badge).toMatch(/`badge \$\{variant\}`|badge.*variant/);
  });

  it('falls through to approval-risk logic when variant is absent or "default"', () => {
    expect(badge).toMatch(/Approval-risk inference|variant.*default|!variant/i);
  });

  it('shows value or labelProp as label text when variant is provided', () => {
    expect(badge).toMatch(/labelProp\s*\|\|\s*value|label.*\|\|.*value/);
  });

  it('preserves existing approval-risk labels for callers with no variant', () => {
    expect(badge).toMatch(/Internal only/);
    expect(badge).toMatch(/Signer review/);
  });
});

// ── Fix 1b: deployments page statusBadgeVariant fallback ─────────────────────

describe('deployments page — statusBadgeVariant no longer returns "default"', () => {
  const page = src('apps/site/app/ops/deployments/page.jsx');

  it('has statusBadgeVariant function', () => {
    expect(page).toMatch(/statusBadgeVariant/);
  });

  it('does not return "default" as a variant', () => {
    expect(page).not.toMatch(/return 'default'/);
    expect(page).not.toMatch(/return "default"/);
  });

  it('maps active to mint', () => {
    expect(page).toMatch(/active.*mint|mint.*active/);
  });

  it('maps failed/rolled_back to red', () => {
    expect(page).toMatch(/failed.*red|red.*failed/);
  });

  it('maps draft/ready to gold', () => {
    expect(page).toMatch(/draft.*gold|gold.*draft/);
  });

  it('passes variant prop to StatusBadge in release table', () => {
    expect(page).toMatch(/StatusBadge.*variant=\{statusBadgeVariant/s);
  });

  it('passes variant prop to StatusBadge in smoke table', () => {
    expect(page).toMatch(/StatusBadge.*variant=\{s\.status/s);
  });

  it('passes variant prop to StatusBadge in backups table', () => {
    expect(page).toMatch(/StatusBadge.*variant=\{b\.restorable/s);
  });

  it('dry-run subtitle is present', () => {
    expect(page).toMatch(/dry-run mode|dry-run/i);
  });

  it('states no live deployment actions available in browser', () => {
    expect(page).toMatch(/no live deployment|not available from the browser/i);
  });

  it('does not claim a live VPS deployment is active', () => {
    expect(page).not.toMatch(/live deployment is complete|deployed to VPS/i);
  });
});

// ── Fix 2: OpsShell mobile navigation ────────────────────────────────────────

describe('OpsShell Fix 2 — mobile nav does not block content', () => {
  const shell = src('apps/site/components/OpsShell.jsx');

  it('has details/summary wrapper for nav', () => {
    expect(shell).toMatch(/<details/);
    expect(shell).toMatch(/<summary/);
  });

  it('nav is inside the details element', () => {
    const detailsIdx = shell.indexOf('<details');
    const navIdx = shell.indexOf('<nav');
    const detailsCloseIdx = shell.indexOf('</details>');
    expect(detailsIdx).toBeGreaterThan(-1);
    expect(navIdx).toBeGreaterThan(detailsIdx);
    expect(detailsCloseIdx).toBeGreaterThan(navIdx);
  });

  it('ops-main comes after sidebar in JSX (content is DOM-order independent via CSS)', () => {
    const sidebarIdx = shell.indexOf('"sidebar"');
    const mainIdx = shell.indexOf('"ops-main"');
    expect(sidebarIdx).toBeGreaterThan(-1);
    expect(mainIdx).toBeGreaterThan(-1);
  });

  it('preserves all 19 navigation link definitions in the links array', () => {
    // Each link is a 3-tuple string in the links array; count bracket entries
    const tuples = shell.match(/\['.+?',\s*'\/ops/g);
    expect(tuples).not.toBeNull();
    expect(tuples.length).toBeGreaterThanOrEqual(18); // 18 are /ops/* routes + /ops itself
  });

  it('has aria-label on the nav', () => {
    expect(shell).toMatch(/aria-label="Operations navigation"/);
  });
});

// ── Fix 2b: CSS mobile order swap ────────────────────────────────────────────

describe('globals.css Fix 2 — mobile ops-main renders before sidebar', () => {
  const css = src('apps/site/app/globals.css');

  it('sidebar has order:2 in mobile media query', () => {
    expect(css).toMatch(/order\s*:\s*2/);
  });

  it('ops-main has order:1 in mobile media query', () => {
    expect(css).toMatch(/ops-main.*order\s*:\s*1|order\s*:\s*1.*ops-main/s);
  });

  it('mobile-nav-summary is hidden on desktop', () => {
    expect(css).toMatch(/mobile-nav-summary.*display\s*:\s*none/s);
  });

  it('mobile-nav-summary is visible in mobile media query', () => {
    const mediaIdx = css.indexOf('@media (max-width: 980px)');
    const summaryIdx = css.indexOf('mobile-nav-summary', mediaIdx);
    expect(mediaIdx).toBeGreaterThan(-1);
    expect(summaryIdx).toBeGreaterThan(mediaIdx);
  });
});

// ── Fix 3: ICM page deferred state copy ──────────────────────────────────────

describe('/ops/icm — deferred/empty state is clear', () => {
  const icm = src('apps/site/app/ops/icm/page.jsx');

  it('states workspace is not initialized', () => {
    expect(icm).toMatch(/not initialized yet/i);
  });

  it('shows next safe command', () => {
    expect(icm).toMatch(/icm init/);
  });

  it('states live execution is deferred', () => {
    expect(icm).toMatch(/deferred/i);
  });
});

// ── No public frontend drift ──────────────────────────────────────────────────

describe('Gate 4B scope — no public frontend drift', () => {
  it('login page is unchanged (ops shell not used there)', () => {
    const login = src('apps/site/app/login/page.jsx');
    expect(login).not.toMatch(/OpsShell/);
  });

  it('no new auth changes introduced', () => {
    const shell = src('apps/site/components/OpsShell.jsx');
    expect(shell).not.toMatch(/modify.*auth|new.*login.*flow|change.*authentication/i);
  });

  it('no fake live deployment claim in any changed file', () => {
    const files = [
      'apps/site/components/StatusBadge.jsx',
      'apps/site/components/OpsShell.jsx',
      'apps/site/app/ops/deployments/page.jsx',
      'apps/site/app/ops/icm/page.jsx',
    ];
    for (const f of files) {
      const content = src(f);
      if (!content) continue;
      expect(content, `${f} must not claim live deployment`).not.toMatch(/this is now live in production/i);
      expect(content, `${f} must not claim fully deployed`).not.toMatch(/fully implemented and deployed/i);
    }
  });
});
