import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const docs = (name) => path.join(ROOT, 'docs', name);
const scripts = (name) => path.join(ROOT, 'scripts', name);
const read = (name) => fs.readFileSync(docs(name), 'utf8');

// ─── Document existence ───────────────────────────────────────────────────────

describe('Gate 6A — document existence', () => {
  it('live staging preparation pack master index exists', () => {
    expect(fs.existsSync(docs('LIVE-STAGING-PREPARATION-PACK.md'))).toBe(true);
  });
  it('VPS and domain intake form exists', () => {
    expect(fs.existsSync(docs('VPS-DOMAIN-INTAKE-FORM.md'))).toBe(true);
  });
  it('live staging preflight checklist exists', () => {
    expect(fs.existsSync(docs('LIVE-STAGING-PREFLIGHT-CHECKLIST.md'))).toBe(true);
  });
  it('deployment-day runbook exists', () => {
    expect(fs.existsSync(docs('DEPLOYMENT-DAY-RUNBOOK.md'))).toBe(true);
  });
  it('staging rollback runbook exists', () => {
    expect(fs.existsSync(docs('STAGING-ROLLBACK-RUNBOOK.md'))).toBe(true);
  });
  it('first live client safety checklist exists', () => {
    expect(fs.existsSync(docs('FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md'))).toBe(true);
  });
  it('environment readiness validator spec exists', () => {
    expect(fs.existsSync(docs('ENVIRONMENT-READINESS-VALIDATOR-SPEC.md'))).toBe(true);
  });
  it('local readiness script exists', () => {
    expect(fs.existsSync(scripts('phase9-live-staging-readiness.mjs'))).toBe(true);
  });
});

// ─── Preparation pack — no live deployment claim ──────────────────────────────

describe('Gate 6A — preparation pack no live deployment', () => {
  const pack = () => read('LIVE-STAGING-PREPARATION-PACK.md');

  it('states Gate 6A does not perform live deployment', () => {
    expect(pack()).toMatch(/Gate 6A does not perform live deployment/i);
  });
  it('states live staging requires separate Architect approval', () => {
    expect(pack()).toMatch(/Architect approval|separate.*Architect/i);
  });
  it('lists required inputs before live staging', () => {
    expect(pack()).toMatch(/Required inputs before live staging/i);
  });
  it('does not SSH into any VPS', () => {
    expect(pack()).toMatch(/Does not SSH/i);
  });
  it('does not change DNS', () => {
    expect(pack()).toMatch(/Does not change DNS/i);
  });
  it('does not generate real secrets', () => {
    expect(pack()).toMatch(/Does not generate real secrets/i);
  });
  it('references Gate 6B as the live staging gate', () => {
    expect(pack()).toMatch(/Gate 6B/);
  });
});

// ─── Intake form — forbids private keys, passwords, tokens ───────────────────

describe('Gate 6A — intake form secret safety', () => {
  const form = () => read('VPS-DOMAIN-INTAKE-FORM.md');

  it('forbids pasting private SSH keys', () => {
    expect(form()).toMatch(/Do not paste private SSH keys/i);
  });
  it('forbids pasting passwords', () => {
    expect(form()).toMatch(/Do not paste passwords/i);
  });
  it('forbids pasting API keys', () => {
    expect(form()).toMatch(/Do not paste API keys/i);
  });
  it('forbids pasting tokens', () => {
    expect(form()).toMatch(/Do not paste tokens/i);
  });
  it('contains placeholder for client name', () => {
    expect(form()).toMatch(/\[CLIENT_NAME\]/);
  });
  it('contains placeholder for VPS provider', () => {
    expect(form()).toMatch(/\[VPS_PROVIDER\]/);
  });
  it('contains placeholder for SSH user', () => {
    expect(form()).toMatch(/\[SSH_USER\]/);
  });
  it('contains compliance flags section', () => {
    expect(form()).toMatch(/HIPAA|FERPA|COPPA/);
  });
  it('requires operator confirmation that no secrets appear in form', () => {
    expect(form()).toMatch(/no private keys.*passwords|no.*secrets.*appear|passwords.*API key values/i);
  });
});

// ─── Preflight checklist — hard gates ────────────────────────────────────────

describe('Gate 6A — preflight checklist hard gates', () => {
  const checklist = () => read('LIVE-STAGING-PREFLIGHT-CHECKLIST.md');

  it('has hard gate for repository clean state', () => {
    expect(checklist()).toMatch(/Repository.*clean|repo.*clean|working tree.*clean/i);
  });
  it('has hard gate for CI green', () => {
    expect(checklist()).toMatch(/CI green/i);
  });
  it('has hard gate for secret audit', () => {
    expect(checklist()).toMatch(/Secret audit/i);
  });
  it('has hard gate for VPS ownership confirmed', () => {
    expect(checklist()).toMatch(/VPS ownership/i);
  });
  it('has hard gate for DNS ownership confirmed', () => {
    expect(checklist()).toMatch(/DNS ownership/i);
  });
  it('has hard gate for SSH key fingerprint recorded', () => {
    expect(checklist()).toMatch(/SSH key fingerprint/i);
  });
  it('has hard gate for backup plan selected', () => {
    expect(checklist()).toMatch(/Backup plan/i);
  });
  it('has hard gate for client operator named', () => {
    expect(checklist()).toMatch(/Client operator named/i);
  });
  it('has hard gate for go-live approver named', () => {
    expect(checklist()).toMatch(/Go-live approver named/i);
  });
  it('has hard gate for legal and compliance flags', () => {
    expect(checklist()).toMatch(/Legal.*compliance|compliance.*flags/i);
  });
  it('has hard gate for pricing and scope approved', () => {
    expect(checklist()).toMatch(/Pricing.*scope approved|scope.*approved/i);
  });
  it('has hard gate for rollback plan reviewed', () => {
    expect(checklist()).toMatch(/Rollback plan reviewed/i);
  });
  it('has hard gate for human approval recorded', () => {
    expect(checklist()).toMatch(/Human approval recorded/i);
  });
  it('states Gate 6B cannot begin without hard gates passing', () => {
    expect(checklist()).toMatch(/Gate 6B cannot begin/i);
  });
});

// ─── Deployment-day runbook — live commands gated ────────────────────────────

describe('Gate 6A — deployment-day runbook live command labeling', () => {
  const runbook = () => read('DEPLOYMENT-DAY-RUNBOOK.md');

  it('marks live commands with Architect approval warning', () => {
    expect(runbook()).toMatch(/LIVE COMMAND.*DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B/i);
  });
  it('has SSH hardening step', () => {
    expect(runbook()).toMatch(/SSH.*harden|harden.*SSH/i);
  });
  it('has firewall configuration step', () => {
    expect(runbook()).toMatch(/firewall/i);
  });
  it('has secret generation step', () => {
    expect(runbook()).toMatch(/Generate secrets/i);
  });
  it('secret generation step states secrets not recorded in docs', () => {
    expect(runbook()).toMatch(/never written.*document|never.*recorded here|do not.*save elsewhere/i);
  });
  it('has DNS record creation step', () => {
    expect(runbook()).toMatch(/DNS.*A record|Create.*A record/i);
  });
  it('has TLS verification step', () => {
    expect(runbook()).toMatch(/TLS|HTTPS/i);
  });
  it('has rollback trigger section', () => {
    expect(runbook()).toMatch(/Rollback trigger/i);
  });
  it('references the rollback runbook', () => {
    expect(runbook()).toMatch(/STAGING-ROLLBACK-RUNBOOK/);
  });
  it('references first live client safety checklist', () => {
    expect(runbook()).toMatch(/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST/);
  });
  it('does not perform live deployment in this document alone', () => {
    expect(runbook()).toMatch(/do not execute|not.*executed.*during Gate 6A|authored during Gate 6A/i);
  });
});

// ─── Rollback runbook — triggers and restore verification ────────────────────

describe('Gate 6A — rollback runbook completeness', () => {
  const rollback = () => read('STAGING-ROLLBACK-RUNBOOK.md');

  it('lists rollback triggers', () => {
    expect(rollback()).toMatch(/Rollback triggers/i);
  });
  it('includes Docker container failure as a trigger', () => {
    expect(rollback()).toMatch(/Docker.*fail|container.*fail/i);
  });
  it('includes TLS failure as a trigger', () => {
    expect(rollback()).toMatch(/TLS.*fail|TLS.*not functional/i);
  });
  it('includes smoke test failure as a trigger', () => {
    expect(rollback()).toMatch(/smoke test.*fail/i);
  });
  it('includes secret exposure as a trigger', () => {
    expect(rollback()).toMatch(/secret.*logged|secret.*committed|secret.*printed/i);
  });
  it('includes restore verification steps', () => {
    expect(rollback()).toMatch(/Restore verification/i);
  });
  it('includes post-rollback report', () => {
    expect(rollback()).toMatch(/Post-rollback report/i);
  });
  it('states rollback must be tested in staging before production', () => {
    expect(rollback()).toMatch(/Rollback must be tested in staging before production/i);
  });
  it('states rollback does not require Architect pre-approval', () => {
    expect(rollback()).toMatch(/does not require Architect.*pre-approval|Architect pre-approval/i);
  });
});

// ─── First live client safety checklist — hard blocks ────────────────────────

describe('Gate 6A — first live client safety checklist hard blocks', () => {
  const safety = () => read('FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md');

  it('blocks grant submission on day one', () => {
    expect(safety()).toMatch(/no grant submission|grant submission.*block/i);
  });
  it('blocks legal or financial filing on day one', () => {
    expect(safety()).toMatch(/no legal.*filing|legal.*financial filing.*block/i);
  });
  it('blocks outbound messaging on day one', () => {
    expect(safety()).toMatch(/no.*outbound.*messaging|outbound messaging.*day one/i);
  });
  it('blocks public publishing on day one', () => {
    expect(safety()).toMatch(/no public publishing|public publishing.*block/i);
  });
  it('blocks sensitive data ingestion until policy reviewed', () => {
    expect(safety()).toMatch(/sensitive data.*policy.*reviewed|no.*sensitive data.*until/i);
  });
  it('blocks external integrations beyond approved list', () => {
    expect(safety()).toMatch(/approved.*integration|approved list/i);
  });
  it('requires dry-run demo before first real client session', () => {
    expect(safety()).toMatch(/dry-run demo/i);
  });
  it('requires staff approval workflow tested', () => {
    expect(safety()).toMatch(/staff approval.*tested|approval workflow.*tested/i);
  });
  it('requires operator can pause agents', () => {
    expect(safety()).toMatch(/operator can pause.*agents|pause.*agents/i);
  });
  it('requires backup and restore drill', () => {
    expect(safety()).toMatch(/backup.*restore.*drill|restore drill/i);
  });
  it('requires client owns all credentials', () => {
    expect(safety()).toMatch(/client owns all credentials|client holds.*credentials/i);
  });
  it('documents Asc3nd access boundaries', () => {
    expect(safety()).toMatch(/Asc3nd access boundaries/i);
  });
  it('states Hermes is in dry-run mode until activation', () => {
    expect(safety()).toMatch(/Hermes.*dry-run mode/i);
  });
});

// ─── Environment validator spec — required checks ─────────────────────────────

describe('Gate 6A — environment readiness validator spec', () => {
  const spec = () => read('ENVIRONMENT-READINESS-VALIDATOR-SPEC.md');

  it('defines local phase (Phase L)', () => {
    expect(spec()).toMatch(/Phase L.*Local|Phase L.*local/i);
  });
  it('defines remote phase (Phase R)', () => {
    expect(spec()).toMatch(/Phase R.*Remote|Phase R.*remote/i);
  });
  it('specifies required env names check', () => {
    expect(spec()).toMatch(/required env names|Required env names/i);
  });
  it('specifies placeholder values rejected check', () => {
    expect(spec()).toMatch(/Placeholder values rejected|placeholder.*rejected/i);
  });
  it('specifies weak JWT rejected check', () => {
    expect(spec()).toMatch(/Weak JWT rejected|JWT.*rejected/i);
  });
  it('specifies default password rejected check', () => {
    expect(spec()).toMatch(/default.*password rejected|default Postgres password/i);
  });
  it('specifies API keys not printed in logs', () => {
    expect(spec()).toMatch(/API keys not printed|keys not printed in logs/i);
  });
  it('specifies file permissions check', () => {
    expect(spec()).toMatch(/File permissions|file.*permissions/i);
  });
  it('specifies Caddyfile placeholder check', () => {
    expect(spec()).toMatch(/Caddyfile.*placeholder|placeholder.*Caddyfile/i);
  });
  it('specifies Docker Compose config validation', () => {
    expect(spec()).toMatch(/Docker Compose config/i);
  });
  it('specifies backup path writable check', () => {
    expect(spec()).toMatch(/backup path writable|Backup path writable/i);
  });
  it('specifies tenant data path writable check', () => {
    expect(spec()).toMatch(/Tenant data path writable|tenant.*writable/i);
  });
  it('specifies ICM path writable check', () => {
    expect(spec()).toMatch(/ICM path writable|ICM.*writable/i);
  });
  it('defines JSON output format', () => {
    expect(spec()).toMatch(/Output format|output format/i);
  });
  it('states Phase R is not yet implemented', () => {
    expect(spec()).toMatch(/not yet implemented|future.*implementation/i);
  });
});

// ─── Local readiness script — no network/SSH/DNS/Docker ──────────────────────

describe('Gate 6A — local readiness script safety', () => {
  const script = () => fs.readFileSync(scripts('phase9-live-staging-readiness.mjs'), 'utf8');

  it('states it is LOCAL ONLY in a comment', () => {
    expect(script()).toMatch(/LOCAL ONLY/i);
  });
  it('states no network calls', () => {
    expect(script()).toMatch(/No network|no network/i);
  });
  it('states no SSH calls', () => {
    expect(script()).toMatch(/No SSH|no SSH/i);
  });
  it('states no DNS calls', () => {
    expect(script()).toMatch(/No DNS|no DNS/i);
  });
  it('states no Docker calls', () => {
    expect(script()).toMatch(/No Docker|no Docker/i);
  });
  it('does not import or use http, https, or fetch modules', () => {
    const content = script();
    expect(content).not.toMatch(/require\(['"]https?['"]\)|import.*from ['"]https?['"]/);
    expect(content).not.toMatch(/\bfetch\s*\(/);
  });
  it('does not import or use ssh2 module', () => {
    expect(script()).not.toMatch(/require\(['"]ssh2['"]\)|import.*from ['"]ssh2['"]/);
  });
  it('does not use docker commands in execSync', () => {
    expect(script()).not.toMatch(/execSync\(['"`]docker/);
  });
  it('outputs JSON summary', () => {
    expect(script()).toMatch(/JSON\.stringify/);
  });
  it('exits nonzero on failure', () => {
    expect(script()).toMatch(/process\.exit\(1\)/);
  });
});

// ─── Cross-doc: no real secrets, no fake domains ──────────────────────────────

describe('Gate 6A — no real secrets or fake domains in Gate 6A docs', () => {
  const gate6aDocs = [
    'LIVE-STAGING-PREPARATION-PACK.md',
    'VPS-DOMAIN-INTAKE-FORM.md',
    'LIVE-STAGING-PREFLIGHT-CHECKLIST.md',
    'DEPLOYMENT-DAY-RUNBOOK.md',
    'STAGING-ROLLBACK-RUNBOOK.md',
    'FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md',
    'ENVIRONMENT-READINESS-VALIDATOR-SPEC.md',
  ];

  gate6aDocs.forEach((docName) => {
    it(`${docName} contains no TODO or FIXME stubs`, () => {
      const content = read(docName);
      expect(content).not.toMatch(/\bTODO\b|\bFIXME\b/);
    });
  });

  gate6aDocs.forEach((docName) => {
    it(`${docName} does not contain obvious fake domain names used as if real`, () => {
      const content = read(docName);
      // example.org is allowed as a placeholder domain example — not a fake real domain claim
      // Reject hardcoded "real" nonprofit domain patterns that shouldn't appear here
      expect(content).not.toMatch(/brightfuturesnpo\.org|sunrisehelping\.org|helpinghandsinc\.org/i);
    });
  });
});

// ─── Cross-doc: Gate 6A does not claim live deployment ───────────────────────

describe('Gate 6A — docs do not claim live deployment', () => {
  const gate6aDocs = [
    'LIVE-STAGING-PREPARATION-PACK.md',
    'VPS-DOMAIN-INTAKE-FORM.md',
    'LIVE-STAGING-PREFLIGHT-CHECKLIST.md',
    'FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md',
    'ENVIRONMENT-READINESS-VALIDATOR-SPEC.md',
  ];

  gate6aDocs.forEach((docName) => {
    it(`${docName} does not claim the system is currently live`, () => {
      const content = read(docName);
      expect(content).not.toMatch(/currently live|system is live|already deployed to production/i);
    });
  });
});
