# ASC3ND Control Tower Prototype v0.1

## Purpose
Build a separate, safe prototype of the ASC3ND operational micro-app without modifying the live event landing page or the current interactive workbook.

The prototype should prove that ASC3ND can:
- understand event status at a glance;
- ask grounded questions in natural language;
- see where registrations and leads come from;
- review alerts and follow-up needs;
- create only approved, brand-safe drafts;
- progressively unlock agent capabilities during a 90-day onboarding.

## Build location

Repository: `executiveusa/ascend-social-purpose-agentic-systems-`

Prototype app path:

```text
apps/asc3nd-control-tower-prototype/
```

Deployment target:

```text
asc3nd-control-tower-prototype.vercel.app
```

The prototype must have its own Vercel project and environment variables. It must not share the production alias or deployment project used by the public ASC3ND landing page.

## Product model

The interface is not a chatbot with a dashboard attached. It is an operational workspace with an embedded, bounded assistant.

```text
Control Tower UI
  -> ASC3ND Agent Gateway
  -> ThePopeBot runtime
  -> scoped ASC3ND Event Operator
  -> approved Mission OS / Supabase tools
```

ThePopeBot remains invisible to the client during early onboarding. ASC3ND sees only the capabilities enabled for its current onboarding stage.

## Design principles

1. **Dashboard first, conversation second**
   - The first screen must answer what is happening before the user asks a question.
   - Chat is a guided analysis and action layer, not the whole product.

2. **One clear next action**
   - Every screen should make the recommended next step obvious.
   - Avoid walls of metrics, settings, or model controls.

3. **Progressive disclosure**
   - Show only current-stage tools.
   - Advanced capabilities remain hidden until unlocked.

4. **Grounded by default**
   - Every factual answer must come from approved tenant data or locked ASC3ND facts.
   - Answers must include last-updated time and supporting records or metrics.

5. **Draft before action**
   - Content creation produces a draft package.
   - Publishing, sending, bulk changes, and external actions always require approval.

6. **Brand protection over output volume**
   - The system should refuse low-context, repetitive, off-brand, or unsupported content generation.
   - Quality gates are mandatory before a draft can be approved.

## Prototype navigation

Keep v0.1 to five destinations:

```text
Overview
Leads
Campaigns
Alerts
Ask ASC3ND
```

Do not expose:
- terminal;
- code workspaces;
- repositories;
- raw agent jobs;
- provider settings;
- model temperatures;
- prompt editing;
- ThePopeBot admin screens;
- auto-merge controls.

## Screen 1: Overview

The default screen should contain:

### Event header
- Community Cuts for Kids
- date, time, venue
- last data refresh
- system health indicator

### Primary metrics
- planning responses
- estimated attendees
- confirmed responses
- follow-up required
- volunteer interest
- partner or sponsor interest

### Readiness strip
- attendance readiness
- volunteer readiness
- supply readiness
- communications readiness
- system health

### What needs attention
A ranked list of no more than five items, each with:
- why it matters;
- affected count;
- age of issue;
- recommended action;
- open-review button.

### Today's briefing
A concise generated briefing grounded only in current event data.

## Screen 2: Leads

Provide a simple operational pipeline:

```text
New
Needs review
Contacted
Confirmed
Follow-up required
Completed
Archived
```

The prototype starts read-only. It may display redacted records and follow-up queues, but it may not alter production data.

Filters:
- lead type;
- status;
- language;
- source;
- age of record;
- assigned or unassigned.

## Screen 3: Campaigns

Campaign tools must be structured workflows, not a blank generation box.

Allowed prototype workflow:

```text
Create campaign draft
  1. choose approved objective
  2. choose approved audience
  3. choose approved format
  4. load locked event facts
  5. load current brand kit
  6. generate one primary concept and one alternate
  7. run brand and factual review
  8. present as UNAPPROVED DRAFT
```

Initial formats:
- print flyer copy;
- Instagram post copy;
- Instagram story copy;
- Spanish adaptation;
- QR attribution link definition.

Image generation and public publishing are excluded from v0.1.

## Screen 4: Alerts

Show only actionable alerts:
- stale lead;
- unassigned high-value partner lead;
- volunteer coverage below threshold;
- projected supply gap;
- registration endpoint failure;
- source attribution missing;
- workbook and database totals disagree;
- agent tool failure.

Each alert must have:
- severity;
- plain-language explanation;
- evidence;
- recommended action;
- acknowledgement state.

The prototype may simulate alerts from fixture data. It must not send production email, SMS, or Telegram messages.

## Screen 5: Ask ASC3ND

The assistant panel should feel conversational but remain constrained.

### Suggested actions
- Give me today's event briefing
- What needs attention?
- Where are our leads coming from?
- Show the follow-up queue
- Explain volunteer readiness
- Draft a family follow-up
- Draft a sponsor follow-up
- Prepare a campaign brief

### Response contract
Every answer should use this structure when applicable:

1. Direct answer
2. Supporting metrics or records
3. Why it matters
4. Recommended next action
5. Available approved actions
6. Data freshness and source note

### Scope boundaries
The assistant may discuss:
- ASC3ND;
- current ASC3ND events;
- leads, volunteers, partners, supplies, campaigns, and readiness;
- approved brand and messaging guidance;
- operational recommendations based on tenant data.

The assistant must decline unrelated general-purpose conversation and redirect:

> I am configured for ASC3ND event and campaign operations. I can help with event readiness, leads, volunteers, supplies, outreach, follow-up, and approved campaign drafts.

## Anti-slop content controls

### No open-ended content factory
Do not provide a generic "Create anything" prompt.

### Required creation inputs
Before generating campaign material, the workflow must have:
- objective;
- audience;
- channel or format;
- approved facts;
- CTA;
- language;
- brand-kit version;
- attribution identifier.

### Quality gate
Every generated draft must pass:
- factual consistency check;
- brand voice check;
- duplication check;
- prohibited-claim check;
- youth privacy check;
- CTA clarity check;
- reading-level and accessibility check;
- English/Spanish parity check when bilingual.

### Output limit
For each request, create:
- one recommended concept;
- one meaningfully different alternate;
- no bulk variations unless explicitly approved.

### Draft labeling
Every generated artifact must display:

```text
UNAPPROVED DRAFT — REVIEW REQUIRED
```

### Publishing rule
The prototype cannot publish, send, schedule, or export a contact list.

## Agent architecture

Create a scoped agent definition:

```text
agents/asc3nd-event-operator/
  SYSTEM.md
  FACTS.md
  PRIVACY.md
  BRAND-GUARDRAILS.md
  APPROVALS.md
  tools/
```

### v0.1 read tools
- get_event_overview
- get_event_readiness
- get_follow_up_queue
- get_attribution_summary
- get_recent_changes
- get_system_health

### v0.1 draft tools
- draft_daily_brief
- draft_follow_up_message
- draft_campaign_brief

### No v0.1 write tools
No database mutation, outbound messages, scheduling, publishing, deletion, or bulk operations.

## Data strategy

### First prototype mode
Use deterministic fixture data shaped like the real RSVP adapter response.

### Second prototype mode
Connect read-only to the existing redacted RSVP summary adapter.

### Production data rule
- no email, phone, surname, child name, school, health information, or private notes in model context;
- no second RSVP database;
- no direct browser access to privileged Supabase credentials;
- tenant and event scope injected server-side.

## Observability

Record each assistant run:
- tenant;
- user;
- event;
- session;
- onboarding stage;
- provider and model;
- prompt category;
- tools called;
- records accessed;
- latency;
- token usage and estimated cost where available;
- cache use;
- policy decisions;
- errors and retries;
- draft or action status.

Client-facing activity should be translated into plain language. Raw traces remain admin-only.

## 90-day capability ladder

### Stage 1: Understand
- dashboard;
- read-only assistant;
- daily briefing;
- source attribution;
- alerts.

### Stage 2: Prepare
- follow-up drafts;
- campaign briefs;
- flyer and social copy drafts;
- Spanish adaptations.

### Stage 3: Confirm small actions
- lead assignments;
- status changes;
- notes;
- follow-up dates;
- alert acknowledgements.

### Stage 4: Approved automation
- morning brief;
- stale-lead alerts;
- supply-gap alerts;
- weekly attribution report.

### Stage 5: Expanded ownership
- BYOK;
- optional Telegram or voice;
- advanced workflow unlocks;
- self-managed handoff or continued managed service.

## Prototype acceptance criteria

- separate app and deployment from all live ASC3ND public properties;
- responsive at 375, 768, and 1280 pixels;
- Overview, Leads, Campaigns, Alerts, and Ask ASC3ND screens work with fixtures;
- assistant answers are visibly grounded and source-labeled;
- off-topic prompts are redirected;
- campaign generation requires structured inputs;
- outputs are limited to one recommendation and one alternate;
- every generated artifact is labeled unapproved;
- no write-capable or outbound tool exists;
- provider can be changed server-side without changing the client UI;
- observability trace is produced for every run;
- no production landing-page code is changed.

## Build order

1. Scaffold standalone prototype app.
2. Implement fixture data contract.
3. Build the five-screen shell.
4. Add deterministic assistant-response simulator.
5. Add ThePopeBot gateway adapter behind a feature flag.
6. Add scoped agent files and policy enforcement.
7. Add observability ledger.
8. Connect the read-only RSVP adapter.
9. Run usability test with ASC3ND stakeholders.
10. Decide what to integrate into the live workbook after approval.
