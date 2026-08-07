# Montage Local Footage Factory — Guardrails

## Default-deny
If a phase task is not required to satisfy the current phase acceptance criteria, do not execute it. Record it as deferred.

## Scope-creep flag
Emit `SCOPE_CREEP_FLAG` when a request materially changes deliverables, schedule, cost, resources, risk, architecture ownership, or acceptance criteria. Recommend one of `DROP`, `DEFER`, `SWAP`, or `FORMAL_CHANGE`.

## Repository ownership
- Montage implementation belongs in `executiveusa/pauli-montage-video-agent`.
- Agenix owns shared governance, ICM, review law, reusable skills, and cross-client operating patterns.
- Do not copy a third-party editor wholesale into Montage.
- SynthCut, FFmpeg, Whisper, and future engines are adapters/execution dependencies. They do not become canonical project truth.

## Human approval gates
Require explicit human approval before:
- publishing/scheduling social media;
- destructive deletion of source footage;
- overwriting an approved master;
- production database migration with client data;
- paid model/media calls above approved budget;
- changing protected ASC3ND facts, consent assumptions, brand masters, or public claims.

## Documentary integrity
For ASC3ND or other real-client documentary work:
- no fake people;
- no synthetic event scenes presented as real;
- no invented quotes;
- no invented dates, venues, outcomes, testimonials, statistics, or program facts;
- source footage and transcripts remain traceable;
- caption corrections may fix transcription errors but may not rewrite speaker meaning without approval.

## Cost law
Reason cheaply; execute deterministically.
- local text model for tool selection where practical;
- FFmpeg/Whisper/local workers for mechanical processing;
- paid semantic/media inference only when deterministic/local methods cannot meet the requirement;
- record estimated/actual paid cost when visible;
- routine ASC3ND reel production target: zero Descript AI credits.

## TDD law
For each durable capability:
1. write or identify a failing test/fixture first;
2. implement minimum code to pass;
3. refactor without changing behavior;
4. rerun targeted tests;
5. rerun relevant integration/contract tests;
6. attach evidence to the PR.

Do not disable, skip, or weaken tests to make a phase green.

## Phase merge law
Each phase is an independent merge gate.
- branch from current `main`;
- keep phase scope bounded;
- open PR;
- wait for required checks;
- inspect review comments and inline threads;
- fix every valid issue, including reasonable CodeRabbit nitpicks inside scope;
- rerun checks after review fixes;
- resolve merge conflicts without discarding accepted upstream changes;
- merge only green/review-clean work;
- verify `main` after merge;
- record a receipt before proceeding.

## UI law
Use the Krug review skill as an acceptance gate, not decoration.
- obvious purpose;
- obvious next action;
- scan-first hierarchy;
- no unexplained architecture vocabulary in the primary experience;
- no dead primary controls;
- clear status and recovery;
- reversible edits communicate reversibility;
- errors explain the next action;
- mobile/tablet layouts do not hide essential review actions;
- accessibility basics are required.

## Failure behavior
On any failure:
1. stop expanding scope;
2. identify the last verified state;
3. preserve source/media/project state;
4. capture logs/evidence;
5. classify failure as code, test, environment, dependency, auth, cost, data, UX, or external service;
6. repair within current phase if it blocks acceptance;
7. otherwise defer explicitly;
8. never fabricate a pass.

## Completion language
Allowed completion claims:
- `implemented, not yet verified`
- `verified on branch`
- `merged, post-merge verification pending`
- `PASS`

`DONE` for the whole program is permitted only after Phase 4 final verification.
