# Agenix Hive

Agenix Hive is the federation/control layer that lets the user's existing specialist repositories work as one governed team without merging their private state or source trees.

## Human control point

**Agenix Command** is the only user-facing command surface. Text and voice use the same command contract.

Agenix loads project truth/policy, resolves intent to a capability, and hands organizational execution to Paperclip. Paperclip delegates to the provider that owns the capability. The provider returns events/artifacts/evidence to the Hive. Approval-gated actions stop for the human.

## Initial providers

- `agenix-governor` — governance, project context/policy, acceptance evidence
- `paperclip-hq` — management, goals, tickets, budgets, delegation, heartbeats
- `darya-openhands` — software factory and product/design engineering
- `montage` — filmmaking, StudioProject, Director, timeline/editorial state
- `open-interpreter` — bounded local computer/browser/files/shell execution

SynthCut, FFmpeg and Whisper are Montage tools, not Hive providers that own project state.

## Source of truth

- Constitution: `HIVE-CONSTITUTION.md`
- Capability contract: `contracts/capability-manifest.schema.json`
- Event contract: `contracts/event-envelope.schema.json`
- Work order contract: `contracts/work-order.schema.json`
- Receipt contract: `contracts/evidence-receipt.schema.json`
- State ownership: `contracts/state-ownership.v0.json`
- Database migrations: `database/migrations/`
- Verification SQL: `database/verify_hive_foundation.sql`

## Database

Current development/hosted location: `botanic-creations` Supabase, isolated schemas:

- `agenix_hive`
- `agenix_hive_private`

The schema is designed for normal PostgreSQL/Supabase migration so it can later be exported to the self-hosted VPS without taking unrelated Botanic client schemas with it.

The Hive database owns **federation state only**: commands, correlation IDs, providers/capabilities, run/step metadata, leases, events, artifacts, evidence and approvals. Product-specific canonical state remains with the owning provider.

## MVP slices

1. Foundation — constitution/contracts/database/RLS/leases/events/evidence.
2. Capability registry — manifests and health for first five providers.
3. Agenix Command — text + push-to-talk, command persistence, routing.
4. Paperclip bridge — real work assignment and visible delegation.
5. Worker protocol — events, receipts, leases, idempotency.
6. OpenHands worker — bounded repo task -> branch/tests/PR/evidence.
7. Open Interpreter worker — outbound local worker with bounded machine permissions.
8. Montage Director — conversational Director in the existing Studio, no second StudioProject/UI.
9. ASC3ND Hive Test #001 — one real local Reel through the full chain.
10. Hardening — retries, stale leases, budgets, security, backup/export and VPS endurance.

## Completion rule

A job is not complete because an agent said it is complete. `completed` requires a valid evidence receipt and any required human approval.