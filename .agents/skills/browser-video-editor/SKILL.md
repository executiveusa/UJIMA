---
name: browser-video-editor
description: Use for any browser-agent video editing workflow in Descript or OpusClip. Requires current-doc refresh, deterministic editing, atomic change beads, rollback safety, protected-source handling, cost controls, proof, and human approval before publish.
---

# Browser Video Editor

## Purpose
Use Claude browser control (or another approved browser agent) as the low-cost mechanical editor for Descript and OpusClip. The browser agent executes an approved edit brief; it does not invent the story, facts, branding, footage, or publishing decision.

## Required companion protocols
Before a browser-video mission, read:
- `control-plane/video/VIDEO-CHANGE-BEADS.md`
- `control-plane/video/VIDEO-ASSET-NAMING.md`
- `control-plane/video/VIDEO-END-TO-END-LOOP.md`
- `control-plane/video/browser-editor-mission-template.md`
- `control-plane/video/video-asset-manifest.schema.json`

## Trigger
Load this skill whenever a task asks to design or execute a browser-agent video edit in Descript or OpusClip; create, trim, reframe, caption, brand, export, or schedule social video; compare the two products; or automate repetitive editor UI work.

## Mandatory current-doc refresh gate
Before writing the browser mission or touching either editor:
1. Read the current official docs for the product(s) being used.
2. For Descript, read the current Help/API pages relevant to the exact operation and inspect `https://github.com/descriptinc/skills`, especially the relevant `SKILL.md` and `references/descript-api.md`.
3. For OpusClip, start from `https://help.opus.pro/llms.txt`, then open the current pages relevant to the requested operation.
4. Record docs URLs and access date in the mission/evidence record.
5. Current official docs override stale memory, screenshots, or prior missions.
6. If docs cannot be read, STOP with `DOCS_REFRESH_BLOCKED`; do not guess.

## Source hierarchy
1. human-approved brief and protected facts;
2. current official product docs;
3. official vendor skills/reference repos;
4. current project state visible in the browser;
5. prior verified mission records.

Lower-priority evidence never overrides higher-priority evidence.

## Asset identity law
Every mission must resolve a canonical `ASSET_ID`, `MISSION_ID`, `RUN_ID`, exact editor project ID/URL, and exact target composition/clip ID/name before clicking. Use `VIDEO-ASSET-NAMING.md`. Never identify a video only by its visual appearance or editor position.

## Atomic change-bead law
Every visible or behavioral edit is logged as an independently reviewable and reversible video change bead.

- One change bead = one bounded change.
- Five independent changes = five bead IDs.
- Each bead records target, before-state, action, after-state, verification, proof, and rollback instruction.
- Never hide unrelated changes inside a single bead.
- Never silently repair a failed edit; create a corrective bead.
- Reviewer decisions are per bead, so four accepted changes can remain while one bad change is rolled back.

Use the immutable ID format defined in `VIDEO-CHANGE-BEADS.md`.

## Checkpoint and rollback law
Create a reversible checkpoint before the first edit and before operations that may ripple or cannot be selectively undone. The rollback path must be known before risky changes.

A rollback request such as:

`KEEP <bead-1>, <bead-2>, <bead-4>; ROLLBACK <bead-3>`

means preserve all accepted neighboring beads and restore only the rejected bead to its recorded before-state or checkpoint. Mark history `rolled_back`; never erase the record of the rejected edit.

If selective rollback cannot be guaranteed, STOP and create a safer duplicate/checkpoint rather than improvising.

## Default tool routing
### Descript
Prefer for transcript-led editing, known trim ranges, scene/layer work, manual crop/layout refinement, script-linked captions, branded end cards, local MP4/SRT/VTT export, and final precision.

### OpusClip
Prefer for long-source candidate discovery, ClipAnything multimodal discovery, rapid social reframing, bulk candidate generation, and known brand-template application. Virality scores are suggestions, not editorial truth.

### Hybrid
OpusClip discovers candidates -> human/director selects story -> Descript finishes -> human approves. If exact transcript ranges are already known, skip OpusClip unless there is a clear reason to spend more processing credits.

## Cost law
- Browser/manual deterministic execution is default.
- Do not invoke expensive semantic editor agents for mechanical tasks.
- Estimate likely AI credit/minute cost before paid processing when possible.
- Prefer existing transcripts, known ranges, and existing projects over re-analysis.
- If cost is unknown or materially above budget, STOP with `COST_APPROVAL_REQUIRED`.
- Record credits/minutes consumed in the asset manifest when visible.

## Descript execution rules
1. Work only in the named REVIEW composition or an approved duplicate.
2. Never alter source media or canonical masters without explicit approval.
3. Verify aspect ratio/resolution before detailed layout work.
4. Do not add decorative transitions or stock media unless specified.
5. Captions must remain script-linked unless explicitly required otherwise.
6. Normalize caption typography, line height, alignment, safe zones, and speaker treatment.
7. Preserve readable mobile-safe line breaks and do not cover important faces/action.
8. Replace temporary end cards only with approved assets.
9. Do not invent subtitles, speaker labels, quotes, names, places, dates, or claims.
10. Local review export is preferred. Publishing is a separate approval-gated mission.

## OpusClip execution rules
1. Refresh current docs before mission design.
2. Use an approved brand template when one exists; presets are not the brand system.
3. Discovery prompts must specify desired moment, story function, people/topic, and exclusions.
4. Review candidates against source truth; never accept by virality score alone.
5. Verify target aspect ratio and scene layout manually.
6. Verify captions word-by-word and remove unwanted emoji/highlight behavior if off-brand.
7. Preserve complete thoughts and natural breaths when trimming/extending.
8. Save important outputs; do not rely on temporary cloud retention as the only copy.
9. Direct posting/scheduling is approval-gated.

## No-freestyle law
The browser agent MUST NOT change the story thesis, paraphrase quotes, invent B-roll/people/event scenes/statistics/dates/venues/names/consent/claims, add AI people without explicit approval, accept suggested music/stock/emoji/memes/transitions/effects by default, alter brand colors/logo/typography/end card without spec, publish/schedule/delete/archive/overwrite a master/connect social accounts without approval, or interpret a missing control as permission for a destructive workaround.

When UI differs from mission, re-read current docs. If unresolved, STOP and report the mismatch.

## Execution loop
Use `VIDEO-END-TO-END-LOOP.md`:

`REFRESH DOCS -> INSPECT -> CHECKPOINT -> PLAN BEADS -> APPLY ONE BEAD -> VERIFY -> CONTINUE -> EXPORT REVIEW -> SELF-QA -> HUMAN REVIEW -> ACCEPT/ROLLBACK -> FINALIZE -> REGISTER -> REUSE`

After every bead, re-check invariants: source/master untouched; accepted prior beads intact; protected facts unchanged; aspect ratio correct; no accidental publish; no unapproved assets/effects; no unintended timeline ripple; cost in budget.

## Self-QA law
Before returning a review artifact, the browser agent must inspect/watch the render end-to-end when capability permits and verify first/last frame, pacing, crop, captions, line breaks, safe zones, protected facts, brand treatment, end card, audio, duration, resolution, and absence of editor artifacts. Any discovered defect becomes a new corrective bead.

## Proof protocol
At completion return:
- asset ID, mission ID, run ID;
- exact project/composition/clip ID and name;
- checkpoint reference;
- before/after duration and export resolution;
- every bead ID, status, before/after state, verification, rollback instruction, and proof;
- docs read and access date;
- caption/protected-facts/source-consent QA;
- review export filename/path or URL;
- self-QA result;
- credits/minutes consumed if visible;
- confirmation `NOT PUBLISHED`;
- remaining blockers.

A task is not done because the browser agent says it finished. Done requires verifiable evidence and a machine-readable manifest update.

## Machine-readable manifest law
Every asset keeps one canonical manifest conforming to `video-asset-manifest.schema.json`. It tracks editor IDs, versions, missions, beads, exports, approval state, publish state, rollback history, and cost telemetry. Never overwrite accepted history. `FINAL` means human-approved, not merely exported.

## Scale-positive loop
After an approved edit:
1. capture what worked;
2. convert repeatable decisions into templates/checklists/validators;
3. record failures, costs, and UI drift;
4. update this skill only from verified recurring behavior;
5. reuse the improved process on the next asset.

Scale verified capability, not raw output volume.
