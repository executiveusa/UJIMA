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

const GATE3_DOCS = [
  'HOSTINGER-PHASE-9-STAGING.md',
  'VPS-BOOTSTRAP-RUNBOOK.md',
  'PRODUCTION-ENV-GENERATION.md',
  'CADDY-DOMAIN-MAP.md',
  'POSTGRES-MIGRATION-RUNBOOK.md',
  'PHASE-9-GO-LIVE-GATES.md',
];

// ── All six Gate 3 docs exist ────────────────────────────────────────────────

describe('Phase 9 Gate 3 required docs exist', () => {
  for (const doc of GATE3_DOCS) {
    it(`docs/${doc} exists`, () => {
      expect(docExists(doc)).toBe(true);
    });
  }
});

// ── Required headings exist ──────────────────────────────────────────────────

describe('HOSTINGER-PHASE-9-STAGING.md required headings', () => {
  const content = () => docContent('HOSTINGER-PHASE-9-STAGING.md');

  it('has target staging topology heading', () => {
    expect(content()).toMatch(/## Target staging topology/);
  });

  it('has domain model heading', () => {
    expect(content()).toMatch(/## Domain model/);
  });

  it('has services section', () => {
    expect(content()).toMatch(/## Services/);
  });

  it('lists all required topology services', () => {
    const c = content();
    for (const svc of ['Caddy', 'Mission API', 'Postgres', 'Hermes', 'LiteLLM', 'Langfuse', 'Open WebUI', 'ICM workspace', 'tenant data', 'backup']) {
      expect(c).toContain(svc);
    }
  });
});

describe('VPS-BOOTSTRAP-RUNBOOK.md required headings', () => {
  const content = () => docContent('VPS-BOOTSTRAP-RUNBOOK.md');

  it('documents all 19 bootstrap steps', () => {
    const c = content();
    for (let i = 1; i <= 19; i++) {
      expect(c).toMatch(new RegExp(`## Step ${i} `));
    }
  });

  it('final step requires docker compose up -d', () => {
    expect(content()).toContain('docker compose');
    expect(content()).toMatch(/up -d/);
  });
});

describe('PRODUCTION-ENV-GENERATION.md required headings', () => {
  const content = () => docContent('PRODUCTION-ENV-GENERATION.md');

  it('has required secret inventory section', () => {
    expect(content()).toMatch(/## Required secret inventory/);
  });

  it('has credential rotation checklist section', () => {
    expect(content()).toMatch(/## Credential rotation checklist/);
  });

  it('lists all required secrets', () => {
    const c = content();
    for (const secret of [
      'POSTGRES_PASSWORD', 'JWT_SECRET', 'DEMO_ADMIN_PASSWORD', 'MISSION_OS_OPERATOR_KEY',
      'HERMES_AGENT_KEY', 'LITELLM_MASTER_KEY', 'WEBUI_SECRET_KEY', 'NEXTAUTH_SECRET',
      'LANGFUSE_PUBLIC_KEY', 'LANGFUSE_SECRET_KEY', 'PROVIDER_API_KEYS', 'BACKUP_ENCRYPTION_KEY',
    ]) {
      expect(c).toContain(secret);
    }
  });

  it('shows openssl generation examples', () => {
    const c = content();
    expect(c).toContain('openssl rand -hex 32');
    expect(c).toContain('openssl rand -base64 48');
  });
});

describe('CADDY-DOMAIN-MAP.md required headings', () => {
  const content = () => docContent('CADDY-DOMAIN-MAP.md');

  it('has public routes section', () => {
    expect(content()).toMatch(/## Public routes/);
  });

  it('has protected routes section', () => {
    expect(content()).toMatch(/## Protected routes/);
  });

  it('has TLS behavior section', () => {
    expect(content()).toMatch(/## TLS behavior/);
  });

  it('documents where Caddyfile.managed comes from', () => {
    expect(content()).toMatch(/## Where `Caddyfile\.managed` comes from/);
  });

  it('documents how to replace demo-pnw.org placeholders', () => {
    expect(content()).toMatch(/## How to replace demo-pnw\.org placeholders/);
  });

  it('documents how to validate config before reload', () => {
    expect(content()).toMatch(/## How to validate Caddy config before reload/);
  });
});

describe('POSTGRES-MIGRATION-RUNBOOK.md required headings', () => {
  const content = () => docContent('POSTGRES-MIGRATION-RUNBOOK.md');

  it('has current state file-backed mode section', () => {
    expect(content()).toMatch(/## Current state: file-backed mode/);
  });

  it('has target postgres mode section', () => {
    expect(content()).toMatch(/## Target: Postgres mode/);
  });

  it('has migration order section', () => {
    expect(content()).toMatch(/## Migration order/);
  });

  it('has RLS check requirement section', () => {
    expect(content()).toMatch(/## RLS check requirement/);
  });

  it('has rollback plan section', () => {
    expect(content()).toMatch(/## Rollback plan/);
  });
});

describe('PHASE-9-GO-LIVE-GATES.md required headings', () => {
  const content = () => docContent('PHASE-9-GO-LIVE-GATES.md');

  it('documents all 14 gates A through N', () => {
    const c = content();
    const gateLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    for (const letter of gateLetters) {
      expect(c).toMatch(new RegExp(`## Gate ${letter} —`));
    }
  });

  it('each gate defines owner, commands, evidence, failure action, rollback', () => {
    const c = content();
    // Spot-check the field labels appear at least as many times as there are gates (14)
    const ownerCount = (c.match(/\| Owner \|/g) || []).length;
    const evidenceCount = (c.match(/\| Evidence required \|/g) || []).length;
    const failureCount = (c.match(/\| Failure action \|/g) || []).length;
    const rollbackCount = (c.match(/\| Rollback \/ stop condition \|/g) || []).length;
    expect(ownerCount).toBeGreaterThanOrEqual(14);
    expect(evidenceCount).toBeGreaterThanOrEqual(14);
    expect(failureCount).toBeGreaterThanOrEqual(14);
    expect(rollbackCount).toBeGreaterThanOrEqual(14);
  });

  it('has a summary table', () => {
    expect(content()).toMatch(/## Summary table/);
  });
});

// ── No real secrets in Gate 3 docs ───────────────────────────────────────────

describe('Gate 3 docs do not contain real secrets', () => {
  const SECRET_PATTERNS = [
    { name: 'operator key (ok_tenant_hex)', pattern: /\bok_[a-zA-Z0-9_-]+_[a-f0-9]{20,}\b/ },
    { name: 'provider key (sk-)', pattern: /\bsk-[A-Za-z0-9]{20,}\b/ },
    { name: 'raw hex secret assigned to a var (not command example)', pattern: /^[A-Z_]+=[a-f0-9]{32,}$/m },
  ];

  for (const doc of GATE3_DOCS) {
    for (const { name, pattern } of SECRET_PATTERNS) {
      it(`docs/${doc}: no "${name}"`, () => {
        const content = docContent(doc);
        expect(content).not.toMatch(pattern);
      });
    }
  }
});

// ── Docs do not claim live deployment is complete ────────────────────────────

describe('Gate 3 docs do not claim live deployment is complete', () => {
  const FORBIDDEN_LIVE_CLAIMS = [
    /live deployment is complete/i,
    /VPS is (now )?live/i,
    /successfully deployed to production/i,
    /Postgres (is|mode is) now live\b/i,
  ];

  for (const doc of GATE3_DOCS) {
    for (const claim of FORBIDDEN_LIVE_CLAIMS) {
      it(`docs/${doc}: no forbidden live-deployment claim (${claim})`, () => {
        const content = docContent(doc);
        if (!content) return;
        expect(content).not.toMatch(claim);
      });
    }
  }

  it('HOSTINGER-PHASE-9-STAGING.md explicitly states no live deployment occurred', () => {
    const content = docContent('HOSTINGER-PHASE-9-STAGING.md');
    expect(content).toMatch(/no live deployment/i);
  });

  it('POSTGRES-MIGRATION-RUNBOOK.md explicitly states Postgres runtime mode is not live', () => {
    const content = docContent('POSTGRES-MIGRATION-RUNBOOK.md');
    expect(content).toMatch(/Postgres runtime mode is not live/i);
  });
});

// ── Live commands require human approval ─────────────────────────────────────

describe('Live commands are marked as requiring human approval', () => {
  it('VPS-BOOTSTRAP-RUNBOOK.md marks every live command', () => {
    const content = docContent('VPS-BOOTSTRAP-RUNBOOK.md');
    const marker = 'LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES';
    const markerCount = content.split(marker).length - 1;
    expect(markerCount).toBeGreaterThanOrEqual(17);
  });

  it('CADDY-DOMAIN-MAP.md marks its live commands', () => {
    const content = docContent('CADDY-DOMAIN-MAP.md');
    expect(content).toContain('LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES');
  });

  it('PHASE-9-GO-LIVE-GATES.md Gate N requires final human signoff before any live command', () => {
    const content = docContent('PHASE-9-GO-LIVE-GATES.md');
    expect(content).toMatch(/Gate N — Final human signoff/);
    expect(content).toMatch(/docker compose up -d/);
  });
});

// ── Fresh credential generation and no old demo keys ─────────────────────────

describe('Gate 3 docs mention fresh credential generation and no old demo keys', () => {
  it('PRODUCTION-ENV-GENERATION.md requires fresh generation', () => {
    const content = docContent('PRODUCTION-ENV-GENERATION.md');
    expect(content).toMatch(/freshly generated/i);
  });

  it('PRODUCTION-ENV-GENERATION.md forbids old demo keys', () => {
    const content = docContent('PRODUCTION-ENV-GENERATION.md');
    expect(content).toMatch(/no old demo keys/i);
    expect(content).toContain('500c13b');
  });

  it('VPS-BOOTSTRAP-RUNBOOK.md instructs generating env on the VPS, not copying local values', () => {
    const content = docContent('VPS-BOOTSTRAP-RUNBOOK.md');
    expect(content).toMatch(/generated fresh on the VPS/i);
  });
});

// ── Protected/internal service boundaries ─────────────────────────────────────

describe('Gate 3 docs mention protected/internal service boundaries', () => {
  it('HOSTINGER-PHASE-9-STAGING.md marks agents/traces/models as protected', () => {
    const content = docContent('HOSTINGER-PHASE-9-STAGING.md');
    expect(content).toMatch(/protected\/internal/i);
    expect(content).toContain('agents.<client-domain>');
    expect(content).toContain('traces.<client-domain>');
    expect(content).toContain('models.<client-domain>');
  });

  it('CADDY-DOMAIN-MAP.md documents internal-only routes', () => {
    const content = docContent('CADDY-DOMAIN-MAP.md');
    expect(content).toMatch(/## Internal-only routes/);
    expect(content).toContain('127.0.0.1:8765');
  });

  it('PHASE-9-GO-LIVE-GATES.md Gate J checks Open WebUI access control', () => {
    const content = docContent('PHASE-9-GO-LIVE-GATES.md');
    expect(content).toMatch(/Gate J — Open WebUI access-control check/);
  });
});

// ── Postgres/RLS validation requirement ───────────────────────────────────────

describe('Gate 3 docs mention Postgres/RLS validation requirement', () => {
  it('POSTGRES-MIGRATION-RUNBOOK.md states RLS is not implemented', () => {
    const content = docContent('POSTGRES-MIGRATION-RUNBOOK.md');
    expect(content).toMatch(/no Postgres Row-Level Security \(RLS\) policies exist/i);
  });

  it('POSTGRES-MIGRATION-RUNBOOK.md has an RLS checklist', () => {
    const content = docContent('POSTGRES-MIGRATION-RUNBOOK.md');
    expect(content).toMatch(/Enable RLS on every tenant-scoped table/);
  });

  it('PHASE-9-GO-LIVE-GATES.md Gate F requires the Postgres migration/restore drill', () => {
    const content = docContent('PHASE-9-GO-LIVE-GATES.md');
    expect(content).toMatch(/Gate F — Postgres migration\/restore drill/);
  });
});

// ── Backup/restore drill is mandatory ─────────────────────────────────────────

describe('Gate 3 docs mention mandatory backup/restore drill', () => {
  it('POSTGRES-MIGRATION-RUNBOOK.md has a restore drill section', () => {
    const content = docContent('POSTGRES-MIGRATION-RUNBOOK.md');
    expect(content).toMatch(/## Restore drill/);
  });

  it('PHASE-9-GO-LIVE-GATES.md Gate K marks backup/restore mandatory', () => {
    const content = docContent('PHASE-9-GO-LIVE-GATES.md');
    expect(content).toMatch(/Gate K — Backup\/restore drill/);
    expect(content).toMatch(/mandatory/i);
  });
});

// ── Final human signoff ────────────────────────────────────────────────────────

describe('Gate 3 docs mention final human signoff', () => {
  it('PHASE-9-GO-LIVE-GATES.md has Gate N final human signoff', () => {
    const content = docContent('PHASE-9-GO-LIVE-GATES.md');
    expect(content).toMatch(/Gate N — Final human signoff/);
  });

  it('VPS-BOOTSTRAP-RUNBOOK.md Step 19 requires human approval before docker compose up', () => {
    const content = docContent('VPS-BOOTSTRAP-RUNBOOK.md');
    expect(content).toMatch(/## Step 19 — Only after human approval: docker compose up -d/);
  });
});

// ── Gate 3 docs are cross-referenced from existing docs ───────────────────────

describe('Existing docs reference the new Gate 3 staging docs', () => {
  it('HOSTINGER-VPS-HANDOFF.md references the Phase 9 staging docs', () => {
    const p = path.join(ROOT, 'HOSTINGER-VPS-HANDOFF.md');
    const content = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    expect(content).toContain('HOSTINGER-PHASE-9-STAGING.md');
  });

  it('SOVEREIGN-AI-CLIENT-STACK.md references the Gate 3 staging docs', () => {
    const content = docContent('SOVEREIGN-AI-CLIENT-STACK.md');
    expect(content).toContain('HOSTINGER-PHASE-9-STAGING.md');
  });

  it('PRODUCTION-GAPS.md references Gate 3 staging status', () => {
    const content = docContent('PRODUCTION-GAPS.md');
    expect(content).toMatch(/Gate 3/);
  });
});
