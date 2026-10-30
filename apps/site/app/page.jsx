'use client';

import { useState } from 'react';
import styles from './ujima.module.css';

const WAITLIST_ENDPOINT = 'https://cyxdevcjycmffhmwxojh.supabase.co/functions/v1/ujima-waitlist';

const groundworkStages = [
  ['01', 'Identity', 'Confirm who the organization is and what public records say.'],
  ['02', 'Trust', 'Check the website, public proof, leadership, donation and contact paths.'],
  ['03', 'Discovery', 'Check Google, search, listings, local presence and consistency.'],
  ['04', 'Readiness', 'Find funding, accessibility, privacy, ownership and operations gaps.'],
  ['05', 'Repair', 'Fix what UJIMA is authorized to fix and stop only where approval matters.'],
  ['06', 'Proof', 'Verify the result, save evidence and remember what changed.'],
];

const findings = [
  { label: 'Google hours', state: 'Mismatch found', tone: 'warn' },
  { label: 'Donation flow', state: 'Mobile failure', tone: 'risk' },
  { label: 'Analytics ownership', state: 'Unknown', tone: 'open' },
  { label: 'Governance proof', state: 'Missing', tone: 'open' },
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
      setStatus({ state: 'success', message: 'Request saved. We will send access details to this address.' });
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
          <a className={styles.textLink} href="#groundwork">Groundwork</a>
          <a className={styles.textLink} href="/login">Sign in</a>
        </div>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="ujima-title">
        <div className={styles.heroIdentity}>
          <p className={styles.kicker}>NONPROFIT OPERATING SYSTEM</p>
          <h1 id="ujima-title" className={styles.heroHeadline}>Your nonprofit has enough work already.</h1>
          <p className={styles.heroTagline}>Tell UJIMA what needs doing. It handles the digital and administrative work, brings you in when judgment matters, and leaves proof.</p>
          <div className={styles.heroActions}>
            <a href="/login?intent=groundwork" className={styles.primaryAction}>Run a Groundwork scan <span aria-hidden="true">→</span></a>
            <a href="#groundwork" className={styles.secondaryAction}>See how UJIMA works</a>
          </div>
        </div>

        <div className={styles.heroProof} aria-label="Example UJIMA conversation">
          <div className={styles.proofTop}>
            <span className={styles.proofMark}>U</span>
            <div><strong>Groundwork</strong><small>Example nonprofit readiness run</small></div>
            <span className={styles.liveDot}>DEMO</span>
          </div>
          <div className={styles.demoThread}>
            <div className={styles.demoUser}>We just started a youth nonprofit. We have a website and donation page, but I don't know what else we need.</div>
            <div className={styles.demoAssistant}>I'll run Groundwork first. I’ll check the foundation before recommending more work.</div>
          </div>
          <div className={styles.demoFindings}>
            {findings.map((finding) => (
              <div key={finding.label} className={styles.findingRow}>
                <span>{finding.label}</span>
                <strong data-tone={finding.tone}>{finding.state}</strong>
              </div>
            ))}
          </div>
          <div className={styles.demoDecision}>
            <strong>4 issues found.</strong>
            <span>I can fix 2. One needs your approval. One needs a document from you.</span>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <p><strong>UJIMA works underneath the conversation.</strong> Goals, workflows, specialist tools, approvals, evidence and memory stay out of your way until they matter.</p>
          <span>WE HANDLE IT → YOU APPROVE IMPORTANT DECISIONS → YOU SEE RESULTS</span>
        </div>
      </section>

      <section id="content" className={styles.statement}>
        <p className={styles.kicker}>THE PROBLEM</p>
        <h2>Starting a nonprofit quietly creates another full-time job.</h2>
        <div className={styles.statementGrid}>
          <p>Website. Google. Donations. Volunteers. Grants. Forms. Analytics. Records. Privacy. Board information. Follow-up. Reporting. Every tool solves one piece and leaves the organization coordinating the rest.</p>
          <p>UJIMA coordinates the work. Groundwork starts by checking whether the organization is actually ready to be found, trusted, funded and operated.</p>
        </div>
      </section>

      <section id="groundwork" className={styles.groundworkSection}>
        <div className={styles.sectionLead}>
          <div>
            <p className={styles.kicker}>GROUNDWORK</p>
            <h2>Start with the foundation.</h2>
          </div>
          <p>Groundwork is UJIMA’s nonprofit launch and readiness workflow. It does not bury staff in a giant checklist. It finds the few things that matter now, shows the evidence, and routes the next work.</p>
        </div>

        <div className={styles.stageList}>
          {groundworkStages.map(([number, title, body]) => (
            <article className={styles.stage} key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.modelSection} aria-label="Ujima operating model">
        <p className={styles.modelLabel}>ONE SIMPLE LOOP</p>
        <div className={styles.modelFlow}>
          <span>TELL US</span><i>→</i><span>UJIMA WORKS</span><i>→</i><span>YOU DECIDE</span><i>→</i><span>PROOF</span>
        </div>
        <p>The normal interface is conversation, work status, approvals and artifacts. The complexity stays underneath.</p>
      </section>

      <section className={styles.resultSection}>
        <div className={styles.resultCopy}>
          <p className={styles.kicker}>WHAT YOU GET</p>
          <h2>A clear next move, not another dashboard.</h2>
        </div>
        <div className={styles.resultGrid}>
          <div><strong>READY</strong><span>What is already strong and should stay.</span></div>
          <div><strong>MISSING</strong><span>What a donor, funder, volunteer or partner cannot verify.</span></div>
          <div><strong>RISKY</strong><span>What could damage trust, accessibility, safety or operations.</span></div>
          <div><strong>NEXT</strong><span>What UJIMA can fix, what needs approval, and what needs a human document.</span></div>
        </div>
      </section>

      <section id="beta" className={styles.betaSection}>
        <div>
          <p className={styles.kicker}>START</p>
          <h2>Run Groundwork on your organization.</h2>
          <p>Sign in if you already have access. Otherwise request access and include your organization website so UJIMA can start from real public evidence.</p>
          <p><a href="/login?intent=groundwork" className={styles.inlineAction}>Already have access? Open UJIMA →</a></p>
        </div>
        <form className={styles.waitlist} onSubmit={requestAccess}>
          <label htmlFor="ujima-email">Work email</label>
          <input id="ujima-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organization.org" />
          <label htmlFor="ujima-site">Organization website</label>
          <input id="ujima-site" type="url" autoComplete="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://organization.org" />
          <button type="submit" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'SENDING…' : 'REQUEST ACCESS'}</button>
          <p className={styles.formStatus + (status.state === 'error' ? ' ' + styles.formError : '')} role="status" aria-live="polite">{status.message || 'No fake readiness score. UJIMA works from evidence.'}</p>
        </form>
      </section>

      <footer className={styles.footer}>
        <div>UJIMA</div>
        <div>Collective work. Shared responsibility.</div>
        <div><a href="/login">Sign in</a></div>
      </footer>
    </main>
  );
}
