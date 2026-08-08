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
   - `control-plane/studio/repository-boundaries.json`
   - `control-plane/studio/role-security.json`
   - the current numbered ICM stage under `icm/asc3nd-contract-closeout/`
3. Determine the task's single owner repository before editing. If ownership is ambiguous, STOP.
4. Run `npm run guard:repo` before build or deployment work.
5. Use JCodeMunch MCP first: `plan_turn`, file outlines, symbol search, symbol source, importers, and blast radius. Do not load whole repositories when targeted retrieval is sufficient.
6. For multi-step work, initialize/query Beads and work from the ready graph before editing. Read `.agents/skills/beads-observability/SKILL.md`.
7. Read `.agents/skills/i-have-adhd/SKILL.md` for operator-facing responses and handoffs. Its actionability rules are always-on unless the human explicitly requests normal mode.
8. Record every claimed fact with a source path, URL, database query, transcript timestamp, or human approval.
9. Work only inside the current stage's allowed outputs and the owner repository's allowed responsibility.
10. Stop at approval gates. Silence is not approval.

## Global default-deny architecture law

Agenix uses default-deny role security for repository writes.

- Agents do not choose repository ownership ad hoc. `control-plane/studio/repository-boundaries.json` decides.
- Agents do not assume permissions from capability. `control-plane/studio/role-security.json` decides.
- One task has one writing role and one owner repository.
- One output path has one writer.
- Cross-repository direct writes are prohibited. Cross-repo work requires a typed handoff artifact.
- Writer and final approver must be different roles for yellow/red work.
- No local prompt, task note, sub-agent, or convenience override may weaken a repository boundary.
- If a requested change belongs elsewhere, emit `REPOSITORY_BOUNDARY_STOP` and create/route the handoff instead of writing.
- Missing ownership, missing approval, missing proof, or policy disagreement means FAIL CLOSED.

## Product boundary

The backend is reusable product infrastructure. Client-specific facts enter through approved tenant manifests and artifacts, not platform defaults.

Canonical routing is machine-readable in `control-plane/studio/repository-boundaries.json`. Human summary:

- Public website and production runtime → `executiveusa/asc3nd-frontend-website-`
- Client answers, paid scope, workbook, strategy HQ → `executiveusa/asce3nd-interactive-document`
- Brand masters, QR, templates → `executiveusa/asc3nd-brand-kit-`
- Event microsites and RSVP UX → `executiveusa/asc3nd-events-page`
- Data contracts, migrations, RLS, backup/runbooks → `executiveusa/asc3nd-supabase-landing`
- Design experiments only → `executiveusa/ascend-demonstration-page`
- Reusable workflows, approvals, adapters, Beads, ICM, task ledger → this repository

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

The upstream `i-have-adhd` skill is an agent communication/output skill, not a visual-design system. Use it for making work easy to start, resume, and finish.

For every operator-facing status, task handoff, approval request, error report, or agent completion report:

1. Lead with the next action or current decision, not a preamble.
2. Number multi-step work, one bounded action per step.
3. Restate the current state each turn (`step 3 of 5`, `2 approvals left`, etc.).
4. Make completed work visible and give concrete time estimates when useful.
5. Suppress tangents; if anything remains open, end with one concrete next action.

Do not label or diagnose a client as having ADHD. Client-facing artifacts inherit the actionability principles without medical labeling.

## Client delivery law

Every substantial interactive client artifact, calendar, dashboard, review surface, or handoff must read `.agents/skills/client-delivery-polish/SKILL.md` and satisfy `docs/CLIENT-DELIVERY-APPROVAL-ARTIFACT.md` where applicable.

Primary client UI must make these states obvious:

- Needs your approval
- In production / scheduled
- Delivered
- Blocked — needs input

The client should not need to understand GitHub, Vercel, Supabase, agent names, branch SHAs, JSON manifests, or Beads IDs to operate the engagement.

The client-facing design layer uses the visual/interface skill. The `i-have-adhd` skill governs information architecture and actionability. Beads provides the underlying work/proof state. Do not collapse these responsibilities into one generic polish skill.

## Browser video documentation law

Any task that designs a prompt/mission for a browser agent to operate **Descript or OpusClip**, or performs video-editing automation in those products, MUST read `.agents/skills/browser-video-editor/SKILL.md` before planning or execution.

Before the browser agent touches the editor:

1. Refresh from the current official docs for the exact operation being requested.
2. For Descript, inspect the current Descript Help/API documentation and `https://github.com/descriptinc/skills`, including the relevant `SKILL.md` and `references/descript-api.md`.
3. For OpusClip, start from the current documentation index at `https://help.opus.pro/llms.txt`, then read the exact pages for the operation.
4. Record the URLs and refresh date in the browser mission.
5. Current official docs override repository memory, prior prompts, screenshots, and remembered UI behavior.
6. If docs cannot be refreshed, emit `DOCS_REFRESH_BLOCKED` and STOP. Never invent menu names, editor capabilities, API parameters, costs, or workarounds.
7. Browser/manual mechanical editing is the default low-cost execution path. Expensive semantic video-agent operations require a documented reason and cost approval when material.
8. Browser agents execute approved edit briefs. They do not freestyle story, quotes, facts, footage, branding, effects, publishing, or destructive actions.
9. Descript/Opus publishing, scheduling, social-account connection, master overwrite, delete/archive, or irreversible project changes require explicit human approval.
10. Every browser-video completion report must include proof: target composition/clip, before/after duration, aspect ratio, captions QA, protected-facts QA, export artifact/review link, visible credits/minutes consumed when available, and confirmation that nothing was published without approval.

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

1. Read control-plane, repository-boundary policy, role-security policy, and current ICM stage.
2. Determine owner repo and role. Stop if ambiguous.
3. Use JCodeMunch for targeted discovery.
4. Run `bd ready`; claim/create the bounded Bead and update the task claim before editing.
5. Add or update tests.
6. Implement in the correct repository only.
7. Run local tests, boundary guard, smoke tests, and `bd doctor` when applicable.
8. Attach proof; update the Bead, `STATUS.json`, and task ledger.
9. Obtain independent review/approval where required.
10. Open a PR; do not silently deploy production.

---

# Agenix Federation Architecture + Pause/Resume Checkpoint

**Checkpoint date:** 2026-08-08

This section is the durable architecture brief for the larger system being built around ASC3ND. It exists so a future agent can resume without re-deriving the architecture from chat history.

## System thesis

**Federation, not consolidation.**

Agenix is the coordinating intelligence layer. Specialist systems keep ownership of their own canonical state. No tool or model is allowed to become the hidden source of truth for another domain.

Core law:

> **One boss per truth.**

Operational principle:

> **Do not scale output. Scale verified capability.**

Canonical execution loop:

`LOCK → PRODUCE → REVIEW → APPROVE → PUBLISH → VERIFY → REUSE`

General operating loop:

`REALITY → OUTCOME → SCOPE → PLAN → PRODUCE → REVIEW → APPROVE → DELIVER → VERIFY → LEARN → REUSE`

## Top-level architecture

```text
HUMAN
  │ voice / text / approvals
  ▼
AGENIX COMMAND
  │
  ▼
AGENIX GOVERNOR
context / project truth / policy / acceptance / routing
  │
  ▼
PAPERCLIP HQ
organizational goals / jobs / budgets / delegation / heartbeats
  │
  ├──────────────┬────────────────┬──────────────────┐
  ▼              ▼                ▼                  ▼
MONTAGE      OPENHANDS/DARYA   OPEN INTERPRETER   FUTURE AGENTS
film studio  software factory  computer operator  specialist runtimes
  │              │                │
  └──────────────┴────────────────┴───────────────► evidence / receipts
                                                   │
                                                   ▼
                                            HUMAN APPROVAL
```

## Canonical ownership

### Agenix
Owns:
- project context
- scope
- policy
- acceptance criteria
- project memory
- evidence requirements
- review state
- routing decisions

Representative capabilities:
`project.context`, `project.scope`, `project.policy`, `project.acceptance`, `project.review`, `project.evidence`, `project.memory`.

### Paperclip
Owns:
- organizational jobs
- agent assignments
- schedules
- budgets
- heartbeats
- organizational state
- goal traceability

Representative capabilities:
`work.assign`, `work.delegate`, `work.schedule`, `budget.enforce`, `agent.heartbeat`, `goal.trace`, `approval.request`, `audit.record`.

### Montage
Owns:
- canonical video project state
- timeline/editorial state
- footage indexing
- transcription state
- edit decisions and versions
- render outputs
- verification state for video work

Representative capabilities:
`video.ingest`, `video.index`, `video.transcribe`, `video.story.plan`, `video.edit`, `video.reframe`, `video.caption`, `video.render`, `video.verify`.

### OpenHands / Darya
Owns engineering execution sessions, not project truth.

Representative capabilities:
`software.inspect`, `software.plan`, `software.implement`, `software.test`, `software.review`, `software.pull_request`, `software.deploy`, `design.audit`, `design.review`.

### Open Interpreter
Owns computer-control execution sessions, not project truth.

Representative capabilities:
`computer.observe`, `computer.click`, `computer.type`, `computer.scroll`, `computer.hotkey`, `computer.shell`, `computer.files`, `computer.browser`, `computer.screenshot`.

### Supabase Hive
Owns only cross-system federation state:
- organization/project identity
- provider registry
- capability registry
- command sessions
- runs and run steps
- events
- approvals
- evidence receipts
- resource leases
- policy versions
- audit log

It does **not** replace each specialist system's canonical domain state.

### GitHub
Owns source code, migrations, PRs, manifests, and durable implementation history.

### VPS / local workers
Own runtime processes only. Long-running services may eventually run through Docker/Coolify, but runtime location does not change canonical ownership.

## Cross-system event contract

Future event envelope:

```text
event_id
correlation_id
causation_id
organization_id
project_id
run_id
source
event_type
payload
timestamp
idempotency_key
```

Representative events:
`project.created`, `task.assigned`, `task.started`, `artifact.created`, `review.required`, `task.blocked`, `task.completed`, `budget.warning`, `deployment.failed`, `video.render.ready`.

## Repo/write law

- Default deny.
- One task / one writer.
- One canonical owner for each state domain.
- No repository directly writes another repository's canonical state.
- Cross-repository work uses typed handoffs, contracts, or events.
- Acquire a Hive `resource_lease` before potentially colliding writes.
- Related cross-repo branches/PRs share one correlation ID.
- No proof or approval means stop.

## Montage target architecture

```text
YAPPY-CLIPZ Web Studio
  ↓
Studio API / event stream
  ↓
OpenMontage control plane
  ↓
StudioProject v1  ← canonical project truth
  ↓
OmniRouter
  ↓
providers / tools
  ↓
Twick / Remotion / FFmpeg / optional SynthCut
  ↓
verified renders
```

Key law:

> **No secondary engine owns project state. Every engine connects through contracts/adapters.**

SynthCut, FFmpeg, Whisper, OpusClip, Descript, or any future editor are execution tools/providers. They are never the canonical project store.

## Montage intelligence model

Keep perception, reasoning, and action separate.

### Perception
- Faster-Whisper or alternative transcription
- future visual embeddings / shot detection / speaker detection / footage search

### Reasoning
- Montage Director
- Story Brain
- Screenwriter → Director → Editor hierarchy where useful
- configurable model router rather than vendor lock-in

### Action
- FFmpeg
- Remotion / Twick
- optional SynthCut
- browser automation
- Open Interpreter / desktop control only as fallback

Routing principle:

1. deterministic operation first
2. cheap/small model when judgment is light
3. strong reasoning model for editorial/story decisions
4. vision model only when visual understanding or verification is required

## Montage intended UX

The operator should direct the film, not manage infrastructure.

Desired interaction:

```text
VIDEO PREVIEW

DIRECTOR CONVERSATION
"Find the strongest explanation of why we started."

[Preview A] [Preview B] [Preview C]

🎤 Talk to Montage…
Transcript | Takes | Changes | Deliver
```

Timeline remains available for advanced work but is not the required workflow.

## Montage local-runtime checkpoint — PAUSED

**Status:** intentionally paused on 2026-08-08 after repeated Windows runtime friction. Do not resume automatically.

What is already verified conceptually/through repository work:
- local footage worker architecture exists;
- FFmpeg editing operations exist;
- ffprobe verification exists;
- Faster-Whisper integration exists;
- local browser → loopback worker architecture exists;
- local worker is intended to bind only to `127.0.0.1:4788`;
- source footage is intended to remain immutable;
- E-drive workspace/runtime separation is implemented;
- one-command `GO.ps1` bootstrap was added;
- latest runtime repair attempted to isolate Montage from the active Hermes Python environment.

### Exact unresolved laptop problem

The owner laptop was repeatedly selecting the active Hermes virtualenv as the Python executable during setup, causing Faster-Whisper installation to resolve against Hermes/browser-use/Supabase/A2A dependencies and print a large dependency-conflict wall.

A repair was merged that attempts to:
- prefer a clean `uv`-managed base Python;
- fall back to Windows `py` launcher;
- reject paths containing `\hermes\` or `\venv\`;
- refresh only Montage's dedicated `E:\MONTAGE_RUNTIME\python-packages` directory;
- disable user-site packages.

**Important:** this repair has not yet been proven on the owner laptop after the final merge. Do not claim local Montage is working until real footage passes end-to-end.

### Resume acceptance test

When this work resumes, success means one real ASC3ND source video can:
1. be opened from local storage;
2. transcribe locally;
3. create a reversible cut;
4. create 9:16 output;
5. generate/burn captions;
6. verify output with ffprobe;
7. persist project state after reopen;
8. export MP4 + SRT;
9. use $0 paid editor/Descript AI credits for this local proof.

If the Windows runtime path remains fragile, **do not keep layering workarounds indefinitely**. Prefer a different technique: containerized runtime, a known-clean portable Python/uv environment, WSL, a dedicated local worker service, or use a browser-editor path for current client delivery while the local engine is hardened separately.

## Current short-term delivery decision

**Priority is not to finish the entire Montage platform right now. Priority is to finish this week's ASC3ND client work.**

For current-week video delivery, use the cheapest reliable path that gets verified client-ready outputs finished. Approved tactical options include:
- direct/manual editing from the existing source footage;
- browser-assisted Descript workflow;
- browser-assisted OpusClip workflow;
- explicit edit briefs executed by a human or browser agent;
- Montage only if it is already working without more environment fighting.

Do not let infrastructure work block contracted delivery.

## Current ASC3ND contract-critical outputs

Paid engagement amount: **$2,450**.

Must finish before optional platform work:
- bilingual interactive strategy workbook + cloud autosave;
- four guided strategy sessions;
- EN/ES support;
- 12-week / 90-day content calendar;
- exactly 30-post caption bank;
- Month 1 shot list + visual direction;
- platform bios for up to three platforms;
- handoff system the client can operate without MACS after Day 60.

Current Month 1 creative closeout includes the August Instagram sequence and the documentary Reels needed for the campaign. Existing editorial targets already identified include:
- `Why We Started`;
- `What a Mentor Can Do`;
- `Getting Ready for Community Cuts`.

Use real ASC3ND imagery/footage for documentary work. No fabricated people, quotes, event scenes, statistics, or protected facts.

## Immediate operating mode until this week is closed

1. **Contract delivery first.** Finish this week's client-ready artifacts before returning to platform architecture.
2. **Use the shortest reliable production path.** Browser editor/manual editor is acceptable if it produces verified deliverables faster.
3. **No autonomous publishing.** Produce review-ready files first; publishing/scheduling remains approval-gated.
4. **Keep receipts.** Every finished asset must have evidence: file/review link, duration/aspect ratio where relevant, caption QA, protected-facts QA, and approval status.
5. **Return to Montage only after the week's deliverables are safe.** Resume from the checkpoint above rather than re-deriving architecture.

## Resume instruction for future agents

When asked to resume Montage or the wider Agenix build:

- read this checkpoint first;
- inspect current repo/main state before changing anything;
- do not assume the owner-laptop runtime is healthy;
- do not reopen solved PRs without evidence;
- verify the exact current failure before proposing another runtime fix;
- prefer one clean technique over multiple compatibility layers;
- keep the larger federation architecture intact even if the local execution technique changes.

The current business priority remains: **finish verified client work first, then continue building the operating system.**
