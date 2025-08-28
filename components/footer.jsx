import React, { useCallback } from 'react';

/*
  Footer Component (extracted from index.html)

  Features:
  - Scroll-to-top button (smooth scrolling)
  - Contact, snapshot list, status block
  - Accepts props to override email, year, and link groups
  - Preserves class names for styling parity with existing CSS
  - Includes optional "Back to top" button visibility logic (simple always-visible; can enhance)

  Props:
  - email (string)
  - snapshotItems (array<string>)
  - year (number) -> default current year
  - statusText (string)
  - onScrollTop (fn) -> override default scrollTo handler

  Example:
    <Footer email="support@example.com" snapshotItems={['Unified Logs','QR Scan']} />
*/

export default function Footer({
  email = 'alexandraacedo07@gmail.com',
  snapshotItems = ['Unified Logs', 'Merit & Rank', 'QR Scanning', 'Accessible UI'],
  year = new Date().getFullYear(),
  statusText = 'Prototype / evolving feature set.',
  onScrollTop,
  showScrollButton = true,
}) {
  const handleScrollTop = useCallback(() => {
    if (onScrollTop) {
      onScrollTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onScrollTop]);

  return (
    <footer className="site-footer" id="contact" role="contentinfo">
      <div className="container footer-grid">
        <div>
          <h3 className="footer-heading">Get in Touch</h3>
          <p className="footer-text">Feedback &amp; inquiries:</p>
          <p>
            <a href={`mailto:${email}`} className="footer-link">
              {email}
            </a>
          </p>
        </div>
        <div>
          <h3 className="footer-heading">Snapshot</h3>
          <ul className="footer-list">
            {snapshotItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="footer-heading">Status</h3>
          <p className="footer-text small">{statusText}</p>
          {showScrollButton && (
            <button
              className="btn btn-ghost btn-sm"
              id="scrollTopBtn"
              type="button"
              onClick={handleScrollTop}
            >
              ↑ Back to top
            </button>
          )}
        </div>
      </div>
      <p className="copyright">
        © {year} Merit Scan. All rights reserved.
      </p>
    </footer>
  );
}