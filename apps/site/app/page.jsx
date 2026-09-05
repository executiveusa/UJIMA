'use client';

import { useState } from 'react';
import styles from './ujima.module.css';

const WAITLIST_ENDPOINT = 'https://cyxdevcjycmffhmwxojh.supabase.co/functions/v1/ujima-waitlist';

const examples = [
  'Find grants we actually qualify for.',
  'Prepare next week’s outreach.',
  'Who needs a follow-up?',
  'Turn these notes into a clear report.',
];

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function requestAccess(event) {
    event.preventDefault();
    if (!email) return;
    setStatus({ state: 'loading', message: 'Sending…' });
    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, language: navigator.language || 'en', source: 'ujima-os-landing' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error('REQUEST_FAILED');
      setEmail('');
      setStatus({ state: 'success', message: 'You’re on the private beta list.' });
    } catch {
      setStatus({ state: 'error', message: 'We could not save your request. Please try again.' });
    }
  }

  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#content">Skip to content</a>

      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Ujima home">UJIMA</a>
        <div className={styles.headerActions}>
          <span className={styles.beta}>PRIVATE BETA</span>
          <a className={styles.textLink} href="/login">Sign in</a>
        </div>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="ujima-title">
        <div className={styles.heroIdentity}>
          <h1 id="ujima-title" className={styles.heroWord}>UJIMA</h1>
          <p className={styles.heroTagline}>Collective work. Shared responsibility.</p>
        </div>

        <div className={styles.definitionBlock}>
          <p className={styles.languageLabel}>DEFINITION</p>
          <p className={styles.definitionEnglish}>People contributing what they can, solving problems together, and building for the good of the whole community.</p>
        </div>

        <div className={styles.heroFooter}>
          <p>UJIMA helps mission-driven teams get more done without giving up human judgment or control.</p>
          <a href="/login" className={styles.arrowLink}>OPEN UJIMA <span aria-hidden="true">↘</span></a>
        </div>
      </section>

      <section id="content" className={styles.statement}>
        <p className={styles.kicker}>WHY UJIMA</p>
        <h2>Good work should not get buried under admin.</h2>
        <p className={styles.statementBody}>Tell UJIMA the outcome. It can organize the context, prepare the work, keep track of what matters, and bring you in when a decision needs a person.</p>
      </section>

      <section className={styles.askSection} aria-label="Example requests">
        <div className={styles.askIntro}>
          <p className={styles.kicker}>START WITH THE OUTCOME</p>
          <h2>Say what needs to get done.</h2>
        </div>
        <div className={styles.promptList}>
          {examples.map((example, index) => (
            <div className={styles.promptRow} key={example}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{example}</p>
              <span aria-hidden="true">→</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.modelSection}>
        <div className={styles.modelLabel}>HOW IT WORKS</div>
        <div className={styles.modelFlow} aria-label="Ujima operating model">
          <span>ASK</span><i>→</i><span>WORK</span><i>→</i><span>REVIEW</span><i>→</i><span>REMEMBER</span>
        </div>
        <p>Underneath the simple interface are organizational memory, specialist tools, approvals, evidence, and model routing. You should not have to manage any of that by hand.</p>
      </section>

      <section id="beta" className={styles.betaSection}>
        <div>
          <p className={styles.kicker}>PRIVATE BETA</p>
          <h2>Try UJIMA.</h2>
          <p>We are opening the system to a small group of nonprofit and community teams while the core workflows are being proven in real work.</p>
          <p><a href="/login" style={{color:'inherit',fontWeight:700}}>Already have access? Sign in →</a></p>
        </div>
        <form className={styles.waitlist} onSubmit={requestAccess}>
          <label htmlFor="ujima-email">Email address</label>
          <div className={styles.formRow}>
            <input id="ujima-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organization.org" />
            <button type="submit" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'SENDING…' : 'REQUEST ACCESS'}</button>
          </div>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="company-site">Website</label>
            <input id="company-site" tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </div>
          <p className={`${styles.formStatus} ${status.state === 'error' ? styles.formError : ''}`} role="status" aria-live="polite">{status.message || 'Beta updates and invitations only.'}</p>
        </form>
      </section>

      <footer className={styles.footer}>
        <div>UJIMA</div>
        <div>Collective work. Shared responsibility.</div>
        <div>Private beta</div>
      </footer>
    </main>
  );
}
