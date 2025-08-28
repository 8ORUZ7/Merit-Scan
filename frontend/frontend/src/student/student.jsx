import React, { useEffect, useRef } from 'react';
import './styles.css';

/*
  Student Dashboard React Port
  - Converted from student/dashboard.html
  - Keeps original IDs/classes for CSS + JS parity
  - All imperative logic moved into a single useEffect (mirrors original script)
  - You can later refactor into modular hooks/components if desired
*/

export default function StudentDashboard() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    /* ===================== Helper Utilities ===================== */
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));
    const announce = msg => {
      const r = $('#ariaLive');
      if (!r) return;
      r.textContent = '';
      setTimeout(() => (r.textContent = msg), 10);
    };

    function showToast(message, type = 'info', timeout = 3600) {
      const stack = $('#toastStack');
      if (!stack) return;
      const t = document.createElement('div');
      t.className = `toast toast-${type}`;
      t.innerHTML = `<span class="toast-msg">${message}</span><button class="toast-close" aria-label="Dismiss">&times;</button>`;
      stack.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      const remove = () => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
      };
      t.querySelector('.toast-close').addEventListener('click', remove);
      setTimeout(remove, timeout);
    }

    /* ===================== Theme Toggle ===================== */
    (function () {
      const KEY = 'ms-theme';
      const btn = $('#themeToggle');
      const saved = (() => {
        try { return localStorage.getItem(KEY); } catch (_) { return null; }
      })();
      const prefersDark = matchMedia('(prefers-color-scheme:dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      apply(theme);
      btn?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (_) {}
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

    /* ===================== SIDEBAR TOGGLE (Push Layout) ===================== */
    (function () {
      const KEY = 'ms-sidebar-hidden';
      const mq = window.matchMedia('(max-width:900px)');
      const body = document.body;
      const sidebar = $('#sidebar');
      const toggle = $('#sidebarToggle');
      const main = $('.main');

      function isMobile() { return mq.matches; }
      function readPref() {
        try {
          const v = localStorage.getItem(KEY);
            return v === null ? true : v === '1';
        } catch (_) { return true; }
      }
      function persist() {
        if (isMobile()) return;
        try {
          localStorage.setItem(KEY, body.classList.contains('sidebar-hidden') ? '1' : '0');
        } catch (_) {}
      }
      function applyInitial() {
        const hidden = readPref();
        body.classList.toggle('sidebar-hidden', hidden);
        adjustMain();
        syncAria();
      }
      function adjustMain() {
        if (isMobile()) {
          main.style.marginLeft = '0';
          if (!body.classList.contains('sidebar-hidden')) body.classList.add('sidebar-overlay');
          else body.classList.remove('sidebar-overlay');
        } else {
          body.classList.remove('sidebar-overlay');
          if (body.classList.contains('sidebar-hidden')) {
            main.style.marginLeft = '0';
          } else {
            main.style.marginLeft = 'var(--sidebar-width)';
          }
        }
      }
      function openSidebar() {
        body.classList.remove('sidebar-hidden');
        adjustMain();
        syncAria();
        persist();
      }
      function closeSidebar() {
        body.classList.add('sidebar-hidden');
        adjustMain();
        syncAria();
        persist();
      }
      function toggleSidebar() {
        body.classList.contains('sidebar-hidden') ? openSidebar() : closeSidebar();
      }
      function syncAria() {
        const expanded = !body.classList.contains('sidebar-hidden');
        toggle.setAttribute('aria-expanded', expanded);
        toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
      }

      document.addEventListener('click', e => {
        if (!isMobile()) return;
        if (body.classList.contains('sidebar-hidden')) return;
        if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
        closeSidebar();
      });

      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !body.classList.contains('sidebar-hidden')) {
          closeSidebar();
          toggle.focus();
        }
      });

      mq.addEventListener('change', () => {
        applyInitial();
      });

      toggle.addEventListener('click', e => {
        e.stopPropagation();
        toggleSidebar();
      });

      applyInitial();
    })();

    /* ===================== Panels / Navigation ===================== */
    (function () {
      const links = $$('.nav-link, .breadcrumb a[data-target]');
      const panels = $$('.panel');
      function activate(id, label) {
        panels.forEach(p => p.classList.toggle('active', p.id === id));
        links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
        $('#pageTitle').textContent = label;
        $('#crumbCurrent').textContent = label;
        announce(label + ' panel opened');
      }
      links.forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const target = a.dataset.target;
          if (!target) return;
          activate(target, a.textContent.trim());
        });
      });
      activate('panel-points', 'Merit Points');
    })();

    /* ===================== KPI Count Animations ===================== */
    (function () {
      const targets = $$('[data-count-num]');
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const goal = parseInt(el.closest('[data-count]').dataset.count, 10) || 0;
            const start = 0, dur = 900, t0 = performance.now();
            (function anim(t) {
              const p = Math.min((t - t0) / dur, 1);
              const ease = p < .5 ? 2 * p * p : (-1 + (4 - 2 * p) * p);
              el.firstChild.textContent = Math.round(start + (goal - start) * ease);
              if (p < 1) requestAnimationFrame(anim);
            })(t0);
            io.unobserve(el);
          }
        });
      }, { threshold: .4 });
      targets.forEach(t => io.observe(t));
    })();

    /* ===================== Activity Feed ===================== */
    (function () {
      const feedData = [
        { icon: '➕', txt: 'Gained 5 merit points for punctuality.' },
        { icon: '🎯', txt: 'Completed weekly attendance streak.' },
        { icon: '⭐', txt: 'Commendation: assisted a classmate.' },
        { icon: '➖', txt: 'Lost 2 points (uniform issue).' }
      ];
      const feed = $('#activityFeed');
      feedData.forEach(i => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `<span class="act-icon">${i.icon}</span><span>${i.txt}</span>`;
        feed.appendChild(li);
      });
    })();

    /* ===================== Ticket Form ===================== */
    (function () {
      const form = $('#ticketForm');
      const list = $('#submittedTickets');
      if (!form) return;
      form.addEventListener('submit', e => {
        e.preventDefault();
        const reason = $('#ticketReason').value.trim();
        if (reason.length < 10) { showToast('Please provide more detail (≥ 10 chars)', 'error'); return; }
        const type = ($('#ticketType').value || 'other').toLowerCase();
        const id = Math.random().toString(36).slice(2, 7).toUpperCase();
        const chip = document.createElement('div');
        chip.className = 'ticket-chip';
        chip.innerHTML = `<span class="chip-badge">${type}</span><span class="chip-text">${reason.replace(/</g, '&lt;')}</span><span class="chip-id">#${id}</span>`;
        list.prepend(chip);
        showToast('Ticket submitted (#' + id + ')', 'success');
        form.reset();
      });
    })();

    /* ===================== Account Form ===================== */
    (function () {
      const level = $('#accLevel');
      const sets = {
        College: ['rowMajor', 'rowCourse', 'rowYearCollege'],
        'High School': ['rowYearHS'],
        'Grade School': ['rowYearGS']
      };
      function sync() {
        ['rowMajor', 'rowCourse', 'rowYearCollege', 'rowYearHS', 'rowYearGS'].forEach(id => $('#' + id)?.classList.add('hidden'));
        (sets[level.value] || []).forEach(id => $('#' + id)?.classList.remove('hidden'));
      }
      level?.addEventListener('change', sync);
      sync();
      $('#accountForm')?.addEventListener('submit', e => {
        e.preventDefault();
        if (!$('#accName').value.trim()) return showToast('Name required', 'error');
        if (!$('#accEmail').value.includes('@')) return showToast('Invalid email', 'error');
        $('#profileName').textContent = $('#accName').value.trim();
        const file = $('#avatarFile').files[0];
        if (file) {
          const fr = new FileReader();
          fr.onload = ev => {
            $('#profileAvatar').src = ev.target.result;
            $('#accountAvatar').src = ev.target.result;
          };
          fr.readAsDataURL(file);
        }
        showToast('Account settings saved', 'success');
      });
      $('#avatarFile')?.addEventListener('change', e => {
        const f = e.target.files[0];
        if (!f) return;
        const fr = new FileReader();
        fr.onload = ev => $('#accountAvatar').src = ev.target.result;
        fr.readAsDataURL(f);
      });
    })();

    /* ===================== Profile Modal ===================== */
    (function () {
      const modal = $('#profileModal');
      const openBtn = $('#editProfileBtn');
      const closeBtn = $('#modalClose');
      const cancelBtn = $('#modalCancel');
      function open() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        $('#modalName').value = $('#profileName').textContent.trim();
        trapFocus(modal);
        $('#modalName').focus();
      }
      function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        openBtn.focus();
      }
      openBtn?.addEventListener('click', open);
      closeBtn?.addEventListener('click', close);
      cancelBtn?.addEventListener('click', close);
      modal?.addEventListener('click', e => { if (e.target === modal) close(); });

      $('#profileForm')?.addEventListener('submit', e => {
        e.preventDefault();
        $('#profileName').textContent = $('#modalName').value.trim();
        $('#accName').value = $('#modalName').value.trim();
        const file = $('#modalAvatar').files[0];
        if (file) {
          const fr = new FileReader();
          fr.onload = ev => {
            $('#profileAvatar').src = ev.target.result;
            $('#accountAvatar').src = ev.target.result;
          };
          fr.readAsDataURL(file);
        }
        showToast('Profile updated', 'success');
        close();
      });
      function trapFocus(container) {
        const f = [...container.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        container.addEventListener('keydown', e => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          } else if (e.key === 'Escape') { close(); }
        });
      }
    })();

    /* ===================== Autosize Textareas ===================== */
    (function () {
      $$('.autosize').forEach(a => {
        const resize = () => {
          a.style.height = 'auto';
          a.style.height = a.scrollHeight + 'px';
        };
        a.addEventListener('input', resize);
        resize();
      });
    })();

    /* ===================== Shortcuts & Logout ===================== */
    (function () {
      $('#logoutBtn')?.addEventListener('click', () => {
        if (confirm('Log out?')) {
          showToast('Logged out', 'info', 1500);
          setTimeout(() => location.reload(), 650);
        }
      });
      window.addEventListener('keydown', e => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
          const ta = $('#ticketReason');
          if (ta) {
            e.preventDefault();
            document.querySelector('[data-target="panel-ticket"]').click();
            ta.focus();
            showToast('Jumped to ticket form', 'info', 1700);
          }
        }
      });
    })();

    /* ===================== Demo Merit Increment ===================== */
    (function () {
      let ticks = 0;
      setInterval(() => {
        ticks++;
        if (ticks % 30 === 0) {
          const el = document.querySelector('.kpi-card.merit .kpi-value');
          if (!el) return;
          const current = parseInt(el.textContent, 10);
          const next = current + 1;
          animateNumber(el, current, next, 900);
          showToast('Merit +1 (demo)', 'success', 1800);
        }
      }, 1000);
      function animateNumber(el, start, end, dur) {
        const t0 = performance.now();
        (function loop(t) {
          const p = Math.min((t - t0) / dur, 1);
          const ease = p < .5 ? 2 * p * p : (-1 + (4 - 2 * p) * p);
          el.firstChild.textContent = Math.round(start + (end - start) * ease);
          if (p < 1) requestAnimationFrame(loop);
        })(t0);
      }
    })();

  }, []);

  return (
    <body className="sidebar-hidden sidebar-overlay no-js">
      <a className="visually-hidden" href="#mainContent">Skip to content</a>

      <aside id="sidebar" className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-profile" style={{ borderBottom: '1px solid rgba(255,255,255,.08)', padding: '18px 20px 20px' }}>
          <div className="profile-img">
            <img id="profileAvatar" src="https://i.imgur.com/4Z5b1aH.png" alt="Profile" />
          </div>
          <div className="profile-meta">
            <span id="profileName" className="profile-name" style={{ fontWeight: 600, fontSize: '.9rem' }}>Jane Doe</span>
            <span id="onlineStatus" className="profile-status" style={{ fontSize: '.55rem', letterSpacing: '.5px', fontWeight: 700, color: '#2ecc71', marginTop: 6 }}>ONLINE</span>
          </div>
        </div>
        <nav className="sidebar-nav" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
          <ul className="nav-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li className="nav-label">DASHBOARD</li>
            <li><a href="#" className="nav-link active" data-target="panel-points">Merit Points</a></li>
            <li className="nav-label">APPEAL</li>
            <li><a href="#" className="nav-link" data-target="panel-ticket">Submit Ticket</a></li>
            <li className="nav-label">SETTINGS</li>
            <li><a href="#" className="nav-link" data-target="panel-account">Account</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer" style={{ padding: '18px 18px 30px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button id="themeToggle" className="btn btn-ghost btn-sm w-100" aria-pressed="false" type="button">Dark Mode</button>
          <button id="logoutBtn" className="btn btn-danger btn-sm w-100" type="button">Log Out</button>
        </div>
      </aside>

      <main id="mainContent" className="main" tabIndex={-1}>
        <header className="main-header">
          <div className="header-left">
            <button id="sidebarToggle" aria-expanded="false" aria-label="Open navigation" type="button">
              <span className="toggle-lines">
                <span></span><span></span><span></span>
              </span>
            </button>
            <div>
              <h1 id="pageTitle" className="page-title">Merit Points</h1>
              <ol className="breadcrumb">
                <li><a href="#" data-target="panel-points" className="crumb">Home</a></li>
                <li id="crumbCurrent" aria-current="page">Merit Points</li>
              </ol>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: 10 }}>
            <button id="editProfileBtn" className="btn btn-primary btn-sm" type="button">Edit Profile</button>
          </div>
        </header>

        {/* Merit Points Panel */}
        <section id="panel-points" className="panel active" aria-labelledby="pageTitle">
          <div className="kpi-grid">
            <article className="kpi-card merit" data-count="121">
              <h2 className="kpi-label">Merit Points</h2>
              <div className="kpi-value" data-count-num>0</div>
              <div className="progress"><div className="progress-bar" style={{ width: '60%' }}></div></div>
              <p className="kpi-sub">60% to next reward</p>
            </article>
            <article className="kpi-card late" data-count="2">
              <h2 className="kpi-label">Late</h2>
              <div className="kpi-value" data-count-num>0</div>
              <p className="kpi-sub">This month</p>
            </article>
            <article className="kpi-card absent" data-count="1">
              <h2 className="kpi-label">Absences</h2>
              <div className="kpi-value" data-count-num>0</div>
              <p className="kpi-sub">This month</p>
            </article>
            <article className="kpi-card streak" data-count="10">
              <h2 className="kpi-label">Streak</h2>
              <div className="kpi-value" data-count-num>0<span style={{ fontSize: '1.15rem' }}>🔥</span></div>
              <p className="kpi-sub">Days Present</p>
            </article>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22 }}>
            <div className="panel-tile">
              <h3 className="tile-title">Recent Activity</h3>
              <ul id="activityFeed" className="activity-feed"></ul>
            </div>
            <div className="panel-tile">
              <h3 className="tile-title">Rank & Progress</h3>
              <div className="rank-block" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div id="rankNumber" style={{ fontSize: '2.2rem', fontWeight: 700 }}># 12</div>
                <div className="progress"><div id="rankBar" className="progress-bar" style={{ width: '42%', background: 'linear-gradient(90deg,var(--color-secondary,#3498db),var(--color-secondary-hover,#2d82bb))' }}></div></div>
                <p className="kpi-sub" style={{ margin: 0 }}>Top 25% of your level</p>
              </div>
              <div id="streakChip" className="streak-chip" role="status" aria-label="10 day streak">
                <span className="streak-icon" aria-hidden="true">🔥</span>
                <span className="streak-text"><strong>10</strong> Day Streak</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ticket Panel */}
        <section id="panel-ticket" className="panel" aria-label="Submit ticket">
            <div className="form-card">
            <h2 className="panel-title">Submit a Ticket</h2>
            <form id="ticketForm" noValidate>
              <div className="form-row">
                <label className="form-label" htmlFor="ticketReason">Describe Issue</label>
                <textarea id="ticketReason" className="input-control autosize" required minLength={10} placeholder="Describe the issue..."></textarea>
                <div className="field-hint">At least 10 characters.</div>
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor="ticketType">Category</label>
                <select id="ticketType" className="input-control">
                  <option value="">Other</option>
                  <option value="qr">QR Code not scanning</option>
                  <option value="login">Login issue</option>
                  <option value="attendance">Attendance not recorded</option>
                  <option value="points">Merit points incorrect</option>
                  <option value="profile">Profile info error</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Send Ticket</button>
                <button type="reset" className="btn btn-ghost">Clear</button>
              </div>
            </form>
          </div>
          <div id="submittedTickets" className="submitted-tickets" aria-live="polite"></div>
        </section>

        {/* Account Panel */}
        <section id="panel-account" className="panel" aria-label="Account settings">
          <div className="form-card">
            <h2 className="panel-title">Account Settings</h2>
            <form id="accountForm" noValidate>
              <div className="profile-inline">
                <img id="accountAvatar" className="avatar-lg" src="https://i.imgur.com/4Z5b1aH.png" alt="Current avatar" />
                <div>
                  <label className="form-label" htmlFor="avatarFile">Profile Picture</label>
                  <input id="avatarFile" type="file" accept="image/*" className="input-control" />
                  <div className="field-hint" style={{ fontSize: '.55rem' }}>PNG/JPG &lt; 2MB</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
                <div className="form-row">
                  <label htmlFor="accName" className="form-label">Name</label>
                  <input id="accName" type="text" className="input-control" defaultValue="Jane Doe" required />
                </div>
                <div className="form-row">
                  <label htmlFor="accEmail" className="form-label">Email</label>
                  <input id="accEmail" type="email" className="input-control" defaultValue="student@email.com" required />
                </div>
                <div className="form-row">
                  <label htmlFor="accLevel" className="form-label">Level</label>
                  <select id="accLevel" className="input-control" defaultValue="College">
                    <option>Grade School</option>
                    <option>High School</option>
                    <option>College</option>
                  </select>
                </div>
                <div id="rowMajor" className="form-row conditional">
                  <label htmlFor="accMajor" className="form-label">Major</label>
                  <input id="accMajor" type="text" className="input-control" defaultValue="Computer Science" />
                </div>
                <div id="rowCourse" className="form-row conditional">
                  <label htmlFor="accCourse" className="form-label">Course</label>
                  <input id="accCourse" type="text" className="input-control" defaultValue="BSCS" />
                </div>
                <div id="rowYearCollege" className="form-row conditional">
                  <label htmlFor="accYearCollege" className="form-label">Year (College)</label>
                  <select id="accYearCollege" className="input-control" defaultValue="3rd Year">
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
                <div id="rowYearHS" className="form-row conditional hidden">
                  <label htmlFor="accYearHS" className="form-label">Year (High School)</label>
                  <select id="accYearHS" className="input-control" defaultValue="Grade 9">
                    <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                  </select>
                </div>
                <div id="rowYearGS" className="form-row conditional hidden">
                  <label htmlFor="accYearGS" className="form-label">Year (Grade School)</label>
                  <select id="accYearGS" className="input-control" defaultValue="Grade 3">
                    <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option><option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                  </select>
                </div>
              </div>

              <details style={{ marginTop: 14, border: '1px solid var(--border,#d6dde2)', borderRadius: 12, background: 'var(--surface-inset,#eef3f5)', padding: '10px 16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Change Password</summary>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18, marginTop: 14 }}>
                  <div className="form-row">
                    <label htmlFor="currentPass" className="form-label">Current</label>
                    <input id="currentPass" type="password" className="input-control" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="newPass" className="form-label">New</label>
                    <input id="newPass" type="password" className="input-control" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="confirmPass" className="form-label">Confirm</label>
                    <input id="confirmPass" type="password" className="input-control" />
                  </div>
                </div>
              </details>

              <div className="form-actions" style={{ marginTop: 18 }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="reset" className="btn btn-ghost">Reset</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Profile Modal */}
      <div id="profileModal" className="modal" aria-hidden="true">
        <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button id="modalClose" className="modal-close" aria-label="Close" type="button">&times;</button>
          <h2 id="modalTitle" className="modal-title">Edit Profile</h2>
          <form id="profileForm" noValidate>
            <div className="form-row">
              <label htmlFor="modalName" className="form-label">Name</label>
              <input id="modalName" type="text" className="input-control" required />
            </div>
            <div className="form-row">
              <label htmlFor="modalAvatar" className="form-label">Profile Picture</label>
              <input id="modalAvatar" type="file" accept="image/*" className="input-control" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" id="modalCancel" className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div id="toastStack" className="toast-stack" aria-live="polite" aria-atomic="true"></div>
      <div id="ariaLive" className="visually-hidden" aria-live="polite"></div>
    </body>
  );
}