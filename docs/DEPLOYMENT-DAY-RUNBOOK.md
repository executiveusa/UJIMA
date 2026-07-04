# Deployment-Day Runbook — Mission OS Gate 6B

**Type:** Operator runbook — ordered steps for live VPS deployment  
**Status:** Gate 6A — reviewed and ready. Do not execute until Architect approves Gate 6B.  
**Branch:** `phase9/live-staging-preparation-pack`

> **CRITICAL: Every step marked "LIVE COMMAND" below must not be run until the Architect issues explicit written approval for Gate 6B. Running these commands before approval bypasses the go-live gates and puts the client's system at risk.**

> **Gate 6A does not perform live deployment. This runbook is authored during Gate 6A so operators can review it before the live deployment day. No commands in this document are executed during Gate 6A.**

---

## Prerequisites — all must be satisfied before Step 1

Before starting any step in this runbook, confirm:

- [ ] All 15 HARD gates in `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` are PASS
- [ ] Architect has issued explicit written approval for Gate 6B
- [ ] Client go-live approver has issued written acceptance
- [ ] VPS is provisioned and operator has SSH access
- [ ] DNS management access is confirmed
- [ ] Secrets to be generated are documented in `docs/PRODUCTION-ENV-GENERATION.md`
- [ ] `docs/STAGING-ROLLBACK-RUNBOOK.md` has been read by the operator
- [ ] A rollback trigger decision maker is identified and reachable during the deployment window

---

## Step 1 — Confirm baseline

> **LOCAL COMMAND — safe to run during Gate 6A review**

```bash
git status
git log --oneline -3
node scripts/phase9-live-staging-readiness.mjs
node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run
node scripts/verify-v06.mjs
```

Expected: all checks pass, working tree clean.

If any check fails: stop and resolve before proceeding to Step 2.

---

## Step 2 — Confirm VPS accessibility

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
# Replace [SSH_USER] and [VPS_IP] with values from intake form / credential manager
ssh [SSH_USER]@[VPS_IP] "echo 'VPS reachable' && uname -a && free -h && df -h /"
```

Expected output: Ubuntu version, RAM ≥ 8 GB, disk ≥ 80 GB free.

If VPS is not reachable: stop. Resolve SSH access before proceeding.

---

## Step 3 — Harden SSH (if not already done)

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
# On the VPS — disable root login, disable password auth
ssh [SSH_USER]@[VPS_IP] "sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && \
  sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && \
  sudo systemctl reload sshd && echo 'SSH hardened'"
```

Verify: attempt `ssh root@[VPS_IP]` — must be refused.

Reference: `docs/VPS-BOOTSTRAP-RUNBOOK.md` Step 3

---

## Step 4 — Install system dependencies

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
ssh [SSH_USER]@[VPS_IP] "sudo apt-get update && sudo apt-get upgrade -y && \
  sudo apt-get install -y git curl wget ufw fail2ban unattended-upgrades"
```

Then install Docker following `docs/VPS-BOOTSTRAP-RUNBOOK.md` Step 5 exactly.

---

## Step 5 — Configure firewall

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
ssh [SSH_USER]@[VPS_IP] "sudo ufw default deny incoming && \
  sudo ufw default allow outgoing && \
  sudo ufw allow ssh && \
  sudo ufw allow 80/tcp && \
  sudo ufw allow 443/tcp && \
  sudo ufw --force enable && \
  sudo ufw status"
```

Expected: ports 22, 80, 443 open. All others denied.

Reference: `docs/VPS-BOOTSTRAP-RUNBOOK.md` Step 6

---

## Step 6 — Clone repository to VPS

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
ssh [SSH_USER]@[VPS_IP] "mkdir -p /opt/mission-os && \
  git clone https://github.com/[REPO_URL] /opt/mission-os && \
  cd /opt/mission-os && git log --oneline -1"
```

Confirm the commit hash matches the Architect-reviewed deploy commit.

---

## Step 7 — Generate secrets on VPS

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

> **Secrets are generated directly on the VPS and stored only in the VPS `.env` file. They are never written to any document, chat, email, or source control.**

Follow `docs/PRODUCTION-ENV-GENERATION.md` exactly. For each required secret:

```bash
ssh [SSH_USER]@[VPS_IP] "openssl rand -hex 32"
# Copy the output directly into the .env file on the VPS — do not save elsewhere
```

Required secrets — names only (values generated on VPS, never recorded here):
- `JWT_SECRET`
- `SESSION_SECRET`
- `POSTGRES_PASSWORD`
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_SALT`
- Additional secrets per `docs/PRODUCTION-ENV-GENERATION.md`

Client-provided values (transferred securely — not recorded here):
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (from client's password manager, copied to VPS `.env` only)

**Do not print, log, or echo any secret value.**

---

## Step 8 — Configure Caddy

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

Replace placeholder domains in the Caddyfile with actual staging domains from the intake form:

```bash
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && \
  sed -i 's/STAGING_DOMAIN_PLACEHOLDER/[STAGING_DOMAIN]/g' caddy/Caddyfile && \
  sed -i 's/STAGING_API_DOMAIN_PLACEHOLDER/[STAGING_API_DOMAIN]/g' caddy/Caddyfile && \
  cat caddy/Caddyfile"
```

Review the Caddyfile output — confirm no placeholder strings remain.

Reference: `docs/CADDY-DOMAIN-MAP.md`

---

## Step 9 — Create DNS A records

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

In the DNS provider control panel (not via SSH):

1. Create an A record: `[STAGING_DOMAIN]` → `[VPS_IP]`
2. Create an A record: `[STAGING_API_DOMAIN]` → `[VPS_IP]`
3. Set TTL to 300 (5 minutes) for rapid propagation during staging

Verify propagation before proceeding:

```bash
dig [STAGING_DOMAIN] +short
dig [STAGING_API_DOMAIN] +short
# Both should return [VPS_IP]
```

Allow up to 10 minutes for propagation. Do not proceed to Step 10 until DNS resolves correctly.

---

## Step 10 — Start services

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && \
  docker compose up -d && \
  docker compose ps"
```

Expected: all containers running (Caddy, Mission OS app, Hermes, LiteLLM, Langfuse, Postgres, Open WebUI).

If any container exits immediately: check logs before proceeding:

```bash
ssh [SSH_USER]@[VPS_IP] "docker compose logs --tail=50 [service-name]"
```

Reference: `docs/DEPLOYMENT-LIFECYCLE.md`

---

## Step 11 — Verify TLS and routing

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
curl -I https://[STAGING_DOMAIN]
curl -I https://[STAGING_API_DOMAIN]/health
```

Expected:
- HTTP 200 or 301 → 200 for both endpoints
- TLS certificate valid (no curl TLS warning)
- Response from Mission OS application (not a Caddy default page)

If TLS fails: Caddy needs a moment to obtain the Let's Encrypt certificate. Wait 2 minutes and retry. If still failing, check Caddy logs:

```bash
ssh [SSH_USER]@[VPS_IP] "docker compose logs caddy --tail=50"
```

---

## Step 12 — Run smoke test against live staging

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

```bash
# From the deployment machine (not the VPS)
node missionctl/missionctl.mjs bundle smoke demo-pnw \
  --api-url https://[STAGING_API_DOMAIN] \
  --site-url https://[STAGING_DOMAIN]
```

All smoke checks must pass. If any check fails: do not proceed to Step 13. Diagnose and fix, or trigger rollback per `docs/STAGING-ROLLBACK-RUNBOOK.md`.

---

## Step 13 — Configure backup

> **LIVE COMMAND — DO NOT RUN UNTIL ARCHITECT APPROVES GATE 6B**

Follow `docs/BACKUP-RESTORE.md` to configure the backup job on the VPS per the backup destination recorded in the intake form.

Perform a manual backup and verify it completes:

```bash
ssh [SSH_USER]@[VPS_IP] "cd /opt/mission-os && bash scripts/backup.sh && echo 'Backup OK'"
```

Verify the backup artifact exists and is readable (test restore without overwriting live data).

---

## Step 14 — First live client safety review

> **LOCAL — review before any client-facing action**

Before performing any action on behalf of a client on the live staging system:

- Read `docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md` in full
- Confirm all items are checked
- Do not submit any content on behalf of a client until the checklist is complete

---

## Step 15 — Operator sign-off and Architect notification

When all steps above are complete and verified:

1. Complete the gate status in `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md`
2. Run `node missionctl/missionctl.mjs bundle smoke demo-pnw` against live staging — attach output
3. Capture `docker compose ps` output from VPS
4. Capture TLS check output from Step 11
5. Send all of the above to Architect for Gate 6B sign-off

**Do not perform Gate 6C (production promotion) without Architect sign-off on Gate 6B.**

---

## Rollback trigger

If at any point during Steps 2–14 any of the following occurs, stop and execute `docs/STAGING-ROLLBACK-RUNBOOK.md`:

- Any container fails to start or exits unexpectedly
- TLS fails and cannot be resolved in 15 minutes
- Smoke test fails and root cause is not immediately obvious
- A secret was logged, printed, or committed
- DNS propagation does not resolve within 30 minutes
- Any data loss or corruption is observed

**The rollback decision can be made by the operator or the go-live approver. It does not require Architect approval to roll back.**

---

## Emergency contacts

Operator: `[OPERATOR_NAME]` — `[OPERATOR_EMAIL]`  
Go-live approver: `[GO_LIVE_APPROVER_NAME]` — `[GO_LIVE_APPROVER_EMAIL]`  
Architect: `[ARCHITECT_CONTACT]`  
VPS provider support: `[VPS_PROVIDER_SUPPORT_URL]`

---

*This runbook is authored during Gate 6A for operator review. No steps are executed until Architect approves Gate 6B. All commands marked "LIVE COMMAND" are blocked until that approval is issued in writing.*
