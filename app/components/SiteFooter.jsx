export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell footer-main">
        <div className="footer-brand">
          <a className="footer-logo" href="/" aria-label="Perma Cool home">
            <img className="footer-brand-mark" src="/images/brand/perma-cool.png" alt="" width="42" height="42" />
            <img
              className="footer-brand-wordmark"
              src="/images/brand/perma-cool-wordmark.png"
              alt="Perma Cool"
              width="194"
              height="20"
            />
          </a>
          <p>Purpose-built cooling systems for botanical extraction.</p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <div>
            <span>Systems</span>
            <a href="/ethanol-chilling-systems">Ethanol Chillers</a>
            <a href="/butane-recovery-system">Butane Recovery</a>
          </div>
          <div>
            <span>Resources</span>
            <a href="/learning-center">Learning Center</a>
            <a href="/contact-us">Request a Quote</a>
          </div>
          <div>
            <span>Contact</span>
            <a href="tel:+17472081001">747.208.1001</a>
            <a href="mailto:sales@perma.cool">sales@perma.cool</a>
          </div>
        </nav>
      </div>

      <div className="footer-shell footer-bottom">
        <div className="footer-legal-links">
          <span>© 2026 Perma Cool Systems Inc.</span>
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms-and-conditions">Terms</a>
        </div>
        <span>Performance and specifications subject to final engineering review.</span>
      </div>
    </footer>
  );
}
