import path from 'node:path';
import { listIcmTree } from '@asc3nd/core/icm';
import { getOpsTenantId } from '../../../../lib/ops-tenant';

const ICM_ROOT = process.env.ICM_ROOT || path.join(process.cwd(), 'icm');

export async function GET() {
  try {
    const tenantId = getOpsTenantId();
    const tree = listIcmTree({ base: ICM_ROOT, tenantId });
    return Response.json({ ok: true, tenantId, tree });
  } catch (e) {
    return Response.json({ ok: false, error: { message: e.message }, tree: [] }, { status: 500 });
  }
}
