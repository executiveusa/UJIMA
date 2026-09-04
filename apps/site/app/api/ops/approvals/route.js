import { NextResponse } from 'next/server';
import { listApprovals, requestApproval } from '@asc3nd/core/approval-lifecycle';
import { verifyBrowserSessionToken } from '@asc3nd/core/auth';
import { can } from '@asc3nd/core/rbac';

function operatorFrom(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return verifyBrowserSessionToken(token);
}

function forbidden(status, message) {
  return NextResponse.json({ ok: false, error: { message } }, { status });
}

export async function GET(request) {
  try {
    const operator = operatorFrom(request);
    if (!operator) return forbidden(401, 'Unauthorized');
    if (!can(operator, 'approvals.read')) return forbidden(403, 'Forbidden');
    const tenantId = operator.tenantId;
    return NextResponse.json({ ok: true, tenantId, approvals: listApprovals({ tenantId }) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const operator = operatorFrom(request);
    if (!operator) return forbidden(401, 'Unauthorized');
    if (!can(operator, 'approvals.review')) return forbidden(403, 'Forbidden');
    const tenantId = operator.tenantId;
    const body = await request.json();
    const { actionType, actionPayload } = body || {};
    if (!actionType) return NextResponse.json({ ok: false, error: { message: 'actionType is required' } }, { status: 400 });
    const approval = requestApproval({ tenantId, actionType, actionPayload: actionPayload || {}, requester: operator.sub });
    return NextResponse.json({ ok: true, tenantId, approval }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}