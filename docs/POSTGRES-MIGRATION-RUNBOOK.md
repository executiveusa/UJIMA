# Postgres Migration Runbook — Mission OS Phase 9 Staging

**Audience:** Operator, Architect
**Purpose:** Document the file-backed → Postgres migration path honestly, including what is not yet implemented
**Status:** Planning document. Postgres runtime mode is not live in this build. Read the "Current state" section before assuming anything below is already working end to end.

---

## Current state: file-backed mode

Mission OS runs today in **file-backed JSON mode** by default. `services/mission-api/src/storage.js` implements `JsonTenantStore`, which reads and writes `mission-data/<tenantId>/<name>.json` directly. This is the only storage path exercised by the current test suite, `bundle smoke`, and the ops dashboard.

`storageMode()` in `storage.js` reports:

```js
if (process.env.DATABASE_URL && process.env.STORAGE_MODE === 'postgres') return 'postgres-ready';
return 'json-dry-run';
```

**Honesty note:** `postgres-ready` is a label returned by this function when both env vars are set. It does not mean the application's read/write paths have been switched to query Postgres instead of the filesystem. As of this build, the operator API, agent service, ops dashboard, and missionctl commands all read and write through `JsonTenantStore` regardless of `STORAGE_MODE`. Setting `STORAGE_MODE=postgres` today does not change runtime behavior — it only flips the label reported by `storageMode()`. Do not present this as "Postgres mode is live." It is not.

## Target: Postgres mode

Postgres tables exist for schema parity — created by `db/schema.sql` and the numbered migrations in `db/migrations/` — but the application does not yet read or write through them in the normal request path. Reaching live Postgres mode requires:

1. Wiring each core module (`packages/core/src/events.js`, `artifacts.js`, `approval-lifecycle.js`, `managed-agents.js`, `deployment-releases.js`, `deployment-backup.js`, `model-usage-ledger.js`, `trace-links.js`, etc.) to read/write through `packages/db/src/*` repository functions instead of `JsonTenantStore`, behind the `STORAGE_MODE` flag.
2. Adding row-level tenant isolation (see RLS section below) so a Postgres connection scoped to one tenant cannot read another tenant's rows even if application-level checks are bypassed.
3. Running the full test suite against a live Postgres instance, not just the file-backed path, and confirming parity of behavior.
4. Running a backup/restore drill against the live Postgres data (see below) before any real client data is migrated in.

None of this is complete in the current build. This is Phase 9B+ work, not Gate 3 work. Gate 3 documents the plan; it does not implement the wiring.

## Migration order

If/when the Postgres wiring above is implemented, migration order for cutting a tenant over from file-backed to Postgres mode is:

1. **Freeze writes** — put the tenant into a maintenance state (no missionctl commands, no API writes) for the duration of the migration.
2. **Backup file-backed state** — `missionctl backup create <tenant>` (see `docs/BACKUP-RESTORE.md`). Confirm the backup manifest's `checksum_sha256` is recorded before proceeding.
3. **Apply schema** — `npm run db:migrate` (wraps `packages/db/scripts/migrate.mjs`), which applies `db/schema.sql` then each file in `db/migrations/` in filename order, tracked in a `schema_migrations` table so migrations are idempotent and re-runnable.
4. **Backfill data** — a one-time import script (not yet built) reads each tenant's `mission-data/<tenantId>/*.json` files and inserts corresponding rows into the Postgres tables. This script does not exist in the current build; it is a Phase 9B deliverable.
5. **Verify row counts** — compare JSON record counts (events, artifacts, approvals, managed agents, deployment releases, backups) against the corresponding Postgres table row counts for the tenant. Any mismatch blocks cutover.
6. **Flip `STORAGE_MODE`** — set `STORAGE_MODE=postgres` and `DATABASE_URL` for the tenant's environment, and confirm (once wiring exists) that the application now reads/writes Postgres.
7. **Smoke test** — run `bundle smoke <tenant>` against the now-Postgres-backed tenant and confirm all checks still pass.
8. **Unfreeze writes** — resume normal operation.

## Migrations directory

```
db/schema.sql                                    — base schema, applied first
db/migrations/0001_v04_production_core.sql
db/migrations/0002_p02_repositories.sql
db/migrations/0003_v06_core_platform.sql          — events, approvals, artifacts, agents
db/migrations/0004_v06_auth_rbac_tenant_isolation.sql
db/migrations/0005_v06_model_gateway_observability.sql — budgets, usage ledger, trace links
db/migrations/0006_v06_deployment_lifecycle.sql   — releases, health checks, smoke results, backups
```

Migrations are applied via `packages/db/scripts/migrate.mjs`, tracked in a `schema_migrations` table so re-running the script skips already-applied files. This script requires `DATABASE_URL` to be set — it will refuse to run without it.

## Backup before migration

Always run a file-backed backup immediately before any migration attempt, even a schema-only migration:

```bash
node missionctl/missionctl.mjs backup create <tenant>
node missionctl/missionctl.mjs backup list <tenant>
```

See `docs/BACKUP-RESTORE.md` for the full backup manifest format and safety rules (same-tenant restore only, path traversal blocked, checksum verification).

## Restore drill

Before trusting any migration path in a real deployment, run a full restore drill on a disposable copy of the environment:

1. Create a backup of a populated (non-empty) tenant.
2. Delete or move aside that tenant's `mission-data/<tenant>/` directory.
3. Run `node missionctl/missionctl.mjs restore --slug <tenant> --backup <backup-id>`.
4. Confirm the tenant's dashboard, events, artifacts, and approvals are all restored correctly.
5. Run `bundle smoke <tenant>` and confirm all checks pass post-restore.

This drill must pass on a clean VPS (not just the original machine that created the backup) before Gate F in `docs/PHASE-9-GO-LIVE-GATES.md` is considered satisfied.

## Tenant isolation validation

Tenant isolation in file-backed mode is enforced at the filesystem-path level: `DATA_DIR/<tenantId>/` is the only writable path for a given tenant, and operator keys are scoped to a single `tenant_id` (see `docs/SECURITY-CHECKLIST.md`). This is validated today by the existing test suite.

In Postgres mode, tenant isolation must be validated at the database level, not just the application level, because a bug in application code should not be able to leak cross-tenant rows.

## RLS check requirement

**Current state: no Postgres Row-Level Security (RLS) policies exist in this codebase.** `db/schema.sql` and all files in `db/migrations/` create tables with a `tenant_id` column convention but do not enable RLS or define any `CREATE POLICY` statements. This is a gap, not an oversight — it is required before any real client data is stored in Postgres.

Before Postgres mode can be considered production-ready:

- [ ] Enable RLS on every tenant-scoped table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [ ] Define a policy per table that restricts rows to `tenant_id = current_setting('app.current_tenant')` (or equivalent session-scoped mechanism).
- [ ] Confirm the application sets the tenant context on every connection/transaction before querying.
- [ ] Add an automated test that attempts a cross-tenant read via a raw connection scoped to tenant A and confirms it returns zero rows for tenant B's data, even with a hand-crafted query that omits a `WHERE tenant_id = ...` clause.
- [ ] Document the RLS policy set in this file once implemented, replacing this checklist with an "implemented" state.

Do not claim RLS is enforced until this checklist is complete and verified by a passing test, not just a manual check.

## Rollback plan

If a migration to Postgres mode fails partway, or Postgres-mode behavior diverges from file-backed behavior in a way that breaks the tenant's operation:

1. Set `STORAGE_MODE` back to unset (or any value other than `postgres`) — the application falls back to `JsonTenantStore` reading the tenant's `mission-data/<tenantId>/` directory, which was never deleted during migration (Step 1 above says freeze, not delete).
2. If the file-backed directory was modified or deleted as part of a backfill script, restore from the pre-migration backup created in the "Backup before migration" step.
3. Run `bundle smoke <tenant>` to confirm the rollback restored a working state.
4. Record the failure and root cause before attempting migration again — do not retry blindly.

Because the current build never actually switches read/write paths (see "Honesty note" above), rollback today is trivial: file-backed mode is always the active path regardless of `STORAGE_MODE`. This rollback plan becomes load-bearing once the Postgres wiring described in "Target: Postgres mode" is implemented.

## Summary: what is honest to say today

| Claim | Accurate? |
|---|---|
| "Postgres tables exist with schema parity to the file-backed state" | Yes |
| "Migrations can be applied to a real Postgres instance" | Yes, via `npm run db:migrate` |
| "The application reads and writes Postgres when `STORAGE_MODE=postgres` is set" | No — not yet wired |
| "Tenant isolation is enforced at the database level via RLS" | No — RLS is not implemented |
| "A backup/restore drill has been run against live Postgres data" | No — not yet possible until wiring exists |
| "File-backed mode is the only live storage path today" | Yes |
