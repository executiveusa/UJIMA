# Agenix Client Delivery & Approval Artifact

## Purpose

Every client engagement should end in — and during active work should be operable through — one simple client-facing artifact that turns the internal ICM, Beads, repositories, assets, approvals, and publishing state into an understandable operating surface.

This is the **Client Delivery & Approval Artifact**.

It is not an internal developer dashboard. It is the client's view of their engagement.

## Client promise

A nontechnical client should be able to open one URL and answer:

1. What are we doing?
2. What is happening this week?
3. What do you need from me?
4. What is already approved / scheduled / delivered?
5. Where can I see or download the finished work?

## Required sections

### 1. Today / next action

One dominant action with due date and owner.

Examples:
- `Approve this week's 3 Instagram posts`
- `Review Reel 01`
- `Confirm platform bio`

### 2. Strategy calendar

Interactive calendar/timeline covering the engagement period. Each item contains:

- date;
- platform;
- content type;
- content pillar/theme;
- title;
- caption status;
- asset/video status;
- approval status;
- publishing status;
- responsible owner;
- linked proof/preview;
- client comments.

### 3. Needs your approval

Client review queue with preview, concise change summary, and exactly two primary decisions:

- `Approve`
- `Request changes`

A comment box may accompany either action.

### 4. In production / scheduled

Clear list of work already approved and moving forward. No developer language.

### 5. Delivered

Verified deliverables with:

- final artifact;
- version;
- delivery date;
- proof/status;
- download/export link;
- ownership note when relevant.

### 6. Contract / engagement progress

Map paid deliverables to verified evidence. Bonus items must be visually separated from contracted items so additional work cannot mask unpaid-scope gaps.

## Internal-to-client projection

The artifact consumes internal state but does not expose internal implementation complexity.

```text
ICM stage contracts
      +
Beads work graph
      +
artifact registry / proof
      +
approvals
      +
publishing state
      ↓
Client Delivery & Approval Artifact
```

Internal labels such as branch SHA, Bead ID, repository, agent trace, or database function may be available under an operator-only provenance drawer, but they are not primary client UI.

## ASC3ND first implementation

The first live implementation is the ASC3ND interactive strategy calendar from the current campaign start through Community Cuts for Kids on August 30, 2026.

The primary calendar should make these patterns obvious:

- Monday: identity/strategy image
- Wednesday: interview/documentary Reel
- Friday: mission/community/event image
- Stories between Feed posts
- event-day Stories + Reel, without an unplanned Feed tile

Each Wednesday Reel links to its video-agent brief and progresses through:

`source selected` → `rough cut` → `subtitle QA` → `internal review` → `client review` → `approved` → `scheduled` → `published` → `verified`

## ASC3ND calendar first slice

- Aug 10 — Welcome to ASC3ND — image
- Aug 12 — Why We Started — Reel
- Aug 14 — Mission — image
- Aug 17 — Programs & Values — image
- Aug 19 — What a Mentor Can Do — Reel
- Aug 21 — Community Cuts announcement — image
- Aug 24 — Back-to-school confidence — image
- Aug 26 — Getting Ready for Community Cuts — Reel
- Aug 28 — Final event reminder — image
- Aug 30 — Community in Action — Stories + Reel using real event footage

## Design gate

The artifact must invoke `.agents/skills/client-delivery-polish/SKILL.md`.

Minimum standards:

- client understands current state in five seconds;
- next action is obvious;
- premium, restrained interface;
- mobile-first usable;
- keyboard accessible;
- reduced-motion respected;
- empty/error/loading states designed;
- no developer jargon in primary UI;
- approvals are reversible before publication;
- final outputs are exportable and client-owned.

## Observability gate

Every meaningful internal movement that affects a client delivery must map to Beads. The artifact reads a safe projection of those states; it must not become a second independent task ledger.

The system of record remains:

- ICM for context/stage contracts;
- Beads for work/dependency/movement history;
- proof registry for evidence;
- approval records for client decisions.

## Completion law

The artifact itself is not `delivered` merely because it renders. It requires:

1. client-visible data is accurate;
2. all actions are permission-gated;
3. approval actions persist;
4. responsive/mobile QA passes;
5. accessibility QA passes;
6. no private/internal-only data leaks;
7. export/download paths work;
8. independent review score is at least 8.5/10.