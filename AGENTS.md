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
5. For multi-step work, initialize/query Beads and work from the ready graph before editing. Read `.agents/skills/beads-observability/SKILL.md`.
6. Read `.agents/skills/i-have-adhd/SKILL.md` for operator-facing responses and handoffs. In this repository its actionability rules are always-on unless the human explicitly requests normal mode.
7. Record every claimed fact with a source path, URL, database query, transcript timestamp, or human approval.
8. Work only inside the current stage's allowed outputs.
9. Stop at approval gates. Silence is not approval.

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

## Beads law

ICM owns interpretable context and stage contracts. Beads owns the durable work graph and agent movement history.

For multi-step client work:

- run `bd init --init-if-missing` in a working checkout;
- run `bd ready` before starting;
- one bounded outcome per Bead;
- record dependencies instead of hiding sequencing in prose;
- record ownership, handoffs, blockers, approval gates, and proof expectations;
- close Beads only after verification evidence exists;
- run `bd doctor` before major delivery or after Beads upgrades/migrations;
- never store secrets or sensitive client/youth data in Beads.

Client-facing UIs consume a safe projection of Beads state; they do not expose raw agent internals by default.

## Operator-output law — i-have-adhd

The upstream `i-have-adhd` skill is an **agent communication/output skill**, not a visual-design system. Use it exactly for the friction it solves: making work easy to start, resume, and finish.

For every operator-facing status, task handoff, approval request, error report, or agent completion report:

1. Lead with the next action or current decision, not a preamble.
2. Number multi-step work, one bounded action per step.
3. Restate the current state each turn (`step 3 of 5`, `2 approvals left`, etc.).
4. Make completed work visible and give concrete time estimates when useful.
5. Suppress tangents; if anything remains open, end with one concrete next action.

Cap routine lists at five items by splitting `do now` from `later` when needed. Errors are matter-of-fact: location → cause → fix.

Do **not** label or diagnose a client as having ADHD. Client-facing artifacts inherit the actionability principles (clear next action, bounded choices, visible progress, low working-memory burden) without medical labeling.

## Client delivery law

Every substantial interactive client artifact, calendar, dashboard, review surface, or handoff must read `.agents/skills/client-delivery-polish/SKILL.md` and satisfy `docs/CLIENT-DELIVERY-APPROVAL-ARTIFACT.md` where applicable.

Primary client UI must make these states obvious:

- Needs your approval
- In production / scheduled
- Delivered
- Blocked — needs input

The client should not need to understand GitHub, Vercel, Supabase, agent names, branch SHAs, JSON manifests, or Beads IDs to operate the engagement.

The client-facing design layer uses the visual/interface skill. The `i-have-adhd` skill governs information architecture and actionability. Beads provides the underlying work/proof state. Do not collapse these responsibilities into one generic "polish" skill.

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
4. Run `bd ready`; claim/create the bounded Bead and update the task claim before editing.
5. Add or update tests.
6. Implement in the correct repository only.
7. Run local tests, boundary guard, smoke tests, and `bd doctor` when applicable.
8. Attach proof; update the Bead, `STATUS.json`, and task ledger.
9. Open a PR; do not silently deploy production.
