---
name: beads-observability
description: Use Beads as the durable task, dependency, movement, and delivery ledger for agent work. Required for multi-step client work, cross-agent handoffs, delivery tracking, and approval gates.
---

# Beads Observability

Beads is the durable movement ledger for Agenix Studio agent work. ICM provides context and stage contracts; Beads records the actual work graph, ownership, dependencies, blockers, movements, and completion evidence.

## Boot rule

For any multi-step task, agent run, handoff, or client delivery:

1. ensure Beads is initialized with `bd init --init-if-missing`;
2. run `bd ready` before starting work;
3. claim or create the smallest bounded work item;
4. record dependencies before parallelizing;
5. close work only with evidence and a reason.

## Required operating behavior

- One Bead = one bounded outcome.
- One writing agent owns a Bead at a time.
- A parent Bead may represent an engagement slice; children represent isolated outputs.
- Use dependencies to express real blocking order instead of prose TODO lists.
- Human approval is represented as a blocking gate, never assumed from silence.
- If an agent switches repos, tools, models, or owners, record the handoff on the Bead.
- If delivery fails verification, reopen or create a corrective Bead; do not overwrite history.
- Never store secrets, private client payloads, or raw sensitive youth/family data in Beads.

## Minimum metadata for Agenix client work

Every client-related Bead should identify:

- client / tenant slug;
- engagement ID;
- deliverable ID or campaign asset ID;
- agent / owner;
- repository;
- branch or run reference;
- approval class: green / yellow / red;
- proof expected;
- delivery state;
- blocker or dependency IDs when applicable.

## Agent movement lifecycle

`created` → `ready` → `claimed` → `working` → `review` → `approval_gate` → `verified` → `closed`

If work moves backward, record the reason. Do not hide reversals.

## Required queries

Before work:

```bash
bd ready
bd list
```

During review / debugging:

```bash
bd show <id>
bd dep tree <id>
```

Before delivery:

```bash
bd doctor
bd list
```

For synchronization / durable history use the repository's approved Beads sync workflow. A schema/database migration must never be improvised by a worker agent.

## Client delivery mapping

Client-facing artifacts must not expose raw Beads internals. They consume a safe projection of Beads state:

- `Needs your approval`
- `In production`
- `Scheduled`
- `Delivered`
- `Blocked — needs input`

The client sees decisions and outcomes. Operators can drill into the Bead graph for full provenance.

## Proof law

A Bead may close only when its acceptance criteria and proof exist. Good proof includes test output, artifact URL, versioned file, screenshot, deployment ID, database query, approval record, published URL, or verification timestamp.

## Upstream

Beads: https://github.com/gastownhall/beads

Use the current stable CLI and run `bd doctor` after upgrades or migrations. Do not silently migrate a shared Beads store.