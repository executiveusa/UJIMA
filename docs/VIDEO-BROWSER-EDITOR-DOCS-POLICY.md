# Video Browser Editor — Docs and Source-of-Truth Policy

## Why this exists
Descript and OpusClip change quickly. Browser automation that relies on remembered UI labels or old screenshots becomes brittle and can waste credits or damage work. Every mission therefore refreshes current official documentation before execution.

## Descript sources
Read only what is relevant to the operation, but start from current official sources:

- https://github.com/descriptinc/skills
- https://github.com/descriptinc/skills/blob/main/references/descript-api.md
- https://help.descript.com/
- https://docs.descriptapi.com/

Useful current areas include:
- aspect ratio and video settings;
- scenes and scene properties;
- captions and reusable layouts;
- MP4/local export;
- subtitle export;
- saved frames;
- API job polling and current limitations.

The official Descript skills repository explicitly states that the API documentation is the source of truth and current docs win when skills conflict with them. It also documents a manual-app fallback for API-enabled workflows.

## OpusClip sources
Start every OpusClip mission from:

- https://help.opus.pro/llms.txt

Then open only the relevant current pages, such as:
- Introduction to OpusClip;
- ClipAnything and prompt guidance;
- Brand Templates;
- Adjust Layout;
- Change Aspect Ratio;
- Result Page / Editor;
- Keyboard Precise Editing;
- API project creation and current pricing/limits.

Key operating facts must be reverified at mission time. Historically/currently documented capabilities include ClipAnything candidate discovery, reprompting, brand templates, 9:16/1:1/16:9 layouts, editor-based refinement, HD/XML export, and direct social publishing. These are not permanent assumptions; refresh docs first.

## Rules
1. Current official docs beat repository memory.
2. Vendor skills are useful reference material, not a replacement for current docs.
3. Do not scrape broad documentation when one or two exact pages answer the operation.
4. Record URLs plus date/time refreshed in each browser mission.
5. If a UI control is not where docs say it is, re-check current docs before trying alternatives.
6. If there is still ambiguity, stop rather than improvising.
7. Do not infer account-plan capabilities; inspect the account UI/current pricing docs when capability or cost depends on plan.
8. Never put API keys, auth tokens, client secrets, or private media URLs into mission logs or repository files.

## Cost policy
Browser/manual editor operations are preferred for deterministic work. Semantic AI processing is reserved for tasks that genuinely require discovery, story restructuring, or multimodal reasoning.

For OpusClip, processing minutes/credits are a budgeted resource. For Descript, AI-agent edits are a budgeted resource. Before re-processing the same source, ask whether the needed result can be achieved with manual editor operations, an existing transcript, an existing project, or an existing clip.

## Proof policy
A browser mission is complete only after it returns enough evidence for another reviewer to confirm:
- target asset;
- source used;
- duration;
- aspect ratio/resolution;
- captions status;
- protected facts;
- export artifact;
- cost visible in product UI when available;
- no publishing occurred without approval.
