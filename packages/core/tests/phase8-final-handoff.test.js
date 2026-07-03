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

function rootFileContent(name) {
  const p = path.join(ROOT, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

// ── Required Phase 8 docs exist ──────────────────────────────────────────────

describe('Phase 8 required docs exist', () => {
  const REQUIRED_DOCS = [
    'PNW-NONPROFIT-OFFER.md',
    'MANAGED-AGENTS-AS-A-SERVICE.md',
    'SALES-DEMO-FLOW.md',
    'ONBOARDING-14-DAY-LAUNCH.md',
    'PRICING.md',
    'OBJECTIONS.md',
    'LEGAL-SAFETY-NOTES.md',
    'V0.7-FINAL-HANDOFF.md',
    'FINAL-RELEASE-CANDIDATE.md',
    'CLIENT-DEMO-SCRIPT.md',
    'IMPLEMENTATION-CHECKLIST.md',
  ];

  for (const doc of REQUIRED_DOCS) {
    it(`docs/${doc} exists`, () => {
      expect(docExists(doc)).toBe(true);
    });
  }
});

// ── No fake guarantees ────────────────────────────────────────────────────────

const FORBIDDEN_CLAIM_PATTERNS = [
  { pattern: /we guarantee/i, label: 'guarantee claim' },
  { pattern: /guaranteed grant/i, label: 'guaranteed grant' },
  { pattern: /guaranteed funding/i, label: 'guaranteed funding' },
  { pattern: /automatically submit.*grant/i, label: 'auto grant submission' },
  { pattern: /automatically file.*legal/i, label: 'auto legal filing' },
  { pattern: /automatically send.*donor/i, label: 'auto donor outreach' },
  { pattern: /automatically send.*youth/i, label: 'auto youth outreach' },
  { pattern: /automatically contact.*donor/i, label: 'auto donor contact' },
  { pattern: /fake testimonial/i, label: 'fake testimonial' },
  { pattern: /lorem ipsum/i, label: 'lorem ipsum placeholder' },
  { pattern: /\[TODO\]/i, label: 'TODO placeholder' },
  { pattern: /\[TBD\]/i, label: 'TBD placeholder' },
  { pattern: /coming soon/i, label: 'coming soon placeholder' },
  { pattern: /under construction/i, label: 'under construction placeholder' },
];

const PHASE8_DOCS = [
  'PNW-NONPROFIT-OFFER.md',
  'MANAGED-AGENTS-AS-A-SERVICE.md',
  'SALES-DEMO-FLOW.md',
  'ONBOARDING-14-DAY-LAUNCH.md',
  'PRICING.md',
  'OBJECTIONS.md',
  'LEGAL-SAFETY-NOTES.md',
  'V0.7-FINAL-HANDOFF.md',
  'FINAL-RELEASE-CANDIDATE.md',
  'CLIENT-DEMO-SCRIPT.md',
  'IMPLEMENTATION-CHECKLIST.md',
];

describe('Phase 8 docs contain no fake guarantees or placeholders', () => {
  for (const doc of PHASE8_DOCS) {
    for (const { pattern, label } of FORBIDDEN_CLAIM_PATTERNS) {
      it(`docs/${doc}: no "${label}"`, () => {
        const content = docContent(doc);
        if (!content) return; // doc missing is caught by existence test
        expect(content).not.toMatch(pattern);
      });
    }
  }
});

// ── No claims of live deployment in docs ──────────────────────────────────────

describe('Phase 8 docs accurately represent live vs. dry-run state', () => {
  it('PNW-NONPROFIT-OFFER.md states what is deferred', () => {
    const content = docContent('PNW-NONPROFIT-OFFER.md');
    expect(content).toContain('Deferred');
    expect(content).toContain('dry-run');
  });

  it('MANAGED-AGENTS-AS-A-SERVICE.md states live vs deferred', () => {
    const content = docContent('MANAGED-AGENTS-AS-A-SERVICE.md');
    expect(content).toContain('Deferred');
    expect(content).toContain('dry-run');
  });

  it('FINAL-RELEASE-CANDIDATE.md has ship/no-ship verdict', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content.toLowerCase()).toMatch(/ship.*no.ship|no.ship.*ship|ship \/ no-ship/i);
  });

  it('FINAL-RELEASE-CANDIDATE.md has phase completion table', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toContain('Phase 8');
    expect(content).toContain('Complete');
  });

  it('FINAL-RELEASE-CANDIDATE.md states what is not safe to demo as live', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toContain('NOT safe to demo');
  });

  it('LEGAL-SAFETY-NOTES.md states no automatic grant submission', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toMatch(/grant.*funding|grant submission|submit grants/i);
    expect(content).toMatch(/no automatic|never automatic|permanently blocked/i);
  });

  it('LEGAL-SAFETY-NOTES.md states no automatic legal filing', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toContain('legal');
    expect(content).toMatch(/no automatic legal|never automatic/i);
  });

  it('LEGAL-SAFETY-NOTES.md mentions approval gates', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toContain('approval');
    expect(content).toMatch(/orange|red/i);
  });

  it('LEGAL-SAFETY-NOTES.md mentions youth data', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toMatch(/youth/i);
  });
});

// ── Final handoff document completeness ───────────────────────────────────────

describe('V0.7-FINAL-HANDOFF.md required sections', () => {
  it('contains install instructions', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('npm ci');
  });

  it('contains verify-v06 instructions', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('verify-v06.mjs');
  });

  it('contains missionctl doctor command', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('missionctl.mjs doctor');
  });

  it('contains bundle smoke command', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('bundle smoke');
  });

  it('contains tenant creation command', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('tenant create');
  });

  it('contains backup and restore commands', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('backup create');
    expect(content).toContain('backup restore');
  });

  it('documents Vercel duplicate-root issue', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('Vercel');
    expect(content).toMatch(/root directory|apps\/site|duplicate.root/i);
  });

  it('documents known dry-run limitations', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('dry-run');
    expect(content).toContain('Phase 9');
  });

  it('documents what requires live credentials', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('POSTGRES_PASSWORD');
    expect(content).toContain('JWT_SECRET');
  });

  it('documents phase history', () => {
    const content = docContent('V0.7-FINAL-HANDOFF.md');
    expect(content).toContain('Phase 8');
    expect(content).toContain('Phase 9');
  });
});

// ── Pricing is labeled draft ───────────────────────────────────────────────────

describe('PRICING.md safety checks', () => {
  it('is labeled as draft', () => {
    const content = docContent('PRICING.md');
    expect(content.toLowerCase()).toContain('draft');
  });

  it('does not claim compliance outcomes', () => {
    const content = docContent('PRICING.md');
    expect(content).not.toMatch(/guarantee.*complian/i);
    expect(content).not.toMatch(/guarantee.*grant/i);
  });

  it('states pricing is not a contract', () => {
    const content = docContent('PRICING.md');
    expect(content.toLowerCase()).toMatch(/not a contract|planning reference|negotiated/i);
  });
});

// ── Legal safety notes completeness ────────────────────────────────────────────

describe('LEGAL-SAFETY-NOTES.md completeness', () => {
  it('has orange and red risk classification', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toContain('Orange');
    expect(content).toContain('Red');
  });

  it('mentions historical key note (500c13b)', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toContain('500c13b');
  });

  it('documents credential rotation requirement', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toMatch(/credential rotation|fresh credentials/i);
  });

  it('states not legal advice', () => {
    const content = docContent('LEGAL-SAFETY-NOTES.md');
    expect(content).toMatch(/not legal advice/i);
  });
});

// ── Sales demo flow uses dry-run commands only ──────────────────────────────

describe('SALES-DEMO-FLOW.md safety', () => {
  it('references --dry-run flag in demo commands', () => {
    const content = docContent('SALES-DEMO-FLOW.md');
    expect(content).toContain('--dry-run');
  });

  it('has a "what NOT to claim" section', () => {
    const content = docContent('SALES-DEMO-FLOW.md');
    expect(content).toMatch(/NOT (to )?claim|do not (say|claim)/i);
  });

  it('references verify-v06 in pre-demo setup', () => {
    const content = docContent('SALES-DEMO-FLOW.md');
    expect(content).toContain('verify-v06.mjs');
  });
});

// ── Implementation checklist has abort conditions ──────────────────────────

describe('IMPLEMENTATION-CHECKLIST.md completeness', () => {
  it('has Phase 9 section for live VPS steps', () => {
    const content = docContent('IMPLEMENTATION-CHECKLIST.md');
    expect(content).toContain('Phase 9');
    expect(content).toContain('VPS');
  });

  it('has abort conditions section', () => {
    const content = docContent('IMPLEMENTATION-CHECKLIST.md');
    expect(content).toMatch(/abort|stop and escalate/i);
  });

  it('has rollback procedure', () => {
    const content = docContent('IMPLEMENTATION-CHECKLIST.md');
    expect(content).toContain('Rollback');
    expect(content).toContain('backup restore');
  });
});

// ── Final release candidate judge verdict ────────────────────────────────────

describe('FINAL-RELEASE-CANDIDATE.md judge section', () => {
  it('contains Phase 8 Judge verdict', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toMatch(/Phase 8 Judge verdict/i);
  });

  it('verdict is PASS', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toMatch(/\*\*PASS\*\*/);
  });

  it('references Emerald Tablets', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toContain('Emerald Tablets');
  });

  it('states ready for Architect final review', () => {
    const content = docContent('FINAL-RELEASE-CANDIDATE.md');
    expect(content).toMatch(/ready for.*Architect.*review/i);
  });
});

// ── HOSTINGER-VPS-HANDOFF.md still tracked ──────────────────────────────────

describe('root handoff files', () => {
  it('HOSTINGER-VPS-HANDOFF.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'HOSTINGER-VPS-HANDOFF.md'))).toBe(true);
  });

  it('EMERALD_TABLETS.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'EMERALD_TABLETS.md'))).toBe(true);
  });
});
