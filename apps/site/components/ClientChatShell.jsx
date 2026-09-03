'use client';

import { useMemo, useState } from 'react';
import styles from './ClientChatShell.module.css';

const seed = [
  { id: 'today', title: 'Today', preview: 'What needs attention now?' },
  { id: 'funding', title: 'Grant opportunities', preview: 'Find the strongest funding options.' },
  { id: 'october', title: 'October planning', preview: 'Prepare the next operating cycle.' },
  { id: 'sponsors', title: 'Sponsors', preview: 'Partnership and follow-up work.' }
];

const initialAssistant = {
  id: 'welcome',
  role: 'assistant',
  text: 'What would you like to work on? I can help with funding, content, follow-up, planning, and results.',
};

export function ClientChatShell({ initialConversationId = 'today' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(initialConversationId || 'today');
  const [input, setInput] = useState('');
  const [messagesByConversation, setMessagesByConversation] = useState({
    today: [initialAssistant],
    funding: [{ id: 'f1', role: 'assistant', text: 'Tell me what needs funding, the timing, and any amount you have in mind.' }],
    october: [{ id: 'o1', role: 'assistant', text: 'I can organize October around funding, participation, content, and the decisions that need you.' }],
    sponsors: [{ id: 's1', role: 'assistant', text: 'I can help identify sponsor targets, prepare a brief, and keep follow-up organized.' }],
  });

  const messages = useMemo(() => messagesByConversation[activeId] || [initialAssistant], [messagesByConversation, activeId]);

  function selectConversation(id) {
    setActiveId(id);
    setSidebarOpen(false);
    window.history.replaceState({}, '', id === 'today' ? '/app' : `/app/chat/${id}`);
  }

  function newChat() {
    const id = `new-${Date.now()}`;
    setMessagesByConversation((current) => ({ ...current, [id]: [initialAssistant] }));
    setActiveId(id);
    setSidebarOpen(false);
    window.history.replaceState({}, '', `/app/chat/${id}`);
  }

  function submit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessagesByConversation((current) => ({
      ...current,
      [activeId]: [
        ...(current[activeId] || [initialAssistant]),
        { id: `u-${Date.now()}`, role: 'user', text },
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Preview mode is active. The chat shell is working; mission execution is connected in the next slices.',
          preview: true,
        },
      ],
    }));
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
          {seed.map((item) => (
            <button
              key={item.id}
              className={`${styles.conversation} ${activeId === item.id ? styles.active : ''}`}
              onClick={() => selectConversation(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{item.preview}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
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
          <span className={styles.previewBadge}>Preview</span>
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
                <div>
                  <p>{message.text}</p>
                  {message.preview && <small>Execution is intentionally disabled in this visual slice.</small>}
                </div>
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
            <button type="submit" disabled={!input.trim()} aria-label="Send message">↑</button>
          </form>
          <small>Important actions will always stop for review when they need you.</small>
        </div>
      </section>
    </main>
  );
}
