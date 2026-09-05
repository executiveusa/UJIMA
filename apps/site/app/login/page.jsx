'use client';

import { useState } from 'react';
import { signInWithPassword } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithPassword(email, password);
      window.location.href = '/workspaces';
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card form" onSubmit={submit}>
        <a className="brand" href="/"><span className="logo">U</span><span>UJIMA</span></a>
        <div>
          <h1 style={{margin:'0 0 10px',fontSize:34}}>Sign in</h1>
          <p style={{margin:0}}>Use your UJIMA account to open the private workspace and test the assistant.</p>
        </div>
        {error && <div className="notice" role="alert">{error}</div>}
        <label>Email<input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="cta" disabled={busy}>{busy ? 'SIGNING IN…' : 'CONTINUE'}</button>
        <p style={{margin:0,fontSize:12,lineHeight:1.5,color:'var(--muted)'}}>Authentication is handled by Supabase. Your password is not stored in UJIMA.</p>
        <a href="/" style={{textAlign:'center',fontSize:12,color:'var(--muted)'}}>Back to UJIMA</a>
      </form>
    </main>
  );
}
