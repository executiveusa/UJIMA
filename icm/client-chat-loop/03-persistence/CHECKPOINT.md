# Client Chat Slice 03 — Conversation + ICM persistence

## Acceptance ledger

- [x] conversation IDs are durable and tenant-scoped;
- [x] messages are persisted through the existing repository storage abstraction;
- [x] memory / JSON / PostgreSQL backends remain supported by the existing `@asc3nd/db` event journal contract;
- [x] chat history can be reloaded;
- [x] portable session export maps messages to event evidence references;
- [x] ICM context references remain explicit and organization truth is not duplicated into chat state;
- [x] tenant isolation is tested;
- [x] invalid roles and empty messages fail closed;
- [x] browser UI shows truthful Saved / Saving / Offline state;
- [x] no new database, dependency, service or public-site change.

## Ponytail minimum check

Reused `@asc3nd/db.createRepositories()` and its existing typed event journal instead of creating chat-specific infrastructure or a second database. Added only a thin chat event projection plus same-origin route handlers.

## Recovery proof

`GET /api/client-chat/conversations/[conversationId]/export` emits the portable client-chat session shape with event-backed `content_ref` fields and ICM context references. This is a recovery representation, not a second organization truth store.

## Gauntlet question

If the UI/runtime disappears, can the conversation trail be reconstructed from tenant-scoped events and exported into a portable session without changing canonical organizational facts?

PASS requires unit tests, repository CI and route build success.

## Known boundary

The current site still resolves the tenant using the existing `OPS_TENANT_ID` mechanism. Mapping authenticated browser identity to tenant membership is an existing platform concern and is not silently invented in this slice.

## Rollback

Revert Slice 03. Existing event records remain readable; no destructive migration or external action occurs.
