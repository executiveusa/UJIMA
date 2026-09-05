# UJIMA OS Repository Scope Law

**Repository:** `executiveusa/UJIMA`

## Sole purpose

This repository owns the reusable, multi-tenant UJIMA operating system:

- goal, workflow, agent-routing, ICM, approval, evidence and audit contracts;
- reusable operator and client workspace capabilities;
- nonprofit operations, CRM, communications, reporting and cross-domain adapters;
- tenant scaffolding, SDKs, deployment handoffs and installation tooling;
- deterministic authority, safety and verification boundaries.

## Product/client boundary

**UJIMA is the product. ASC3ND is Client 01.**

ASC3ND facts may live in tenant-scoped ICM and approved client contracts. They must not become product defaults.

## Explicitly out of scope

Do not add or promote as shared UJIMA defaults:

- the canonical ASC3ND public website or event page;
- client workbook/contract truth;
- ASC3ND brand masters, raw media or private records;
- hidden client-specific databases;
- direct external publication without approval;
- a second orchestrator that duplicates an existing truth owner.

## Existing routed client repositories

| Work type | Correct destination |
|---|---|
| Production ASC3ND public website/event experience | `executiveusa/asc3nd-frontend-website-` |
| ASC3ND workbook/contract/strategy truth | `executiveusa/asce3nd-interactive-document` |
| ASC3ND brand/QR/campaign masters | `executiveusa/asc3nd-brand-kit-` |
| Design demonstrations | `executiveusa/ascend-demonstration-page` |
| Grant-domain implementation | `executiveusa/grant-agent` |
| Reusable UJIMA runtime/workflows/approvals/adapters | `executiveusa/UJIMA` |

## Non-spillover laws

1. Shared product logic remains tenant-neutral.
2. Client facts enter through tenant configuration or approved manifests.
3. No cross-tenant secret, record, media, prompt or output reuse.
4. Consequential external action requires an approval record.
5. One truth has one canonical owner.
6. Browser/computer automation never becomes the orchestrator.
7. Run `npm run guard:repo` before build/deploy work.
