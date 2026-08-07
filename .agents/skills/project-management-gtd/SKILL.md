# Project Management + GTD Operating Skill

## Purpose

Turn ambiguous work into clear outcomes, bounded next actions, visible commitments, controlled scope, and reviewable evidence.

Use for human and agent project planning, daily execution, handoffs, backlog management, cost/schedule control, and scope-change decisions.

## Two-layer model

### Layer A — Project management

Every active project requires:

- objective/outcome;
- owner;
- scope baseline;
- acceptance criteria;
- stakeholders;
- budget/cost assumptions;
- schedule/milestones;
- risks/issues;
- dependencies;
- change-control rule;
- evidence of completion.

### Layer B — GTD execution

Every unresolved commitment must be converted into one of:

- `NEXT_ACTION`
- `WAITING_FOR`
- `CALENDAR`
- `PROJECT`
- `REFERENCE`
- `SOMEDAY_MAYBE`
- `TRASH`

No vague work item should survive as `work on X`.

## Capture -> Clarify -> Organize -> Review -> Engage

### Capture

Collect new requests, ideas, blockers, promises, defects, and opportunities without immediately changing scope.

### Clarify

For each item ask:

- What is it?
- Is action required?
- What does done mean?
- What is the very next visible action?
- Who owns it?
- Is there a deadline or dependency?
- Does it alter current scope, budget, or schedule?

### Organize

Place the item in the appropriate project/tenant and state. Do not let tenant work leak into shared/global queues.

### Review

At minimum, active projects need a recurring review that checks:

- outcomes still valid;
- next action exists;
- waiting items have owners/dates;
- blockers are explicit;
- costs/schedule are within baseline;
- scope changes are decided;
- stale projects are closed/deferred;
- proof is attached to completed work.

### Engage

Select work by:

1. contractual/mission priority;
2. dependencies/critical path;
3. risk and deadlines;
4. available context/resources;
5. value relative to effort.

Do not select work merely because it is interesting.

## Work-package rule

A Bead/task should be small enough that one agent or human can own the bounded outcome and verify it without hidden subprojects.

Good:

`Connect /api/projects to the project list and prove create/read persistence.`

Bad:

`Finish the backend.`

## Cost management

For material work, record:

- estimate basis;
- direct costs;
- likely indirect costs;
- uncertainty range;
- contingency where appropriate;
- actual cost when complete.

Early estimates are allowed to be ranges. Tighten them as uncertainty falls.

## Scope-creep protocol

A scope change exists when the requested work changes any baseline: deliverable, acceptance criteria, budget, schedule, risk, or required resources.

When detected, do not silently execute. Emit:

`CHANGE_REQUEST`

- request;
- reason;
- benefit;
- affected baseline(s);
- estimated impact;
- dependencies;
- options: reject / defer / swap / approve;
- decision owner;
- decision status.

If approved, update the baseline before executing.

## WIP limit

Default to no more than three active workstreams per tenant unless the human explicitly approves more. Blocked work does not justify opening unlimited new work.

## Human-agent handoff

Every handoff must include:

- current state;
- desired outcome;
- next action;
- owner;
- evidence links;
- blockers;
- approval needed;
- exact restart point.

## Completion law

A task is complete only when the artifact/result exists and the acceptance evidence is recorded. Status prose alone is not proof.