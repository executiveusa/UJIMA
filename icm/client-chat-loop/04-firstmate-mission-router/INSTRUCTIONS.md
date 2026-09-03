# Slice 04 — First Mate Mission Router — INSTRUCTIONS

## Outcome

A saved authenticated client message is routed into one bounded, durable mission handoff without exposing backend-agent complexity or performing external actions.

## Required behavior

1. Derive tenant and user identity only from the validated browser session.
2. Route at least `grants`, `content`, and `crm`; support existing contract domains without inventing a new truth store.
3. Reuse the existing chat-mission handoff contract and event journal.
4. The originating message must already belong to the authenticated user and conversation.
5. Mission creation must fail closed when required governance data is missing.
6. Ordinary preparation work remains internal/reversible.
7. Explicit consequential requests are marked as approval-required and stopped before execution.
8. Deny external email/message, public publishing, grant submission, payments, legal attestation, production deploy, DNS, production database migration, destructive deletion, cross-tenant access, and unrestricted execution in this slice.
9. Persist a truthful assistant acknowledgement tied to the mission route. Do not claim work was completed.
10. Keep the public ASC3ND frontend unchanged.

## Engineering minimization

- no new database;
- no new service;
- no new dependency;
- no LLM required for deterministic routing;
- no new worker runtime;
- reuse Mission API, browser auth, client chat store, schemas, and `@asc3nd/core/events`.

## Approval boundary

This slice may create internal mission records. It may not submit, publish, send, pay, deploy, migrate, delete, or accept legal terms. Those remain policy/human gates.