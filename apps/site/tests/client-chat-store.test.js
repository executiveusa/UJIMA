import { beforeEach, describe, expect, it } from 'vitest';
import { clearRepositoryCache, createRepositories } from '@asc3nd/db';
import { createClientChatStore } from '../lib/client-chat-store';

beforeEach(() => {
  process.env.MISSION_STORAGE = 'memory';
  clearRepositoryCache();
});

describe('client chat persistence', () => {
  it('creates, persists, reloads and exports a conversation', async () => {
    const repos = createRepositories({ forceNew: true });
    const store = createClientChatStore(repos);
    const created = await store.createConversation({ tenantId: 'asc3nd', userId: 'u1', title: 'Funding' });
    await store.appendMessage({ tenantId: 'asc3nd', conversationId: created.conversationId, role: 'user', text: 'Find grants', userId: 'u1', provenanceRefs: ['icm:mission'] });
    const loaded = await store.getConversation({ tenantId: 'asc3nd', conversationId: created.conversationId });
    expect(loaded.title).toBe('Funding');
    expect(loaded.messages).toHaveLength(1);
    expect(loaded.messages[0].text).toBe('Find grants');
    const exported = await store.exportPortableSession({ tenantId: 'asc3nd', conversationId: created.conversationId, userId: 'u1' });
    expect(exported.tenant_id).toBe('asc3nd');
    expect(exported.messages[0].provenance_refs).toEqual(['icm:mission']);
    expect(exported.recovery.exportable).toBe(true);
  });

  it('does not leak conversations across tenants', async () => {
    const repos = createRepositories({ forceNew: true });
    const store = createClientChatStore(repos);
    await store.createConversation({ tenantId: 'asc3nd', title: 'Private A' });
    await store.createConversation({ tenantId: 'other', title: 'Private B' });
    const a = await store.listConversations({ tenantId: 'asc3nd' });
    const b = await store.listConversations({ tenantId: 'other' });
    expect(a.map((x) => x.title)).toEqual(['Private A']);
    expect(b.map((x) => x.title)).toEqual(['Private B']);
  });

  it('rejects empty messages and unknown roles', async () => {
    const store = createClientChatStore(createRepositories({ forceNew: true }));
    const created = await store.createConversation({ tenantId: 'asc3nd' });
    await expect(store.appendMessage({ tenantId: 'asc3nd', conversationId: created.conversationId, role: 'alien', text: 'x' })).rejects.toThrow('INVALID_ROLE');
    await expect(store.appendMessage({ tenantId: 'asc3nd', conversationId: created.conversationId, role: 'user', text: '   ' })).rejects.toThrow('MESSAGE_REQUIRED');
  });
});
