import { NextResponse } from 'next/server';
import { getOpsTenantId } from '../../../../lib/ops-tenant.js';
import { listBackups, createBackup } from '@asc3nd/core/deployment-backup';

export async function GET() {
  try {
    const tenantId = getOpsTenantId();
    const backups = listBackups({ tenantId });
    return NextResponse.json({ ok: true, tenantId, backups });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = getOpsTenantId();
    const body = await request.json().catch(() => ({}));
    const { notes, createdBy } = body || {};

    const backup = createBackup({ tenantId, notes: notes || '', createdBy: createdBy || 'ops-ui' });
    return NextResponse.json({ ok: true, tenantId, backup }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: { message: e.message } }, { status: 500 });
  }
}
