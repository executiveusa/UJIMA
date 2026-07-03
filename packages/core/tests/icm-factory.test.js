import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  factoryStageDefinitions,
  ensureIcmWorkspace,
  listIcmTree,
  validateIcmWorkspace
} from '../src/icm.js';

const FACTORY_ROOT = path.resolve(__dirname, '../../../icm/workspaces/mission-os-client-factory');

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'icm-factory-test-'));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('factoryStageDefinitions', () => {
  it('has exactly 10 stages numbered 00-09', () => {
    expect(factoryStageDefinitions).toHaveLength(10);
    const names = factoryStageDefinitions.map(([s]) => s);
    expect(names[0]).toBe('00_intake');
    expect(names[9]).toBe('09_go_live_readiness');
  });

  it('all factory stages have non-empty descriptions', () => {
    for (const [stage, desc] of factoryStageDefinitions) {
      expect(desc.length, `stage ${stage} description empty`).toBeGreaterThan(0);
    }
  });
});

describe('canonical factory workspace on disk', () => {
  it('exists at icm/workspaces/mission-os-client-factory/', () => {
    expect(fs.existsSync(FACTORY_ROOT)).toBe(true);
  });

  it('has CONTEXT.md and AGENT.md', () => {
    expect(fs.existsSync(path.join(FACTORY_ROOT, 'CONTEXT.md'))).toBe(true);
    expect(fs.existsSync(path.join(FACTORY_ROOT, 'AGENT.md'))).toBe(true);
  });

  it('has all 10 required stage directories with CONTEXT.md', () => {
    for (const [stage] of factoryStageDefinitions) {
      const ctx = path.join(FACTORY_ROOT, 'stages', stage, 'CONTEXT.md');
      expect(fs.existsSync(ctx), `missing: stages/${stage}/CONTEXT.md`).toBe(true);
    }
  });

  it('each factory stage CONTEXT.md has required sections', () => {
    const required = ['## Inputs', '## Process', '## Outputs', '## Human review gate', '## Allowed tools', '## Forbidden actions', '## Validation', '## Done when'];
    for (const [stage] of factoryStageDefinitions) {
      const ctx = path.join(FACTORY_ROOT, 'stages', stage, 'CONTEXT.md');
      const content = fs.readFileSync(ctx, 'utf8');
      for (const section of required) {
        expect(content, `${stage}/CONTEXT.md missing "${section}"`).toContain(section);
      }
    }
  });

  it('no factory stage CONTEXT.md contains TODO or TBD placeholders', () => {
    for (const [stage] of factoryStageDefinitions) {
      const ctx = path.join(FACTORY_ROOT, 'stages', stage, 'CONTEXT.md');
      const content = fs.readFileSync(ctx, 'utf8');
      expect(content, `${stage}/CONTEXT.md contains TODO`).not.toMatch(/\bTODO\b/i);
      expect(content, `${stage}/CONTEXT.md contains TBD`).not.toMatch(/\bTBD\b/i);
    }
  });

  it('factory AGENT.md contains safety rules', () => {
    const agent = fs.readFileSync(path.join(FACTORY_ROOT, 'AGENT.md'), 'utf8');
    expect(agent).toContain('Do not deploy live');
    expect(agent).toContain('approval');
  });
});

describe('validateIcmWorkspace', () => {
  it('returns ok:true for a freshly initialized workspace', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'test-org' });
    const result = validateIcmWorkspace({ base: tmp, tenantId: 'test-org' });
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stages).toHaveLength(8);
  });

  it('returns ok:false when workspace is missing', () => {
    const result = validateIcmWorkspace({ base: tmp, tenantId: 'nonexistent' });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('workspace missing'))).toBe(true);
  });

  it('returns ok:false when a stage CONTEXT.md is deleted', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'test-org' });
    const ctx = path.join(tmp, 'tenants', 'test-org', 'stages', '03_grant_application', 'CONTEXT.md');
    fs.unlinkSync(ctx);
    const result = validateIcmWorkspace({ base: tmp, tenantId: 'test-org' });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('03_grant_application'))).toBe(true);
  });

  it('refuses invalid tenant id', () => {
    expect(() => validateIcmWorkspace({ base: tmp, tenantId: '../escape' })).toThrow(/Unsafe path|Invalid tenant/);
  });
});

describe('listIcmTree after icm init', () => {
  it('returns all stage entries for initialized workspace', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'list-test' });
    const tree = listIcmTree({ base: tmp, tenantId: 'list-test' });
    expect(tree.length).toBeGreaterThan(0);
    const paths = tree.map((e) => e.path);
    expect(paths.some((p) => p.includes('01_onboarding'))).toBe(true);
    expect(paths.some((p) => p.includes('08_workspace_learning'))).toBe(true);
    expect(paths.some((p) => p.includes('CONTEXT.md'))).toBe(true);
  });

  it('returns empty array when workspace does not exist', () => {
    const tree = listIcmTree({ base: tmp, tenantId: 'no-such-tenant' });
    expect(tree).toEqual([]);
  });
});
