# Agenix Hive Constitution v0

## Purpose

Agenix Hive federates specialized repositories and agent runtimes into one governed operating system. It does **not** merge every product into one codebase. Each service keeps one bounded responsibility and one canonical state domain.

The human has one front door: **Agenix Command**.

`Human -> Agenix Command -> Agenix Governor -> Paperclip HQ -> capability provider -> evidence -> approval`

## Permanent roles

| Provider | Role | Canonical ownership |
| --- | --- | --- |
| Agenix Governor | Constitution, ICM, scope, policy, acceptance, evidence | project policy/context and acceptance truth |
| Paperclip HQ | Goals, tickets, budgets, heartbeats, delegation | organization work state |
| Darya / OpenHands | Software factory and product/design engineering | engineering execution state |
| Montage / OpenMontage | Filmmaking domain and Director | video project/timeline/editorial state |
| Open Interpreter | Bounded computer/browser/files/shell actuator | computer execution sessions |
| SynthCut / FFmpeg / Whisper | Replaceable media tools behind Montage | no canonical project state |

## State law

1. One canonical owner exists for every state domain.
2. A provider MUST NOT write another provider's private database or private state.
3. Cross-provider changes occur through versioned contracts, work orders, events, typed operations, artifacts, and receipts.
4. The Hive database stores federation state, correlation, evidence and approvals; it MUST NOT become a shadow copy of every product database.
5. Provider replacement must not destroy the project history of the federation.

## Human control law

Agenix removes mechanical human work, not human judgment.

The system should resolve filenames, timestamps, routing, tool choice, routine retries, branch naming, rendering commands and recoverable code defects without asking the human.

Human approval remains required for editorial meaning, ambiguous client facts, consent/privacy decisions, external publishing, destructive actions, material spend above budget, protected production changes and any action declared `human_required` by policy.

Silence is not approval.

## Execution priority

Use the least fragile interface capable of the task:

1. native service operation/API
2. MCP
3. CLI
4. structured browser automation
5. desktop/vision GUI control

GUI automation is a fallback, never the default integration strategy.

## Cross-repository write law

Every engineering write must follow:

`TASK -> LEASE -> BRANCH -> TEST FIRST -> IMPLEMENT -> TEST -> COMMIT -> PUSH -> PR -> CI/REVIEW -> FIX -> MERGE -> VERIFY -> RECEIPT`

- No agent writes directly to a protected default branch.
- One task has one writing provider, one owner repository and one active write lease per resource.
- A multi-repository outcome is decomposed into child work orders sharing one `correlation_id`.
- A provider may inspect another repository without acquiring a write lease, but any mutation requires the owner repository's lease and policy.
- Expired/stale leases fail closed until reconciled.

## Event law

All cross-provider events use the Hive event envelope and carry:

- `event_id`
- `correlation_id`
- optional `causation_id`
- organization/project/run identity
- source provider
- event type
- idempotency key
- timestamp
- bounded payload

Initial event vocabulary:

- `work.assigned`
- `work.started`
- `work.blocked`
- `artifact.created`
- `review.required`
- `approval.requested`
- `work.completed`
- `verification.failed`
- `deployment.failed`
- `video.render.ready`

Consumers must be idempotent.

## Evidence law

No provider may report `completed` without an evidence receipt. A receipt records the outcome, verification status, tests, artifact references and cost. Claims without proof remain `partial`, `blocked` or `failed`.

## Cost law

Every long-running run has a budget. Paperclip manages organizational budget state; the Hive records run-level budget/spend evidence. Providers stop or request approval before exceeding policy.

Model routing defaults:

- P0 deterministic tools for exact operations
- P1 small/cheap models for routing, extraction and summaries
- P2 strong reasoning for ambiguous planning/story/architecture
- P3 vision for visual QA and computer observation

## Media law

Source masters are immutable. Montage owns StudioProject/editorial state. SynthCut, FFmpeg, Whisper, browser editors and computer-use agents operate only through approved Montage operations/adapters. No media tool becomes a second project owner.

## Computer-control law

Open Interpreter is the Hive's computer-operations provider, not its brain.

- worker initiates outbound secure communication; do not expose the workstation with inbound public ports by default
- filesystem access is limited to approved roots
- source deletion is denied by default
- password managers/secret stores are out of scope unless separately approved
- external publishing and production infrastructure changes require explicit approval
- every material GUI/computer action produces observation/evidence

## Voice law

Voice and text are two inputs to the same Agenix Command contract. MVP voice is push-to-talk. Speech is transcribed, persisted as a command, evaluated against project context/policy, then routed through Paperclip. Continuous voice/TTS may be added later without creating a second orchestration path.

## Failure law

On ambiguity about ownership, missing policy, missing approval, stale lease, unverifiable result, or conflicting canonical state: **FAIL CLOSED**.

Do not silently guess across repository/state boundaries.

## First proof

Hive Test #001 is a real ASC3ND video job:

`voice/text command -> Agenix context/policy -> Paperclip delegation -> Montage proposal/edit -> Open Interpreter only if local machine control is required -> OpenHands only if software repair is required -> Montage render/verification -> Agenix acceptance -> human editorial approval`

The Hive MVP is not complete until this path works with real source media, an auditable correlation chain, reversible editing, preserved project state and no required paid editor-agent credits.