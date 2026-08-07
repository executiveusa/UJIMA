# Browser Video Editor Mission Template

Use with Claude browser control or another approved browser agent.

```text
MISSION_ID:
ASSET_ID:
RUN_ID:
CLIENT:
PRODUCT: Descript | OpusClip | Hybrid
DOCS_REFRESHED_AT:
DOCS_READ:
- <official URL>
- <official URL>

PROJECT_ID:
PROJECT_URL:
TARGET_COMPOSITION_OR_CLIP_ID:
TARGET_COMPOSITION_OR_CLIP_NAME:
SOURCE_MEDIA:
SOURCE_TRUTH:
- transcript/timestamps:
- protected facts:
- approved brand assets:

GOAL:

CHECKPOINT_REQUIRED: yes|no
CHECKPOINT_NAME:

PLANNED_CHANGE_BEADS:
- BEAD_ID:
  CATEGORY:
  TARGET:
  INTENT:
  BEFORE_STATE:
  ACTION:
  EXPECTED_AFTER_STATE:
  VERIFICATION:
  ROLLBACK_INSTRUCTION:

PROTECTED_FACTS:
PROTECTED_ASSETS:
BRAND_SPEC:
ASPECT_RATIO:
TARGET_DURATION:
CAPTION_SPEC:
AUDIO_SPEC:
END_CARD_SPEC:
EXPORT_SPEC:

COST_BUDGET:
- browser/manual execution preferred
- do not trigger paid AI analysis/reprocessing without approval

FORBIDDEN_ACTIONS:
- do not modify source media/master compositions
- do not invent words, quotes, people, places, dates, claims, B-roll, or consent
- do not add stock/AI people unless explicitly approved
- do not change brand system
- do not publish/schedule/connect social accounts
- do not delete/archive/overwrite masters
- do not combine unrelated edits into one bead
- do not silently repair a failed bead; log a corrective bead

STOP_CONDITIONS:
- current docs unavailable
- UI differs materially from docs and operation cannot be verified
- target composition/clip is ambiguous
- source truth conflicts with editor transcript
- protected asset is missing
- action would consume unapproved credits/minutes
- action becomes destructive or irreversible without a checkpoint
- rollback path for a risky bead cannot be established

INVARIANTS_AFTER_EACH_BEAD:
- source/master untouched
- accepted prior beads still intact
- protected facts unchanged unless specifically approved
- aspect ratio remains correct
- no accidental publish/schedule
- no unapproved stock/AI/effects/music/transitions/emoji
- no unintended timeline ripple outside target
- cost remains inside budget

SELF_QA_REQUIRED:
- inspect/watch final review export end-to-end when capability permits
- verify first/last frame, crop, captions, line breaks, safe zones, protected facts, brand, end card, audio, duration, resolution
- defects discovered during self-QA become new corrective beads

PROOF_REQUIRED:
- exact composition/clip ID and name
- checkpoint reference
- screenshots of aspect ratio/captions/export settings when practical
- before/after duration
- per-bead status + before/after proof
- caption QA status
- protected-facts QA status
- source/consent status
- export filename/review URL
- credits/minutes consumed if visible
- self-QA result
- explicit confirmation: NOT PUBLISHED

FINAL_GATE: HUMAN APPROVAL
```

## Execution loop

1. Refresh official docs.
2. Resolve `ASSET_ID`, `MISSION_ID`, `RUN_ID`, exact project, and exact target composition/clip.
3. Inspect and record pre-edit state.
4. Create a reversible checkpoint when required.
5. Decompose the brief into atomic video change beads using `VIDEO-CHANGE-BEADS.md`.
6. Apply exactly one bead at a time.
7. Save, inspect, verify, and capture proof for that bead before continuing.
8. Re-check invariants after every bead.
9. Export a new immutable REVIEW version using `VIDEO-ASSET-NAMING.md`.
10. Self-QA the exported review artifact end-to-end.
11. Create corrective beads for any defect found; never silently patch.
12. Return the complete bead ledger and proof packet.
13. Human/reviewer may accept, reject, or request rollback per bead.
14. Correction missions reference exact bead IDs and preserve all accepted beads.
15. Only after human approval may a FINAL version be created.
16. Publishing remains a separate approval-gated mission.

## Rollback command pattern

Reviewer can issue a compact command such as:

`KEEP VB-...-001,002,004,005; ROLLBACK VB-...-003.`

The browser agent must:
- load the asset manifest and last verified checkpoint;
- preserve accepted neighboring beads;
- restore only the target bead to its recorded before-state;
- verify dependent invariants;
- mark the bead `rolled_back`;
- create a new corrective bead if a replacement is requested.

## Product routing

### Descript first
Use when exact transcript ranges/story are already known or final precision matters.

### OpusClip first
Use when the source is long and candidate-moment discovery/reframing is the problem.

### Hybrid
Use OpusClip to discover candidates, then Descript to finish the selected cut. Do not pay twice for semantic analysis when the exact ranges are already known.

## Required companion files
- `VIDEO-CHANGE-BEADS.md`
- `VIDEO-ASSET-NAMING.md`
- `VIDEO-END-TO-END-LOOP.md`
- `video-asset-manifest.schema.json`
