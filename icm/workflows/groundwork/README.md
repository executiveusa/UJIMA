# Groundwork ICM Workflow

## Purpose

This shelf is the cold-start routing contract for UJIMA Groundwork.

Tenant truth stays under `icm/tenants/{tenantId}`. Runtime truth stays in the mission/event/evidence stores. This shelf defines how a cold agent should interpret and advance a Groundwork mission without loading unrelated context.

## Cold-agent entry

Given a Groundwork mission:

1. Read `AGENTS.md`.
2. Read `CONTEXT.md`.
3. Read this file.
4. Read only `icm/tenants/{tenantId}` context needed by the current stage.
5. Read the mission handoff, latest work state, evidence refs, approvals and artifacts for the run.
6. Determine the current stage from durable state. Do not infer completion from chat prose.
7. Execute only capabilities allowed by the mission contract.
8. Write evidence/progress through the existing UJIMA event/evidence path.
9. Stop before consequential action when approval is required.

## Stage contract

Every stage exposes:

### INPUTS
Required verified facts, evidence, prior stage output and explicit unknowns.

### PROCESS
The bounded work that may occur.

### TOOLS
Preferred execution order:
native API → MCP → CLI → structured browser → bounded computer operator.

### AUTHORITY
What may be done automatically and what must stop for approval.

### OUTPUT
Structured findings, facts, artifacts or terminal status.

### PROOF
Source/evidence references sufficient to support the output.

### NEXT
Next applicable stage or explicit blocker.

## Stage map

| Stage | Goal | Minimum proof |
|---|---|---|
| 01 Intake | Establish known organization facts and unknowns | client-supplied refs + authoritative/public refs where available |
| 02 Mission Reality | Clarify mission, people served, geography, programs and intended outcomes | tenant context + public program evidence |
| 03 Legal/Public Identity | Reconcile public/legal identity without making legal conclusions | authoritative public records |
| 04 Digital Ownership | Map control/unknown control of domain, hosting, email, payments, analytics, social and data | owner/client evidence or verified account state |
| 05 Website + Trust | Inspect clarity, proof, leadership, transparency and primary journeys | crawl/browser evidence |
| 06 Google + Discovery | Inspect search, GBP relevance, listings, Search Console/Analytics where authorized | current public/platform evidence |
| 07 Action Paths | Test donate/volunteer/contact/participate paths | real route/form evidence; no false success |
| 08 Access + Technical | Mobile, accessibility, reliability, security/performance observations | automated + manual/browser evidence |
| 09 Privacy + Safety | Map data collection and vulnerable-population concerns | forms/policies/data-flow evidence |
| 10 Funding Readiness | Evaluate avoidable institutional due-diligence friction | verified organization/program/accountability evidence |
| 11 Impact/Evidence | Separate outputs/outcomes/claims and proof | claim/evidence map |
| 12 Score | Produce eight customer-facing outcomes | all applicable prior stage results |
| 13 Repair Plan | Prioritize P0→P3 and strengths to protect | finding ledger |
| 14 Approval | Batch consequential decisions/human-only blockers | durable approval/human-action records |
| 15 Fix | Execute only authorized bounded repairs | implementation evidence |
| 16 Verify | Independent proof that fixes work | strongest available oracle |
| 17 Monitor | Define recurring checks for Groundwork Care | monitoring contract + next-check state |

## Terminal values

Each stage ends as exactly one:
- COMPLETE
- NEEDS_ATTENTION
- BLOCKED_HUMAN_ACTION_REQUIRED
- AWAITING_THIRD_PARTY_REVIEW
- NOT_CURRENTLY_ELIGIBLE
- NOT_APPLICABLE
- FAILED_RETRYABLE
- FAILED_TERMINAL

No stage disappears because a platform or tool is blocked.

## Recovery test

A cold agent passes the Groundwork walk test only if it can answer, from durable evidence:
- Which tenant is this?
- Which Groundwork run is this?
- Which stage is current?
- Which stages are complete?
- Which facts are verified vs unknown?
- What authority does the agent have?
- Is an approval pending?
- What proof already exists?
- What is the single next valid action?
