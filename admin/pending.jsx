import React, { useEffect, useRef } from 'react';
import './styles.css';

/*
  Pending Registration React Port
  - Converted from admin/pending.html
  - Scripts migrated into useEffect.
  - Theme + sidebar toggle + modals preserved.
*/

export default function PendingRegistration() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const el = id => document.getElementById(id);
    const live = el('liveRegion');
    const announce = msg => { if (live) { live.textContent = ''; setTimeout(() => (live.textContent = msg), 10); } };

    /* Theme */
    const THEME_KEY = 'ms-theme';
    function applyTheme(t) {
      document.documentElement.setAttribute('data-theme', t);
      const btn = el('themeToggle');
      if (btn) {
        btn.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
        btn.setAttribute('aria-pressed', t === 'dark');
      }
    }
    (function initTheme() {
      let saved; try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(saved || (prefersDark ? 'dark' : 'light'));
      el('themeToggle')?.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
        applyTheme(next);
        announce(`Theme switched to ${next}`);
      });
    })();

    /* Sidebar toggle */
    const body = document.body;
    const toggleBtn = el('sidebarToggle');
    function syncAria() {
      const expanded = !body.classList.contains('sidebar-hidden');
      toggleBtn.setAttribute('aria-expanded', expanded);
      toggleBtn.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    }
    toggleBtn.addEventListener('click', () => {
      body.classList.toggle('sidebar-hidden');
      body.classList.remove('sidebar-overlay');
      syncAria();
    });
    syncAria();

    /* Modal: Edit Profile */
    const editProfileModal = el('editProfileModal');
    const editProfileBtn = el('editProfileBtn');
    const closeModalBtn = el('closeModalBtn');
    const cancelEditProfile = el('cancelEditProfile');
    const editProfileForm = el('editProfileForm');
    const profileNameSidebar = el('profileNameSidebar');
    const profilePicSidebar = el('profilePicSidebar');

    function trapFocus(modalEl) {
      const focusable = modalEl.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      function handler(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        } else if (e.key === 'Escape') closeModal();
      }
      modalEl.addEventListener('keydown', handler);
    }

    function openModal() {
      editProfileModal.style.display = 'block';
      editProfileModal.setAttribute('aria-hidden', 'false');
      el('editName').value = profileNameSidebar.textContent;
      trapFocus(editProfileModal.querySelector('.modal-content'));
      editProfileModal.querySelector('input')?.focus({ preventScroll: true });
    }
    function closeModal() {
      editProfileModal.style.display = 'none';
      editProfileModal.setAttribute('aria-hidden', 'true');
      editProfileBtn.focus();
    }

    editProfileBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditProfile.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === editProfileModal) closeModal(); });

    editProfileForm.addEventListener('submit', e => {
      e.preventDefault();
      const newName = el('editName').value.trim();
      if (newName) profileNameSidebar.textContent = newName;
      const picInput = el('editProfilePic');
      if (picInput.files && picInput.files[0]) {
        const reader = new FileReader();
        reader.onload = ev => { profilePicSidebar.src = ev.target.result; };
        reader.readAsDataURL(picInput.files[0]);
      }
      closeModal();
      announce('Profile updated');
    });

    el('logoutBtn').addEventListener('click', () => {
      if (confirm('Log out?')) {
        announce('Logged out');
        location.reload();
      }
    });

    /* Update Info modal (inline) */
    const modalContainer = el('modalContainer');
    el('updateInfoBtn').addEventListener('click', () => {
      modalContainer.innerHTML = `
        <div class="modal" style="display:block;">
          <div class="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-label="Update Registration Info">
            <button class="close" aria-label="Close" id="closeUpdateInfo">&times;</button>
            <h2 class="ms-modal-title">Update Registration Info</h2>
            <form id="updateInfoForm" autocomplete="off">
              <div class="ms-field">
                <label for="updLevel">Level</label>
                <input id="updLevel" name="updLevel" class="ms-input" value="High School" required>
              </div>
              <div class="ms-field">
                <label for="updSchool">School / Campus</label>
                <input id="updSchool" name="updSchool" class="ms-input" value="School A" required>
              </div>
              <div class="ms-field">
                <label for="updEmail">Email</label>
                <input id="updEmail" type="email" name="updEmail" class="ms-input" value="jane.doe@schoola.com" required>
              </div>
              <div class="ms-actions justify-end">
                <button type="submit" class="ms-btn primary">Save</button>
                <button type="button" class="ms-btn neutral" id="cancelUpdateInfo">Cancel</button>
              </div>
            </form>
          </div>
        </div>`;
      const holder = modalContainer.querySelector('.modal');
      const closeBtn = modalContainer.querySelector('#closeUpdateInfo');
      const cancelBtn = modalContainer.querySelector('#cancelUpdateInfo');
      const form = modalContainer.querySelector('#updateInfoForm');
      function closeUpd() {
        modalContainer.innerHTML = '';
        el('updateInfoBtn').focus();
        announce('Update dialog closed');
      }
      closeBtn.addEventListener('click', closeUpd);
      cancelBtn.addEventListener('click', closeUpd);
      holder.addEventListener('click', e => { if (e.target === holder) closeUpd(); });
      form.addEventListener('submit', e => {
        e.preventDefault();
        announce('Registration info updated (simulated)');
        closeUpd();
      });
      trapFocus(holder.querySelector('.modal-content'));
      form.querySelector('input')?.focus({ preventScroll: true });
    });

    /* Check status simulation */
    el('refreshStatusBtn').addEventListener('click', () => {
      const btn = el('refreshStatusBtn');
      btn.disabled = true;
      const old = btn.textContent;
      btn.textContent = 'Checking...';
      setTimeout(() => {
        btn.textContent = old;
        btn.disabled = false;
        announce('Status still pending (simulated)');
      }, 1200);
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (editProfileModal.style.display === 'block') closeModal();
        const inline = modalContainer.querySelector('.modal');
        if (inline) inline.querySelector('.close')?.click();
      }
    });
  }, []);

  return (
    <body className="no-js">
      <a href="#mainContent" className="skip-link">Skip to content</a>

      <button
        id="sidebarToggle"
        className="nav-fab"
        aria-label="Open navigation"
        aria-controls="sidebar"
        aria-expanded="false"
        type="button"
      >
        <span className="nav-fab__icon" aria-hidden="true">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </span>
      </button>

      <div className="app-container">
        <nav className="sidebar" id="sidebar" aria-label="Main navigation">
          <div className="sidebar-header">
            <span className="sidebar-title">Merit Scan</span>
          </div>
          <div className="sidebar-profile">
            <div className="profile-img">
              <img id="profilePicSidebar" src="https://i.imgur.com/4Z5b1aH.png" alt="Admin Profile Picture" />
            </div>
            <div className="profile-details">
              <span className="profile-name" id="profileNameSidebar">Admin Account</span>
              <span className="profile-status online" id="profileStatusSidebar">Online</span>
            </div>
          </div>
          <ul className="sidebar-menu" role="menu">
            <li className="sidebar-section">STATUS</li>
            <li><a href="#" className="active" role="menuitem" aria-current="page">Waiting Area</a></li>
          </ul>
          <div className="sidebar-footer">
            <button id="themeToggle" className="btn tiny ghost w-100" aria-pressed="false" type="button">Dark Mode</button>
          </div>
        </nav>

        <main className="main-content" id="mainContent" tabIndex={-1}>
          <header className="main-header">
            <div className="header-left">
              <span className="main-project">Admin Account</span>
              <nav aria-label="Breadcrumb" className="breadcrumb-nav">
                <ol className="breadcrumb-list">
                  <li><a href="#">Home</a></li>
                  <li aria-current="page">Waiting Area</li>
                </ol>
              </nav>
            </div>
            <div className="profile-actions">
              <button id="editProfileBtn" className="btn small" type="button">Edit Profile</button>
              <button id="logoutBtn" className="btn small danger" type="button">Log Out</button>
            </div>
          </header>

          <div className="visually-hidden" aria-live="polite" id="liveRegion"></div>

            <section className="section-panel" aria-labelledby="pendingTitle">
            <div className="pending-wrapper">
              <h2 id="pendingTitle" className="pending-head">
                Registration Pending
                <span className="status-badge-pending" aria-label="Pending approval badge">Pending</span>
              </h2>
              <p className="pending-intro">
                Your registration is under review. You will gain full dashboard functionality once the account is approved.
                You can safely close this page; upon approval an update will be available on next sign in.
              </p>

              <div className="reg-details-card" aria-labelledby="detailsHeading">
                <h3 id="detailsHeading">Submitted Registration Details</h3>
                <div className="readonly-grid">
                  <div className="readonly-item">
                    <span className="label-inline">Name</span>
                    <input className="ro-input" value="Jane Doe" readOnly />
                  </div>
                  <div className="readonly-item">
                    <span className="label-inline">Profession</span>
                    <input className="ro-input" value="Admin" readOnly />
                  </div>
                  <div className="readonly-item">
                    <span className="label-inline">Email</span>
                    <input className="ro-input" type="email" value="jane.doe@schoola.com" readOnly />
                  </div>
                  <div className="readonly-item">
                    <span className="label-inline">Password</span>
                    <input className="ro-input" type="password" value="********" readOnly aria-label="Password (hidden)" />
                  </div>
                  <div className="readonly-item">
                    <span className="label-inline">Level</span>
                    <input className="ro-input" value="High School" readOnly />
                  </div>
                  <div className="readonly-item">
                    <span className="label-inline">School / Campus</span>
                    <input className="ro-input" value="School A" readOnly />
                  </div>
                  <div className="readonly-item id-block">
                    <span className="label-inline">Uploaded Valid ID</span>
                    <img src="https://i.imgur.com/4Z5b1aH.png" alt="Uploaded ID preview" className="id-preview" />
                  </div>
                </div>
                <div className="ms-actions mt-3">
                  <button type="button" id="refreshStatusBtn" className="ms-btn secondary">Check Status</button>
                  <button type="button" id="updateInfoBtn" className="ms-btn ghost">Update Info</button>
                </div>
              </div>
            </div>
          </section>

          {/* Edit Profile Modal */}
          <div id="editProfileModal" className="modal" aria-hidden="true">
            <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
              <button className="close" id="closeModalBtn" aria-label="Close" type="button">&times;</button>
              <h2 id="editProfileTitle" className="ms-modal-title">Edit Profile</h2>
              <form id="editProfileForm" autoComplete="off">
                <div className="ms-field">
                  <label htmlFor="editName">Name</label>
                  <input className="ms-input" type="text" id="editName" name="editName" required />
                </div>
                <div className="ms-field">
                  <label htmlFor="editProfilePic">Profile Picture</label>
                  <input className="ms-input" type="file" id="editProfilePic" name="editProfilePic" accept="image/*" />
                  <small className="ms-help">(PNG/JPG, up to 2MB)</small>
                </div>
                <div className="ms-actions justify-end">
                  <button type="submit" className="ms-btn primary">Save Changes</button>
                  <button type="button" className="ms-btn neutral" id="cancelEditProfile">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modalContainer"></div>
        </main>
      </div>
    </body>
  );
}