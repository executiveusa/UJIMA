# Hermes ICM Runtime — Mission OS v0.6

## Overview

This document defines how Hermes agent workers operate within ICM (Interpretable Context Methodology) stage contracts. Hermes is not a free-roaming agent. It works inside numbered stage folders, reads context from CONTEXT.md contracts, writes outputs to stage output folders, and calls back to Mission OS for every event, artifact, approval, and budget check.

Mission OS owns all persistent state. Hermes owns ephemeral execution context only.

## ICM folder structure Hermes operates in

```
icm/tenants/<tenantId>/
  AGENT.md                     ← Hermes reads this first (agent identity)
  CONTEXT.md                   ← Hermes reads this second (workspace routing)
  _config/
    mission.md                 ← stable Layer 3 context
    brand.md
    safety-policy.md
    model-routing.md
    seattle-resources.md
  stages/
    01_onboarding/
      CONTEXT.md               ← Hermes reads stage contract
      references/              ← Hermes reads reference files
      output/                  ← Hermes writes outputs here
    02_opportunity_scan/
    03_grant_application/
    04_campaign_creation/
    05_approval_gate/
    06_publish_or_submit/
    07_outcome_logging/
    08_workspace_learning/
```

Hermes loads context in strict order. It does not read outside the current stage's scope unless the stage CONTEXT.md explicitly lists cross-stage references.

## How Hermes reads context

1. **AGENT.md** — agent identity, rules, what the agent must never skip
2. **CONTEXT.md** (workspace root) — tenant slug, org name, routing instruction
3. **stages/<stage>/CONTEXT.md** — stage contract: inputs, process, outputs, approval requirement, allowed tools, forbidden actions, validation, done-when criteria
4. **_config/*.md** — Layer 3 stable config (mission, brand, safety, model routing, local resources)
5. **stages/<stage>/references/*.md** — Layer 3 reference files specific to this stage
6. **stages/<previous>/output/*.md** — Layer 4 prior stage outputs, only when listed in the stage contract

Hermes loads only what the stage CONTEXT.md lists. Loading files not listed is a contract violation.

## How Hermes writes outputs

Hermes writes stage output through the Mission OS Agent Service API, not directly to disk:

```
POST /api/agent/artifacts
```

This routes through the artifact registry, which enforces:
- Tenant boundary validation
- Directory traversal protection
- Approval class assignment
- Event emission

Hermes does not write directly to `icm/tenants/<tenantId>/` except through Mission OS APIs. The exception: development/testing environments where the `missionctl icm` commands write directly.

## ICM stage contracts Hermes must obey

Each stage CONTEXT.md contains:

| Section | Hermes behavior |
|---|---|
| `## Inputs` | Load exactly these files, no more |
| `## Process` | Follow this process; produce artifact, not vague advice |
| `## Outputs` | Write outputs to `output/` folder via artifact API |
| `## Human review gate` | Stop; do not advance to next stage without approval record |
| `## Allowed tools` | Only use listed tools |
| `## Forbidden actions` | These actions are blocked; do not attempt |
| `## Validation` | Self-check before reporting done |
| `## Done when` | Only mark run complete when all criteria are met |

Hermes cannot skip the `## Human review gate` step. After producing stage outputs, Hermes calls:

```
POST /api/agent/approvals/request
```

and then sets run status to `awaiting_review`. The stage does not advance until a human approves.

## Human review gates remain mandatory

The following ICM stages have mandatory human gates before any external action:

| Stage | Gate |
|---|---|
| 03_grant_application | Human review of draft before any submission |
| 04_campaign_creation | Human review of copy before Postiz/email scheduling |
| 05_approval_gate | Operator approves risk class before execution |
| 06_publish_or_submit | Human signs off before external publish/submit |

Even if Hermes produces a complete, high-quality draft, it does not proceed past these gates autonomously.

## Mission OS owns state; Hermes does not

| Resource | Owner | How Hermes accesses it |
|---|---|---|
| Tenant records | Mission OS | GET /api/agent/context/:tenantId |
| ICM workspace | Mission OS (disk) | Read via file system in dry-run; via API in Phase 9B |
| Events | Mission OS | POST /api/agent/events |
| Artifacts | Mission OS | POST /api/agent/artifacts |
| Approvals | Mission OS | POST /api/agent/approvals/request |
| Model budgets | Mission OS | Read via GET /api/agent/context/:tenantId |
| Trace links | Langfuse (external) | Hermes emits; Mission OS stores trace ID reference |
| Run records | Mission OS | POST /api/agent/runs, GET /api/agent/runs/:id |

Hermes does not write directly to `mission-data/<tenantId>/`. All writes go through Mission OS API endpoints.

## Hermes never bypasses Mission OS policy

The policy layer is enforced at the API level. Hermes cannot bypass it by:

- Using a different API path
- Calling external services directly
- Writing directly to tenant data files
- Cross-tenant requests (blocked at auth layer)
- Self-approving (blocked at approval lifecycle layer)

Even if Hermes has a valid operator key, the hard-blocked action types (`GRANT_SUBMISSION`, `LEGAL_FINANCIAL_FILING`, etc.) are rejected at the policy layer before any run is created.

## Dry-run vs. live execution

| Dimension | Phase 9A (dry-run) | Phase 9B (live) |
|---|---|---|
| Hermes connection | None — config files only | Live Hermes container via worker contracts |
| Model calls | None | LiteLLM routing with budget enforcement |
| ICM context read | Mission OS serves from disk | Same — disk-backed, stable |
| Stage outputs | Dry-run artifact records | Real artifact content via storage backend |
| Approval gates | File-backed, no notifications | File-backed + operator notification |
| Human review gates | Required — same as live | Required — same as dry-run |

The human review gates are identical in dry-run and live modes. The gate is not a dry-run feature — it is permanent.

## Hermes identity and scope

Each tenant's Hermes agent is defined by:

```
handoff/<tenantId>/managed/hermes/SOUL.md     — agent identity
handoff/<tenantId>/managed/hermes/MEMORY.md   — runtime state
handoff/<tenantId>/managed/hermes/USER.md     — staff context
handoff/<tenantId>/managed/hermes/skills/     — 8 skill definitions
```

These files are generated by `missionctl hermes provision <tenantId>` and are gitignored. They are not ICM stage contracts — they are the agent's runtime identity, loaded by the Hermes container at startup.

The ICM workspace is the mission control surface. Hermes SOUL.md is the agent's compass. They are separate layers that complement each other.

## Deferred items (Phase 9B)

- Live Hermes container provisioning and health check
- Real model calls through LiteLLM with budget enforcement
- Langfuse trace emission per run
- Binary asset upload to configured storage backend
- Approval notifications to operator channel
- Stage advancement automation (human gate enforcement via webhook)
