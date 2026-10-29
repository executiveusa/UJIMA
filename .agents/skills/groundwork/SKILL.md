# Groundwork — Nonprofit Launch + Readiness Workflow

## Governing skill

Inherit `.agents/skills/nonprofit-operating-system/SKILL.md`.

Groundwork is a workflow composed from existing UJIMA skills. It is not a second orchestrator and it does not own tenant truth.

## Mission

Answer:

> Are we actually ready to be found, trusted, funded, and operated? If not, what should happen next?

The client sees a small number of understandable outcomes. Internally, Groundwork may use a larger evidence checklist.

## Trigger

Use when the user asks to:
- run Groundwork;
- assess nonprofit/digital readiness;
- determine whether the organization is ready to launch or fundraise;
- inspect the organization's public foundation before more growth work.

Do not route a narrow request such as "find three grants" to Groundwork unless readiness is the stated goal.

## Required stages

1. INTAKE
2. MISSION REALITY
3. LEGAL / PUBLIC IDENTITY
4. DIGITAL OWNERSHIP
5. WEBSITE + TRUST
6. GOOGLE + DISCOVERY
7. DONATION / VOLUNTEER / CONTACT FLOWS
8. ACCESSIBILITY + MOBILE + TECHNICAL HEALTH
9. PRIVACY + SAFETY
10. FUNDING READINESS
11. IMPACT / EVIDENCE
12. SCORE
13. REPAIR PLAN
14. APPROVAL
15. FIX
16. VERIFY
17. MONITOR

A run may mark a stage NOT_APPLICABLE, but may not silently omit it.

## Skill composition

Reuse, as applicable:
- `nonprofit-strategy`
- `nonprofit-website`
- `nonprofit-google-discovery`
- `nonprofit-crm`
- `nonprofit-reporting`
- `nonprofit-email-followup`
- grant-domain specialist capabilities through UJIMA federation

Do not duplicate those implementations inside Groundwork.

## Evidence classes

Every material statement is exactly one of:
- VERIFIED_FACT
- CLIENT_SUPPLIED_FACT
- OBSERVED_EVIDENCE
- INFERENCE
- RECOMMENDATION
- UNKNOWN
- HUMAN_REVIEW_REQUIRED

Never upgrade UNKNOWN or INFERENCE to VERIFIED_FACT to make a report look complete.

## Client outcomes

Present eight high-level outcomes:
1. Mission & Strategy
2. Legal / Public Identity
3. Digital Ownership
4. Trust
5. Findability
6. Action Paths
7. Funding Readiness
8. Operations & Measurement

Each outcome may be:
- READY
- NEEDS_ATTENTION
- AT_RISK
- UNKNOWN
- NOT_APPLICABLE

## Finding contract

Each finding must include:
- title
- evidence class
- evidence reference(s)
- severity: P0 / P1 / P2 / P3
- affected outcome(s)
- why it matters
- recommended next action
- owner type
- estimated effort
- whether UJIMA can prepare/fix it
- whether human approval is required
- proof required to close it

## Authority

Safe without consequential approval:
- public research;
- read-only inspection;
- evidence collection;
- comparison;
- drafting;
- scoring;
- recommendations;
- repair planning;
- preparing an artifact.

Approval or authorized human action is required before:
- legal/tax certifications;
- filing or signing;
- public publishing;
- external messages;
- grant submission;
- profile claim/creation when it creates obligations;
- money movement;
- banking/KYC;
- DNS/domain changes;
- credential changes;
- production deployment/mutation;
- destructive operations;
- publishing sensitive/youth data.

When a human-only blocker appears, log it and continue every independent stage that remains.

## Google rule

Always determine whether Google Business Profile is relevant.

If relevant, inspect public consistency for:
- name;
- address or service area;
- phone;
- website;
- hours;
- categories/services;
- photos;
- duplicate listings;
- reviews;
- visible ownership/claim status where determinable.

Never penalize an ineligible organization for lacking a profile.
Never claim verification or ownership without evidence.

## Funding rule

Do not call an organization funding-ready merely because it has a nonprofit website.

Inspect identity, programs, population, geography, governance, evidence, financial/accountability signals, privacy/safety, donation path, and avoidable grant-reviewer questions.

No grant opportunity is current, eligible, or available until its current primary source is verified.

## Repair rule

Groundwork may recommend repairs during the assessment.

Actual repair is a separate governed execution step:
DETECT → EXPLAIN → PRIORITIZE → APPROVE WHEN REQUIRED → FIX → INDEPENDENTLY VERIFY → CLOSE → MONITOR.

A builder cannot close its own finding without proof.

## Completion

Groundwork is complete only when every applicable stage has a terminal status and the run contains:
- evidence ledger;
- eight-outcome result;
- prioritized findings;
- strengths to preserve;
- repair plan;
- human action queue;
- proof references;
- unresolved unknowns;
- next action.

Never claim a repair happened when only a recommendation was produced.
