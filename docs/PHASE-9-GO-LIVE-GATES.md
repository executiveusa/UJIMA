# Phase 9 Go-Live Gates — Mission OS

**Audience:** Operator, Architect, client stakeholder signing off on go-live
**Purpose:** Hard checklist of gates that must pass, in order, before Mission OS + Hermes + LiteLLM + Langfuse + Open WebUI go live on a client's Hostinger VPS
**Rule:** No gate may be skipped. A gate that fails stops the rollout at that point until the failure action is resolved.

---

## How to use this checklist

Each gate below defines an **owner**, the **commands** that produce evidence, the **evidence required** to mark the gate passed, the **failure action** if the gate does not pass, and the **rollback or stop condition**. Work through gates in order (A → N). Do not start a later gate before an earlier one has passed — later gates assume earlier ones are true.

---

## Gate A — Repo verification

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `git status`, `git log --oneline -5`, `npm ci`, `node --version` (must be ≥ 20.11.0) |
| Evidence required | Clean working tree at the exact commit that passed CI and Architect review; `npm ci` completes without error |
| Failure action | Do not proceed. Re-clone from the approved commit. |
| Rollback / stop condition | If the working tree has uncommitted or unapproved changes, stop and get Architect sign-off before continuing. |

## Gate B — Clean secrets

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node scripts/secret-audit.mjs`, `git ls-files \| grep -E 'handoff/.*/managed/(hermes\|langfuse\|litellm\|open-webui)/env'` (expect no output), `git ls-files \| grep -E '^mission-data/\|^backups/'` (expect no output) |
| Evidence required | `secret-audit` reports 0 findings; both `grep` checks return no matches |
| Failure action | Remove the tracked secret file with `git rm --cached`, strengthen `.gitignore`, re-run audit |
| Rollback / stop condition | Do not deploy with any secret-audit finding open. Treat any finding as a stop-the-line event. |

## Gate C — Tenant config

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs tenant create <slug> --org "<Org Name>"`, `node missionctl/missionctl.mjs doctor`, `node missionctl/missionctl.mjs pack validate <slug>` |
| Evidence required | Tenant profile exists; doctor passes; pack validate reports all required files present |
| Failure action | Re-run `pack generate <slug>`; investigate missing files before proceeding |
| Rollback / stop condition | `tenant create` is idempotent per slug; if misconfigured, delete `mission-data/<slug>/` on the VPS (not in this repo) and recreate |

## Gate D — DNS/TLS

| Field | Detail |
|---|---|
| Owner | Client (DNS access) + Operator (verification) |
| Commands | `dig os.<client-domain>`, `dig api.<client-domain>` (confirm A records resolve to the VPS IP); after Caddy starts: `curl -I https://os.<client-domain>` |
| Evidence required | DNS A records for `os.<client-domain>` and `api.<client-domain>` resolve to the VPS IP; Caddy issues a valid TLS certificate (no browser warning, `curl -I` returns `HTTP/2 200` or expected redirect) |
| Failure action | Confirm DNS propagation (can take up to 24–48 hours); confirm ports 80/443 are open (Gate E); confirm Caddyfile domain matches DNS exactly |
| Rollback / stop condition | Do not route production traffic through a domain without valid TLS. If TLS issuance fails repeatedly, stop and investigate before exposing the site publicly. |

## Gate E — Docker Compose config

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `docker compose -f handoff/<slug>/managed/docker-compose.managed.yml config` |
| Evidence required | Config resolves cleanly with no error; manual review confirms no placeholder value (`change_me`, `CHANGE_THIS_BEFORE_DEPLOY`) remains in the resolved output |
| Failure action | Regenerate credentials per `docs/PRODUCTION-ENV-GENERATION.md`; re-run `bundle up --dry-run` |
| Rollback / stop condition | Do not run `docker compose up` while any placeholder credential is present in the resolved config |

## Gate F — Postgres migration/restore drill

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | See `docs/POSTGRES-MIGRATION-RUNBOOK.md` — backup creation, restore drill, row count verification |
| Evidence required | A completed restore drill on a disposable copy of the environment, with dashboard/events/artifacts/approvals confirmed restored and `bundle smoke` passing post-restore |
| Failure action | Do not proceed to live Postgres cutover. File-backed mode remains the active storage path (see honesty note in `docs/POSTGRES-MIGRATION-RUNBOOK.md`) until this gate passes with real evidence. |
| Rollback / stop condition | If Postgres mode is not implemented/wired yet (current build state), this gate is satisfied by confirming file-backed backup/restore works and by explicitly documenting that Postgres cutover is deferred — do not claim Postgres is live without the drill. |

## Gate G — Hermes dry-run check

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs hermes provision <slug>`, `node missionctl/missionctl.mjs hermes health <slug>`, `node missionctl/missionctl.mjs bundle smoke <slug> --dry-run` |
| Evidence required | Hermes config files generated (`SOUL.md`, `MEMORY.md`, `USER.md`, skills); health check reports config present; bundle smoke passes with all Hermes-related checks green |
| Failure action | Re-run `hermes provision`; check `handoff/<slug>/managed/hermes/` for missing files |
| Rollback / stop condition | Do not start the live Hermes container until this gate passes and Gate N (final human signoff) explicitly approves live Hermes execution — Hermes remains dry-run by default per `docs/HERMES-AGENT-SERVICE-API.md` |

## Gate H — LiteLLM budget check

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs model budget show <slug>`, `node missionctl/missionctl.mjs litellm sync <slug>` |
| Evidence required | A monthly budget is configured for the tenant (`monthlyBudgetUsd` is set, not left at an unbounded default); LiteLLM config generated with virtual key surfaces |
| Failure action | Run `model budget set <slug> --monthly-usd <amount>` before proceeding |
| Rollback / stop condition | Do not connect real provider API keys to LiteLLM until a budget is configured and reviewed by the client |

## Gate I — Langfuse redaction check

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs langfuse sync <slug>`; manual review of `packages/core/src/langfuse-metadata.js` redaction rules against the tenant's data classes |
| Evidence required | Langfuse trace metadata builder confirmed to redact sensitive fields (`secret`, `password`, `token`, `key`, `jwt`, `credential`) before any trace is emitted |
| Failure action | Do not enable live Langfuse trace emission until redaction is confirmed for the tenant's specific data (e.g., youth records, donor PII) |
| Rollback / stop condition | If any sensitive field type used by this tenant is not covered by the redaction list, stop and extend the redaction rules before go-live |

## Gate J — Open WebUI access-control check

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs openwebui sync <slug>`; review `docs/CADDY-DOMAIN-MAP.md` protected-route rules for Open WebUI |
| Evidence required | Open WebUI is not reachable on a public route without an access-control layer (SSH tunnel, VPN, or authenticated Caddy route); staff signup is not left open to the public internet |
| Failure action | Move Open WebUI off any public Caddy route; add `basic_auth` or forward-auth if a subdomain route is required |
| Rollback / stop condition | Do not go live with Open WebUI reachable by an unauthenticated public URL |

## Gate K — Backup/restore drill

| Field | Detail |
|---|---|
| Owner | Operator |
| Commands | `node missionctl/missionctl.mjs backup create <slug>`, `node missionctl/missionctl.mjs backup list <slug>`, restore drill per `docs/POSTGRES-MIGRATION-RUNBOOK.md` / `docs/BACKUP-RESTORE.md` |
| Evidence required | A backup is created with a valid checksum; a restore into a clean state succeeds; this drill is mandatory before go-live regardless of storage mode |
| Failure action | Do not go live without a passing restore drill. Investigate and fix the backup/restore path before proceeding. |
| Rollback / stop condition | This gate itself is a rollback rehearsal — if it fails, the team does not yet have a working rollback path, which blocks go-live entirely |

## Gate L — Staff login test

| Field | Detail |
|---|---|
| Owner | Client staff + Operator |
| Commands | Manual: staff member logs into `https://os.<client-domain>/login` with credentials generated per `docs/PRODUCTION-ENV-GENERATION.md`; confirm `/ops` dashboard loads |
| Evidence required | At least one real staff member (not the demo admin account) successfully logs in and views the ops dashboard |
| Failure action | Investigate auth/session issues; confirm `JWT_SECRET` is set correctly and not a dev default |
| Rollback / stop condition | Disable or rotate the demo admin account before go-live once a real staff login is confirmed working |

## Gate M — Approval workflow test

| Field | Detail |
|---|---|
| Owner | Client staff + Operator |
| Commands | Manual: trigger a dry-run orange-risk-class action (e.g., via `POST /api/agent/approvals/request` in dry-run), confirm it appears in `/ops` pending approvals, confirm a staff member can approve/reject it |
| Evidence required | An approval record is created, visible to staff, and can be approved or rejected through the ops dashboard; self-approval by the requesting agent is confirmed blocked |
| Failure action | Do not go live if the approval workflow does not correctly gate orange/red actions — this is a non-negotiable safety boundary per `docs/LEGAL-SAFETY-NOTES.md` |
| Rollback / stop condition | Any failure here blocks go-live entirely, independent of all other gates |

## Gate N — Final human signoff

| Field | Detail |
|---|---|
| Owner | Client stakeholder with authority over the deployment (not the operator alone) |
| Commands | None — this is a human decision gate, not an automated check |
| Evidence required | Explicit written or recorded approval from the client stakeholder, confirming Gates A–M have all passed and they accept the deployment as staged |
| Failure action | Do not run `docker compose up -d` (Step 19 in `docs/VPS-BOOTSTRAP-RUNBOOK.md`) without this signoff |
| Rollback / stop condition | If signoff is withheld or conditional, resolve the stated condition and re-present for signoff before running any live command |

---

## Summary table

| Gate | Name | Blocks |
|---|---|---|
| A | Repo verification | All subsequent gates |
| B | Clean secrets | All subsequent gates |
| C | Tenant config | D–N |
| D | DNS/TLS | Public traffic routing |
| E | Docker Compose config | `docker compose up` |
| F | Postgres migration/restore drill | Postgres cutover (not the current storage path) |
| G | Hermes dry-run check | Live Hermes execution |
| H | LiteLLM budget check | Live model routing |
| I | Langfuse redaction check | Live trace emission |
| J | Open WebUI access-control check | Open WebUI exposure |
| K | Backup/restore drill | Go-live (mandatory, no exceptions) |
| L | Staff login test | Go-live |
| M | Approval workflow test | Go-live (non-negotiable safety boundary) |
| N | Final human signoff | The only gate that authorizes `docker compose up -d` |

No gate in this list is satisfied by a dry-run pass alone when the gate explicitly requires a live drill (F, K) or a human decision (N). Do not mark a gate passed based on assumption — each gate's evidence must be produced and reviewable.
