# Montage Local Footage Factory — Long-Running PRD

## Mission
Finish the four-phase Montage hardening program using ASC3ND footage as the acceptance test. The objective is a working, beautiful, connected product that can ingest real footage, transcribe locally, edit reversibly, reframe, caption, review, export, reopen with state intact, and avoid Descript AI-credit dependence for routine production.

## Product truth
- Product repository: `executiveusa/pauli-montage-video-agent`
- Control/governance repository: `executiveusa/ascend-social-purpose-agentic-systems-`
- Canonical project state remains Montage `StudioProject`; external editors are replaceable execution adapters.
- ASC3ND contract delivery remains the commercial priority.
- Real human/documentary media must remain real; no synthetic people or fake documentary scenes.

## Long-running execution law
Run phases strictly in order. After every phase:
1. stop feature work;
2. run phase tests and evidence checks;
3. commit all bounded phase changes;
4. push a phase branch;
5. open a PR to `main`;
6. inspect CI, review threads, CodeRabbit/Codex feedback, merge conflicts, and deployment preview;
7. fix every valid blocking or nitpick review item within phase scope;
8. rerun tests;
9. merge only when green;
10. verify `main` after merge;
11. record phase receipt;
12. proceed to the next phase only after the receipt says `PASS`.

No phase may be marked complete from prose alone. `done` requires repository evidence and a working artifact.

## WIP rule
Maximum two active workstreams:
1. `ASC3ND Local Footage Factory` — primary.
2. `Montage Golden-Path UX` — supporting only.

Anything else is deferred unless it is a blocker for these outcomes.

---

# Phase 1 — Freeze scope, baseline, connect project truth

## Goal
Make the existing product truthful and connected before adding new editing engines.

## Required outcomes
- inspect current `main`, open PRs, CI, Vercel production/preview, Studio API configuration, application service contracts, project/timeline routes, persistence adapters, and current UI routes;
- create a capability matrix: working / partial / missing / blocked;
- write tests first for project create/read/update/reopen and timeline read/write/reopen;
- connect the Studio web frontend to the real Studio API/persistence path;
- no fake fallback project state;
- prove: create project → reload browser → reopen project → state survives;
- prove: modify canonical timeline → save → reopen → exact state survives;
- run a Krug-derived UI audit only against `Projects → New Project → Edit` and repair severity-1 usability failures.

## Phase 1 acceptance
- production-safe configuration path documented;
- project API no longer returns `service_not_connected` in the target environment used for acceptance;
- persistence round-trip tests pass;
- timeline version/conflict tests pass;
- no dead primary navigation items;
- user can reach a real project editor without knowing internal architecture terms;
- CI green; preview verified; PR merged; post-merge smoke test green.

---

# Phase 2 — Local media engine

## Goal
Implement the zero-credit mechanical editing path.

## Required outcomes
- immutable source-media registration;
- ffprobe metadata extraction;
- local proxy generation;
- Faster-Whisper or WhisperX transcription adapter with timestamps and source mapping;
- transcript persistence;
- reversible edit operations: remove, restore, move, shorten gap;
- local preview render through FFmpeg or the canonical render abstraction;
- 9:16 reframe/crop path with manual override persistence;
- editable caption track generation and SRT export;
- SynthCut adapter only where it reduces mechanical implementation cost; SynthCut MUST NOT own canonical project state;
- operation evidence/rollback mapping compatible with Agenix Video Change Beads.

## TDD requirements
Write failing contract/integration tests before implementation for:
- source immutability;
- transcript time mapping;
- edit apply/revert;
- project reopen after edits;
- vertical output dimensions;
- caption persistence;
- deterministic export verification.

## Phase 2 acceptance
One fixture video can move through ingest → proxy → transcript → reversible edit → 9:16 → captions → preview/export entirely without Descript AI credits.

---

# Phase 3 — ASC3ND proof

## Goal
Use real ASC3ND work to prove the product rather than building generic demos.

## Required acceptance asset
Reproduce the known `Why We Started` Reel locally from approved ASC3ND source footage and compare it with the previously approved/editor-reviewed version.

## Required workflow
1. register real source footage;
2. transcribe locally;
3. locate/select the approved source range;
4. create reversible timeline operations;
5. produce vertical 9:16 framing;
6. apply approved captions;
7. run caption/framing/audio/fact/brand QA;
8. export 1080x1920 MP4 + SRT;
9. close/reopen project;
10. verify identical canonical state;
11. verify MP4 with ffprobe/decode checks;
12. record local compute time and paid-editor credits consumed;
13. target paid Descript AI credits = 0.

After Aug 12 passes, run the same reusable workflow for:
- Aug 19 — What a Mentor Can Do
- Aug 26 — Getting Ready for Community Cuts

Do not publish social posts automatically. Human approval remains required.

## Phase 3 acceptance
All three ASC3ND Reels can be produced through the same Montage workflow with evidence, reversible project state, verified exports, and no routine Descript AI-credit dependency.

---

# Phase 4 — Harden, audit, productize

## Goal
Turn the proven workflow into a coherent product other people can use.

## UX hardening
Run the Krug design-review skill against the actual golden path:
`Projects → Import → Transcript → Edit → Review → Deliver`.

Fix before completion:
- unclear primary actions;
- architecture jargon exposed to ordinary users;
- duplicate choices;
- dead controls;
- poor empty/loading/error states;
- unclear save/processing state;
- invisible rollback/recovery;
- inaccessible controls;
- tablet layout failures;
- generic/vibe-coded visual patterns that reduce clarity or trust.

## Product hardening
- clear job progress and cancellation;
- operation/change history visible at review time;
- selective rollback;
- export verification report;
- cost telemetry where available;
- local/cloud route policy;
- setup/runbook for local worker;
- representative fixtures and regression tests;
- browser smoke test of the full golden path;
- deployment smoke test after merge;
- no secret exposure;
- no auto-publishing.

## Optional only after the golden path works
- UIGen for secondary/admin forms driven by real OpenAPI contracts;
- broader provider surfaces;
- additional generation lanes.

## Final definition of done
Do not report the program complete until all are true:
- phases 1–4 each have a merged PR and PASS receipt;
- current `main` passes unit, integration, contract, type, build, lint/security gates that exist for the repo;
- Vercel production is READY on the final `main` commit;
- Studio frontend is reachable;
- real project persistence works;
- real footage ingest works;
- local transcription works;
- reversible edits work;
- 9:16 output works;
- captions are editable and exportable;
- review/rollback is understandable;
- verified MP4 export works;
- project state survives reopen;
- ASC3ND proof assets are reproducible;
- no unresolved valid CodeRabbit/reviewer findings remain;
- no unmerged program branch remains;
- post-merge runtime smoke tests pass.
