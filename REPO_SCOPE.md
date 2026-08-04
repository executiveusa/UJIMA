# ASC3ND Social Purpose OS Repository Scope Law

**Repository:** `executiveusa/ascend-social-purpose-agentic-systems-`

## Sole purpose

This repository owns the reusable, multi-tenant social-purpose operating system:

- agent routing, ICM workspaces, durable workflows, approvals, policies, and audit logs;
- reusable operations-console capabilities;
- Postiz, communications, CRM, grant, reporting, and external-service adapters;
- tenant scaffolding, deployment handoffs, SDKs, and platform tests;
- deterministic safety boundaries for youth data, publishing, money, legal, and external communication.

## Explicitly out of scope

Do not add or promote:

- the canonical ASC3ND public event page or evergreen website;
- client-approved workbook answers or contract records as platform defaults;
- ASC3ND logo masters, QR masters, flyers, social exports, or raw interview footage;
- experimental Awwwards redesigns;
- a client-specific RSVP database hidden inside platform code;
- direct public publishing without approval.

## Required routing

| Work type | Correct repository |
|---|---|
| Production ASC3ND website or Community Cuts page | `executiveusa/asc3nd-frontend-website-` |
| Client answers, contract, strategy workbook | `executiveusa/asce3nd-interactive-document` |
| Brand masters, QR and campaign templates | `executiveusa/asc3nd-brand-kit-` |
| Visual redesign demonstrations | `executiveusa/ascend-demonstration-page` |

Agent response when routing:

```text
REPOSITORY_BOUNDARY_STOP
Requested work: <summary>
Current repository: executiveusa/ascend-social-purpose-agentic-systems-
Reason it does not belong here: <reason>
Correct destination: <repository>
Integration contract needed: <API/schema/package/artifact>
```

## Non-spillover laws

1. Platform logic must remain reusable and tenant-neutral.
2. Client facts enter through tenant configuration or approved manifests, never by hardcoding them into shared defaults.
3. No cross-tenant record, secret, media file, prompt, or output may be reused.
4. Public publishing and external communication require explicit approval records.
5. A frontend may call the platform through a documented contract; it must not absorb the platform implementation.
6. This repository is not authorized to deploy as the ASC3ND event or evergreen public site.
7. Every agent must read `repo-boundary.json` and run `npm run guard:repo` before build or deployment work.
