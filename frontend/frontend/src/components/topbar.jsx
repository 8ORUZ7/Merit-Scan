import React, { useEffect, useState, useCallback } from 'react';

/*
  Topbar Component (extracted & refactored from index.html)

  Key Features:
  - Responsive navigation (desktop list + mobile drawer)
  - Accessible mobile toggle (aria-expanded, focus trapping optional)
  - Sticky elevation shadow when page scrolled
  - Active link highlighting based on currentPath prop
  - Preserves original class names & structure for CSS compatibility

  Props:
  - currentPath (string) -> used to set active state on nav links (e.g. '/login', '/register', '#features')
  - onNavigate (fn(href)) -> optional callback for client-side routing; preventDefault & call this if provided
  - links (array) -> override default nav link set
  - brandHref (string) -> link target for brand (default '/')
  - includeMobileDrawer (bool) -> default true; set false to hide drawer for embedded usage

  Usage:
    <Topbar currentPath={location.pathname} onNavigate={handleRoute} />
*/

const DEFAULT_LINKS = [
  { label: 'Home', href: 'index.html' },
  { label: 'Register', href: 'register.html' },
  { label: 'Login', href: 'login.html' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Topbar({
  currentPath = '',
  onNavigate,
  links = DEFAULT_LINKS,
  brandHref = 'index.html',
  includeMobileDrawer = true,
  logoSrc = 'https://i.imgur.com/4Z5b1aH.png',
  brandName = 'Merit Scan',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Normalize currentPath for hash sections
  const isActive = useCallback(
    (href) => {
      if (!href) return false;
      if (href.startsWith('#')) {
        // hash section active if window location hash matches or currentPath includes it
        return typeof window !== 'undefined' && window.location.hash === href;
      }
      // Compare stripped trailing slashes
      const clean = (s) => s.replace(/\/+$/, '');
      return clean(currentPath || '') === clean(href);
    },
    [currentPath]
  );

  const handleLinkClick = (e, href) => {
    if (onNavigate) {
      // If using client-side routing intercept
      const isHash = href.startsWith('#');
      if (!isHash) e.preventDefault();
      onNavigate(href);
    }
    if (href.startsWith('#')) {
      // Smooth scroll for anchor links
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // Close mobile drawer after click
    setMobileOpen(false);
    document.body.classList.remove('no-scroll');
  };

  // Scroll shadow handler
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer if viewport widened
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900 && mobileOpen) {
        setMobileOpen(false);
        document.body.classList.remove('no-scroll');
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (!includeMobileDrawer) return;
    if (mobileOpen) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [mobileOpen, includeMobileDrawer]);

  const toggleMobile = () => setMobileOpen(o => !o);

  return (
    <header
      className={`topbar${isScrolled ? ' is-scrolled' : ''}`}
      data-elevate
      role="banner"
    >
      <div className="container topbar-inner">
        <a className="brand" href={brandHref} aria-label={`${brandName} Home`} onClick={(e) => onNavigate && handleLinkClick(e, brandHref)}>
          <div className="brand-logo-wrap">
            <img className="brand-logo" src={logoSrc} alt={`${brandName} Logo`} />
          </div>
          <span className="brand-name">{brandName}</span>
        </a>

        <nav className="topnav" aria-label="Primary">
          {includeMobileDrawer && (
            <button
              className="nav-toggle-btn"
              id="mobileNavBtn"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobileDrawer"
              onClick={toggleMobile}
              type="button"
            >
              <span className="bar" /><span className="bar" /><span className="bar" />
            </button>
          )}
          <ul className="topnav-list" id="mainNav">
            {links.map(l => (
              <li key={l.href}>
                <a
                  className={`topnav-link${isActive(l.href) ? ' active' : ''}`}
                  href={l.href}
                  onClick={(e) => handleLinkClick(e, l.href)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {includeMobileDrawer && (
        <div
          className="mobile-drawer"
            id="mobileDrawer"
          hidden={!mobileOpen}
          aria-hidden={!mobileOpen}
        >
          <nav aria-label="Mobile navigation">
            {links.map(l => (
              <a
                key={l.href}
                className={`mobile-link${isActive(l.href) ? ' active' : ''}`}
                href={l.href}
                data-close=""
                onClick={(e) => handleLinkClick(e, l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}