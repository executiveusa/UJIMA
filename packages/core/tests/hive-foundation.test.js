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

  it('locks one owner for every declared state domain', () => {
    const ownership = readJson('contracts/state-ownership.v0.json');
    expect(ownership.version).toBe('v0');
    const domains = ownership.domains.map((item) => item.domain);
    expect(new Set(domains).size).toBe(domains.length);
    expect(domains).toContain('federation_record');
    for (const item of ownership.domains) {
      expect(item.owner).toBeTruthy();
      expect(item.write_policy).toBeTruthy();
    }
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

  it('records all portable foundation migrations', () => {
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
    expect(foundation).toContain('create schema agenix_hive;');
    expect(foundation).toContain('create table agenix_hive.resource_leases');
    expect(foundation).toContain('create table agenix_hive.evidence_receipts');
    expect(foundation).toContain('alter table agenix_hive.events enable row level security;');
    expect(indexes).toContain('agenix_hive_runs_correlation_idx');
    expect(indexes).toContain('(select auth.uid())');
    expect(federationOwnership).toContain("'federation_record'");
    expect(federationOwnership).toContain("'agenix-governor'");
    expect(eventSourceHardening).toContain('alter column source_provider_id set not null');
  });
});
