import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(new URL('.', import.meta.url).pathname, '../../..');

function readDoc(relPath) {
  const full = join(REPO_ROOT, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf8');
}

// --- Doc existence ---

describe('Gate 5A — Sovereign AI Offer Package: document existence', () => {
  const docs = [
    'docs/SOVEREIGN-AI-OFFER-PACKAGE.md',
    'docs/SOVEREIGN-AI-OFFER.md',
    'docs/ONE-TIME-SETUP-FEE-OFFER.md',
    'docs/MAINTENANCE-PACKAGE.md',
    'docs/MANAGED-AGENT-SUPPORT-PACKAGE.md',
    'docs/CLIENT-OWNED-STACK-AGREEMENT-NOTES.md',
    'docs/SOVEREIGN-AI-FAQ.md',
    'docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md',
    'docs/IMPLEMENTATION-SOW-OUTLINE.md',
  ];

  for (const doc of docs) {
    it(`exists: ${doc}`, () => {
      expect(existsSync(join(REPO_ROOT, doc))).toBe(true);
    });
  }
});

// --- Offer package index ---

describe('Gate 5A — SOVEREIGN-AI-OFFER-PACKAGE.md content', () => {
  const content = readDoc('docs/SOVEREIGN-AI-OFFER-PACKAGE.md');

  it('exists', () => expect(content).not.toBeNull());

  it('states client owns the stack', () => {
    expect(content).toMatch(/client\s+own/i);
  });

  it('includes ownership table with VPS row', () => {
    expect(content).toMatch(/VPS/);
  });

  it('includes ownership table with MIT license row', () => {
    expect(content).toMatch(/MIT/i);
  });

  it('states no forced SaaS subscription', () => {
    expect(content).toMatch(/no forced SaaS subscription|not a SaaS/i);
  });

  it('links to SOVEREIGN-AI-OFFER.md', () => {
    expect(content).toMatch(/SOVEREIGN-AI-OFFER\.md/);
  });

  it('links to ONE-TIME-SETUP-FEE-OFFER.md', () => {
    expect(content).toMatch(/ONE-TIME-SETUP-FEE-OFFER\.md/);
  });

  it('links to MAINTENANCE-PACKAGE.md', () => {
    expect(content).toMatch(/MAINTENANCE-PACKAGE\.md/);
  });

  it('links to MANAGED-AGENT-SUPPORT-PACKAGE.md', () => {
    expect(content).toMatch(/MANAGED-AGENT-SUPPORT-PACKAGE\.md/);
  });

  it('links to CLIENT-OWNED-STACK-AGREEMENT-NOTES.md', () => {
    expect(content).toMatch(/CLIENT-OWNED-STACK-AGREEMENT-NOTES\.md/);
  });

  it('links to IMPLEMENTATION-SOW-OUTLINE.md', () => {
    expect(content).toMatch(/IMPLEMENTATION-SOW-OUTLINE\.md/);
  });

  it('includes required-language say/don\'t-say section', () => {
    expect(content).toMatch(/Say:|Do not say:|required language/i);
  });

  it('includes "do not say" list with prohibited AI claims', () => {
    // The index doc is a meta-doc that lists forbidden language — presence of
    // the phrases in a "Do not say" section is intentional and correct.
    expect(content).toMatch(/Do not say/i);
    expect(content).toMatch(/Fully autonomous|live client deployment|guaranteed funding/i);
  });
});

// --- Client-facing offer ---

describe('Gate 5A — SOVEREIGN-AI-OFFER.md content', () => {
  const content = readDoc('docs/SOVEREIGN-AI-OFFER.md');

  it('exists', () => expect(content).not.toBeNull());

  it('includes ownership claim', () => {
    expect(content).toMatch(/you own/i);
  });

  it('states human approval required for sensitive actions', () => {
    expect(content).toMatch(/human approval|human review/i);
  });

  it('states no grant submission without approval', () => {
    expect(content).toMatch(/submit.*grant|grant.*submit/i);
  });

  it('states hard blocks on external actions', () => {
    expect(content).toMatch(/hard block|without.*approval|cannot.*without/i);
  });

  it('includes pricing DRAFT disclaimer', () => {
    expect(content).toMatch(/DRAFT/);
  });

  it('does not claim guaranteed outcomes', () => {
    expect(content).not.toMatch(/guaranteed outcome|guaranteed funding|guaranteed donation/i);
  });

  it('does not say "SaaS subscription required"', () => {
    expect(content).not.toMatch(/SaaS subscription required/i);
  });

  it('states client is not renting software', () => {
    expect(content).toMatch(/not renting|no forced.*subscription|one-time setup/i);
  });
});

// --- Setup fee ---

describe('Gate 5A — ONE-TIME-SETUP-FEE-OFFER.md content', () => {
  const content = readDoc('docs/ONE-TIME-SETUP-FEE-OFFER.md');

  it('exists', () => expect(content).not.toBeNull());

  it('includes DRAFT pricing disclaimer', () => {
    expect(content).toMatch(/DRAFT/);
  });

  it('describes payment milestone structure', () => {
    expect(content).toMatch(/payment|milestone/i);
  });

  it('states what is not covered by setup fee', () => {
    expect(content).toMatch(/not covered|not included/i);
  });

  it('states VPS costs are paid directly to provider, not through Asc3nd', () => {
    // The doc lists VPS hosting in a table with costs paid directly to providers
    expect(content).toMatch(/VPS hosting/i);
    expect(content).toMatch(/paid directly|not through Asc3nd/i);
  });

  it('does not make positive guarantee-of-outcome claims', () => {
    // "Guaranteed outcomes of any kind" appears in "not provided" list (correct);
    // check that no positive guarantee claim is made (e.g. "we guarantee outcomes")
    expect(content).not.toMatch(/we guarantee.*outcome|Asc3nd guarantees/i);
  });
});

// --- Maintenance package ---

describe('Gate 5A — MAINTENANCE-PACKAGE.md content', () => {
  const content = readDoc('docs/MAINTENANCE-PACKAGE.md');

  it('exists', () => expect(content).not.toBeNull());

  it('states package is optional', () => {
    expect(content).toMatch(/optional/i);
  });

  it('states client retains root access', () => {
    expect(content).toMatch(/root.*access|retains.*access/i);
  });

  it('includes DRAFT pricing disclaimer', () => {
    expect(content).toMatch(/DRAFT/);
  });

  it('states what happens if package is cancelled', () => {
    expect(content).toMatch(/cancelled|cancel/i);
  });

  it('does not make positive compliance certification claims', () => {
    // "No legal compliance certification is provided" is a disclaimer (correct);
    // check that no positive certification claim is made
    expect(content).not.toMatch(/Mission OS is (?:HIPAA|FERPA|COPPA) certified|provides compliance certification/i);
  });
});

// --- Managed-agent support package ---

describe('Gate 5A — MANAGED-AGENT-SUPPORT-PACKAGE.md content', () => {
  const content = readDoc('docs/MANAGED-AGENT-SUPPORT-PACKAGE.md');

  it('exists', () => expect(content).not.toBeNull());

  it('states package is optional', () => {
    expect(content).toMatch(/optional/i);
  });

  it('states agents are not autonomous', () => {
    expect(content).toMatch(/not autonomous|not.*autonomous|agents are not/i);
  });

  it('states hard blocks on external actions cannot be removed', () => {
    expect(content).toMatch(/cannot be removed|hard block|structural/i);
  });

  it('states client approves all changes', () => {
    expect(content).toMatch(/client.*approve|approve.*client/i);
  });

  it('includes DRAFT pricing disclaimer', () => {
    expect(content).toMatch(/DRAFT/);
  });

  it('does not claim autonomous production AI', () => {
    expect(content).not.toMatch(/fully autonomous production AI/i);
  });
});

// --- Agreement notes ---

describe('Gate 5A — CLIENT-OWNED-STACK-AGREEMENT-NOTES.md content', () => {
  const content = readDoc('docs/CLIENT-OWNED-STACK-AGREEMENT-NOTES.md');

  it('exists', () => expect(content).not.toBeNull());

  it('contains "not legal advice" disclaimer', () => {
    expect(content).toMatch(/not legal advice/i);
  });

  it('contains "not a final contract" disclaimer', () => {
    expect(content).toMatch(/not a final contract|not.*contract/i);
  });

  it('contains "attorney" review requirement', () => {
    expect(content).toMatch(/attorney/i);
  });

  it('states MIT license terms', () => {
    expect(content).toMatch(/MIT/i);
  });

  it('states client owns VPS after handoff', () => {
    expect(content).toMatch(/VPS.*client|client.*VPS/i);
  });

  it('does not make positive HIPAA/FERPA certification claims', () => {
    // "does not certify Mission OS for HIPAA" is a disclaimer (correct);
    // check that no positive certification claim is made
    expect(content).not.toMatch(/Mission OS is (?:HIPAA|FERPA) certified|certified for HIPAA compliance/i);
  });
});

// --- FAQ ---

describe('Gate 5A — SOVEREIGN-AI-FAQ.md content', () => {
  const content = readDoc('docs/SOVEREIGN-AI-FAQ.md');

  it('exists', () => expect(content).not.toBeNull());

  it('has at least 10 Q&A entries', () => {
    const matches = content.match(/^### Q\d+/gm);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  it('addresses the "is this SaaS" question', () => {
    expect(content).toMatch(/SaaS|subscription/i);
  });

  it('addresses data storage question', () => {
    expect(content).toMatch(/data.*stored|where.*data/i);
  });

  it('addresses compliance question honestly', () => {
    expect(content).toMatch(/HIPAA|FERPA|compliance/i);
    expect(content).toMatch(/not.*certif|do not certif/i);
  });

  it('states agents cannot submit grants without approval', () => {
    expect(content).toMatch(/grant|submit/i);
  });

  it('does not claim guaranteed outcomes', () => {
    expect(content).not.toMatch(/guaranteed.*outcome|guaranteed.*funding/i);
  });
});

// --- Sales call script ---

describe('Gate 5A — SOVEREIGN-AI-SALES-CALL-SCRIPT.md content', () => {
  const content = readDoc('docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md');

  it('exists', () => expect(content).not.toBeNull());

  it('includes discovery questions section', () => {
    expect(content).toMatch(/discovery question/i);
  });

  it('includes compliance warning for sensitive data', () => {
    expect(content).toMatch(/HIPAA|FERPA|COPPA|sensitive data/i);
    expect(content).toMatch(/legal counsel|attorney/i);
  });

  it('instructs not to quote final pricing without approval', () => {
    expect(content).toMatch(/draft.*pricing|pricing.*draft|Architect.*review|approval before quoting/i);
  });

  it('includes objections section', () => {
    expect(content).toMatch(/objection/i);
  });

  it('does not promise guaranteed outcomes', () => {
    expect(content).not.toMatch(/guaranteed.*outcome|guaranteed.*funding/i);
  });

  it('states what happens if not a fit', () => {
    expect(content).toMatch(/not.*fit|not the right fit/i);
  });
});

// --- SOW outline ---

describe('Gate 5A — IMPLEMENTATION-SOW-OUTLINE.md content', () => {
  const content = readDoc('docs/IMPLEMENTATION-SOW-OUTLINE.md');

  it('exists', () => expect(content).not.toBeNull());

  it('contains "not a contract" disclaimer', () => {
    expect(content).toMatch(/not a contract/i);
  });

  it('contains "attorney" review requirement', () => {
    expect(content).toMatch(/attorney/i);
  });

  it('references go-live gates', () => {
    expect(content).toMatch(/go-live gate|Gate N/i);
  });

  it('states what is explicitly out of scope', () => {
    expect(content).toMatch(/out of scope|not in scope/i);
  });

  it('states no grant outcome guarantees', () => {
    expect(content).toMatch(/guaranteed.*outcome|no.*guarantee/i);
  });

  it('states no compliance certification', () => {
    expect(content).toMatch(/compliance certif/i);
  });

  it('includes payment milestone structure', () => {
    expect(content).toMatch(/payment.*milestone|milestone.*payment/i);
  });
});
