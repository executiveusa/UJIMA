import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const boundaries = readJson('control-plane/studio/repository-boundaries.json');
const roleSecurity = readJson('control-plane/studio/role-security.json');

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.replace(/^--/, '').split('=');
  return [k, rest.join('=') || true];
}));

const request = {
  repo: args.repo || process.env.AGENIX_REPO || process.env.GITHUB_REPOSITORY || null,
  role: args.role || process.env.AGENIX_ROLE || null,
  action: args.action || process.env.AGENIX_ACTION || null,
  artifact: args.artifact || process.env.AGENIX_ARTIFACT || null,
  handoffType: args['handoff-type'] || process.env.AGENIX_HANDOFF_TYPE || null,
  approvalId: args['approval-id'] || process.env.AGENIX_APPROVAL_ID || null,
  writerRole: args['writer-role'] || process.env.AGENIX_WRITER_ROLE || null,
  approverRole: args['approver-role'] || process.env.AGENIX_APPROVER_ROLE || null,
  json: Boolean(args.json || process.env.AGENIX_JSON === '1')
};

const productionActions = new Set([
  'publish',
  'publish_social',
  'deploy',
  'deploy_public_site',
  'production_deploy',
  'change_dns',
  'write_secret',
  'apply_production_migration',
  'delete_production_data',
  'destructive_action'
]);

function emit(result) {
  if (request.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.allowed) {
    console.log('ALLOW');
    console.log(`repo: ${result.repo}`);
    console.log(`role: ${result.role}`);
    console.log(`action: ${result.action}`);
    if (result.artifact) console.log(`artifact: ${result.artifact}`);
    if (result.approval_id) console.log(`approval_id: ${result.approval_id}`);
  } else {
    console.error('REPOSITORY_BOUNDARY_STOP');
    console.error(`reason: ${result.reason}`);
    if (result.repo) console.error(`repo: ${result.repo}`);
    if (result.role) console.error(`role: ${result.role}`);
    if (result.action) console.error(`action: ${result.action}`);
    if (result.expected_repo) console.error(`expected_repo: ${result.expected_repo}`);
    if (result.required_handoff_type) console.error(`required_handoff_type: ${result.required_handoff_type}`);
  }
  process.exit(result.allowed ? 0 : 1);
}

function deny(reason, extra = {}) {
  emit({ allowed: false, reason, ...request, ...extra });
}

if (boundaries.mode !== 'fail_closed' || roleSecurity.default !== 'deny') {
  deny('Global policy is not fail-closed/default-deny.');
}

if (!request.repo || !request.role || !request.action) {
  deny('Missing required policy input. repo, role, and action are mandatory.');
}

const repoPolicy = boundaries.repositories.find((entry) => entry.repo === request.repo);
if (!repoPolicy) deny('Repository is not registered in the Agenix boundary map.');

const rolePolicy = roleSecurity.roles[request.role];
if (!rolePolicy) deny('Role is not registered in Agenix role security.');

if (!rolePolicy.may.includes(request.action)) {
  deny('Action is not explicitly allowed for this role.');
}

if (rolePolicy.may_not.includes(request.action)) {
  deny('Action is explicitly denied for this role.');
}

if (rolePolicy.owner_repo && rolePolicy.owner_repo !== request.repo) {
  deny('Role is attempting to write outside its owner repository.', {
    expected_repo: rolePolicy.owner_repo,
    required_handoff_type: request.handoffType || 'explicit_handoff_required'
  });
}

if (request.handoffType && !repoPolicy.handoff_types.includes(request.handoffType)) {
  deny('Handoff type is not allowed by the target repository boundary.', {
    required_handoff_type: repoPolicy.handoff_types.join(',')
  });
}

if (request.writerRole && request.approverRole && request.writerRole === request.approverRole) {
  deny('Writer and approver roles must differ for governed approval work.');
}

if (productionActions.has(request.action) && !request.approvalId) {
  deny('Production or destructive action requires a recorded approval ID.');
}

emit({
  allowed: true,
  repo: request.repo,
  role: request.role,
  action: request.action,
  artifact: request.artifact,
  approval_id: request.approvalId,
  boundary_role: repoPolicy.role
});
