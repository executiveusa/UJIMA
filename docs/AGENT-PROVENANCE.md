# Agent Provenance — Mission OS v0.6

> Tracks which AI agent/builder worked on what, when, and with what tools.
> This file is the provenance record when Atomic or similar tools are not installed.

## Provenance format

Every work session logs:

| Field | Value |
|---|---|
| Session ID | UUID or timestamp-based |
| Date | ISO 8601 |
| Agent/Builder | Tool name (Desktop Commander, Claude Code, Codex, etc.) |
| Model | LLM used (e.g., GLM-4.6, Claude Sonnet 4.5) |
| MCPs used | jcodemunch, supabase, context7, etc. |
| Files created | List |
| Files modified | List |
| Tests written | Count + file paths |
| Tests passed | Count |
| Beads written | Count + references |
| Decisions | List of decision IDs from HANDOFF.md |

## Session log

### Session 1 — 2026-06-27

| Field | Value |
|---|---|
| Session ID | 2026-06-27-001 |
| Date | 2026-06-27T19:51:43Z |
| Agent/Builder | Desktop Commander |
| Model | (as configured by user) |
| MCPs used | jcodemunch-mcp (configured, available) |
| Files created | `docs/V0.6-REPO-INVENTORY.md`, `docs/V0.6-GAP-MAP.md`, `HANDOFF.md`, `docs/AGENT-PROVENANCE.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/proposal.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/design.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/managed-agents.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/operator-api.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/tenant-agent-pack.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/approval-policy.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/event-journal.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/model-gateway.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/deployment-bundle.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/dashboard-state.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/openwebui-workspace.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/observability.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/specs/pnw-nonprofit-offer.md` |
| Files modified | None (first session on clean git init) |
| Tests written | 0 (P0 is specs/docs only) |
| Tests passed | N/A |
| Beads written | 0 (beads protocol available, will use in P0-2+) |
| Decisions | D1 (Rust deferred), D2 (OpenSpec supersedes), D3 (jcodemunch locked), D4 (Hermes managed), D5 (No client frontend) |
| Git commits | `0403de6` — v0.5 baseline git init |

### Session 2 — 2026-06-29

| Field | Value |
|---|---|
| Session ID | 2026-06-29-002 |
| Date | 2026-06-29T01:38:00Z |
| Agent/Builder | Antigravity Builder |
| Model | Gemini 3.5 Flash |
| MCPs used | jcodemunch-mcp |
| Files created | `packages/core/src/events.js`, `packages/core/src/policy.js`, `packages/core/src/approval-lifecycle.js`, `packages/core/src/artifacts.js`, `packages/core/src/managed-agents.js`, `packages/core/src/dashboard-state.js`, `packages/core/tests/events.test.js`, `packages/core/tests/approval-lifecycle.test.js`, `packages/core/tests/artifacts.test.js`, `packages/core/tests/managed-agents.test.js`, `packages/core/tests/dashboard-state.test.js`, `db/migrations/0003_v06_core_platform.sql`, `docs/dev-load-always.yaml` |
| Files modified | `.gitignore`, `missionctl/missionctl.mjs`, `missionctl/templates/managed-bundle/managed.env.example`, `missionctl/templates/hermes/docker-compose.hermes.yml`, `missionctl/templates/managed-bundle/docker-compose.managed.yml`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` |
| Tests written | 5 test files (`events.test.js`, `approval-lifecycle.test.js`, `artifacts.test.js`, `managed-agents.test.js`, `dashboard-state.test.js`) |
| Tests passed | 61/61 (all tests pass) |
| Decisions | D6 (Core platform state layer implemented, file-backed fallbacks + database migrations ready) |

### Session 3 — 2026-06-30 (Phase 5: Ops Dashboard UI)

| Field | Value |
|---|---|
| Session ID | 2026-06-30-003 |
| Date | 2026-06-30T18:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `apps/site/lib/ops-tenant.js`, `apps/site/lib/opsApi.js`, `apps/site/app/api/ops/{dashboard-state,events,artifacts,managed-agents,managed-agents/[id],budgets,model-usage-summary,traces}/route.js`, `apps/site/components/MissionOsOverview.jsx`, `apps/site/app/ops/{agents,agents/[id],artifacts,events,budgets,health,deployments,openwebui}/page.jsx`, `apps/site/tests/{ops-routes-exist,ops-api-data,ops-no-operator-keys-in-client}.test.js`, `docs/OPS-DASHBOARD.md` |
| Files modified | `apps/site/app/ops/page.jsx`, `apps/site/components/OpsShell.jsx`, `vitest.config.js`, `missionctl/missionctl.mjs`, `HANDOFF.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` |
| Tests written | 53 new tests across 3 files |
| Tests passed | 189/189 (full suite) |
| Beads written | 0 |
| Decisions | Bypass both legacy session-JWT auth and Operator API key auth via a same-origin server-side `/api/ops/*` proxy layer reading `@asc3nd/core/*` directly, since the two existing auth schemes do not interoperate and exposing an operator key to client JS is explicitly forbidden; extend `/ops` additively rather than replace the pre-existing Today cockpit |

### Session 4 — 2026-07-01 (Phase 6: Managed Deployment Lifecycle)

| Field | Value |
|---|---|
| Session ID | 2026-07-01-004 |
| Date | 2026-07-01T03:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `packages/core/src/deployment-releases.js`, `packages/core/src/deployment-health.js`, `packages/core/src/deployment-backup.js`, `packages/core/tests/deployment-releases.test.js`, `packages/core/tests/deployment-health.test.js`, `packages/core/tests/deployment-backup.test.js`, `packages/core/tests/fresh-tenant.test.js`, `db/migrations/0006_v06_deployment_lifecycle.sql`, `services/mission-api/src/operator/deployments.js`, `services/mission-api/src/operator/backups.js`, `apps/site/app/api/ops/deployments/route.js`, `apps/site/tests/ops-deployments.test.js`, `docs/DEPLOYMENT-LIFECYCLE.md`, `docs/BACKUP-RESTORE.md`, `docs/RELEASE-MANIFEST.md` |
| Files modified | `packages/core/src/dashboard-state.js` (ENOENT fix), `packages/core/package.json` (+3 exports), `services/mission-api/src/operator/index.js` (+deployments/backups routers), `apps/site/app/ops/deployments/page.jsx` (placeholder → real data), `missionctl/missionctl.mjs` (+5 commands, smoke extended 44→57 checks), `HANDOFF.md`, `docs/AGENT-PROVENANCE.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` |
| Tests written | 81 new tests across 5 files |
| Tests passed | 270/270 |
| Beads written | 0 |
| Decisions | Fixed pre-existing dashboard-state ENOENT via mkdirSync guard in core module (not test workaround); used @asc3nd/core package imports in operator routes (consistent with Phase 3/4 pattern); backup/restore is local/file-backed with tenant-mismatch and path-traversal hard blocks; /ops/deployments upgraded from static placeholder to live data showing releases, smoke history, backups |

## Rules

1. Every session must be logged here before ending.
2. If Atomic is installed, this file is supplementary (Atomic is primary).
3. If Atomic is not installed, this file is the authoritative provenance record.
4. Provenance is never deleted — append only.
5. Agent identity is the tool/builder, not a persona name.

### Session 4b — 2026-07-01 (Phase 6 Hotfix: Remove tracked handoff env files)

| Field | Value |
|---|---|
| Session ID | 2026-07-01-004b |
| Date | 2026-07-01T06:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | none |
| Files modified | `.gitignore` (strengthened handoff env rules), `handoff/demo-pnw/managed/Caddyfile.managed` (reverted to `demo-pnw.org` placeholder), `HANDOFF.md` (hotfix note) |
| Files removed from tracking | `handoff/demo-pnw/managed/hermes/env`, `handoff/demo-pnw/managed/langfuse/env`, `handoff/demo-pnw/managed/litellm/env`, `handoff/demo-pnw/managed/open-webui/env`, `handoff/demo-pnw/managed/release-manifest.json` |
| Tests written | 0 |
| Tests passed | 270/270 |
| Beads written | 0 |
| Decisions | Architect ruling: no history rewrite; treat keys from commit 500c13b and earlier as non-production/invalid; `git rm --cached` untracked files, strengthened `.gitignore` with explicit per-service rules; files remain on local disk (gitignored) but not in HEAD |

### Session 5 — 2026-07-01 (Phase 7: Security CI QA Gates Docs)

| Field | Value |
|---|---|
| Session ID | 2026-07-01-005 |
| Date | 2026-07-01T18:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `scripts/secret-audit.mjs`, `scripts/generated-file-audit.mjs`, `scripts/test-discovery-audit.mjs`, `scripts/openspec-task-audit.mjs`, `scripts/verify-v06.mjs`, `.github/workflows/ci.yml`, `packages/core/tests/phase7-security-gates.test.js`, `docs/SECURITY-CHECKLIST.md`, `docs/CI-QA-GATES.md`, `docs/PHASE-7-PRODUCTION-HARDENING.md`, `docs/OPERATOR-MANUAL.md` |
| Files modified | `missionctl/missionctl.mjs` (+billingExportCommand, bundleSmoke 57→72 checks, +billing route, +help text), `package.json` (+5 npm scripts), `services/mission-api/tests/operator-api.test.js` (budget test isolation fix), `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` (P3-2 and P3-3 marked complete), `HANDOFF.md`, `docs/AGENT-PROVENANCE.md` |
| Tests written | 49 new tests in `packages/core/tests/phase7-security-gates.test.js` |
| Tests passed | 319/319 |
| Beads written | 0 |
| Decisions | Budget test state contamination (from prior missionctl validation run setting a low budget) fixed by isolating DATA_DIR in beforeEach/afterEach rather than resetting real mission-data; secret-audit.mjs uses isPlaceholder() check and skips comment/assertion lines to avoid false positives in test and template files; bundleSmoke reads .gitignore content (not execSync git ls-files) for the gitignore-rule checks to avoid ES module require() error; CI runs with no external secrets (all checks are local/dry-run) |

### Session 6 — 2026-07-02 (Phase 8: Final Demo Offer Handoff Package)

| Field | Value |
|---|---|
| Session ID | 2026-07-02-006 |
| Date | 2026-07-02T19:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `docs/PNW-NONPROFIT-OFFER.md`, `docs/MANAGED-AGENTS-AS-A-SERVICE.md`, `docs/SALES-DEMO-FLOW.md`, `docs/ONBOARDING-14-DAY-LAUNCH.md`, `docs/PRICING.md`, `docs/OBJECTIONS.md`, `docs/LEGAL-SAFETY-NOTES.md`, `docs/V0.7-FINAL-HANDOFF.md`, `docs/FINAL-RELEASE-CANDIDATE.md`, `docs/CLIENT-DEMO-SCRIPT.md`, `docs/IMPLEMENTATION-CHECKLIST.md`, `packages/core/tests/phase8-final-handoff.test.js` |
| Files modified | `missionctl/missionctl.mjs` (bundleSmoke 70→81 checks, +11 Phase 8 checks), `docs/AGENT-PROVENANCE.md`, `HANDOFF.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` |
| Tests written | 203 new tests in `packages/core/tests/phase8-final-handoff.test.js` |
| Tests passed | 522/522 |
| Beads written | 0 |
| Decisions | No GLM Phase 8 partial work existed locally (repo was clean at accepted remote main 49b8674); recovered by starting from accepted main and creating fresh phase/final-demo-offer-handoff branch; all docs written from scratch with no stubs, no fake guarantees, no placeholder text; Judge review embedded in FINAL-RELEASE-CANDIDATE.md (PASS verdict); bundleSmoke extended with 11 Phase 8 existence checks |

### Session 7 — 2026-07-03 (Phase 9 Gate 3: Hostinger VPS Staging Specs)

| Field | Value |
|---|---|
| Session ID | 2026-07-03-007 |
| Date | 2026-07-03T00:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-5 |
| MCPs used | github |
| Files created | `docs/HOSTINGER-PHASE-9-STAGING.md`, `docs/VPS-BOOTSTRAP-RUNBOOK.md`, `docs/PRODUCTION-ENV-GENERATION.md`, `docs/CADDY-DOMAIN-MAP.md`, `docs/POSTGRES-MIGRATION-RUNBOOK.md`, `docs/PHASE-9-GO-LIVE-GATES.md`, `packages/core/tests/phase9-vps-staging-docs.test.js` |
| Files modified | `HOSTINGER-VPS-HANDOFF.md`, `docs/V0.7-FINAL-HANDOFF.md`, `docs/FINAL-RELEASE-CANDIDATE.md`, `docs/PRODUCTION-GAPS.md`, `docs/SOVEREIGN-AI-CLIENT-STACK.md`, `docs/SECURITY-CHECKLIST.md`, `docs/AGENT-PROVENANCE.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md`, `missionctl/missionctl.mjs` (bundleSmoke extended with Phase 9 Gate 3 doc-existence checks), `HANDOFF.md` |
| Tests written | See `packages/core/tests/phase9-vps-staging-docs.test.js` |
| Tests passed | See final Gate 3 report in the pull request description |
| Beads written | 0 |
| Decisions | Gate 3 is specification/runbook only — no VPS provisioned, no DNS changed, no Vercel changed, no real secrets generated or committed, no live external calls; `docs/POSTGRES-MIGRATION-RUNBOOK.md` states plainly that `STORAGE_MODE=postgres` does not yet switch the application's read/write path off `JsonTenantStore`, and that Postgres RLS policies do not yet exist — both are honest gaps, not implemented features; all live VPS commands in `docs/VPS-BOOTSTRAP-RUNBOOK.md` are marked `LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES`; branch used matches the harness-designated session branch (`claude/gate-2-architect-review-xloule`) rather than the `phase9/hostinger-vps-staging-specs` name suggested in the task text, per the "never push to a different branch without explicit permission" rule |

### Session 8 — 2026-07-03 (Phase 9 Gate 4A: Ops Cockpit UX Audit + Build Triage)

| Field | Value |
|---|---|
| Session ID | 2026-07-03-008 |
| Date | 2026-07-03T17:30:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-5 |
| MCPs used | github |
| Files created | `docs/OPS-COCKPIT-BUILD-TRIAGE.md`, `docs/OPS-COCKPIT-USABILITY-AUDIT.md`, `docs/OPS-COCKPIT-DESIGN-POLISH-SPEC.md`, `packages/core/tests/phase9-ops-cockpit-ux-audit.test.js` |
| Files modified | `apps/site/package.json` (build script fix + `cross-env` devDependency), `package-lock.json`, `missionctl/missionctl.mjs` (bundleSmoke extended with Phase 9 Gate 4A doc-existence checks), `docs/AGENT-PROVENANCE.md`, `HANDOFF.md` |
| Tests written | `packages/core/tests/phase9-ops-cockpit-ux-audit.test.js` (65 tests) |
| Tests passed | See final Gate 4A report in the pull request description |
| Beads written | 0 |
| Decisions | Gate 3's carry-forward `npm run build` failure was root-caused (not just triaged): the sandbox's ambient `NODE_ENV=development` combined with Next.js 16.2.9's static-export worker path produces a React dev/prod dispatcher mismatch (`Cannot read properties of null (reading 'useContext')`); proven via 2/2 pass with `NODE_ENV=production` explicit vs. 2/2 fail with ambient env, and reproduced identically under both Turbopack and `--webpack`, ruling out a Turbopack-specific bug or app-code defect; fixed by changing `apps/site/package.json`'s `build` script to `cross-env NODE_ENV=production next build` (added `cross-env` as a devDependency for Windows/PowerShell/cmd.exe compatibility rather than a bare shell-only env-var prefix), verified stable across 4 total clean-`.next` rebuilds; this was a small, safe, narrowly-scoped fix within the audit gate's own permission to fix build blockers required to run the audit. UX audit used a live Chromium (Playwright, pre-installed) browser preview against `npm run dev:web` in addition to source reading; found two Blocker-severity issues: (1) `StatusBadge`'s `variant` prop is silently ignored, so every status on `/ops/deployments` renders as an identical green "Internal only" badge regardless of actual release/smoke/backup state — confirmed by source read, not just screenshot; (2) on mobile (≤980px), the full 19-item sidebar nav renders above all page content on every `/ops/*` route, confirmed via a live 390×844 screenshot showing ~1200px of nav before any page content appears. Also found the client-side `useEffect`-driven data fetches (opsApi calls) stalled indefinitely in this specific sandboxed `next dev` preview session (Turbopack HMR WebSocket handshake failures were visible in console), while the same API endpoints returned correctly via direct `curl` and via a manual `fetch()` call from the browser's own page context — documented honestly as a probable sandbox/proxy artifact, not asserted as a production bug, but used to motivate a real, code-level "no timeout/retry on stalled loads" finding (Finding X2) independent of its root cause. Design polish spec is proposal-only per Gate 4A scope — no `apps/site` UI code was changed to implement the spec's recommendations (only the unrelated build-script fix and audit/spec docs were added). |

### Session 9 — 2026-07-04 (Phase 9 Gate 4B: Ops Cockpit Design Polish)

| Field | Value |
|---|---|
| Session ID | 2026-07-04-009 |
| Date | 2026-07-04T00:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `packages/core/tests/phase9-ops-cockpit-design-polish.test.js`, multiple `apps/site/app/ops/*` page and component files (responsive sidebar, sticky header, card grids, approval queue, event feed, artifact browser, agent status, budget progress, health check, agents detail) |
| Files modified | `apps/site/app/ops/layout.tsx`, CSS modules, `missionctl/missionctl.mjs` (bundleSmoke extended), `docs/AGENT-PROVENANCE.md`, `HANDOFF.md` |
| Tests written | Phase 9 Gate 4B design polish test suite |
| Tests passed | All |
| Beads written | 0 |
| Decisions | Implemented all 11 design polish fixes from `docs/OPS-COCKPIT-DESIGN-POLISH-SPEC.md`. No live VPS changes, no Vercel config changes, no real secrets. PR #10 merged to main by Architect (merge commit af4d12a7). |

### Session 10 — 2026-07-04 (Phase 9 Gate 5A: Sovereign AI Offer Package)

| Field | Value |
|---|---|
| Session ID | 2026-07-04-010 |
| Date | 2026-07-04T00:00:00Z |
| Agent/Builder | Claude Code |
| Model | claude-sonnet-4-6 |
| MCPs used | github |
| Files created | `docs/SOVEREIGN-AI-OFFER-PACKAGE.md`, `docs/SOVEREIGN-AI-OFFER.md`, `docs/ONE-TIME-SETUP-FEE-OFFER.md`, `docs/MAINTENANCE-PACKAGE.md`, `docs/MANAGED-AGENT-SUPPORT-PACKAGE.md`, `docs/CLIENT-OWNED-STACK-AGREEMENT-NOTES.md`, `docs/SOVEREIGN-AI-FAQ.md`, `docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md`, `docs/IMPLEMENTATION-SOW-OUTLINE.md`, `packages/core/tests/phase9-sovereign-ai-offer-package.test.js` |
| Files modified | `docs/OFFER.md`, `docs/PRICING.md`, `docs/MANAGED-AGENTS-AS-A-SERVICE.md`, `docs/SOVEREIGN-AI-CLIENT-STACK.md`, `docs/PNW-NONPROFIT-OFFER.md`, `docs/ONBOARDING-14-DAY-LAUNCH.md`, `docs/LEGAL-SAFETY-NOTES.md`, `missionctl/missionctl.mjs` (bundleSmoke +10 Gate 5A checks), `HANDOFF.md`, `docs/AGENT-PROVENANCE.md`, `openspec/changes/mission-os-v0-6-managed-hermes-bundle/tasks.md` |
| Tests written | 31+ tests in `packages/core/tests/phase9-sovereign-ai-offer-package.test.js` |
| Tests passed | All |
| Beads written | 0 |
| Decisions | Gate 5A is docs/offer/spec only — no live deployment, no VPS changes, no Vercel changes, no DNS changes, no real secrets generated or committed; all pricing marked DRAFT — requires human approval before quoting; all legal docs marked: not legal advice, not a final contract, attorney review required; no fake live claims, no guaranteed outcomes, no SaaS subscription language; ownership model (client owns VPS, code, database, keys, Hermes, ICM, domain) stated consistently across all 9 new docs; hard blocks (GRANT_SUBMISSION, LEGAL_FINANCIAL_FILING, OUTBOUND_MESSAGE, PUBLIC_PUBLISHING) referenced in client-facing docs as non-negotiable structural constraints |
