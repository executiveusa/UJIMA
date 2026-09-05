# GATES

## G1 — Product identity
CLAIM: root product documentation and public/operator runtime identify UJIMA as the product and ASC3ND as Client 01.
ORACLE: README.md, AGENTS.md, CONTEXT.md, ICMR.yaml, docs/UJIMA-ARCHITECTURE.md, exact source/built artifact inspection.
EXPECTED: no reusable-product claim that ASC3ND, Mission OS, Social Purpose OS, or Agenix is the current product identity.
STATUS: PASS on code revision `5266d36df9df9d975e05edfca60f696961eaad1f`.

## G2 — Deployment contract
CLAIM: Netlify build no longer hardcodes ASC3ND API/tenant as UJIMA defaults.
ORACLE: netlify.toml + Netlify project environment.
EXPECTED: UJIMA product variables and neutral `public` default tenant.
STATUS: PASS. Netlify site `9ebe01e5-21cf-492d-a091-29dad057f91d`, project `ujima-os`; env confirms `NEXT_PUBLIC_UJIMA_PRODUCT=ujima`, `NEXT_PUBLIC_UJIMA_DEFAULT_TENANT=public`, `PUBLIC_SITE_URL=https://ujima-os.netlify.app`.

## G3 — Repository guard compatibility
CLAIM: legacy internal package identifier remains aligned across package.json, repo-boundary.json and deployment-lock.json while public product identity is UJIMA.
ORACLE: Repository Boundary Guard + CI.
EXPECTED: PASS.
STATUS: PASS on revision `5266d36df9df9d975e05edfca60f696961eaad1f`.

## G4 — Exact public build
CLAIM: exact merged code revision builds successfully and produces the expected UJIMA pages.
ORACLE: GitHub CI run `33963853004`; UJIMA Source Bundle run `33963852999`; artifact `9968791746`.
EXPECTED: tests/build/doctor/audits PASS; REVISION receipt equals merged SHA; built `/`, `/login`, `/workspaces` exist.
STATUS: PASS. Artifact digest `sha256:56e861e1cd6dd2005c1a0acee73864139657e52a7005f6e81732015b1bac9c21` and REVISION=`5266d36df9df9d975e05edfca60f696961eaad1f`.

## G5 — Production provenance
CLAIM: exact merged revision is the revision serving from the existing Netlify public URL and the primary public journey responds.
ORACLE: Netlify deploy record that exposes exact source revision + live HTTP/browser proof.
EXPECTED: ready deployment tied to exact SHA and reachable UJIMA public journey.
STATUS: BLOCKED BY ORACLE. Netlify confirms project `ujima-os`, site ID, current state and public URL, but the available connector does not expose the current deploy revision; direct HTTP/browser verification is unavailable in this execution environment. No production-verification claim is made.
