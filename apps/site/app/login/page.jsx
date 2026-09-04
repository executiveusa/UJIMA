'use client';
import { useState } from 'react';
import { login } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setError('');
    try { await login(email, password); window.location.href = '/workspaces'; }
    catch (err) { setError(err.message); }
  }
  return (
    <main className="login-page">
      <form className="login-card form" onSubmit={submit}>
        <a className="brand" href="/"><span className="logo">U</span><span>UJIMA OS</span></a>
        <p>Sign in to Ujima. Your organization and client access determine which workspaces you can open.</p>
        {error && <div className="notice">{error}</div>}
        <label>Email<input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="cta">Continue</button>
        <a href="/" style={{textAlign:'center',fontSize:12,color:'var(--muted)'}}>Back to Ujima</a>
      </form>
    </main>
  );
}
