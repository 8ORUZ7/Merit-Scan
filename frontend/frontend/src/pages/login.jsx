import React, { useEffect, useRef } from 'react';
import '../styles.css';

export default function Login() {
  const scriptsRan = useRef(false);

  useEffect(() => {
    if (scriptsRan.current) return;
    scriptsRan.current = true;

    /* Mobile Drawer */
    (function(){
      const btn=document.getElementById('mobileNavBtn');
      const drawer=document.getElementById('mobileDrawer');
      if(!btn||!drawer)return;
      function open(){drawer.hidden=false;btn.setAttribute('aria-expanded','true');document.body.classList.add('no-scroll');}
      function close(){drawer.hidden=true;btn.setAttribute('aria-expanded','false');document.body.classList.remove('no-scroll');}
      btn.addEventListener('click',()=>drawer.hidden?open():close());
      drawer.addEventListener('click',e=>{ if(e.target.matches('[data-close]')||e.target.closest('a.mobile-link')) close(); });
      addEventListener('resize',()=>{ if(innerWidth>900) close(); });
      if(innerWidth>900) close();
    })();

    /* Reveal */
    (function(){
      const obs=new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}
      }),{threshold:.2});
      document.querySelectorAll('.reveal-up').forEach(el=>obs.observe(el));
    })();

    /* Login Form */
    (function(){
      const form=document.getElementById('loginForm');
      if(!form) return;
      const pwd=form.querySelector('#password');
      const toggle=form.querySelector('.pwd-toggle');
      toggle.addEventListener('click',()=>{
        const vis=toggle.getAttribute('data-visible')==='true';
        pwd.type=vis?'password':'text';
        toggle.setAttribute('data-visible',!vis);
        toggle.textContent=vis?'👁':'🙈';
      });
      function setError(id,msg){
        const input=form.querySelector('#'+id);
        const p=form.querySelector('[data-msg-for="'+id+'"]');
        if(p){ p.textContent=msg||''; }
        input.classList.toggle('is-invalid', !!msg);
      }
      form.addEventListener('submit',e=>{
        let bad=false;
        ['email','password'].forEach(id=>{
          const input=form.querySelector('#'+id);
          if(!input.checkValidity()){ setError(id,input.validationMessage); bad=true; }
          else setError(id,'');
        });
        if(bad){ e.preventDefault(); return; }
        e.preventDefault();
        const btn=document.getElementById('loginBtn');
        btn.classList.add('loading'); btn.disabled=true;
        setTimeout(()=>{
          btn.classList.remove('loading'); btn.disabled=false;
          alert('Logged in (demo)!');
          form.reset();
        },1100);
      });
    })();
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="topbar" data-elevate>
        <div className="container topbar-inner">
          <a className="brand" href="index.html">
            <div className="brand-logo-wrap">
              <img className="brand-logo" src="https://i.imgur.com/4Z5b1aH.png" alt="Logo" />
            </div>
            <span className="brand-name">Merit Scan</span>
          </a>
          <nav className="topnav" aria-label="Primary">
            <button className="nav-toggle-btn" id="mobileNavBtn" aria-label="Menu" aria-expanded="false" aria-controls="mobileDrawer">
              <span className="bar"></span><span className="bar"></span><span className="bar"></span>
            </button>
            <ul className="topnav-list" id="mainNav">
              <li><a className="topnav-link" href="index.html">Home</a></li>
              <li><a className="topnav-link" href="register.html">Register</a></li>
              <li><a className="topnav-link active" href="login.html">Login</a></li>
            </ul>
          </nav>
        </div>
        <div className="mobile-drawer" id="mobileDrawer" hidden>
          <nav aria-label="Mobile navigation">
            <a className="mobile-link" href="index.html" data-close>Home</a>
            <a className="mobile-link" href="register.html" data-close>Register</a>
            <a className="mobile-link active" href="login.html" data-close>Login</a>
          </nav>
        </div>
      </header>

      <main id="main" className="auth-main">
        <section className="hero hero-compact">
          <div className="container">
            <h1 className="hero-title reveal-up" style={{ marginBottom: '10px' }}>Welcome Back</h1>
            <p className="hero-subtitle reveal-up delay-1" style={{ maxWidth: '640px' }}>Sign in to manage attendance and merits.</p>
          </div>
        </section>

        <section className="container auth-wrap">
          <div className="card form-card elevate reveal-up">
            <h2 className="form-title">Login</h2>
            <form className="form" id="loginForm" noValidate>
              <div className="field">
                <label htmlFor="school_id">School ID (optional)</label>
                <input className="input" id="school_id" name="school_id" type="text" autoComplete="off" />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" autoComplete="email" required />
                <p className="field-msg" data-msg-for="email"></p>
              </div>

              <div className="field password-field">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input
                    className="input"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$#]).{8,}$"
                    aria-describedby="pwHelp"
                  />
                  <button type="button" className="pwd-toggle" aria-label="Show password" data-visible="false">👁</button>
                </div>
                <div id="pwHelp" className="help-text small">
                  Same rules as registration (uppercase, number, special).
                </div>
                <p className="field-msg" data-msg-for="password"></p>
              </div>

              <div className="field remember-row">
                <label className="remember">
                  <input type="checkbox" id="remember" name="remember" />
                  <span>Remember session</span>
                </label>
                <a href="#" className="small link subtle-link">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary full btn-lg" id="loginBtn">
                <span className="btn-label">Sign In</span>
                <span className="btn-spinner" aria-hidden="true"></span>
              </button>
            </form>
            <p className="form-note">New to Merit Scan? <a href="register.html" className="link">Create an account</a>.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3 className="footer-heading">Merit Scan</h3>
            <p className="footer-text small">Unified Attendance &amp; Merit Platform</p>
          </div>
          <div>
            <h3 className="footer-heading">Links</h3>
            <ul className="footer-list">
              <li><a className="footer-link" href="register.html">Register</a></li>
              <li><a className="footer-link" href="index.html#features">Features</a></li>
            </ul>
          </div>
        </div>
        <p className="copyright">© 2025 Merit Scan</p>
      </footer>

      <div id="liveRegion" className="visually-hidden" aria-live="polite"></div>
    </>
  );
}