# Slice 04 — First Mate Mission Router — INPUT

## Base

- Main SHA: `e7913398935026bd6eaf5d09eac8b0e23644f49b`
- Owner repository: `executiveusa/ascend-social-purpose-agentic-systems-`
- Writing role: control-plane/orchestration implementation
- Public ASC3ND frontend: frozen and out of scope

## Permitted sources

- `AGENTS.md`
- `REPO_SCOPE.md`
- `repo-boundary.json`
- `control-plane/client-chat-execution-loop.json`
- `control-plane/contracts/chat-mission-handoff.schema.json`
- `control-plane/schemas/mission-envelope.schema.json`
- `control-plane/skills-router.json`
- `control-plane/studio/repository-boundaries.json`
- `control-plane/studio/role-security.json`
- `docs/CLIENT-CHAT-ARCHITECTURE.md`
- Slice 03 merged client-chat persistence/authentication implementation
- existing `@asc3nd/core/events` event journal
- existing Mission API browser session authentication and client-chat routes

## Explicit non-inputs

- public ASC3ND website code or copy
- private youth/client records
- live grant portals or credentials
- production publishing, email, payments, DNS, database migrations, or deployment
- model/provider selection exposed to the client

## Constraint

First Mate is a liaison/router only. ICM remains canonical organizational truth. Slice 04 may prepare and persist bounded internal mission handoffs; it may not execute consequential external actions.