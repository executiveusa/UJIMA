# Live Staging Preparation Pack — Mission OS Gate 6A

**Type:** Operator reference — pre-deployment preparation index  
**Status:** Gate 6A — preparation only. No live deployment has occurred.  
**Branch:** `phase9/live-staging-preparation-pack`  

> **Gate 6A does not perform live deployment. Live staging requires a separate explicit Architect approval after all required inputs are provided.**

---

## Purpose

Gate 6A assembles everything an operator needs to be ready for a live VPS deployment — before touching any real server. It does not deploy. It does not SSH. It does not change DNS. It creates the forms, checklists, runbooks, and safety guardrails so that when Architect approves Gate 6B (live staging execution), the operator can move through the deployment with confidence and without improvising.

---

## What Gate 6A prepares

- A VPS and domain intake form — structured collection of required inputs (no secrets)
- A live staging preflight checklist — hard go/no-go gates with owners, evidence, and failure actions
- A deployment-day runbook — ordered steps for the future live deployment day, with all live commands gated behind explicit Architect approval
- A staging rollback runbook — what to do if deployment fails
- A first live client safety checklist — prevents overclaiming or unsafe first-day actions
- An environment readiness validator spec — defines local-only checks that must pass before live commands run
- A local-only readiness script — verifiable local checks with no network, SSH, DNS, or Docker calls
- An updated index of all relevant runbooks and their status

---

## What Gate 6A does not do

- Does not SSH into any VPS
- Does not change DNS records
- Does not run remote Docker containers
- Does not generate real secrets or commit `.env` files
- Does not call live external services (no API calls, no model routing)
- Does not deploy the application
- Does not change Vercel, auth, or the separate Asc3nd frontend
- Does not merge without Architect review
- Does not start live staging — that is Gate 6B

---

## Required inputs before live staging (Gate 6B)

None of the following exist yet. Gate 6B cannot begin until all are provided by the human stakeholder.

| Input | Source | Status |
|---|---|---|
| VPS IP address | Client / operator with billing access | Not yet provided |
| VPS provider and region | Client / operator | Not yet provided |
| SSH access method (key or password) | Client / operator | Not yet provided |
| Ubuntu version confirmed | Operator after VPS access | Not yet verified |
| Domain registered and DNS access confirmed | Client | Not yet confirmed |
| Staging domain defined | Operator / client | Not yet defined |
| AI model provider API key (type only, no key value here) | Client | Not yet confirmed |
| Client operator named | Client | Not yet confirmed |
| Go-live approver named | Client stakeholder | Not yet confirmed |
| Backup destination confirmed | Operator / client | Not yet decided |
| Legal/compliance flags reviewed | Client + attorney if applicable | Not yet confirmed |
| Pricing/scope approved if client-facing | Architect | Not yet confirmed |

Complete `docs/VPS-DOMAIN-INTAKE-FORM.md` to collect these inputs.

---

## Required approvals before live staging

Live staging (Gate 6B) requires all of the following before any VPS command runs:

1. **Architect approval** — explicit written approval to begin Gate 6B
2. **Client stakeholder acceptance** — client accepts the go-live scope, timeline, and responsibilities
3. **Preflight checklist completed** — all gates in `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` pass
4. **VPS/domain intake form completed** — all required fields in `docs/VPS-DOMAIN-INTAKE-FORM.md` filled by a human
5. **Legal/compliance flags resolved** — any flag raised in `docs/DISCOVERY-INTAKE-FORM.md` Section 8 is cleared or documented with a legal review conclusion
6. **Rollback plan reviewed** — client and operator have read `docs/STAGING-ROLLBACK-RUNBOOK.md`
7. **First live client safety constraints reviewed** — operator and client have read `docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md`

---

## Operator workflow for Gate 6A

1. Read all items in the "Read first" list below
2. Complete `docs/VPS-DOMAIN-INTAKE-FORM.md` (fill or note "not yet provided" for each field)
3. Run `node scripts/phase9-live-staging-readiness.mjs` — confirm all local checks pass
4. Run `node scripts/verify-v06.mjs` — confirm 8/8 gates pass
5. Run `node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run` — confirm smoke passes
6. Review `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` against current project state — mark which hard gates pass locally and which require VPS access
7. Review `docs/DEPLOYMENT-DAY-RUNBOOK.md` — confirm operator is familiar with all steps
8. Review `docs/STAGING-ROLLBACK-RUNBOOK.md` — confirm rollback path is understood
9. Review `docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md` — confirm first-day constraints
10. Submit Gate 6A deliverables to Architect for review
11. Do not start Gate 6B until Architect approves and all required inputs are provided

---

## File map — Gate 6A

| File | Type | Purpose |
|---|---|---|
| `docs/LIVE-STAGING-PREPARATION-PACK.md` | This doc | Master index for Gate 6A |
| `docs/VPS-DOMAIN-INTAKE-FORM.md` | Form | Collect required VPS/domain/operator inputs |
| `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` | Checklist | Hard go/no-go gates before live deployment |
| `docs/DEPLOYMENT-DAY-RUNBOOK.md` | Runbook | Ordered steps for the future live deployment day |
| `docs/STAGING-ROLLBACK-RUNBOOK.md` | Runbook | Rollback triggers, path, and post-rollback report |
| `docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md` | Checklist | Safety constraints for first live client deployment |
| `docs/ENVIRONMENT-READINESS-VALIDATOR-SPEC.md` | Spec | Defines intended validator checks (local + VPS) |
| `scripts/phase9-live-staging-readiness.mjs` | Script | Local-only readiness checks (no network/SSH/Docker) |
| `packages/core/tests/phase9-live-staging-preparation.test.js` | Tests | Verifies all Gate 6A docs exist and contain required content |

---

## Relevant runbooks (pre-existing)

| Document | Status | Purpose |
|---|---|---|
| `docs/HOSTINGER-PHASE-9-STAGING.md` | Gate 3 — spec only | Target staging topology |
| `docs/VPS-BOOTSTRAP-RUNBOOK.md` | Gate 3 — spec only | 19-step VPS bootstrap from empty server to running bundle |
| `docs/PRODUCTION-ENV-GENERATION.md` | Gate 3 — spec only | Secret inventory, generation commands, rotation checklist |
| `docs/CADDY-DOMAIN-MAP.md` | Gate 3 — spec only | Public/protected/internal routes and TLS behavior |
| `docs/POSTGRES-MIGRATION-RUNBOOK.md` | Gate 3 — spec only | File-backed → Postgres migration path |
| `docs/PHASE-9-GO-LIVE-GATES.md` | Gate 3 — spec only | Gates A–N: ordered go-live checklist |
| `docs/DEPLOYMENT-LIFECYCLE.md` | Built in Phase 4 | Bundle, upgrade, rollback, backup lifecycle |
| `docs/BACKUP-RESTORE.md` | Built in Phase 4 | Backup creation, listing, restore |
| `docs/LEGAL-SAFETY-NOTES.md` | Built in Phase 8 | Safety and hard-block reference |
| `docs/SECURITY-CHECKLIST.md` | Built in Phase 8 | Pre-release security gates |

---

## Go/no-go summary

**Gate 6A is complete when:**
- All Gate 6A documents exist and pass the test suite
- Local readiness script passes
- Preflight checklist reviewed against current project state
- Architect reviews and approves Gate 6A

**Gate 6B may begin only when:**
- Gate 6A is accepted by Architect
- All required inputs in `docs/VPS-DOMAIN-INTAKE-FORM.md` are provided by a human
- Architect issues explicit written approval to begin live staging

---

*Gate 6A is preparation only. No live deployment, SSH, DNS change, or real secret generation occurs here. Live staging is Gate 6B.*
