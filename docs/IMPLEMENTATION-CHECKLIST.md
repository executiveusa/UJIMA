# Implementation Checklist — Mission OS v0.6

**Audience:** Operator executing a new client deployment  
**Purpose:** Step-by-step checklist for implementing Mission OS for a new organization  
**What is not here:** Steps that require live VPS (those are marked [PHASE 9])

---

## Phase 8 (current build) — Control plane ready

These are complete in the current build and do not require additional work for a new client:

- [x] Core security gates: `scripts/secret-audit.mjs`, `scripts/generated-file-audit.mjs`
- [x] CI pipeline: `.github/workflows/ci.yml` runs without external secrets
- [x] Ops dashboard: `/ops` routes functional with same-origin proxy
- [x] Approval lifecycle: file-backed, orange/red hard-blocked
- [x] Model budget ledger and billing export
- [x] Deployment lifecycle: bundle up, upgrade, rollback, backup, restore (dry-run)
- [x] Backup creation and restore with path-traversal guard
- [x] Operator key management with scope-based RBAC
- [x] Tenant isolation: path guard, cross-tenant access blocked
- [x] Test suite: 319/319 passing
- [x] Bundle smoke: 70/70 checks passing
- [x] Documentation: all Phase 8 docs created

---

## New tenant setup (runs per client, no VPS required)

### Step 1: Create tenant

```bash
node missionctl/missionctl.mjs tenant create <slug> --org "<org name>"
```

Confirm: `mission-data/<slug>/` directory created with initial state.

### Step 2: Generate agent pack

```bash
node missionctl/missionctl.mjs pack generate <slug>
node missionctl/missionctl.mjs pack validate <slug>
```

Confirm: 33 pack files generated and validated.

### Step 3: Provision Hermes

```bash
node missionctl/missionctl.mjs hermes provision <slug>
```

Confirm: Hermes config files created in `handoff/<slug>/managed/hermes/`.

### Step 4: Sync configuration

```bash
node missionctl/missionctl.mjs litellm sync <slug>
node missionctl/missionctl.mjs langfuse sync <slug>
node missionctl/missionctl.mjs openwebui sync <slug>
```

### Step 5: Generate bundle

```bash
node missionctl/missionctl.mjs bundle up <slug> --dry-run
```

Confirm: Bundle files generated in `handoff/<slug>/managed/`. Files are gitignored.

### Step 6: Smoke test

```bash
node missionctl/missionctl.mjs bundle smoke <slug> --dry-run
```

Expected: 70/70 checks pass. If any fail, do not proceed.

### Step 7: Set model budget

```bash
node missionctl/missionctl.mjs model budget set <slug> --monthly-usd <amount>
```

Set to the agreed monthly AI budget for the client.

### Step 8: Create operator keys

```bash
node missionctl/missionctl.mjs operator-key create --tenant <slug> --label "primary-staff"
node missionctl/missionctl.mjs operator-key create --tenant <slug> --label "backup-staff"
```

Store raw keys securely. They cannot be recovered after creation — only hashes are stored.

### Step 9: Validate security gates

```bash
node scripts/secret-audit.mjs
node scripts/generated-file-audit.mjs
node scripts/test-discovery-audit.mjs
node scripts/verify-v06.mjs
```

All must pass before any deployment or handoff.

### Step 10: Initial backup

```bash
node missionctl/missionctl.mjs backup create <slug>
```

Confirm: backup file created in `backups/`.

---

## Phase 9 checklist [PHASE 9 — requires live VPS]

These steps require a Hostinger VPS and DNS configuration. Do not attempt without live infrastructure.

- [ ] Provision Hostinger VPS (1 CPU, 2GB RAM minimum for single tenant)
- [ ] Configure DNS A records (root, api, www → VPS IP)
- [ ] SSH into VPS and bootstrap:
  ```bash
  apt update && apt upgrade -y
  apt install -y git curl docker.io
  mkdir -p /opt/mission-os
  ```
- [ ] Clone repo or upload release zip to `/opt/mission-os`
- [ ] Generate fresh credentials (do NOT reuse any demo keys):
  - `POSTGRES_PASSWORD` — new random value
  - `JWT_SECRET` — new random value (min 32 chars)
  - `NEXTAUTH_SECRET` — new random value (min 32 chars)
  - LiteLLM, Langfuse, Open WebUI keys — generate per provider docs
- [ ] Copy generated bundle to VPS:
  ```bash
  scp -r handoff/<slug>/managed/ root@<VPS_IP>:/opt/mission-os/handoff/<slug>/managed/
  ```
- [ ] On VPS: `docker compose -f handoff/<slug>/managed/docker-compose.managed.yml up -d --build`
- [ ] On VPS: `node missionctl/missionctl.mjs doctor`
- [ ] On VPS: `node missionctl/missionctl.mjs bundle smoke <slug>`
- [ ] Confirm ops dashboard accessible at `https://<domain>/ops`
- [ ] Run backup: `node missionctl/missionctl.mjs backup create <slug>`
- [ ] Schedule offsite backup sync
- [ ] Staff training (see `docs/ONBOARDING-14-DAY-LAUNCH.md`)

---

## Security checklist (run before every deployment)

```bash
node scripts/secret-audit.mjs          # 0 findings required
node scripts/generated-file-audit.mjs  # 0 findings required
git ls-files | grep -E 'handoff/.*/managed/(hermes|langfuse|litellm|open-webui)/env' || echo "clean"
git ls-files | grep -E 'mission-data|backups/' || echo "clean"
```

If any output appears (other than "clean"), do not proceed. Fix the tracked file issue first.

---

## Abort conditions

Stop and escalate if:

- `npm test` fails
- `node scripts/verify-v06.mjs` reports any failed gate
- `bundle smoke --dry-run` reports any failed check
- `secret-audit.mjs` reports findings
- Any handoff runtime env file appears in `git ls-files`
- The VPS cannot reach external DNS (Phase 9 only)
- A credential from a previous environment is reused

---

## Rollback procedure

If a deployment fails:

```bash
# List available backups
node missionctl/missionctl.mjs backup list <slug>

# Restore from last known-good backup
node missionctl/missionctl.mjs backup restore <slug> <backup-id>

# Re-run smoke check
node missionctl/missionctl.mjs bundle smoke <slug> --dry-run
```

For live VPS rollback, also restart services:
```bash
docker compose -f handoff/<slug>/managed/docker-compose.managed.yml restart
```
