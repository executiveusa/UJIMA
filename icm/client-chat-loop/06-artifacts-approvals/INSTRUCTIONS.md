# Slice 06 Instructions

1. Keep the public ASC3ND frontend frozen.
2. Reuse the existing artifact registry, approval lifecycle, RBAC, browser-session auth, and `/ops` approval surface.
3. Show only artifacts explicitly linked to the active tenant mission.
4. Keep artifact content access authenticated and confined to the tenant data root.
5. Use one durable approval record as the shared source of truth for client chat and `/ops`.
6. Approval is authorization only. It must not trigger publish/send/pay/submit/deploy/destructive execution.
7. Preserve owner/operator/reviewer RBAC; red approval remains owner-only.
8. Legacy `Needs you` missions must remain actionable without rewriting their historical mission event.
9. Export mission artifact and approval references for portable recovery.
10. Merge only after exact-head tests, full CI, boundary guard, fresh independent review, and rollback proof pass.
