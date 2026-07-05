import { NextResponse } from 'next/server';
import { getOpsTenantId } from '../../../../lib/ops-tenant.js';
import { storageMode } from '@asc3nd/core/storage-factory';

const GATE_6B_BLOCKED = process.env.GATE_6B_LIVE_APPROVED !== 'true';

function checkExecutionMode() {
  const mode = process.env.AGENT_EXECUTION_MODE || 'dry-run';
  return { mode, safe: mode === 'dry-run' || mode === 'local' };
}

export async function GET() {
  const tenantId = getOpsTenantId();
  const { mode: agentMode, safe } = checkExecutionMode();

  let storage;
  try {
    storage = storageMode();
  } catch {
    storage = 'unknown';
  }

  const checks = [
    {
      id: 'gate_6b_blocked',
      label: 'Gate 6B live execution blocked',
      pass: GATE_6B_BLOCKED,
      detail: GATE_6B_BLOCKED
        ? 'GATE_6B_LIVE_APPROVED is not set. External live actions are blocked until Architect approves Gate 6B.'
        : 'WARNING: GATE_6B_LIVE_APPROVED=true is set. Live external actions are unblocked.',
    },
    {
      id: 'agent_execution_mode',
      label: 'Agent execution mode',
      pass: safe,
      detail: `AGENT_EXECUTION_MODE=${agentMode}. ${safe ? 'Safe — no live external calls.' : 'WARNING: external mode active.'}`,
    },
    {
      id: 'storage_mode',
      label: 'Storage mode',
      pass: storage !== 'unknown',
      detail: `Storage: ${storage}. ${storage === 'postgres' ? 'Production-ready.' : 'Local/dev mode — not for production.'}`,
    },
    {
      id: 'vps_intake',
      label: 'VPS/domain intake completed',
      pass: false,
      detail: 'Not yet provided. Human must fill docs/VPS-DOMAIN-INTAKE-FORM.md and docs/GATE-6B-HUMAN-INTAKE-PACKET.md before Gate 6B.',
    },
    {
      id: 'ssh_access',
      label: 'VPS SSH access verified',
      pass: false,
      detail: 'Not yet verified. SSH connection to VPS must be confirmed by human operator before Gate 6B.',
    },
    {
      id: 'dns_pointed',
      label: 'DNS pointed to VPS',
      pass: false,
      detail: 'Not yet confirmed. asc3nd.org / api.asc3nd.org DNS records must point to VPS IP before Gate 6B.',
    },
  ];

  const passed = checks.filter(c => c.pass).length;
  const total = checks.length;
  const gate6bReady = checks.every(c => c.pass);

  return NextResponse.json({
    ok: true,
    tenantId,
    gate6bReady,
    gate6bBlocked: GATE_6B_BLOCKED,
    checks,
    summary: { passed, total },
    note: 'Items showing FAIL are expected at Gate 6B0 stage. They require human VPS/DNS/SSH intake before Gate 6B can proceed.',
  });
}
