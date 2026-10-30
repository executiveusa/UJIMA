# Groundwork Client Brain Architecture — ASC3ND Reference Implementation

## Objective

Give ASC3ND one understandable AI-assisted operating system without exposing the client to UJIMA internals, model routing, agent swarms, infrastructure, or developer tools.

The client experience should feel like:

```text
Ask Instinct
  -> understand the organization
  -> check the relevant facts and evidence
  -> do or prepare the work
  -> ask for approval when authority is required
  -> return proof and the next action
```

## Ownership model

### UJIMA

UJIMA is the operator/company system used by Macs Digital Media / the delivery team.

UJIMA owns reusable:

- Groundwork stages
- readiness audits
- approval laws
- agent routing
- evidence rules
- client orchestration
- reusable nonprofit operating doctrine
- managed-agent support procedures
- service delivery metrics

ASC3ND-specific private information must not become a UJIMA product default.

### Private ASC3ND client-brain repository

Create a **private, client-owned repository** for ASC3ND.

Recommended repository name:

`asc3nd-client-brain`

Do not use the public brand-site repo as the client brain.

Do not use the public UJIMA repo for private founder information.

Recommended top-level structure:

```text
/
  AGENT.md
  CONTEXT.md
  CLIENT.md
  README.md

  _config/
    mission.md
    brand.md
    voice.md
    safety-policy.md
    approval-policy.md
    model-routing.md
    account-ownership.md
    grant-criteria.md

  truth/
    organization.md
    legal-status.md
    leadership.md
    programs.md
    audiences.md
    claims-register.md
    unknowns.md
    provenance.md

  presence/
    website.md
    search.md
    google.md
    candid.md
    social.md
    directories.md
    analytics.md

  brand/
    protected-assets.md
    asset-manifest.md
    visual-system.md
    content-rules.md

  funding/
    readiness.md
    funder-profile.md
    grant-evidence.md
    opportunities/
    applications/

  events/
    community-cuts/
      record.md
      evidence.md
      outcomes.md
      credits.md
      media-manifest.md

  operations/
    calendar.md
    approvals.md
    publishing.md
    measurement.md
    backup-recovery.md

  agents/
    instinct-otha.md
    instinct-elisha.md
    shared-guardrails.md
    tools.md
    subagents.md

  evidence/
    receipts/
    audits/
    screenshots/
    source-register.md

  stages/
    00_intake_truth/
    01_identity/
    02_trust/
    03_presence/
    04_brand/
    05_funding/
    06_content/
    07_operations/
    08_training_handoff/
    09_go_live_readiness/
```

## What belongs in Git

Safe for Git when access is properly restricted:

- approved organizational facts;
- approved public copy;
- policy and workflow documents;
- asset manifests;
- evidence references;
- source provenance;
- non-secret account ownership metadata;
- agent instructions;
- approval laws;
- grant-readiness facts;
- audit receipts;
- public-profile status.

## What never belongs in Git

- passwords;
- recovery codes;
- API keys;
- OAuth tokens;
- browser sessions/cookies;
- banking details;
- sensitive youth/family information;
- unnecessary personal founder data;
- private tax records unless separately encrypted and access-controlled;
- raw identity documents.

Secrets belong in a dedicated secrets manager or provider vault.

## Instinct model

ASC3ND receives two founder-facing Instinct agents:

- Otha Instinct
- Elisha Instinct

They may have personal preferences and separate private working context, but both inherit the same ASC3ND cause/organization guardrails.

### Loyalty definition

"Loyal to the cause" must mean:

- protect ASC3ND's verified mission and stated values;
- protect youth, families, dignity, consent, and privacy;
- protect organization truth from invented claims;
- preserve founder authority and documented governance;
- surface conflicts rather than manipulate either founder;
- refuse instructions that would knowingly falsify records, violate consent, bypass approvals, or materially harm the organization;
- never treat the agent's own continuity, vendor preference, or automation goal as more important than the humans or mission.

The agent is an assistant and fiduciary-like workflow helper, not an autonomous corporate officer.

## Shared approval classes

### Green — may prepare/execute under standing permission

Examples:

- research public information;
- organize approved documents;
- draft internal notes;
- audit website/search/profile status;
- prepare content drafts;
- prepare grant-opportunity summaries;
- produce checklists and evidence reports.

### Yellow — prepare, then require human review

Examples:

- social copy;
- public website copy changes;
- partner outreach drafts;
- grant drafts;
- public organization profile changes;
- analytics/configuration changes.

### Orange — explicit authorized-person approval required

Examples:

- publishing to organization channels;
- submitting grant applications;
- changing profile/legal/tax representations;
- creating consequential external accounts;
- sending donor/partner communications;
- modifying production integrations.

### Red — no autonomous execution

Examples:

- banking/funds movement;
- legal certifications/signatures;
- board votes;
- tax filings;
- changing governance;
- deleting evidence/backups;
- bypassing youth consent;
- destructive account/domain ownership transfers.

## Paperclip role

Paperclip may supervise tasks, subagents, budgets, approvals, and browser-use work.

It is not the source of organizational truth.

The client-brain ICM repository remains the interpretable source for:

- facts;
- mission;
- policy;
- active stage;
- approvals;
- evidence;
- client restrictions.

Paperclip workers receive bounded tasks from that context and return receipts/results.

## TryPost/content role

Social content should flow:

```text
organization objective
-> approved campaign/brief
-> draft
-> media generation/editing
-> human review
-> approved Social Drop
-> TryPost publishing adapter
-> receipt
-> analytics
-> learning
```

TryPost is replaceable infrastructure, not the organization's strategy or memory.

No agent may auto-publish merely because a provider connection exists.

## External-account workflow

For LinkedIn, Facebook, Instagram, Google, Candid, grant portals and similar systems:

1. inventory current ownership/access;
2. verify organization identity;
3. connect through supported OAuth/app integration where possible;
4. never copy reusable passwords into prompts or repositories;
5. record permissions/scopes;
6. require appropriate approval for consequential changes;
7. store a receipt after action;
8. maintain a recovery/ownership map.

## Handoff goal

The founders should not need to understand GitHub, Supabase, MCP, Paperclip, model names, or agent routing.

Their normal workflow should be:

```text
Ask -> Review when needed -> Approve -> Receive proof
```

The technical system must remain portable so ASC3ND can change model/provider/operator later without losing its organizational memory.
