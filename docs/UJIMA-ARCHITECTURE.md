# UJIMA Architecture

## Product thesis

UJIMA is a customer-owned agentic operating system installed for mission-driven organizations. It carries digital and administrative work while preserving human judgment, organizational truth, evidence and recoverability.

## Essential path

```text
Human
  ↓
Goal Engine
  ↓
ICM
  ↓
Workflow Compiler
  ↓
Trigger / Scheduler
  ↓
Capability Router
  ├── UJIMA Grants
  ├── nonprofit operations
  ├── research / translation / communications
  ├── engineering fleet supervisor
  └── computer operator
  ↓
Authority Check
  ↓
Execution
  ↓
Verification + Evidence
  ↓
Result
  ↓
ICM learns
```

## Goal

Every entry surface creates the same durable goal object.

```yaml
goal:
  id:
  tenant:
  created_by:
  statement:
  desired_outcome:
  success_criteria:
  constraints:
  deadline:
  recurrence:
  budget:
  locale:
  risk_level:
  approval_policy:
  workflow:
  status:
  evidence:
  rollback:
```

UI, voice, slash commands and API calls may differ in presentation but must converge on this contract.

## ICM

ICM is canonical for organization-specific context, evidence, policy and durable memory.

A cold agent should be able to understand product identity, authority, task home, minimum context and proof expectations from:

`AGENTS.md → CONTEXT.md → relevant tenant/workflow shelf`

## Workflows

A skill is a method. A workflow composes methods. A trigger starts a workflow.

Supported triggers:

- manual
- goal
- cron
- event
- webhook
- condition/watch

The scheduler does not own business truth. It only activates a workflow.

## Capabilities

Capabilities are replaceable bounded executors.

Priority order for mechanical work:

1. native API
2. MCP
3. CLI
4. structured browser automation
5. Open Interpreter
6. visual GUI automation such as Agent-S

The last two exist for gaps in structured interfaces and receive explicit scope, time, authority and evidence contracts.

## Engineering fleet

Firstmate is a strong candidate for the engineering supervision adapter because it provides one liaison, isolated worktrees, persistent supervision, remote/Orca backends and event-driven wakeups.

UJIMA must depend on an abstract engineering-fleet contract, not Firstmate-specific state.

Engineering governance remains:

`Vibe/Loop Engineering → ICM → Goal → Workflow → fleet supervisor → worker → verification → gauntlet → release`

## Grants

`executiveusa/grant-agent` is the first official specialist vertical.

UJIMA owns organization truth, goals, approval policy, evidence and cross-domain workflow. Grant Agent owns grant-domain implementation.

Human-facing flow:

`understand → discover → qualify → prepare → review → submit → track → report → learn`

Final external submission remains approval-gated.

## Authority and safety

Default-deny for consequential action.

Approval is required for money, publication, consequential outbound communication, youth/sensitive data, legal/compliance claims, credential changes, destructive operations, DNS and irreversible migrations.

## Evidence

Completion uses the strongest available oracle and records exact revision/runtime evidence. Deployment existence alone is never proof.

## Sovereignty

The customer should own or control:

- repository/source
- database/data export
- deployment
- credentials
- domain/DNS when used
- model/provider configuration
- recovery/rollback path

The commercial model is an owned installation with reusable software underneath, not forced subscription dependency.

## Internationalization

Canonical product locales begin with:

- `en`
- `es-MX`

Translation preserves facts, exact quotes and legal meaning. Consequential fundraising/legal/culturally sensitive copy receives human review.

## Failure behavior

- Missing authority → stop and request approval.
- Missing canonical fact → mark unknown; do not infer.
- Operator failure → preserve logs/evidence and return control.
- Failed deployment verification → stop or roll back.
- Conflicting truth owners → fail closed and route.
