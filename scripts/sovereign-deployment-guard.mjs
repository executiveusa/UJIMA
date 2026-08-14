import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const policy = JSON.parse(fs.readFileSync(path.join(root, 'control-plane/deployment/sovereign-deployment-policy.json'), 'utf8'));

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.join('=') || true];
}));

const request = {
  repo: args.repo || process.env.GITHUB_REPOSITORY || null,
  environment: args.environment || process.env.VERCEL_ENV || null,
  action: args.action || process.env.AGENIX_ACTION || null,
  actor: args.actor || process.env.AGENIX_ACTOR || 'agent',
  estimatedCostUsd: Number(args['estimated-cost-usd'] ?? process.env.AGENIX_ESTIMATED_COST_USD ?? 0),
  deploymentCountToday: Number(args['deployment-count-today'] ?? process.env.AGENIX_DEPLOYMENT_COUNT_TODAY ?? 0),
  productionDeploymentCountToday: Number(args['production-deployment-count-today'] ?? process.env.AGENIX_PRODUCTION_DEPLOYMENT_COUNT_TODAY ?? 0),
  approvalId: args['approval-id'] || process.env.AGENIX_APPROVAL_ID || null,
  evidenceId: args['evidence-id'] || process.env.AGENIX_EVIDENCE_ID || null,
  rollbackRef: args['rollback-ref'] || process.env.AGENIX_ROLLBACK_REF || null,
  explicitPreviewRequest: String(args['explicit-preview-request'] ?? process.env.AGENIX_EXPLICIT_PREVIEW_REQUEST ?? 'false') === 'true'
};

function stop(reason, details = {}) {
  console.error('SOVEREIGN_DEPLOYMENT_STOP');
  console.error(`reason: ${reason}`);
  for (const [key, value] of Object.entries(details)) console.error(`${key}: ${value}`);
  process.exit(1);
}

if (policy.mode !== 'fail_closed') stop('Deployment policy is not fail-closed.');

for (const field of policy.required_request_fields) {
  const map = {
    estimated_cost_usd: 'estimatedCostUsd',
    deployment_count_today: 'deploymentCountToday',
    production_deployment_count_today: 'productionDeploymentCountToday'
  };
  const key = map[field] || field;
  if (request[key] === null || request[key] === undefined || request[key] === '') {
    stop('Missing required deployment request field.', { field });
  }
}

if (!Number.isFinite(request.estimatedCostUsd) || request.estimatedCostUsd < 0) stop('Invalid estimated cost.');
if (!Number.isInteger(request.deploymentCountToday) || request.deploymentCountToday < 0) stop('Invalid deployment count.');
if (!Number.isInteger(request.productionDeploymentCountToday) || request.productionDeploymentCountToday < 0) stop('Invalid production deployment count.');

const economics = policy.agent_economics;
if (request.deploymentCountToday >= economics.default_max_deployments_per_day && !request.approvalId) {
  stop('Daily deployment limit reached.', { limit: economics.default_max_deployments_per_day });
}

if (request.estimatedCostUsd > economics.human_approval_required_above_usd && !request.approvalId) {
  stop('Estimated action cost requires human approval.', {
    estimated_cost_usd: request.estimatedCostUsd,
    approval_threshold_usd: economics.human_approval_required_above_usd
  });
}

if (request.environment === 'preview') {
  if (policy.vercel.preview_requires_explicit_request && !request.explicitPreviewRequest) {
    stop('Preview deployment was not explicitly requested.');
  }
}

if (request.environment === 'production') {
  if (policy.vercel.forbid_agent_direct_production_deploy && request.actor !== 'human-approved-agent' && request.actor !== 'human') {
    stop('Direct autonomous production deployment is forbidden.', { actor: request.actor });
  }
  if (request.productionDeploymentCountToday >= economics.default_max_production_deployments_per_day && !request.approvalId) {
    stop('Daily production deployment limit reached.', { limit: economics.default_max_production_deployments_per_day });
  }
  for (const field of policy.production_required_fields) {
    const map = { approval_id: 'approvalId', evidence_id: 'evidenceId', rollback_ref: 'rollbackRef' };
    const key = map[field];
    if (!request[key]) stop('Production deployment is missing required governance evidence.', { field });
  }
}

console.log('ALLOW sovereign_deployment');
console.log(`repo: ${request.repo}`);
console.log(`environment: ${request.environment}`);
console.log(`action: ${request.action}`);
console.log(`actor: ${request.actor}`);
console.log(`estimated_cost_usd: ${request.estimatedCostUsd}`);
console.log(`deployment_count_today: ${request.deploymentCountToday}`);
console.log(`production_deployment_count_today: ${request.productionDeploymentCountToday}`);
if (request.approvalId) console.log(`approval_id: ${request.approvalId}`);
if (request.evidenceId) console.log(`evidence_id: ${request.evidenceId}`);
if (request.rollbackRef) console.log(`rollback_ref: ${request.rollbackRef}`);
