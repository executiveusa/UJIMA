# VPS and Domain Intake Form — Mission OS Gate 6A

**Type:** Operator reference — complete before any live staging request  
**Status:** Gate 6A — collect inputs only. Do not paste secrets.  
**Instructions:** Fill each field from the client and operator. Use `[NOT_YET_PROVIDED]` for fields that have not been confirmed. Leave placeholders intact — this form never contains real secrets, keys, passwords, or private SSH material.

> **Do not paste private SSH keys. Do not paste passwords. Do not paste API keys. Do not paste tokens. Record only fingerprints, provider names, and ownership confirmation.**

---

## Section 1 — Organization and client

**Client / organization name:**  
`[CLIENT_NAME]`

**Client legal entity type:** (e.g., 501(c)(3), LLC, unincorporated association)  
`[CLIENT_LEGAL_ENTITY]`

**Client primary contact name:**  
`[CLIENT_CONTACT_NAME]`

**Client primary contact email:**  
`[CLIENT_CONTACT_EMAIL]`

**Operator conducting this intake:**  
`[OPERATOR_NAME]`

**Operator email:**  
`[OPERATOR_EMAIL]`

**Date of intake:**  
`[INTAKE_DATE]`

---

## Section 2 — Domain

**Primary client domain** (e.g., example.org):  
`[CLIENT_DOMAIN]`

**Mission OS staging subdomain** (e.g., staging.example.org or os.example.org):  
`[STAGING_DOMAIN]`

**Mission API staging subdomain** (e.g., api.example.org or api-staging.example.org):  
`[STAGING_API_DOMAIN]`

**DNS provider** (e.g., Hostinger DNS, Cloudflare, Namecheap):  
`[DNS_PROVIDER]`

**Does the client / operator have DNS management access?**  
[ ] Yes — account confirmed  
[ ] No — DNS managed by a third party; escalation needed  
[ ] Uncertain  

**Domain registrar (if different from DNS provider):**  
`[DOMAIN_REGISTRAR]`

---

## Section 3 — VPS

**VPS provider** (e.g., Hostinger, DigitalOcean, Hetzner, Vultr):  
`[VPS_PROVIDER]`

**VPS plan / size:**  
`[VPS_PLAN]`

Minimum recommended for Mission OS + Hermes + LiteLLM + Langfuse + Open WebUI:  
4 vCPU / 8 GB RAM / 80 GB SSD

**VPS public IP address:**  
`[VPS_IP]`

> Do not include the actual IP address in this file if it is a production deployment. Record it in a secure credential manager and note "recorded separately" here if needed.

**VPS region / datacenter:**  
`[VPS_REGION]`

**Operating system on VPS:**  
`[UBUNTU_VERSION]`  
Mission OS targets Ubuntu 22.04 LTS or 24.04 LTS.

**VPS provisioning status:**  
[ ] Not yet provisioned  
[ ] Provisioned — credentials not yet handed to operator  
[ ] Provisioned — operator has SSH access  

---

## Section 4 — SSH access

**SSH user:**  
`[SSH_USER]`  
(e.g., `deploy`, `ubuntu`, `root` — Mission OS recommends a non-root deploy user)

**SSH access method:**  
[ ] SSH key (recommended)  
[ ] Password (not recommended for production — note reason if used)  

**SSH key fingerprint (public key fingerprint only — not the private key):**  
`[SSH_KEY_FINGERPRINT]`  

> Record only the fingerprint (e.g., `SHA256:abc123...`). Do not record the private key. Do not paste the private key into any document, form, email, or chat.

**SSH key stored in:**  
`[SSH_KEY_STORAGE_LOCATION]`  
(e.g., operator password manager, client IT team, Hostinger key manager)

**Is root SSH login disabled or will it be disabled before go-live?**  
[ ] Yes — disabled  
[ ] Not yet — will disable per `docs/VPS-BOOTSTRAP-RUNBOOK.md` Step 3  
[ ] Uncertain  

---

## Section 5 — AI model provider

**Model provider(s) the client will use:**  
`[MODEL_PROVIDER_CHOICES]`  
(e.g., OpenAI, Anthropic, both, other — note provider names only)

**Does the client have an active account with the chosen provider(s)?**  
[ ] Yes — account active  
[ ] No — needs to create an account before go-live  
[ ] Uncertain  

**Does the client understand they are the direct API customer (Asc3nd does not proxy their model billing)?**  
[ ] Yes — understood  
[ ] No — needs explanation  

**API key type to be used** (name only — do not record the key value):  
`[API_KEY_TYPE]`  
(e.g., "OpenAI project API key scoped to production org", "Anthropic API key")

> Do not record actual API key values anywhere in this document. Store keys in the client's password manager or secrets vault, to be transferred securely at VPS deployment time only.

---

## Section 6 — Operator and go-live authority

**Designated Mission OS operator** (the person who will administer the system day-to-day):  
Name: `[CLIENT_OPERATOR_NAME]`  
Title: `[CLIENT_OPERATOR_TITLE]`  
Email: `[OPERATOR_EMAIL]`  
Technical comfort: [ ] High  [ ] Medium  [ ] Low  

**Go-live approver** (the client stakeholder with authority to sign off on Gate N — final human signoff):  
Name: `[GO_LIVE_APPROVER_NAME]`  
Title: `[GO_LIVE_APPROVER_TITLE]`  
Email: `[GO_LIVE_APPROVER_EMAIL]`  

**Has the go-live approver read `docs/PHASE-9-GO-LIVE-GATES.md` (Gate N)?**  
[ ] Yes  
[ ] No — send before requesting Gate N signoff  

---

## Section 7 — Backup

**Backup destination:**  
`[BACKUP_DESTINATION]`  
(e.g., "local VPS only", "encrypted to Backblaze B2 bucket", "client-managed S3 bucket")

**Offsite backup configured?**  
[ ] Yes — provider: `[OFFSITE_BACKUP_PROVIDER]`  
[ ] No — local backup only (note the risk: VPS loss = data loss if no offsite backup)  
[ ] Not yet decided  

**Backup frequency agreed?**  
[ ] Yes — frequency: `[BACKUP_FREQUENCY]`  
[ ] Not yet decided  

**Backup restore drill included in go-live plan?**  
[ ] Yes — required by Gate K (`docs/PHASE-9-GO-LIVE-GATES.md`)  
[ ] Not yet scheduled  

---

## Section 8 — Compliance and data sensitivity flags

> Complete this section using the output of `docs/DISCOVERY-INTAKE-FORM.md` Section 8. Do not skip.

**HIPAA / health data present?**  
[ ] Yes — legal counsel review required before go-live  
[ ] No  
[ ] Uncertain — resolve before go-live  

**FERPA / student records present?**  
[ ] Yes — legal counsel review required before go-live  
[ ] No  
[ ] Uncertain — resolve before go-live  

**COPPA / children under 13 data present?**  
[ ] Yes — legal counsel review required before go-live  
[ ] No  
[ ] Uncertain — resolve before go-live  

**Immigration status / other high-sensitivity data present?**  
[ ] Yes — Architect escalation required before go-live  
[ ] No  
[ ] Uncertain — resolve before go-live  

**Compliance flags resolved?**  
[ ] All clear — no regulated data  
[ ] Legal counsel has reviewed and confirmed scope (attach memo or date of review)  
[ ] Unresolved — go-live is blocked until this is resolved  

---

## Section 9 — Confirmation

**Operator confirmation:**  
I confirm that no private keys, passwords, API key values, or tokens appear in this form. All sensitive values are stored separately in a secure credential manager or will be generated on the VPS at deployment time.

Operator name: `[OPERATOR_NAME]`  
Date: `[CONFIRMATION_DATE]`  

**Architect review required:**  
This form must be reviewed by the Architect before Gate 6B (live staging) begins. Do not start live staging without Architect confirmation that all required inputs are provided and all flags are resolved.

---

*This form is for internal operator use. Do not share with parties outside Asc3nd and the designated client contact. All values are placeholders until filled by the designated operator during engagement.*
