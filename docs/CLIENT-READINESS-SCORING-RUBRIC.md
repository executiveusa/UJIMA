# Client Readiness Scoring Rubric — Asc3nd Mission OS™

**Type:** Operator reference — apply after completing discovery intake form  
**Status:** Gate 5B — ready for Architect review before use  
**Use with:** `docs/DISCOVERY-INTAKE-FORM.md`

---

## Purpose

This rubric provides a consistent framework for assessing whether a prospective client is ready for a Mission OS implementation engagement, and at what tier. It is not a guarantee of success. It is a tool for honest, systematic evaluation before writing a proposal.

Score each dimension 1–5 using the definitions below. Apply the composite interpretation to determine readiness.

---

## Dimension 1 — Mission fit

Does the organization's mission and workflows align with what Mission OS is designed to do?

| Score | Criteria |
|---|---|
| 5 | Nonprofit or social-purpose org; active grant writing, outreach, and program operations; explicitly wants human-oversight AI |
| 4 | Clear nonprofit/social purpose; at least two workflows that agents can meaningfully assist with |
| 3 | Plausible fit; one or two relevant workflows; some uncertainty about where agents would add value |
| 2 | Marginal fit; primary workflows don't map well to current agent capabilities; significant scoping required |
| 1 | Not a fit; for-profit without social purpose; needs autonomous AI; would contradict Mission OS safety model |

**Score: ___**

---

## Dimension 2 — Operator readiness

Does the organization have a designated operator who can learn to administer the system?

| Score | Criteria |
|---|---|
| 5 | Designated operator identified; medium-to-high technical comfort; available for 4–6 week onboarding; has time allocation post-deployment |
| 4 | Operator candidate identified; some technical exposure; availability likely; willing to learn |
| 3 | Operator candidate identified but uncertain availability or comfort level; would need extended onboarding |
| 2 | No clear operator candidate; would need significant upskilling; availability uncertain |
| 1 | No technical capacity in the organization; no one available for operator training; implementation would fail without an external resource |

**Score: ___**

---

## Dimension 3 — Document readiness

Does the organization have documents, policies, and content available to load into the knowledge base?

| Score | Criteria |
|---|---|
| 5 | 20+ organized documents ready (program descriptions, grant history, policies, FAQs); one person can provide access |
| 4 | 10–20 documents available; some organization needed but accessible |
| 3 | Some documents exist but scattered or partially outdated; ingestion will take extra effort |
| 2 | Few documents available; knowledge base would be thin; agents would have limited context |
| 1 | No accessible documents; organization's knowledge exists only in people's heads; knowledge base not feasible at this stage |

**Score: ___**

---

## Dimension 4 — Workflow clarity

Can the organization articulate 2–4 specific workflows where AI assistance would add value?

| Score | Criteria |
|---|---|
| 5 | Specific workflows identified (e.g., "we write 8 grants per year and it takes 3 weeks each; drafting takes 60% of that"); ready to configure |
| 4 | Clear workflows identified; some details to refine during configuration |
| 3 | General sense of workflows but not specific; will need discovery iteration to scope agent configuration |
| 2 | Vague sense of "we want AI to help" without specific use cases; significant scoping work required |
| 1 | Cannot articulate workflows; expects AI to figure out what to do autonomously |

**Score: ___**

---

## Dimension 5 — Data sensitivity

What is the organization's data sensitivity profile? Lower sensitivity = higher readiness.

| Score | Criteria |
|---|---|
| 5 | No regulated data; public-facing programs only; no HIPAA/FERPA/COPPA exposure; low risk |
| 4 | Minimal sensitive data; standard donor/volunteer PII managed responsibly; no regulated frameworks apply |
| 3 | Some sensitive data (e.g., detailed client case notes) but no regulated compliance requirements; can be handled with careful configuration |
| 2 | HIPAA, FERPA, or COPPA exposure identified; organization has not yet consulted legal counsel; cannot proceed without legal review |
| 1 | High-sensitivity data (immigration status, payment cards, minors' data) without legal review; or active legal/compliance issues; must pause before any engagement |

**Note:** Score of 2 or below requires legal counsel review before proposal. Score of 1 requires Architect escalation before any next step.

**Score: ___**

---

## Dimension 6 — Budget readiness

Is the organization financially positioned for a Mission OS implementation?

| Score | Criteria |
|---|---|
| 5 | Budget clearly sufficient for recommended tier; technology budget exists; payment structure works |
| 4 | Budget likely sufficient; some flexibility; willing to discuss payment plan |
| 3 | Budget is tight; Starter tier may work; payment plan required; monitoring closely |
| 2 | Budget insufficient at current tier; exploring grant or other funding source; timeline unclear |
| 1 | No budget; no funding path identified; not ready for engagement at this time |

**Score: ___**

---

## Dimension 7 — Timeline readiness

Is the organization ready to begin an implementation in the near term?

| Score | Criteria |
|---|---|
| 5 | Ready to start within 4 weeks; no blackout periods; VPS selection begun; operator available |
| 4 | Ready within 6–8 weeks; minor scheduling constraints; motivated to move forward |
| 3 | Ready in 2–4 months; some constraints (budget approval, board sign-off, staff availability) |
| 2 | Uncertain start date; depends on external factors (grant award, board approval, hiring); may be 6+ months |
| 1 | No near-term timeline; exploring for future consideration only; not ready for engagement |

**Score: ___**

---

## Dimension 8 — Technical ownership readiness

Is the organization prepared to own and operate a VPS-based system?

| Score | Criteria |
|---|---|
| 5 | Leadership understands the owned-stack model; accepts VPS/hosting responsibility; OK with direct billing to providers; understands MIT license |
| 4 | General understanding of owned-stack; some questions to answer; leadership open to the model |
| 3 | Partial understanding; may need more explanation; some hesitation about operating infrastructure |
| 2 | Preference for "someone else manage everything" conflicts with owned-stack model; would need significant expectation-setting |
| 1 | Expects Mission OS to be a SaaS subscription that Asc3nd manages entirely; fundamental misalignment with the offer |

**Score: ___**

---

## Composite scoring

**Total score (sum of all 8):** ___  
**Average score (total ÷ 8):** ___

---

## Interpretation

### Green — Proceed to proposal

**Average 4.0–5.0 | No dimension below 3 | No red-flag dimensions**

The organization is well-positioned for a Mission OS implementation. Proceed to proposal per `docs/PROPOSAL-BUILDER-RUNBOOK.md`. Recommended tier is determined by Dimensions 1, 3, and 4 combined with complexity of workflows.

### Yellow — Proceed with conditions

**Average 3.0–3.9 | No dimension below 2 | Specific gaps documented**

The organization has a reasonable fit but gaps that need addressing before or during implementation. Document the conditions clearly in the proposal. Common yellow conditions:
- Operator readiness: include extended onboarding in proposal
- Document readiness: include knowledge base ingestion time estimate
- Budget readiness: include payment plan and note grant/funding path
- Workflow clarity: include a scoping session as Phase 1 deliverable

Proceed to proposal, but be explicit about the conditions. Get Architect input if any condition is significant.

### Yellow — Delay and check in

**Average 2.5–2.9 | One dimension at 2 | Clear gap with potential resolution path**

The organization is not ready now but may be in 3–6 months. Do not write a proposal yet. Identify the specific gap and the resolution path. Schedule a check-in for when the gap is likely resolved. Use the "needs more information" follow-up template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`.

### Red — Do not proceed

**Average below 2.5 | Any dimension at 1 | Compliance flag unresolved | Red flags present**

Do not write a proposal. The engagement would not succeed at this time, or significant risks exist that cannot be resolved without external action (legal review, hiring, funding, board approval, etc.).

Be honest with the prospect. Use the "not a fit" email template. Leave the door open for the future if circumstances change.

---

## When to require legal review before proceeding

Require the prospective client to consult qualified legal counsel before proceeding with any proposal if:

- Data sensitivity score is 2 or below
- HIPAA, FERPA, or COPPA data is present
- Immigration status or highly sensitive personal data is in scope
- Organization has active litigation that may involve their data or AI use
- Organization has compliance requirements the operator cannot assess

Do not provide legal advice. Do not make compliance representations. State clearly in the proposal that legal counsel review is required.

---

## When to decline regardless of score

Decline the engagement regardless of scoring if:

- The organization expects autonomous AI with no human review (fundamental product mismatch)
- The organization expects AI to submit grants or file legal/financial documents automatically
- The organization wants AI to replace staff, not assist them
- A red flag in Section 13 of the intake form cannot be resolved
- The Architect declines to approve the engagement

---

## Recommended tier by score profile

| Operator Score | Workflow Score | Mission Score | Recommended Tier |
|---|---|---|---|
| 4–5 | 4–5 | 4–5 | Partner or Managed |
| 3–4 | 3–4 | 4–5 | Managed |
| 3 | 3 | 3–4 | Starter |
| Any 2 | Any | Any | Yellow/Delay — resolve gap first |
| Any 1 | Any | Any | Red — do not proceed |

For unusual requirements, large-scale operations, multi-tenant needs, or specialized integrations: escalate to Custom tier with Architect input.

---

*This rubric is an internal decision-support tool. It does not guarantee implementation success or client fit. All scoring is advisory. Final go/no-go decisions and all proposals require Architect review.*
