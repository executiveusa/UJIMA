import { createClientChatStore } from '../../../../lib/client-chat-store';
import { getOpsTenantId } from '../../../../lib/ops-tenant';

const store = createClientChatStore();

export async function GET() {
  try {
    const tenantId = getOpsTenantId();
    const conversations = await store.listConversations({ tenantId });
    return Response.json({ ok: true, tenantId, conversations });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = getOpsTenantId();
    const body = await request.json().catch(() => ({}));
    const conversation = await store.createConversation({
      tenantId,
      userId: body.userId || 'client-web',
      title: body.title || 'New chat'
    });
    return Response.json({ ok: true, tenantId, conversation }, { status: 201 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
