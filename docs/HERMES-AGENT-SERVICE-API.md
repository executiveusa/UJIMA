# Hermes Agent Service API — Mission OS v0.6

## Overview

The Hermes Agent Service API is the machine-to-machine surface that Hermes agent workers call to interact with Mission OS. All state, events, artifacts, approvals, and budgets are owned by Mission OS. Hermes is a managed worker that reads context from Mission OS and writes outcomes back through this API.

In Phase 9A this API is dry-run only. No live Hermes execution occurs. The routes exist, auth is enforced, tenant boundaries are enforced, and policy blocks are enforced. Live Hermes execution requires a Phase 9B VPS deployment.

## Base path

```
/api/agent
```

## Auth requirement

All endpoints require an operator key in the `Authorization: Bearer <key>` header.

Key format: `ok_<tenantId>_<hex>`

The key is validated by SHA-256 hash lookup against the tenant's stored key. Raw keys are never logged. Raw keys are never returned in responses. The tenant derived from the key is the only tenant accessible on each request — cross-tenant access is not possible.

Hermes must use a dedicated operator key (role: `operator` or `owner`) created for agent use:

```bash
node missionctl/missionctl.mjs operator-key create demo-pnw --label hermes-agent
```

## Tenant boundary

Every request is tenant-scoped to the operator key. For URL-param endpoints (`/context/:tenantId`, `/policy/:tenantId`), the URL param must match the key's tenant or the request is rejected with 403.

## Hard blocks (always blocked, regardless of auth)

These action types are permanently blocked at the policy layer:

| Action type | Block reason |
|---|---|
| `GRANT_SUBMISSION` | No automatic grant submission |
| `LEGAL_FINANCIAL_FILING` | No automatic legal or financial filing |
| `OUTBOUND_MESSAGE` | No automatic outbound to donor/youth/family |
| `PUBLIC_PUBLISHING` | No public publishing without human approval |
| `UNRESTRICTED_EXECUTION` | No unrestricted shell/browser execution |
| `CROSS_TENANT_ACCESS` | No cross-tenant data access |

Self-approval is prohibited: Hermes cannot approve its own approval requests.

## Endpoints

---

### GET /api/agent/context/:tenantId

**Purpose:** Return safe tenant context for Hermes to orient itself before a run.

**Auth:** Operator key. tenantId in URL must match key's tenant.

**Request:** No body.

**Response:**
```json
{
  "ok": true,
  "tenantId": "demo-pnw",
  "icm": {
    "workspacePath": "icm/tenants/demo-pnw",
    "stages": [
      { "type": "dir", "path": "stages/01_onboarding" },
      { "type": "file", "path": "stages/01_onboarding/CONTEXT.md" }
    ]
  },
  "policy": {
    "hardBlocks": ["GRANT_SUBMISSION", "LEGAL_FINANCIAL_FILING", "OUTBOUND_MESSAGE", "PUBLIC_PUBLISHING", "UNRESTRICTED_EXECUTION", "CROSS_TENANT_ACCESS"],
    "orangeRequired": ["social", "email-draft", "outbound"],
    "selfApprovalProhibited": true
  },
  "budgets": {
    "monthlyBudgetUsd": 50,
    "warningThresholdPct": 0.8,
    "hardBlockThresholdPct": 1.0
  },
  "capabilities": ["read_context", "create_run", "emit_event", "register_artifact", "register_asset", "request_approval"],
  "redaction": {
    "alwaysRedact": ["secret", "password", "token", "key", "jwt", "credential"],
    "noRawKeysInResponse": true
  },
  "mode": "dry-run"
}
```

**No secrets.** Profile, keys, and raw credentials are never included.

**Approval/policy behavior:** If ICM workspace is not initialized, stages array is empty. Hermes should call `missionctl icm init <tenantId>` first.

**Dry-run behavior:** Returns context from disk. No live model calls or Hermes connection.

**What becomes live later:** In Phase 9B, Hermes can cache this context per session. The response shape is stable.

---

### GET /api/agent/policy/:tenantId

**Purpose:** Return the full approval policy and permanently blocked action list for the tenant.

**Auth:** Operator key. tenantId in URL must match key's tenant.

**Request:** No body.

**Response:**
```json
{
  "ok": true,
  "tenantId": "demo-pnw",
  "hardBlocks": ["GRANT_SUBMISSION", "LEGAL_FINANCIAL_FILING", "OUTBOUND_MESSAGE", "PUBLIC_PUBLISHING", "UNRESTRICTED_EXECUTION", "CROSS_TENANT_ACCESS"],
  "riskGates": {
    "green": "allowed — dry-run queued",
    "yellow": "allowed — draft/artifact mode",
    "orange": "blocked — approval required",
    "red": "blocked — restricted approval required"
  },
  "selfApprovalProhibited": true,
  "approvalClasses": {
    "orange": "Human review required. Approver role: operator or owner.",
    "red": "Human review required. Approver role: owner only."
  },
  "mode": "dry-run"
}
```

**Approval/policy behavior:** All hard blocks are permanently enforced. Hermes reads this before deciding which action types to attempt.

**Dry-run behavior:** Returns static policy. In Phase 9B this may include tenant-specific policy overrides from `_config/safety-policy.md`.

---

### POST /api/agent/runs

**Purpose:** Create a dry-run agent run record. Hermes calls this at the start of each task.

**Auth:** Operator key.

**Request:**
```json
{
  "agentSlug": "hermes-programs",
  "stage": "02_opportunity_scan",
  "task": "Summarize current grant opportunities for youth sports.",
  "riskClass": "green",
  "traceId": "trc_optional_langfuse_trace_id"
}
```

Required fields: `agentSlug`, `task`, `riskClass`.

**Response (green/yellow — queued):**
```json
{
  "ok": true,
  "run": {
    "id": "arn_a1b2c3d4e5f6a7b8",
    "tenantId": "demo-pnw",
    "agentSlug": "hermes-programs",
    "stage": "02_opportunity_scan",
    "task": "Summarize current grant opportunities for youth sports.",
    "riskClass": "green",
    "status": "queued",
    "mode": "dry-run",
    "traceId": "trc_...",
    "createdAt": "2026-07-03T00:00:00.000Z"
  }
}
```

**Response (orange/red — blocked):**
```json
{
  "ok": false,
  "error": {
    "code": "APPROVAL_REQUIRED",
    "message": "Run blocked: risk class orange requires human approval. Use POST /api/agent/approvals/request first."
  }
}
```

**Approval/policy behavior:** Orange and red risk classes return 403. Hermes must create an approval record first and wait for a human to approve it.

**Dry-run behavior:** All passing runs are stored with `status: queued, mode: dry-run`. No live model calls, no live Hermes dispatch.

**What becomes live later:** Phase 9B replaces the dry-run body with live Hermes dispatch via the worker runtime.

---

### POST /api/agent/events

**Purpose:** Append a typed event to the tenant's event journal during or after a run.

**Auth:** Operator key.

**Request:**
```json
{
  "runId": "arn_a1b2c3d4e5f6a7b8",
  "type": "CONTEXT_LOADED",
  "payload": {
    "stage": "02_opportunity_scan",
    "filesLoaded": 3
  }
}
```

Required fields: `type`. `runId` is recommended.

**Response:**
```json
{
  "ok": true,
  "event": {
    "id": "evt_...",
    "tenantId": "demo-pnw",
    "type": "AGENT.CONTEXT_LOADED",
    "actor": "hermes",
    "subject": "arn_...",
    "createdAt": "..."
  }
}
```

**Approval/policy behavior:** Sensitive keys in payload are auto-redacted before storage. Raw secrets are never written to the event journal.

**Dry-run behavior:** Events are written to `mission-data/<tenantId>/events.jsonl`.

---

### POST /api/agent/artifacts

**Purpose:** Register an artifact produced during a run through the existing artifact registry.

**Auth:** Operator key.

**Request:**
```json
{
  "runId": "arn_...",
  "kind": "grant-draft",
  "title": "King County Housing Grant — Draft",
  "storagePath": "stages/03_grant_application/output/kc-housing-2026.md",
  "approvalClass": "orange",
  "mimeType": "text/markdown"
}
```

Required fields: `kind`, `title`, `storagePath`.

**Response:**
```json
{
  "ok": true,
  "artifact": {
    "id": "art_...",
    "tenantId": "demo-pnw",
    "runId": "arn_...",
    "kind": "grant-draft",
    "title": "King County Housing Grant — Draft",
    "storagePath": "stages/03_grant_application/output/kc-housing-2026.md",
    "approvalClass": "orange",
    "approvalStatus": "pending",
    "createdAt": "..."
  }
}
```

**Approval/policy behavior:** Artifacts with `approvalClass: orange` or `red` are stored with `approvalStatus: pending`. They are not published or submitted automatically.

**Dry-run behavior:** Artifact record is stored in `mission-data/<tenantId>/artifacts.json`. No binary upload in this gate.

---

### POST /api/agent/assets

**Purpose:** Register generated asset metadata (image, document, data export) without binary upload. Assets are stored as artifacts with `kind: asset`.

**Auth:** Operator key.

**Request:**
```json
{
  "runId": "arn_...",
  "title": "Youth Program Outcome Chart — Q2 2026",
  "mimeType": "image/png",
  "storagePath": "stages/07_outcome_logging/output/outcome-chart-q2.png",
  "approvalClass": "green"
}
```

Required fields: `title`, `storagePath`.

**Response:**
```json
{
  "ok": true,
  "asset": {
    "id": "art_...",
    "tenantId": "demo-pnw",
    "kind": "asset",
    "title": "Youth Program Outcome Chart — Q2 2026",
    "storagePath": "stages/07_outcome_logging/output/outcome-chart-q2.png",
    "approvalClass": "green",
    "approvalStatus": "approved",
    "createdAt": "..."
  }
}
```

**Approval/policy behavior:** Same as artifacts. Orange/red assets require human approval before use.

**Dry-run behavior:** No binary upload. Metadata only.

---

### POST /api/agent/approvals/request

**Purpose:** Create an approval request for a risky action. Hermes cannot approve its own requests.

**Auth:** Operator key.

**Request:**
```json
{
  "runId": "arn_...",
  "action": "OUTBOUND_MESSAGE",
  "riskClass": "orange",
  "payload": {
    "recipient": "donor-list",
    "draft": "Thank you for your support..."
  }
}
```

Required fields: `action`, `riskClass`.

**Response:**
```json
{
  "ok": true,
  "approval": {
    "id": "app_...",
    "tenantId": "demo-pnw",
    "actionType": "OUTBOUND_MESSAGE",
    "approvalClass": "orange",
    "status": "draft",
    "requester": "hermes",
    "approver": null,
    "createdAt": "..."
  }
}
```

**Self-approval prohibition:** Hermes (the requester) is stored as `requester: "hermes"`. The approval lifecycle requires a human operator or owner to approve. Hermes cannot call the approval endpoint for its own approval records.

**Hard block behavior:** Permanently blocked action types (`GRANT_SUBMISSION`, `LEGAL_FINANCIAL_FILING`, etc.) are rejected even with an approval record.

**Dry-run behavior:** Approval is stored in `mission-data/<tenantId>/approvals.json`. No email notifications in this gate.

---

### POST /api/agent/runs/:id/complete

**Purpose:** Mark an agent run as completed and attach artifact and trace IDs.

**Auth:** Operator key.

**Request:**
```json
{
  "status": "completed",
  "artifactIds": ["art_abc123"],
  "traceIds": ["trc_xyz789"]
}
```

Required fields: `status`. Allowed status values: `completed`, `failed`, `cancelled`.

**Response:**
```json
{
  "ok": true,
  "run": {
    "id": "arn_...",
    "tenantId": "demo-pnw",
    "status": "completed",
    "artifactIds": ["art_abc123"],
    "traceIds": ["trc_xyz789"],
    "completedAt": "..."
  }
}
```

**Approval/policy behavior:** Run completion does not approve or execute any artifacts. Those remain in their current approval state.

**Dry-run behavior:** Updates the run record in `mission-data/<tenantId>/agent-runs.json`.

---

### GET /api/agent/runs/:id

**Purpose:** Read one agent run record.

**Auth:** Operator key.

**Response:** Same shape as the run object above.

**Tenant boundary:** Hermes can only read runs belonging to its key's tenantId.

---

### GET /api/agent/assets/:id

**Purpose:** Read metadata for one asset/artifact by ID.

**Auth:** Operator key.

**Response:**
```json
{
  "ok": true,
  "asset": {
    "id": "art_...",
    "tenantId": "demo-pnw",
    "kind": "asset",
    "title": "...",
    "storagePath": "...",
    "approvalClass": "green",
    "approvalStatus": "approved",
    "createdAt": "..."
  }
}
```

**Tenant boundary:** Only returns assets belonging to the key's tenantId.

---

## Error shape

All errors follow:

```json
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }
```

Common codes: `MISSING_KEY`, `FORBIDDEN`, `CROSS_TENANT`, `NOT_FOUND`, `APPROVAL_REQUIRED`, `POLICY_BLOCKED`, `AGENT_ERROR`.

## What becomes live in Phase 9B

| Now (dry-run) | Phase 9B (live) |
|---|---|
| Run stored with `mode: dry-run` | Live Hermes dispatch via worker runtime |
| Events in JSONL file | Events may also emit to Langfuse |
| No live model calls | LiteLLM routing with budget enforcement |
| No binary asset upload | Asset upload to configured storage backend |
| No approval email | Approval notifications to operator via configured channel |

## Known limitations in Phase 9A

- All runs are `mode: dry-run`. Hermes is not called.
- Budget enforcement is read-only (no live spend tracking).
- Approval workflow is file-backed (no email/webhook notifications).
- No binary upload for assets.
- No pagination on list endpoints.
