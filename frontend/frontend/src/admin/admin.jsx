import React, { useEffect, useRef } from 'react';
import './styles.css';

/*
  Admin Dashboard React Port
  - Converted from admin/dashboard.html
  - All IDs/classes preserved for styling & script parity.
  - External libs (Chart.js, XLSX, qrcodejs, html5-qrcode, jsQR) dynamically loaded.
  - Original imperative script logic moved into useEffect (nearly verbatim).
  - Inline HTML event handlers replaced with React handlers calling window.* functions set in effect.
  - Sections are shown/hidden exactly as original (display toggling via classes).
*/

export default function AdminDashboard() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Dynamically load external libraries (only if not already loaded)
    const libDefs = [
      { src: 'https://cdn.jsdelivr.net/npm/chart.js' },
      { src: 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js', defer: true },
      { src: 'https://unpkg.com/html5-qrcode', defer: true },
      { src: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js', defer: true },
    ];

    function loadScript(def) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${def.src}"]`)) {
          return resolve();
        }
        const s = document.createElement('script');
        s.src = def.src;
        if (def.defer) s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    Promise.all(libDefs.map(loadScript))
      .then(() => initDashboard())
      .catch(err => {
        console.error('Library load failed', err);
        initDashboard(); // attempt init anyway for non-QR areas
      });

    function initDashboard() {
      document.body.classList.remove('no-js');
      const el = id => document.getElementById(id);
      const qs = sel => document.querySelector(sel);
      const qsa = sel => document.querySelectorAll(sel);
      const live = el('liveRegion');
      const announce = msg => { if (live) { live.textContent = ''; setTimeout(() => (live.textContent = msg), 10); } };
      const NS = (window.NS = window.NS || {});

      let scannerPrepared = false;
      let majorChart;

      const mqGlobalMobile = window.matchMedia('(max-width:900px)');
      function hideSidebarOnMobile() {
        if (mqGlobalMobile.matches) {
          document.body.classList.add('sidebar-hidden');
          document.body.classList.remove('sidebar-overlay');
        }
      }

      /* THEME */
      const THEME_KEY = 'ms-theme';
      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        const toggle = el('themeToggle');
        if (toggle) {
          toggle.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
            toggle.setAttribute('aria-pressed', t === 'dark');
        }
      }
      function initTheme() {
        let saved;
        try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(saved || (prefersDark ? 'dark' : 'light'));
        el('themeToggle')?.addEventListener('click', () => {
          const cur = document.documentElement.getAttribute('data-theme');
          const next = cur === 'dark' ? 'light' : 'dark';
          try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
          applyTheme(next);
          announce(`Theme switched to ${next}`);
        });
      }

      /* SIDEBAR TOGGLE */
      (function () {
        const SIDEBAR_STATE_KEY = 'ms-sidebar-hidden';
        const mqMobile = window.matchMedia('(max-width:900px)');
        const body = document.body;
        const sidebar = el('sidebar');
        const toggleBtn = el('sidebarToggle');

        function isMobile() { return mqMobile.matches; }
        function applyState(fromInit = false) {
          let stored;
          try { stored = localStorage.getItem(SIDEBAR_STATE_KEY); } catch (_) {}
          const shouldHide = isMobile() ? true : (stored === null ? true : stored === '1');
          body.classList.toggle('sidebar-hidden', shouldHide);
          syncAria();
          if (!fromInit) persist();
        }
        function persist() {
          if (!isMobile()) {
            try {
              localStorage.setItem(
                SIDEBAR_STATE_KEY,
                document.body.classList.contains('sidebar-hidden') ? '1' : '0'
              );
            } catch (_) {}
          }
        }
        function openSidebar() {
          body.classList.remove('sidebar-hidden');
          if (isMobile()) body.classList.add('sidebar-overlay');
          syncAria();
          persist();
        }
        function closeSidebar() {
          body.classList.add('sidebar-hidden');
          body.classList.remove('sidebar-overlay');
          syncAria();
          persist();
        }
        function toggleSidebar() {
          if (body.classList.contains('sidebar-hidden')) openSidebar();
          else closeSidebar();
        }
        function syncAria() {
          const expanded = !body.classList.contains('sidebar-hidden');
          toggleBtn.setAttribute('aria-expanded', expanded);
          toggleBtn.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
        }
        document.addEventListener('click', e => {
          if (
            isMobile() &&
            !body.classList.contains('sidebar-hidden') &&
            !sidebar.contains(e.target) &&
            !toggleBtn.contains(e.target)
          ) {
            closeSidebar();
          }
        });
        window.addEventListener('keydown', e => {
          if (e.key === 'Escape' && !body.classList.contains('sidebar-hidden')) {
            closeSidebar();
            toggleBtn.focus();
          }
        });
        mqMobile.addEventListener('change', () => {
          body.classList.remove('sidebar-overlay');
          applyState(true);
        });
        toggleBtn.addEventListener('click', e => {
          e.stopPropagation();
          toggleSidebar();
        });
        applyState(true);
      })();

      /* NAVIGATION / SECTIONS */
      const sectionMap = {
        dashboard: 'dashboardSection',
        students: 'studentsSection',
        logs: 'logsSection',
        awards: 'awardsSection',
        generate: 'generateSection',
        account: 'accountSection',
        school: 'schoolSection'
      };

      function showSection(key) {
        Object.entries(sectionMap).forEach(([k, id]) => {
          const sec = el(id);
          if (!sec) return;
          const active = k === key;
          sec.classList.toggle('d-none', !active);
          sec.setAttribute('aria-hidden', !active);
        });
        updateBreadcrumb(key);
        hideSidebarOnMobile();
        el('mainContent')?.focus({ preventScroll: true });
        announce(`${key} section loaded`);
        if (key === 'dashboard') renderDashboard();
        if (key === 'students') renderStudentsTable();
        if (key === 'logs') renderLogsTable();
        if (key === 'awards') renderAwardsTable();
        if (key === 'generate' && !scannerPrepared) { initializeQRSection(); scannerPrepared = true; }
        if (key === 'account') setupAccountDropdowns();
        if (key === 'school') renderSchool();
      }

      function updateBreadcrumb(key) {
        const current = el('breadcrumbCurrent');
        const link = qs(`.sidebar-menu a[data-content="${key}"]`);
        if (current && link) current.textContent = link.textContent;
      }

      qsa('.sidebar-menu a').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          qsa('.sidebar-menu a').forEach(l => l.classList.remove('active'));
          a.classList.add('active');
          showSection(a.dataset.content);
        });
      });

      /* DEMO DATA */
      const students = [];
      for (let i = 0; i < 55; i++) {
        students.push({
          name: `Student ${i + 1}`,
          year: String((i % 4) + 1),
          email: `student${i + 1}@school.edu`,
          password: '********',
          qr: `QR${100 + i}`,
          merit: Math.floor(Math.random() * 100),
          major: ["BSCS","BSPSYCH","BSEDUC","BSTM","BSHM","BSBA","BSMM"][i % 7],
          present: Math.random() > 0.2
        });
      }
      let logs = [
        { name: "Student 1", qr: "QR100", login: "08:10", logout: "16:00", date: "2025-08-18" },
        { name: "Student 2", qr: "QR101", login: "08:15", logout: "16:15", date: "2025-08-18" }
      ];
      const majors = ["BSCS","BSPSYCH","BSEDUC","BSTM","BSHM","BSBA","BSMM"];
      const verifiedAdmins = [
        { name: "Prof. Stella", id: "T12345", validID: true, school: "XYZ College", idPhoto: "https://i.imgur.com/4Z5b1aH.png" }
      ];

      /* DASHBOARD */
      function renderDashboard() {
        const present = students.filter(s => s.present).length;
        el('presentToday').textContent = present;
        el('absentToday').textContent = students.length - present;
        el('lateToday').textContent = Math.floor(Math.random() * 3);

        const sorted = [...students].sort((a, b) => b.merit - a.merit);
        const tbody = el('sideRankTable').querySelector('tbody');
        tbody.innerHTML = '';
        sorted.slice(0, 10).forEach((s, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${i + 1}</td><td>${s.name}</td><td>${s.merit}</td>`;
          tbody.appendChild(tr);
        });
        const dd = el('sideRankDropdown');
        dd.innerHTML = '';
        sorted.slice(0, 50).forEach((s, i) => {
          const opt = document.createElement('option');
          opt.value = s.qr;
          opt.textContent = `${i + 1}. ${s.name} (${s.merit} pts)`;
          dd.appendChild(opt);
        });

        if (window.Chart) {
          const totals = majors.map(m => students.filter(s => s.major === m).length);
          const presentByMajor = majors.map(m => students.filter(s => s.major === m && s.present).length);
          const ctx = el('majorAttendanceChart').getContext('2d');
          if (majorChart) majorChart.destroy();
          majorChart = new window.Chart(ctx, {
            type: 'bar',
            data: {
              labels: majors,
              datasets: [
                {
                  label: 'Total',
                  data: totals,
                  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1abc9c'
                },
                { label: 'Present', data: presentByMajor, backgroundColor: '#3498db' }
              ]
            },
            options: {
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              plugins: { legend: { display: true } }
            }
          });
        }
      }

      qsa('.kpi-refresh').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.add('spin-once');
          setTimeout(() => btn.classList.remove('spin-once'), 600);
          renderDashboard();
        });
      });
      el('refreshChartBtn')?.addEventListener('click', () => {
        renderDashboard();
        announce('Chart refreshed');
      });

      /* STUDENTS */
      const studentsSearchBar = el('studentsSearchBar');
      let searchDebounce;
      function renderStudentsTable() {
        const tbody = el('studentsTable').querySelector('tbody');
        const term = (studentsSearchBar.value || '').toLowerCase();
        let count = 0;
        tbody.innerHTML = '';
        students.forEach((s, idx) => {
          if (
            term &&
            !(
              s.name.toLowerCase().includes(term) ||
              s.email.toLowerCase().includes(term) ||
              s.qr.toLowerCase().includes(term) ||
              s.major.toLowerCase().includes(term)
            )
          )
            return;
          count++;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.year}</td>
            <td>${s.email}</td>
            <td>${s.password}</td>
            <td>${s.qr}</td>
            <td>${s.major}</td>
            <td>
              <button class="btn tiny" data-edit="${idx}" aria-label="Edit ${s.name}">Edit</button>
              <button class="btn tiny danger" data-del="${idx}" aria-label="Delete ${s.name}">Del</button>
            </td>`;
          tr.addEventListener('click', ev => {
            const t = ev.target;
            if (t.matches('button[data-edit]')) {
              editStudent(parseInt(t.getAttribute('data-edit'), 10));
              ev.stopPropagation();
              return;
            }
            if (t.matches('button[data-del]')) {
              deleteStudent(parseInt(t.getAttribute('data-del'), 10));
              ev.stopPropagation();
              return;
            }
            editStudent(idx);
          });
          tbody.appendChild(tr);
        });
        el('studentsEmpty').classList.toggle('d-none', count > 0);
      }
      studentsSearchBar.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(renderStudentsTable, 160);
      });

      el('exportStudentsBtn')?.addEventListener('click', () => {
        if (!window.XLSX) {
          alert('XLSX library not loaded');
          return;
        }
        const data = students.map(s => ({
          Name: s.name,
          Year: s.year,
          Email: s.email,
          QR: s.qr,
          Major: s.major,
          Merit: s.merit,
          Present: s.present ? 'Yes' : 'No'
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Students');
        window.XLSX.writeFile(wb, 'students.xlsx');
        announce('Students exported');
      });

      el('addStudentBtn')?.addEventListener('click', () => {
        inlineModal(
          'Add Student',
          `
          <form id="addStudentForm" class="form-grid">
            <div class="ms-field"><label>Name</label><input name="name" class="ms-input" required></div>
            <div class="ms-field"><label>Year</label><input name="year" class="ms-input" required></div>
            <div class="ms-field"><label>Email</label><input name="email" type="email" class="ms-input" required></div>
            <div class="ms-field"><label>Password</label><input name="password" type="password" class="ms-input" required></div>
            <div class="ms-field"><label>QR Code No</label><input name="qr" class="ms-input" required></div>
            <div class="ms-field">
              <label>Major</label>
              <select name="major" class="ms-input">${majors.map(m => `<option>${m}</option>`).join('')}</select>
            </div>
            <div class="ms-actions justify-end full-row">
              <button class="ms-btn primary" type="submit">Add</button>
              <button type="button" class="ms-btn neutral" onclick="closeInlineModal()">Cancel</button>
            </div>
          </form>
        `,
          form => {
            form.onsubmit = e => {
              e.preventDefault();
              const fd = new FormData(form);
              students.push({
                name: fd.get('name'),
                year: fd.get('year'),
                email: fd.get('email'),
                password: fd.get('password'),
                qr: fd.get('qr'),
                major: fd.get('major'),
                merit: 0,
                present: false
              });
              renderStudentsTable();
              window.closeInlineModal();
              announce('Student added');
            };
          }
        );
      });

      window.editStudent = function (idx) {
        const s = students[idx];
        inlineModal(
          'Edit Student',
          `
          <form id="editStudentForm" class="form-grid">
            <div class="ms-field"><label>Name</label><input name="name" class="ms-input" value="${s.name}" required></div>
            <div class="ms-field"><label>Year</label><input name="year" class="ms-input" value="${s.year}" required></div>
            <div class="ms-field"><label>Email</label><input name="email" type="email" class="ms-input" value="${s.email}" required></div>
            <div class="ms-field"><label>Password</label><input name="password" type="password" class="ms-input" value="${s.password}" required></div>
            <div class="ms-field"><label>QR</label><input name="qr" class="ms-input" value="${s.qr}" required></div>
            <div class="ms-field">
              <label>Major</label>
              <select name="major" class="ms-input">
                ${majors.map(m => `<option${s.major === m ? ' selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="ms-actions justify-end full-row">
              <button class="ms-btn primary" type="submit">Save</button>
              <button type="button" class="ms-btn neutral" onclick="closeInlineModal()">Cancel</button>
            </div>
          </form>
          <small class="ms-help full-row">Password changes will be emailed later.</small>
        `,
          form => {
            form.onsubmit = e => {
              e.preventDefault();
              const fd = new FormData(form);
              students[idx] = {
                name: fd.get('name'),
                year: fd.get('year'),
                email: fd.get('email'),
                password: fd.get('password'),
                qr: fd.get('qr'),
                major: fd.get('major'),
                merit: s.merit,
                present: s.present
              };
              renderStudentsTable();
              window.closeInlineModal();
              announce('Student updated');
            };
          }
        );
      };

      window.deleteStudent = function (idx) {
        if (confirm('Delete this student?')) {
          students.splice(idx, 1);
          renderStudentsTable();
          announce('Student deleted');
        }
      };

      /* LOGS */
      function renderLogsTable() {
        const tbody = el('logsTable').querySelector('tbody');
        const date = el('logsDate').value || new Date().toISOString().slice(0, 10);
        tbody.innerHTML = '';
        let count = 0;
        logs.filter(l => l.date === date).forEach(l => {
          count++;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${l.name}</td><td>${l.qr}</td><td>${l.login}</td><td>${l.logout}</td>`;
          tbody.appendChild(tr);
        });
        el('logsEmpty').classList.toggle('d-none', count > 0);
      }
      el('logsDate')?.addEventListener('input', renderLogsTable);
      el('exportLogsBtn')?.addEventListener('click', () => {
        if (!window.XLSX) { alert('XLSX library not loaded'); return; }
        const date = el('logsDate').value || new Date().toISOString().slice(0, 10);
        const data = logs.filter(l => l.date === date).map(l => ({
          Name: l.name,
          QR: l.qr,
          Login: l.login,
          Logout: l.logout
        }));
        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Logs');
        window.XLSX.writeFile(wb, `logs-${date}.xlsx`);
        announce('Logs exported');
      });

      /* AWARDS */
      window.generateCertificate = function (idx) {
        inlineModal(
          'Generate Certificate',
          `
          <p>Generate certificate for <b>${
            students.slice().sort((a, b) => b.merit - a.merit)[idx].name
          }</b>?</p>
          <div class="ms-actions">
            <button type="button" class="ms-btn primary" id="confirmCertBtn">Yes</button>
            <button type="button" class="ms-btn neutral" onclick="closeInlineModal()">No</button>
          </div>
        `,
          modal => {
            modal.querySelector('#confirmCertBtn').onclick = () => {
              window.closeInlineModal();
              window.generatedCertIdx = idx;
              window.generatedCertTime = Date.now();
              renderAwardsTable();
              announce('Certificate generated');
            };
          }
        );
      };
      function renderAwardsTable() {
        const tbody = el('awardsTable').querySelector('tbody');
        const sorted = [...students].sort((a, b) => b.merit - a.merit);
        tbody.innerHTML = '';
        sorted.slice(0, 10).forEach((s, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${i + 1}</td><td>${s.name}</td><td>${s.merit}</td>
            <td><button class="btn tiny" onclick="generateCertificate(${i})">Certificate</button></td>`;
          tbody.appendChild(tr);
        });
        const top = sorted[0];
        el('mostMeritStudent').innerHTML = `<strong>${top.name}</strong> (${top.merit} pts)`;
        if (window.generatedCertIdx !== undefined && window.generatedCertTime) {
          const secAgo = Math.floor((Date.now() - window.generatedCertTime) / 1000);
          if (secAgo < 90) {
            const st = sorted[window.generatedCertIdx];
            el('mostMeritStudent').innerHTML += `<br><span class="text-success small">Certificate generated for <b>${st.name}</b> (${secAgo}s ago)</span>`;
            setTimeout(renderAwardsTable, 1000);
          }
        }
      }

      /* ACCOUNT DROPDOWNS */
      function setupAccountDropdowns() {
        qsa('.account-settings-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-dropdown');
            const panel = el(id);
            if (!panel) return;
            const open = panel.style.display === 'block';
            qsa('.account-option-modal').forEach(m => (m.style.display = 'none'));
            if (!open) {
              panel.style.display = 'block';
              announce(`${btn.textContent.trim()} panel opened`);
            } else {
              panel.style.display = 'none';
            }
          });
        });
        qsa('.account-option-modal .cancel-btn').forEach(b => {
          b.addEventListener('click', () => {
            const parent = b.closest('.account-option-modal');
            if (parent) parent.style.display = 'none';
          });
        });
        el('changeEmailForm').onsubmit = e => {
          e.preventDefault();
          alert('Email changed (simulated).');
          el('emailDropdown').style.display = 'none';
        };
        el('changePassForm').onsubmit = e => {
          e.preventDefault();
          alert('Password changed (simulated).');
          el('passwordDropdown').style.display = 'none';
        };
        el('changeNameForm').onsubmit = e => {
          e.preventDefault();
          const nv = e.target.newName.value.trim();
          if (nv) el('profileNameSidebar').textContent = nv;
          alert('Account name updated (simulated).');
          el('nameDropdown').style.display = 'none';
        };
        el('doBackup').onclick = () => {
          alert('Backup ZIP (simulated).');
          el('backupDropdown').style.display = 'none';
        };
        el('extendYearBtn').onclick = () => {
          alert('Extension request sent (simulated).');
          el('detailsDropdown').style.display = 'none';
        };
      }

      /* SCHOOL */
      function renderSchool() {
        el('schoolID').textContent = 'SCH-2025-0001';
        el('schoolYearValidity').textContent = '2025-08-18 to 2026-08-18';
        el('majorCounts').innerHTML = majors
          .map(m => `<li>${m}: ${students.filter(s => s.major === m).length}</li>`)
          .join('');
        el('verifiedAdmins').innerHTML = verifiedAdmins
          .map(
            a => `
          <li>${a.name} (${a.id}, ${a.validID ? 'Verified' : 'Unverified'}) - ${a.school}<br>
            <img src="${a.idPhoto}" alt="ID" style="width:60px;height:60px;border-radius:7px;border:2px solid var(--color-primary);margin-top:3px;">
          </li>`
          )
          .join('');
      }

      /* INLINE MODALS */
      const modalContainer = el('modalContainer');
      function trapFocus(modalEl) {
        if (!modalEl) return;
        const focusable = modalEl.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        function handler(e) {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        modalEl.addEventListener('keydown', handler);
      }
      function inlineModal(title, content, cb) {
        modalContainer.innerHTML = `
          <div class="modal" style="display:block;">
            <div class="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-label="${title}">
              <button class="close" aria-label="Close" onclick="closeInlineModal()">&times;</button>
              <h2 class="ms-modal-title">${title}</h2>
              <div class="ms-modal-grid">${content}</div>
            </div>
          </div>`;
        trapFocus(modalContainer.querySelector('.modal-content'));
        const node = modalContainer.querySelector('form') || modalContainer.querySelector('.ms-modal-grid');
        if (cb) cb(node);
      }
      window.closeInlineModal = function () { modalContainer.innerHTML = ''; };

      /* EDIT PROFILE MODAL */
      const editProfileModal = el('editProfileModal');
      const editProfileBtn = el('editProfileBtn');
      const closeModalBtn = el('closeModalBtn');
      const cancelEditProfile = el('cancelEditProfile');
      const editProfileForm = el('editProfileForm');
      const profileNameSidebar = el('profileNameSidebar');
      const profilePicSidebar = el('profilePicSidebar');

      function openModal(modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        trapFocus(modal.querySelector('.modal-content'));
        modal.querySelector('input,button,select,textarea')?.focus({ preventScroll: true });
      }
      function closeModal(modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }

      editProfileBtn.addEventListener('click', () => {
        el('editName').value = profileNameSidebar.textContent;
        openModal(editProfileModal);
      });
      closeModalBtn.addEventListener('click', () => closeModal(editProfileModal));
      cancelEditProfile.addEventListener('click', () => closeModal(editProfileModal));

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
        closeModal(editProfileModal);
        announce('Profile updated');
      });

      el('logoutBtn').addEventListener('click', () => {
        if (confirm('Log out (simulated)?')) {
          announce('Logged out');
          location.reload();
        }
      });

      window.addEventListener('click', e => {
        if (e.target === editProfileModal) closeModal(editProfileModal);
        const inline = qs('#modalContainer .modal');
        if (inline && e.target === inline) window.closeInlineModal();
      });
      window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          if (editProfileModal.style.display === 'block') closeModal(editProfileModal);
          const inline = qs('#modalContainer .modal');
          if (inline) window.closeInlineModal();
        }
      });

      /* PORTAL STATUS */
      const portalStatusBtn = el('portalStatusBtn');
      let bc;
      try { bc = new BroadcastChannel('portalStatusChannel'); } catch (_) {}
      if (bc) {
        bc.onmessage = ev => {
          if (ev.data === 'portal-online') setPortalStatus(true);
          else if (ev.data === 'portal-offline') setPortalStatus(false);
        };
        setInterval(() => bc.postMessage('status-request'), 3000);
      }
      function setPortalStatus(online) {
        portalStatusBtn.textContent = online ? 'Portal: Online' : 'Portal: Offline';
        portalStatusBtn.classList.toggle('status-online', online);
        portalStatusBtn.classList.toggle('status-offline', !online);
      }
      portalStatusBtn.addEventListener('click', () => window.open('portal.html', '_blank'));

      /* QR CODE */
      const generatedCodes = new Set();
      let html5qrcodeInstance = null;
      let scannerRunning = false;

      function sanitize(raw) { return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 64); }
      function getEcc(letter) {
        const map = window.QRCode
          ? { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H }
          : {};
        return map[letter] || (window.QRCode ? QRCode.CorrectLevel.H : undefined);
      }

      NS.generateRandomCode = function (len = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let out = '';
        for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
        el('qrInputCode').value = out;
        return out;
      };
      window.MS_generateRandomCode = NS.generateRandomCode;

      NS.generateQRCode = function () {
        const inputEl = el('qrInputCode');
        let code = sanitize(inputEl.value);
        if (!code) code = NS.generateRandomCode(parseInt(el('qrRandomLen').value, 10) || 8);
        const size = 256;
        const ecc = getEcc('H');
        const pad = el('qrAddPadding').checked ? 20 : 0;
        const temp = document.createElement('div');
        if (!window.QRCode) { alert('QR library missing'); return; }
        new window.QRCode(temp, { text: code, width: size, height: size, correctLevel: ecc });
        setTimeout(() => {
          const img = temp.querySelector('img') || temp.querySelector('canvas');
          if (!img) { alert('QR gen failed'); return; }
          const canvas = el('qrRenderedCanvas');
          canvas.width = size + pad * 2;
          canvas.height = size + pad * 2;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (img.tagName.toLowerCase() === 'img') {
            if (!img.complete) img.onload = () => ctx.drawImage(img, pad, pad, size, size);
            else ctx.drawImage(img, pad, pad, size, size);
          } else {
            ctx.drawImage(img, pad, pad);
          }
          el('qrOriginalCode').textContent = inputEl.value || '(blank->random)';
          el('qrCurrentCode').textContent = code;
          el('downloadQRBtn').disabled = false;
          el('copyCodeBtn').disabled = false;
          if (!generatedCodes.has(code)) { generatedCodes.add(code); renderGeneratedCodes(); }
          localDecode();
          announce('QR code generated');
        }, 30);
      };
      window.MS_generateQRCode = NS.generateQRCode;

      function renderGeneratedCodes() {
        const ul = el('qrGeneratedCodesUl');
        ul.innerHTML = '';
        [...generatedCodes].slice(-50).reverse().forEach(c => {
          const li = document.createElement('li');
          li.textContent = c;
          ul.appendChild(li);
        });
      }

      NS.clearQRCode = function () {
        const canvas = el('qrRenderedCanvas');
        if (canvas.width) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        el('qrOriginalCode').textContent = '';
        el('qrCurrentCode').textContent = '';
        setDecodeStatus('Idle', 'idle');
        el('downloadQRBtn').disabled = true;
        el('copyCodeBtn').disabled = true;
        announce('QR cleared');
      };
      window.MS_clearQRCode = NS.clearQRCode;

      NS.downloadQRCode = function () {
        const canvas = el('qrRenderedCanvas');
        if (!canvas.width) { alert('No QR code'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = (el('qrCurrentCode').textContent || 'qr_code') + '.png';
        a.click();
      };
      window.MS_downloadQRCode = NS.downloadQRCode;

      NS.downloadUpscaled = function () {
        const src = el('qrRenderedCanvas');
        if (!src.width) { alert('No QR to upscale'); return; }
        const scale = 4;
        const big = document.createElement('canvas');
        big.width = src.width * scale;
        big.height = src.height * scale;
        const ctx = big.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, 0, 0, big.width, big.height);
        const a = document.createElement('a');
        a.href = big.toDataURL('image/png');
        a.download = (el('qrCurrentCode').textContent || 'qr_code') + '_x4.png';
        a.click();
      };
      window.MS_downloadUpscaled = NS.downloadUpscaled;

      NS.copyCode = function () {
        const code = el('qrCurrentCode').textContent;
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
          const btn = el('copyCodeBtn');
          const old = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = old), 1300);
        });
      };
      window.MS_copyCode = NS.copyCode;

      function localDecode() {
        const canvas = el('qrRenderedCanvas');
        if (!canvas.width) return;
        if (!window.jsQR) {
          setDecodeStatus('Library Missing', 'error');
          return;
        }
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const res = window.jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
        if (res && res.data) {
          const san = sanitize(res.data);
          setDecodeStatus('PASS (' + san + ')', 'success');
        } else {
          setDecodeStatus('FAIL', 'error');
        }
      }
      function setDecodeStatus(msg, status) {
        const badge = el('qrLocalDecodeStatus');
        badge.textContent = msg;
        badge.className = 'badge badge-' + status;
      }
      NS.manualDecodeCurrent = localDecode;
      window.MS_manualDecodeCurrent = localDecode;

      NS.selfTestLoop = async function (count = 10) {
        const btns = document.querySelectorAll('#qrGenerateForm button,.qr-actions button');
        btns.forEach(b => (b.disabled = true));
        for (let i = 0; i < count; i++) {
          el('qrInputCode').value = '';
          NS.generateQRCode();
          await new Promise(r => setTimeout(r, 120));
        }
        btns.forEach(b => (b.disabled = false));
        if (el('qrCurrentCode').textContent) el('copyCodeBtn').disabled = false;
        announce('Self test loop complete');
      };
      window.MS_selfTestLoop = NS.selfTestLoop;

      NS.prepareScanner = function () {
        const startBtn = el('startScannerBtn');
        if (window.Html5Qrcode) startBtn.disabled = false;
      };
      function initializeQRSection() { NS.prepareScanner(); }

      NS.startScanner = function () {
        if (scannerRunning) return;
        if (!window.Html5Qrcode) { alert('Scanner library missing.'); return; }
        html5qrcodeInstance = new window.Html5Qrcode('qrReader', { verbose: false });
        const config = { fps: 12, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
        html5qrcodeInstance
          .start({ facingMode: 'environment' }, config,
            decoded => NS.onScanSuccess(decoded),
            () => {})
          .then(() => {
            scannerRunning = true;
            el('startScannerBtn').disabled = true;
            el('stopScannerBtn').disabled = false;
            setScanStatus('Scanning...', 'active');
          })
          .catch(err => {
            setScanStatus('Start failed', 'error');
            console.error(err);
          });
      };
      window.MS_startScanner = NS.startScanner;

      NS.stopScanner = function () {
        if (!scannerRunning || !html5qrcodeInstance) return;
        html5qrcodeInstance.stop().then(() => {
          scannerRunning = false;
          el('startScannerBtn').disabled = false;
          el('stopScannerBtn').disabled = true;
          setScanStatus('Stopped', 'idle');
        }).catch(err => {
          setScanStatus('Stop error', 'error');
          console.error(err);
        });
      };
      window.MS_stopScanner = NS.stopScanner;

      NS.onScanSuccess = function (raw) {
        el('scanResultRaw').textContent = raw;
        const clean = sanitize(raw);
        setScanStatus(clean, 'success');
        updateRegistrationStatus(clean);
      };

      function setScanStatus(text, state = 'idle') {
        const st = el('scanResultText');
        st.textContent = text;
        st.className = 'badge badge-' + state;
      }
      function updateRegistrationStatus(code) {
        const exists = generatedCodes.has(code);
        const reg = el('scanRegStatus');
        reg.textContent = exists ? 'REGISTERED (Session)' : 'UNREGISTERED';
        reg.className = 'badge ' + (exists ? 'badge-registered' : 'badge-unregistered');
      }

      NS.decodeFromImage = function (evt) {
        const file = evt.target.files[0];
        if (!file) return;
        const status = el('imageDecodeStatus');
        status.textContent = 'Decoding...';
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            const canvas = el('qrHiddenCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            if (!window.jsQR) { status.textContent = 'jsQR missing'; return; }
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
            if (code) {
              NS.onScanSuccess(code.data);
              status.textContent = 'Decoded: ' + code.data;
            } else {
              status.textContent = 'No QR found.';
            }
          };
          img.onerror = () => (status.textContent = 'Invalid image.');
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      };
      window.MS_decodeFromImage = NS.decodeFromImage;

      NS.manualCheck = function () {
        const code = sanitize(el('manualCheckInput').value);
        const status = el('manualCheckStatus');
        if (!code) { status.textContent = 'Enter a code first.'; return; }
        status.textContent = generatedCodes.has(code)
          ? 'Code is REGISTERED (session).'
          : 'Code not found.';
      };
      window.MS_manualCheck = NS.manualCheck;

      window.addEventListener('beforeunload', () => {
        if (scannerRunning && html5qrcodeInstance) {
          try { html5qrcodeInstance.stop(); } catch (_) {}
        }
      });

      /* INIT */
      initTheme();
      showSection('dashboard');
      renderDashboard();
      announce('Dashboard ready');
    }
  }, []);

  // Simple helpers for uppercase transforms
  const upperKeyUp = e => { e.target.value = e.target.value.toUpperCase(); };

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

      <div className="app-container" id="appRoot">
        <nav className="sidebar" id="sidebar" aria-label="Main navigation">
          <div className="sidebar-header">
            <span className="sidebar-title">Merit Scan</span>
          </div>
          <div className="sidebar-profile">
            <div className="profile-img">
              <img id="profilePicSidebar" src="https://i.imgur.com/4Z5b1aH.png" alt="Admin Profile" />
            </div>
            <div className="profile-details">
              <span className="profile-name" id="profileNameSidebar">Admin Account</span>
              <span className="profile-status online" id="profileStatusSidebar">Online</span>
            </div>
          </div>
          <ul className="sidebar-menu" id="sidebarMenu" role="menu">
            <li className="sidebar-section">REPORTS</li>
            <li><a href="#" className="active" data-content="dashboard" role="menuitem">Dashboard</a></li>
            <li><a href="#" data-content="students" role="menuitem">Students</a></li>
            <li className="menu-gap"></li>
            <li className="sidebar-section">MANAGE</li>
            <li><a href="#" data-content="logs" role="menuitem">Daily Logs</a></li>
            <li><a href="#" data-content="awards" role="menuitem">Awards</a></li>
            <li><a href="#" data-content="generate" role="menuitem">Qr Code</a></li>
            <li className="menu-gap"></li>
            <li className="sidebar-section">SETTINGS</li>
            <li><a href="#" data-content="account" role="menuitem">Account</a></li>
            <li><a href="#" data-content="school" role="menuitem">School</a></li>
          </ul>
          <div className="sidebar-footer">
            <button id="themeToggle" className="btn tiny ghost w-100 blkwhtToggle" aria-pressed="false" type="button">Dark Mode</button>
          </div>
        </nav>

        <main className="main-content" id="mainContent" tabIndex={-1}>
          <header className="main-header">
            <div className="header-left">
              <span className="main-project">Admin Account</span>
              <nav aria-label="Breadcrumb" className="breadcrumb-nav">
                <ol className="breadcrumb-list" id="breadcrumbList">
                  <li><a href="#" data-nav="dashboard">Home</a></li>
                  <li aria-current="page" id="breadcrumbCurrent">Dashboard</li>
                </ol>
              </nav>
            </div>
            <div className="profile-actions">
              <button id="editProfileBtn" className="btn small" type="button">Edit Profile</button>
              <button id="logoutBtn" className="btn small danger" type="button">Log Out</button>
            </div>
          </header>

          <div className="visually-hidden" aria-live="polite" id="liveRegion"></div>

          {/* DASHBOARD SECTION */}
          <section id="dashboardSection" className="section-panel nopads" data-section="dashboard">
            <div className="side-section">
              <div id="portalStatusContainer" className="mb-3">
                <button id="portalStatusBtn" className="btn pill status-offline" aria-live="polite" type="button">Portal: Offline</button>
              </div>
              <h3 className="h-sub">Student Rank by Merit</h3>
              <table className="rank-table" id="sideRankTable" aria-label="Top merit students">
                <thead><tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Merit</th></tr></thead>
                <tbody></tbody>
              </table><br />
              <div className="rank-dropdown-container">
                <label htmlFor="sideRankDropdown" className="form-label">Compact View (top 50):</label>
                <select id="sideRankDropdown" size={6} aria-label="Compact ranking list" className="form-control slim"></select>
              </div>
            </div>
            <div className="dashboard-main">
              <div className="dashboard-cards" id="dashboardCards">
                <div className="dashboard-card kpi-card" data-kpi="present">
                  <div className="kpi-head">
                    <span className="card-title">Present Today</span>
                    <span className="kpi-dot dot-success"></span>
                  </div>
                  <span className="card-count" id="presentToday">0</span>
                  <span className="card-info">Students present</span>
                  <button className="kpi-refresh btn tiny ghost" data-refresh="present" aria-label="Refresh present KPI" type="button">↻</button>
                </div>
                <div className="dashboard-card kpi-card" data-kpi="absent">
                  <div className="kpi-head">
                    <span className="card-title">Absent Today</span>
                    <span className="kpi-dot dot-danger"></span>
                  </div>
                  <span className="card-count" id="absentToday">0</span>
                  <span className="card-info">Students absent</span>
                  <button className="kpi-refresh btn tiny ghost" data-refresh="absent" aria-label="Refresh absent KPI" type="button">↻</button>
                </div>
                <div className="dashboard-card kpi-card" data-kpi="late">
                  <div className="kpi-head">
                    <span className="card-title">Late Comers</span>
                    <span className="kpi-dot dot-warning"></span>
                  </div>
                  <span className="card-count" id="lateToday">0</span>
                  <span className="card-info">Late arrivals</span>
                  <button className="kpi-refresh btn tiny ghost" data-refresh="late" aria-label="Refresh late KPI" type="button">↻</button>
                </div>
              </div>

              <div className="dashboard-charts">
                <div className="chart-card">
                  <span className="chart-title d-flex justify-between items-center">
                    Major Attendance Today
                    <button className="btn tiny ghost" id="refreshChartBtn" aria-label="Refresh chart" type="button">↻</button>
                  </span>
                  <canvas id="majorAttendanceChart" width="400" height="180"></canvas>
                </div>
              </div>
            </div>
          </section>

          {/* STUDENTS */}
          <section id="studentsSection" className="section-panel d-none" data-section="students" aria-hidden="true">
            <div className="students-table-container">
              <div className="students-table-header-bar">
                <div className="students-table-search-box">
                  <svg className="students-search-logo" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="18" y1="18" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input type="text" id="studentsSearchBar" className="students-table-search" placeholder="Search students..." aria-label="Search students" />
                </div>
                <div className="d-flex gap-2">
                  <button id="addStudentBtn" className="btn small primary" type="button">Add Student</button>
                  <button id="exportStudentsBtn" className="btn small ghost" title="Export students to XLSX" aria-label="Export students" type="button">Export</button>
                </div>
              </div>
              <div className="scrollable-table-wrapper" role="region" aria-label="Students data">
                <table className="retrieval-table" id="studentsTable">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Year</th>
                      <th scope="col">Email</th>
                      <th scope="col">Password</th>
                      <th scope="col">QR Code No</th>
                      <th scope="col">Major</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
              <div id="studentsEmpty" className="empty-hint d-none">No students match your search.</div>
            </div>
          </section>

          {/* LOGS */}
          <section id="logsSection" className="section-panel d-none" data-section="logs" aria-hidden="true">
            <div className="panel-bar">
              <label htmlFor="logsDate" className="form-label">Show logs for date:</label>
              <input type="date" id="logsDate" className="form-control slim" aria-label="Select date for logs" />
              <button id="exportLogsBtn" className="btn small secondary" type="button">Export XLSX</button>
            </div><br />
            <div className="table-responsive">
              <table className="logs-table" id="logsTable">
                <thead>
                  <tr>
                    <th scope="col">Student Name</th>
                    <th scope="col">Time In</th>
                    <th scope="col">Time Out</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date</th>
                    <th scope="col">Activity</th>
                    <th scope="col">Account Status</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            <div id="logsEmpty" className="empty-hint d-none">No logs for selected date.</div>
          </section>

          {/* AWARDS */}
          <section id="awardsSection" className="section-panel d-none" data-section="awards" aria-hidden="true">
            <h3 className="mb-2">Top 10 Students by Merit</h3>
            <div className="table-responsive">
              <table className="retrieval-table" id="awardsTable">
                <thead><tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Merit Points</th><th scope="col">Actions</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
            <div className="mt-4">
              <h4>Student with Most Merit Points:</h4>
              <div id="mostMeritStudent" className="mt-1"></div>
            </div>
          </section>

          {/* QR GENERATOR */}
          <section id="generateSection" className="section-panel d-none" data-section="generate" aria-hidden="true">
            <h2 className="section-title">QR Code Generator &amp; Confirmation</h2>
            <div className="generate-wrapper">
              <div className="generate-left">
                <h3>Create / Download QR Code</h3>
                <form id="qrGenerateForm" autoComplete="off">
                  <div className="form-row">
                    <label htmlFor="qrInputCode" className="form-label">Enter Code (or blank for random):</label>
                    <div className="qr-input-row">
                      <input type="text" id="qrInputCode" maxLength={64} className="form-control" placeholder="e.g. KN3L20DF" onKeyUp={upperKeyUp} />
                      <select id="qrRandomLen" className="mini-select" aria-label="Random length" defaultValue="8">
                        <option value="8">Len 8</option>
                        <option value="10">Len 10</option>
                        <option value="12">Len 12</option>
                      </select>
                      <button type="button" className="btn small secondary" onClick={() => window.MS_generateRandomCode && window.MS_generateRandomCode(parseInt(document.getElementById('qrRandomLen').value, 10))}>Randomize</button>
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-check">
                      <input type="checkbox" id="qrAddPadding" defaultChecked /> <span> Add 20px white padding (quiet zone)</span>
                    </label>
                  </div>
                  <div className="form-row row-actions win-tiles" style={{ textAlign: 'center' }}>
                    <button type="button" className="btn primary" onClick={() => window.MS_generateQRCode && window.MS_generateQRCode()}>Generate &amp; Verify</button>
                    <button type="button" className="btn ghost" onClick={() => window.MS_manualDecodeCurrent && window.MS_manualDecodeCurrent()}>Manual Decode</button>
                    <button type="button" className="btn ghost" onClick={() => window.MS_selfTestLoop && window.MS_selfTestLoop()}>Self Test</button>
                    <button type="button" className="btn ghost" id="clearQrBtn" onClick={() => window.MS_clearQRCode && window.MS_clearQRCode()}>Clear</button>
                  </div>
                </form>

                <div id="qrResultContainer" className="qr-result">
                  <div id="qrCodeCanvasWrapper">
                    <canvas id="qrRenderedCanvas" width="0" height="0" aria-label="Generated QR code"></canvas>
                  </div>
                  <div className="qr-meta">
                    <div>Original Input: <span id="qrOriginalCode" className="code-pill"></span></div>
                    <div>Normalized Stored: <span id="qrCurrentCode" className="code-pill strong"></span></div>
                    <div>Local Decode Status: <span id="qrLocalDecodeStatus" className="badge badge-idle">Idle</span></div>
                  </div>
                  <div className="qr-actions">
                    <button id="downloadQRBtn" className="btn neutral" disabled type="button" onClick={() => window.MS_downloadQRCode && window.MS_downloadQRCode()}>Download PNG</button>
                    <button className="btn secondary" type="button" onClick={() => window.MS_downloadUpscaled && window.MS_downloadUpscaled()}>Download x4</button>
                    <button className="btn ghost" id="copyCodeBtn" disabled type="button" onClick={() => window.MS_copyCode && window.MS_copyCode()}>Copy Code</button>
                  </div>
                </div>

                <div className="qr-generated-list">
                  <h4>Generated Codes (Session)</h4>
                  <ul id="qrGeneratedCodesUl" className="code-list"></ul>
                </div>
              </div>

              <div className="generate-right">
                <h3>Confirm / Scan QR Code</h3>
                <p className="hint">Tips: steady device, medium brightness, avoid glare.</p>
                <div id="qrReaderContainer">
                  <div id="qrReader" className="qr-reader-box" aria-label="QR reader viewport"></div>
                  <div className="scan-controls">
                    <button id="startScannerBtn" className="btn small primary" disabled type="button" onClick={() => window.MS_startScanner && window.MS_startScanner()}>Start Scanner</button>
                    <button id="stopScannerBtn" className="btn small danger" disabled type="button" onClick={() => window.MS_stopScanner && window.MS_stopScanner()}>Stop Scanner</button>
                  </div>
                </div>
                <div className="scan-status">
                  <div>Last Raw Scan: <span id="scanResultRaw" className="code-inline">(none)</span></div>
                  <div>Normalized: <span id="scanResultText" className="badge badge-idle">Idle</span></div>
                  <div>Registration Status: <span id="scanRegStatus" className="badge badge-idle">Unknown</span></div>
                </div>
                <hr />
                <h4>Fallback: Upload Image to Decode</h4>
                <input type="file" id="qrImageFile" accept="image/*" className="form-control slim" onChange={(e) => window.MS_decodeFromImage && window.MS_decodeFromImage(e)} />
                <div id="imageDecodeStatus" className="hint mt-1"></div>
                <canvas id="qrHiddenCanvas" style={{ display: 'none' }}></canvas>
                <hr />
                <h4>Manual Code Check</h4>
                <div className="manual-check-row">
                  <input type="text" id="manualCheckInput" className="form-control" placeholder="Enter code" onKeyUp={upperKeyUp} />
                  <button className="btn small secondary" type="button" onClick={() => window.MS_manualCheck && window.MS_manualCheck()}>Check</button>
                </div>
                <div id="manualCheckStatus" className="hint mt-1"></div>
              </div>
            </div>
          </section>

          {/* ACCOUNT */}
          <section id="accountSection" className="section-panel d-none" data-section="account" aria-hidden="true">
            <h2>Account Settings</h2>
            <div className="account-settings-list ms-accounts">
              <button className="account-settings-item" data-dropdown="emailDropdown" type="button">
                <span className="ms-acc-title">Change Email</span><span className="ms-acc-caret"></span>
              </button>
              <div className="account-option-modal ms-panel-skin" id="emailDropdown">
                <form id="changeEmailForm">
                  <div className="ms-field"><label>Old Email</label><input type="email" name="oldEmail" className="ms-input" required /></div>
                  <div className="ms-field"><label>New Email</label><input type="email" name="newEmail" className="ms-input" required /></div>
                  <div className="ms-actions justify-end">
                    <button type="submit" className="ms-btn primary">Save</button>
                    <button type="button" className="ms-btn neutral cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>

              <button className="account-settings-item" data-dropdown="passwordDropdown" type="button">
                <span className="ms-acc-title">Change Password</span><span className="ms-acc-caret"></span>
              </button>
              <div className="account-option-modal ms-panel-skin" id="passwordDropdown">
                <form id="changePassForm">
                  <div className="ms-field"><label>Old Password</label><input type="password" name="oldPass" className="ms-input" required /></div>
                  <div className="ms-field"><label>New Password</label><input type="password" name="newPass" className="ms-input" required /></div>
                  <div className="ms-actions justify-end">
                    <button type="submit" className="ms-btn primary">Change</button>
                    <button type="button" className="ms-btn neutral cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>

              <button className="account-settings-item" data-dropdown="nameDropdown" type="button">
                <span className="ms-acc-title">Rename Account Name</span><span className="ms-acc-caret"></span>
              </button>
              <div className="account-option-modal ms-panel-skin" id="nameDropdown">
                <form id="changeNameForm">
                  <div className="ms-field"><label>New Account Name</label><input type="text" name="newName" className="ms-input" required /></div>
                  <div className="ms-actions justify-end">
                    <button type="submit" className="ms-btn primary">Save</button>
                    <button type="button" className="ms-btn neutral cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>

              <button className="account-settings-item" data-dropdown="backupDropdown" type="button">
                <span className="ms-acc-title">Backup All Data</span><span className="ms-acc-caret"></span>
              </button>
              <div className="account-option-modal ms-panel-skin" id="backupDropdown">
                <p className="ms-note">Download a simulated backup ZIP of all session data.</p>
                <div className="ms-actions">
                  <button id="doBackup" type="button" className="ms-btn secondary">Download ZIP</button>
                  <button type="button" className="ms-btn neutral cancel-btn">Cancel</button>
                </div>
              </div>

              <button className="account-settings-item" data-dropdown="detailsDropdown" type="button">
                <span className="ms-acc-title">Details</span><span className="ms-acc-caret"></span>
              </button>
              <div className="account-option-modal ms-panel-skin" id="detailsDropdown">
                <div className="kv-list">
                  <dt>Valid Year</dt><dd>2025</dd>
                  <dt>Status</dt><dd><span className="badge badge-success">Active</span></dd>
                </div>
                <div className="ms-actions mt-3">
                  <button id="extendYearBtn" type="button" className="ms-btn secondary">Request Extension</button>
                  <button type="button" className="ms-btn neutral cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          </section>

          {/* SCHOOL */}
          <section id="schoolSection" className="section-panel d-none" data-section="school" aria-hidden="true">
            <h3>School Information</h3>
            <ul className="info-list">
              <li>School ID: <strong id="schoolID"></strong></li>
              <li>Registered Students per Major:
                <ul id="majorCounts" className="mt-1 nested-list"></ul>
              </li>
              <li>Admin Account School Year Validity: <strong id="schoolYearValidity"></strong></li>
              <li>Verified Admin Accounts (with ID):</li>
              <ul id="verifiedAdmins" className="nested-list mt-1"></ul>
            </ul>
          </section>

          {/* Inline modal container */}
          <div id="modalContainer" aria-live="polite"></div>

          {/* Edit Profile Modal */}
          <div id="editProfileModal" className="modal" aria-hidden="true">
            <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
              <button className="close" id="closeModalBtn" aria-label="Close" type="button">&times;</button>
              <h2 id="editProfileTitle" className="ms-modal-title">Edit Profile</h2>
              <div className="ms-modal-grid">
                <form id="editProfileForm" autoComplete="off">
                  <div className="ms-field">
                    <label htmlFor="editName">Name:</label>
                    <input className="ms-input" type="text" id="editName" name="editName" required />
                  </div>
                  <div className="ms-field">
                    <label htmlFor="editProfilePic">Profile Picture:</label>
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
          </div>

        </main>
      </div>
    </body>
  );
}