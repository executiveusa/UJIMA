# Slice 05 — Durable Client Work States — INSTRUCTIONS

1. Preserve repository and tenant boundaries.
2. Reuse the existing event journal and mission envelope; do not add a second mission database.
3. Implement the minimum durable state machine required by the acceptance ledger.
4. Separate internal execution state from the five client-visible states.
5. Treat browser state as a projection only; reload must reconstruct from durable records.
6. Fail closed on invalid transitions, cross-tenant/user access, and approval bypass.
7. Keep public ASC3ND frontend untouched.
8. Add focused tests before broadening behavior.
9. Run targeted regression, repository boundary, build, and full CI.
10. Require a fresh independent review before merge. Builder cannot approve itself.
