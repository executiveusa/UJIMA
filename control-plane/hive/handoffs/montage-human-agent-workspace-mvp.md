# Montage Human + Agent Workspace MVP Handoff

**Bead:** A3OS-6.6  
**Owner repo for this contract:** `executiveusa/ascend-social-purpose-agentic-systems-`  
**Implementation owner for editor state/UI:** `executiveusa/pauli-montage-video-agent`  
**State law:** Montage owns canonical video/editorial project state. Agenix owns project context, policy, routing, approval, and evidence requirements.

## Outcome

A human or agent can open the same Montage project, inspect the same canonical timeline, make reversible edits, render a review version, reopen the project without state loss, and return evidence to Agenix.

## Required human workspace behavior

Montage must expose, using its existing Studio/Twick surfaces rather than a second editor product:

- synchronized video preview;
- visible timeline with source-backed clip segments;
- manual trim, split, move/reorder, delete/undo, and reopen persistence;
- title, episode marker, lower-third, caption, and graphic layers;
- source/transcript provenance visible enough to verify quotes and ranges;
- a Director/chat surface whose actions mutate the same canonical timeline used by manual controls;
- review/export controls that cannot silently publish;
- clear project/episode identity and version history.

The first usability bar is ASC3ND `WHY WE STARTED — 01 / 04`.

## Agent-callable behavior

The same application service layer must support stable operations for:

- ingest source;
- read project/timeline state;
- apply deterministic edit intent;
- render review version;
- verify output;
- reopen/round-trip project state;
- export review artifact;
- return evidence receipt.

CLI/API/MCP may be different transports, but they may not implement separate business logic or separate timeline truth.

## Contract

Agenix sends `control-plane/hive/contracts/video-edit-intent.schema.json` as a typed input to Montage.

Important fields:

- immutable source asset refs;
- source-backed story beats;
- deterministic timeline ranges;
- mini-series metadata (`episode_index`, `episode_total`, `display_marker`);
- presentation layers and brand style refs;
- human review + independent critic requirements;
- review-only storage/export targets.

## Mini-series rule

A mini-series is finite and explicitly numbered. Repeated wardrobe/location from one interview session is treated as intentional continuity rather than accidental repetition.

Required metadata:

- series title;
- episode index;
- episode total;
- display marker such as `01 / 04`;
- source session id;
- protected Story Bank references;
- per-episode objective;
- target duration;
- human review gate.

## Brand Kit boundary

Montage references approved Brand Kit assets/tokens by stable versioned refs. It must not fork or become the canonical brand vault.

Required style refs may include:

- typography token;
- title treatment;
- episode marker treatment;
- lower-third treatment;
- caption treatment;
- safe zones;
- logo/graphic asset ids.

## Google Drive boundary

Google Drive is an explicit storage/import/export adapter, not canonical project state.

Requirements:

- tenant-scoped authorization;
- stable Drive file/folder IDs;
- source vs review-export distinction;
- upload/download/sync receipts;
- no assumption that a ChatGPT-connected Drive session is inherited by local workers;
- no credentials in project files, Beads, GitHub, logs, or manifests.

## CapCut boundary

CapCut is a replaceable round-trip/fallback adapter only.

Before claiming support, verify what is actually automatable or import/export compatible. Until verified:

- do not claim programmatic CapCut control;
- do not let CapCut own canonical timeline state;
- preserve a Montage edit manifest/StudioProject as the authoritative version;
- treat CapCut export/import as an external derivative with evidence of what survived round-trip.

## Deterministic engines

Remotion and FFmpeg are engines behind Montage. They may render or finish, but they do not own project/timeline truth.

## First acceptance test

ASC3ND `WHY WE STARTED — 01 / 04` must prove:

1. source-backed non-contiguous interview segments can be assembled into one timeline;
2. the project opens in Montage as editable state;
3. a human can manually adjust at least one cut or timing value and undo/reopen it;
4. Director/chat can issue at least one deterministic timeline action against the same state;
5. title, `01 / 04`, founder lower thirds, and source-faithful captions are represented as editable layers;
6. a 9:16 review MP4 can be rendered and verified;
7. the render can be exported to an approved review target without publishing;
8. a valid evidence receipt returns to Agenix;
9. an independent critic evaluates the result before the Bead can close.

## Gauntlet law

Builder cannot approve itself. Each round returns the single biggest remaining gap to the builder. No fixed round count. Continue until the acceptance test passes or a genuine human approval/blocker is reached.

## Forbidden shortcuts

- no second StudioProject;
- no second Montage frontend;
- no hidden timeline in CapCut/Remotion/FFmpeg;
- no fabricated transcript ranges or quotes;
- no publishing;
- no source deletion;
- no cross-tenant media reuse;
- no credential leakage;
- no claim of completion without render, reopen, and evidence proof.
