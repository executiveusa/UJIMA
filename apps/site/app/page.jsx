'use client';
import { useState } from 'react';
import { PublicNav } from '../components/PublicNav';
import { tenantSite } from '../tenant.config';

const proof = [
  ['Frontend changes per client', 'Public pages, visuals, copy, schema, and AI-readable files are customized for each nonprofit.'],
  ['Backend stays shared', 'Approvals, ICM, opportunity scans, reports, imports, campaigns, and adapters improve centrally.'],
  ['One primary agent', 'ICM folders route the work. Models can change without rewriting the operating system.']
];

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    childrenCount: '1',
    ageRange: 'Mixed ages',
    arrivalWindow: 'Not sure yet',
    consent: false,
    volunteerInterest: false,
    schoolSuppliesInterest: false
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setStatus({ loading: false, success: false, error: 'Please fill in required fields (Name & Email).' });
      return;
    }
    if (!formData.consent) {
      setStatus({ loading: false, success: false, error: 'Please accept the contact statement consent.' });
      return;
    }
    setStatus({ loading: true, success: false, error: null });
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus({ loading: false, success: true, error: null });
      } else {
        setStatus({ loading: false, success: false, error: data.error || 'Submission failed.' });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message || 'Network error' });
    }
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
      <PublicNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Event', name: 'ASC3ND Community Cuts & Back-to-School Event', startDate: '2026-08-15T10:00:00-07:00', location: { '@type': 'Place', name: 'Tangles & Locs', address: tenantSite.region } })}} />
      <main id="main-content">
        <section className="hero refined">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Seattle youth + sports + social purpose</span>
              <h1>One calm AI operating system for the work nonprofits actually need to finish.</h1>
              <p className="lead">Funding, approvals, donors, calls, reports, campaigns, founder memory, and an AI-readable public site. Built once as a shared backend. Customized through the frontend and ICM files for each organization.</p>
              <div className="hero-actions">
                <a className="cta" href="#rsvp">RSVP for Community Event</a>
                <a className="cta ghost" href="#offer">View deployment package</a>
              </div>
            </div>
            <div className="device-card" aria-label="Mission OS preview">
              <div className="device-top"><span></span><span></span><span></span></div>
              <div className="preview-pane">
                <span className="badge mint">Today</span>
                <h3>3 decisions need a human.</h3>
                {[
                  ['Review youth grant package', 'Red approval · signer needed'],
                  ['Start Google for Nonprofits readiness', 'Yellow review · documents needed'],
                  ['Draft sponsor campaign', 'Orange review · no auto-send']
                ].map(([a,b]) => <div className="preview-row clean" key={a}><span><strong>{a}</strong><small>{b}</small></span><span className="score-chip">Open</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="rsvp" className="section surface">
          <div className="container">
            <div className="card offer-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h2>Event RSVP & Family Sign-up</h2>
              <p>Reserve your family's spot for cuts, styling, and school supplies.</p>
              
              {status.success ? (
                <div className="notice" style={{ background: '#052e16', borderColor: '#10b981', color: '#6ee7b7' }}>
                  <strong>RSVP Confirmed!</strong> We look forward to seeing you. A confirmation record has been saved.
                </div>
              ) : (
                <form className="form" onSubmit={handleSubmit}>
                  {status.error && (
                    <div className="notice" style={{ background: '#450a0a', borderColor: '#ef4444', color: '#fca5a5' }} role="alert">
                      {status.error}
                    </div>
                  )}
                  <label>
                    Parent/Guardian Full Name *
                    <input className="input" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </label>
                  <label>
                    Email Address *
                    <input className="input" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </label>
                  <label>
                    Phone Number (Optional)
                    <input className="input" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Children Attending
                      <select className="select" value={formData.childrenCount} onChange={(e) => setFormData({ ...formData, childrenCount: e.target.value })}>
                        {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label>
                      Age Range
                      <select className="select" value={formData.ageRange} onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}>
                        <option value="Mixed ages">Mixed ages</option>
                        <option value="Elementary (5-10)">Elementary (5-10)</option>
                        <option value="Middle / High (11-18)">Middle / High (11-18)</option>
                      </select>
                    </label>
                  </div>
                  <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '8px 0' }}>
                    <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData({ ...formData, consent: e.target.checked })} required aria-required="true" />
                    <span>I consent to receiving event updates via email or SMS *</span>
                  </label>
                  <button type="submit" className="cta" disabled={status.loading}>
                    {status.loading ? 'Submitting...' : 'Confirm Family RSVP'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section id="venue" className="section surface">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Event Location</span>
              <h2>Tangles & Locs Salon & Spa</h2>
              <p>2253 S 123rd St, Suite 6 · Seattle, WA</p>
            </div>
            <div className="card venue-card" style={{ display: 'grid', placeItems: 'center', background: '#0a0e17', borderRadius: '24px', padding: '20px', overflow: 'hidden' }}>
              <div style={{ width: '100%', maxWidth: '720px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#131b2e', borderRadius: '16px', overflow: 'hidden' }}>
                <img 
                  src="/images/tangles-and-locs-flyer.jpg" 
                  alt="Tangles & Locs Salon and Spa Venue Exterior" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="system" className="section surface">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">Repeatable deployment</span><h2>Stop selling websites. Ship a mission operating layer.</h2><p>The public site is part of the package because AI agents, grant reviewers, donors, and volunteers need a readable front door. The operating backend remains productized and reusable.</p></div>
            <div className="grid cols-3">{proof.map(([title, text]) => <Card key={title} title={title} text={text} />)}</div>
          </div>
        </section>

        <section id="outcomes" className="section">
          <div className="container split">
            <div><span className="eyebrow">Nontechnical by default</span><h2>Users choose outcomes, not agents.</h2><p>No one has to understand MCP, Pi, Absurd, Sandcastle, Postiz, or model routing. Staff see clear buttons: find funding, prepare application, grow donors, coordinate volunteers, report impact, and review before sending.</p></div>
            <div className="grid">
              {['Find funding', 'Prepare application', 'Grow donors', 'Report impact'].map((x, i) => <div className="card outcome-card" key={x}><span className="score-chip">0{i+1}</span><h3>{x}</h3><p>Every action writes to an ICM stage, creates an audit trail, and waits for human approval when needed.</p></div>)}
            </div>
          </div>
        </section>

        <section id="offer" className="section surface">
          <div className="container">
            <div className="card offer-card">
              <span className="badge gold">Seattle Social Purpose OS</span>
              <h2>{tenantSite.offerTitle}</h2>
              <p>{tenantSite.offerBody}</p>
              <div className="grid cols-4">
                {['AI-ready website', 'Seattle opportunity engine', 'Founder Second Brain', 'Postiz campaigns', 'Voice/call lane', 'Approval/audit trail', 'ICM workspace', 'Flywheel hosting'].map((x) => <div className="mini-tile" key={x}>{x}</div>)}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="container">{tenantSite.productName} · Built for Seattle mission teams · llms.txt included</div></footer>
    </>
  );
}
function Card({ title, text }) { return <div className="card"><h3>{title}</h3><p>{text}</p></div>; }
