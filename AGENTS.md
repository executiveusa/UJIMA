# AGENTS.md — UJIMA OS

Mandatory first read for every human or agent modifying `executiveusa/UJIMA`.

## Identity

**UJIMA is the product. ASC3ND is Client 01.**

Do not promote tenant-specific facts, credentials, data, domains, copy, workflows, or assumptions into shared product defaults.

The human-facing rule is:

**WE HANDLE IT → THEY APPROVE IMPORTANT DECISIONS → THEY SEE RESULTS.**

## Boot law

Before substantial edits, migrations, publishing, deployment, or external side effects:

1. Read `REPO_SCOPE.md`, `repo-boundary.json`, `CONTEXT.md`, and `ICMR.yaml`.
2. Read only the control-plane and ICM context needed for the task.
3. Determine one owner repository and one writer for each output.
4. Run `npm run guard:repo` before build/deploy work.
5. Reuse existing code and contracts before adding another framework.
6. For multi-step work, use the existing durable work graph/ICM conventions rather than hidden coordination.
7. Record facts separately from assumptions and attach evidence for completion claims.
8. Stop at explicit approval gates. Silence is not approval.

## Product architecture

```text
Human
  ↓
Goal
  ↓
ICM
  ↓
Workflow
  ↓
Capability Router
  ├─ UJIMA Grants
  ├─ nonprofit operations
  ├─ research / communications / translation
  ├─ engineering fleet supervisor
  └─ bounded computer operator
  ↓
Approval + Evidence
  ↓
Result
  ↓
Learn
```

### Ownership

- **ICM** owns organizational context, policy, evidence and durable memory.
- **Goal** owns desired outcome and success criteria.
- **Workflow** owns execution sequence and trigger.
- **Capability adapters** perform bounded work; they do not become canonical truth owners.
- **Computer/browser agents** are operators, never the brain.
- **Clients** remain isolated tenants.
- **Grant-specific implementation** remains owned by `executiveusa/grant-agent` and federates through typed contracts.

## Goal law

All goal entry points must converge on the same durable goal contract. UI, voice, slash-command and API variants must not create separate truth.

A goal includes: statement, desired outcome, success criteria, constraints, deadline/recurrence, budget when relevant, locale, risk level, approval policy, workflow, status, evidence and rollback.

## Workflow law

A skill explains **how** to do something.  
A workflow composes skills.  
A trigger starts a workflow.

Supported trigger classes are:

- manual
- goal
- cron
- event
- webhook
- condition/watch

Cron is not the workflow engine.

## Authority law

Default deny for consequential operations.

Human approval is required for money, public publishing, outbound consequential communication, youth/sensitive data, legal/compliance claims, credential changes, destructive actions, production DNS, irreversible migrations, or final external submission.

Research, drafting, internal analysis, reversible preparation and deterministic verification may proceed autonomously within documented authority.

## Evidence law

**NO PROOF. NO CLAIM.**

Use the strongest available oracle:

1. exact production/runtime behavior;
2. browser/device proof;
3. integration/E2E test;
4. focused automated test;
5. build/type/lint/static checks;
6. repository inspection;
7. human report;
8. model assertion — never sufficient by itself.

## Repository boundary

This repository owns reusable UJIMA product infrastructure, not the canonical ASC3ND public site or private client assets.

Tenant-specific ASC3ND truth belongs under its tenant/client sources and connected owner repositories.

If ownership is ambiguous, fail closed with:

```text
REPOSITORY_BOUNDARY_STOP
Requested work: <summary>
Current repository: executiveusa/UJIMA
Reason: <reason>
Correct destination: <repository or tenant shelf>
Required handoff: <typed artifact>
```

## ICM law

ICM is the interpretable orchestration/context layer. A link beats a copy.

Numbered execution stages use:

- `INPUT.md`
- `INSTRUCTIONS.md`
- `OUTPUTS.md`
- `STATUS.json`

One stage reads only its own permitted inputs plus explicitly linked prior outputs. Scripts do deterministic work. Agents do judgment. Consequential actions stay gated.

## Engineering law

For substantial builds follow the Vibe / Loop Engineering lifecycle:

`INTAKE → DISCOVERY → ARCHITECTURE → GRAPH → SPEC → SLICE → BUILD → VERIFY → GAUNTLET → RELEASE → LEARN`

Rules:

- baseline before implementation;
- target architecture before code;
- acceptance gates before build;
- one bounded reversible slice;
- builder does not self-approve;
- failing gates are repaired, not lowered;
- exact revision + rollback before release;
- production verified only after live runtime proof.

Always apply the minimum ladder:

`need? → already exists? → platform/stdlib? → installed dependency? → smallest new code`

Do not add a framework because it is interesting.

## Operator experience

Lead with the current decision or next action. Keep work resumable. Do not expose Git, branch SHAs, agent names, database internals or framework jargon to normal client users unless they ask.

For interface work, use the project’s design/interaction quality skills and preserve accessibility, mobile behavior, clarity and recovery.

For browser video automation, read `.agents/skills/browser-video-editor/SKILL.md` and refresh official docs before operating external editors.

## Safety and dignity

- Never fabricate facts, impact, quotes, eligibility, approvals or completion.
- Never infer sensitive traits from weak signals.
- Never use trauma, poverty, youth vulnerability or family hardship as spectacle.
- Collect the minimum sensitive data required for the task.
- Keep consequential work reviewable and recoverable.
- The organization owns the system and can export or move it.

## Release rule

A deployment existing is not proof that the product works.

Production release requires:

- exact tested revision;
- passed acceptance gates;
- authority/security review;
- rollback target;
- owner approval;
- live primary-journey verification;
- evidence receipt.

If live verification fails, stop or roll back. Do not relabel it complete.
