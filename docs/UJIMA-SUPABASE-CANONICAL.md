# UJIMA Supabase Canonical Architecture

## Decision

UJIMA receives its own Supabase project. The existing `botanic-creations` project remains the canonical ASC3ND client database until a separately approved migration changes that.

ASC3ND is Client 01. UJIMA is the reusable operating system.

## Why this split

The current `botanic-creations` project has grown into a multi-project host with dozens of schemas and more than one hundred public tables. It contains valuable patterns, but UJIMA should not inherit that shared-database blast radius.

The dedicated UJIMA database therefore starts from a clean contract:

- current text tenant IDs, matching the runtime;
- RLS enabled and forced on every application table;
- no direct `anon` or `authenticated` table access by default;
- server/API-controlled mutation;
- service-role access only for trusted server-side execution;
- source mirrors explicitly marked non-authoritative;
- idempotent sync receipts;
- no secrets in cross-system configuration;
- ASC3ND remains canonical for people, consent, participation, routes, follow-up and relationship memory.

## Dual-write rule

Do not make the browser write independently to two databases.

Use:

```text
ASC3ND website
  -> ASC3ND canonical transaction
  -> ASC3ND private UJIMA sync outbox
  -> sync worker / adapter
  -> UJIMA sync receipt
  -> safe UJIMA projection
```

If UJIMA is unavailable, the ASC3ND transaction remains valid and the outbox retries later.

## Data ownership

| Domain | Canonical owner | UJIMA treatment |
|---|---|---|
| ASC3ND person identity | ASC3ND Supabase | mirror/reference only |
| Consent | ASC3ND Supabase | summarized projection only |
| Participation intake | ASC3ND Supabase | operational projection |
| Routes/follow-up | ASC3ND Supabase | workflow projection |
| Relationship memory | ASC3ND Supabase / ICM | references + approved projection |
| UJIMA missions | UJIMA | canonical |
| UJIMA approvals | UJIMA | canonical |
| UJIMA agents | UJIMA | canonical |
| UJIMA artifacts/evidence | UJIMA | canonical |
| UJIMA audit/events | UJIMA | canonical |
| Grants | Grant Agent | federated through UJIMA |

## Legacy migration note

The historical UJIMA v0.4 migration used UUID tenant IDs. Current repository code and later migrations use text tenant IDs. The dedicated Supabase bootstrap resolves the conflict in favor of the current runtime contract.

Historical migrations remain historical evidence and must not be replayed blindly into the new project.
