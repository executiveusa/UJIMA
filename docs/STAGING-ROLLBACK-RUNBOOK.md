# Staging Rollback Runbook — Mission OS

**Type:** Operator runbook — rollback triggers, path, and post-rollback report  
**Status:** Gate 6A — reviewed and ready. Execute only if rollback is triggered.  
**Branch:** `phase9/live-staging-preparation-pack`

> **Rollback must be tested in staging before production use.**

> **The rollback decision can be made by the operator or the go-live approver. It does not require Architect approval to roll back. When in doubt, roll back.**

---

## Rollback triggers

Roll back immediately if any of the following occur:

1. Any Docker service container fails to start or exits within 5 minutes of `docker compose up`
2. TLS (HTTPS) is not functional after 15 minutes and root cause is not identified
3. The live smoke test (`node missionctl/missionctl.mjs bundle smoke`) fails and root cause is not immediately fixable
4. A secret value was logged, printed, or committed to git in any form
5. DNS does not propagate within 30 minutes and the deployment window is closing
6. Any unexpected data corruption or data loss is detected
7. A service is producing errors at a rate that would affect a real user
8. The operator or go-live approver judges the risk of continuing to exceed the risk of rolling back

**Rollback does not require Architect pre-approval. Notify Architect as soon as possible after rollback begins.**

---

## Rollback decision authority

| Role | Authority |
|------|-----------|
| Operator | Can call rollback immediately at any time |
| Go-live approver | Can call rollback immediately at any time |
| Architect | Can call rollback; must be notified as soon as possible after rollback begins |

---

## Rollback path — services

### R1 — Stop all containers

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && docker compose down"
```

Expected: all containers stopped. Verify with:

```bash
ssh [SSH_USER]@[VPS_IP] "docker compose ps"
```

Expected output: no running containers.

---

### R2 — Verify data integrity before any further action

> **LIVE COMMAND — execute only if rollback is triggered**

Before removing any data, check what exists:

```bash
ssh [SSH_USER]@[VPS_IP] "ls -lh /opt/mission-os/data/ && \
  ls -lh /opt/mission-os/backups/ 2>/dev/null || echo 'No backup dir'"
```

If a backup was created during Step 13 of the deployment runbook, it is available for restore.

---

### R3 — Postgres rollback path

If Postgres data is corrupt or in an inconsistent state:

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
# Stop Postgres container only (already stopped if R1 ran)
# Identify the Postgres data volume
ssh [SSH_USER]@[VPS_IP] "docker volume ls | grep postgres"

# If restoring from backup — follow docs/BACKUP-RESTORE.md restore procedure
# Do NOT delete the Postgres volume without first creating a snapshot
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && bash scripts/backup.sh --emergency-snapshot"
```

If the Postgres schema migration needs to be reversed: follow `docs/POSTGRES-MIGRATION-RUNBOOK.md` rollback section.

---

### R4 — File-backed state rollback path

If file-backed JSON state is corrupt:

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
ssh [SSH_USER]@[VPS_IP] "ls -lh /opt/mission-os/data/tenants/"
# Restore from backup archive — follow docs/BACKUP-RESTORE.md
```

Do not delete live data files without a confirmed backup.

---

### R5 — Docker image rollback

If the deployed Docker image is defective and a previous image is available:

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
ssh [SSH_USER]@[VPS_IP] "docker images | grep mission-os"
# Tag the defective image for investigation, then revert to the previous tag
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && \
  git log --oneline -5 && \
  git checkout [PREVIOUS_STABLE_COMMIT] && \
  docker compose build && \
  docker compose up -d"
```

Replace `[PREVIOUS_STABLE_COMMIT]` with the last known-good commit hash.

---

### R6 — Caddy / TLS rollback

If Caddy fails to obtain a TLS certificate or routes incorrectly:

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
# Check Caddy logs
ssh [SSH_USER]@[VPS_IP] "docker compose logs caddy --tail=100"

# If Caddyfile is malformed, restore the template from git
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && git checkout caddy/Caddyfile"
# Then re-apply domain substitution per Deployment-Day Runbook Step 8
```

If TLS cannot be resolved: stop Caddy, serve a maintenance page, and notify Architect.

---

### R7 — DNS rollback

If DNS was misconfigured and must be reverted:

In the DNS provider control panel:

1. Delete the A records created during Deployment-Day Runbook Step 9
2. If a previous DNS configuration existed: restore it
3. Wait for DNS TTL to expire (300 seconds if TTL was set to 300 during deployment)

Verify DNS no longer resolves to the VPS:

```bash
dig [STAGING_DOMAIN] +short
# Should return nothing or previous IP
```

---

### R8 — Full service disable

If all services must be taken offline immediately:

> **LIVE COMMAND — execute only if rollback is triggered**

```bash
# Stop all containers
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && docker compose down"

# Optionally: return a maintenance response via a simple nginx or netcat listener
# Do not leave the VPS responding with 500 errors — serve a maintenance page
ssh [SSH_USER]@[VPS_IP] "docker run -d -p 80:80 -p 443:443 \
  --name maintenance nginx:alpine"
```

---

## Restore verification

After any rollback, verify the following before reporting the system as stable:

1. **All containers stopped or in expected maintenance state:**
   ```bash
   ssh [SSH_USER]@[VPS_IP] "docker compose ps"
   ```

2. **No data loss — file-backed state intact:**
   ```bash
   ssh [SSH_USER]@[VPS_IP] "ls -lh /opt/mission-os/data/"
   ```

3. **No secrets exposed — confirm no secret values appear in logs:**
   ```bash
   ssh [SSH_USER]@[VPS_IP] "docker compose logs 2>&1 | grep -i 'password\|secret\|token\|key' | head -20"
   ```
   If secrets appear in logs: rotate them immediately.

4. **DNS state confirmed** (resolves to expected destination or no longer resolves):
   ```bash
   dig [STAGING_DOMAIN] +short
   ```

5. **Backup confirmed intact:**
   ```bash
   ssh [SSH_USER]@[VPS_IP] "ls -lh /opt/mission-os/backups/"
   ```

---

## Post-rollback report

Complete this report immediately after rollback. Send to Architect within 1 hour.

**Date and time of rollback:**  
`[ROLLBACK_DATETIME]`

**Rollback called by:**  
`[ROLLBACK_CALLED_BY]` — Role: `[ROLE]`

**Trigger that caused rollback:**  
`[ROLLBACK_TRIGGER]` — Reference rollback trigger number: `[TRIGGER_NUMBER]`

**Steps executed during rollback:**  
`[LIST_OF_STEPS_EXECUTED]` (e.g., R1, R3, R7)

**Data integrity status after rollback:**  
[ ] All data intact — no loss  
[ ] Data loss detected — describe: `[DATA_LOSS_DESCRIPTION]`  
[ ] Unknown — investigation ongoing

**Secrets exposure status:**  
[ ] No secrets were exposed  
[ ] A secret was exposed — rotated on `[ROTATION_DATE]` — describe: `[EXPOSURE_DESCRIPTION]`

**DNS state after rollback:**  
[ ] DNS reverted to previous state  
[ ] DNS records deleted  
[ ] DNS state uncertain — investigation ongoing

**Root cause (preliminary):**  
`[PRELIMINARY_ROOT_CAUSE]`

**Proposed resolution before next attempt:**  
`[PROPOSED_FIX]`

**Is the system stable enough to attempt deployment again?**  
[ ] Yes — estimated re-attempt date: `[REATTEMPT_DATE]`  
[ ] No — further investigation required  
[ ] Unknown — awaiting Architect guidance

**Architect notified?**  
[ ] Yes — notified at `[ARCHITECT_NOTIFICATION_TIME]`  
[ ] No — notify now

---

## Before re-attempting deployment

Do not attempt deployment again until:

1. Root cause is identified and documented
2. The fix is implemented, committed, and CI is green
3. `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` is re-reviewed — all HARD gates pass
4. Architect issues written approval to re-attempt Gate 6B
5. If secrets were exposed: all affected secrets are rotated and new values are staged on VPS

---

*This runbook must be tested in staging before production use. When in doubt, roll back — it is always safer to stop and investigate than to continue a failing deployment.*
