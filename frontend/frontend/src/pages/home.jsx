import React, { useEffect, useRef } from 'react';
import '../styles.css';

export default function Home() {
  const scriptsRan = useRef(false);

  useEffect(() => {
    if (scriptsRan.current) return;
    scriptsRan.current = true;

    /* Helpers */
    const qs = s => document.querySelector(s);
    const qsa = s => [...document.querySelectorAll(s)];

    /* Mobile Drawer */
    (function(){
      const btn=qs('#mobileNavBtn');
      const drawer=qs('#mobileDrawer');
      if(!btn||!drawer) return;
      function open(){drawer.hidden=false;btn.setAttribute('aria-expanded','true');document.body.classList.add('no-scroll');}
      function close(){drawer.hidden=true;btn.setAttribute('aria-expanded','false');document.body.classList.remove('no-scroll');}
      btn.addEventListener('click',()=>drawer.hidden?open():close());
      drawer.addEventListener('click',e=>{ if(e.target.matches('[data-close]')||e.target.closest('a.mobile-link')) close(); });
      addEventListener('resize',()=>{ if(innerWidth>900) close(); });
      if(innerWidth>900) close();
    })();

    /* Sticky header shadow */
    (function(){
      const h=qs('[data-elevate]');
      if(!h) return;
      const onScroll=()=>h.classList.toggle('is-scrolled', scrollY>4);
      addEventListener('scroll',onScroll,{passive:true});
      onScroll();
    })();

    /* Reveal animations */
    (function(){
      const obs=new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target);} });
      },{threshold:.18});
      qsa('.reveal-up,.reveal-fade,.reveal-scale').forEach(el=>obs.observe(el));
    })();

    /* Carousels */
    (function(){
      qsa('.carousel').forEach(root=>{
        const track=root.querySelector('.carousel-track');
        const slides=[...track.children];
        const prev=root.querySelector('.carousel-btn.prev');
        const next=root.querySelector('.carousel-btn.next');
        const dots=root.querySelector('.carousel-dots');
        let i=0,timer;
        slides.forEach((_,idx)=>{
          const b=document.createElement('button');
          b.type='button'; b.className='carousel-dot';
          b.setAttribute('aria-label','Go to slide '+(idx+1));
          b.addEventListener('click',()=>go(idx));
          dots.appendChild(b);
        });
        function go(n){
          i=(n+slides.length)%slides.length;
          track.style.transform='translateX('+(-i*100)+'%)';
          slides.forEach((s,si)=>s.classList.toggle('is-active',si===i));
            dots.querySelectorAll('.carousel-dot').forEach((d,di)=>d.classList.toggle('active',di===i));
          restart();
        }
        function nextSlide(){ go(i+1); }
        function prevSlide(){ go(i-1); }
        function restart(){ clearInterval(timer); timer=setInterval(nextSlide,5500); }
        prev.addEventListener('click',prevSlide);
        next.addEventListener('click',nextSlide);
        go(0);
      });
    })();

    /* Smooth anchor scroll */
    (function(){
      qsa('a[href^="#"]').forEach(a=>{
        a.addEventListener('click',e=>{
          const id=a.getAttribute('href').slice(1);
          const t=qs('#'+CSS.escape(id));
          if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
        });
      });
    })();

    /* Scroll to top */
    (function(){
      const b=qs('#scrollTopBtn');
      b && b.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    })();

  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>

      <header className="topbar" data-elevate>
        <div className="container topbar-inner">
          <a className="brand" href="index.html" aria-label="Merit Scan Home">
            <div className="brand-logo-wrap">
              <img className="brand-logo" src="https://i.imgur.com/4Z5b1aH.png" alt="Merit Scan Logo" />
            </div>
            <span className="brand-name">Merit Scan</span>
          </a>

            <nav className="topnav" aria-label="Primary">
            <button className="nav-toggle-btn" id="mobileNavBtn" aria-label="Menu" aria-expanded="false" aria-controls="mobileDrawer">
              <span className="bar"></span><span className="bar"></span><span className="bar"></span>
            </button>
            <ul className="topnav-list" id="mainNav">
              <li><a className="topnav-link active" href="index.html">Home</a></li>
              <li><a className="topnav-link" href="register.html">Register</a></li>
              <li><a className="topnav-link" href="login.html">Login</a></li>
              <li><a className="topnav-link" href="#features">Features</a></li>
              <li><a className="topnav-link" href="#about">About</a></li>
              <li><a className="topnav-link" href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>

        <div className="mobile-drawer" id="mobileDrawer" hidden>
          <nav aria-label="Mobile navigation">
            <a className="mobile-link active" href="index.html" data-close>Home</a>
            <a className="mobile-link" href="register.html" data-close>Register</a>
            <a className="mobile-link" href="login.html" data-close>Login</a>
            <a className="mobile-link" href="#features" data-close>Features</a>
            <a className="mobile-link" href="#about" data-close>About</a>
            <a className="mobile-link" href="#contact" data-close>Contact</a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-text">
              <h1 className="hero-title reveal-up">Attendance & Merit Tracking. Simplified.</h1>
              <p className="hero-subtitle reveal-up delay-1">
                A unified platform for logging attendance, awarding merits, tracking rankings, and generating reports—across every school level.
              </p>
              <div className="hero-cta reveal-up delay-2">
                <a href="register.html" className="btn btn-primary btn-lg"><span>Create Account</span></a>
                <a href="login.html" className="btn btn-ghost btn-lg"><span>Sign In</span></a>
              </div>
              <ul className="hero-bullets reveal-up delay-3" aria-label="Key benefits">
                <li>No credit card required</li>
                <li>Fast QR scanning workflow</li>
                <li>Accessibility aware</li>
              </ul>
            </div>
            <div className="hero-art reveal-scale">
              <div className="stack-screens">
                <div className="screen-card shadow-pop delay">
                  <div className="placeholder-chart">
                    <span className="bar h-60"></span>
                    <span className="bar h-92"></span>
                    <span className="bar h-75"></span>
                    <span className="bar h-84"></span>
                    <span className="bar h-40"></span>
                    <span className="bar h-68"></span>
                  </div>
                  <p className="mini-caption">Live Attendance Bars</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-wave" aria-hidden="true"></div>
        </section>

        {/* Features */}
        <section className="feature-section" id="features">
          <div className="container">
            <h2 className="section-heading center reveal-up">Platform Features</h2>
            <p className="section-lead center reveal-up delay-1 in center-only">
              Built for administrators, advisers, and students—streamlining daily academic tracking.
            </p>

            <div className="features-grid">
              <article className="feature-card reveal-fade">
                <h3 className="feature-title">Unified Records</h3>
                <p>Attendance logs and merit points unified for faster decisions.</p>
                <ul className="micro-list">
                  <li>Present / Late / Absent tagging</li>
                  <li>Merit adjustments</li>
                  <li>Combined analytics</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-1">
                <h3 className="feature-title">QR Scan &amp; Validate</h3>
                <p>Rapid scanning with manual fallback and live status badges.</p>
                <ul className="micro-list">
                  <li>Code parsing</li>
                  <li>Instant feedback</li>
                  <li>History log</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-2">
                <h3 className="feature-title">Real-Time Ranking</h3>
                <p>Merit leaderboards with streak &amp; progress context.</p>
                <ul className="micro-list">
                  <li>Top snapshots</li>
                  <li>Full exports</li>
                  <li>Streak tags</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-3">
                <h3 className="feature-title">Appeals &amp; Tickets</h3>
                <p>Students submit corrections, admins review quickly.</p>
                <ul className="micro-list">
                  <li>Categories</li>
                  <li>Status flow</li>
                  <li>Audit trail</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-4">
                <h3 className="feature-title">Multi-Level Support</h3>
                <p>Grade, High School, College — flexible year &amp; course fields.</p>
                <ul className="micro-list">
                  <li>Dynamic forms</li>
                  <li>Filters</li>
                  <li>Role layout</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-5">
                <h3 className="feature-title">Accessibility</h3>
                <p>Keyboard navigation &amp; reduced motion friendly interface.</p>
                <ul className="micro-list">
                  <li>Focus outlines</li>
                  <li>Skip link</li>
                  <li>ARIA live</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-6">
                <h3 className="feature-title">Export &amp; Reports</h3>
                <p>Consistent formatting ready for analysis.</p>
                <ul className="micro-list">
                  <li>CSV hooks</li>
                  <li>Smart filters</li>
                  <li>Batch tools</li>
                </ul>
              </article>
              <article className="feature-card reveal-fade delay-7">
                <h3 className="feature-title">Scalable Architecture</h3>
                <p>Tokenized styles &amp; modular components.</p>
                <ul className="micro-list">
                  <li>Design tokens</li>
                  <li>Low specificity</li>
                  <li>Future-proof</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Preview Carousels */}
        <section className="preview-section">
          <div className="container">
            <h2 className="section-heading center reveal-up">Interface Previews</h2>
            <p className="section-lead center reveal-up delay-1">Admin and Student dashboard look &amp; feel.</p>

            <div className="carousel-block reveal-fade" aria-labelledby="adminPreviewTitle">
              <h3 id="adminPreviewTitle" className="carousel-title">Admin Dashboard Preview</h3>
              <div className="carousel" data-carousel="admin">
                <button className="carousel-btn prev" aria-label="Previous slide">&larr;</button>
                <div className="carousel-track">
                  <div className="slide is-active"><img src="https://dummyimage.com/1200x640/1abc9c/ffffff&text=Admin+Overview" alt="Admin overview" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/3498db/ffffff&text=Attendance+Analytics" alt="Attendance analytics" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/e67e22/ffffff&text=QR+Scan+Panel" alt="QR scan panel" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/9b59b6/ffffff&text=Merit+Ranking" alt="Merit ranking table" /></div>
                </div>
                <button className="carousel-btn next" aria-label="Next slide">&rarr;</button>
                <div className="carousel-dots" aria-label="Slide indicators"></div>
              </div>
            </div>

            <div className="carousel-block reveal-fade delay-2" aria-labelledby="studentPreviewTitle">
              <h3 id="studentPreviewTitle" className="carousel-title">Student Account Preview</h3>
              <div className="carousel" data-carousel="student">
                <button className="carousel-btn prev" aria-label="Previous slide">&larr;</button>
                <div className="carousel-track">
                  <div className="slide is-active"><img src="https://dummyimage.com/1200x640/2ecc71/ffffff&text=Merit+Summary" alt="Student merit summary" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/34495e/ffffff&text=Progress+&+Streak" alt="Progress and streak" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/2980b9/ffffff&text=Ticket+Submission" alt="Ticket submission" /></div>
                  <div className="slide"><img src="https://dummyimage.com/1200x640/c0392b/ffffff&text=Profile+Settings" alt="Profile settings" /></div>
                </div>
                <button className="carousel-btn next" aria-label="Next slide">&rarr;</button>
                <div className="carousel-dots" aria-label="Slide indicators"></div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="about-section" id="about">
          <div className="container">
            <div className="card about-card reveal-up">
              <h2 className="section-heading">About Merit Scan</h2>
              <p className="flow-text">
                Merit Scan began as a student-led thesis project aiming to streamline academic record management. By consolidating attendance and merit workflows into a single interface, routine tasks become clearer, faster and more reliable.
              </p>
              <p className="flow-text">
                Core design goals: <strong>Clarity</strong>, <strong>Speed</strong>, <strong>Fairness</strong>, and <strong>Resilience</strong>. Each feature is structured around predictable patterns and token-driven visuals.
              </p>
              <p className="flow-text">
                From attendance tagging to QR generation, the project illustrates how deliberate UI structure can reduce friction without adding complexity.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="container footer-grid">
          <div>
            <h3 className="footer-heading">Get in Touch</h3>
            <p className="footer-text">Feedback &amp; inquiries:</p>
            <p><a href="mailto:alexandraacedo07@gmail.com" className="footer-link">alexandraacedo07@gmail.com</a></p>
          </div>
          <div>
            <h3 className="footer-heading">Snapshot</h3>
            <ul className="footer-list">
              <li>Unified Logs</li>
              <li>Merit &amp; Rank</li>
              <li>QR Scanning</li>
              <li>Accessible UI</li>
            </ul>
          </div>
          <div>
            <h3 className="footer-heading">Status</h3>
            <p className="footer-text small">Prototype / evolving feature set.</p>
            <button className="btn btn-ghost btn-sm" id="scrollTopBtn" type="button">↑ Back to top</button>
          </div>
        </div>
        <p className="copyright">© 2025 Merit Scan. All rights reserved.</p>
      </footer>

      <div id="liveRegion" className="visually-hidden" aria-live="polite"></div>
    </>
  );
}