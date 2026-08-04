# ASC3ND Contract Closeout Control Plane

## Purpose

This directory is the single operational source of truth for finishing the ASC3ND 90-Day Social Presence Builder. It does not replace client-approved workbook answers or media. It indexes them, records provenance, routes work to the correct repository, and tracks proof.

## Required read order

1. `../AGENTS.md`
2. `repo-registry.json`
3. `contract-ledger.json`
4. `task-ledger.json`
5. `architecture.md`
6. Current numbered ICM stage

## Token-compression law

- JCodeMunch MCP is the default repo reader.
- Begin with `plan_turn`.
- Retrieve outlines before files.
- Retrieve symbols before whole modules.
- Load only the active stage and explicitly linked outputs.
- Summarize evidence into structured JSON; do not repeatedly reload transcripts or repositories.
- Preserve exact quotes only where approval, contract language, or caption accuracy requires them.

## Work claiming

Before starting a task, set its `status` to `claimed`, add `agent`, `repo`, `branch`, and `started_at`. One task has one writing agent. Other agents may review but may not edit the same output path concurrently.

## Completion rule

A task is `done` only when all acceptance criteria pass and `evidence[]` contains concrete proof. `Implemented`, `generated`, or `looks correct` are not proof.

## Approval classes

- `green`: reversible drafts, analysis, local tests
- `yellow`: client-facing copy/assets, preview deploys, external tool imports
- `red`: production deploys, publishing, DNS, secrets, database migrations, deletions, external email/messages

Yellow and red actions require a recorded approval ID.

## Minimal agent topology

One orchestrator coordinates bounded workers:

- Contract and workbook extractor
- Calendar and caption writer
- Media/transcript editor
- Visual direction and export worker
- Platform bio and Facebook package worker
- QA/evidence auditor

Do not create additional agents unless a current task cannot be isolated safely with this set.