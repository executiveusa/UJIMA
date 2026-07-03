import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const siteRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');

describe('Phase 9A ICM route existence', () => {
  it('/api/icm/tree route exists', () => {
    expect(fs.existsSync(path.join(siteRoot, 'app/api/icm/tree/route.js'))).toBe(true);
  });

  it('/ops/icm page exists', () => {
    expect(fs.existsSync(path.join(siteRoot, 'app/ops/icm/page.jsx'))).toBe(true);
  });
});

describe('Phase 9A ICM factory workspace', () => {
  const factoryRoot = path.join(repoRoot, 'icm/workspaces/mission-os-client-factory');
  const factoryStages = [
    '00_intake', '01_tenant_profile', '02_knowledge_ingestion',
    '03_policy_and_approvals', '04_agent_pack', '05_asset_generation',
    '06_ops_dashboard_setup', '07_vps_deployment_plan',
    '08_training_and_handoff', '09_go_live_readiness'
  ];

  it('factory workspace directory exists', () => {
    expect(fs.existsSync(factoryRoot)).toBe(true);
  });

  it('factory CONTEXT.md exists', () => {
    expect(fs.existsSync(path.join(factoryRoot, 'CONTEXT.md'))).toBe(true);
  });

  it('factory AGENT.md exists', () => {
    expect(fs.existsSync(path.join(factoryRoot, 'AGENT.md'))).toBe(true);
  });

  for (const stage of factoryStages) {
    it(`factory stage ${stage} has CONTEXT.md`, () => {
      expect(fs.existsSync(path.join(factoryRoot, 'stages', stage, 'CONTEXT.md'))).toBe(true);
    });
  }
});

describe('Phase 9A /ops/icm page content', () => {
  const pagePath = path.join(siteRoot, 'app/ops/icm/page.jsx');

  it('has deferred-state empty message', () => {
    const content = fs.readFileSync(pagePath, 'utf8');
    expect(content).toContain('not initialized yet');
  });

  it('shows next safe command to operator', () => {
    const content = fs.readFileSync(pagePath, 'utf8');
    expect(content).toContain('icm init');
  });

  it('labels live execution as deferred', () => {
    const content = fs.readFileSync(pagePath, 'utf8');
    expect(content).toContain('deferred');
  });

  it('does not claim agent is running live', () => {
    const content = fs.readFileSync(pagePath, 'utf8');
    expect(content.toLowerCase()).not.toContain('agent running');
    expect(content.toLowerCase()).not.toContain('agent is live');
  });
});

describe('Phase 9A missionctl ICM command stubs', () => {
  const missionctlPath = path.join(repoRoot, 'missionctl/missionctl.mjs');

  it('icm init command is registered', () => {
    const content = fs.readFileSync(missionctlPath, 'utf8');
    expect(content).toContain('icmInit');
  });

  it('icm tree command is registered', () => {
    const content = fs.readFileSync(missionctlPath, 'utf8');
    expect(content).toContain('icmTree');
  });

  it('icm validate command is registered', () => {
    const content = fs.readFileSync(missionctlPath, 'utf8');
    expect(content).toContain('icmValidate');
  });

  it('ICM factory decision doc exists', () => {
    expect(fs.existsSync(path.join(repoRoot, 'docs/ICM-FACTORY-DECISION.md'))).toBe(true);
  });
});
