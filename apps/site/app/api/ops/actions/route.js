import { NextResponse } from 'next/server';
import { getOpsTenantId } from '../../../../lib/ops-tenant.js';
import { readEvents } from '@asc3nd/core/events';
import { auditOnlyDispatch } from '@asc3nd/core/action-dispatcher';

export async function GET(request) {
  try {
    const tenantId = getOpsTenantId();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const events = readEvents({ tenantId, type: 'action', limit });
    return NextResponse.json({ ok: true, tenantId, events });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = getOpsTenantId();
    const body = await request.json();
    const { actionType, actionPayload, requestedBy } = body || {};

    if (!actionType) {
      return NextResponse.json({ ok: false, error: { message: 'actionType is required' } }, { status: 400 });
    }

    const result = await auditOnlyDispatch({ tenantId, actionType, actionPayload: actionPayload || {}, requestedBy: requestedBy || 'ops-ui' });
    return NextResponse.json({ ok: true, tenantId, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}
