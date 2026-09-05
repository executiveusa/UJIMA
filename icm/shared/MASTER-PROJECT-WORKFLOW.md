# ICM Master Project Workflow

## Purpose

This is the reusable human+agent project operating workflow for Agenix tenants. It keeps each project individualized while enforcing proven execution, scope, review, and evidence discipline.

## Stage 00 — Intake / capture

Capture the request without prematurely solving it.

Required:
- client/project identity;
- requested outcome;
- source materials;
- deadlines;
- known budget/scope;
- stakeholders;
- approvals/permissions;
- risks/sensitivities.

Output: `INTAKE.md` + unresolved questions.

## Stage 01 — Project truth / tenant profile

Create a project-specific truth set:
- mission/business context;
- audience;
- protected facts;
- brand assets/rules;
- contractual scope;
- known constraints;
- success evidence;
- tenant-specific voice/cultural context.

No shared skill may overwrite tenant truth.

## Stage 02 — Knowledge ingestion

Ingest only relevant source material. Convert large books/docs into compact reference skills using a `book-to-skill` style structure when appropriate:

- `SKILL.md` — high-level decision rules;
- `references/` — source-specific notes/indexes;
- `patterns.md` — reusable techniques;
- `cheatsheet.md` — decision tables.

For copyrighted third-party books, keep generated detailed notes private/internal unless redistribution rights are clear. Public repos should contain original high-level operating rules rather than chapter substitutes.

## Stage 03 — Strategy / scope baseline

Define:
- outcome statement;
- deliverables;
- explicit exclusions;
- acceptance criteria;
- estimate/range;
- milestones;
- risks;
- critical path;
- change-control owner.

Run `.agents/skills/digital-cofounder/SKILL.md` and `.agents/skills/project-management-gtd/SKILL.md`.

## Stage 04 — Creative / technical plan

Select only the skills needed for this project. Possible references:
- nonprofit/social-purpose tenant — governing skill: `.agents/skills/nonprofit-operating-system/SKILL.md`
- nonprofit program/fundraising/stakeholder strategy support: `.agents/skills/nonprofit-strategy/SKILL.md`
- nonprofit execution lanes as needed: `nonprofit-website`, `nonprofit-social`, `nonprofit-video`, `nonprofit-google-discovery`, `nonprofit-crm`, `nonprofit-email-followup`, `nonprofit-reporting`
- brand/marketing/story: `.agents/skills/brand-marketing-story/SKILL.md`
- UX/design review: `.agents/skills/krug-design-review/SKILL.md`
- local video: `.agents/skills/synthcut-local-video/SKILL.md`

Produce a project-specific plan. Never blindly apply every skill.

## Stage 05 — Production

Execute bounded Beads/work packages.

Rules:
- one owner per bounded outcome;
- default WIP <= 3 active workstreams per tenant;
- deterministic tools for deterministic work;
- checkpoint before destructive/ripple-prone changes;
- evidence captured as work happens;
- no hidden scope expansion.

## Stage 06 — Review

Run the appropriate review gates.

For digital/visual outputs, mandatory checks include:
- purpose clarity;
- scanability/hierarchy;
- action clarity;
- copy clarity;
- mobile/context fit;
- accessibility;
- factual/brand integrity;
- client-specific acceptance criteria.

Use `.agents/skills/krug-design-review/SKILL.md` for interfaces, flyers, posters, forms, decks, and other user-facing artifacts.

## Stage 07 — Human approval

Present:
- what changed;
- evidence;
- unresolved risk;
- cost/schedule variance;
- exact approval requested.

Silence is not approval.

## Stage 08 — Publish / deliver

Perform only explicitly approved irreversible/outbound actions.

Verify the live artifact after publication/delivery.

## Stage 09 — Close / learn / reuse

Record:
- final proof;
- actual cost/time;
- client decision;
- what worked;
- what failed;
- reusable capability created;
- backlog items not included;
- next action/maintenance owner.

Promote only generalized patterns into shared skills. Tenant facts remain tenant-scoped.

# Scope creep guardrail

At every stage, compare new requests to the approved baseline.

If deliverable, acceptance criteria, budget, schedule, resources, or risk changes, emit `SCOPE_CREEP_FLAG` and create a formal change request before execution.

# Project individuality law

Process is mandatory; solution is not predetermined.

Agents must adapt to:
- the specific audience;
- mission/market;
- maturity;
- geography/culture;
- budget;
- evidence;
- technology;
- stakeholder dynamics;
- risk.

A repeated template without project-specific reasoning is a quality failure.

# Golden completion test

A project is complete only when the intended human can understand/use the result, acceptance evidence exists, scope is reconciled, and the next operating state is clear.