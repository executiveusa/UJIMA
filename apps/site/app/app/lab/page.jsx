'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, getSession, supabaseRest } from '../../../lib/supabase';

const starter = [{ role: 'assistant', content: 'What do you want UJIMA to work on?' }];

export default function LabPage() {
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState(starter);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Connecting');
  const [route, setRoute] = useState('demo');

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const current = await getCurrentUser();
      if (!current) { window.location.href = '/login'; return; }
      if (cancelled) return;
      setUser(current);
      const rows = await supabaseRest('ujima_conversations?select=id,title,updated_at&workspace_id=eq.ujima-lab&order=updated_at.desc&limit=1');
      let id = rows?.[0]?.id;
      if (!id) {
        const created = await supabaseRest('ujima_conversations', {
          method: 'POST',
          body: JSON.stringify({ user_id: current.id, workspace_id: 'ujima-lab', title: 'UJIMA Lab' }),
        });
        id = created?.[0]?.id;
      }
      if (!id) throw new Error('Could not create conversation.');
      setConversationId(id);
      const saved = await supabaseRest(`ujima_messages?select=id,role,content,route,created_at&conversation_id=eq.${id}&order=created_at.asc`);
      if (!cancelled && saved?.length) setMessages(saved);
      if (!cancelled) setStatus('Supabase connected');
    }
    boot().catch(() => setStatus('Connection problem'));
    return () => { cancelled = true; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !conversationId || !user) return;
    setInput('');
    setStatus('Working');
    const userMessage = { role: 'user', content: text };
    setMessages((current) => [...current, userMessage]);
    try {
      await supabaseRest('ujima_messages', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, role: 'user', content: text }) });
      const session = getSession();
      const response = await fetch('/api/model-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gateway failed.');
      const assistant = { role: 'assistant', content: data.text, route: data.route };
      setMessages((current) => [...current, assistant]);
      setRoute(data.route || 'demo');
      await supabaseRest('ujima_messages', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, role: 'assistant', content: data.text, route: data.route || 'demo' }) });
      await supabaseRest('ujima_model_runs', { method: 'POST', body: JSON.stringify({ user_id: user.id, conversation_id: conversationId, route: data.route || 'demo', provider: data.provider || 'local', model: data.model || 'deterministic-demo', status: 'completed' }) });
      await supabaseRest(`ujima_conversations?id=eq.${conversationId}`, { method: 'PATCH', body: JSON.stringify({ updated_at: new Date().toISOString() }) });
      setStatus('Saved');
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: `I could not complete that test: ${error.message}` }]);
      setStatus('Needs attention');
    }
  }

  return (
    <main style={{minHeight:'100vh',background:'#f3efe6',color:'#11110f',fontFamily:'Arial,Helvetica,sans-serif'}}>
      <header style={{padding:'18px 24px',borderBottom:'1px solid rgba(17,17,15,.18)',display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}>
        <a href="/workspaces" style={{color:'inherit',textDecoration:'none',fontWeight:800,letterSpacing:'.08em'}}>UJIMA LAB</a>
        <div style={{display:'flex',gap:14,fontSize:12,alignItems:'center'}}><span>{status}</span><span style={{padding:'6px 10px',border:'1px solid #11110f'}}>Gateway: {route}</span></div>
      </header>
      <section style={{maxWidth:920,margin:'0 auto',padding:'44px 20px 140px'}}>
        <div style={{marginBottom:42}}>
          <p style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',margin:'0 0 10px'}}>Authenticated workspace</p>
          <h1 style={{fontSize:'clamp(48px,8vw,92px)',lineHeight:.9,margin:'0 0 18px'}}>Talk to UJIMA.</h1>
          <p style={{maxWidth:680,fontSize:18,lineHeight:1.5,margin:0}}>Your session and messages are stored in Supabase. The gateway is wired now; until a live model provider is added, it runs in deterministic demo mode.</p>
          <p style={{fontSize:12,marginTop:12,opacity:.65}}>{user?.email}</p>
        </div>
        <div style={{display:'grid',gap:18}}>
          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} style={{display:'grid',gridTemplateColumns:'72px 1fr',gap:18,paddingTop:18,borderTop:'1px solid rgba(17,17,15,.18)'}}>
              <strong style={{fontSize:12,textTransform:'uppercase'}}>{message.role === 'user' ? 'You' : 'UJIMA'}</strong>
              <p style={{fontSize:'clamp(18px,2vw,24px)',lineHeight:1.45,margin:0}}>{message.content}</p>
            </article>
          ))}
        </div>
      </section>
      <div style={{position:'fixed',left:0,right:0,bottom:0,background:'rgba(243,239,230,.96)',borderTop:'1px solid rgba(17,17,15,.2)',padding:'14px 20px'}}>
        <form onSubmit={submit} style={{maxWidth:920,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr auto',gap:12}}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tell UJIMA what needs to get done…" rows={2} style={{width:'100%',resize:'none',padding:14,border:'1px solid #8e877b',background:'#fff',font:'inherit'}} />
          <button type="submit" style={{border:0,background:'#11110f',color:'#f3efe6',padding:'0 24px',fontWeight:700,cursor:'pointer'}}>SEND</button>
        </form>
      </div>
    </main>
  );
}
