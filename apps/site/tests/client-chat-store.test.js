import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import { browserSessionAuth, verifyBrowserSessionToken } from '../../../services/mission-api/src/agent/browser-session-auth.js';

let dataDir;

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc3nd-chat-'));
  process.env.DATA_DIR = dataDir;
  process.env.JWT_SECRET = 'client-chat-test-secret-1234567890';
});

afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
  delete process.env.JWT_SECRET;
});

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 60_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

describe('client chat persistence', () => {
  it('creates, persists, reloads and exports a conversation', async () => {
    const store = createClientChatStore();
    const created = await store.createConversation({ tenantId: 'asc3nd', userId: 'u1', title: 'Funding' });
    await store.appendMessage({
      tenantId: 'asc3nd',
      userId: 'u1',
      conversationId: created.conversationId,
      role: 'user',
      text: 'Find grants',
      provenanceRefs: ['icm:mission']
    });

    const loaded = await store.getConversation({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId });
    expect(loaded.title).toBe('Funding');
    expect(loaded.messages).toHaveLength(1);
    expect(loaded.messages[0].text).toBe('Find grants');

    const exported = await store.exportPortableSession({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId });
    expect(exported.tenant_id).toBe('asc3nd');
    expect(exported.user_id).toBe('u1');
    expect(exported.messages[0].provenance_refs).toEqual(['icm:mission']);
    expect(exported.icm_context_refs).toEqual(['icm/tenants/asc3nd']);
    expect(exported.recovery.exportable).toBe(true);
  });

  it('does not leak conversations across tenants or users', async () => {
    const store = createClientChatStore();
    await store.createConversation({ tenantId: 'asc3nd', userId: 'u1', title: 'Private A' });
    await store.createConversation({ tenantId: 'asc3nd', userId: 'u2', title: 'Private A2' });
    await store.createConversation({ tenantId: 'other', userId: 'u1', title: 'Private B' });

    const a = await store.listConversations({ tenantId: 'asc3nd', userId: 'u1' });
    const a2 = await store.listConversations({ tenantId: 'asc3nd', userId: 'u2' });
    const b = await store.listConversations({ tenantId: 'other', userId: 'u1' });

    expect(a.map((x) => x.title)).toEqual(['Private A']);
    expect(a2.map((x) => x.title)).toEqual(['Private A2']);
    expect(b.map((x) => x.title)).toEqual(['Private B']);
  });

  it('rejects invalid messages and orphan writes', async () => {
    const store = createClientChatStore();
    const created = await store.createConversation({ tenantId: 'asc3nd', userId: 'u1' });

    await expect(store.appendMessage({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId, role: 'alien', text: 'x' })).rejects.toThrow('INVALID_ROLE');
    await expect(store.appendMessage({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId, role: 'user', text: '   ' })).rejects.toThrow('MESSAGE_REQUIRED');
    await expect(store.appendMessage({ tenantId: 'asc3nd', userId: 'u2', conversationId: created.conversationId, role: 'user', text: 'x' })).rejects.toThrow('CONVERSATION_NOT_FOUND');
  });

  it('keeps complete event history instead of a fixed tenant-wide window', async () => {
    const events = [];
    const read = () => events;
    const append = (event) => {
      const row = {
        id: `evt-${events.length}`,
        createdAt: new Date(1_700_000_000_000 + events.length).toISOString(),
        ...event
      };
      events.push(row);
      return row;
    };
    const store = createClientChatStore({ read, append });
    const created = await store.createConversation({ tenantId: 'asc3nd', userId: 'u1', title: 'Long history' });
    for (let i = 0; i < 2105; i += 1) {
      await store.appendMessage({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId, role: 'user', text: `m-${i}` });
    }
    const loaded = await store.getConversation({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId });
    expect(loaded.messages).toHaveLength(2105);
    expect(loaded.messages[0].text).toBe('m-0');
    expect(loaded.messages.at(-1).text).toBe('m-2104');
  });

  it('preserves append order when timestamps are identical', async () => {
    const events = [];
    const tiedAt = '2026-09-03T10:00:00.000Z';
    const append = (event) => {
      const row = {
        ...event,
        id: events.length === 0 ? 'z-created' : `a-message-${events.length}`,
        createdAt: tiedAt
      };
      events.push(row);
      return row;
    };
    const store = createClientChatStore({ read: () => events, append });
    const created = await store.createConversation({ tenantId: 'asc3nd', userId: 'u1', title: 'Tied timestamps' });
    await store.appendMessage({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId, role: 'user', text: 'first' });
    await store.appendMessage({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId, role: 'user', text: 'second' });

    const conversations = await store.listConversations({ tenantId: 'asc3nd', userId: 'u1' });
    const loaded = await store.getConversation({ tenantId: 'asc3nd', userId: 'u1', conversationId: created.conversationId });

    expect(conversations[0].messageCount).toBe(2);
    expect(loaded.messages.map((message) => message.text)).toEqual(['first', 'second']);
  });

  it('keeps failed-send recovery behavior in the client shell', () => {
    const shellPath = path.resolve(process.cwd(), 'apps/site/components/ClientChatShell.jsx');
    const shell = fs.readFileSync(shellPath, 'utf8');
    expect(shell).toContain("filter((message) => message.id !== optimistic.id)");
    expect(shell).toContain('setInput((current) => current || text)');
    expect(shell).toContain("setSyncState('offline')");
  });
});

describe('browser session auth', () => {
  it('accepts a valid signed session and derives tenant/user identity', () => {
    const token = sign({ sub: 'user-1', tenantId: 'asc3nd', role: 'owner' });
    expect(verifyBrowserSessionToken(token)).toMatchObject({ sub: 'user-1', tenantId: 'asc3nd' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: () => res, json: () => res };
    let called = false;
    browserSessionAuth(req, res, () => { called = true; });
    expect(called).toBe(true);
    expect(req.user).toMatchObject({ sub: 'user-1', tenantId: 'asc3nd' });
  });

  it('fails closed for missing, forged, expired, or identity-less sessions', () => {
    expect(verifyBrowserSessionToken('')).toBeNull();
    expect(verifyBrowserSessionToken(`${sign({ sub: 'u1', tenantId: 'asc3nd' })}x`)).toBeNull();
    const expiredBody = Buffer.from(JSON.stringify({ sub: 'u1', tenantId: 'asc3nd', exp: Date.now() - 1 })).toString('base64url');
    const expiredSig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(expiredBody).digest('base64url');
    expect(verifyBrowserSessionToken(`${expiredBody}.${expiredSig}`)).toBeNull();
    expect(verifyBrowserSessionToken(sign({ tenantId: 'asc3nd' }))).toBeNull();
  });
});
