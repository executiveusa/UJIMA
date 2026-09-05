export function PublicNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a className="brand" href="/">
          <span className="logo" aria-hidden="true">UJ</span>
          <span>UJIMA OS</span>
        </a>
        <div className="nav-links">
          <a href="/#system">System</a>
          <a href="/#outcomes">Outcomes</a>
          <a href="/#offer">Offer</a>
          <span className="lang-switch" aria-label="Language options">
            <button type="button" className="lang-btn active" aria-current="true">EN</button>
            <button type="button" className="lang-btn">ES</button>
          </span>
          <a href="/login" className="cta dark">Member sign in</a>
        </div>
      </div>
    </nav>
  );
}
