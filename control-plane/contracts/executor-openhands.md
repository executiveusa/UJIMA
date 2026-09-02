# OpenHands executor contract

## Role

OpenHands is an optional technical execution backend. It may execute bounded engineering missions. It is never the canonical store for client identity, consent, relationship memory, grant truth, policy, or approval state.

## Allowed mission classes

- code implementation and refactoring;
- tests and build repair;
- technical SEO remediation;
- schema/structured-data implementation;
- deterministic data transforms using approved inputs;
- dependency maintenance;
- non-production deployment verification;
- approved read-only technical audits.

## Forbidden by default

- grant submission;
- external donor/funder/client email;
- public publishing;
- money movement or purchases;
- DNS changes;
- production database mutation;
- access to private youth data;
- unrestricted production credentials;
- changing ICM truth or approval policy;
- bypassing the owner repository boundary.

## Mission packet

Every invocation must be derived from `control-plane/schemas/mission-envelope.schema.json` and include:

- tenant and task id;
- owner repository;
- objective and acceptance criteria;
- allowed paths/domains;
- explicit denied capabilities;
- risk tier;
- required approvals;
- evidence return contract;
- rollback target when mutation is allowed.

## Sandbox rule

Prefer isolated worktree/container/VM execution. Host-direct execution requires an explicit infrastructure decision because an agent runtime with shell/filesystem/network access is a high-authority executor.

Secrets are injected outside model context where possible and are never written to ICM, logs, screenshots, or repository files.

## Completion

OpenHands returns evidence. It cannot mark the parent Social Purpose OS mission complete. Parent completion requires the configured Unlazy gates and, for release-quality work, an independent Gauntlet critic.
