# Client Chat Slice 03 — Conversation + ICM persistence

## Acceptance ledger

- [x] conversation IDs are durable and tenant-scoped;
- [x] browser chat persistence runs behind the existing Mission API instead of inside the web tier;
- [x] the existing signed `mission_token` is validated before chat history is read or written;
- [x] tenant ID and user ID are derived from the validated session, never browser-controlled request fields;
- [x] conversations are isolated by tenant and user;
- [x] messages are persisted in the existing tenant typed-event journal;
- [x] chat history can be reloaded without a fixed 2,000-event truncation;
- [x] event projection normalizes chronological ordering;
- [x] portable session export maps messages to event evidence references;
- [x] ICM context references derive from the active tenant (`icm/tenants/<tenant>`);
- [x] invalid roles, empty messages and orphan writes fail closed;
- [x] `/app` selects an existing persisted conversation or creates a real one; it does not write to a legacy phantom `today` ID;
- [x] browser UI shows truthful Saved / Saving / Offline state;
- [x] no new database, dependency, public-site change or destructive migration.

## Security repair

Fresh independent review correctly rejected the first implementation because same-origin Next.js handlers trusted `OPS_TENANT_ID`, did not validate the browser session, could construct the PostgreSQL repository without a pool, and allowed a phantom default conversation.

The repair removes the web-tier chat handlers entirely. The browser now calls the already-mounted Mission API at `/api/agent/client-chat/*` using the existing bearer session token. The Mission API validates the signature/expiry and derives `tenantId` plus `sub` from that session before touching chat state. Browser payloads cannot select tenant, user, assistant role, or system role.

## Ponytail minimum check

Reused the existing Mission API, `mission_token`, CORS boundary, typed event journal, tenant data volume, and ICM tenant namespace. No chat database, new service, operator key, or new runtime was introduced.

## Recovery proof

Authenticated `GET /api/agent/client-chat/conversations/:conversationId/export` emits the portable client-chat session shape with event-backed `content_ref` fields and tenant-derived ICM context references. This is a recovery representation, not a second organization truth store.

## Gauntlet question

If the web UI disappears, can an authenticated user reconstruct only that user's tenant-scoped conversation trail from existing event evidence and export it without changing canonical organizational facts?

PASS requires the focused persistence/auth tests, site build, repository CI, boundary guard, and fresh review with no unresolved blocking findings.

## Known boundary

This slice persists conversation history and establishes the authenticated client boundary. It does not yet turn a user message into a governed mission or produce assistant execution results; that belongs to Slice 04.

## Rollback

Revert Slice 03. Existing event records remain readable; no destructive migration or external action occurs.
