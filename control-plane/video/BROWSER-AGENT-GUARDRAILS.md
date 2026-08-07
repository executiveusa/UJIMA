# Browser Agent Video Guardrails

These guardrails are mandatory for Claude browser control or any browser agent operating Descript, OpusClip, or a related video editor under Agenix.

## 1. Default-deny behavior

If the mission does not explicitly allow an action, the browser agent MUST NOT perform it.

Capability is not permission.

## 2. No freestyle

The browser agent MUST NOT independently change:

- story thesis;
- wording or quotes;
- speaker meaning;
- protected event facts;
- names, dates, venues, claims, statistics, or calls to action;
- brand colors, logo, typography, logo placement, or approved end-card treatment;
- source footage selection beyond the bounded mission;
- music, stock, emoji, transitions, effects, AI-generated people, AI B-roll, or decorative media;
- publishing destination or schedule.

If a better creative idea occurs, report it as a suggestion. Do not execute it unless separately approved.

## 3. Current docs first

Before any editor operation:

- refresh current official docs for the exact requested operation;
- Descript: current Help/API docs and `descriptinc/skills` relevant files;
- OpusClip: current official docs beginning from its current docs index;
- record docs URLs and access date.

If docs are unavailable or UI behavior materially conflicts with current docs, STOP with `DOCS_REFRESH_BLOCKED` or `UI_DOCS_MISMATCH`.

Never invent menu names, capabilities, pricing, retention, API parameters, or editor behavior.

## 4. Protect masters and source media

The browser agent MUST NOT:

- overwrite canonical masters;
- delete source media;
- archive projects;
- rename canonical masters without approval;
- flatten or replace source material;
- alter an already-approved final asset under the same version identity.

Work in named REVIEW duplicates unless the mission explicitly says otherwise.

## 5. Atomic change rule

Every material visible edit MUST have its own Video Change Bead before or immediately when it is performed.

No hidden edits.
No vague `polished video` change records.
No bundling five unrelated changes into one bead.

If self-QA discovers a defect, create a new bead before fixing it.

## 6. Rollback safety

Before a destructive or ripple-prone edit, create a recoverable checkpoint.

Rollback must be selective:

- restore the rejected bead only;
- preserve accepted neighboring changes;
- verify both the restored element and preserved elements afterward.

Browser undo history alone is insufficient proof of recoverability.

## 7. Cost guardrail

Browser/manual deterministic editing is the default.

The browser agent MUST NOT trigger paid AI processing, semantic analysis, re-transcription, re-generation, or full-source reprocessing without an explicit approved budget or mission instruction.

If the cost is unknown or may be material, STOP with `COST_APPROVAL_REQUIRED`.

Record visible credits/minutes consumed when available.

## 8. Protected factual content

Protected facts override editor transcripts, auto-captions, auto-summary, suggested copy, and model memory.

If protected facts conflict with what is visible in the editor, STOP and report the conflict.

Do not silently reconcile it.

## 9. Captions

Captions must:

- remain faithful to spoken words;
- use approved styling;
- respect mobile-safe zones;
- avoid covering faces and important action;
- preserve readable line breaks;
- avoid unapproved emoji/highlight styles;
- be checked after any crop/layout change.

Do not manually rewrite speech merely to make captions shorter unless approved.

## 10. Framing and crop

Auto-reframe is a starting point, not acceptance evidence.

The browser agent must inspect framing scene-by-scene when people or important action are present.

Do not crop out speakers, eyes, meaningful gestures, text, products, or protected visual elements merely to satisfy center framing.

## 11. Audio

Do not add or replace music without approval.

Do not use aggressive denoise, studio effects, voice enhancement, EQ, or gain changes that materially alter the voice without explicit mission scope.

Mechanical cleanup must preserve intelligibility and natural speech.

## 12. AI/stock media prohibition

For documentary or real-client work, do not introduce:

- AI-generated people;
- synthetic event scenes;
- fake crowds;
- fake venues;
- fake products;
- fake testimonials;
- stock that can be mistaken for the client's real activity.

Only use approved real media or explicitly approved illustrative assets.

## 13. Publishing gate

The browser agent MUST NOT:

- publish;
- schedule;
- connect social accounts;
- change account permissions;
- create public share links beyond an explicitly approved review share;
- send outbound communications;

without a separate explicit human approval gate.

Every editing mission ends in `NOT_PUBLISHED` unless the mission is specifically a post-approval publishing mission.

## 14. File naming and asset registration

Do not export generic names such as:

- `final.mp4`
- `video2.mp4`
- `reel-new.mp4`

Use the machine-readable naming convention in `VIDEO-ASSET-NAMING.md`.

Every export must be traceable to its asset ID, mission/run, version, dimensions, and editor project/composition.

## 15. Evidence requirement

No edit is considered complete without evidence appropriate to the change.

Evidence may include:

- screenshot of setting;
- before/after visible state;
- duration;
- composition/clip ID;
- editor URL;
- exported review artifact;
- bead log;
- full-playback QA result.

`I changed it` is not evidence.

## 16. Stop conditions

Stop immediately when any of these occurs:

- target project/composition is ambiguous;
- protected facts conflict;
- protected asset is missing;
- current docs cannot be refreshed;
- UI differs materially and cannot be verified;
- required checkpoint cannot be created;
- action would overwrite/delete approved work;
- cost is unapproved;
- login/permissions are insufficient;
- a CAPTCHA/security challenge appears;
- source consent is uncertain;
- publishing would occur without approval;
- the browser agent cannot prove which change it made.

## 17. Failure behavior

On failure:

1. stop making new edits;
2. record current state;
3. identify the last verified bead;
4. preserve accepted work;
5. record the failed bead and exact reason;
6. attach evidence/screenshots when possible;
7. recommend rollback, retry, or human intervention;
8. do not improvise a workaround that expands mission scope.

## 18. Human correction syntax

The browser agent must understand correction instructions such as:

`KEEP VB-...-001,002,004; ROLLBACK VB-...-003; REVISE VB-...-005 with caption Y=72%.`

Accepted beads are frozen unless a new mission explicitly reopens them.

## 19. Final QA gate

Before a review or final export is accepted, verify:

- correct composition;
- correct version;
- correct aspect ratio/resolution;
- duration;
- captions;
- crop/framing;
- protected facts;
- logo/brand treatment;
- end card;
- audio continuity;
- no accidental stock/AI/effects;
- no unintended changes from neighboring beads;
- export filename;
- manifest relationship;
- publish state.

## 20. Core principle

The browser agent is allowed to be persistent, not creative with authority.

It may iterate repeatedly to achieve an approved specification, but it may not expand the specification on its own.

The desired loop is:

`SPEC -> EXECUTE -> VERIFY -> LOG -> REVIEW -> ROLLBACK/REVISE -> VERIFY -> REGISTER -> REUSE`

Scale verified capability, not untracked output.