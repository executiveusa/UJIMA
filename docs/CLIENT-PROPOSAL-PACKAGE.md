# Client Proposal Package — Asc3nd Mission OS™

**Type:** Operator reference — proposal workflow  
**Status:** Gate 5B — ready for Architect review before client use  
**Important:** No proposal may be sent to a client without Architect approval. No final pricing may be quoted without human approval.

---

## Purpose

This package defines the workflow for creating, reviewing, and delivering a Mission OS implementation proposal to a prospective client. It ties together the discovery process, readiness scoring, proposal template, and follow-up sequence into a repeatable, consistent workflow.

The goal is to produce accurate, honest proposals that reflect the client's specific situation — without inventing fake client names, fake testimonials, guaranteed outcomes, or final pricing.

---

## When to use this package

Use this package after:

1. A discovery call has been completed (per `docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md`)
2. Discovery notes have been documented
3. Initial fit assessment suggests Mission OS may be appropriate for the organization

Do not open a proposal without completing discovery. Do not send a proposal without Architect approval.

---

## Required source documents

Before building a proposal, the operator must have read and understood:

| Document | Purpose |
|---|---|
| `docs/SOVEREIGN-AI-OFFER.md` | Client-facing offer summary |
| `docs/ONE-TIME-SETUP-FEE-OFFER.md` | Setup fee tiers and what is included |
| `docs/MAINTENANCE-PACKAGE.md` | Optional maintenance definition |
| `docs/MANAGED-AGENT-SUPPORT-PACKAGE.md` | Optional managed-agent support definition |
| `docs/LEGAL-SAFETY-NOTES.md` | What Mission OS will and will not do |
| `docs/SOVEREIGN-AI-FAQ.md` | Common questions and honest answers |
| `docs/PRICING.md` | Draft pricing (requires human approval before quoting) |
| `docs/PRODUCTION-GAPS.md` | Honest current state — what is not yet live |
| `docs/PHASE-9-GO-LIVE-GATES.md` | What must pass before live deployment |
| `docs/CLIENT-READINESS-SCORING-RUBRIC.md` | How to assess fit and readiness |
| `docs/DISCOVERY-INTAKE-FORM.md` | Discovery intake and scoring |

---

## Proposal workflow

### Step 1 — Complete discovery intake

Complete `docs/DISCOVERY-INTAKE-FORM.md` based on the discovery call notes. Score the client using `docs/CLIENT-READINESS-SCORING-RUBRIC.md`.

**Output:** Completed intake form with scores and recommended tier.

### Step 2 — Assess fit

Review the fit score, complexity score, risk score, and operator readiness score. Apply the rubric's green/yellow/red interpretation.

If yellow or red on any dimension: resolve the concern or document why it is acceptable before proceeding.

If compliance/sensitive-data flags are raised: do not proceed without noting that the client needs legal counsel review.

### Step 3 — Select tier and optional packages

Based on discovery notes and readiness scores, select:
- Setup tier (Starter / Managed / Partner / Custom)
- Optional maintenance package (yes/no/maybe)
- Optional managed-agent support package (yes/no/maybe)

Document the rationale.

### Step 4 — Draft the proposal

Use `docs/CLIENT-PROPOSAL-TEMPLATE.md` as the base. Fill in all `[PLACEHOLDER]` fields from discovery notes.

Rules:
- Do not invent facts not established in discovery
- Do not use fake client names
- Do not include final pricing — use `[DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]`
- Do not claim live deployment unless go-live evidence exists
- Do not make compliance/legal promises

### Step 5 — Internal review

Complete the internal review checklist before sending for Architect approval:

- [ ] All placeholders filled from actual discovery notes
- [ ] No fake client names or invented details
- [ ] No final pricing (DRAFT placeholder used)
- [ ] Client-owned stack model clearly explained
- [ ] Out-of-scope items listed
- [ ] Compliance flags documented
- [ ] No guaranteed outcomes stated
- [ ] Legal/attorney review disclaimer included if SOW-related content present
- [ ] Onboarding prerequisite (live VPS required) noted

### Step 6 — Architect approval

Send the draft proposal to the Architect for review. Do not deliver to the client until approved.

**Do not send a proposal without Architect approval.**

### Step 7 — Client delivery

After Architect approval, deliver using the appropriate template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md` (proposal delivery email).

### Step 8 — Follow-up

Follow the follow-up email schedule in `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`. Do not use false urgency. Do not pressure. Log all follow-ups.

---

## Asset list

| Asset | Location |
|---|---|
| Proposal template | `docs/CLIENT-PROPOSAL-TEMPLATE.md` |
| Proposal builder runbook | `docs/PROPOSAL-BUILDER-RUNBOOK.md` |
| Discovery intake form | `docs/DISCOVERY-INTAKE-FORM.md` |
| Readiness scoring rubric | `docs/CLIENT-READINESS-SCORING-RUBRIC.md` |
| One-page pitch template | `docs/ONE-PAGE-PITCH-TEMPLATE.md` |
| Follow-up email templates | `docs/FOLLOW-UP-EMAIL-TEMPLATES.md` |
| Demo path script | `docs/MISSION-OS-DEMO-PATH.md` |
| Sales call script | `docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md` |

---

## Approval checklist

Before delivering any proposal to a prospective client:

- [ ] Discovery intake form completed
- [ ] Readiness scoring rubric applied
- [ ] Proposal drafted from template with real discovery notes
- [ ] Internal review completed
- [ ] Architect approval obtained
- [ ] Final pricing not included (DRAFT placeholder only)
- [ ] Legal disclaimer included if applicable

---

## What cannot be customized without Architect approval

- Pricing (any dollar amount or range)
- Scope of standard deployment (what is included in the setup fee)
- Hard blocks and approval policy rules
- Claims about compliance or regulatory certification
- Claims about live deployment status
- Timeline estimates beyond the standard 4–6 week range
- Payment terms

---

## What must be customized per client

- Client name and organization details (`[CLIENT_NAME]`, `[CLIENT_DOMAIN]`)
- Program descriptions (`[CLIENT_PROGRAMS]`)
- Discovery summary (`[DISCOVERY_NOTES]`)
- Operator contact (`[CLIENT_OPERATOR]`)
- Recommended tier (based on discovery and scoring)
- Optional packages (based on client needs and budget)
- Specific out-of-scope items relevant to the client's situation

---

## What must remain unchanged

- The client-owned stack model (client owns VPS, code, database, keys, agents, ICM, domain)
- The no-forced-SaaS-subscription statement
- The hard blocks (GRANT_SUBMISSION, LEGAL_FINANCIAL_FILING, OUTBOUND_MESSAGE, PUBLIC_PUBLISHING)
- The not-legal-advice disclaimer on all legal/compliance-adjacent content
- The not-a-final-contract disclaimer on the SOW outline
- The DRAFT label on all pricing
- The live-deployment prerequisite (go-live gates A–N must pass)

---

*No proposal may be sent to a client without Architect approval. No final pricing may be quoted without human approval. This package does not constitute a contract.*
