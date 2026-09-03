'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './ClientChatShell.module.css';

const initialAssistant = {
  id: 'welcome',
  role: 'assistant',
  text: 'What would you like to work on? I can help with funding, content, follow-up, planning, and results.',
};

export function ClientChatShell({ initialConversationId = null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(initialConversationId);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [syncState, setSyncState] = useState('loading');

  const messages = useMemo(() => messagesByConversation[activeId] || [initialAssistant], [messagesByConversation, activeId]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const response = await fetch('/api/client-chat/conversations', { cache: 'no-store' });
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || 'Unable to load conversations');
        if (cancelled) return;
        setConversations(data.conversations || []);
        if (initialConversationId) {
          setActiveId(initialConversationId);
        } else if (data.conversations?.[0]?.conversationId) {
          setActiveId(data.conversations[0].conversationId);
        } else {
          const created = await fetch('/api/client-chat/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Today' })
          }).then((r) => r.json());
          if (!created.ok) throw new Error(created.error || 'Unable to create conversation');
          if (cancelled) return;
          setConversations([created.conversation]);
          setActiveId(created.conversation.conversationId);
          window.history.replaceState({}, '', `/app/chat/${created.conversation.conversationId}`);
        }
        setSyncState('saved');
      } catch {
        if (!cancelled) setSyncState('offline');
      }
    }
    boot();
    return () => { cancelled = true; };
  }, [initialConversationId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    fetch(`/api/client-chat/conversations/${encodeURIComponent(activeId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.ok) return;
        const mapped = (data.conversation.messages || []).map((message) => ({
          id: message.messageId,
          role: message.role,
          text: message.text,
          createdAt: message.createdAt,
        }));
        setMessagesByConversation((current) => ({ ...current, [activeId]: mapped.length ? mapped : [initialAssistant] }));
      })
      .catch(() => setSyncState('offline'));
    return () => { cancelled = true; };
  }, [activeId]);

  async function selectConversation(id) {
    setActiveId(id);
    setSidebarOpen(false);
    window.history.replaceState({}, '', `/app/chat/${id}`);
  }

  async function newChat() {
    try {
      const data = await fetch('/api/client-chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New chat' })
      }).then((r) => r.json());
      if (!data.ok) throw new Error(data.error);
      setConversations((current) => [data.conversation, ...current]);
      setMessagesByConversation((current) => ({ ...current, [data.conversation.conversationId]: [initialAssistant] }));
      setActiveId(data.conversation.conversationId);
      setSidebarOpen(false);
      setSyncState('saved');
      window.history.replaceState({}, '', `/app/chat/${data.conversation.conversationId}`);
    } catch {
      setSyncState('offline');
    }
  }

  async function submit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !activeId) return;
    setInput('');
    const optimistic = { id: `u-${Date.now()}`, role: 'user', text };
    setMessagesByConversation((current) => ({
      ...current,
      [activeId]: [...(current[activeId]?.filter((message) => message.id !== 'welcome') || []), optimistic],
    }));
    setSyncState('saving');
    try {
      const data = await fetch(`/api/client-chat/conversations/${encodeURIComponent(activeId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', text })
      }).then((r) => r.json());
      if (!data.ok) throw new Error(data.error);
      setMessagesByConversation((current) => ({
        ...current,
        [activeId]: (current[activeId] || []).map((message) => message.id === optimistic.id ? { ...message, id: data.message.messageId } : message)
      }));
      setConversations((current) => current.map((conversation) => conversation.conversationId === activeId ? { ...conversation, updatedAt: data.message.createdAt, messageCount: (conversation.messageCount || 0) + 1 } : conversation));
      setSyncState('saved');
    } catch {
      setSyncState('offline');
    }
  }

  function usePrompt(text) {
    setInput(text);
  }

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} aria-label="Conversation history">
        <div className={styles.sidebarTop}>
          <a href="/app" className={styles.brand} onClick={() => setSidebarOpen(false)}>
            <span className={styles.mark}>A3</span>
            <span><strong>ASC3ND</strong><small>Client workspace</small></span>
          </a>
          <button className={styles.closeButton} onClick={() => setSidebarOpen(false)} aria-label="Close conversations">×</button>
        </div>
        <button className={styles.newChat} onClick={newChat}>+ New chat</button>
        <nav className={styles.conversationList}>
          {conversations.map((item) => (
            <button
              key={item.conversationId}
              className={`${styles.conversation} ${activeId === item.conversationId ? styles.active : ''}`}
              onClick={() => selectConversation(item.conversationId)}
            >
              <strong>{item.title || 'Conversation'}</strong>
              <span>{item.messageCount ? `${item.messageCount} message${item.messageCount === 1 ? '' : 's'}` : 'Ready when you are'}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <a href={activeId ? `/api/client-chat/conversations/${encodeURIComponent(activeId)}/export` : '#'}>Export conversation</a>
          <a href="/ops">Staff control room</a>
          <a href="/login">Switch account</a>
        </div>
      </aside>

      {sidebarOpen && <button className={styles.scrim} aria-label="Close conversations" onClick={() => setSidebarOpen(false)} />}

      <section className={styles.chat}>
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)} aria-label="Open conversations">☰</button>
          <div>
            <strong>ASC3ND</strong>
            <span>Ask for an outcome. The system handles the route.</span>
          </div>
          <span className={styles.previewBadge}>{syncState === 'offline' ? 'Offline' : syncState === 'saving' ? 'Saving' : syncState === 'loading' ? 'Loading' : 'Saved'}</span>
        </header>

        <div className={styles.messages} aria-live="polite">
          <div className={styles.intro}>
            <span className={styles.markLarge}>A3</span>
            <h1>How can I help today?</h1>
            <p>Funding, content, people, follow-up, planning, and results can all start here.</p>
            <div className={styles.prompts}>
              <button onClick={() => usePrompt('Find ASC3ND three grants worth pursuing this month.')}>Find funding</button>
              <button onClick={() => usePrompt('Prepare next week’s content plan.')}>Plan next week</button>
              <button onClick={() => usePrompt('Who needs a follow-up from us?')}>Check follow-up</button>
            </div>
          </div>

          <div className={styles.thread}>
            {messages.map((message) => (
              <article key={message.id} className={`${styles.message} ${message.role === 'user' ? styles.user : styles.assistant}`}>
                <div className={styles.avatar}>{message.role === 'user' ? 'You' : 'A3'}</div>
                <div><p>{message.text}</p></div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.composerWrap}>
          <form className={styles.composer} onSubmit={submit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask ASC3ND anything…"
              rows={1}
              aria-label="Message ASC3ND"
            />
            <button type="submit" disabled={!input.trim() || !activeId} aria-label="Send message">↑</button>
          </form>
          <small>Conversation history is saved. Important actions will stop for review when they need you.</small>
        </div>
      </section>
    </main>
  );
}
