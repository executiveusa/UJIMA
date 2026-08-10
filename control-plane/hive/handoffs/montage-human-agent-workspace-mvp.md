# Montage Human + Agent Workspace MVP Handoff

**Bead:** A3OS-6.6  
**Owner repo for this contract:** `executiveusa/ascend-social-purpose-agentic-systems-`  
**Implementation owner for editor state/UI:** `executiveusa/pauli-montage-video-agent`  
**State law:** Montage owns canonical video/editorial project state. Agenix owns project context, policy, routing, approval, and evidence requirements.

## Outcome

A human or agent can open the same Montage project, inspect the same canonical timeline, make reversible edits, render a review version, reopen the project without state loss, and return evidence to Agenix.

## Verified live baseline — 2026-08-09

Direct inspection of the current Vercel production surface proves the following already exists:

- `/`, `/studio`, `/studio/new`, `/studio/projects/[projectId]/footage`, and `/studio/projects/[projectId]/edit` return working application surfaces;
- New Project attempts hosted `POST /api/studio/projects` and falls back to a browser-local StudioProject when the hosted service is not connected;
- browser-local StudioProject persistence uses versioned timeline state, optimistic conflict detection, and an immutable-source extension;
- the footage workbench exposes a local engine URL (`http://127.0.0.1:4788`), source upload, local transcription, deterministic cut, 9:16 reframe, captions, technical verification, undo, and a material-change receipt ledger;
- the timeline editor can load/save hosted or browser-local StudioProject state, reopen versioned state, add/remove/reorder text tracks, edit text items, edit item start/duration values, and handle save conflicts;
- Vercel has a READY production-target deployment on `main` and the last-24-hour runtime error query returned no error clusters.

The hosted Studio API is **not connected** in the current production deployment: `GET /api/studio/projects` returns `503 service_not_connected`. The browser-local fallback is therefore real and useful, but it is not equivalent to a connected shared/persistent hosted workspace.

### Ordered implementation gaps

The gauntlet must close these gaps in this order, one judgeable slice at a time:

1. **Synchronized media preview + visual video clip timeline** in the existing timeline editor.
2. **Canonical video-segment trim/split/reorder/undo** in that same StudioProject timeline.
3. **Director/chat command path** that mutates the same canonical StudioProject timeline as manual controls.
4. **Agenix `video-edit-intent` importer** into StudioProject with correlation/idempotency preserved.
5. **Mini-series metadata UI** including `01 / 04`, episode identity, source-session continuity, and protected Story Bank refs.
6. **Hosted/shared project service connection** so projects are not browser-local only when collaboration/persistence is required.
7. **Google Drive import/export/sync adapter** with tenant-scoped authorization and stable external file IDs.
8. **CapCut round-trip/fallback adapter** with explicit survival-loss evidence and no ownership of canonical state.
9. **Full synthetic round-trip receipt**, followed by the real ASC3ND `WHY WE STARTED — 01 / 04` render/reopen/critic proof.

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

Current source transport fact: the connected Drive account exposes the ASC3ND interview folder and raw files, but this chat connector rejects direct download of the 2.41 GB source because it exceeds the connector's 100 MB transfer ceiling. Montage/local workers therefore need their own authenticated Drive/local-file path for production media.

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

## Synthetic acceptance test first

Before real ASC3ND media is required, Montage must consume `control-plane/hive/examples/montage-workspace-roundtrip.fixture.json` and prove:

`intent -> StudioProject -> visible preview/timeline -> manual edit -> Director edit -> save/reopen -> deterministic render -> technical verify -> critic receipt`

This test exists specifically so large-file transport cannot be used as a reason to defer editor correctness.

## Gauntlet law

Builder cannot approve itself. Each round returns the single biggest remaining gap to the builder. No fixed round count. Continue until the acceptance test passes or a genuine human approval/blocker is reached.

## Access boundary

As of this checkpoint, the current ChatGPT GitHub installation does not expose `executiveusa/pauli-montage-video-agent` as an installed/writable repository. The governor can inspect the public deployed Montage surface and public repository, but direct Montage source mutation from this connector is blocked until that repository is added to the GitHub app installation or a local owner worker returns a branch/PR.

This access limitation must not be confused with a product limitation or used to fabricate completion.

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
