# VPS Bootstrap Runbook — Mission OS Phase 9 Staging

**Audience:** Operator performing a Hostinger VPS deployment
**Purpose:** Step-by-step flow from an empty VPS to a running managed bundle
**Status:** Runbook only. Steps 1–18 are safe to prepare ahead of time. Step 19 requires explicit human approval before execution.

---

## Before you start

- This runbook assumes the managed bundle already exists locally via `missionctl bundle up <tenant> --dry-run` (see `docs/DEPLOYMENT-LIFECYCLE.md`).
- Do not run any command marked `LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES` without an explicit go-ahead from the client/operator who owns the VPS.
- Every step below operates on a VPS the human has already provisioned and handed credentials for. This runbook does not provision a VPS on your behalf.

---

## Step 1 — Buy or open Hostinger VPS

The human (client or operator with billing access) purchases or opens an existing Hostinger VPS plan. Record:

- VPS public IP address
- Root or sudo-capable SSH access method (password or key, provided by Hostinger)
- Plan size (CPU/RAM/disk) — Mission OS + Hermes + LiteLLM + Langfuse + Open WebUI + Postgres is a multi-container stack; a minimum of 4 vCPU / 8GB RAM is recommended for staging.

This step is performed outside of this repository. No command runs here.

## Step 2 — Confirm Ubuntu version

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh <user>@<HOSTINGER_VPS_IP> "lsb_release -a"
```

Mission OS targets Ubuntu 22.04 LTS or 24.04 LTS. If the VPS ships a different distribution, stop and confirm compatibility before proceeding — do not assume package names or Docker install steps translate directly.

## Step 3 — Create deploy user

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh root@<HOSTINGER_VPS_IP> "adduser --disabled-password --gecos '' deploy && usermod -aG sudo deploy"
```

Do not run Mission OS as `root` in production. The `deploy` user owns the application directory and Docker group membership.

## Step 4 — Configure SSH key access

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh-copy-id deploy@<HOSTINGER_VPS_IP>
```

Generate a dedicated deploy key locally (`ssh-keygen -t ed25519 -f ~/.ssh/mission-os-deploy`) rather than reusing a personal key. The private key never enters this repository.

## Step 5 — Disable password SSH if appropriate

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && sudo systemctl restart sshd"
```

Only do this after confirming key-based SSH works from a second terminal session. Do not lock yourself out — keep the original session open until the new session is verified.

## Step 6 — Install firewall

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "sudo apt update && sudo apt install -y ufw && sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable"
```

Only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) are opened. Hermes (8765), LiteLLM, Langfuse, Grafana (3002), and Prometheus (9090) remain bound to `127.0.0.1` and are never exposed through the firewall — see `docs/CADDY-DOMAIN-MAP.md`.

## Step 7 — Install Docker Engine and Compose plugin

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker deploy"
```

Confirm the Compose plugin is present (`docker compose version`) before continuing — the managed bundle uses `docker compose`, not the legacy standalone `docker-compose` binary.

## Step 8 — Install Caddy or use Caddy container

The managed bundle (`handoff/<tenant>/managed/docker-compose.managed.yml`) already runs Caddy as a container (`caddy:2-alpine`). No separate host-level Caddy install is required unless the operator chooses to run Caddy outside Docker. Default recommendation: use the containerized Caddy from the managed bundle.

## Step 9 — Clone repo

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "git clone https://github.com/executiveusa/ascend-social-purpose-agentic-systems-.git /opt/mission-os && cd /opt/mission-os"
```

Clone the exact commit that passed CI and Architect review. Do not clone an uncommitted or unmerged branch to a production or staging VPS.

## Step 10 — Generate env files on VPS

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs tenant create <slug> --org '<Org Name>' && node missionctl/missionctl.mjs bundle up <slug> --dry-run"
```

All secret values are generated fresh on the VPS itself — see `docs/PRODUCTION-ENV-GENERATION.md`. Never copy `.env` values from a local dev machine or from this repository's example files.

## Step 11 — Run missionctl doctor

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs doctor"
```

Doctor must pass before proceeding. If it fails, stop and fix the underlying gap — do not skip ahead to `docker compose up`.

## Step 12 — Create tenant

Already performed in Step 10 (`tenant create`). If the tenant needs to be recreated or a second tenant added:

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs tenant create <slug> --org '<Org Name>' --domain 'https://os.<client-domain>' --api 'https://api.<client-domain>'"
```

## Step 13 — Generate pack

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs pack generate <slug> && node missionctl/missionctl.mjs pack validate <slug>"
```

## Step 14 — Provision Hermes config

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs hermes provision <slug>"
```

This generates config only (`docs/HERMES-MISSION-OS-CONTRACT.md`). It does not start the Hermes container.

## Step 15 — Sync LiteLLM/Langfuse/Open WebUI config

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs litellm sync <slug> && node missionctl/missionctl.mjs langfuse sync <slug> && node missionctl/missionctl.mjs openwebui sync <slug>"
```

## Step 16 — Run bundle up dry-run

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs bundle up <slug> --dry-run"
```

Confirms the managed bundle (compose file, Caddyfile, env template, service configs) generates cleanly on the VPS's own filesystem before any container starts.

## Step 17 — Run bundle smoke dry-run

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os && node missionctl/missionctl.mjs bundle smoke <slug> --dry-run"
```

All checks must pass (matches the same check count reported by `npm run verify` locally — see `docs/PHASE-9-GO-LIVE-GATES.md` Gate G).

## Step 18 — Run docker compose config

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os/handoff/<slug>/managed && docker compose -f docker-compose.managed.yml config"
```

`docker compose config` validates the compose file and resolves environment variable interpolation **without starting any container**. This is the last safe, reversible check before Step 19. Review the resolved output for any placeholder value (`change_me`, `CHANGE_THIS_BEFORE_DEPLOY`) still present — if found, stop and regenerate credentials per `docs/PRODUCTION-ENV-GENERATION.md`.

## Step 19 — Only after human approval: docker compose up -d

```bash
# LIVE COMMAND — DO NOT RUN UNTIL HUMAN APPROVES
# Requires explicit human approval. Do not run automatically or as part of an unattended script.
ssh deploy@<HOSTINGER_VPS_IP> "cd /opt/mission-os/handoff/<slug>/managed && docker compose -f docker-compose.managed.yml up -d"
```

This is the only step in this runbook that starts live containers. Before running it, confirm:

- Step 18's `docker compose config` output has no placeholder credentials.
- Gate A through Gate M in `docs/PHASE-9-GO-LIVE-GATES.md` have passed.
- A human with authority over the client's infrastructure has explicitly approved this step, in writing or in the current conversation.

After `up -d`, follow Gate K (backup/restore drill) and Gate L (staff login test) in `docs/PHASE-9-GO-LIVE-GATES.md` before declaring the staging environment ready for use.

---

## What this runbook does not cover

- DNS record creation (see `docs/CADDY-DOMAIN-MAP.md` for the domain model; actual DNS changes are a human, out-of-repo action)
- TLS certificate issuance (Caddy automates this once DNS resolves — no manual certbot step needed)
- Postgres cutover from file-backed state (see `docs/POSTGRES-MIGRATION-RUNBOOK.md`)
- Ongoing operations after go-live (see `docs/OPERATOR-MANUAL.md` and `docs/DEPLOYMENT-LIFECYCLE.md`)
