# GATES

## G1 — Product identity
CLAIM: root product documentation identifies UJIMA as product and ASC3ND as client.
ORACLE: inspect README.md, AGENTS.md, REPO_SCOPE.md, CONTEXT.md.
EXPECTED: no root claim that ASC3ND is the reusable product.
STATUS: pending verification.

## G2 — Deployment contract
CLAIM: Netlify build no longer hardcodes ASC3ND API/tenant as UJIMA defaults.
ORACLE: inspect netlify.toml.
EXPECTED: generic UJIMA product/default-tenant variables only.
STATUS: pending verification.

## G3 — Repository guard compatibility
CLAIM: legacy internal package identifier remains aligned across package.json, repo-boundary.json and deployment-lock.json.
ORACLE: CI `npm run build` / prebuild guard.
EXPECTED: PASS.
STATUS: pending CI.

## G4 — Public build
CLAIM: exact PR revision builds successfully.
ORACLE: GitHub CI.
EXPECTED: build job passes.
STATUS: pending CI.

## G5 — Production
CLAIM: exact merged revision is deployed to the existing Netlify site and primary public journey responds.
ORACLE: Netlify deploy record + live HTTP/browser proof.
EXPECTED: ready deploy and reachable UJIMA public URL.
STATUS: pending release.
