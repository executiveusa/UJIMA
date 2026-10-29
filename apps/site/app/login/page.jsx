'use client';

import { useMemo, useState } from 'react';
import { exchangeSupabaseSession } from '../../lib/api';
import { sendMagicLink, sendPasswordRecovery, signInWithGoogle, signInWithPassword, signUpWithPassword } from '../../lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => {
    if (mode === 'signup') return 'Create your UJIMA account';
    if (mode === 'magic') return 'Email me a sign-in link';
    if (mode === 'recovery') return 'Reset your password';
    return 'Sign in to UJIMA';
  }, [mode]);

  async function enterUjima(session) {
    const exchanged = await exchangeSupabaseSession(session?.access_token);
    window.location.href = exchanged.needsOnboarding ? '/onboarding' : '/app';
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUpWithPassword(email, password);
        if (result.session) await enterUjima(result.session);
        else setMessage('Check your email to confirm the account, then return to UJIMA.');
      } else if (mode === 'magic') {
        await sendMagicLink(email);
        setMessage('Check your email for the secure sign-in link.');
      } else if (mode === 'recovery') {
        await sendPasswordRecovery(email);
        setMessage('Check your email for the password-reset link.');
      } else {
        const session = await signInWithPassword(email, password);
        await enterUjima(session);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-story">
          <a className="auth-wordmark" href="/">UJIMA</a>
          <p className="auth-kicker">NONPROFIT OPERATING SYSTEM</p>
          <h1 id="auth-title">{title}</h1>
          <p>Start in conversation. UJIMA keeps the workflows, approvals, evidence and technical machinery underneath the interface.</p>
          <div className="auth-proof">
            <strong>Start with Groundwork</strong>
            <span>Check whether your organization is ready to be found, trusted, funded and operated.</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <button type="button" className="auth-provider" onClick={signInWithGoogle}>Continue with Google</button>
          <div className="auth-divider"><span>or</span></div>

          <label>
            Work email
            <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          {(mode === 'signin' || mode === 'signup') && (
            <label>
              Password
              <input className="input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
          )}

          {error && <div className="notice auth-error" role="alert">{error}</div>}
          {message && <div className="notice auth-success" role="status">{message}</div>}

          <button className="cta auth-submit" disabled={busy}>
            {busy ? 'WORKING…' : mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'magic' ? 'SEND SIGN-IN LINK' : mode === 'recovery' ? 'SEND RESET LINK' : 'SIGN IN'}
          </button>

          <div className="auth-options">
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'I already have an account' : 'Create an account'}</button>
            <button type="button" onClick={() => setMode('magic')}>Use a magic link</button>
            <button type="button" onClick={() => setMode('recovery')}>Forgot password?</button>
          </div>

          <p className="auth-fineprint">Authentication is handled by Supabase. UJIMA does not store your password.</p>
        </form>
      </section>
    </main>
  );
}
