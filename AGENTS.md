# AGENTS.md — ASC3ND Social Purpose OS

This is the mandatory first read for every human or AI agent working on ASC3ND.

## Boot law

Before broad repository reading, edits, migrations, asset generation, publishing, or deployment:

1. Read `REPO_SCOPE.md` and `repo-boundary.json` in the current repository.
2. Read the central control plane in this repository:
   - `control-plane/README.md`
   - `control-plane/repo-registry.json`
   - `control-plane/contract-ledger.json`
   - `control-plane/task-ledger.json`
   - `control-plane/architecture.md`
   - the current numbered stage under `icm/asc3nd-contract-closeout/`
3. Run `npm run guard:repo` before build or deployment work.
4. Use JCodeMunch MCP first: `plan_turn`, file outlines, symbol search, symbol source, importers, and blast radius. Do not load whole repositories when targeted retrieval is sufficient.
5. Record every claimed fact with a source path, URL, database query, transcript timestamp, or human approval.
6. Work only inside the current stage's allowed outputs.
7. Stop at approval gates. Silence is not approval.

## Product boundary

The backend is reusable product infrastructure. Client-specific facts enter through approved tenant manifests and artifacts, not platform defaults.

Route work as follows:

- Public website and Community Cuts funnel → `executiveusa/asc3nd-frontend-website-`
- Client answers, paid scope, workbook → `executiveusa/asce3nd-interactive-document`
- Brand masters, QR, templates → `executiveusa/asc3nd-brand-kit-`
- Design experiments → `executiveusa/ascend-demonstration-page`
- Reusable workflows, approvals, adapters, task ledger → this repository

## ICM law

Do not replace ICM with a hidden swarm. Numbered folders are the orchestration layer.

Each stage contains:

- `INPUT.md` — permitted sources
- `INSTRUCTIONS.md` — role, task, constraints
- `OUTPUTS.md` — required artifacts and acceptance tests
- `STATUS.json` — machine-readable state and proof

One stage reads only its own files plus explicitly linked prior outputs. Scripts perform deterministic work. Agents perform judgment. Irreversible actions require human approval.

Sub-agents may perform bounded work in parallel, but the orchestrator owns reconciliation, evidence, and the final state update.

## Contract truth

The current paid engagement is **$2,450**, not $2,500. Contracted outputs are:

1. Interactive bilingual strategy workbook on the client's URL with cloud autosave
2. Four guided strategy sessions
3. EN/ES bilingual support throughout
4. Twelve-week / 90-day content calendar
5. Thirty-post caption bank
6. Month 1 shot list and visual-direction guide
7. Platform bio updates for up to three platforms
8. A handoff system the client can operate without MACS after Day 60

Website, RSVP, full brand redesign, advanced Meta automation, and general software-platform work are separate enhancements unless a signed amendment says otherwise.

## Safety and editorial law

- No automated red/orange action without approval.
- Youth data, public claims, donor outreach, legal/financial work, outbound communication, production deploys, DNS, database migrations, and publishing are approval-gated.
- Do not expose secrets or private media.
- Do not use trauma, poverty, youth vulnerability, or family hardship as spectacle.
- Do not fabricate completion. `done` requires evidence.

## Required boundary response

```text
REPOSITORY_BOUNDARY_STOP
Requested work: <summary>
Current repository: <repository>
Reason it does not belong here: <reason>
Correct destination: <repository>
Required handoff artifact: <issue/PR/file/schema/media manifest>
```

## Current operating roles

- **GLM 5.2:** contract-closeout orchestrator and raw implementation agent.
- **This ChatGPT thread:** architecture, connected-tool work, quality control, small edits, decisions, and final verification.
- **Human:** initial source/credential/approval input and final client approval. Human intervention inside the workflow should be limited to explicit gates.

## Coding loop

1. Read control-plane and current ICM stage.
2. Use JCodeMunch for targeted discovery.
3. Inspect docs and conventions.
4. Update task claim before editing.
5. Add or update tests.
6. Implement in the correct repository only.
7. Run local tests, boundary guard, and smoke tests.
8. Attach proof and update `STATUS.json` / task ledger.
9. Open a PR; do not silently deploy production.