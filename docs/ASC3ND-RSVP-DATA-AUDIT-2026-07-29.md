# ASC3ND RSVP Data Audit

Audit date: 2026-07-29

Repositories reviewed:

- `executiveusa/asce3nd-interactive-document`
- `executiveusa/ascend-social-purpose-agentic-systems-`

## Verified intake fields

The current RSVP API accepts only:

- `guardian_name`
- `email`
- `phone`
- `children_count`
- `age_range`
- `requested_service`
- `arrival_window`
- `preferred_language`
- `accessibility_contact`
- `contact_privately`
- `company_website` as a honeypot that is never written

The API rejects unrecognized fields.

Verified allowed values:

```text
age_range: 0-4 | 5-8 | 9-12 | 13-17
requested_service: haircut | lineup | fade | trim | unsure
arrival_window: 12-1 | 1-2 | 2-3 | unsure
preferred_language: en | es
```

## Verified database fields

The current `rsvp_registrations` table contains:

- registration ID and event ID;
- guardian name;
- email and phone fields;
- children count;
- age range;
- requested service;
- arrival window;
- preferred language;
- accessibility-contact flag;
- private-contact flag;
- source;
- lifecycle status;
- confirmation and cancellation tokens;
- verification, check-in, and haircut-completion timestamps;
- optimistic-concurrency version;
- created and updated timestamps;
- audit JSON.

## Verified redacted adapter output

The workbook-facing adapter currently exposes:

- first name;
- children count;
- age range;
- requested service;
- arrival window;
- preferred language;
- accessibility-contact flag;
- status;
- checked-in timestamp;
- haircut-completed timestamp;
- created timestamp.

The summary RPC adapter exposes:

- total;
- confirmed;
- waitlisted;
- cancelled;
- checked in;
- haircuts completed;
- last updated.

## Fields not available to the first organizer

The current verified intake and adapter do not provide:

- volunteer role;
- mentor interest;
- supply donor interest;
- sponsor interest;
- community or business partner interest;
- lead assignment;
- internal follow-up note;
- campaign attribution details beyond the database default `source` field;
- arbitrary tags.

Do not display these categories as real data in v0.1.

## Important mismatch

The SQL table includes `source` and `updated_at`, but the current redacted row adapter does not return them.

The organizer therefore cannot accurately provide per-record attribution or last-modified freshness until the redacted adapter is deliberately extended and reviewed.

Recommended safe adapter additions:

```text
source
updated_at
```

These additions contain no direct contact information, but they still require review because source values may reveal campaign or operational context.

## Security stabilization findings

### 1. Hard-coded fallback Supabase anon token

Both `api/rsvp.js` and `api/_lib/rsvp-summary-adapter.js` contain a fallback Supabase RPC URL and anon token in source code.

Although an anon key is not equivalent to a service-role secret and the database relies on RLS plus constrained SECURITY DEFINER RPCs, the production application should require environment variables rather than silently falling back to embedded credentials.

Recommended remediation:

- remove hard-coded fallback credentials;
- fail closed when `SUPABASE_RPC` or `SUPABASE_ANON` is missing;
- rotate the current anon token after the environment migration if operationally practical;
- verify RPC grants and RLS before rotation;
- never add a service-role token to client or repository code.

### 2. CORS default does not include the active event frontend

`api/rsvp.js` defaults to allowing only:

```text
https://asc3nd-interactive-document.vercel.app
```

The public event application is deployed separately under the `asc3nd-frontend` Vercel project. Production must set `RSVP_PUBLIC_ORIGIN` to the exact approved public origin or origins.

Recommended verification:

- identify the canonical public event URL;
- confirm its browser POST requests currently succeed;
- set an explicit comma-separated `RSVP_PUBLIC_ORIGIN` environment variable;
- keep default-deny behavior.

### 3. In-memory rate limiting is instance-local

The API uses an in-memory rate-limit map. On serverless infrastructure, this is not a global or durable rate limit.

For the event prototype this may be an acceptable temporary control, but it should not be represented as comprehensive abuse protection.

Recommended later improvement:

- use a durable rate-limit store or platform firewall control;
- retain the honeypot and strict field whitelist;
- add monitoring for repeated failures.

## Organizer implementation contract

The first interface must be read-only and use one of two explicit modes:

```text
FIXTURE MODE
LIVE READ-ONLY MODE
```

Every page must visibly show the current mode and data freshness.

The first version may derive follow-up recommendations only from documented status and record age. It may not write status changes, send messages, or reveal contact details.

## Required next checks

1. Inspect the exact event-page form implementation and submission URL.
2. Verify the canonical public event origin in Vercel.
3. Verify `RSVP_PUBLIC_ORIGIN`, `RSVP_PUBLIC_BASE_URL`, `SUPABASE_RPC`, and `SUPABASE_ANON` are configured in the correct Vercel project.
4. Verify the SQL migration deployed to Supabase matches the repository file.
5. Add tests for field validation, CORS, redaction, and RPC failure behavior.
6. Extend the adapter with `source` and `updated_at` only after explicit review.
