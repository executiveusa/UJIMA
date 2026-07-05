import { NextResponse } from 'next/server';
import { getOpsTenantId } from '../../../../lib/ops-tenant.js';
import { requestApproval, updateApprovalStatus, APPROVAL_STATES } from '@asc3nd/core/approval-lifecycle';

export async function GET() {
  try {
    const tenantId = getOpsTenantId();
    const { createRepositories } = await import('@asc3nd/db');
    const repos = createRepositories();
    const approvals = repos.approvals ? repos.approvals.list(tenantId) : [];
    return NextResponse.json({ ok: true, tenantId, approvals });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = getOpsTenantId();
    const body = await request.json();
    const { actionType, actionPayload, requester } = body || {};

    if (!actionType) {
      return NextResponse.json({ ok: false, error: { message: 'actionType is required' } }, { status: 400 });
    }

    const approval = requestApproval({ tenantId, actionType, actionPayload: actionPayload || {}, requester: requester || 'ops-ui' });
    return NextResponse.json({ ok: true, tenantId, approval }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}
