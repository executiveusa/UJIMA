'use client';

import { useState } from 'react';
import styles from './ujima.module.css';

const WAITLIST_ENDPOINT = 'https://cyxdevcjycmffhmwxojh.supabase.co/functions/v1/ujima-waitlist';

const capabilities = [
  ['Organize', 'Turn scattered conversations, documents, people, programs, and commitments into usable organizational context.'],
  ['Research', 'Find opportunities, grants, partners, travel information, local resources, and answers across languages.'],
  ['Create', 'Prepare campaigns, translations, outreach, reports, briefs, applications, social content, and working files.'],
  ['Coordinate', 'Route work to the right people and agents, track what is moving, and surface what needs a human decision.'],
  ['Remember', 'Keep institutional memory connected to the work so knowledge does not disappear when people, tools, or models change.'],
  ['Protect', 'Keep consequential actions human-controlled while reversible research, drafting, and internal work can move autonomously.'],
];

const examples = [
  'Find grants we actually qualify for.',
  'Translate this volunteer guide into Swahili and Spanish.',
  'Prepare next month\'s social campaign.',
  'Who have we promised to follow up with?',
  'Help us plan a community program in Zanzibar.',
  'Turn these notes into a donor-ready impact report.',
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
        <a className={styles.wordmark} href="#top" aria-label="Ujima OS home">UJIMA <span>OS</span></a>
        <div className={styles.headerActions}>
          <span className={styles.beta}>PRIVATE BETA</span>
          <a className={styles.textLink} href="/login">Member sign in</a>
        </div>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="ujima-title">
        <div className={styles.heroTopline}>
          <span>KISWAHILI</span>
          <span>noun · /uˈdʒi.ma/</span>
        </div>

        <h1 id="ujima-title" className={styles.heroWord}>UJIMA</h1>

        <div className={styles.definitionGrid}>
          <div>
            <p className={styles.languageLabel}>KISWAHILI</p>
            <p className={styles.definitionSwahili} lang="sw">
              Mfumo wa kijamii unaojengwa juu ya kazi ya pamoja, uwajibikaji wa pamoja, na kila mtu kuchangia kwa uwezo wake kwa manufaa ya jamii nzima.
            </p>
          </div>
          <div>
            <p className={styles.languageLabel}>ENGLISH</p>
            <p className={styles.definitionEnglish}>
              Collective work and shared responsibility: people contributing what they can, solving problems together, and building for the good of the whole community.
            </p>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <p>One agentic operating system for volunteers, nonprofits, community groups, and social-purpose teams.</p>
          <a href="#beta" className={styles.arrowLink}>REQUEST ACCESS <span aria-hidden="true">↘</span></a>
        </div>
      </section>

      <section id="content" className={styles.statement}>
        <p className={styles.kicker}>WHY UJIMA</p>
        <h2>Good work should not be limited by administrative capacity.</h2>
        <p className={styles.statementBody}>
          Ujima OS is being built for the people doing the work: volunteers, small teams, nonprofit leaders, community organizers, social enterprises, and mission-driven groups that need more capacity without losing human judgment or control.
        </p>
      </section>

      <section className={styles.askSection} aria-label="Example requests">
        <div className={styles.askIntro}>
          <p className={styles.kicker}>START WITH THE OUTCOME</p>
          <h2>Tell Ujima what needs to get done.</h2>
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

      <section className={styles.systemSection}>
        <div className={styles.sectionLead}>
          <p className={styles.kicker}>A DIFFERENT KIND OF OPERATING SYSTEM</p>
          <h2>People keep the mission. The system carries more of the digital work.</h2>
        </div>
        <div className={styles.capabilityGrid}>
          {capabilities.map(([title, text], index) => (
            <article className={styles.capability} key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.modelSection}>
        <div className={styles.modelLabel}>THE MODEL</div>
        <div className={styles.modelFlow} aria-label="Ujima operating model">
          <span>ASK</span><i>→</i><span>WORK</span><i>→</i><span>REVIEW</span><i>→</i><span>REMEMBER</span>
        </div>
        <p>
          Under the surface, Ujima combines organizational context, specialist agents, tools, languages, approvals, and durable memory. The interface stays simple: ask for an outcome, see the work, step in when judgment matters.
        </p>
      </section>

      <section className={styles.globalSection}>
        <p className={styles.kicker}>BUILT TO TRAVEL</p>
        <div className={styles.globalGrid}>
          <h2>Seattle.<br />Zanzibar.<br />Anywhere people organize around purpose.</h2>
          <div>
            <p>
              Ujima is being designed for multilingual, cross-cultural work from the beginning: translation, travel research, local context, program planning, communications, partnerships, and the everyday coordination that small mission-driven teams usually carry by hand.
            </p>
            <p>
              ASC3ND is the first live proving ground. The architecture is designed to become reusable for other organizations without copying their private data, relationships, or institutional memory.
            </p>
          </div>
        </div>
      </section>

      <section id="beta" className={styles.betaSection}>
        <div>
          <p className={styles.kicker}>PRIVATE BETA</p>
          <h2>Help shape Ujima.</h2>
          <p>We are inviting a small group of volunteers, nonprofit teams, community organizations, and social-purpose operators to test the system as it develops.</p>
        </div>
        <form className={styles.waitlist} onSubmit={requestAccess}>
          <label htmlFor="ujima-email">Email address</label>
          <div className={styles.formRow}>
            <input
              id="ujima-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@organization.org"
            />
            <button type="submit" disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'SENDING…' : 'REQUEST ACCESS'}
            </button>
          </div>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="company-site">Website</label>
            <input id="company-site" tabIndex="-1" autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </div>
          <p className={`${styles.formStatus} ${status.state === 'error' ? styles.formError : ''}`} role="status" aria-live="polite">
            {status.message || 'No spam. Beta updates and invitations only.'}
          </p>
        </form>
      </section>

      <footer className={styles.footer}>
        <div>UJIMA OS</div>
        <div>Collective work. Shared responsibility.</div>
        <div>Private beta · first developed with ASC3ND</div>
      </footer>
    </main>
  );
}
