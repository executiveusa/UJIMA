export function PublicNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a className="brand" href="/">
          <img src="/images/asc3nd-logo.jpg" alt="ASC3ND Logo" style={{ height: '32px', width: 'auto', display: 'block' }} />
          <span>Asc3nd Social Purpose OS</span>
        </a>
        <div className="nav-links">
          <a href="/#system">System</a>
          <a href="/#outcomes">Outcomes</a>
          <a href="/#offer">Offer</a>
          <span className="lang-switch" aria-label="Language options">
            <button type="button" className="lang-btn active" aria-current="true">EN</button>
            <button type="button" className="lang-btn">ES</button>
          </span>
          <a href="/login" className="cta dark">Ops login</a>
        </div>
      </div>
    </nav>
  );
}
