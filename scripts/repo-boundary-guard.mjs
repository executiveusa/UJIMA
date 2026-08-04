import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message, details = {}) => {
  console.error('\nREPOSITORY_BOUNDARY_STOP');
  console.error(message);
  for (const [key, value] of Object.entries(details)) console.error(`${key}: ${value}`);
  process.exit(1);
};

const boundary = readJson('repo-boundary.json');
const lock = readJson('deployment-lock.json');
const pkg = readJson('package.json');

const githubRepository = process.env.GITHUB_REPOSITORY;
const vercelOwner = process.env.VERCEL_GIT_REPO_OWNER;
const vercelSlug = process.env.VERCEL_GIT_REPO_SLUG;

if (githubRepository && githubRepository !== boundary.repository) {
  fail('Source repository does not match this platform repository law.', {
    expected: boundary.repository,
    received: githubRepository
  });
}
if (pkg.name !== boundary.package_name || pkg.name !== lock.package_name) {
  fail('Package identity does not match the platform boundary.', {
    expected: boundary.package_name,
    received: pkg.name
  });
}

if (process.env.VERCEL === '1') {
  if (!vercelOwner || !vercelSlug) {
    fail('Vercel repository identity variables are missing.');
  }
  if (vercelOwner !== lock.allowed_vercel_git_owner || vercelSlug !== lock.allowed_vercel_git_repo_slug) {
    fail('Vercel is building this platform from the wrong repository.', {
      expected: `${lock.allowed_vercel_git_owner}/${lock.allowed_vercel_git_repo_slug}`,
      received: `${vercelOwner}/${vercelSlug}`
    });
  }
  const target = process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  if (lock.forbidden_public_targets.includes(target)) {
    fail('The reusable platform is connected to an ASC3ND public frontend target.', { received: target });
  }
  if (process.env[lock.required_override_variable] !== lock.required_override_value) {
    fail('Platform Vercel deployment is not explicitly approved.', {
      required_variable: lock.required_override_variable,
      required_value: lock.required_override_value,
      deployment_role: lock.deployment_role
    });
  }
}

console.log('PASS repository_identity');
console.log('PASS package_identity');
console.log(`PASS deployment_role: ${lock.deployment_role}`);
if (process.env.VERCEL === '1') console.log('PASS explicit_platform_deployment_approval');
