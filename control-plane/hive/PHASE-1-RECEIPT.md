# Agenix Hive Phase 1 Receipt — Foundation

**Status:** PASS

**Merged foundation SHA:** `6c4716ce0f9b7b58fc54e1c8a4bd7a5e1580c593`

## Scope completed

- Locked `HIVE-CONSTITUTION.md` with canonical ownership and cross-repository rules.
- Added v0 capability, event, work-order and evidence contracts.
- Added state-ownership map and Hive-local `AGENTS.md` guardrails.
- Applied isolated `agenix_hive` and `agenix_hive_private` schemas to Botanic Creations Supabase.
- Registered the Hive in existing `platform.app_registry` instead of creating a duplicate app registry.
- Seeded five initial providers and seventeen initial capabilities.
- Added resource leases, event correlation/idempotency, evidence receipts and approvals.
- Enabled organization-scoped RLS on every Hive table.
- Added FK/query indexes and optimized auth lookups after Supabase performance review.
- Explicitly assigned the cross-provider `federation_record` state domain to Agenix Governor; provider-private state remains excluded.
- Preserved federation history with restrictive run foreign keys and immutable event provider keys.
- Removed environment-specific Supabase project identifiers from reusable migration metadata and guarded the optional `platform.app_registry` integration for portable self-host installation.

## Database proof — 2026-08-07

Verification query result:

| Check | Observed |
| --- | ---: |
| `agenix_hive` tables | 22 |
| RLS-enabled Hive tables | 22 |
| Hive read policies | 22 |
| seeded providers | 5 |
| seeded capabilities | 17 |
| canonical state domains | 6 |
| `platform.app_registry` Hive rows | 1 |

Canonical owner verification:

- `project_policy` -> `agenix-governor`
- `organization_work_state` -> `paperclip-hq`
- `engineering_execution_state` -> `darya-openhands`
- `video_project_state` -> `montage`
- `computer_execution_sessions` -> `open-interpreter`
- `federation_record` -> `agenix-governor`

## Repository CI/review proof

The initial PR exposed one test-discovery error: the new Hive test was placed outside this repository's permitted Vitest include tree. It was moved to `packages/core/tests/hive-foundation.test.js` without weakening the discovery audit.

The final reviewed PR head passed:

- Repository Boundary Guard
- full `npm test`
- build
- `missionctl doctor`
- secret audit
- generated-file audit
- test-discovery audit
- OpenSpec task audit
- bundle smoke dry-run
- AdamsReview gate
- Vercel preview deployment
- CodeRabbit review

All valid CodeRabbit findings were fixed and all review threads were resolved before merge. PR #37 was squash-merged to `main`, and the Hive Constitution was re-read from `main` after merge to verify the deployed repository state.

## Supabase advisor proof

Security advisor after migration returned no finding against the `agenix_hive` schema. Existing security findings were in pre-existing `creator_studio`, `platform`, and `public` objects and were intentionally not modified by this task.

The first performance advisor pass identified missing FK indexes and an auth RLS init-plan optimization in the new Hive schema. Migration `agenix_hive_foundation_v0_indexes` added the covering indexes and switched membership helpers/policy lookups to `(select auth.uid())`. A second advisor pass no longer reported Hive unindexed-FK or Hive auth-init-plan findings. Newly created Hive indexes appear as `unused_index` informational notices until the fresh tables receive normal traffic; that is expected and is not a failure.

## Safety proof

- No existing ASC3ND/Fanni/Creator Studio table was altered by the Hive migrations.
- No client facts, media, passwords or API secrets were inserted into Hive tables.
- Authenticated clients receive read-only organization-scoped access; trusted service workers perform writes.
- No anonymous Hive policy was created.
- External publishing remains `human_required` in the capability seed.
- Computer desktop control is `high` risk and `human_required` by default.
- Resource leases enforce one active write lease per resource.
- Historical events/evidence/approvals/context cannot be cascade-deleted by removing a run.
- Event idempotency is keyed by immutable `source_provider_key`, not a deletable provider UUID link.

## Portability

Migration SQL is committed under `control-plane/hive/database/migrations/` and contains no application secrets or environment-specific Supabase project reference. Optional host `platform.app_registry` registration is guarded so the Hive schema can install into a clean self-hosted Supabase instance without that parent table.

## Phase gate

Phase 1 is complete. Phase 2 may add provider capability manifests and health registration through separate owner-repository branches/PRs using the Hive cross-repository guardrails.