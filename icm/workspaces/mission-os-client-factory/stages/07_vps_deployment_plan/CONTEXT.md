# 07_vps_deployment_plan — VPS Staging Specification

Write the VPS deployment plan for this client. This is a planning stage — no live infrastructure changes are made here.

## Inputs

- stages/00_intake/output/intake-form.md (domain, timeline, budget)
- stages/05_asset_generation/output/asset-generation-report.md
- docs/DEPLOY-HOSTINGER-VPS.md
- handoff/<slug>/managed/ (generated bundle)

## Process

1. Record the VPS specs:
   - Provider (default: Hostinger VPS)
   - OS: Ubuntu 22.04 LTS
   - Plan: minimum 2 vCPU, 4 GB RAM, 80 GB SSD
   - Region: closest to client geographic base
2. Record the domain and DNS plan:
   - Primary domain: client.org
   - API subdomain: api.client.org (or same domain with path routing)
   - DNS provider and who controls it
   - Expected DNS propagation time
3. Record the SSH access plan:
   - Who generates the deploy keypair
   - Where keys are stored (never committed to git)
   - Who has SSH access to the production VPS
4. List all secrets that will need to be generated at deploy time:
   - LITELLM_API_KEY
   - POSTGRES_PASSWORD
   - JWT_SECRET
   - Langfuse keys
   - Open WebUI keys
5. Write the deployment checklist (step-by-step from git clone to first smoke pass).
6. Note any client-specific deviations from the standard deployment path.

## Outputs

- output/vps-deployment-plan.md — full deployment spec, DNS plan, secret list, deployment checklist
- output/audit.json — plan date, operator, tenant

## Human review gate

Operator reviews vps-deployment-plan.md and confirms:
- VPS plan is within client budget
- DNS plan has a confirmed path to execution
- Secret list is complete (no missing credentials)
- Deployment checklist can be followed by a developer unfamiliar with this repo
- No real credentials appear anywhere in this document (use placeholders: YOUR_LITELLM_KEY)

Do not proceed to 08_training_and_handoff until operator reviews the plan and the client has confirmed budget and timeline.

## Allowed tools

- File write (plan documents only)
- Read docs/DEPLOY-HOSTINGER-VPS.md
- Read handoff/<slug>/managed/ files (read-only)

## Forbidden actions

- Do not provision any live VPS at this stage
- Do not purchase domains
- Do not SSH into any server
- Do not write real credentials into this plan document

## Validation

- vps-deployment-plan.md exists and covers all six sections (VPS specs, DNS plan, SSH plan, secret list, deployment checklist, deviations)
- No real secrets (keys, passwords) appear in vps-deployment-plan.md
- Deployment checklist ends with: missionctl bundle smoke <slug> --dry-run passes

## Done when

Operator has reviewed and approved vps-deployment-plan.md. Client has confirmed budget and timeline.
