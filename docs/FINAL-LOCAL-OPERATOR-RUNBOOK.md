# Final Local Operator Runbook — Gate 6B0

**Scope:** Local development environment only. No VPS, no live services.
**Gate:** 6B0 — Final local app completion.

---

## Purpose

This runbook covers every local operation an operator can perform before Gate 6B
(live VPS staging). After completing these steps, the system is ready for human VPS
intake and Architect Gate 6B approval.

---

## 1. Initial Setup

### 1.1 Install dependencies
```bash
npm install
```

### 1.2 Start local services
```bash
# API service (port 4000)
npm run dev --workspace=services/mission-api

# Site (port 3000)
npm run dev --workspace=apps/site
```

### 1.3 Seed demo tenant
```bash
node missionctl/missionctl.mjs demo seed demo-pnw
# With reset: node missionctl/missionctl.mjs demo seed demo-pnw --reset-safe
```

---

## 2. Local Validation

### 2.1 Run Gate 6B0 readiness checks
```bash
node scripts/phase9-final-local-readiness.mjs
```
Expected: All F1–F10 checks PASS.

### 2.2 Run Gate 6A readiness checks
```bash
node scripts/phase9-live-staging-readiness.mjs
```
Expected: All L1–L9 checks PASS.

### 2.3 Run full missionctl smoke
```bash
node missionctl/missionctl.mjs bundle smoke demo-pnw
```
Expected: All hard-gated checks pass.

### 2.4 Run unit tests
```bash
npm test
```
Expected: All tests pass.

### 2.5 Verify final-local state
```bash
node missionctl/missionctl.mjs final-local verify demo-pnw --dry-run
```

---

## 3. Action Dispatcher

The action dispatcher (`packages/core/src/action-dispatcher.js`) is the central
pipeline for all outbound action attempts. It enforces:

- Policy evaluation (hard blocks, approval classes)
- Dry-run mode (default)
- Approval gating for orange/red actions
- External mode guard (`GATE_6B_LIVE_APPROVED` required)
- Adapter dispatch
- Audit event emission

### 3.1 Dispatching in dry-run mode (default)
```javascript
import { dispatch } from '@asc3nd/core/action-dispatcher';

const result = await dispatch({
  tenantId: 'demo-pnw',
  actionType: 'postiz_schedule',
  actionPayload: { platform: 'linkedin', content: 'Hello world' },
  requestedBy: 'operator',
});
// result.state === 'DRY_RUN'
```

### 3.2 Audit-only dispatch
```javascript
import { auditOnlyDispatch } from '@asc3nd/core/action-dispatcher';

const result = await auditOnlyDispatch({
  tenantId: 'demo-pnw',
  actionType: 'postiz_schedule',
});
// Logs policy evaluation; no adapter called.
```

---

## 4. Ops Dashboard Pages

After starting the site, visit:

| Page | URL | Purpose |
|---|---|---|
| Readiness | `/ops/readiness` | Gate 6B pre-flight status |
| Actions | `/ops/actions` | Action audit log |
| Approvals | `/ops/approvals` | Approval queue |
| Backups | `/ops/backups` | Backup drill |

The Readiness page shows which Gate 6B items require human VPS intake. All
VPS-dependent checks will show FAIL until human provides intake data.

---

## 5. Backup Drill

Run before Gate 6B to verify local data can be snapshotted:

```bash
# Via missionctl
node missionctl/missionctl.mjs backup demo-pnw

# Via ops dashboard
# Navigate to /ops/backups → click "Run local backup drill"
```

Verify the backup exists in `backups/demo-pnw/`.

---

## 6. Storage Mode Check

Current storage mode defaults to `json` (file-backed). Postgres is not connected locally.
This is expected at Gate 6B0.

```bash
# Check current mode
MISSION_STORAGE=json node -e "import('@asc3nd/core/storage-factory').then(m => console.log(m.storageStatusSummary()))"
```

Production will use `DATABASE_URL` + `STORAGE_MODE=postgres`.

---

## 7. Safety Reminders

- Do not set `GATE_6B_LIVE_APPROVED=true` until Architect approves Gate 6B.
- Do not commit `.env` files containing real secrets.
- Do not SSH to any VPS.
- Do not run Docker commands against remote hosts.
- All 6 hard-block action types cannot be enabled by any configuration change.

---

## 8. Handoff to Gate 6B

When Gate 6B0 is verified complete:

1. Human fills `docs/GATE-6B-HUMAN-INTAKE-PACKET.md` with real VPS details.
2. Human fills `docs/VPS-DOMAIN-INTAKE-FORM.md` (all 9 sections).
3. Request Architect approval for Gate 6B.
4. Architect sets `GATE_6B_LIVE_APPROVED=true` on the VPS environment only.
5. Execute `docs/DEPLOYMENT-DAY-RUNBOOK.md` steps.
