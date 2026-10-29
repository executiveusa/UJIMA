'use client';

import { useEffect, useState } from 'react';
import { onboardSupabaseSession } from '../../lib/api';
import { getCurrentUser, getSession } from '../../lib/supabase';

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('');
  const [website, setWebsite] = useState('');
  const [user, setUser] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((current) => {
      if (cancelled) return;
      if (!current) {
        window.location.replace('/login');
        return;
      }
      setUser(current);
      setState('ready');
    }).catch(() => {
      if (!cancelled) window.location.replace('/login');
    });
    return () => { cancelled = true; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setState('saving');
    try {
      const session = getSession();
      await onboardSupabaseSession(session?.access_token, {
        orgName,
        website,
        displayName: user?.user_metadata?.full_name || user?.user_metadata?.name || ''
      });
      window.location.replace('/app?start=groundwork');
    } catch (err) {
      setError(err.message || 'Could not create the organization.');
      setState('ready');
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell">
        <div className="onboarding-copy">
          <a className="auth-wordmark" href="/">UJIMA</a>
          <p className="auth-kicker">ONE SMALL SETUP</p>
          <h1>Tell UJIMA who it is working for.</h1>
          <p>That is enough to create your private organization workspace. Groundwork can collect the rest from verified public evidence and ask only when something truly needs you.</p>
          <div className="auth-proof">
            <strong>What happens next</strong>
            <span>UJIMA opens a conversation and starts with Groundwork: identity, trust, discovery, action paths, funding readiness and evidence.</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Organization name
            <input className="input" autoComplete="organization" required maxLength={160} value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Your nonprofit or project" />
          </label>
          <label>
            Website <span className="optional">(optional)</span>
            <input className="input" type="url" autoComplete="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://organization.org" />
          </label>

          {error && <div className="notice auth-error" role="alert">{error}</div>}

          <button className="cta auth-submit" disabled={state !== 'ready' || !orgName.trim()}>
            {state === 'saving' ? 'CREATING WORKSPACE…' : 'OPEN UJIMA'}
          </button>
          <p className="auth-fineprint">No legal status, tax status, impact metric or eligibility claim is assumed during setup.</p>
        </form>
      </section>
    </main>
  );
}
