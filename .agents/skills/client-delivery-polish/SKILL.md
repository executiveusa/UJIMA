---
name: client-delivery-polish
description: Studio-wide standard for client-facing interactive artifacts, handoffs, calendars, approval surfaces, and dashboards. Combines restrained Apple-style interface principles, strong design-engineering craft, and action-first ADHD-friendly information architecture.
---

# Client Delivery Polish

Use this skill whenever output will be seen or operated by a client.

## Outcome

Client-facing artifacts must feel calm, obvious, premium, and operational. The client should immediately understand:

1. what is happening;
2. what is finished;
3. what needs their approval;
4. what happens next;
5. where the final deliverables live.

The interface must hide internal agent/repository complexity unless the client explicitly asks to see it.

## Design laws

- Restraint over decoration. Use whitespace, typography, hierarchy, and motion before adding visual chrome.
- Immediate response. Buttons, tabs, cards, and controls acknowledge input instantly.
- Spatial consistency. Related actions originate and resolve in predictable locations.
- Motion communicates state; it never exists merely to impress.
- Prefer spring/interruptible motion for interactive transitions. Avoid excessive bounce.
- Typography is treated as interface structure: deliberate scale, leading, tracking, and line length.
- Progressive disclosure: show the client the decision they need now; keep implementation detail one layer deeper.
- Never sacrifice clarity for novelty.
- Respect reduced-motion and keyboard navigation.
- Mobile is a first-class operating surface, not a compressed desktop afterthought.

## ADHD-friendly delivery laws

Client handoffs must be action-shaped:

- Put the next required action at the top.
- Number multi-step actions.
- Keep primary action groups to five or fewer items.
- Restate current state visibly instead of requiring memory across visits.
- Use concrete dates, owners, and statuses instead of vague language.
- Make completed work visibly complete.
- Separate `Needs your approval`, `Scheduled / in progress`, and `Delivered`.
- No long preambles before the client can act.

## Required client artifact shell

Every substantial client-facing interactive artifact should use this shell unless the task clearly requires another structure:

### 1. Header
- organization / project identity
- artifact title
- current date or coverage window
- simple status indicator

### 2. Next action
One clearly dominant client action, such as `Review this week`, `Approve 3 posts`, or `Download final handoff`.

### 3. Progress
Show contract or engagement progress using verified states only. Do not infer completion from code commits.

### 4. Main work surface
Examples:
- interactive calendar;
- content plan;
- campaign timeline;
- website review;
- brand decisions;
- video review queue;
- handoff checklist.

### 5. Approval center
Every approval item must show:
- artifact/title;
- what changed;
- why the client is being asked;
- preview or linked proof;
- `Approve`;
- `Request changes`;
- optional comment;
- approval timestamp / approver after action.

### 6. Delivery / proof center
Show only verified outputs with direct links, version, date, and owner.

## Interactive calendar standard

A client strategy/calendar artifact must support at minimum:

- timeline/calendar view;
- platform filter;
- content-type filter;
- image vs Reel/video distinction;
- exact post date;
- caption status;
- asset status;
- video source or video-agent brief when applicable;
- approval state;
- publishing state;
- event milestones;
- clear today marker;
- mobile card view;
- client comments / requested changes.

For ASC3ND, the calendar must make the Monday image → Wednesday Reel → Friday image rhythm visually obvious and show event-day Stories/Reels separately from Feed tiles.

## Delivery states

Use the same state vocabulary everywhere:

`draft` → `internal_review` → `client_review` → `changes_requested` → `approved` → `scheduled` → `published` → `verified` → `delivered`

Never use `done` for client-visible work unless proof exists.

## Visual QA gate

Before calling a client artifact ready, independently review:

1. comprehension in five seconds;
2. obvious next action;
3. visual hierarchy;
4. mobile behavior;
5. accessibility / reduced motion;
6. error and empty states;
7. approval flow;
8. proof links;
9. ownership / exportability;
10. overall polish.

Target score: 8.5/10 or higher before client delivery.

## Sources / upstream inspiration

- Emil Kowalski design-engineering and Apple-design skill collection: https://github.com/emilkowalski/skills
- `i-have-adhd` output-shaping skill by ayghri: https://github.com/ayghri/i-have-adhd

This is a Studio-owned synthesis. Do not copy vendor branding into client artifacts.