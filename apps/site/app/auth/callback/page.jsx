'use client';

import { useEffect, useState } from 'react';
import { captureSessionFromLocation, getCurrentUser, updatePassword } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('Finishing sign in…');
  const [password, setPassword] = useState('');

  useEffect(() => {
    try {
      captureSessionFromLocation();
      const mode = new URLSearchParams(window.location.search).get('mode');
      getCurrentUser().then((user) => {
        if (!user) throw new Error('The authentication link is invalid or expired.');
        if (mode === 'recovery') {
          setState('recovery');
          setMessage('Choose a new password.');
          return;
        }
        window.history.replaceState({}, '', '/auth/callback');
        window.location.replace('/workspaces');
      }).catch((error) => {
        setState('error');
        setMessage(error.message || 'Could not complete sign in.');
      });
    } catch (error) {
      setState('error');
      setMessage(error.message || 'Could not complete sign in.');
    }
  }, []);

  async function savePassword(event) {
    event.preventDefault();
    setState('saving');
    setMessage('Updating password…');
    try {
      await updatePassword(password);
      window.history.replaceState({}, '', '/auth/callback');
      window.location.replace('/workspaces');
    } catch (error) {
      setState('recovery');
      setMessage(error.message || 'Could not update password.');
    }
  }

  return (
    <main className="login-page">
      <section className="login-card auth-callback">
        <a className="brand" href="/"><span className="logo">U</span><span>UJIMA</span></a>
        <h1>{state === 'recovery' || state === 'saving' ? 'Reset password' : 'Connecting UJIMA'}</h1>
        <p>{message}</p>
        {state === 'recovery' && (
          <form className="form" onSubmit={savePassword}>
            <label>New password<input className="input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button className="cta">SAVE PASSWORD</button>
          </form>
        )}
        {state === 'error' && <a className="cta ghost" href="/login">Return to sign in</a>}
      </section>
    </main>
  );
}
