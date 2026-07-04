# Proposal Builder Runbook — Asc3nd Mission OS™

**Type:** Operator workflow reference  
**Status:** Gate 5B — ready for Architect review before use  
**Important:** Do not send a proposal without Architect approval. Do not quote pricing without human approval.

---

## Purpose

This runbook guides an operator through the full workflow of converting discovery call notes into a deliverable Mission OS implementation proposal. It is a process document, not a template. For the proposal template itself, see `docs/CLIENT-PROPOSAL-TEMPLATE.md`.

---

## Inputs required

Before starting a proposal, collect:

- [ ] Completed discovery call notes (per `docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md`)
- [ ] Completed discovery intake form (per `docs/DISCOVERY-INTAKE-FORM.md`)
- [ ] Readiness scoring rubric results (per `docs/CLIENT-READINESS-SCORING-RUBRIC.md`)
- [ ] Organization name, legal entity type, website
- [ ] Key staff contact (operator designate)
- [ ] Estimated program count and staff size
- [ ] List of documents available for knowledge base
- [ ] Current tools in use
- [ ] Any compliance or data sensitivity flags raised in discovery
- [ ] Budget readiness indication (not a specific number — just green/yellow/red)

If any of these are missing, go back to discovery before drafting.

---

## Step 1 — Discovery notes checklist

Review your discovery notes. Confirm you have answers to:

- [ ] What programs does the organization run? (list them)
- [ ] How many staff? Who would be the operator?
- [ ] What does admin/operational work look like week-to-week?
- [ ] What tools are currently in use (CRM, email, project management)?
- [ ] Have they used AI tools? What was the reaction?
- [ ] Where do they spend the most time on repetitive drafting work?
- [ ] How much revenue comes from grants? How many applications per year?
- [ ] Who currently writes grants? Is this a bottleneck?
- [ ] Does the organization work with HIPAA/FERPA/COPPA-regulated data?
- [ ] Is there an operator candidate who can learn system administration?
- [ ] What does success look like in 6 months?

If major gaps exist, schedule a follow-up call before drafting.

---

## Step 2 — Client fit check

Based on discovery notes, assess basic fit:

**Strong fit signals:**
- Nonprofit or social-purpose organization
- 1–5 programs (or more with adequate complexity tier)
- Has at least one person willing to be the system operator
- Staff spends significant time on grant writing, outreach, or communications
- Has been frustrated by overbuilt tools or vendor lock-in
- Values human oversight of AI outputs
- Budget readiness is green or yellow

**Weak fit signals:**
- Needs fully autonomous AI with no human review
- Has no staff available to learn system administration
- Requires compliance certification (HIPAA, FERPA, COPPA) without legal review
- Budget is clearly insufficient and no path to funding exists
- Organization expects AI to replace staff entirely

If weak fit signals dominate: do not write a proposal. Use the "not a fit" email template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`.

---

## Step 3 — Risk and compliance check

Review any compliance or data sensitivity flags from discovery:

| Flag | Required action before proposal |
|---|---|
| Client mentioned HIPAA/health data | Note explicitly in proposal: legal counsel review required. Do not claim compliance. |
| Client mentioned youth/FERPA data | Note explicitly: legal counsel review required. Do not claim compliance. |
| Client mentioned immigration status data | Escalate to Architect before proceeding. |
| Client mentioned payment card data | Escalate to Architect before proceeding. |
| Client has no technical staff at all | Document operator readiness plan in proposal. Flag risk clearly. |
| Client expects AI to auto-submit grants | Correct the expectation during follow-up call. Do not proceed if client insists. |
| Client wants to share their instance with another org | This is a multi-tenant question — must be explicitly scoped and approved. |

If any flags are unresolved: pause the proposal. Resolve the flag first.

---

## Step 4 — Select setup tier

Based on discovery notes and readiness scoring, select a tier:

| Tier | When to select |
|---|---|
| Starter | Small org, 1–3 programs, 1–5 staff, basic workflows, limited budget |
| Managed | Established org, 3–8 programs, 5–20 staff, active grant and comms workflows |
| Partner | Larger org, complex workflows, multiple programs, multi-department operations |
| Custom | Unusual requirements, large scale, multi-tenant, specialized integrations |

Document the rationale. If the recommended tier does not match the client's budget indication, note the gap and discuss with Architect before drafting.

---

## Step 5 — Select optional support packages

Based on discovery: does the client have the internal capacity to run the system independently after handoff?

**Recommend optional maintenance if:**
- No technical staff beyond the designated operator
- Operator has limited time for system maintenance
- Organization cannot risk a failed security update going unnoticed

**Recommend optional managed-agent support if:**
- Client expects ongoing workflow evolution
- Programs change seasonally
- Client wants help iterating on agent prompts and workflows
- Staff capacity for self-service agent updates is limited

Document the recommendation and why. The client decides — do not pressure.

---

## Step 6 — Draft the proposal

Open `docs/CLIENT-PROPOSAL-TEMPLATE.md`. Copy it to a working file (do not edit the template directly). Fill in every `[PLACEHOLDER]` from discovery notes.

Rules:
- Every fact must come from discovery notes — not invented
- No final dollar amounts — use `[DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]`
- No fake testimonials or fake client references
- No live deployment claims unless go-live evidence exists
- No compliance/legal promises
- No guaranteed outcomes

If you do not have a fact to fill a placeholder, leave the placeholder visible — do not invent a value.

---

## Step 7 — Internal review checklist

Before submitting for Architect approval:

**Content accuracy:**
- [ ] All placeholders filled from actual discovery notes (or left as placeholders)
- [ ] Recommended tier matches discovery notes and scoring rubric
- [ ] Optional packages recommendation documented and rationale noted
- [ ] Out-of-scope items match the client's specific situation
- [ ] Risks section reflects actual discovery risks (not generic boilerplate only)

**Safety and accuracy:**
- [ ] No fake client names or invented organizational details
- [ ] No final pricing — DRAFT placeholder used throughout
- [ ] No guaranteed outcomes (funding, donations, AI output quality)
- [ ] No legal compliance promises (HIPAA, FERPA, COPPA)
- [ ] No claims of live deployment unless go-live evidence exists
- [ ] Not-a-contract disclaimer present
- [ ] Attorney-review required statement present (if SOW-adjacent content included)

**Completeness:**
- [ ] Client-owned stack explanation included
- [ ] Hard blocks and approval policy explained
- [ ] Onboarding prerequisite noted (live VPS required before Day 1)
- [ ] Client responsibilities clearly listed
- [ ] Payment milestone structure included (with DRAFT amounts)

---

## Step 8 — Architect approval

Submit the draft proposal to the Architect with:
- A summary of discovery notes
- Readiness scoring rubric results
- Your tier recommendation and rationale
- Any unresolved flags or concerns

**Do not send a proposal to a client without Architect approval.**

Wait for the Architect's response before proceeding.

---

## Step 9 — Client delivery checklist

After Architect approval:

- [ ] Review proposal one final time for typos and placeholder omissions
- [ ] Use the proposal delivery email template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`
- [ ] Send to the correct contact (the person from discovery, not a general inbox)
- [ ] Log the delivery date and follow-up schedule
- [ ] Set a calendar reminder for the 3-business-day follow-up

---

## Step 10 — Post-delivery follow-up schedule

Follow the schedule from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`:

| Day | Action |
|---|---|
| Day 0 | Proposal delivered |
| Day 3 | First follow-up (check in, offer to answer questions) |
| Day 10 | Second follow-up (ask for next step) |
| Day 21 | Final follow-up (honest close — move to inactive if no response) |

Do not use false urgency. Do not create fake scarcity. Do not pressure.

---

## What to do if the client is not a fit

If discovery reveals the client is not a fit, do not write a proposal. Use the "not a fit" template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`.

Be honest. Explain why Mission OS is not the right fit. If another resource or tool might be more appropriate, mention it. Ending the conversation cleanly is better than forcing a bad fit.

---

## Reference documents

| Document | Use |
|---|---|
| `docs/CLIENT-PROPOSAL-TEMPLATE.md` | Base template for proposals |
| `docs/DISCOVERY-INTAKE-FORM.md` | Discovery form to complete before this runbook |
| `docs/CLIENT-READINESS-SCORING-RUBRIC.md` | Scoring rubric applied in Step 2 |
| `docs/FOLLOW-UP-EMAIL-TEMPLATES.md` | Email templates for all follow-up steps |
| `docs/IMPLEMENTATION-SOW-OUTLINE.md` | SOW outline if formal contract work begins |
| `docs/LEGAL-SAFETY-NOTES.md` | Safety and hard-block reference |
| `docs/PRICING.md` | Draft pricing reference (requires human approval before quoting) |

---

*Do not send a proposal without Architect approval. Do not quote pricing without human approval. Proposals are informational documents, not contracts.*
