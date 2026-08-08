# AGENTS.md — Agenix Hive

This file applies to all work under `control-plane/hive/`.

Before any Hive change:

1. Read `HIVE-CONSTITUTION.md`.
2. Read `contracts/state-ownership.v0.json` and the contract relevant to the task.
3. Identify the canonical state owner and owner repository.
4. If the requested write belongs to another repository, stop and create a typed cross-repo work order/handoff. Do not edit that repo from this working branch.
5. Database DDL must be a committed migration and must be verified against a development/approved target before completion is claimed.
6. No secret, password, API key, private media, youth/client PII, or raw credential may enter a Hive event, receipt, migration or log.
7. No external publish/destructive production action may bypass the approval contract.
8. One active write lease per resource. Stale/ambiguous leases fail closed.
9. All cross-provider messages carry `correlation_id`; retryable events/actions carry an idempotency key.
10. `completed` requires an evidence receipt. No proof means partial/blocked/failed.

## Repository federation rule

Agenix Hive coordinates providers; it does not absorb their private state or code.

- Agenix Governor owns policy/context/acceptance.
- Paperclip owns organizational work state.
- Darya/OpenHands owns engineering execution state.
- Montage owns StudioProject/timeline/editorial state.
- Open Interpreter owns computer execution sessions.

Never create a second owner for those domains in this repository.

## Cross-repo engineering sequence

`WORK ORDER -> LEASE -> OWNER-REPO BRANCH -> TEST -> IMPLEMENT -> TEST -> PR -> REVIEW -> MERGE -> VERIFY -> RECEIPT`

A multi-repo objective must use separate owner-repo branches/PRs tied by one correlation ID.