import { createClientChatStore } from '../../../../../lib/client-chat-store';
import { getOpsTenantId } from '../../../../../lib/ops-tenant';

const store = createClientChatStore();

export async function GET(_request, { params }) {
  try {
    const { conversationId } = await params;
    const tenantId = getOpsTenantId();
    const conversation = await store.getConversation({ tenantId, conversationId });
    if (!conversation) return Response.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    return Response.json({ ok: true, tenantId, conversation });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { conversationId } = await params;
    const tenantId = getOpsTenantId();
    const body = await request.json();
    const message = await store.appendMessage({
      tenantId,
      conversationId,
      role: body.role || 'user',
      text: body.text,
      userId: body.userId || 'client-web',
      provenanceRefs: Array.isArray(body.provenanceRefs) ? body.provenanceRefs : []
    });
    return Response.json({ ok: true, tenantId, message }, { status: 201 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
