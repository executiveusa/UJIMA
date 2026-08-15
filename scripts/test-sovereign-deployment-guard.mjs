import { spawnSync } from 'node:child_process';

const node = process.execPath;
const guard = 'scripts/sovereign-deployment-guard.mjs';
const base = [
  '--repo=executiveusa/ascend-social-purpose-agentic-systems-',
  '--action=deploy',
  '--estimated-cost-usd=0.25',
  '--deployment-count-today=0',
  '--production-deployment-count-today=0'
];

function run(name, args, expectedStatus) {
  const result = spawnSync(node, [guard, ...base, ...args], { encoding: 'utf8' });
  if (result.status !== expectedStatus) {
    console.error(`FAIL ${name}`);
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}

run('autonomous production deploy is denied', [
  '--environment=production',
  '--actor=agent'
], 1);

run('governed production deploy is allowed', [
  '--environment=production',
  '--actor=human-approved-agent',
  '--approval-id=approval_test_1',
  '--evidence-id=evidence_test_1',
  '--rollback-ref=sha_test_1'
], 0);

run('implicit preview is denied', [
  '--environment=preview',
  '--actor=agent'
], 1);

run('explicit preview is allowed', [
  '--environment=preview',
  '--actor=agent',
  '--explicit-preview-request=true'
], 0);

run('cost above threshold is denied without approval', [
  '--environment=preview',
  '--actor=agent',
  '--explicit-preview-request=true',
  '--estimated-cost-usd=2'
], 1);

run('daily deployment limit is denied without approval', [
  '--environment=preview',
  '--actor=agent',
  '--explicit-preview-request=true',
  '--deployment-count-today=3'
], 1);
