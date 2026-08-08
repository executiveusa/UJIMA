# Agenix Hive Phase 1 Receipt — Foundation

**Status:** PASS pending repository CI/PR review

## Scope completed

- Locked `HIVE-CONSTITUTION.md` with canonical ownership and cross-repository rules.
- Added v0 capability, event, work-order and evidence contracts.
- Added state-ownership map.
- Applied isolated `agenix_hive` and `agenix_hive_private` schemas to Botanic Creations Supabase.
- Registered the Hive in existing `platform.app_registry` instead of creating a duplicate app registry.
- Seeded five initial providers and seventeen initial capabilities.
- Added resource leases, event correlation/idempotency, evidence receipts and approvals.
- Enabled organization-scoped RLS on every Hive table.
- Added FK/query indexes and optimized auth lookups after Supabase performance review.

## Database proof — 2026-08-07

Verification query result:

| Check | Observed |
| --- | ---: |
| `agenix_hive` tables | 22 |
| RLS-enabled Hive tables | 22 |
| Hive read policies | 22 |
| seeded providers | 5 |
| seeded capabilities | 17 |
| canonical state domains | 5 |
| `platform.app_registry` Hive rows | 1 |

Canonical owner verification:

- `project_policy` -> `agenix-governor`
- `organization_work_state` -> `paperclip-hq`
- `engineering_execution_state` -> `darya-openhands`
- `video_project_state` -> `montage`
- `computer_execution_sessions` -> `open-interpreter`

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

## Portability

Migration SQL is committed under `control-plane/hive/database/migrations/` and contains no application secrets. The isolated schemas can be exported/restored to a self-hosted PostgreSQL/Supabase target later.

## Remaining Phase 1 gate

Repository tests, CI and independent PR review must pass before this receipt becomes final and Phase 2 begins.