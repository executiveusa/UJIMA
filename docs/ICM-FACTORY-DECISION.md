# ICM Factory Decision — Mission OS Phase 9A

**Decision date:** Phase 9A Gate 1  
**Status:** Accepted

---

## Existing ICM assets found

```
icm/README.md                      — layer model description
icm/tenant-template/               — canonical blank workspace template
  AGENT.md, CONTEXT.md, _config/
  stages/01_onboarding … 08_workspace_learning

icm/tenants/asc3nd/                — live workspace: Asc3nd Collective
icm/tenants/demo-pnw/              — live workspace: Demo PNW Nonprofit
icm/tenants/test-northwest-youth/  — live workspace: test tenant
```

`ensureIcmWorkspace()` in `packages/core/src/icm.js` creates tenant workspaces
from `stageDefinitions` (stages 01–08) and is already called by `missionctl tenant create`.

---

## What the two ICM paths do

| Path | Purpose | Who uses it | Frequency |
|---|---|---|---|
| `icm/tenants/<slug>/` | Ongoing tenant mission operations — grant apps, campaigns, outcomes, approvals | Mission agent for that tenant | Every mission task |
| `icm/workspaces/mission-os-client-factory/` | One-time deployment onboarding — intake through go-live | Mission OS operator deploying a new client | Once per new client |

---

## Chosen canonical factory path

`icm/workspaces/mission-os-client-factory/`

---

## Why the existing tenant-template is not sufficient

The existing `icm/tenant-template/` stages (01–08) describe **mission operations**: what the agent does once a client is live (scan opportunities, draft grants, run campaigns). They are correct for that purpose and are left unchanged.

The Phase 9A factory needs stages for **system deployment**: intake, knowledge ingestion, policy setup, bundle generation, VPS planning, training. These are different actors (operator, not mission agent), different artifacts (config bundles, deployment plans, not grant drafts), and happen once rather than repeatedly.

Merging these into the same stage numbering space would:
- Create ambiguity about whether stage 01 means "onboarding the client org" or "tenant mission onboarding"
- Force operators to skip irrelevant operational stages when onboarding
- Force mission agents to skip irrelevant deployment stages when running tasks

Two separate paths, clearly labeled, serve both purposes without confusion.

---

## How new client workspaces are created

1. Operator runs `missionctl tenant create <slug> --org "Org Name"` — creates mission-data and ICM tenant workspace in one step.
2. `ensureIcmWorkspace` creates `icm/tenants/<slug>/` from operational stage definitions.
3. Operator follows `icm/workspaces/mission-os-client-factory/` stage by stage to complete deployment.
4. Factory outputs (deployment plans, training docs) go into the factory's own `output/` folders.
5. Operational outputs (grant drafts, campaign assets) go into `icm/tenants/<slug>/stages/*/output/`.

---

## How human review gates work

Each factory stage has a `Human review gate` section in its CONTEXT.md. The gate specifies:
- What output the human must review before the next stage begins
- What risk classification applies
- What approval record is required (if any)

The mission agent never auto-advances through a factory stage. Each gate is a hard stop.

---

## How ICM outputs map to Mission OS artifacts

Factory outputs do not auto-register as Mission OS artifacts (they are operator documents, not tenant artifacts). Operational tenant outputs do register via `onArtifact` callback in `runIcmStage()` when wired to the artifact registry.

---

## What was not duplicated

- `icm/tenant-template/` stages 01–08: unchanged, still canonical operational template
- `ensureIcmWorkspace()`: unchanged, still called by `missionctl tenant create`
- Existing tenant workspaces: unchanged

---

## Commands

```bash
missionctl icm init <tenant>       # create/refresh ICM tenant workspace
missionctl icm tree <tenant>       # list ICM workspace tree
missionctl icm validate <tenant>   # validate all required stages and files exist
```

These operate on `icm/tenants/<slug>` (operational workspaces), not the factory.

---

## What remains deferred

- `missionctl icm stage run <slug> <stage>`: execution bridge deferred (live AI call, not dry-run)
- Factory stage output automation: operator fills factory outputs manually or with agent assistance
- Factory-to-artifact pipeline: factory outputs are not yet registered in Mission OS artifact registry
