---
name: browser-video-editor
description: Use for any browser-agent video editing workflow in Descript or OpusClip. Requires current-doc refresh, deterministic editing, protected-source handling, cost controls, proof, and human approval before publish.
---

# Browser Video Editor

## Purpose
Use Claude browser control (or another approved browser agent) as the low-cost mechanical editor for Descript and OpusClip. The browser agent executes an approved edit brief; it does not invent the story, facts, branding, footage, or publishing decision.

## Trigger
Load this skill whenever a task asks to:
- design a prompt or mission for a browser agent to edit video;
- operate Descript or OpusClip through a browser;
- create, trim, reframe, caption, brand, export, or schedule social video;
- compare Descript vs OpusClip for a video-editing operation;
- automate repetitive editor UI work.

## Mandatory current-doc refresh gate
Before writing the browser mission or touching either editor:
1. Read the current official docs for the product(s) being used.
2. For Descript, read the current Descript Help/API pages relevant to the exact operation and inspect `https://github.com/descriptinc/skills`, especially the relevant `SKILL.md` and `references/descript-api.md`.
3. For OpusClip, start from the current documentation index at `https://help.opus.pro/llms.txt`, then open the exact current pages relevant to the requested operation.
4. Record the docs URLs and access date in the mission/evidence record.
5. If product UI or docs conflict with this skill, current official docs win.
6. If docs cannot be read, STOP with `DOCS_REFRESH_BLOCKED`; do not guess from memory.

Do not rely on stale screenshots, remembered menu names, old blog posts, or prior missions when current docs are available.

## Source hierarchy
Use evidence in this order:
1. human-approved brief and protected facts;
2. current official product docs;
3. official vendor skills/reference repos;
4. current project state visible in the browser;
5. prior verified mission records.

Never allow lower-priority evidence to override higher-priority evidence.

## Planning law
Before clicking:
- identify the exact project and composition/clip;
- identify source media and protected assets;
- define target duration and aspect ratio;
- define exact transcript ranges or curation prompt when known;
- define captions, branding, crop, audio, end-card, and export requirements;
- define forbidden actions;
- define stop conditions;
- define proof required at completion.

If any of those are ambiguous and the ambiguity could alter content, facts, people, brand, money, or publishing, STOP rather than freestyle.

## Default tool routing
### Descript
Prefer Descript when the job is:
- transcript-led editing;
- precise known trim ranges;
- scene/layer work;
- manual crop and layout refinement;
- caption styling tied to the script;
- branded outro/end-card assembly;
- local MP4/SRT/VTT export;
- final human-controlled polish.

Descript supports portrait 9:16 and 1080p composition settings, scene/layer editing, reusable caption layouts, local MP4 export, and subtitle export. Do not export higher than the source quality expecting real upscaling.

### OpusClip
Prefer OpusClip when the job is:
- finding candidate moments from long source video;
- ClipAnything multimodal discovery using visual/audio/sentiment cues;
- rapid social reframing;
- bulk candidate generation;
- applying a known brand template to candidate clips;
- repeated prompt-based discovery from the same source.

Treat OpusClip virality scores as suggestions, never editorial truth. ClipAnything is a discovery engine, not final approval.

### Hybrid route
Preferred high-leverage route for long-form source:
1. OpusClip discovers candidate moments.
2. Human/director or approved reasoning agent selects the story.
3. Descript performs precise final edit, captions, brand treatment, and export.
4. Human approves.

If the exact transcript ranges are already known, skip OpusClip discovery unless there is a clear reason to spend additional processing credits.

## Cost law
- Browser/manual deterministic execution is the default.
- Do not invoke expensive semantic editor agents for mechanical tasks.
- Before any operation that consumes product AI credits/minutes, estimate the likely cost from current docs/account UI when available.
- Prefer already-transcribed text and known ranges over re-transcription or re-analysis.
- Prefer reprompting an existing OpusClip project where current product behavior permits it instead of reprocessing the entire source unnecessarily.
- If cost is unknown or materially higher than the approved budget, STOP with `COST_APPROVAL_REQUIRED`.

## Descript execution rules
1. Work only in the explicitly named `REVIEW` composition or create a duplicate if the brief requires it.
2. Never alter source media or canonical masters unless explicitly approved.
3. Verify 9:16 portrait and intended resolution before detailed layout work.
4. Use scenes/layers intentionally; do not add decorative transitions or stock media unless the brief asks for them.
5. Captions must be script-linked captions, not manually typed approximations, unless explicitly required.
6. Normalize caption font, size, line height, alignment, safe-zone placement, and speaker treatment across the composition.
7. Preserve readable mobile-safe line breaks; do not cover faces or important action.
8. Replace temporary end cards only with approved brand assets.
9. Do not invent subtitles, speaker labels, quotes, names, places, dates, or claims.
10. Local export is preferred for review deliverables. Publishing/share-page creation is a separate approval-gated action.

## OpusClip execution rules
1. Refresh current docs from `help.opus.pro/llms.txt` before mission design.
2. Use an approved brand template when one exists. Do not silently accept a preset template as the brand system.
3. For discovery, write a specific ClipAnything prompt describing the desired moment, story function, people, topic, and exclusions.
4. Review candidate clips against source truth. Do not accept a clip because it has a high virality score.
5. Set/verify target aspect ratio in the editor (normally 9:16 for Reels/Shorts).
6. Verify layout scene-by-scene; auto-layout/reframe is a starting point, not final QA.
7. Verify captions word-by-word, remove unwanted emoji/highlight behavior if it conflicts with the brand, and enforce the approved font/color system.
8. Trim/extend manually where needed; preserve complete thoughts and natural breaths.
9. Save/download important project outputs locally; do not rely on temporary cloud retention as the only copy.
10. Direct posting/scheduling is approval-gated.

## No-freestyle law
The browser agent MUST NOT:
- change the story thesis;
- create or paraphrase quotes;
- invent B-roll, people, event scenes, statistics, dates, venues, names, consent, or claims;
- add AI-generated people unless explicitly approved for a non-documentary use case;
- select music, stock, emojis, memes, transitions, or effects merely because the editor suggests them;
- change brand colors, logo, typography, logo placement, or end card without the approved design spec;
- publish, schedule, delete, archive, overwrite a master, or connect a social account without explicit approval;
- interpret a missing control as permission to find an alternative destructive path.

When the UI differs from the mission, pause and re-read the relevant current docs. If still unresolved, STOP and report the exact mismatch.

## Browser mission contract
Every mission must include:

```text
MISSION_ID:
PRODUCT: Descript | OpusClip | Hybrid
DOCS_REFRESHED_AT:
DOCS_READ:
PROJECT:
TARGET_COMPOSITION_OR_CLIP:
SOURCE_MEDIA:
GOAL:
EXACT_ALLOWED_EDITS:
PROTECTED_FACTS:
PROTECTED_ASSETS:
BRAND_SPEC:
ASPECT_RATIO:
TARGET_DURATION:
CAPTION_SPEC:
AUDIO_SPEC:
END_CARD_SPEC:
COST_BUDGET:
FORBIDDEN_ACTIONS:
STOP_CONDITIONS:
PROOF_REQUIRED:
FINAL_GATE: human approval
```

## Proof protocol
At completion, return:
- exact project/composition/clip name;
- before/after duration;
- aspect ratio and export resolution;
- concise change log;
- docs read and access date;
- screenshots of key settings when available;
- caption QA status;
- protected-facts QA status;
- source/consent status;
- export filename/path or review URL;
- credits/minutes consumed if visible;
- confirmation that nothing was published;
- remaining blockers.

A task is not `done` because the browser agent says it finished. `done` requires verifiable evidence.

## Scale-positive loop
After an approved edit:
1. Capture what worked.
2. Convert repeatable decisions into a template, checklist, browser mission, or validator.
3. Record failures and UI drift.
4. Update this skill or a product-specific reference only when verified.
5. Reuse the improved process on the next asset.

Scale verified capability, not raw output volume.
