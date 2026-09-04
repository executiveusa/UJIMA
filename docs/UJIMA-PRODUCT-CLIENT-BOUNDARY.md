# Ujima OS — Product / Client Boundary

## Decision

Ujima OS is a standalone product owned and operated independently of every client organization.

ASC3ND is Client 01. It is not the product, product owner, canonical brand, deployment target, or default product tenant.

## Hard boundary

Changes to Ujima must never mutate ASC3ND's public brand repository, public website, DNS, event site, or client data unless a separately scoped ASC3ND client mission explicitly authorizes that change.

The product repository may contain tenant adapters, tenant routing, and tenant-specific ICM/context under isolated client paths, but shared product code must not import client-owned brand/site code.

## Monorepo ownership

```text
Ujima OS monorepo
├── apps/site/                 product landing, auth, workspace shell
├── services/mission-api/     product control plane
├── packages/                 reusable product/runtime packages
├── control-plane/            shared product policy/routing contracts
├── icm/shared/               Ujima shared ICM contracts
├── icm/tenants/
│   └── asc3nd/               Client 01 context only
└── docs/                     product documentation
```

ASC3ND public assets remain outside this product repository in the separate canonical ASC3ND brand repository.

## Runtime rule

Every client request must resolve an authenticated user, organization membership, and tenant/client ID before loading client context or executing a mission.

No client may read another client's conversations, memory, artifacts, missions, approvals, contacts, credentials, or ICM paths.

## UX rule

After sign-in, Ujima shows the user only the workspaces they are authorized to access. Opening ASC3ND places the user inside the ASC3ND workspace, but the surrounding product identity remains Ujima OS.

Ujima internal operations remain a separate operator surface and are never presented as client-owned tools.

## ASC3ND status

- Relationship: client
- Client number: 01
- Tenant ID: `asc3nd`
- ICM home: `icm/tenants/asc3nd/`
- Public brand/site: separate repository, outside Ujima product authority

## Release gate

Reject a change if it:

1. hard-codes ASC3ND as the product identity;
2. makes ASC3ND the default global tenant;
3. imports ASC3ND public-site components into shared Ujima product code;
4. allows a Ujima product deployment to mutate ASC3ND public infrastructure implicitly;
5. bypasses tenant authorization before loading client data;
6. stores client data in a shared path without tenant ownership;
7. makes an internal operator surface visible as a client-owned dashboard.
