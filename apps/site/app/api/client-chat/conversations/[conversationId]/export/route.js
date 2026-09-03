import { createClientChatStore } from '../../../../../../lib/client-chat-store';
import { getOpsTenantId } from '../../../../../../lib/ops-tenant';

const store = createClientChatStore();

export async function GET(_request, { params }) {
  try {
    const { conversationId } = await params;
    const tenantId = getOpsTenantId();
    const session = await store.exportPortableSession({ tenantId, conversationId });
    if (!session) return Response.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    return Response.json({ ok: true, tenantId, session });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
