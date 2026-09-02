# Social Purpose Execution Fabric v1

## Decision

The Social Purpose OS is the governing control plane for nonprofit and mission-driven client operations.

- **Firstmate/Hermes** is the human-facing liaison and supervisor.
- **ICM** is the canonical identity, context, memory, provenance, workflow-truth, and handoff layer.
- **Domain engines** own bounded expertise such as grants, social, SEO, CRM, and analytics.
- **Execution backends** such as OpenHands or Ralphy perform bounded technical work but never own client truth or policy.
- **Unlazy** supplies acceptance-ledger discipline for substantial missions.
- **Gauntlet** supplies independent release criticism.
- **Humanizer** is a late copy-quality pass after facts are locked.
- **Ponytail** enforces reuse-before-addition in engineering.
- **Emil skills** govern client-facing interaction quality where relevant.

## Canonical graph

```text
Human
  |
First Mate / Hermes
  |
ICM control plane
  |
  +-- Grant Agent
  +-- Social engine
  +-- SEO / visibility engine
  +-- CRM / relationship engine
  +-- Analytics / learning engine
  +-- Engineering mission router
          |
          +-- OpenHands
          +-- Ralphy
          +-- other approved coding harnesses
  |
Unlazy verification
  |
Independent Gauntlet critic
  |
Human approval when policy requires
  |
External action
  |
Evidence + learning return to ICM
```

## Prime laws

1. **ICM is canonical.** Agent session memory, vector indexes, dashboards, and executor state are derivatives.
2. **One boss per truth.** Domain services return typed artifacts; they do not fork organization identity, consent, or relationship truth.
3. **One owner repository per output.** Cross-repository mutation requires a typed handoff.
4. **Reuse before adding.** Run the Ponytail ladder before new dependencies, agents, tables, endpoints, services, or UI.
5. **Acceptance before execution.** Substantial missions define observable acceptance criteria before fan-out.
6. **Delegate bounded missions.** Firstmate may supervise a crew but may not silently broaden authority.
7. **Execution is not governance.** OpenHands, Ralphy, coding agents, browsers, and CLIs execute mission packets; they do not redefine scope, facts, or approvals.
8. **Risk controls authority.** Tier 3 actions are approval-gated by default.
9. **Evidence before prose.** Public/client copy starts from verified ICM facts; Humanizer runs late.
10. **Builder cannot approve itself.** Release-quality outputs require an independent critic or reviewer.
11. **Return learning to ICM.** Results, failures, decisions, and reusable evidence become durable memory with provenance.

## Risk tiers

- **Tier 0 — read:** public research, authorized document reads, summaries, technical audits.
- **Tier 1 — internal write:** ICM artifacts, drafts, internal pipeline state, code branches, test fixtures.
- **Tier 2 — reversible external:** save portal draft, create calendar reminder, draft external message, non-production preview.
- **Tier 3 — consequential:** send external communication, publish, grant submission, legal attestation, spend money, DNS, production database mutation, destructive account change, private youth-data operations.

Proactivity may increase breadth, never risk authority.

## Skill trigger matrix

| Trigger | Required/Preferred behavior |
|---|---|
| substantial multi-step mission | Unlazy acceptance ledger + reverify |
| engineering change | Ponytail reuse ladder first |
| bounded autonomous coding | Ralphy or OpenHands only through mission envelope |
| public/client prose | provenance check -> draft -> Humanizer -> human/independent review |
| release-quality artifact | Gauntlet or independent fresh-context critic |
| technical/search visibility | Claude SEO lane; remediation may dispatch engineering executor |
| forms/portal/mobile UX | Emil skills + accessibility + mobile proof |
| grants | Grant Agent federation contract |

## Grant-domain ownership

`executiveusa/grant-agent` owns grant-specific implementation. The Social Purpose OS owns tenant identity, organization truth, approval policy, relationships, consent, evidence ledger, and cross-domain analytics.

Grant Agent reads tenant-scoped approved ICM context and returns versioned grant artifacts. It may not maintain a competing ASC3ND/New World Kids organization truth.

## OpenHands boundary

OpenHands is an optional technical executor because it is designed to run coding agents and automations with filesystem/shell/network authority. It should therefore receive narrow mission envelopes, preferably in isolated worktrees/containers/VMs, and return evidence to the parent mission.

It is not the Social Purpose OS foundation, client portal, policy engine, CRM, grant authority, or memory system.

## User experience

The client should mainly see:

- **Home** — what changed, what is active, what needs attention;
- **Content** — review/download/copy/publish or schedule;
- **Opportunities** — grants, partnerships, funding;
- **People** — families, volunteers, mentors, sponsors, partners;
- **Results** — meaningful outcomes and learning;
- **Needs You** — approvals and missing facts.

Technical internals remain available to operators but do not become the client experience.

## Mission example

Human request:

> Find ASC3ND three grants worth applying for this month and prepare everything we can.

Execution:

`Firstmate -> load ASC3ND ICM -> define gates -> Grant Agent discover/qualify -> writer -> evidence critic -> Humanizer -> Gauntlet -> human approval -> submit only if approved -> result/learning to ICM`

The human receives outcomes and decisions, not agent-session noise.
