# Phase 9B acceptance ledger — server + agent runtime

Base main: `a037088da76105ccaf7f8c58fa92d8b3437a7d0b`
Branch: `phase-9b/server-agent-runtime`

## Objective

Connect the completed ASC3ND Social Purpose OS client control plane to a persistent VPS runtime and wire First Mate missions to managed Hermes specialist agents without weakening the approval/execution boundary.

## Safety boundary

This phase may stage Mission API, Postgres, managed agents, workers, MCP and observability on the server. It must not change public ASC3ND DNS, redesign the frozen public site, send external messages, submit grants, make payments, publish campaigns, perform destructive migrations, or enable unrestricted external execution.

The existing action dispatcher and generic integration adapter are not approved for live external side effects until approval binding/idempotency and real provider execution are independently repaired and reviewed. Phase 9B therefore runs external adapters fail-closed/dry-run.

## Acceptance criteria

| Criterion | Required proof | Status |
| --- | --- | --- |
| Existing Netlify client remains current and separate from VPS runtime | Netlify project read + unchanged site ID | verified baseline |
| VPS runtime contract is reproducible | committed compose/env/runbook | planned |
| Mission API has persistent Postgres/data storage | compose + health/smoke proof | planned |
| First Mate routes domains to named specialist agents | deterministic route-map tests | planned |
| Hermes agents receive tenant/mission-scoped context only | Agent Service/API tests | planned |
| Agents can propose artifacts/events/approval requests | integration tests | planned |
| Agents cannot approve their own work | approval lifecycle regression | planned |
| External side effects remain disabled | config + execution-block tests | planned |
| Server deployment does not alter DNS | deployment workflow/runbook inspection | planned |
| Secrets stay outside repository | secret audit | planned |
| Staging deployment is reachable by controlled smoke test | VPS workflow/health evidence | planned |
| Rollback is one-command/documented | rollback procedure + prior SHA | planned |
| Independent review + exact-head CI pass | review + workflows | planned |

## Initial specialist map

- `proposal_generation`, `fundraising` -> `hermes-funding`
- `community_outreach`, `content`, `communications` -> `hermes-content`
- `evidence_synthesis`, `evaluation`, `data` -> `hermes-programs`
- `operations`, `planning`, fallback -> `hermes-ops`

## Rollback

Before server deployment, retain the prior `main` SHA and current Netlify deployment. Server rollout must be isolated under an ASC3ND staging directory and removable without touching the public website or DNS. Revert this branch/PR and stop the staging compose stack if any gate fails.
