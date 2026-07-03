import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

function docContent(name) {
  const p = path.join(ROOT, 'docs', name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function docExists(name) {
  return fs.existsSync(path.join(ROOT, 'docs', name));
}

const GATE4A_DOCS = [
  'OPS-COCKPIT-BUILD-TRIAGE.md',
  'OPS-COCKPIT-USABILITY-AUDIT.md',
  'OPS-COCKPIT-DESIGN-POLISH-SPEC.md',
];

const REQUIRED_ROUTES = [
  '/login',
  '/ops',
  '/ops/agents',
  '/ops/agents/[id]',
  '/ops/artifacts',
  '/ops/events',
  '/ops/budgets',
  '/ops/health',
  '/ops/deployments',
  '/ops/openwebui',
  '/ops/icm',
];

// ── All three Gate 4A docs exist ─────────────────────────────────────────────

describe('Phase 9 Gate 4A required docs exist', () => {
  for (const doc of GATE4A_DOCS) {
    it(`docs/${doc} exists`, () => {
      expect(docExists(doc)).toBe(true);
    });
  }
});

// ── Build triage doc completeness ────────────────────────────────────────────

describe('OPS-COCKPIT-BUILD-TRIAGE.md required content', () => {
  const content = () => docContent('OPS-COCKPIT-BUILD-TRIAGE.md');

  it('has exact command section', () => {
    expect(content()).toMatch(/## Exact command/);
  });

  it('has error summary section', () => {
    expect(content()).toMatch(/## Error summary/);
  });

  it('has a classification', () => {
    expect(content()).toMatch(/## Classification/);
  });

  it('states whether CI\\/Vercel passes', () => {
    expect(content()).toMatch(/## Whether CI\/Vercel passes/);
  });

  it('states whether local dev is blocked', () => {
    expect(content()).toMatch(/## Whether local dev is blocked/);
  });

  it('names the affected route(s)', () => {
    expect(content()).toMatch(/## Affected route/);
  });

  it('has a recommended fix or deferral', () => {
    expect(content()).toMatch(/## Recommended fix or deferral/);
  });

  it('does not claim the fix is unverified', () => {
    const c = content();
    expect(c).toMatch(/verif/i);
  });
});

// ── Usability audit covers all required routes ───────────────────────────────

describe('OPS-COCKPIT-USABILITY-AUDIT.md covers all required routes', () => {
  const content = () => docContent('OPS-COCKPIT-USABILITY-AUDIT.md');

  for (const route of REQUIRED_ROUTES) {
    it(`mentions route ${route}`, () => {
      const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(content()).toMatch(new RegExp(escaped));
    });
  }

  it('includes severity ratings', () => {
    const c = content();
    expect(c).toMatch(/Severity/);
    expect(c).toMatch(/Blocker|High|Medium|Low/);
  });

  it('includes a severity summary table', () => {
    expect(content()).toMatch(/## Severity summary/);
  });

  it('includes mobile risk assessment', () => {
    expect(content()).toMatch(/[Mm]obile risk/);
  });

  it('includes accessibility notes', () => {
    expect(content()).toMatch(/[Aa]ccessibility/);
  });

  it('includes recommended fixes', () => {
    expect(content()).toMatch(/[Rr]ecommended fix/);
  });
});

// ── Design polish spec required sections ─────────────────────────────────────

describe('OPS-COCKPIT-DESIGN-POLISH-SPEC.md required sections', () => {
  const content = () => docContent('OPS-COCKPIT-DESIGN-POLISH-SPEC.md');

  it('has a design goal section', () => {
    expect(content()).toMatch(/## Design goal/);
  });

  it('has an information architecture section', () => {
    expect(content()).toMatch(/## Information architecture/);
  });

  it('has route-by-route improvements', () => {
    expect(content()).toMatch(/## Route-by-route improvements/);
  });

  it('has component improvements', () => {
    expect(content()).toMatch(/## Component improvements/);
  });

  it('has copy improvements', () => {
    expect(content()).toMatch(/## Copy improvements/);
  });

  it('includes empty states', () => {
    expect(content()).toMatch(/## Empty states/);
  });

  it('includes loading states', () => {
    expect(content()).toMatch(/## Loading states/);
  });

  it('includes error states', () => {
    expect(content()).toMatch(/## Error states/);
  });

  it('includes dry-run labels', () => {
    expect(content()).toMatch(/## Dry-run labels/);
  });

  it('includes human approval labels', () => {
    expect(content()).toMatch(/## Human approval labels/);
  });

  it('includes agent safety labels', () => {
    expect(content()).toMatch(/## Agent safety labels/);
  });

  it('includes mobile behavior', () => {
    expect(content()).toMatch(/## Mobile behavior/);
  });

  it('includes implementation slices', () => {
    expect(content()).toMatch(/## Implementation slices/);
  });

  it('includes tests needed', () => {
    expect(content()).toMatch(/## Tests needed/);
  });

  it('includes screenshots needed', () => {
    expect(content()).toMatch(/## Screenshots needed/);
  });

  it('includes a rollback plan', () => {
    expect(content()).toMatch(/## Rollback plan/);
  });

  it('states it has not been implemented', () => {
    const c = content();
    expect(c).toMatch(/not been implemented|Specification only/i);
  });
});

// ── No fake live claims ───────────────────────────────────────────────────────

const FORBIDDEN_CLAIM_PATTERNS = [
  { pattern: /this is now live in production/i, label: 'fake live claim' },
  { pattern: /fully implemented and deployed/i, label: 'fake deployment claim' },
  { pattern: /\[TODO\]/i, label: 'TODO placeholder' },
  { pattern: /\[TBD\]/i, label: 'TBD placeholder' },
  { pattern: /coming soon/i, label: 'coming soon placeholder' },
  { pattern: /lorem ipsum/i, label: 'lorem ipsum placeholder' },
];

describe('Gate 4A docs contain no fake live claims or stub placeholders', () => {
  for (const doc of GATE4A_DOCS) {
    for (const { pattern, label } of FORBIDDEN_CLAIM_PATTERNS) {
      it(`docs/${doc}: no "${label}"`, () => {
        const content = docContent(doc);
        if (!content) return;
        expect(content).not.toMatch(pattern);
      });
    }
  }

  it('design polish spec explicitly says nothing is implemented yet', () => {
    const content = docContent('OPS-COCKPIT-DESIGN-POLISH-SPEC.md');
    expect(content).toMatch(/Nothing in this document has been implemented/i);
  });
});

// ── Public frontend / auth / Vercel boundaries respected ─────────────────────

describe('Gate 4A design spec stays within the approved boundary', () => {
  it('design spec does not propose touching Vercel config', () => {
    const content = docContent('OPS-COCKPIT-DESIGN-POLISH-SPEC.md');
    expect(content).toMatch(/no change to any file outside/i);
  });

  it('design spec does not propose auth changes', () => {
    const content = docContent('OPS-COCKPIT-DESIGN-POLISH-SPEC.md');
    expect(content.toLowerCase()).not.toMatch(/modify auth|change authentication|new login flow/);
  });
});
