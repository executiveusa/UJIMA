# Video Change Beads and Rollback Protocol

## Purpose
Every browser-agent video edit must be decomposed into atomic, independently reviewable and reversible change beads. A mission may contain many beads, but no bead may hide multiple unrelated changes.

## Core law
One change bead = one bounded visual, audio, text, timing, metadata, or export change.

If a browser agent changes five things, it must create five bead records. Reviewers may accept four and reject or roll back one without restating or rebuilding the other four.

## Bead identifier
Use:

`VB-<CLIENT>-<ASSET_ID>-<RUN>-<NNN>`

Example:

`VB-ASC3ND-IGR-20260812-WHY-WE-STARTED-R01-003`

The identifier is immutable once created.

## Required bead fields
Each bead record must contain:

```yaml
bead_id:
mission_id:
asset_id:
run_id:
sequence:
category: crop|caption|timing|audio|brand|endcard|text|layout|metadata|export|other
intent:
target:
before_state:
action:
after_state:
verification:
rollback_instruction:
status: proposed|applied|verified|accepted|rejected|rolled_back|blocked
proof:
  before:
  after:
  screenshot:
  export_or_review_ref:
created_at:
verified_at:
reviewed_by:
notes:
```

## Atomicity rules
- A crop correction and a caption correction are separate beads.
- Caption font, caption position, and caption wording are separate beads if they can be accepted independently.
- A global style normalization may be one bead only when the same deterministic rule is applied everywhere and can be rolled back as one operation.
- Any change to protected facts is prohibited unless explicitly approved; if requested, it becomes its own red-gate bead.
- Publishing is never bundled with editing.

## Rollback law
A bead may be rolled back only to its recorded `before_state` or to a known checkpoint created immediately before the bead.

Rollback instruction must be written before applying the change whenever practical. If the browser/editor cannot guarantee a local undo path, create a duplicate/checkpoint composition first.

Rollback procedure:
1. identify bead ID;
2. verify its accepted neighboring beads must remain;
3. return only the target bead to `before_state`;
4. re-run verification for the rolled-back property and all immediate dependencies;
5. mark bead `rolled_back`;
6. create a new corrective bead if a replacement change is needed;
7. never mutate bead history to pretend the rejected change did not happen.

## Checkpoint policy
Create a checkpoint before:
- first edit in a new mission;
- any destructive trim/ripple operation;
- global caption restyle;
- audio processing that cannot be selectively reverted;
- end-card replacement across multiple scenes;
- batch scene/layout change;
- export settings change that overwrites an existing output.

Checkpoint naming:

`CHK_<ASSET_ID>_<RUN_ID>_<NN>`

Example:

`CHK_ASC3ND-IGR-20260812-WHY-WE-STARTED_R01_02`

## Review protocol
Reviewer decisions are per bead:
- ACCEPT = keep exact after-state.
- REJECT = do not keep; roll back or replace.
- MODIFY = preserve accepted portions only if they are separately represented by beads; otherwise split the bead before proceeding.

## Example
If Claude changes:
1. crop on scene 2;
2. subtitle position;
3. subtitle line break;
4. end card;
5. audio level;

there must be five bead IDs. If #3 is bad, the correction mission references only bead #3 and leaves #1, #2, #4, and #5 untouched.
