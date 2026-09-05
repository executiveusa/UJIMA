# VERIFY

## Exact code revision
`5266d36df9df9d975e05edfca60f696961eaad1f`

## Independent machine gates
- Repository Boundary Guard: PASS.
- CI run `33963853004`: PASS.
- Tests: PASS.
- Production build: PASS.
- missionctl doctor: PASS.
- Secret audit: PASS.
- Generated-file audit: PASS.
- Test-discovery audit: PASS.
- OpenSpec task audit: PASS.
- Bundle smoke: PASS.
- AdamsReview gate: PASS.

## Reproducible release artifact
UJIMA Source Bundle run `33963852999`: PASS.

Artifact: `9968791746`  
Name: `ujima-source-5266d36df9df9d975e05edfca60f696961eaad1f`  
Digest: `sha256:56e861e1cd6dd2005c1a0acee73864139657e52a7005f6e81732015b1bac9c21`

The artifact `REVISION` file exactly matches the code revision. Its built Next.js output contains UJIMA OS homepage content and built `/login` and `/workspaces` pages. A targeted runtime-source scan found no exact legacy product-brand strings `Asc3nd Social Purpose OS`, `ASC3ND Social Purpose OS`, `Seattle Social Purpose OS`, `Mission OS`, or `Agenix` in `apps/site` and `packages/core/src` outside generated build output.

ASC3ND references intentionally remain where they identify Client 01, tenant data, client tests, or historical evidence.

## Netlify
Site ID: `9ebe01e5-21cf-492d-a091-29dad057f91d`  
Project: `ujima-os`  
Public URL: `https://ujima-os.netlify.app`  
Project state: current  
Visitor password: disabled  
Team SSO requirement: disabled

The connector confirms site/project/configuration state, but does not expose a current deploy object with the exact source SHA. Therefore source/build verification is strong; exact production provenance remains unproven.
