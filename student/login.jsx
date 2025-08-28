import React, { useEffect, useRef } from 'react';
import './styles.css';

/*
  Student Login React Port
  - Converted from student/login.html
  - Form validation + theme toggle + announce logic preserved
  - After "sign in" it navigates to /student (adjust as needed)
*/

export default function StudentLogin({ onLoginRedirect = () => { window.location.href = '/student'; } }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const $ = id => document.getElementById(id);
    function announce(msg) {
      const r = $('ariaLive');
      if (!r) return;
      r.textContent = '';
      setTimeout(() => (r.textContent = msg), 10);
    }

    /* Theme toggle */
    (function () {
      const KEY = 'ms-theme';
      const btn = $('themeToggle');
      const saved = (() => { try { return localStorage.getItem(KEY); } catch (_) { return null; } })();
      const prefersDark = matchMedia('(prefers-color-scheme:dark)').matches;
      apply(saved || (prefersDark ? 'dark' : 'light'));
      btn?.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (_) { }
        announce('Theme switched to ' + next);
      });
      function apply(t) {
        document.documentElement.setAttribute('data-theme', t);
        if (btn) {
          btn.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
          btn.setAttribute('aria-pressed', t === 'dark');
        }
      }
    })();

    /* Year */
    $('yearNow').textContent = new Date().getFullYear().toString();

    /* Form submit */
    $('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = $('email').value.trim();
      const pw = $('password').value;
      if (!email) {
        announce('Email required');
        $('email').focus();
        return;
      }
      if (!pw) {
        announce('Password required');
        $('password').focus();
        return;
      }
      const pattern = new RegExp($('password').getAttribute('pattern'));
      if (!pattern.test(pw)) {
        announce('Password does not meet complexity');
        $('password').focus();
        return;
      }
      announce('Signing in...');
      setTimeout(() => {
        onLoginRedirect(); // callback, can route using React Router
      }, 600);
    });
  }, [onLoginRedirect]);

  return (
    <body className="auth-body">
      <a className="visually-hidden" href="#loginForm">Skip to login form</a>
      <main className="auth-main" role="main">
        <header className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to manage attendance and merits.</p>
        </header>

        <div className="form-card auth-card" id="loginCard">
          <h2 className="panel-title" style={{ marginTop: 0 }}>Student Login</h2>
          <form id="loginForm" className="auth-form" noValidate>
            <div className="form-row">
              <label htmlFor="schoolId" className="form-label">School ID</label>
              <input id="schoolId" type="text" className="input-control" defaultValue="102842" readOnly aria-readonly="true" />
            </div>
            <div className="form-row">
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" name="email" type="email" className="input-control" required autoComplete="username" placeholder="you@school.edu" />
            </div>
            <div className="form-row">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-control"
                required
                autoComplete="current-password"
                pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$#]).{8,}$"
                title="At least 8 characters, one uppercase letter, one number, and one special character (!@#$#)"
              />
              <div className="field-hint">Min 8 chars, 1 uppercase, 1 number, 1 special (!@#$#)</div>
            </div>
            <div className="form-actions" style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-primary w-100" id="loginBtn">Sign In</button>
            </div>
            <p className="small" style={{ margin: '16px 0 0', textAlign: 'center' }}>
              <a href="#" id="forgotLink">Forgot password?</a>
            </p>
          </form>
        </div>

        <footer className="auth-footer">
          <p className="small">© <span id="yearNow"></span> Merit Scan. All rights reserved.</p>
        </footer>
      </main>

      <button id="themeToggle" className="btn btn-ghost btn-sm theme-toggle-floating" aria-pressed="false" aria-label="Toggle dark mode" type="button">
        Dark Mode
      </button>

      <div id="ariaLive" className="visually-hidden" aria-live="polite"></div>
    </body>
  );
}