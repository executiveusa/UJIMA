# Production Gaps

This file is intentionally blunt. Do not sell the system as autonomous production infrastructure until these are closed.

## Current build status

- Frontend: working scaffold.
- API: working demo API.
- ICM: real folder scaffold.
- ACFS/flywheel: vendored reference + install script, not pre-installed on the host until `scripts/install-acfs.sh` runs.
- Database: Postgres container exists, but the API currently defaults to filesystem JSON state.
- Agents: adapter seams exist; real Pi/Absurd/Sandcastle execution still needs implementation.
- Postiz: payload builder exists; real scheduler adapter needs implementation.
- Voice: webhook logging exists; real Twilio/Vapi/Retell call workflow needs implementation.

## Phase 9 Gate 3 staging status

Gate 3 produced the Hostinger VPS staging specification and runbook set (`docs/HOSTINGER-PHASE-9-STAGING.md`, `docs/VPS-BOOTSTRAP-RUNBOOK.md`, `docs/PRODUCTION-ENV-GENERATION.md`, `docs/CADDY-DOMAIN-MAP.md`, `docs/POSTGRES-MIGRATION-RUNBOOK.md`, `docs/PHASE-9-GO-LIVE-GATES.md`) and the go-live gate checklist (Gates A–N). This is planning only. No VPS has been provisioned, no DNS has been changed, no live Docker containers have been started, and Postgres runtime mode remains unwired — see `docs/POSTGRES-MIGRATION-RUNBOOK.md` for the honest current-state breakdown.

## Non-negotiable production bar

1. `npm run verify` passes.
2. `npm audit --audit-level=high` returns clean or documented accepted risk.
3. A tenant cannot read or write another tenant's data.
4. Every external action creates an approval record before execution.
5. Every model/tool call has an audit event, model route, cost estimate, and redaction status.
6. Backups can be restored on a clean VPS.
7. ACFS doctor passes on the VPS.
8. Human staff can complete onboarding without a developer.

## Gate 6B0 — Final Local App Completion Gap Classification

These are the known gaps after Gate 6B0. All are expected and classified here for Architect review.

### P1 — Blocking for Production (must be closed before Gate 6B goes live)

| Gap | Location | Resolution |
|---|---|---|
| Postgres not connected | `packages/db/src/index.js` `storageMode()` | Set `DATABASE_URL` + `STORAGE_MODE=postgres` on VPS |
| `services/mission-api/src/storage.js` inconsistency | Returns `postgres-ready`/`json-dry-run` vs canonical `postgres`/`json` | Migrate to `@asc3nd/core/storage-factory` at Gate 6B |
| Integration adapters are stubs (CREDENTIAL_MISSING) | `packages/core/src/integration-adapters.js` | Provide real credentials on VPS at Gate 6B |
| `GATE_6B_LIVE_APPROVED` not set | `.env.managed` on VPS | Architect sets this after Gate 6B pre-flight passes |

### P2 — Non-blocking for Gate 6B Staging (deferred to Gate N or later)

| Gap | Location | Note |
|---|---|---|
| Postiz real scheduler implementation | `packages/core/src/integration-adapters.js` | Adapter stub returns CREDENTIAL_MISSING until Gate N |
| Twilio/Vapi/Retell real implementation | `packages/core/src/integration-adapters.js` | Same — stub only |
| Hermes agent: real Pi/Absurd/Sandcastle execution | `packages/core/src/agent-service.js` | Adapter seams exist; real execution deferred |
| ACFS/flywheel pre-install | `scripts/install-acfs.sh` | Must run on VPS before Gate N |
| Multi-tenant operator auth | `apps/site/lib/ops-tenant.js` | Currently single-tenant `OPS_TENANT_ID`; full auth deferred |

### P3 — Acknowledged, Not Blocking

| Gap | Note |
|---|---|
| No voice workflow on day one | Hard-blocked by `FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md` until Gate N |
| No grant submission on day one | Hard policy block — non-configurable |
| No outbound messaging on day one | Hard policy block — non-configurable |
