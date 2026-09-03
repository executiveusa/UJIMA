import { ClientChatShell } from '../../components/ClientChatShell';

export const metadata = {
  title: 'ASC3ND Client Workspace',
  description: 'Chat-first workspace for ASC3ND operations.'
};

export default function ClientAppPage() {
  return <ClientChatShell initialConversationId="today" />;
}
