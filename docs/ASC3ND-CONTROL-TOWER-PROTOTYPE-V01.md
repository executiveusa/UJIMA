# ASC3ND RSVP Organizer Prototype v0.1

## Decision

The first ASC3ND operational prototype is a read-only RSVP Organizer built around the existing Community Cuts registration system.

It is not a general Control Tower, campaign generator, autonomous agent, CRM replacement, or ThePopeBot integration.

## Objective

Turn existing RSVP submissions into a clear operational view so ASC3ND can understand:

- how many responses exist;
- estimated children and attendance demand;
- which records need review or follow-up;
- preferred language and arrival window;
- service demand;
- accessibility-contact flags;
- current RSVP lifecycle status;
- the freshness and source of the displayed data.

## Existing source of truth

Use the current RSVP implementation in `executiveusa/asce3nd-interactive-document`:

- `api/rsvp.js`
- `api/rsvp-verify.js`
- `api/rsvp-cancel.js`
- `api/_lib/rsvp-summary-adapter.js`
- `sql/rsvp.sql`

Supabase remains the only RSVP database. Do not create a second RSVP datastore.

## Verified read-only data contract

The documented redacted adapter exposes only:

- first name;
- children count;
- age range;
- requested service;
- arrival window;
- preferred language;
- accessibility-contact flag;
- RSVP status;
- created and updated timestamps.

Do not invent volunteer, mentor, donor, sponsor, partner, attribution, assignment, notes, or campaign fields until they are verified in the existing form and database schema.

## Prototype location

Build the interface in the workbook repository:

```text
Repository: executiveusa/asce3nd-interactive-document
Suggested route: /rsvp-organizer
```

The public event page remains in:

```text
executiveusa/asc3nd-frontend-website-
```

The reusable agent infrastructure remains in:

```text
executiveusa/ascend-social-purpose-agentic-systems-
```

No live repository or production deployment may be changed until the exact commit is reviewed and approved by Jeremy.

## Screens

### 1. Overview

Show:

- total responses;
- confirmed responses;
- estimated children;
- needs-review count;
- follow-up-required count;
- cancellations;
- service-demand breakdown;
- language breakdown;
- arrival-window breakdown;
- last refresh time.

### 2. People

A redacted list with filters for:

- RSVP status;
- language;
- requested service;
- arrival window;
- accessibility-contact flag;
- age of record.

Do not expose surnames, email addresses, telephone numbers, child names, health information, or private notes in the general list.

### 3. Follow-up queue

Derive a deterministic queue from existing statuses and timestamps.

Initial queue rules:

- `NEEDS_REVIEW` appears first;
- `FOLLOWUP_REQUIRED` appears next;
- stale `NEW` records appear after a documented threshold;
- cancelled and archived records do not appear;
- every item explains why it is in the queue.

The first release is read-only. It cannot send messages or alter RSVP records.

### 4. Person detail

Show only the redacted fields supplied by the adapter plus:

- plain-language status explanation;
- record age;
- deterministic recommended next step;
- data-source and freshness note.

## Status model

Use the existing RSVP lifecycle values:

```text
NEW
NEEDS_REVIEW
ATTENDANCE_CONFIRMED
WAITLISTED
CANCELLED
CHECKED_IN
HAIRCUT_COMPLETED
ATTENDED_NO_HAIRCUT
NO_SHOW
FOLLOWUP_REQUIRED
```

Do not replace these with a second pipeline in v0.1.

## Data modes

### Fixture mode

Use deterministic fixture records shaped exactly like the redacted adapter response. Fixtures must be clearly labeled and must not contain real personal information.

### Read-only production mode

Connect server-side to the existing redacted adapter. Never expose privileged Supabase credentials to the browser.

## Privacy and safety

- No youth PII enters model context.
- No client-side privileged database key.
- No readable check-in or RSVP list is exposed to a camera operator.
- No contact-list export.
- No automated outreach.
- No generated impact claims.
- No production mutation in v0.1.

## Assistant scope

An LLM is excluded from the first implementation.

The interface may include deterministic explanations and recommended next steps generated from explicit rules. A bounded assistant may be considered only after the visual organizer is verified and trusted.

ThePopeBot work remains deferred under GitHub issue #19.

## Acceptance criteria

- uses the existing RSVP schema and redacted adapter contract;
- creates no second database;
- contains Overview, People, Follow-up Queue, and Person Detail views;
- works at 375, 768, and 1280 pixel widths;
- clearly distinguishes fixture data from live read-only data;
- contains no write, send, publish, scheduling, or export capability;
- exposes no prohibited PII in the general interface;
- provides source and freshness information;
- modifies neither the live event landing page nor production workbook without explicit commit approval;
- passes lint, build, accessibility smoke checks, and a manual browser review before a PR is approved.

## Build order

1. Inspect the exact public event form fields.
2. Inspect the exact RSVP SQL schema and adapter output.
3. Document verified fields and any mismatches.
4. Scaffold `/rsvp-organizer` behind a non-production branch.
5. Implement fixture data using the verified adapter shape.
6. Build Overview, People, Follow-up Queue, and Person Detail.
7. Add responsive and accessibility checks.
8. Connect the read-only adapter behind a server-side feature flag.
9. Create a preview deployment.
10. Present the exact preview commit for Jeremy’s approval before any production merge.
