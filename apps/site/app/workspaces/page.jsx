'use client';

import { useEffect, useState } from 'react';
import { clearSession, getCurrentUser, supabaseRest } from '../../lib/supabase';

export default function WorkspacesPage() {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const current = await getCurrentUser();
      if (!current) {
        window.location.href = '/login';
        return;
      }
      if (cancelled) return;
      setUser(current);
      try {
        const rows = await supabaseRest('ujima_workspaces?select=id,name,summary,status&order=created_at.asc');
        if (!cancelled) setWorkspaces(rows || []);
        setState('ready');
      } catch {
        if (!cancelled) setState('offline');
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  function signOut() {
    clearSession();
    window.location.href = '/';
  }

  return (
    <main style={{minHeight:'100vh',background:'#f2efe7',color:'#161616',padding:'32px 24px 72px'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',borderBottom:'1px solid #c8c2b6',paddingBottom:18}}>
          <a href="/" style={{color:'inherit',textDecoration:'none',fontWeight:800,letterSpacing:'.08em'}}>UJIMA</a>
          <div style={{display:'flex',gap:18,alignItems:'center',fontSize:13}}>
            <span>{user?.email || 'Signed in'}</span>
            <button onClick={signOut} style={{border:0,background:'transparent',textDecoration:'underline',cursor:'pointer'}}>Sign out</button>
          </div>
        </header>

        <section style={{padding:'58px 0 36px'}}>
          <p style={{letterSpacing:'.12em',textTransform:'uppercase',fontSize:11,margin:0}}>Private workspace</p>
          <h1 style={{fontSize:'clamp(48px,8vw,104px)',lineHeight:.9,margin:'14px 0 20px'}}>What are we working on?</h1>
          <p style={{fontSize:'clamp(18px,2vw,24px)',lineHeight:1.45,maxWidth:720,margin:0}}>Start in the UJIMA Lab. It is connected to Supabase now, so conversations and test runs can persist instead of disappearing between sessions.</p>
        </section>

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          {(workspaces.length ? workspaces : [{id:'ujima-lab',name:'UJIMA Lab',summary:'Private test workspace for chat, goals, workflows, and model routing.',status:state}]).map((workspace) => (
            <a key={workspace.id} href="/lab" style={{display:'block',color:'inherit',textDecoration:'none',border:'1px solid #90897c',padding:28,minHeight:230,background:'#fff'}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
                <span style={{fontSize:11,letterSpacing:'.1em',textTransform:'uppercase'}}>Supabase workspace</span>
                <span style={{fontSize:11,textTransform:'uppercase'}}>{workspace.status}</span>
              </div>
              <h2 style={{fontSize:42,margin:'42px 0 12px'}}>{workspace.name}</h2>
              <p style={{lineHeight:1.5,margin:0}}>{workspace.summary}</p>
              <p style={{margin:'22px 0 0',fontWeight:700}}>Open lab →</p>
            </a>
          ))}
          <a href="/app?client=asc3nd" style={{display:'block',color:'inherit',textDecoration:'none',border:'1px solid #90897c',padding:28,minHeight:230,background:'#eee9df'}}>
            <div style={{fontSize:11,letterSpacing:'.1em',textTransform:'uppercase'}}>Existing client surface</div>
            <h2 style={{fontSize:42,margin:'42px 0 12px'}}>ASC3ND</h2>
            <p style={{lineHeight:1.5,margin:0}}>The existing Client 01 workspace remains available while we move its runtime behind the same authentication and gateway layer.</p>
            <p style={{margin:'22px 0 0',fontWeight:700}}>Open existing workspace →</p>
          </a>
        </section>
      </div>
    </main>
  );
}
