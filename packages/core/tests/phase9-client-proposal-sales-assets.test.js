import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const docs = (name) => path.join(ROOT, 'docs', name);
const read = (name) => fs.readFileSync(docs(name), 'utf8');

// ─── Document existence ───────────────────────────────────────────────────────

describe('Gate 5B — document existence', () => {
  it('client proposal package master index exists', () => {
    expect(fs.existsSync(docs('CLIENT-PROPOSAL-PACKAGE.md'))).toBe(true);
  });
  it('client proposal template exists', () => {
    expect(fs.existsSync(docs('CLIENT-PROPOSAL-TEMPLATE.md'))).toBe(true);
  });
  it('proposal builder runbook exists', () => {
    expect(fs.existsSync(docs('PROPOSAL-BUILDER-RUNBOOK.md'))).toBe(true);
  });
  it('discovery intake form exists', () => {
    expect(fs.existsSync(docs('DISCOVERY-INTAKE-FORM.md'))).toBe(true);
  });
  it('client readiness scoring rubric exists', () => {
    expect(fs.existsSync(docs('CLIENT-READINESS-SCORING-RUBRIC.md'))).toBe(true);
  });
  it('one-page pitch template exists', () => {
    expect(fs.existsSync(docs('ONE-PAGE-PITCH-TEMPLATE.md'))).toBe(true);
  });
  it('follow-up email templates exist', () => {
    expect(fs.existsSync(docs('FOLLOW-UP-EMAIL-TEMPLATES.md'))).toBe(true);
  });
  it('mission OS demo path exists', () => {
    expect(fs.existsSync(docs('MISSION-OS-DEMO-PATH.md'))).toBe(true);
  });
});

// ─── Proposal template — placeholder safety ───────────────────────────────────

describe('Gate 5B — proposal template placeholder safety', () => {
  const template = () => read('CLIENT-PROPOSAL-TEMPLATE.md');

  it('contains CLIENT_NAME placeholder', () => {
    expect(template()).toMatch(/\[CLIENT_NAME\]/);
  });
  it('contains CLIENT_OPERATOR placeholder', () => {
    expect(template()).toMatch(/\[CLIENT_OPERATOR\]/);
  });
  it('uses DRAFT pricing placeholder, not final price', () => {
    expect(template()).toMatch(/DRAFT_PRICE_RANGE_REQUIRES_APPROVAL/);
  });
  it('does not contain fake client names (Bright Futures, Sunrise, Helping Hands)', () => {
    // Real example org names should not be hardcoded as if real clients
    expect(template()).not.toMatch(/Bright Futures Community Center|Sunrise Nonprofit|Helping Hands Inc/i);
  });
  it('includes client-owned stack section', () => {
    expect(template()).toMatch(/client.owned|you own|ownership/i);
  });
  it('includes out-of-scope section', () => {
    expect(template()).toMatch(/out.of.scope|not included/i);
  });
  it('does not make positive guarantee claims about grant funding or donation outcomes', () => {
    // Allow negations like "does not guarantee funding" and "Guaranteed outcomes" in out-of-scope lists
    expect(template()).not.toMatch(/Asc3nd guarantees.*grant|Mission OS guarantees.*funding|we guarantee.*donation/i);
  });
  it('does not claim HIPAA or FERPA certification', () => {
    expect(template()).not.toMatch(/Mission OS is (?:HIPAA|FERPA|COPPA) certified|provides compliance certification/i);
  });
  it('does not claim live deployment', () => {
    expect(template()).not.toMatch(/currently live|already deployed to production/i);
  });
});

// ─── Runbook — Architect approval requirement ─────────────────────────────────

describe('Gate 5B — runbook approval requirements', () => {
  const runbook = () => read('PROPOSAL-BUILDER-RUNBOOK.md');

  it('requires Architect approval before sending proposal', () => {
    expect(runbook()).toMatch(/Architect approval|do not send.*without Architect/i);
  });
  it('requires human approval before quoting pricing', () => {
    expect(runbook()).toMatch(/human approval|Architect.*pric|pric.*human approval/i);
  });
  it('documents the not-a-fit path', () => {
    expect(runbook()).toMatch(/not a fit|not the right fit/i);
  });
  it('references compliance check step', () => {
    expect(runbook()).toMatch(/HIPAA|FERPA|COPPA|compliance/i);
  });
});

// ─── Discovery form — compliance flags ───────────────────────────────────────

describe('Gate 5B — discovery form compliance flags', () => {
  const form = () => read('DISCOVERY-INTAKE-FORM.md');

  it('contains HIPAA flag', () => {
    expect(form()).toMatch(/HIPAA/);
  });
  it('contains FERPA flag', () => {
    expect(form()).toMatch(/FERPA/);
  });
  it('contains COPPA flag', () => {
    expect(form()).toMatch(/COPPA/);
  });
  it('contains immigration status flag', () => {
    expect(form()).toMatch(/immigration/i);
  });
  it('contains red flags section', () => {
    expect(form()).toMatch(/Red flag|red flag/i);
  });
  it('contains scoring section', () => {
    expect(form()).toMatch(/Score|Scoring/i);
  });
  it('references readiness rubric', () => {
    expect(form()).toMatch(/CLIENT-READINESS-SCORING-RUBRIC/);
  });
});

// ─── Readiness rubric — green/yellow/red structure ───────────────────────────

describe('Gate 5B — readiness rubric scoring structure', () => {
  const rubric = () => read('CLIENT-READINESS-SCORING-RUBRIC.md');

  it('has green / proceed to proposal band', () => {
    expect(rubric()).toMatch(/Green.*Proceed|Proceed.*proposal/i);
  });
  it('has yellow / conditional band', () => {
    expect(rubric()).toMatch(/Yellow.*Proceed.*conditions|Proceed with conditions/i);
  });
  it('has red / do not proceed band', () => {
    expect(rubric()).toMatch(/Red.*Do not proceed|Do not proceed/i);
  });
  it('requires legal review for HIPAA/FERPA/COPPA', () => {
    expect(rubric()).toMatch(/legal.*counsel|legal review/i);
  });
  it('scores data sensitivity as a dimension', () => {
    expect(rubric()).toMatch(/Data sensitivity/i);
  });
  it('requires Architect review for all proposals', () => {
    expect(rubric()).toMatch(/Architect review/i);
  });
});

// ─── One-page pitch — safety claims ──────────────────────────────────────────

describe('Gate 5B — one-page pitch safety claims', () => {
  const pitch = () => read('ONE-PAGE-PITCH-TEMPLATE.md');

  it('requires human approval for all sensitive actions', () => {
    expect(pitch()).toMatch(/human appr|human review|staff.*appr/i);
  });
  it('does not use forced SaaS subscription language', () => {
    expect(pitch()).not.toMatch(/monthly subscription.*required|must pay monthly|no way to cancel/i);
  });
  it('uses DRAFT pricing placeholder', () => {
    expect(pitch()).toMatch(/DRAFT_PRICE_RANGE_REQUIRES_APPROVAL/);
  });
  it('includes ownership transfer language', () => {
    // Pitch uses "[CLIENT_NAME] owns after setup" and "Your server / Your source code" pattern
    expect(pitch()).toMatch(/owns after setup|Your server|Your source code/i);
  });
  it('does not make positive guarantee claims about grant funding', () => {
    // Allow negations like "does not guarantee grant funding" in the disclaimer
    expect(pitch()).not.toMatch(/Asc3nd guarantees.*grant|Mission OS guarantees.*funding|we guarantee.*grant/i);
  });
  it('requires Architect approval before delivery', () => {
    expect(pitch()).toMatch(/Architect approval|before.*delivery|before.*client/i);
  });
});

// ─── Email templates — no false urgency or fake scarcity ─────────────────────

describe('Gate 5B — email templates no false urgency or fake scarcity', () => {
  const emails = () => read('FOLLOW-UP-EMAIL-TEMPLATES.md');

  it('prohibits false urgency', () => {
    expect(emails()).toMatch(/No false urgency|false urgency/i);
  });
  it('prohibits fake scarcity', () => {
    expect(emails()).toMatch(/No fake scarcity|fake scarcity/i);
  });
  it('prohibits guaranteed outcomes', () => {
    expect(emails()).toMatch(/No guaranteed outcomes|guaranteed outcomes/i);
  });
  it('includes no-fit template', () => {
    expect(emails()).toMatch(/not a fit|not the right fit/i);
  });
  it('includes proposal delivery template', () => {
    expect(emails()).toMatch(/proposal delivery|Proposal delivery/i);
  });
  it('uses contact placeholders not hardcoded names', () => {
    expect(emails()).toMatch(/\[CONTACT_FIRST_NAME\]/);
    expect(emails()).toMatch(/\[CLIENT_NAME\]/);
  });
});

// ─── Demo path — safety requirements ─────────────────────────────────────────

describe('Gate 5B — demo path safety requirements', () => {
  const demo = () => read('MISSION-OS-DEMO-PATH.md');

  it('requires demo tenant data only', () => {
    expect(demo()).toMatch(/demo tenant|demo.*data only|fictional.*data/i);
  });
  it('prohibits showing real client data without permission', () => {
    expect(demo()).toMatch(/real client data.*permission|without.*permission/i);
  });
  it('prohibits claiming live deployment without go-live evidence', () => {
    expect(demo()).toMatch(/go-live.*evidence|live.*evidence|do not claim live/i);
  });
  it('prohibits compliance certification claims', () => {
    expect(demo()).toMatch(/not.*HIPAA.*certified|not.*certified|no compliance.*promise/i);
  });
  it('includes what not to claim section', () => {
    expect(demo()).toMatch(/What not to claim|what NOT to claim/i);
  });
  it('includes what not to show section', () => {
    expect(demo()).toMatch(/What not to show|what NOT to show/i);
  });
  it('does not make affirmative promises about AI output quality', () => {
    // Only reject affirmative first-person guarantees — not "do not claim" warnings
    expect(demo()).not.toMatch(/Asc3nd guarantees.*quality|Mission OS guarantees.*quality|we guarantee.*accurate output/i);
  });
});

// ─── Objections — sovereign AI section exists ─────────────────────────────────

describe('Gate 5B — objections doc sovereign AI section', () => {
  const obj = () => read('OBJECTIONS.md');

  it('has sovereign AI / client-owned stack section', () => {
    expect(obj()).toMatch(/Sovereign AI|Client-Owned Stack/i);
  });
  it('addresses "why not just use ChatGPT" objection', () => {
    expect(obj()).toMatch(/ChatGPT/i);
  });
  it('addresses VPS ownership objection', () => {
    expect(obj()).toMatch(/VPS|server/i);
  });
  it('addresses technical staff objection', () => {
    expect(obj()).toMatch(/technical staff|no.*technical/i);
  });
  it('addresses Asc3nd continuity objection', () => {
    expect(obj()).toMatch(/Asc3nd.*go|goes out of business|MIT license/i);
  });
  it('does not guarantee grant outcomes in objection responses', () => {
    expect(obj()).not.toMatch(/guarantee.*grant|guarantee.*fund/i);
  });
});

// ─── Sales demo flow — Gate 5B cross-links ────────────────────────────────────

describe('Gate 5B — sales demo flow cross-links', () => {
  const flow = () => read('SALES-DEMO-FLOW.md');

  it('references MISSION-OS-DEMO-PATH.md', () => {
    expect(flow()).toMatch(/MISSION-OS-DEMO-PATH/);
  });
  it('references DISCOVERY-INTAKE-FORM.md', () => {
    expect(flow()).toMatch(/DISCOVERY-INTAKE-FORM/);
  });
  it('references CLIENT-READINESS-SCORING-RUBRIC.md', () => {
    expect(flow()).toMatch(/CLIENT-READINESS-SCORING-RUBRIC/);
  });
  it('references CLIENT-PROPOSAL-TEMPLATE.md', () => {
    expect(flow()).toMatch(/CLIENT-PROPOSAL-TEMPLATE/);
  });
  it('references FOLLOW-UP-EMAIL-TEMPLATES.md', () => {
    expect(flow()).toMatch(/FOLLOW-UP-EMAIL-TEMPLATES/);
  });
  it('references PROPOSAL-BUILDER-RUNBOOK.md', () => {
    expect(flow()).toMatch(/PROPOSAL-BUILDER-RUNBOOK/);
  });
});

// ─── Cross-doc: no TODO/TBD/stub placeholders ─────────────────────────────────

describe('Gate 5B — no incomplete placeholder stubs in Gate 5B docs', () => {
  const gate5bDocs = [
    'CLIENT-PROPOSAL-PACKAGE.md',
    'CLIENT-PROPOSAL-TEMPLATE.md',
    'PROPOSAL-BUILDER-RUNBOOK.md',
    'DISCOVERY-INTAKE-FORM.md',
    'CLIENT-READINESS-SCORING-RUBRIC.md',
    'ONE-PAGE-PITCH-TEMPLATE.md',
    'FOLLOW-UP-EMAIL-TEMPLATES.md',
    'MISSION-OS-DEMO-PATH.md',
  ];

  gate5bDocs.forEach((docName) => {
    it(`${docName} contains no TODO or FIXME stubs`, () => {
      const content = read(docName);
      expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
    });
  });
});
