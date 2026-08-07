# Browser Agent Video Execution Specification

## Purpose

This specification defines how Claude browser control or another approved browser agent operates Descript and OpusClip inside Agenix. The browser agent is an execution worker, not the editorial authority.

The objective is deterministic, reversible, machine-readable video production with full provenance.

## Operating model

Director/reasoning agent -> browser mission -> browser agent -> editor UI -> self-QA -> review export -> human/reviewer decision -> selective rollback/correction -> final export -> asset manifest registration.

The browser agent MUST never skip directly from mission to publish.

## Required preflight

Before any click:

1. Read `AGENTS.md`.
2. Read `.agents/skills/browser-video-editor/SKILL.md`.
3. Read:
   - `control-plane/video/VIDEO-END-TO-END-LOOP.md`
   - `control-plane/video/VIDEO-CHANGE-BEADS.md`
   - `control-plane/video/VIDEO-ASSET-NAMING.md`
   - `control-plane/video/browser-editor-mission-template.md`
4. Refresh current official docs for the exact Descript/OpusClip operation.
5. Record docs URLs and refresh date.
6. Resolve the exact asset ID, mission ID, run ID, project, composition/clip, and source media.
7. Confirm protected facts, protected assets, brand spec, export spec, cost budget, and forbidden actions.
8. If any required value is missing or ambiguous, STOP.

## Asset identity

Every video MUST have a stable machine-readable asset ID.

Example:

`ASC3ND-IGR-20260812-WHY-WE-STARTED`

Every browser run MUST have its own mission/run identity. Never reuse a previous run ID for a new editing attempt.

## Versioning

Source/master compositions are immutable unless the mission explicitly authorizes master maintenance.

Browser work occurs in a named REVIEW composition or duplicate.

Version increments are monotonic:

- `v01` first review
- `v02` next material revision
- `v03` next material revision

Never overwrite an already-reviewed export with different content under the same versioned filename.

## Atomic change execution

Before editing, decompose the mission into atomic Video Change Beads.

One bead = one bounded visible outcome.

Examples:

- move caption block into safe zone;
- fix crop on scene 3;
- replace temporary end card;
- normalize caption font size;
- reduce music gain by 3 dB.

Do not combine unrelated edits into one bead merely for convenience.

Each bead record MUST include:

- bead ID;
- parent mission/run ID;
- target composition/clip;
- requested change;
- exact before-state;
- intended after-state;
- checkpoint reference when applicable;
- execution status;
- verification method;
- proof/evidence;
- reviewer disposition;
- rollback instruction.

## Checkpoint law

Before any edit that is destructive, ripple-prone, difficult to reverse, or likely to alter neighboring accepted work, create or identify a recoverable checkpoint.

Valid checkpoints may include:

- duplicate review composition;
- duplicated scene;
- prior immutable export;
- editor-supported version/history state when reliably recoverable.

Browser undo history alone is not an acceptable rollback strategy.

## Execution loop

For each bead:

1. Inspect before-state.
2. Capture checkpoint if required.
3. Execute only the bead's requested change.
4. Save/wait for editor state to settle.
5. Re-open or visually inspect the changed area.
6. Verify the intended result.
7. Confirm neighboring accepted elements were not altered.
8. Record evidence.
9. Mark bead `executed_verified` or `failed`.
10. Continue only if mission stop conditions remain false.

## Self-QA

After all planned beads are executed:

- play/inspect the full composition from start to finish;
- verify aspect ratio and resolution;
- verify total duration;
- verify captions word-by-word where feasible;
- verify caption safe-zone placement;
- inspect framing scene-by-scene;
- verify protected facts;
- verify protected branding;
- inspect audio continuity and clipping;
- verify outro/end card;
- confirm no unapproved stock, AI media, emoji, effects, music, or transitions were introduced;
- confirm nothing was published or scheduled.

Any defect found during self-QA becomes a NEW bead. Do not silently fix defects outside the ledger.

## Review export

Every run produces an immutable review artifact before final approval.

The review export filename MUST follow `VIDEO-ASSET-NAMING.md` and include the asset ID, state, version, dimensions, and frame rate where known.

The browser agent MUST report:

- export filename/path or review URL;
- before/after duration;
- dimensions/aspect ratio;
- mission/run ID;
- all bead IDs and statuses;
- credits/minutes consumed if visible;
- explicit `NOT_PUBLISHED` state.

## Reviewer decision model

Reviewer decisions are bead-specific.

Allowed dispositions:

- ACCEPT
- REJECT_AND_ROLLBACK
- REJECT_AND_REVISE
- NEEDS_EVIDENCE
- BLOCKED

Example:

`KEEP VB-...-001,002,004,005; ROLLBACK VB-...-003.`

The browser agent MUST preserve accepted neighboring beads while correcting or rolling back rejected beads.

## Selective rollback

Rollback MUST restore the rejected bead to its recorded before-state or checkpoint while preserving accepted work.

After rollback:

1. re-verify the restored element;
2. re-verify neighboring accepted edits;
3. record rollback evidence;
4. mark the rejected bead `rolled_back`;
5. create a new bead if a replacement solution is requested.

Never mutate a rejected bead into a different edit without creating a new bead ID.

## Finalization

A video is not FINAL until:

- all beads have terminal reviewer states;
- all required rollbacks/corrections are complete;
- final QA passes;
- approved final export exists;
- final export is registered in the asset manifest;
- source/project/composition/version relationships are recorded;
- cost telemetry is recorded when available;
- human approval exists for any publishing action.

## Machine-readable registration

Every completed asset should resolve through the canonical manifest to:

- client;
- campaign;
- platform;
- planned publish date;
- asset ID;
- source media;
- editor product;
- editor project ID/URL;
- composition/clip ID;
- review/final version;
- export path/URL;
- mission/run IDs;
- bead IDs;
- approval state;
- publish state.

## Cost policy

Mechanical editing defaults to browser/manual execution.

Do not invoke product AI analysis, reprocessing, or expensive semantic editing merely to perform deterministic UI work.

If an operation may consume material credits/minutes and is not explicitly budgeted, STOP with `COST_APPROVAL_REQUIRED`.

## Completion contract

The browser agent may report `DONE` only when:

- current docs were refreshed;
- correct target was verified;
- each edit exists as a bead;
- each executed bead has evidence;
- self-QA was completed;
- review/final artifact exists as required;
- manifest/state was updated or a handoff was produced for registration;
- nothing irreversible occurred without approval.

Otherwise report the exact non-terminal state.