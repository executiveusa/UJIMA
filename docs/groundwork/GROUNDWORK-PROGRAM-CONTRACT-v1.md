# Groundwork — UJIMA Program Contract (v1)

Status: proposed, commercial and design approval pending. Source of truth for this slice: `main` at `7b7afd257db1a6f7ab76fbc0ef65e15008edfe32`.

## Mission
Groundwork is UJIMA's first flagship organizational strengthening program for nonprofits, community organizations, and social-purpose businesses. It diagnoses root causes, identifies leverage points, improves systems, and verifies benefits while preserving the organization's control.

Groundwork is a service **delivered through UJIMA**, not a separate brand, platform, or frontend stack. Retire references to Vibe and MAXX for this program.

## Commercial proposition
**Promise:** Stronger organizations, greater impact. Start by identifying the few operational changes with the highest leverage.

First offer: **Groundwork Assessment**, a paid, fixed-scope diagnostic. Pricing, payment provider, terms, and service capacity require business validation. Do not invent prices, testimonials, client metrics, or claim assessment payments are already configured.

Customer: executive director, nonprofit founder, or social-purpose operator authorized to commission an assessment.

Measure: attributable qualified assessment inquiries; paid conversion once real payment is connected; delivery cost and impact indicators after service.

## Delivery method: Meadows-informed (not a literal Meadows product)
1. Discover organizational mission, context, stakeholder needs, baseline, constraints, assets, and ownership.
2. Map stocks and flows, relationships, delays, feedback loops, incentives, traps, and information pathways. Separate observation from hypothesis.
3. Strengthen: choose and specify one high-leverage, reversible intervention, reusing existing infrastructure.
4. Activate: implement only within authorization and approval boundaries, train the organization, provide evidence and rollback.
5. Learn: compare measured outcomes with baseline, surface unintended effects, adapt.

Existing UJIMA mission workflow `identity → trust → discovery → readiness → repair → proof` remains the execution engine. The five stages above are the **service narrative** and must not silently replace the six backend stage IDs.

## Exact initial page slice
Target: **`/groundwork`** on the existing UJIMA frontend. Do not redesign `/`, `/login`, or `/ops`.

Section/content contract:
- Hero: UJIMA / GROUNDWORK; “Stronger organizations. Greater impact.”; describe the target buyer and tangible outcome, not the technology.
- Pain: recurring administrative burden, fragmented information, unreliable follow-up, funding uncertainty. Avoid unsourced industry statistics.
- Method: five service stages above with honest explanation of systems thinking.
- Deliverables: evidence-backed baseline, system map, prioritized leverage points, one bounded improvement proposal, verification plan.
- Service paths: Assessment, Implementation, Partnership; describe as potential engagements, not falsely purchasable SKUs.
- Reference: ASC3ND as an initial implementation, explicitly labelled in progress. No invented results.
- Primary CTA: Request a Groundwork Assessment.
- Secondary CTA: Understand the process.

## Assessment intake contract
Required: contact name, work email, organization name, organizational role, one-sentence highest-priority challenge, explicit consent for follow-up.
Optional: website, phone, sector, location, organizational type.

- Reuse existing UJIMA Supabase/Netlify intake only after verifying its schema, privacy handling, routing, and successful readback. Current homepage calls `ujima-waitlist`, accepting email+website; it is **not yet verified as an assessment intake**.
- No invented success state; show confirmation only after successful server acknowledgment, and verify actual storage independently.
- Protect submissions from spam, rate abuse, accidental sensitive data, and cross-tenant access. Use least-privilege backend.
- Establish explicit lead owner, notification recipient, follow-up SLA, and data-retention policy before production.

## Design boundary
Creative direction is owned by a specialist designer and approved by the owner. Engineering shall use the current UJIMA design tokens, components and layout conventions; no unauthorised logo, typography, imagery or general homepage redesign.

## Technical boundary
- Reuse Next.js 16 application in `apps/site/`; use route conventions already present.
- Keep historical `@asc3nd/*` dependency namespaces until a separate migration.
- Don't mix with PR #90 staging or independently change auth, tenant runtime, mission API or database schema.
- Reuse existing service capabilities after tests; no new framework, paid tool, or duplicate agent.
- Human approval for external publishing and consequential actions; owner controls code, hosting, credentials and data.

## Proof before production
- PR targets current main, reviewed for conflicts with #90.
- Existing repo guards, tests, and build pass.
- Desktop 1440px / tablet 768px / mobile 375px and 320px screenshot acceptance by independent design reviewer.
- Keyboard navigation, semantic headings, reduced motion, clear input labels, contrast, error and success states.
- Validate a disposable test inquiry end to end, including persistence, attribution, notification (if configured), and clean-up policy.
- No fake payment readiness or paid service confirmation.
- Netlify preview exact commit, smoke tests, independent review, approved release; production stays unchanged until owner approval.

## Rollback
Isolated feature branch; revert the eventual merged commit or restore the previous Netlify deploy. No migration or irreversible data change permitted for this slice.

## Immediate priorities
1. Align pending UJIMA PR #90 / #99 boundaries with this commercial program, without merging them.
2. Verify the intake destination before building a form.
3. Assign the page's visual composition to the design specialist.
4. Implement a minimal `/groundwork` route and verified lead capture behind one draft PR.
