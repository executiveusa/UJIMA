import { ClientChatShell } from '../../../../components/ClientChatShell';

export default async function ClientConversationPage({ params }) {
  const { conversationId } = await params;
  return <ClientChatShell initialConversationId={conversationId} />;
}
