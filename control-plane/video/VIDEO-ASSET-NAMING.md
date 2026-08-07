# Video Asset Naming Standard

## Goal
Every source, composition, review export, final export, mission, and change bead must be machine-readable and searchable without relying on memory or editor UI state.

## Canonical asset ID

`<CLIENT>-<CHANNEL>-<YYYYMMDD>-<SLUG>`

Example:

`ASC3ND-IGR-20260812-WHY-WE-STARTED`

Allowed channel codes:
- `IGR` = Instagram Reel
- `IGF` = Instagram Feed
- `IGS` = Instagram Story
- `FBV` = Facebook Video
- `YTS` = YouTube Short
- `YTV` = YouTube Video
- `GEN` = generic/multi-channel

Use uppercase ASCII for client/channel, `YYYYMMDD` dates, and uppercase hyphenated slugs. Do not put spaces in machine IDs.

## Mission ID

`VM-<ASSET_ID>-R<NN>`

Example:

`VM-ASC3ND-IGR-20260812-WHY-WE-STARTED-R01`

## Composition name
Human-readable editor name may include spaces, but MUST begin with the asset ID and stage:

`<ASSET_ID>__<STAGE>__v<NN>`

Stages:
- `SOURCE`
- `MASTER`
- `REVIEW`
- `APPROVED`
- `FINAL`
- `ARCHIVE`

Example:

`ASC3ND-IGR-20260812-WHY-WE-STARTED__REVIEW__v02`

## Export filename

`<ASSET_ID>__<STAGE>__v<NN>__<WIDTH>x<HEIGHT>__<FPS>fps.<ext>`

Example:

`ASC3ND-IGR-20260812-WHY-WE-STARTED__REVIEW__v02__1080x1920__30fps.mp4`

Optional deterministic suffixes, in this order:
- language: `__EN`, `__ES`, `__BILINGUAL`
- caption state: `__CAP`, `__NOCAP`
- audio state: `__MIX`, `__RAW`

Do not add subjective words such as `best`, `new`, `final-final`, `good`, or `latest`.

## Run ID

`R<NN>` per asset, monotonically increasing.

A run represents one browser-agent mission execution. It may contain multiple change beads.

## Change bead ID

`VB-<ASSET_ID>-<RUN>-<NNN>`

Example:

`VB-ASC3ND-IGR-20260812-WHY-WE-STARTED-R02-004`

## Manifest location
Each asset should have one canonical manifest record in the Agenix control plane, keyed by `asset_id`, containing:
- client
- campaign
- platform/channel
- scheduled date
- editor product
- editor project ID/URL
- source media references
- composition IDs/names
- current stage/version
- mission IDs
- change bead IDs
- review/export paths
- approval state
- publish state

## Lookup rule
Never identify an asset only by visual description or editor position. Every browser mission must carry `ASSET_ID`, `MISSION_ID`, exact project identifier, and exact target composition name/ID.

## Version law
- increment `vNN` whenever the rendered output changes;
- never overwrite an accepted review export;
- `FINAL` means human-approved, not merely exported;
- if a final is changed, create the next version; never silently replace history.
