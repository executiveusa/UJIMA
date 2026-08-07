# SynthCut Local Video Workflow

## Purpose

Use SynthCut as a replaceable local mechanical video-editing engine inside Agenix/MONTAGE-style workflows. SynthCut is not allowed to become the tenant/project source of truth.

Current upstream: `https://github.com/Relo-video/SynthCut`

Refresh the upstream README/docs before implementation because capabilities and tool counts may change.

## Current upstream model

As of the 2026-08-07 docs refresh, SynthCut provides:

- persistent local editing core;
- non-destructive EDL/timeline;
- FFmpeg/ffprobe processing;
- Electron/React UI;
- MCP control surface;
- local Whisper captions/transcripts;
- transcript-based editing;
- subject-aware reframe;
- transforms/keyframes, grading/effects, audio, graphics;
- semantic/transcript media search;
- timeline inspection/frame retrieval;
- undo/redo and autosave;
- background render jobs;
- OTIO import/export;
- local/offline processing.

The upstream README currently reports 94 MCP tools in the feature section, while an earlier status sentence still says 85. Treat live tool discovery as authoritative; never hardcode the count as a capability contract.

## Agenix integration law

SynthCut is an **execution adapter**, not the product brain.

Canonical ownership remains:

`tenant/StudioProject/ICM state -> approved edit operation -> SynthCut adapter -> local edit -> evidence -> canonical state update`

Never allow SynthCut-specific identifiers to replace canonical project/asset IDs.

## Adapter responsibilities

A SynthCut adapter should provide stable application-level actions such as:

- import media;
- inspect timeline;
- transcribe;
- search transcript/media;
- propose cut ranges;
- apply trim/split/reorder;
- apply transcript edits;
- apply reframe;
- apply captions;
- apply audio cleanup within scope;
- render preview;
- retrieve verification frames;
- undo/revert mapped operation;
- export review/final;
- export OTIO/SRT when requested.

Agents should call Agenix application actions, not raw SynthCut tools directly, whenever a canonical adapter exists.

## Video Change Beads

Every material visible edit maps to one Video Change Bead.

For each bead capture:

- canonical asset ID;
- operation ID;
- SynthCut project/timeline target;
- before state;
- requested after state;
- exact adapter/tool call(s);
- verification evidence;
- rollback/revert instruction;
- reviewer disposition.

SynthCut's undo/redo is useful execution support but is not a substitute for Agenix's durable bead ledger and checkpoints.

## Local edit loop

`INSPECT -> PLAN -> PROPOSE BEADS -> APPROVE IF REQUIRED -> APPLY -> RENDER/GET FRAME -> VERIFY -> LOG -> REVIEW -> REVERT/REVISE -> EXPORT`

### Inspect

Resolve exact media, timeline, version, transcript, aspect ratio, protected facts, protected brand, and intended output.

### Plan

Choose deterministic operations first. Do not ask an LLM to visually drive UI clicks when an MCP edit action exists.

### Verify

After each material edit, verify the changed range and neighboring accepted ranges. For full review, inspect/play the entire output.

## Cost policy

Local FFmpeg/Whisper execution is preferred when it meets quality and time requirements. Cloud semantic analysis/generation may be routed separately only when the local workflow cannot meet the approved requirement.

Record:

- local runtime;
- paid provider cost if any;
- model/provider used;
- reason escalation was required.

## Source protection

Never overwrite source footage. Use immutable source references and versioned timelines/exports.

## Documentary guardrails

For real people/events:

- preserve speaker meaning;
- do not fabricate quotes;
- do not add synthetic people/event footage as though real;
- protect consent/private media;
- preserve protected names/dates/locations/facts;
- flag uncertain transcript or reframe ranges for review.

## Definition of done

A SynthCut task is complete only when:

- canonical operation exists;
- local operation executed;
- output verified;
- bead evidence attached;
- project state remains recoverable;
- review/final export is traceable;
- no unauthorized publishing occurred.

## Upstream license boundary

SynthCut is GPL-3.0. Before code copying, linking, redistribution, bundling, or commercial distribution, review license compatibility. Prefer a clean MCP/process adapter boundary and pinned upstream dependency unless an explicit licensing decision authorizes deeper integration.