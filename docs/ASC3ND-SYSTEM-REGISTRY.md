# ASC3ND System Registry

Status date: 2026-07-29

Owner and final production approver: Jeremy Michael Bowers

## Purpose

This file is the canonical map for ASC3ND repositories, deployments, responsibilities, and release controls. When another document conflicts with this registry, stop and resolve the conflict before changing production.

## Canonical systems

| Layer | Canonical GitHub repository | Canonical Vercel project | Current role |
|---|---|---|---|
| Public website and event pages | `executiveusa/asc3nd-frontend-website-` | `asc3nd-frontend` | Public ASC3ND website and Community Cuts event experience |
| Interactive workbook and RSVP backend | `executiveusa/asce3nd-interactive-document` | `asc3nd-interactive-document` | Workbook, RSVP APIs, RSVP schema, confirmation/cancellation flows, redacted RSVP adapter |
| Agent and Mission OS infrastructure | `executiveusa/ascend-social-purpose-agentic-systems-` | `ascend-social-purpose-agentic-systems-site` | Reusable internal agent infrastructure and future bounded runtime |
| Brand system | `executiveusa/asc3nd-brand-kit-` | None | Approved logos, colors, typography, flyer templates, and usage rules |

## Known naming mismatch

The workbook GitHub repository is named `asce3nd-interactive-document`, while its canonical Vercel project is `asc3nd-interactive-document`.

Do not create another workbook repository to fix the spelling during active delivery. Treat the existing GitHub repository as canonical until a controlled rename is approved and all Git remotes, Vercel links, documentation, and automation references are updated together.

## Current Vercel cleanup state

The latest checked Vercel inventory contains these relevant ASC3ND projects:

- `asc3nd-frontend`
- `asc3nd-frontend-website`
- `asc3nd-interactive-document`
- `ascend-social-purpose-agentic-systems-site`

The prior duplicate projects `asc3nd-community-cuts`, `asce3nd-interactive-document`, `ascend-social-purpose-agentic-systems-`, and `ascend-social-purpose-agentic-systems--main` are no longer present in the latest project list.

`asc3nd-frontend-website` remains a likely duplicate Vercel project. Do not delete it until its domains, environment variables, Git connection, and latest deployment are compared against `asc3nd-frontend`.

## Repository boundaries

### `asc3nd-frontend-website-`

Allowed:

- public website pages;
- event landing pages;
- English and Spanish public routes;
- public RSVP form presentation;
- public campaign assets used by the website.

Not allowed:

- a second RSVP database;
- internal contact-management UI;
- privileged Supabase credentials;
- Mission OS or general agent-runtime code.

### `asce3nd-interactive-document`

Allowed:

- interactive workbook;
- RSVP API and database contract;
- RSVP verification and cancellation;
- redacted RSVP summaries;
- internal RSVP organizer interface;
- controlled internal operational views.

Not allowed:

- public-site redesigns unrelated to the workbook;
- unrestricted autonomous agent execution;
- duplicate RSVP storage.

### `ascend-social-purpose-agentic-systems-`

Allowed:

- reusable agent gateway;
- scoped tool contracts;
- provider abstraction;
- policy and approval infrastructure;
- observability;
- future bounded ThePopeBot integration.

Not allowed in the RSVP Organizer v0.1:

- new CRM schema;
- second RSVP store;
- public event-page code;
- unrestricted writes or outbound messaging.

### `asc3nd-brand-kit-`

Required contents before it becomes authoritative:

- approved SVG and raster logos;
- color tokens;
- typography rules;
- accessibility contrast rules;
- flyer and social templates;
- photography direction;
- English and Spanish lockups;
- versioned usage guidance.

The repository is currently empty and therefore cannot yet be treated as a complete brand source of truth.

## RSVP source of truth

The existing RSVP implementation in the workbook repository remains authoritative:

- `api/rsvp.js`
- `api/rsvp-verify.js`
- `api/rsvp-cancel.js`
- `api/_lib/mailer.js`
- `api/_lib/rsvp-summary-adapter.js`
- `sql/rsvp.sql`

Supabase is the only RSVP database.

Existing lifecycle values:

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

## Release protocol

All changes follow:

```text
issue or written task
→ feature branch
→ local or CI verification
→ preview deployment
→ manual browser review
→ pull request
→ exact commit approval by Jeremy
→ merge to main
→ production deployment
→ production verification
→ registry update with production SHA
```

No model or operator may merge or deploy an unapproved commit to production.

## Required verification for every release

- repository and root directory match this registry;
- build succeeds;
- lint and tests succeed where configured;
- no secrets are committed;
- responsive review at 375, 768, and 1280 pixels;
- English and Spanish parity where applicable;
- no horizontal overflow;
- keyboard navigation and visible focus states;
- minimum 44-pixel interactive targets;
- production environment variables are present;
- production URL and key flows are manually checked;
- rollback SHA is recorded.

## Current stabilization priorities

1. Compare `asc3nd-frontend` and `asc3nd-frontend-website` before deleting either Vercel project.
2. Record exact Git-to-Vercel linkage and root directories for all canonical projects.
3. Review open dependency PRs for the frontend and Mission OS repositories.
4. Review or close the unrelated workbook pricing PR.
5. Inspect exact RSVP form fields, SQL schema, and redacted adapter output.
6. Build the read-only RSVP Organizer in the workbook repository on a non-production branch.
7. Populate the brand-kit repository with approved assets and versioned tokens.

## Deferred work

- ThePopeBot integration;
- autonomous campaign generation;
- outbound email, SMS, or Telegram actions;
- production RSVP mutations from the organizer;
- broad Control Tower screens;
- volunteer, donor, sponsor, mentor, or partner classifications unless verified in the existing form and schema.
