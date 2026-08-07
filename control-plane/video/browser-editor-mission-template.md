# Browser Video Editor Mission Template

Use with Claude browser control or another approved browser agent.

```text
MISSION_ID:
CLIENT:
PRODUCT: Descript | OpusClip | Hybrid
DOCS_REFRESHED_AT:
DOCS_READ:
- <official URL>
- <official URL>

PROJECT:
TARGET_COMPOSITION_OR_CLIP:
SOURCE_MEDIA:
SOURCE_TRUTH:
- transcript/timestamps:
- protected facts:
- approved brand assets:

GOAL:

EXACT_ALLOWED_EDITS:
1.
2.
3.

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

STOP_CONDITIONS:
- current docs unavailable
- UI differs materially from docs and operation cannot be verified
- target composition/clip is ambiguous
- source truth conflicts with editor transcript
- protected asset is missing
- action would consume unapproved credits/minutes
- action becomes destructive or irreversible

PROOF_REQUIRED:
- exact composition/clip name
- screenshots of aspect ratio/captions/export settings when practical
- before/after duration
- caption QA status
- protected-facts QA status
- source/consent status
- export filename/review URL
- credits/minutes consumed if visible
- change log
- explicit confirmation: NOT PUBLISHED

FINAL_GATE: HUMAN APPROVAL
```

## Execution loop

1. Refresh official docs.
2. Inspect project state before editing.
3. Duplicate or target only the named review asset.
4. Perform one bounded class of edits at a time.
5. Save/check after each bounded class.
6. Compare result against the mission, not against the editor's suggestions.
7. Export review artifact.
8. Return proof.
9. Human/reviewer checks result.
10. Issue correction mission if needed.
11. Only after approval may a separate publishing mission be created.

## Product routing

### Descript first
Use when exact transcript ranges/story are already known or final precision matters.

### OpusClip first
Use when the source is long and candidate-moment discovery/reframing is the problem.

### Hybrid
Use OpusClip to discover candidates, then Descript to finish the selected cut. Do not pay twice for semantic analysis when the exact ranges are already known.
