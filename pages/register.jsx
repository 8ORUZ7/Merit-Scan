import React, { useEffect, useRef } from 'react';
import '../styles.css';

export default function Register() {
  // Prevent script re‑initialization (useful if StrictMode double-invokes effects in dev)
  const scriptsRan = useRef(false);

  useEffect(() => {
    if (scriptsRan.current) return;
    scriptsRan.current = true;

    /* Mobile Drawer */
    (function(){
      const btn=document.getElementById('mobileNavBtn');
      const drawer=document.getElementById('mobileDrawer');
      if(!btn||!drawer) return;
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

    /* Register Form */
    (function(){
      const form=document.getElementById('registerForm');
      if(!form) return;
      const pwd=form.querySelector('#password');
      const toggle=form.querySelector('.pwd-toggle');
      const bar=form.querySelector('.pw-bar');
      const label=form.querySelector('.pw-label b');
      toggle.addEventListener('click',()=>{
        const vis=toggle.getAttribute('data-visible')==='true';
        pwd.type=vis?'password':'text';
        toggle.setAttribute('data-visible',!vis);
        toggle.textContent=vis?'👁':'🙈';
      });
      function strength(v){
        let s=0;
        if(/[A-Z]/.test(v)) s++;
        if(/[0-9]/.test(v)) s++;
        if(/[!@#$#]/.test(v)) s++;
        if(v.length>=8) s++;
        return s;
      }
      pwd.addEventListener('input',()=>{
        const v=pwd.value;
        const s=strength(v);
        bar.style.width=['0%','25%','50%','75%','100%'][s];
        bar.dataset.level=s;
        label.textContent=!v?'—':['Weak','Weak','Fair','Good','Strong'][s];
      });

      const fileInput=form.querySelector('#upload_idcard');
      const fileLabel=form.querySelector('[data-file-label]');
      const clearBtn=document.getElementById('clearFileBtn');
      const preview=document.getElementById('filePreview');
      fileInput.addEventListener('change',()=>{
        if(fileInput.files && fileInput.files[0]){
          const f=fileInput.files[0];
            fileLabel.textContent=f.name;
          clearBtn.hidden=false;
          if(f.type.startsWith('image/')){
            const fr=new FileReader();
            fr.onload=e=>{
              preview.innerHTML='<img src="'+e.target.result+'" alt="ID preview">';
              preview.hidden=false;
            };
            fr.readAsDataURL(f);
          } else preview.hidden=true;
        } else {
          fileLabel.textContent='Choose file...';
          clearBtn.hidden=true;
          preview.hidden=true;
        }
      });
      clearBtn.addEventListener('click',()=>{
        fileInput.value='';
        fileInput.dispatchEvent(new Event('change'));
      });

      function showError(el,msg){
        const p=form.querySelector('[data-msg-for="'+el.id+'"]');
        if(p) p.textContent=msg||'';
        el.classList.toggle('is-invalid', !!msg);
      }
      form.addEventListener('submit',e=>{
        let invalid=false;
        ['name','profession','email','password','upload_idcard'].forEach(id=>{
          const el=form.querySelector('#'+id);
          if(el && !el.checkValidity()){ showError(el, el.validationMessage); invalid=true; }
          else showError(el,'');
        });
        if(invalid){ e.preventDefault(); return; }
        e.preventDefault();
        const btn=document.getElementById('registerBtn');
        btn.classList.add('loading'); btn.disabled=true;
        setTimeout(()=>{
          btn.classList.remove('loading'); btn.disabled=false;
          alert('Registered (demo)!');
          form.reset();
          fileInput.dispatchEvent(new Event('change'));
          pwd.dispatchEvent(new Event('input'));
        },1200);
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
              <li><a className="topnav-link active" href="register.html">Register</a></li>
              <li><a className="topnav-link" href="login.html">Login</a></li>
            </ul>
          </nav>
        </div>
        <div className="mobile-drawer" id="mobileDrawer" hidden>
          <nav aria-label="Mobile navigation">
            <a className="mobile-link" href="index.html" data-close>Home</a>
            <a className="mobile-link active" href="register.html" data-close>Register</a>
            <a className="mobile-link" href="login.html" data-close>Login</a>
          </nav>
        </div>
      </header>

      <main id="main" className="auth-main">
        <section className="hero hero-compact">
          <div className="container">
            <h1 className="hero-title reveal-up" style={{ marginBottom: '10px' }}>Create Your Account</h1>
            <p className="hero-subtitle reveal-up delay-1" style={{ maxWidth: '680px' }}>Start managing attendance &amp; merits with a streamlined toolkit.</p>
          </div>
        </section>

        <section className="container auth-wrap">
          <div className="card form-card elevate reveal-up">
            <h2 className="form-title">Register</h2>
            <form className="form" id="registerForm" noValidate>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input className="input" id="name" name="name" type="text" autoComplete="name" required />
                <p className="field-msg" data-msg-for="name"></p>
              </div>

              <div className="field">
                <label htmlFor="profession">Profession</label>
                <div className="select-wrap">
                  <select className="input" id="profession" name="profession" required>
                    <option value="">Select one</option>
                    <option value="teacher">Teacher</option>
                    <option value="professor">Professor</option>
                    <option value="adviser">Adviser</option>
                  </select>
                </div>
                <p className="field-msg" data-msg-for="profession"></p>
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
                    required
                    pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$#]).{8,}$"
                    aria-describedby="pwHelp pwStrength"
                    autoComplete="new-password"
                  />
                  <button type="button" className="pwd-toggle" aria-label="Show password" data-visible="false">👁</button>
                </div>
                <div id="pwHelp" className="help-text">
                  Min 8 chars, 1 uppercase, 1 number, 1 special (!@#$#)
                </div>
                <div id="pwStrength" className="pw-meter" aria-live="polite">
                  <span className="pw-bar"></span>
                  <span className="pw-label">Strength: <b>—</b></span>
                </div>
                <p className="field-msg" data-msg-for="password"></p>
              </div>

              <fieldset className="levels fieldset">
                <legend>Levels</legend>
                <label><input type="radio" name="levels" value="grade" required /> Grade School</label>
                <label><input type="radio" name="levels" value="high" /> High School</label>
                <label><input type="radio" name="levels" value="college" /> College</label>
              </fieldset>

              <div className="field">
                <label htmlFor="school_campus">School / Campus</label>
                <input className="input" id="school_campus" name="school_campus" type="text" autoComplete="organization" />
              </div>

              <div className="field file-field">
                <label htmlFor="upload_idcard">Upload Valid ID</label>
                <div className="file-box">
                  <input className="file-input" id="upload_idcard" name="upload_idcard" type="file" accept="image/*" required />
                  <span className="file-label" data-file-label>Choose file...</span>
                  <button type="button" className="btn btn-ghost btn-xs" id="clearFileBtn" hidden>Clear</button>
                </div>
                <div className="preview" id="filePreview" hidden></div>
                <p className="field-msg" data-msg-for="upload_idcard"></p>
              </div>

              <button type="submit" className="btn btn-primary full btn-lg" id="registerBtn">
                <span className="btn-label">Create Account</span>
                <span className="btn-spinner" aria-hidden="true"></span>
              </button>
            </form>
            <p className="form-note">Already have an account? <a href="login.html" className="link">Sign In</a>.</p>
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
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-list">
              <li><a className="footer-link" href="index.html">Home</a></li>
              <li><a className="footer-link" href="login.html">Login</a></li>
            </ul>
          </div>
        </div>
        <p className="copyright">© 2025 Merit Scan</p>
      </footer>

      <div id="liveRegion" className="visually-hidden" aria-live="polite"></div>
    </>
  );
}