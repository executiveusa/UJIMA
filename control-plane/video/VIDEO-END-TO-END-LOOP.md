# End-to-End Browser Video Editing Loop

## Objective
Turn browser-controlled video editing into a repeatable, auditable, rollback-safe production system.

## Loop

`REFRESH DOCS -> INSPECT -> CHECKPOINT -> PLAN BEADS -> APPLY ONE BEAD -> VERIFY -> CONTINUE -> EXPORT REVIEW -> SELF-QA -> HUMAN REVIEW -> ACCEPT/ROLLBACK -> FINALIZE -> REGISTER -> REUSE`

## Stage 0 — Refresh current product docs
Before every mission, refresh the relevant current Descript and/or OpusClip docs and record URLs + access time. If docs cannot be read, stop.

## Stage 1 — Resolve asset identity
Load the canonical `ASSET_ID`, `MISSION_ID`, exact editor project, exact composition/clip ID, source references, protected facts, brand spec, cost budget, and approval state.

If any identity is ambiguous, stop rather than searching by guesswork.

## Stage 2 — Inspect before touching
Record:
- composition name/ID;
- duration;
- aspect ratio/resolution;
- caption state;
- audio state;
- end-card state;
- visible editor version/UI state when useful;
- current export/review reference.

Create initial proof screenshots where practical.

## Stage 3 — Create checkpoint
Before changes, duplicate/checkpoint the review composition or create an equivalent reversible restore point. Never rely on browser memory alone.

## Stage 4 — Decompose work into change beads
Translate the edit brief into atomic beads. Each bead gets:
- immutable bead ID;
- exact target;
- intended change;
- before-state;
- expected after-state;
- verification rule;
- rollback instruction.

No hidden batch of unrelated edits.

## Stage 5 — Execute one bead at a time
For each bead:
1. verify the target is still correct;
2. apply only the allowed change;
3. save/wait for editor state to settle;
4. inspect the result;
5. capture proof;
6. mark `applied` or `blocked`;
7. run the bead-specific verification;
8. mark `verified` only when evidence exists.

If the result is wrong, either roll back immediately or stop for reviewer input according to mission policy.

## Stage 6 — Continuous self-check
After every bead, verify invariants:
- source/master untouched;
- no protected fact changed;
- no unapproved stock/AI/transition/music/emoji/effect added;
- no accidental publish/schedule action;
- no unintended timeline ripple outside the bead target;
- aspect ratio remains correct;
- accepted prior beads remain intact;
- cost remains inside budget.

## Stage 7 — Render review version
When all planned beads are verified, export a new immutable REVIEW version using the machine naming standard. Never overwrite a prior accepted export.

## Stage 8 — Self-QA the render
The browser agent must watch/inspect the produced review artifact end-to-end where product/browser capability permits and check:
- first/last frame;
- pacing/dead air;
- crop/face/action framing;
- captions and line breaks;
- caption safe zones;
- spelling and protected facts;
- logo/brand treatment;
- end card;
- audio intelligibility and abrupt cuts;
- duration/aspect/resolution;
- absence of accidental editor artifacts.

If a defect is found, create a new corrective bead. Do not silently edit without logging it.

## Stage 9 — Return review packet
Return:
- asset ID;
- mission/run ID;
- exact composition;
- exported review filename/path or URL;
- before/after duration;
- all bead IDs and statuses;
- per-bead proof;
- cost consumed;
- self-QA result;
- blockers;
- `NOT PUBLISHED` confirmation.

## Stage 10 — Reviewer decisions per bead
Reviewer may accept/reject/modify individual beads.

Example response:

`ACCEPT VB-...-001, 002, 004, 005; ROLLBACK VB-...-003.`

The correction mission must preserve accepted beads and act only on the rejected/modified bead plus required dependencies.

## Stage 11 — Finalize
Only after human approval:
- mark approved beads `accepted`;
- produce `APPROVED`/`FINAL` version with next version number if render changed;
- register final path and checksum/identifier when available;
- publishing remains a separate approval-gated mission.

## Stage 12 — Register and learn
Update asset manifest with:
- current version;
- accepted bead history;
- rollback history;
- final editor IDs;
- exports;
- approval evidence;
- cost telemetry;
- reusable rules discovered.

Update the browser-video skill only from verified recurring behavior, not one-off guesses.

## Failure recovery
If browser session crashes, editor UI drifts, or model context is lost:
1. reload asset manifest;
2. reload current docs;
3. inspect current composition against last verified bead;
4. resume from first non-verified bead;
5. never replay already accepted beads blindly.

## Completion definition
A video mission is complete only when:
- every planned bead has a terminal state;
- review export exists;
- self-QA passed or blockers are explicit;
- machine-readable manifest is updated;
- no publication occurred without a separate approval;
- rollback instructions remain usable.
