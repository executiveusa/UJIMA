import { spawnSync } from 'node:child_process';

const node = process.execPath;
const guard = 'scripts/agenix-policy-guard.mjs';

const cases = [
  {
    name: 'allows publishing draft preparation in control plane',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=prepare_zernio_drafts'],
    code: 0,
    needle: 'ALLOW'
  },
  {
    name: 'blocks publishing without approval',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=publish_social'],
    code: 1,
    needle: 'requires a recorded approval ID'
  },
  {
    name: 'allows publishing with approval',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=publish_social', '--approval-id=APR-001'],
    code: 0,
    needle: 'ALLOW'
  },
  {
    name: 'blocks cross-repo writer',
    args: ['--repo=executiveusa/asc3nd-frontend-website-', '--role=brand_agent', '--action=prepare_brand_assets'],
    code: 1,
    needle: 'outside its owner repository'
  },
  {
    name: 'blocks self approval',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=prepare_zernio_drafts', '--writer-role=publishing_agent', '--approver-role=publishing_agent'],
    code: 1,
    needle: 'Writer and approver roles must differ'
  },
  {
    name: 'requires evidence when verifying live post',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=verify_live_post'],
    code: 1,
    needle: 'requires a recorded evidence ID'
  },
  {
    name: 'allows verified live post with evidence',
    args: ['--repo=executiveusa/ascend-social-purpose-agentic-systems-', '--role=publishing_agent', '--action=verify_live_post', '--evidence-id=EVID-001'],
    code: 0,
    needle: 'ALLOW'
  }
];

let failures = 0;
for (const test of cases) {
  const result = spawnSync(node, [guard, ...test.args], { encoding: 'utf8' });
  const output = `${result.stdout}\n${result.stderr}`;
  const ok = result.status === test.code && output.includes(test.needle);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${test.name}`);
  if (!ok) {
    failures += 1;
    console.log(output);
  }
}

if (failures) process.exit(1);
console.log(`PASS ${cases.length}/${cases.length} policy guard cases`);
