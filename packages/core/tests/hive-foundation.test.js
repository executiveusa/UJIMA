import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hive = path.join(root, 'control-plane', 'hive');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(hive, relativePath), 'utf8'));
}

describe('Agenix Hive foundation', () => {
  it('ships the constitution and all v0 contracts', () => {
    const required = [
      'HIVE-CONSTITUTION.md',
      'contracts/capability-manifest.schema.json',
      'contracts/event-envelope.schema.json',
      'contracts/work-order.schema.json',
      'contracts/evidence-receipt.schema.json',
      'contracts/state-ownership.v0.json',
    ];
    for (const relative of required) {
      expect(fs.existsSync(path.join(hive, relative)), relative).toBe(true);
    }
  });

  it('locks one owner and database-aligned write policy for every declared state domain', () => {
    const ownership = readJson('contracts/state-ownership.v0.json');
    expect(ownership.version).toBe('v0');
    const domains = ownership.domains.map((item) => item.domain);
    expect(new Set(domains).size).toBe(domains.length);
    expect(domains).toContain('federation_record');
    for (const item of ownership.domains) {
      expect(item.owner).toBeTruthy();
      expect(item.write_policy).toBeTypeOf('object');
      expect(item.write_policy.cross_provider_write).toBeTruthy();
    }
    expect(ownership.domains.find((item) => item.domain === 'video_project_state').write_policy)
      .toEqual({ cross_provider_write: 'operations_only' });
  });

  it('requires correlation and idempotency on cross-provider events', () => {
    const schema = readJson('contracts/event-envelope.schema.json');
    expect(schema.required).toEqual(expect.arrayContaining([
      'event_id', 'correlation_id', 'source', 'event_type', 'idempotency_key', 'payload',
    ]));
  });

  it('requires budget, acceptance and evidence on work orders', () => {
    const schema = readJson('contracts/work-order.schema.json');
    expect(schema.required).toEqual(expect.arrayContaining([
      'correlation_id', 'capability', 'owner_provider', 'approval_mode',
      'budget', 'acceptance', 'evidence_required',
    ]));
  });

  it('requires verification proof before a receipt can represent completion', () => {
    const schema = readJson('contracts/evidence-receipt.schema.json');
    expect(schema.required).toEqual(expect.arrayContaining([
      'status', 'summary', 'tests', 'artifacts', 'cost', 'verification', 'signed_at',
    ]));
    expect(schema.properties.status.enum).toEqual(['pass', 'fail', 'partial', 'blocked']);
  });

  it('records portable and history-preserving foundation migrations', () => {
    const foundation = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_foundation_v0.sql'),
      'utf8',
    );
    const indexes = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_foundation_v0_indexes.sql'),
      'utf8',
    );
    const federationOwnership = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_federation_state_domain_v0.sql'),
      'utf8',
    );
    const eventSourceHardening = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_event_source_hardening_v0.sql'),
      'utf8',
    );
    const reviewHardening = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_review_hardening_v0.sql'),
      'utf8',
    );

    expect(foundation).toContain('create schema agenix_hive;');
    expect(foundation).toContain('create table agenix_hive.resource_leases');
    expect(foundation).toContain('create table agenix_hive.evidence_receipts');
    expect(foundation).toContain('alter table agenix_hive.events enable row level security;');
    expect(foundation).toContain("to_regclass('platform.app_registry') is not null");
    expect(foundation).not.toContain("'project_ref','cyxdevcjycmffhmwxojh'");
    expect(indexes).toContain('agenix_hive_runs_correlation_idx');
    expect(indexes).toContain('(select auth.uid())');
    expect(federationOwnership).toContain("'federation_record'");
    expect(federationOwnership).toContain("'agenix-governor'");
    expect(eventSourceHardening).toContain('alter column source_provider_id set not null');
    expect(reviewHardening).toContain('on delete restrict');
    expect(reviewHardening).toContain('source_provider_key text');
    expect(reviewHardening).toContain('events_source_provider_key_idempotency_key_key');
    expect(reviewHardening).toContain("metadata = metadata - 'project_ref'");
  });
});

describe('Agenix Hive provider registry', () => {
  const manifestNames = [
    'agenix-governor',
    'paperclip-hq',
    'darya-openhands',
    'montage',
    'open-interpreter',
  ];

  it('ships one central manifest for each initial provider', () => {
    const contract = readJson('contracts/capability-manifest.schema.json');
    const allowedHealthModes = new Set(['http', 'mcp', 'cli', 'heartbeat', 'none']);
    for (const name of manifestNames) {
      const manifest = readJson(`providers/${name}.capabilities.json`);
      expect(manifest.id).toBe(name);
      expect(new Set(manifest.capabilities).size).toBe(manifest.capabilities.length);
      for (const field of contract.required) {
        expect(manifest[field], `${name}.${field}`).not.toBeUndefined();
      }
      expect(allowedHealthModes.has(manifest.health.mode), `${name}.health.mode`).toBe(true);
      expect(manifest.evidence.receipt_version).toBe('v0');
    }
  });

  it('keeps canonical domain ownership aligned with provider manifests', () => {
    const ownership = readJson('contracts/state-ownership.v0.json');
    const manifestOwners = new Map();
    for (const name of manifestNames) {
      const manifest = readJson(`providers/${name}.capabilities.json`);
      for (const domain of manifest.owns) {
        manifestOwners.set(domain, name);
      }
    }

    for (const item of ownership.domains) {
      if (item.domain === 'federation_record') {
        expect(item.owner).toBe('agenix-governor');
        continue;
      }
      expect(manifestOwners.get(item.domain), item.domain).toBe(item.owner);
    }
  });

  it('does not claim runtime health before a probe', () => {
    const migration = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_provider_registry_v0.sql'),
      'utf8',
    );
    expect(migration).toContain("select id, 'unknown', version");
    expect(migration).not.toContain("select id, 'healthy'");
  });

  it('keeps disabled interfaces out of provider routing priority', () => {
    const montage = readJson('providers/montage.capabilities.json');
    expect(montage.metadata.enabled_interface_order).toEqual(['api']);
    expect(montage.interfaces.mcp).toBe(false);
    expect(montage.interfaces.cli).toBe(false);
    expect(montage.capabilities).not.toContain('video.edit.propose');

    const interpreter = readJson('providers/open-interpreter.capabilities.json');
    expect(interpreter.metadata.enabled_interface_order).toEqual(['cli']);
    expect(interpreter.interfaces.browser).toBe(false);
    expect(interpreter.interfaces.gui).toBe(false);
  });

  it('keeps Darya routing disabled until its repo AGENTS precondition is satisfied', () => {
    const manifest = readJson('providers/darya-openhands.capabilities.json');
    expect(manifest.metadata.repo_local_manifest_status).toBe('deferred');
    expect(manifest.metadata.routing_enabled).toBe(false);
    expect(manifest.metadata.reason).toMatch(/pre-commit/i);
  });

  it('records the live Phase 2 provider reconciliation migration', () => {
    const migration = fs.readFileSync(
      path.join(hive, 'database/migrations/20260807_agenix_hive_phase2_provider_reconcile_v0.sql'),
      'utf8',
    );
    expect(migration).toContain("where provider_key='montage'");
    expect(migration).toContain("where provider_key='open-interpreter'");
    expect(migration).toContain("where pc.provider_id=p.id and p.provider_key='darya-openhands'");
    expect(migration).toContain('enabled=false');
  });
});
