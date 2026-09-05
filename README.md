# UJIMA OS

UJIMA is a sovereign, installable agentic operating system for nonprofits, community organizations, volunteer teams, NGOs, and other mission-driven organizations.

Its job is simple:

> Tell UJIMA what needs to get done. It works, brings people in when judgment matters, leaves proof, and remembers what it learned.

## Product model

UJIMA is the product. Client organizations are isolated tenants.

- **UJIMA** — reusable product, runtime, workflows, approvals, evidence, agent routing, installation tooling.
- **ASC3ND** — Client 01 and an active proving ground.
- **Grant Agent** — first official specialist vertical, federated through UJIMA rather than duplicated inside it.

## Core loop

```text
HUMAN
  ↓
GOAL
  ↓
ICM — organizational truth, policy, evidence, memory
  ↓
WORKFLOW — manual / cron / event / webhook / watch
  ↓
CAPABILITY ROUTER
  ↓
specialist runtime / agent / API / computer operator
  ↓
APPROVAL when judgment or authority is required
  ↓
VERIFY
  ↓
RESULT + EVIDENCE
  ↓
LEARN
```

## Human experience

**WE HANDLE IT → YOU APPROVE IMPORTANT DECISIONS → YOU SEE RESULTS.**

UJIMA should reduce administrative burden, not create another system the organization must learn to operate.

## Architecture laws

- One fact, one canonical home.
- One owner per truth.
- The browser/computer operator is never the orchestrator.
- Native API → MCP → CLI → structured browser → Open Interpreter → visual GUI automation.
- Consequential actions remain approval-gated.
- No proof, no completion claim.
- Reuse before adding.
- Ship only what can come back.
- The organization owns its repository, data, deployment, credentials, and export path.

See `CONTEXT.md`, `ICMR.yaml`, and `docs/UJIMA-ARCHITECTURE.md`.

## Repository layout

- `apps/site/` — public UJIMA surface and operator workspace.
- `services/` — reusable backend services.
- `packages/` — shared runtime/data/adapters.
- `control-plane/` — durable ledgers, policy and execution contracts.
- `icm/` — tenant truth and numbered execution contexts.
- `.agents/skills/` — specialist execution skills.
- `_shared/` — product doctrine and shared standards.

Some internal package names still use the historical `@asc3nd/*` namespace for compatibility. They are implementation identifiers, not product identity, and should be migrated only in a dedicated dependency-safe slice.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Default local surfaces:

- Public site: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Ops workspace: `http://localhost:3000/ops`
- API health: `http://localhost:4000/api/health`

## Verification

```bash
npm run guard:repo
npm test
npm run build
node missionctl/missionctl.mjs doctor
```

Production is not considered verified merely because a deployment exists. The exact revision must be deployed and the primary user journey must be exercised against the live runtime.

## Deployment

Canonical public frontend: **https://ujima-ai.netlify.app**  
Canonical Netlify project: **`ujima-ai`**  
Canonical Netlify site ID: **`9b49e86d-7399-4eb2-b6de-d7a360c27bba`**

These values are locked in `deployment-lock.json` and `ICMR.yaml`. `ujima-os.netlify.app` is not the canonical UJIMA public target.

ASC3ND-specific runtime configuration must not be treated as UJIMA product defaults.

## Current status

UJIMA is a brownfield product with substantial working infrastructure. The current normalization program is consolidating legacy ASC3ND / Mission OS / Agenix naming into one coherent UJIMA product while preserving tenant history and proven runtime behavior.
