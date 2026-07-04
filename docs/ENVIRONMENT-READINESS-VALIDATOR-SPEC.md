# Environment Readiness Validator Spec — Mission OS

**Type:** Spec document — defines intended validator checks (local and VPS-side)  
**Status:** Gate 6A — spec only. No live implementation exists yet.  
**Branch:** `phase9/live-staging-preparation-pack`

> **This document specifies what a future environment readiness validator should check. The validator itself is not yet implemented. The local-only subset of these checks is implemented in `scripts/phase9-live-staging-readiness.mjs`.**

---

## Purpose

An environment readiness validator prevents deployment to a misconfigured environment. It catches the most common causes of a failed or unsafe deployment before any live command runs:

- Placeholder values left in configuration files
- Weak or default secrets
- Sensitive files committed to git
- Required environment variables absent
- File permissions that would expose secrets to unprivileged processes

The validator is divided into two phases:
- **Phase L (local):** Runs on the operator's machine before SSHing to the VPS. No network, SSH, DNS, or Docker calls. Implemented in `scripts/phase9-live-staging-readiness.mjs`.
- **Phase R (remote):** Runs on the VPS before `docker compose up`. Requires SSH access. Not yet implemented.

---

## Phase L — Local checks (pre-SSH)

### L1 — Required docs exist

Check that all Gate 6A documents exist in the `docs/` directory:

- `docs/LIVE-STAGING-PREPARATION-PACK.md`
- `docs/VPS-DOMAIN-INTAKE-FORM.md`
- `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md`
- `docs/DEPLOYMENT-DAY-RUNBOOK.md`
- `docs/STAGING-ROLLBACK-RUNBOOK.md`
- `docs/FIRST-LIVE-CLIENT-SAFETY-CHECKLIST.md`
- `docs/ENVIRONMENT-READINESS-VALIDATOR-SPEC.md`

**Pass:** All files exist  
**Fail:** List missing files, exit nonzero

---

### L2 — `.env` files not tracked by git

Check that no `.env*` file is tracked:

```bash
git ls-files | grep -E '\.env$|\.env\.'
```

**Pass:** No output  
**Fail:** List tracked `.env` files, exit nonzero

---

### L3 — No private SSH keys committed

Check that no private key files are tracked:

```bash
git ls-files | grep -E 'id_rsa$|id_ed25519$|id_ecdsa$|\.pem$|\.key$'
```

**Pass:** No output  
**Fail:** List tracked key files, exit nonzero

---

### L4 — Placeholder-only managed files

Check that managed placeholder files contain only `[PLACEHOLDER]`-style values. For files that should never contain real values until the operator fills them (e.g., intake form when no client is assigned):

Check that `docs/VPS-DOMAIN-INTAKE-FORM.md` does not contain an actual IP address pattern when the intake has not been completed:

```javascript
const content = fs.readFileSync('docs/VPS-DOMAIN-INTAKE-FORM.md', 'utf8');
// Warn if what looks like a real IP appears and VPS_IP placeholder is also gone
const hasRealIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(content);
const hasPlaceholder = content.includes('[VPS_IP]');
// If real IP present without placeholder: that is intentional operator fill — OK
// If neither present: warn (field may have been removed)
```

**Pass:** File contains either the placeholder or an operator-filled value, not absent  
**Fail:** Placeholder field was removed without a replacement value — warn

---

### L5 — Caddyfile uses placeholder domains

If a Caddyfile is present in the repository, verify it does not contain a committed real domain that was supposed to remain as a placeholder:

```javascript
const caddyfile = fs.readFileSync('caddy/Caddyfile', 'utf8');
// Must contain STAGING_DOMAIN_PLACEHOLDER or a clearly intentional domain, not a leftover real domain
const hasPlaceholder = /STAGING_DOMAIN_PLACEHOLDER|STAGING_API_DOMAIN_PLACEHOLDER/.test(caddyfile);
```

**Pass:** Caddyfile contains placeholder strings or has been confirmed as operator-configured  
**Fail:** Placeholder strings were replaced with a domain but `.env` or intake is not yet complete — warn

---

### L6 — No private key content in any committed file

Scan tracked files for PEM headers that indicate a private key:

```bash
git grep -l "BEGIN.*PRIVATE KEY\|BEGIN RSA PRIVATE KEY\|BEGIN EC PRIVATE KEY\|BEGIN OPENSSH PRIVATE KEY"
```

**Pass:** No output  
**Fail:** List files containing private key material, exit nonzero

---

### L7 — No known plaintext secret patterns

Scan tracked files for patterns that look like committed secrets:

```javascript
const patterns = [
  /sk-[A-Za-z0-9]{32,}/,         // OpenAI API key
  /sk-ant-[A-Za-z0-9-]{32,}/,    // Anthropic API key
  /ghp_[A-Za-z0-9]{36}/,         // GitHub personal access token
  /AKIA[0-9A-Z]{16}/,            // AWS access key
];
```

**Pass:** No matches in any tracked file  
**Fail:** Report file and pattern match (redact actual value), exit nonzero

---

### L8 — Required script files exist

- `scripts/phase9-live-staging-readiness.mjs`
- `scripts/verify-v06.mjs`

**Pass:** Both files exist  
**Fail:** List missing scripts, exit nonzero

---

### L9 — Test suite file exists

- `packages/core/tests/phase9-live-staging-preparation.test.js`

**Pass:** File exists  
**Fail:** Report missing, exit nonzero

---

## Phase R — Remote checks (on VPS, pre-`docker compose up`)

> Phase R is not yet implemented. This section defines the intended checks for the future VPS-side validator.

---

### R1 — Required env names exist

The `.env` file on the VPS must contain all required variable names. Check for names only — do not print values.

Required names:
- `JWT_SECRET`
- `SESSION_SECRET`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`
- `POSTGRES_DB`
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_SALT`
- `LANGFUSE_NEXTAUTH_SECRET`
- `LITELLM_MASTER_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

**Pass:** All names present in `.env`  
**Fail:** List missing names, exit nonzero

---

### R2 — Placeholder values rejected

Check that no env variable is set to a placeholder string:

```bash
grep -E '^\w+=\[.*\]$|^\w+=PLACEHOLDER$|^\w+=CHANGEME$|^\w+=your-secret-here$' .env
```

**Pass:** No placeholder values  
**Fail:** List variables with placeholder values (name only, not value), exit nonzero

---

### R3 — Weak JWT rejected

Check that `JWT_SECRET` is at least 32 characters (length only — do not print value):

```bash
JWT_LEN=$(grep '^JWT_SECRET=' .env | cut -d= -f2 | wc -c)
[ "$JWT_LEN" -ge 32 ] || echo "FAIL: JWT_SECRET too short"
```

**Pass:** Length ≥ 32 characters  
**Fail:** Report length is too short, exit nonzero

---

### R4 — Default Postgres password rejected

Check that `POSTGRES_PASSWORD` is not a known default value (check against list: `postgres`, `password`, `admin`, `changeme`, `secret`, `123456`):

```bash
PG_PASS=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2)
for weak in postgres password admin changeme secret 123456; do
  [ "$PG_PASS" = "$weak" ] && echo "FAIL: weak POSTGRES_PASSWORD" && exit 1
done
```

**Pass:** Password is not a known weak default  
**Fail:** Report that a known weak password was found (do not print the password), exit nonzero

---

### R5 — API keys not printed in logs

After services start, check that no log output from any container contains API key patterns:

```bash
docker compose logs 2>&1 | grep -E 'sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9-]{20,}'
```

**Pass:** No API key patterns in logs  
**Fail:** Report which container's log contains the pattern (do not print the key), exit nonzero

---

### R6 — File permissions on `.env`

Check that the `.env` file is readable only by the deploy user (mode 600 or 640):

```bash
stat -c "%a" /opt/mission-os/.env
```

**Pass:** Mode is 600 or 640  
**Fail:** Report actual mode and set to 600

---

### R7 — Caddyfile placeholder domains replaced

Check that the Caddyfile on the VPS does not still contain placeholder domain strings:

```bash
grep -E 'STAGING_DOMAIN_PLACEHOLDER|STAGING_API_DOMAIN_PLACEHOLDER|example\.org' /opt/mission-os/caddy/Caddyfile
```

**Pass:** No placeholder strings remain  
**Fail:** Report which placeholder is still present, exit nonzero

---

### R8 — Docker Compose config valid

Validate the Docker Compose configuration without starting containers:

```bash
docker compose config --quiet
```

**Pass:** Exit code 0, no errors  
**Fail:** Report config error output, exit nonzero

---

### R9 — Backup path writable

Check that the backup destination directory is writable:

```bash
touch /opt/mission-os/backups/.write-test && rm /opt/mission-os/backups/.write-test && echo "PASS"
```

**Pass:** Write succeeds  
**Fail:** Report permissions error, exit nonzero

---

### R10 — Tenant data path writable

Check that the tenant data directory is writable:

```bash
touch /opt/mission-os/data/.write-test && rm /opt/mission-os/data/.write-test && echo "PASS"
```

**Pass:** Write succeeds  
**Fail:** Report permissions error, exit nonzero

---

### R11 — ICM path writable

Check that the ICM (Intent-Capability Model) workspace path is writable:

```bash
touch /opt/mission-os/icm/.write-test && rm /opt/mission-os/icm/.write-test && echo "PASS"
```

**Pass:** Write succeeds  
**Fail:** Report permissions error, exit nonzero

---

## Output format

The validator must output a JSON summary to stdout:

```json
{
  "phase": "L",
  "timestamp": "2026-01-01T00:00:00Z",
  "checks": [
    { "id": "L1", "name": "Required docs exist", "status": "PASS" },
    { "id": "L2", "name": ".env files not tracked by git", "status": "PASS" },
    { "id": "L3", "name": "No private SSH keys committed", "status": "PASS" }
  ],
  "summary": {
    "total": 9,
    "passed": 9,
    "failed": 0,
    "warnings": 0
  },
  "ready": true
}
```

Exit codes:
- `0` — all checks pass
- `1` — one or more checks failed
- `2` — validator itself encountered an error (config missing, parse error)

---

## Implementation notes

- Phase L is implemented in `scripts/phase9-live-staging-readiness.mjs`
- Phase R is a future implementation — it will be a script deployed to the VPS or run remotely via SSH
- The validator must never print secret values — only names, lengths, and patterns
- The validator must exit nonzero if any check fails so it can be used in CI gates

---

*This spec is Gate 6A material. The validator defined here does not yet exist as a complete implementation. Phase L local checks are implemented. Phase R VPS-side checks are future work, required before Gate 6B execution.*
