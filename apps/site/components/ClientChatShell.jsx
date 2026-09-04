'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken } from '../lib/api';
import { MissionEvidencePanel } from './MissionEvidencePanel';
import styles from './ClientChatShell.module.css';

const initialAssistant = {
  id: 'welcome',
  role: 'assistant',
  text: 'What would you like to work on? I can help with funding, content, follow-up, planning, and results.',
};

const CHAT_API = '/api/agent/client-chat';
const ACTIVE_CLIENT = { id: 'asc3nd', name: 'ASC3ND', label: 'Client 01' };

function routeToConversation(conversationId) {
  window.history.replaceState({}, '', conversationId ? `/app/chat/${conversationId}?client=${ACTIVE_CLIENT.id}` : `/app?client=${ACTIVE_CLIENT.id}`);
}

function handleAuthFailure(error) {
  if (error?.status !== 401) return false;
  clearToken();
  window.location.href = '/login';
  return true;
}

function createRequestKey() {
  const random = globalThis.crypto?.randomUUID?.();
  if (random) return `chat-${random}`;
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function clientWorkLabel(work) {
  if (!work?.status) return null;
  if (work.status === 'working') return 'Working';
  if (work.status === 'needs_you') return 'Needs your approval';
  if (work.status === 'failed') return 'Blocked — needs input';
  if (work.status === 'ready') return 'Ready';
  if (work.status === 'delivered') return 'Delivered';
  return null;
}

export function ClientChatShell({ initialConversationId = null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(initialConversationId);
  const [input, setInput] = useState('');
  const [retryRequest, setRetryRequest] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [workByConversation, setWorkByConversation] = useState({});
  const [evidenceByConversation, setEvidenceByConversation] = useState({});
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [syncState, setSyncState] = useState('loading');

  const messages = useMemo(() => messagesByConversation[activeId] || [initialAssistant], [messagesByConversation, activeId]);
  const activeWork = workByConversation[activeId] || null;
  const activeEvidence = evidenceByConversation[activeId] || { artifacts: [], approval: null };
  const activeWorkLabel = clientWorkLabel(activeWork);
  const activeNextAction = activeWork?.nextAction && ['needs_you', 'failed'].includes(activeWork?.status) ? activeWork.nextAction : null;

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!getToken()) {
        window.location.href = '/login';
        return;
      }
      try {
        const data = await api(`${CHAT_API}/conversations`);
        if (cancelled) return;
        const rows = data.conversations || [];
        setConversations(rows);
        const requested = initialConversationId ? rows.find((conversation) => conversation.conversationId === initialConversationId) : null;
        const next = requested || rows[0] || null;
        if (next) {
          setActiveId(next.conversationId);
          routeToConversation(next.conversationId);
        } else {
          const created = await api(`${CHAT_API}/conversations`, { method: 'POST', body: JSON.stringify({ title: 'Today' }) });
          if (cancelled) return;
          setConversations([created.conversation]);
          setActiveId(created.conversation.conversationId);
          routeToConversation(created.conversation.conversationId);
        }
        setSyncState('saved');
      } catch (error) {
        if (handleAuthFailure(error)) return;
        if (!cancelled) setSyncState('offline');
      }
    }
    boot();
    return () => { cancelled = true; };
  }, [initialConversationId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setActionError(null);
    api(`${CHAT_API}/conversations/${encodeURIComponent(activeId)}`)
      .then((data) => {
        if (cancelled) return;
        const mapped = (data.conversation.messages || []).map((message) => ({
          id: message.messageId, role: message.role, text: message.text, createdAt: message.createdAt,
        }));
        setMessagesByConversation((current) => ({ ...current, [activeId]: mapped.length ? mapped : [initialAssistant] }));
        setWorkByConversation((current) => ({ ...current, [activeId]: data.work || null }));
        setEvidenceByConversation((current) => ({ ...current, [activeId]: data.evidence || { artifacts: [], approval: null } }));
        setSyncState('saved');
      })
      .catch((error) => {
        if (!handleAuthFailure(error) && !cancelled) setSyncState('offline');
      });
    return () => { cancelled = true; };
  }, [activeId]);

  async function selectConversation(id) {
    setActiveId(id);
    setRetryRequest(null);
    setActionError(null);
    setSidebarOpen(false);
    routeToConversation(id);
  }

  async function newChat() {
    try {
      setSyncState('saving');
      const data = await api(`${CHAT_API}/conversations`, { method: 'POST', body: JSON.stringify({ title: 'New chat' }) });
      setConversations((current) => [data.conversation, ...current]);
      setMessagesByConversation((current) => ({ ...current, [data.conversation.conversationId]: [initialAssistant] }));
      setWorkByConversation((current) => ({ ...current, [data.conversation.conversationId]: null }));
      setEvidenceByConversation((current) => ({ ...current, [data.conversation.conversationId]: { artifacts: [], approval: null } }));
      setActiveId(data.conversation.conversationId);
      setRetryRequest(null);
      setActionError(null);
      setSidebarOpen(false);
      setSyncState('saved');
      routeToConversation(data.conversation.conversationId);
    } catch (error) {
      if (!handleAuthFailure(error)) setSyncState('offline');
    }
  }

  async function exportConversation() {
    if (!activeId) return;
    try {
      const data = await api(`${CHAT_API}/conversations/${encodeURIComponent(activeId)}/export`);
      const blob = new Blob([JSON.stringify(data.session, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ujima-${ACTIVE_CLIENT.id}-chat-${activeId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (!handleAuthFailure(error)) setSyncState('offline');
    }
  }

  async function decideApproval(decision) {
    if (!activeId || !activeWork?.id || decisionBusy) return;
    setDecisionBusy(true);
    setActionError(null);
    try {
      const data = await api(`${CHAT_API}/conversations/${encodeURIComponent(activeId)}/missions/${encodeURIComponent(activeWork.id)}/approval`, {
        method: 'POST', body: JSON.stringify({ decision })
      });
      setEvidenceByConversation((current) => ({ ...current, [activeId]: data.evidence || { artifacts: [], approval: data.approval || null } }));
      if (data.work) setWorkByConversation((current) => ({ ...current, [activeId]: data.work }));
      setSyncState('saved');
    } catch (error) {
      if (!handleAuthFailure(error)) setActionError(error?.message || 'Could not update the approval.');
    } finally {
      setDecisionBusy(false);
    }
  }

  async function openArtifact(artifact, download) {
    if (!artifact) return;
    setActionError(null);
    try {
      const token = getToken();
      const response = await fetch(download ? artifact.downloadUrl : artifact.previewUrl, { headers: { authorization: `Bearer ${token}` } });
      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          window.location.href = '/login';
          return;
        }
        throw new Error(response.status === 404 ? 'Artifact content is not available yet.' : 'Could not open this artifact.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      if (download) anchor.download = artifact.title || artifact.id;
      else anchor.target = '_blank';
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      setActionError(error?.message || 'Could not open this artifact.');
    }
  }

  async function submit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !activeId) return;
    const requestKey = retryRequest?.text === text ? retryRequest.key : createRequestKey();
    setInput('');
    setActionError(null);
    const optimistic = { id: `u-${requestKey}`, role: 'user', text };
    setMessagesByConversation((current) => ({ ...current, [activeId]: [...(current[activeId]?.filter((message) => message.id !== 'welcome') || []), optimistic] }));
    setSyncState('saving');
    try {
      const data = await api(`${CHAT_API}/conversations/${encodeURIComponent(activeId)}`, {
        method: 'POST', body: JSON.stringify({ text, idempotencyKey: requestKey })
      });
      if (data.warning === 'ACKNOWLEDGEMENT_PENDING') {
        setRetryRequest({ key: requestKey, text });
        setInput(text);
      } else setRetryRequest(null);
      if (data.work) setWorkByConversation((current) => ({ ...current, [activeId]: data.work }));
      setEvidenceByConversation((current) => ({ ...current, [activeId]: data.evidence || { artifacts: [], approval: null } }));
      setMessagesByConversation((current) => {
        const persisted = (current[activeId] || []).map((message) => message.id === optimistic.id ? { ...message, id: data.message.messageId, createdAt: data.message.createdAt } : message);
        const assistant = data.assistant ? { id: data.assistant.messageId, role: 'assistant', text: data.assistant.text, createdAt: data.assistant.createdAt } : null;
        return { ...current, [activeId]: assistant ? [...persisted.filter((message) => message.id !== assistant.id), assistant] : persisted };
      });
      setConversations((current) => current.map((conversation) => conversation.conversationId === activeId ? {
        ...conversation,
        updatedAt: data.assistant?.createdAt || data.message.createdAt,
        messageCount: (conversation.messageCount || 0) + (data.message.reused ? 0 : 1) + (data.assistant && !data.assistant.reused ? 1 : 0)
      } : conversation));
      setSyncState(data.warning ? 'offline' : 'saved');
    } catch (error) {
      setMessagesByConversation((current) => ({ ...current, [activeId]: (current[activeId] || []).filter((message) => message.id !== optimistic.id) }));
      setRetryRequest({ key: requestKey, text });
      setInput((current) => current || text);
      if (!handleAuthFailure(error)) setSyncState('offline');
    }
  }

  function usePrompt(text) {
    setRetryRequest(null);
    setInput(text);
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Conversation history">
        <div className={styles.sidebarTop}>
          <a href="/workspaces" className={styles.brand} onClick={() => setSidebarOpen(false)}>
            <span className={styles.mark}>U</span>
            <span><strong>UJIMA</strong><small>{ACTIVE_CLIENT.name} workspace</small></span>
          </a>
          <button className={styles.closeButton} onClick={() => setSidebarOpen(false)} aria-label="Close conversations">×</button>
        </div>
        <button className={styles.newChat} onClick={newChat}>+ New chat</button>
        <nav className={styles.conversationList}>
          {conversations.map((item) => (
            <button key={item.conversationId} className={`${styles.conversation} ${activeId === item.conversationId ? styles.active : ''}`} onClick={() => selectConversation(item.conversationId)}>
              <strong>{item.title || 'Conversation'}</strong>
              <span>{item.messageCount ? `${item.messageCount} message${item.messageCount === 1 ? '' : 's'}` : 'Ready when you are'}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button" onClick={exportConversation} disabled={!activeId}>Export conversation</button>
          <a href="/workspaces">Switch workspace</a>
          <a href="/ops">Ujima operations</a>
          <a href="/login">Switch account</a>
        </div>
      </aside>

      {sidebarOpen && <button className={styles.scrim} aria-label="Close conversations" onClick={() => setSidebarOpen(false)} />}

      <section className={styles.chat}>
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)} aria-label="Open conversations">☰</button>
          <div><strong>{ACTIVE_CLIENT.name}</strong><span>{ACTIVE_CLIENT.label} · managed in Ujima</span></div>
          <span className={styles.previewBadge}>{syncState === 'offline' ? 'Offline' : syncState === 'saving' ? 'Saving' : syncState === 'loading' ? 'Loading' : 'Saved'}</span>
          {activeWorkLabel && <span className={styles.workBadge} role="status" aria-label="Current work status">{activeWorkLabel}</span>}
        </header>
        {activeNextAction && <div className={styles.nextAction} role="status"><strong>Next action</strong><span>{activeNextAction}</span></div>}
        {actionError && <div className={styles.actionError} role="alert">{actionError}</div>}
        <MissionEvidencePanel work={activeWork} evidence={activeEvidence} busy={decisionBusy} onDecision={decideApproval} onArtifact={openArtifact} />

        <div className={styles.messages} aria-live="polite">
          <div className={styles.intro}>
            <span className={styles.markLarge}>U</span>
            <h1>How can I help today?</h1>
            <p>You are working inside the {ACTIVE_CLIENT.name} client workspace. Funding, content, people, follow-up, planning, and results can all start here.</p>
            <div className={styles.prompts}>
              <button onClick={() => usePrompt('Find ASC3ND three grants worth pursuing this month.')}>Find funding</button>
              <button onClick={() => usePrompt('Prepare next week’s content plan for ASC3ND.')}>Plan next week</button>
              <button onClick={() => usePrompt('Who needs a follow-up from ASC3ND?')}>Check follow-up</button>
            </div>
          </div>

          <div className={styles.thread}>
            {messages.map((message) => (
              <article key={message.id} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>
                <div className={styles.avatar}>{message.role === 'user' ? 'You' : 'U'}</div>
                <div><p>{message.text}</p></div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.composerWrap}>
          <form className={styles.composer} onSubmit={submit}>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask about ${ACTIVE_CLIENT.name}…`} rows={1} aria-label={`Message Ujima about ${ACTIVE_CLIENT.name}`} />
            <button type="submit" disabled={!input.trim() || !activeId} aria-label="Send message">↑</button>
          </form>
          <small>Conversation history is saved to this client workspace. Important actions stop for review when they need you.</small>
        </div>
      </section>
    </main>
  );
}
