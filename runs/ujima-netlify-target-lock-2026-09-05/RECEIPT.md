# UJIMA Netlify Target Lock Receipt

Date: 2026-09-05

## Decision

The canonical public UJIMA frontend is:

- Project: `ujima-ai`
- Site ID: `9b49e86d-7399-4eb2-b6de-d7a360c27bba`
- Public URL: `https://ujima-ai.netlify.app`
- Current deploy ID observed at lock time: `6a9c0088c8059b0008bd97f1`
- Current deploy state observed at lock time: `ready`
- Visitor password: disabled
- Team SSO requirement: disabled

The previously referenced `ujima-os.netlify.app` target is not canonical for UJIMA and is explicitly forbidden by `deployment-lock.json`.

## Netlify environment written

The canonical site was configured with:

- `PUBLIC_SITE_URL=https://ujima-ai.netlify.app`
- `NEXT_PUBLIC_UJIMA_PRODUCT=ujima`
- `NEXT_PUBLIC_UJIMA_DEFAULT_TENANT=public`

## Canonical truth owners updated

- `deployment-lock.json`
- `ICMR.yaml`
- `README.md`

## Release law

Any future deployment or release automation must fail closed when the Netlify site ID or public URL does not match the canonical values above.

Historical ASC3ND/client deployment records may preserve older site IDs as historical evidence; they do not override this product-level deployment lock.
