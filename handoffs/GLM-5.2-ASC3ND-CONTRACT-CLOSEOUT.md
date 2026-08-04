# GLM 5.2 Handoff — ASC3ND Contract Closeout

## Mission

Finish the $2,450 ASC3ND 90-Day Social Presence Builder with evidence, minimal human interruption, and strict repository boundaries.

## First commands

1. Open `executiveusa/ascend-social-purpose-agentic-systems-`.
2. Read `AGENTS.md`.
3. Read all files in `control-plane/`.
4. Read `icm/asc3nd-contract-closeout/00_intake_and_evidence/`.
5. Run `npm run guard:repo`.
6. Start JCodeMunch MCP and call `plan_turn` before broad code reading.
7. Claim `T001` in `control-plane/task-ledger.json` on a new branch.

## Operating method

Use ICM, not a hidden swarm. The folder is the workflow. Use one orchestrator and bounded workers only where outputs are independent.

For every task:

```text
PLAN → CLAIM → RETRIEVE TARGETED CONTEXT → EXECUTE → TEST → ATTACH PROOF → UPDATE LEDGER → HANDOFF
```

Do not ask the user questions one at a time. Complete every independent action first, then return one consolidated blocker request.

## Contract target

Deliver:

- finished bilingual workbook and final export;
- proof or transparent gap report for four guided sessions;
- 12-week / 90-day content calendar;
- exactly 30 approved-quality captions;
- Month 1 shot list and visual-direction guide;
- updated bios for up to three platforms;
- client-owned handoff system and fulfillment ledger.

Do not count website, RSVP, agent-platform, advanced Meta automation, or full logo redesign as substitutes for these deliverables.

## Immediate execution sequence

### Pass 1 — Evidence

- Inspect the interactive workbook repo with JCodeMunch.
- Extract exact contract text, all client answers, approved pillars, weekly rhythm, audiences, voice, platform decisions, session evidence, and existing deliverables.
- Produce Stage 00 outputs.
- Do not generate new strategy until source truth is frozen.

### Pass 2 — Strategy manifest

- Normalize approved facts into `tenants/asc3nd/strategy-manifest.json`.
- Every field must include provenance and approval state.
- Unknown values remain null.

### Pass 3 — Media

The user has footage. Request one of these once, as a consolidated blocker:

1. direct downloadable Google Drive folder links;
2. Dropbox direct links; or
3. uploaded files with filenames and language notes.

Descript is the canonical editorial workspace. Create a new project named:

`ASC3ND — Founder Interview — Contract Closeout`

Import originals, create a 16:9 master composition, transcribe, label speakers, correct names and ASC3ND terminology, and generate a timestamped story map.

Use Opus Clip only to identify candidate hooks and short clips. Return selected candidates to Descript for exact-caption correction and final editing. Never let Opus Clip rewrite quotes or become the transcript source of truth.

### Pass 4 — Contract deliverables

Build calendar, caption bank, shot list, and bios from the frozen manifest and corrected transcript. Use the anti-slop and humanizer passes only after factual review. Preserve human voice; do not polish away meaning.

### Pass 5 — Facebook package

Prepare profile image, cover, About copy, launch posts, event package, and approved content drafts. Do not publish. Record page, ownership, access, 2FA, Instagram, and Postiz status with redacted evidence.

### Pass 6 — Handoff

Produce the client fulfillment ledger, editable sources, exports, operations guide, ownership map, and a flipbook showing:

- what was promised;
- what was completed;
- proof;
- what remains pending client input;
- how ASC3ND operates the system independently.

## Agent division

- **GLM 5.2:** repository inspection, structured extraction, calendars, captions, bios, JSON, code, and file assembly.
- **ChatGPT thread:** Descript connector actions, Supabase connector inspection, GitHub control-plane changes, visual/copy QA, small edits, approval framing, and final audit.
- **Human:** supplies media/access once, answers consolidated unknowns once, approves transcript direction, creative direction, and final publish/delivery.

## Current verified blockers

- This chat can see only the `botanic-creations` Supabase project; do not use it for ASC3ND.
- The connected Descript account currently contains only old untitled/demo projects; no ASC3ND media has been imported.
- The interactive workbook repo is not writable through this chat's current GitHub installation; GLM should use its own repo access and JCodeMunch.
- Production publishing and deployments require explicit human approval.

## Return format after each pass

```json
{
  "stage": "",
  "status": "complete|partial|blocked",
  "tasks_completed": [],
  "artifacts": [],
  "evidence": [],
  "tests": [],
  "blockers": [],
  "single_consolidated_user_request": [],
  "next_stage": ""
}
```

## Definition of success today

A client-reviewable package exists today containing at least:

- authoritative contract fulfillment ledger;
- current workbook status and proof;
- draft 12-week calendar structure populated from approved facts;
- first approved-quality caption batch;
- final Month 1 shot-list structure;
- three draft platform bios;
- media ingest manifest and exact next action for footage;
- client-facing progress flipbook draft.

Do not overbuild infrastructure while these outputs remain incomplete.