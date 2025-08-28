import React, { useEffect, useRef } from 'react';
import './styles.css';
import './responsive-patch.css';

/*
  Master Dashboard (React Port)
  - Cleaned: removed duplicate sidebar toggle listener, fixed missing function refs,
    safer null guards, consolidated media query handling.
  - All legacy IDs/classes preserved for CSS & script parity.
*/

export default function Master() {
  const scriptsRan = useRef(false);

  useEffect(() => {
    if (scriptsRan.current) return;
    scriptsRan.current = true;

    const libUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
      'https://unpkg.com/html5-qrcode',
      'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    ];

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === 'true') return resolve();
          existing.addEventListener('load', () => {
            existing.dataset.loaded = 'true';
            resolve();
          });
          existing.addEventListener('error', reject);
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => {
          s.dataset.loaded = 'true';
          resolve();
        };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    Promise.all(libUrls.map(loadScript))
      .catch(err => console.error('Library load failed', err))
      .finally(initDashboardScripts);

    function initDashboardScripts() {
      const NS = (window.MS = window.MS || {});

      /* ---------- Element Cache ---------- */
      const el = id => document.getElementById(id);

      const sidebarToggle = el('sidebarToggle');
      const sidebar       = el('sidebar');
      const sidebarMenu   = document.querySelector('.sidebar-menu');
      const breadcrumbEl  = el('breadcrumb');
      const mainContent   = el('mainContent');

      const editProfileModal   = el('editProfileModal');
      const editProfileBtn     = el('editProfileBtn');
      const closeModalBtn      = el('closeModalBtn');
      const cancelEditProfile  = el('cancelEditProfile');
      const editProfileForm    = el('editProfileForm');
      const profileNameSidebar = el('profileNameSidebar');
      const profilePicSidebar  = el('profilePicSidebar');
      const logoutBtn          = el('logoutBtn');

      const updateModal        = el('updateModal');
      const closeUpdateModalBtn= el('closeUpdateModalBtn');
      const updateAccountForm  = el('updateAccountForm');
      const approvalModal      = el('approvalModal');
      const approvalForm       = el('approvalForm');
      const addAccountModal    = el('addAccountModal');
      const addAccountForm     = el('addAccountForm');
      const retrieveAccountModal = el('retrieveAccountModal');
      const retrieveAccountForm  = el('retrieveAccountForm');

      if (!sidebar || !sidebarToggle) {
        console.warn('Sidebar elements missing; aborting script init.');
        return;
      }

      /* ---------- Navigation Logic ---------- */
      const sections = ['dashboard','schools','notification','generate','modification','retrieval','account','logs'];
      let scannerPrepared = false;

      document.querySelectorAll('.sidebar-menu a[data-content]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const target = link.getAttribute('data-content');
            if (!target) return;
          // Activate link
          document.querySelectorAll('.sidebar-menu a').forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          });
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');

          // Show/hide sections
          sections.forEach(sec => {
            const node = el(sec);
            if (node) node.style.display = sec === target ? 'block' : 'none';
          });

          if (breadcrumbEl) breadcrumbEl.textContent = link.textContent.trim();

          // Prepare scanner when first entering 'generate'
          if (target === 'generate' && !scannerPrepared) {
            NS.prepareScanner && NS.prepareScanner();
            scannerPrepared = true;
          }

          // Auto-close sidebar on mobile
          if (window.matchMedia('(max-width:900px)').matches) {
            document.body.classList.remove('sidebar-open');
            syncAria();
          }

          mainContent && mainContent.focus({ preventScroll: true });
        });
      });

      /* ---------- Sidebar Responsive Toggle (FIXED) ---------- */
      const mqMobile = window.matchMedia('(max-width:900px)');

      function isMobile() { return mqMobile.matches; }

      function openMobile() {
        document.body.classList.add('sidebar-open');
        sidebar.classList.remove('collapsed');
        syncAria();
      }
      function closeMobile() {
        document.body.classList.remove('sidebar-open');
        sidebar.classList.remove('collapsed');
        syncAria();
      }
      function toggleSidebar() {
        if (isMobile()) {
          if (document.body.classList.contains('sidebar-open')) closeMobile();
          else openMobile();
        } else {
          // Desktop mini mode
          document.body.classList.toggle('sidebar-mini');
          syncAria();
        }
      }
      function syncAria() {
        if (!sidebarToggle) return;
        if (isMobile()) {
          const expanded = document.body.classList.contains('sidebar-open');
          sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          sidebarToggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
        } else {
          const mini = document.body.classList.contains('sidebar-mini');
          sidebarToggle.setAttribute('aria-expanded', mini ? 'false' : 'true');
          sidebarToggle.setAttribute('aria-label', mini ? 'Show navigation' : 'Hide navigation');
        }
      }

      sidebarToggle.addEventListener('click', toggleSidebar);

      mqMobile.addEventListener('change', () => {
        // Reset conflicting states when crossing breakpoint
        document.body.classList.remove('sidebar-open');
        sidebar.classList.remove('collapsed');
        // Leave or remove mini mode only for desktop
        if (!isMobile()) {
          // Keep whatever mini state user set, just ensure collapsed removed
          sidebar.classList.remove('collapsed');
        } else {
          document.body.classList.remove('sidebar-mini');
        }
        syncAria();
      });

      // Initial state
      closeMobile(); // ensures mobile closed by default
      syncAria();

      /* ---------- Modal Helpers ---------- */
      function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        trapFocus(modal);
      }
      function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
        releaseFocusTrap();
      }

      let lastFocused = null;
      let focusTrapContainer = null;
      function trapFocus(container) {
        lastFocused = document.activeElement;
        focusTrapContainer = container;
        const f = [...container.querySelectorAll(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )].filter(n => !n.disabled && n.offsetParent !== null);
        if (f.length) f[0].focus();
        document.addEventListener('keydown', handleTrap);
      }
      function releaseFocusTrap() {
        document.removeEventListener('keydown', handleTrap);
        if (lastFocused) lastFocused.focus();
        focusTrapContainer = null;
      }
      function handleTrap(e) {
        if (e.key === 'Escape' && focusTrapContainer) {
          closeModal(focusTrapContainer);
        } else if (e.key === 'Tab' && focusTrapContainer) {
          const f = [...focusTrapContainer.querySelectorAll(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
          )].filter(n => !n.disabled && n.offsetParent !== null);
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      }

      /* ---------- Profile Modal ---------- */
      editProfileBtn && editProfileBtn.addEventListener('click', () => {
        if (el('editName') && profileNameSidebar)
          el('editName').value = profileNameSidebar.textContent;
        openModal(editProfileModal);
      });
      closeModalBtn && closeModalBtn.addEventListener('click', () => closeModal(editProfileModal));
      cancelEditProfile && cancelEditProfile.addEventListener('click', () => closeModal(editProfileModal));
      editProfileForm && editProfileForm.addEventListener('submit', e => {
        e.preventDefault();
        const newNameEl = el('editName');
        if (newNameEl && profileNameSidebar) {
          const newName = newNameEl.value.trim();
            if (newName) profileNameSidebar.textContent = newName;
        }
        const picInput = el('editProfilePic');
        if (picInput && picInput.files && picInput.files[0]) {
          const reader = new FileReader();
          reader.onload = ev => { if (profilePicSidebar) profilePicSidebar.src = ev.target.result; };
          reader.readAsDataURL(picInput.files[0]);
        }
        closeModal(editProfileModal);
      });
      logoutBtn && logoutBtn.addEventListener('click', () => {
        alert('Logged out!');
        location.reload();
      });

      window.addEventListener('click', e => {
        [editProfileModal, updateModal, approvalModal, addAccountModal, retrieveAccountModal].forEach(m => {
          if (m && e.target === m) closeModal(m);
        });
      });

      /* ---------- Modification Section Helpers ---------- */
      NS.openUpdateModal = function(name, role, email, level, password, schoolId) {
        el('updateName').value  = name;
        el('updateRole').value  = role;
        el('updateEmail').value = email;
        el('updateLevel').value = level;
        el('updatePassword').value = password;
        el('updateSchoolID').value = schoolId;
        openModal(updateModal);
      };
      window.openUpdateModal = NS.openUpdateModal;

      closeUpdateModalBtn && closeUpdateModalBtn.addEventListener('click', () => closeModal(updateModal));
      updateAccountForm && updateAccountForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Account updated!');
        closeModal(updateModal);
      });

      window.toggleDropdown = id => {
        const n = el(id);
        if (n) {
          n.style.display = n.style.display === 'block' ? 'none' : 'block';
        }
      };
      window.filterModificationAccounts = () => {
        const input = el('modificationSearchInput');
        const q = input ? input.value.toLowerCase().trim() : '';
        document.querySelectorAll('.account-card').forEach(c => {
          c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      };

      /* ---------- Account Settings ---------- */
      window.showAccountOption = opt => {
        ['changePassword','renameAccount','backupDatabase','duplicateMaster']
          .forEach(o => {
            const p = el(o + 'Option');
            if (!p) return;
            p.style.display = (o === opt) ? 'block' : 'none';
          });
      };
      window.closeAccountOption = opt => {
        const p = el(opt + 'Option');
        if (p) p.style.display = 'none';
      };

      const changePasswordForm = el('changePasswordForm');
      changePasswordForm && changePasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Password changed!');
        window.closeAccountOption('changePassword');
      });

      const renameAccountForm = el('renameAccountForm');
      renameAccountForm && renameAccountForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Account name renamed!');
        window.closeAccountOption('renameAccount');
      });

      window.toggleLogsDropdown = id => {
        const n = el(id);
        if (n) n.style.display = n.style.display === 'block' ? 'none' : 'block';
      };

      /* ---------- Approval Modal ---------- */
      window.openApprovalModal = e => {
        if (e) e.stopPropagation();
        if (approvalForm) approvalForm.reset();
        const yearEl = el('approvalSchoolYear');
        if (yearEl) yearEl.value = '2026';
        const errEl = el('schoolIDError');
        if (errEl) errEl.style.display = 'none';
        openModal(approvalModal);
      };
      window.closeApprovalModal = () => closeModal(approvalModal);

      approvalForm && approvalForm.addEventListener('submit', e => {
        e.preventDefault();
        const schoolIDEl = el('approvalSchoolID');
        const errorEl = el('schoolIDError');
        if (schoolIDEl && !schoolIDEl.value.trim()) {
          if (errorEl) errorEl.style.display = 'block';
          schoolIDEl.focus();
          return;
        }
        if (errorEl) errorEl.style.display = 'none';
        alert('School Registration Approved!');
        closeModal(approvalModal);
        const card = el('notif-approval-1');
        if (card) {
          card.classList.remove('notification-unread');
          card.classList.add('notification-read');
          const dot = card.querySelector('.notif-status-dot');
          if (dot) dot.setAttribute('aria-label', 'Read');
        }
      });

      /* ---------- Retrieval ---------- */
      window.toggleRetrievalTable = id => {
        const n = el(id);
        if (n) n.style.display = n.style.display === 'block' ? 'none' : 'block';
      };
      window.showAddAccountModal = () => {
        addAccountForm && addAccountForm.reset();
        openModal(addAccountModal);
      };
      window.closeAddAccountModal = () => closeModal(addAccountModal);
      addAccountForm && addAccountForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Account added!');
        closeModal(addAccountModal);
      });

      window.showRetrieveAccountModal = row => {
        if (!row) return;
        const cells = row.querySelectorAll('td');
        el('retrieveName').value        = cells[0]?.innerText || '';
        el('retrieveProfession').value  = cells[1]?.innerText || '';
        el('retrieveEmail').value       = cells[2]?.innerText || '';
        el('retrieveLevel').value       = cells[3]?.innerText || '';
        el('retrieveSchoolName').value  = row.dataset.school  || '';
        el('retrieveSchoolID').value    = row.dataset.schoolid|| '';
        el('retrievePassword').value    = '';
        openModal(retrieveAccountModal);
      };
      window.closeRetrieveAccountModal = () => closeModal(retrieveAccountModal);
      retrieveAccountForm && retrieveAccountForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Account retrieved!');
        closeModal(retrieveAccountModal);
      });
      window.filterRetrievalTable = () => {
        const input = el('retrievalSearch');
        const q = input ? input.value.toLowerCase() : '';
        document.querySelectorAll('.retrieval-table-group tbody tr').forEach(r => {
          r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
        });
      };

      /* ---------- QR Logic ---------- */
      const generatedCodes = new Set();
      let html5qrcodeInstance = null;
      let scannerRunning = false;

      function sanitize(raw) {
        return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 64);
      }
      function getEcc(letter) {
        const map = {
          L: window.QRCode?.CorrectLevel.L,
          M: window.QRCode?.CorrectLevel.M,
          Q: window.QRCode?.CorrectLevel.Q,
          H: window.QRCode?.CorrectLevel.H
        };
        return map[letter] || window.QRCode?.CorrectLevel.H;
      }

      NS.generateRandomCode = function(len = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let out = '';
        for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
        const input = el('qrInputCode');
        if (input) input.value = out;
        return out;
      };
      window.MS_generateRandomCode = NS.generateRandomCode;

      NS.generateQRCode = function() {
        const inputEl = el('qrInputCode');
        if (!inputEl) return;
        let code = sanitize(inputEl.value);
        if (!code) code = NS.generateRandomCode(parseInt(el('qrRandomLen')?.value, 10) || 8);
        const size = parseInt(el('qrSizeSelect')?.value, 10) || 256;
        const ecc  = getEcc(el('qrEccSelect')?.value || 'H');
        const pad  = el('qrAddPadding')?.checked ? 20 : 0;

        if (!window.QRCode) { alert('QRCode library not loaded.'); return; }

        const temp = document.createElement('div');
        new window.QRCode(temp, { text: code, width: size, height: size, correctLevel: ecc });
        setTimeout(() => {
          const img = temp.querySelector('img') || temp.querySelector('canvas');
          if (!img) { alert('QR generation failed'); return; }
          const canvas = el('qrRenderedCanvas');
          if (!canvas) return;
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
          el('qrCurrentCode').textContent  = code;
          el('downloadQRBtn').disabled = false;
          el('copyCodeBtn').disabled    = false;
          if (!generatedCodes.has(code)) {
            generatedCodes.add(code);
            renderGeneratedCodes();
          }
          localDecode();
        }, 30);
      };
      window.MS_generateQRCode = NS.generateQRCode;

      function renderGeneratedCodes() {
        const ul = el('qrGeneratedCodesUl');
        if (!ul) return;
        ul.innerHTML = '';
        [...generatedCodes].slice(-50).reverse().forEach(c => {
          const li = document.createElement('li');
          li.textContent = c;
          ul.appendChild(li);
        });
      }

      NS.clearQRCode = function() {
        const canvas = el('qrRenderedCanvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        el('qrOriginalCode').textContent = '';
        el('qrCurrentCode').textContent  = '';
        const status = el('qrLocalDecodeStatus');
        if (status) {
          status.textContent = 'Idle';
          status.className = 'badge badge-idle';
        }
        el('downloadQRBtn').disabled = true;
        el('copyCodeBtn').disabled    = true;
      };
      window.MS_clearQRCode = NS.clearQRCode;

      NS.downloadQRCode = function() {
        const canvas = el('qrRenderedCanvas');
        if (!canvas || !canvas.width) { alert('No QR code.'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = (el('qrCurrentCode').textContent || 'qr_code') + '.png';
        a.click();
      };
      window.MS_downloadQRCode = NS.downloadQRCode;

      NS.downloadUpscaled = function() {
        const src = el('qrRenderedCanvas');
        if (!src || !src.width) { alert('No QR to upscale'); return; }
        const scale = 4;
        const big = document.createElement('canvas');
        big.width  = src.width * scale;
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

      NS.copyCode = function() {
        const code = el('qrCurrentCode').textContent;
        if (!code) return;
        try {
          navigator.clipboard.writeText(code).then(() => {
            const btn = el('copyCodeBtn');
            if (!btn) return;
            const old = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = old, 1200);
          });
        } catch (err) {
          console.warn('Clipboard unavailable', err);
        }
      };
      window.MS_copyCode = NS.copyCode;

      function localDecode() {
        const canvas = el('qrRenderedCanvas');
        if (!canvas || !canvas.width) return;
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (!window.jsQR) {
          const st = el('qrLocalDecodeStatus');
          if (st) { st.textContent = 'Library Missing'; st.className = 'badge badge-error'; }
          return;
        }
        const res = window.jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
        const status = el('qrLocalDecodeStatus');
        if (!status) return;
        if (res && res.data) {
          const san = sanitize(res.data);
          status.textContent = 'PASS (' + san + ')';
          status.className = 'badge badge-success';
        } else {
          status.textContent = 'FAIL';
          status.className = 'badge badge-error';
        }
      }

      NS.manualDecodeCurrent = localDecode;
      window.MS_manualDecodeCurrent = localDecode;

      NS.selfTestLoop = async function(count = 10) {
        const btns = document.querySelectorAll('#qrGenerateForm button,.qr-actions button');
        btns.forEach(b => b.disabled = true);
        for (let i = 0; i < count; i++) {
          const input = el('qrInputCode');
          if (input) input.value = '';
          NS.generateQRCode();
          await new Promise(r => setTimeout(r, 150));
        }
        btns.forEach(b => b.disabled = false);
        if (el('qrCurrentCode').textContent) el('copyCodeBtn').disabled = false;
      };
      window.MS_selfTestLoop = NS.selfTestLoop;

      NS.prepareScanner = function() {
        const startBtn = el('startScannerBtn');
        if (window.Html5Qrcode && startBtn) startBtn.disabled = false;
      };

      NS.startScanner = function() {
        if (scannerRunning) return;
        if (!window.Html5Qrcode) { alert('Scanner library missing.'); return; }
        html5qrcodeInstance = new window.Html5Qrcode('qrReader', { verbose: false });
        const config = { fps: 12, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
        html5qrcodeInstance.start(
          { facingMode: 'environment' },
          config,
          decoded => NS.onScanSuccess(decoded),
          () => {}
        ).then(() => {
          scannerRunning = true;
          el('startScannerBtn').disabled = true;
          el('stopScannerBtn').disabled  = false;
          setScanStatus('Scanning...', 'active');
        }).catch(err => {
          setScanStatus('Start failed', 'error');
          console.error(err);
        });
      };
      window.MS_startScanner = NS.startScanner;

      NS.stopScanner = function() {
        if (!scannerRunning || !html5qrcodeInstance) return;
        html5qrcodeInstance.stop().then(() => {
          scannerRunning = false;
          el('startScannerBtn').disabled = false;
          el('stopScannerBtn').disabled  = true;
          setScanStatus('Stopped', 'idle');
        }).catch(err => {
          setScanStatus('Stop error', 'error');
          console.error(err);
        });
      };
      window.MS_stopScanner = NS.stopScanner;

      NS.onScanSuccess = function(raw) {
        const clean = sanitize(raw);
        const rawSpan = el('scanResultRaw');
        if (rawSpan) rawSpan.textContent = raw;
        setScanStatus(clean, 'success');
        updateRegistrationStatus(clean);
      };

      function setScanStatus(text, state = 'idle') {
        const elStatus = el('scanResultText');
        if (!elStatus) return;
        elStatus.textContent = text;
        elStatus.className = 'badge badge-' + state;
      }
      function updateRegistrationStatus(code) {
        const exists = generatedCodes.has(code);
        const reg = el('scanRegStatus');
        if (!reg) return;
        reg.textContent = exists ? 'REGISTERED (Session)' : 'UNREGISTERED';
        reg.className = 'badge ' + (exists ? 'badge-registered' : 'badge-unregistered');
      }

      NS.decodeFromImage = function(evt) {
        const file = evt.target.files[0];
        if (!file) return;
        const status = el('imageDecodeStatus');
        if (status) status.textContent = 'Decoding...';
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            const canvas = el('qrHiddenCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width  = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            if (!window.jsQR) {
              if (status) status.textContent = 'jsQR missing';
              return;
            }
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = window.jsQR(data.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
            if (code) {
              NS.onScanSuccess(code.data);
              if (status) status.textContent = 'Decoded: ' + code.data;
            } else {
              if (status) status.textContent = 'No QR found.';
            }
          };
          img.onerror = () => { if (status) status.textContent = 'Invalid image.'; };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      };
      window.MS_decodeFromImage = NS.decodeFromImage;

      NS.manualCheck = function() {
        const input = el('manualCheckInput');
        const status = el('manualCheckStatus');
        const code = sanitize(input?.value || '');
        if (!status) return;
        if (!code) { status.textContent = 'Enter a code first.'; return; }
        status.textContent = generatedCodes.has(code) ? 'Code is REGISTERED (session).' : 'Code not found.';
      };
      window.MS_manualCheck = NS.manualCheck;

      window.addEventListener('beforeunload', () => {
        if (scannerRunning && html5qrcodeInstance) {
          try { html5qrcodeInstance.stop(); } catch (_) {}
        }
      });

      // If page loads with 'generate' visible (unlikely) prepare scanner
      const generateSection = el('generate');
      if (generateSection && generateSection.style.display !== 'none') {
        NS.prepareScanner();
        scannerPrepared = true;
      }
    }
  }, []);

  const uppercaseKeyUp = e => { e.target.value = e.target.value.toUpperCase(); };

  return (
    <>
      <a href="#mainContent" className="skip-link">Skip to main content</a>
      <div className="sidebar-backdrop" />
      <div className="app-container" id="appRoot">

        {/* SIDEBAR */}
        <nav className="sidebar" id="sidebar" aria-label="Primary">
          <div className="sidebar-header">
            <span className="sidebar-title">Merit Scan</span>
            <button
              className="sidebar-toggle"
              id="sidebarToggle"
              aria-label="Open navigation"
              aria-controls="sidebar"
              aria-expanded="false"
              type="button"
            >
              &#9776;
            </button>
          </div>
          <div className="sidebar-profile">
            <div className="profile-img">
              <img id="profilePicSidebar" src="https://i.imgur.com/4Z5b1aH.png" alt="Master Account" />
            </div>
            <div className="profile-details">
              <span className="profile-name" id="profileNameSidebar">Master Account</span>
              <span className="profile-status online" id="onlineStatus">Online</span>
            </div>
          </div>
          <ul className="sidebar-menu" id="mainNav" role="navigation" aria-label="Sections">
            <li className="sidebar-section">REPORTS</li>
            <li><a href="#" className="active" data-content="dashboard" aria-current="page">Dashboard</a></li>
            <li><a href="#" data-content="schools">Schools</a></li>
            <li><a href="#" data-content="notification">Notification</a></li>
            <li className="menu-gap" />
            <li className="sidebar-section">MANAGE</li>
            <li><a href="#" data-content="generate">QR Code Generator</a></li>
            <li><a href="#" data-content="modification">Modification</a></li>
            <li><a href="#" data-content="retrieval">Retrieval</a></li>
            <li className="menu-gap" />
            <li className="sidebar-section">SETTINGS</li>
            <li><a href="#" data-content="account">Account</a></li>
            <li><a href="#" data-content="logs">Logs</a></li>
          </ul>
        </nav>

        {/* MAIN CONTENT */}
        <main className="main-content" id="mainContent" tabIndex={-1}>
          <header className="main-header">
            <span className="main-project" id="projectName">Master Account</span>
            <span className="main-breadcrumb">
              Home &gt; <span id="breadcrumb">Dashboard</span>
            </span>
            <div className="profile-actions">
              <button id="editProfileBtn" className="profile-action-btn" type="button">Edit Profile</button>
              <button id="logoutBtn" className="profile-action-btn logout" type="button">Log Out</button>
            </div>
          </header>

          {/* Edit Profile Modal */}
          <div id="editProfileModal" className="modal" aria-hidden="true">
            <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
              <button className="close" id="closeModalBtn" aria-label="Close" type="button">&times;</button>
              <h2 id="editProfileTitle">Edit Profile</h2>
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

          {/* DASHBOARD SECTION */}
          <section className="dashboard" id="dashboard" style={{ display: 'block' }}>
            <h1 className="visually-hidden">Dashboard Overview</h1>
            <div className="dashboard-cards">
              <div className="dashboard-card" data-card="active-schools">
                <div className="card-title">Active Schools</div>
                <div className="card-count" id="activeSchoolCount">2</div>
                <div className="card-info">school_id: <span id="activeSchoolList">101, 102</span></div>
                <a href="#" className="card-link">More info &#9432;</a>
              </div>
              <div className="dashboard-card" data-card="issues">
                <div className="card-title">Report Issues</div>
                <div className="card-count" id="issueCount">5</div>
                <div className="card-info">Errors in website</div>
                <a href="#" className="card-link">More info &#9432;</a>
              </div>
              <div className="dashboard-card" data-card="online">
                <div className="card-title">Online Accounts</div>
                <div className="card-count" id="onlineAccounts">14</div>
                <div className="card-info">Student/Admin</div>
                <a href="#" className="card-link">More info &#9432;</a>
              </div>
              <div className="dashboard-card" data-card="offline">
                <div className="card-title">Offline Accounts</div>
                <div className="card-count" id="offlineAccounts">4</div>
                <div className="card-info">Student/Admin</div>
                <a href="#" className="card-link">More info &#9432;</a>
              </div>
            </div>
            <div className="dashboard-charts">
              <div className="chart-card">
                <div className="chart-title">Active School Stats</div>
                <div className="chart-bar">
                  <div className="bar-group">
                    <label>School ID 101</label>
                    <div className="bar" style={{ width: '70%' }} data-metric="101-online">Online: 8</div>
                  </div>
                  <div className="bar-group">
                    <label>School ID 102</label>
                    <div className="bar" style={{ width: '40%' }} data-metric="102-online">Online: 6</div>
                  </div>
                </div>
              </div>
              <div className="chart-card-issue">
                <div className="chart-title">Issues Summary</div>
                <div className="chart-bar">
                  <div className="bar-group">
                    <label>Error Reports</label>
                    <div className="bar error" style={{ width: '50%' }} data-metric="err-1">3</div>
                  </div>
                  <div className="bar-group">
                    <label>Website Issues</label>
                    <div className="bar error" style={{ width: '30%' }} data-metric="err-2">2</div>
                  </div>
                </div>
              </div>
            </div>
            <section aria-labelledby="dashNotesHeading" style={{ margin: '40px 32px 0 32px' }}>
              <h2 id="dashNotesHeading" style={{ fontSize: '1.05em', margin: '0 0 12px' }}>Notes</h2>
              <p style={{ maxWidth: '760px', fontSize: '.85em', lineHeight: '1.55', color: '#555' }}>
                Dashboard values are placeholders; integrate your data layer to replace them dynamically.
              </p>
            </section>
          </section>

          {/* SCHOOLS SECTION */}
          <section id="schools" style={{ display: 'none' }}>
            <h2>Registered Schools</h2>
            <div className="school-list" id="schoolList">
              <div className="school-card" data-school="101">
                <span className="school-name">School A</span>
                <span className="school-id">school_id: 101</span>
                <span className="school-online">Online Accounts: 8</span>
                <span className="school-offline">Offline Accounts: 2</span>
                <span className="school-portal online">Attendance Portal: Online</span>
              </div>
              <div className="school-card" data-school="102">
                <span className="school-name">School B</span>
                <span className="school-id">school_id: 102</span>
                <span className="school-online">Online Accounts: 6</span>
                <span className="school-offline">Offline Accounts: 2</span>
                <span className="school-portal offline">Attendance Portal: Offline</span>
              </div>
            </div>
          </section>

          {/* NOTIFICATION SECTION */}
          <section id="notification" style={{ display: 'none' }}>
            <h2>Notifications</h2>
            <div className="notification-section">
              <div className="notification-group-title">School Registration Approvals</div>
              <div className="notification-list" id="approvalNotifList">
                <div
                  className="notification-card approval notification-unread"
                  id="notif-approval-1"
                  data-notif="approval-1"
                >
                  <span className="notif-title">School Registration Approval</span>
                  <span>Valid ID:
                    <img src="https://i.imgur.com/4Z5b1aH.png" alt="ID" className="id-img" />
                  </span>
                  <button className="approve-btn" type="button" onClick={(e)=>window.openApprovalModal && window.openApprovalModal(e)}>Approve</button>
                  <span className="notif-status-dot" aria-label="Unread"></span>
                </div>
              </div>

              {/* Approval Modal */}
              <div id="approvalModal" className="modal" aria-hidden="true">
                <div className="modal-content ms-modal-skin wide" role="dialog" aria-modal="true" aria-labelledby="approvalTitle">
                  <button className="close" onClick={()=>window.closeApprovalModal && window.closeApprovalModal()} aria-label="Close" type="button">&times;</button>
                  <h3 id="approvalTitle">School Registration Approval</h3>
                  <div className="ms-modal-grid">
                    <form id="approvalForm" autoComplete="off">
                      <div className="ms-section-label">Submitted Info</div>
                      <div className="ms-field"><label>Name</label><input className="ms-input" type="text" defaultValue="Jane Doe" readOnly /></div>
                      <div className="ms-field"><label>Profession</label><input className="ms-input" type="text" defaultValue="Admin" readOnly /></div>
                      <div className="ms-field"><label>Email</label><input className="ms-input" type="email" defaultValue="jane.doe@schoola.com" readOnly /></div>
                      <div className="ms-field"><label>Password</label><input className="ms-input" type="password" defaultValue="********" readOnly /></div>
                      <div className="ms-field"><label>Levels</label><input className="ms-input" type="text" defaultValue="Level 1" readOnly /></div>
                      <div className="ms-field"><label>School/Campus</label><input className="ms-input" type="text" defaultValue="School A" readOnly /></div>
                      <div className="ms-field">
                        <label>Upload Valid ID</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src="https://i.imgur.com/4Z5b1aH.png" alt="ID" className="approval-modal-id-img" style={{ border: '2px solid #1abc9c' }} />
                          <small className="ms-help">Provided by applicant</small>
                        </div>
                      </div>
                      <hr className="ms-divider" />
                      <div className="ms-section-label">Approve & Assign</div>
                      <div className="ms-field"><label htmlFor="approvalSchoolName">Name of School</label><input className="ms-input" type="text" id="approvalSchoolName" required /></div>
                      <div className="ms-field"><label htmlFor="approvalSchoolID">School ID</label><input className="ms-input" type="text" id="approvalSchoolID" required /></div>
                      <div className="ms-field"><label htmlFor="approvalLevel">Level</label>
                        <select className="ms-input" id="approvalLevel" required defaultValue="">
                          <option value="" disabled>Select Level</option>
                          <option value="Grade School">Grade School</option>
                          <option value="High School">High School</option>
                          <option value="College">College</option>
                        </select>
                      </div>
                      <div className="ms-field"><label htmlFor="approvalSchoolYear">School Year</label><input className="ms-input" type="number" id="approvalSchoolYear" min="2024" max="2100" defaultValue="2026" required /></div>
                      <span id="schoolIDError" className="ms-inline-error">School ID is required.</span>
                      <div className="ms-actions justify-end">
                        <button type="submit" className="ms-btn primary">Approve Registration</button>
                        <button type="button" className="ms-btn neutral" onClick={()=>window.closeApprovalModal && window.closeApprovalModal()}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="notification-group-title" style={{ marginTop: '32px' }}>Report Issues</div>
              <div className="notification-list" id="issueNotifList">
                <div
                  className="notification-card report notification-unread"
                  id="notif2"
                  data-notif="report-1"
                  onClick={()=>window.toggleNotificationDetail && window.toggleNotificationDetail('notif2')}
                  aria-expanded="false"
                  aria-controls="notif2-detail"
                >
                  <span className="notif-title">Report Issue</span>
                  <span>From Student (school_id: 101)</span>
                  <span>Issue: Website Error</span>
                  <span className="notif-status-dot" aria-label="Unread"></span>
                  <div className="notification-detail" id="notif2-detail" role="region" aria-label="Issue details">
                    <p>The student encountered an error when logging in to the school portal at 08:01 AM. Issue details: '504 Gateway Timeout'.</p>
                  </div>
                </div>
                <div
                  className="notification-card report notification-read"
                  id="notif3"
                  data-notif="report-2"
                  onClick={()=>window.toggleNotificationDetail && window.toggleNotificationDetail('notif3')}
                >
                  <span className="notif-title">Report Issue</span>
                  <span>From Admin (school_id: 102)</span>
                  <span>Issue: Login Problem</span>
                  <span className="notif-status-dot" aria-label="Read"></span>
                  <div className="notification-detail" id="notif3-detail">
                    <p>Admin reported login issues at 08:02 AM. Issue details: 'Account locked after 3 failed attempts.'</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QR GENERATOR SECTION */}
          <section id="generate" style={{ display: 'none' }}>
            <h2>QR Code Generator &amp; Confirmation</h2>
            <div className="generate-wrapper">
              <div className="generate-left">
                <h3>Create / Download QR Code</h3>
                <form id="qrGenerateForm" onSubmit={e=>e.preventDefault()}>
                  <div className="form-row">
                    <label htmlFor="qrInputCode">Enter Code (or leave blank for random):</label>
                    <div className="qr-input-row">
                      <input
                        type="text"
                        id="qrInputCode"
                        maxLength={64}
                        placeholder="e.g. KN3L20DF"
                        autoComplete="off"
                        onKeyUp={uppercaseKeyUp}
                      />
                      <select id="qrRandomLen" className="mini-select" title="Random length" defaultValue="8">
                        <option value="8">Len 8</option>
                        <option value="10">Len 10</option>
                        <option value="12">Len 12</option>
                      </select>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={()=>window.MS_generateRandomCode && window.MS_generateRandomCode(parseInt(document.getElementById('qrRandomLen').value,10))}
                      >
                        Randomize
                      </button>
                    </div>
                  </div>
                  <div className="form-row dual">
                    <div>
                      <label htmlFor="qrSizeSelect">Size (px)</label>
                      <select id="qrSizeSelect" defaultValue="256">
                        <option value="200">200</option>
                        <option value="256">256</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="qrEccSelect">Error Correction</label>
                      <select id="qrEccSelect" defaultValue="H">
                        <option value="M">M</option>
                        <option value="Q">Q</option>
                        <option value="H">H</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <label><input type="checkbox" id="qrAddPadding" defaultChecked /> Add 20px white padding (quiet zone)</label>
                  </div>
                  <div className="form-row">
                    <button type="button" className="btn primary" onClick={()=>window.MS_generateQRCode && window.MS_generateQRCode()}>Generate &amp; Verify</button>
                    <button type="button" className="btn ghost" onClick={()=>window.MS_manualDecodeCurrent && window.MS_manualDecodeCurrent()}>Manual Decode Now</button>
                    <button type="button" className="btn ghost" onClick={()=>window.MS_selfTestLoop && window.MS_selfTestLoop()} title="Generate & verify many random codes (dev)">Self Test (Loop)</button>
                  </div>
                </form>
                <div id="qrResultContainer" className="qr-result">
                  <div id="qrCodeCanvasWrapper">
                    <canvas id="qrRenderedCanvas" width="0" height="0" aria-label="Generated QR code canvas"></canvas>
                  </div>
                  <div className="qr-meta">
                    <div>Original Input: <span id="qrOriginalCode" className="code-pill"></span></div>
                    <div>Normalized Stored: <span id="qrCurrentCode" className="code-pill strong"></span></div>
                    <div>Local Decode Status: <span id="qrLocalDecodeStatus" className="badge badge-idle">Idle</span></div>
                  </div>
                  <div className="qr-actions">
                    <button id="downloadQRBtn" className="btn neutral" disabled onClick={()=>window.MS_downloadQRCode && window.MS_downloadQRCode()}>Download PNG</button>
                    <button className="btn secondary" onClick={()=>window.MS_downloadUpscaled && window.MS_downloadUpscaled()}>Download x4</button>
                    <button className="btn ghost" onClick={()=>window.MS_copyCode && window.MS_copyCode()} id="copyCodeBtn" disabled>Copy Code</button>
                    <button className="btn danger" onClick={()=>window.MS_clearQRCode && window.MS_clearQRCode()}>Clear</button>
                  </div>
                </div>
                <div className="qr-generated-list">
                  <h4>Generated Codes (Session)</h4>
                  <ul id="qrGeneratedCodesUl" className="code-list"></ul>
                </div>
              </div>
              <div className="generate-right">
                <h3>Confirm / Scan QR Code</h3>
                <p className="hint">Tips: larger size, medium screen brightness, avoid glare, 15–25cm distance, steady camera.</p>
                <div id="qrReaderContainer">
                  <div id="qrReader" className="qr-reader-box"></div>
                  <div className="scan-controls">
                    <button id="startScannerBtn" className="btn primary" onClick={()=>window.MS_startScanner && window.MS_startScanner()} disabled>Start Scanner</button>
                    <button id="stopScannerBtn" className="btn danger" onClick={()=>window.MS_stopScanner && window.MS_stopScanner()} disabled>Stop Scanner</button>
                  </div>
                </div>
                <div className="scan-status">
                  <div>Last Raw Scan: <span id="scanResultRaw" className="code-inline">(none)</span></div>
                  <div>Normalized: <span id="scanResultText" className="badge badge-idle">Idle</span></div>
                  <div>Registration Status: <span id="scanRegStatus" className="badge badge-idle">Unknown</span></div>
                </div>
                <hr />
                <h4>Fallback: Upload Image to Decode</h4>
                <input type="file" id="qrImageFile" accept="image/*" onChange={(e)=>window.MS_decodeFromImage && window.MS_decodeFromImage(e)} />
                <div id="imageDecodeStatus" className="hint"></div>
                <canvas id="qrHiddenCanvas" style={{ display:'none' }}></canvas>
                <hr />
                <h4>Manual Code Check</h4>
                <div className="manual-check-row">
                  <input type="text" id="manualCheckInput" placeholder="Enter code to verify" onKeyUp={uppercaseKeyUp} />
                  <button className="btn secondary" onClick={()=>window.MS_manualCheck && window.MS_manualCheck()}>Check</button>
                </div>
                <div id="manualCheckStatus" className="hint"></div>
              </div>
            </div>
          </section>

          {/* MODIFICATION SECTION */}
          <section id="modification" style={{ display: 'none' }}>
            <h2>Account Modification</h2>
            <p>Add, update, or delete student/admin accounts (grouped by school/campus).</p>
            <div className="modification-dropdowns">
              <input
                type="text"
                id="modificationSearchInput"
                className="modification-search-bar"
                placeholder="Search accounts..."
                onKeyUp={()=>window.filterModificationAccounts && window.filterModificationAccounts()}
              />
              <div className="school-group">
                <button className="school-dropdown-btn" onClick={()=>window.toggleDropdown && window.toggleDropdown('schoolA')}>
                  School A (school_id: 101)
                </button>
                <div className="school-dropdown-content" id="schoolA">
                  <div className="account-card">
                    <span>Name: John Doe</span>
                    <span>Role: Student</span>
                    <span>School: School A (school_id: 101)</span>
                    <span>Level: College</span>
                    <button className="update-btn" onClick={()=>window.openUpdateModal && window.openUpdateModal('John Doe','Student','john@example.com','Level 1','passwordA','101')}>Update</button>
                    <button className="delete-btn" onClick={()=>alert('Delete placeholder')}>Delete</button>
                  </div>
                  <div className="account-card">
                    <span>Name: Mike Cruz</span>
                    <span>Role: Student</span>
                    <span>School: School A (school_id: 101)</span>
                    <span>Level: College</span>
                    <button className="update-btn" onClick={()=>window.openUpdateModal && window.openUpdateModal('Mike Cruz','Student','mike@example.com','Level 2','passwordB','101')}>Update</button>
                    <button className="delete-btn" onClick={()=>alert('Delete placeholder')}>Delete</button>
                  </div>
                </div>
              </div>
              <div className="school-group">
                <button className="school-dropdown-btn" onClick={()=>window.toggleDropdown && window.toggleDropdown('schoolB')}>
                  School B (school_id: 102)
                </button>
                <div className="school-dropdown-content" id="schoolB">
                  <div className="account-card">
                    <span>Name: Jane Smith</span>
                    <span>Role: Admin</span>
                    <span>School: School B (school_id: 102)</span>
                    <span>Level: High School</span>
                    <button className="update-btn" onClick={()=>window.openUpdateModal && window.openUpdateModal('Jane Smith','Admin','jane@example.com','Level 3','passwordC','102')}>Update</button>
                    <button className="delete-btn" onClick={()=>alert('Delete placeholder')}>Delete</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Modal */}
            <div id="updateModal" className="modal" aria-hidden="true">
              <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="updateAccountTitle">
                <button className="close" id="closeUpdateModalBtn" aria-label="Close" type="button">&times;</button>
                <h2 id="updateAccountTitle">Update Account</h2>
                <div className="ms-modal-grid">
                  <form id="updateAccountForm" autoComplete="off">
                    <div className="ms-field"><label htmlFor="updateName">Name:</label><input className="ms-input" type="text" id="updateName" required /></div>
                    <div className="ms-field"><label htmlFor="updateRole">Role:</label><input className="ms-input" type="text" id="updateRole" required /></div>
                    <div className="ms-field"><label htmlFor="updateEmail">Email:</label><input className="ms-input" type="email" id="updateEmail" required /></div>
                    <input type="hidden" id="updateLevel" />

                    {/* Level Selection */}
                    <div className="ms-field">
                      <label style={{ display:'block', marginBottom:'4px' }}>Level:</label>
                      <div className="ms-radio-group" style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                        <label><input type="radio" name="updateLevelMain" id="radioGradeSchool" value="Grade School" /> Grade School</label>
                        <label><input type="radio" name="updateLevelMain" id="radioHighSchool" value="High School" /> High School</label>
                        <label><input type="radio" name="updateLevelMain" id="radioCollege" value="College" /> College</label>
                      </div>

                      <div id="panelGradeSchool" style={{ display:'none', marginTop:'8px' }}>
                        <label htmlFor="updateGradeSchoolLevel" style={{ fontSize:'.85em' }}>Select Grade (1-6)</label>
                        <select className="ms-input" id="updateGradeSchoolLevel">
                          <option value="">-- Select Grade --</option>
                          <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option>
                          <option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                        </select>
                      </div>

                      <div id="panelHighSchool" style={{ display:'none', marginTop:'8px' }}>
                        <label htmlFor="updateHighSchoolLevel" style={{ fontSize:'.85em' }}>Select Grade (7-12)</label>
                        <select className="ms-input" id="updateHighSchoolLevel">
                          <option value="">-- Select Grade --</option>
                          <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option>
                          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                        </select>
                      </div>

                      <div id="panelCollege" style={{ display:'none', marginTop:'8px' }}>
                        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ flex:1, minWidth:'160px' }}>
                            <label htmlFor="updateCollegeYear" style={{ fontSize:'.75em', display:'block', marginBottom:'2px' }}>Year Level</label>
                            <select className="ms-input" id="updateCollegeYear">
                              <option value="">-- Year Level --</option>
                              <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                            </select>
                          </div>
                          <div style={{ flex:1, minWidth:'160px' }}>
                            <label htmlFor="updateCollegeMajor" style={{ fontSize:'.75em', display:'block', marginBottom:'2px' }}>Major</label>
                            <select className="ms-input" id="updateCollegeMajor">
                              <option value="">-- Major --</option>
                              <option>BSCS</option><option>BSPSYCH</option><option>BSEDUC</option>
                              <option>BSTM</option><option>BSHM</option><option>BSBA</option><option>BSMM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ms-field"><label htmlFor="updatePassword">Password:</label><input className="ms-input" type="password" id="updatePassword" /></div>
                    <div className="ms-field"><label htmlFor="updateSchoolID">School ID:</label><input className="ms-input" type="text" id="updateSchoolID" /></div>

                    <div className="ms-field">
                      <label htmlFor="updateQrCode">QR Code:</label>
                      <input className="ms-input" type="text" id="updateQrCode" placeholder="e.g. KN3L20DF" maxLength={64} onKeyUp={uppercaseKeyUp} />
                    </div>

                    <div className="ms-field">
                      <label htmlFor="updateQrFile">Upload the QR Code:</label>
                      <input className="ms-input" type="file" id="updateQrFile" accept="image/*" />
                      <small className="ms-help">Upload an image of the QR code (PNG/JPG)</small>
                    </div>

                    <div className="ms-actions justify-end">
                      <button type="submit" className="ms-btn primary">Save Changes</button>
                      <button type="button" className="ms-btn neutral" onClick={()=>document.getElementById('updateModal').style.display='none'}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

          </section>

          {/* RETRIEVAL SECTION */}
          <section id="retrieval" style={{ display: 'none' }}>
            <h2>Account Retrieval</h2>
            <p>Retrieve or manually add admin/school accounts to a registered school (developer only).</p>
            <div className="retrieval-controls">
              <input
                type="text"
                id="retrievalSearch"
                className="retrieval-search"
                placeholder="Search admin accounts..."
                onKeyUp={()=>window.filterRetrievalTable && window.filterRetrievalTable()}
              />
              <button className="retrieval-btn" onClick={()=>window.showAddAccountModal && window.showAddAccountModal()}>Add Account</button>
            </div>
            <div className="retrieval-tables">
              <div className="retrieval-table-group">
                <button className="retrieval-table-dropdown-btn" onClick={()=>window.toggleRetrievalTable && window.toggleRetrievalTable('tableA')}>School A (school_id: 101)</button>
                <div className="retrieval-table-dropdown-content" id="tableA">
                  <table className="retrieval-table">
                    <thead>
                      <tr><th>Name</th><th>Profession</th><th>Email</th><th>Level</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      <tr
                        onClick={(e)=>window.showRetrieveAccountModal && window.showRetrieveAccountModal(e.currentTarget)}
                        data-school="School A"
                        data-schoolid="101"
                      >
                        <td>John Doe</td><td>Professor</td><td>john.doe@schoola.com</td><td>College</td><td>Online</td>
                      </tr>
                      <tr
                        onClick={(e)=>window.showRetrieveAccountModal && window.showRetrieveAccountModal(e.currentTarget)}
                        data-school="School A"
                        data-schoolid="101"
                      >
                        <td>Mike Cruz</td><td>Professor</td><td>mike.cruz@schoola.com</td><td>College</td><td>Offline</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="retrieval-table-group">
                <button className="retrieval-table-dropdown-btn" onClick={()=>window.toggleRetrievalTable && window.toggleRetrievalTable('tableB')}>School B (school_id: 102)</button>
                <div className="retrieval-table-dropdown-content" id="tableB">
                  <table className="retrieval-table">
                    <thead>
                      <tr><th>Name</th><th>Profession</th><th>Email</th><th>Level</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      <tr
                        onClick={(e)=>window.showRetrieveAccountModal && window.showRetrieveAccountModal(e.currentTarget)}
                        data-school="School B"
                        data-schoolid="102"
                      >
                        <td>Jane Smith</td><td>Teacher</td><td>jane.smith@schoolb.com</td><td>High School</td><td>Online</td>
                      </tr>
                      <tr
                        onClick={(e)=>window.showRetrieveAccountModal && window.showRetrieveAccountModal(e.currentTarget)}
                        data-school="School B"
                        data-schoolid="102"
                      >
                        <td>Albert Lee</td><td>Teacher</td><td>albert.lee@schoolb.com</td><td>High School</td><td>Offline</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Account Modal */}
            <div id="addAccountModal" className="modal" aria-hidden="true">
              <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="addAccountTitle">
                <button className="close" onClick={()=>window.closeAddAccountModal && window.closeAddAccountModal()} aria-label="Close" type="button">&times;</button>
                <h3 id="addAccountTitle">Add Account</h3>
                <div className="ms-modal-grid">
                  <form id="addAccountForm" autoComplete="off">
                    <div className="ms-field"><label htmlFor="addName">Name:</label><input className="ms-input" type="text" id="addName" required /></div>
                    <div className="ms-field"><label htmlFor="addProfession">Profession:</label><input className="ms-input" type="text" id="addProfession" required /></div>
                    <div className="ms-field"><label htmlFor="addEmail">Email:</label><input className="ms-input" type="email" id="addEmail" required /></div>
                    <div className="ms-field"><label htmlFor="addPassword">New Password:</label><input className="ms-input" type="password" id="addPassword" required /></div>
                    <div className="ms-field"><label htmlFor="addLevel">Levels:</label><input className="ms-input" type="text" id="addLevel" required /></div>
                    <div className="ms-field"><label htmlFor="addSchoolName">School Name:</label><input className="ms-input" type="text" id="addSchoolName" required /></div>
                    <div className="ms-field"><label htmlFor="addSchoolID">School_ID:</label><input className="ms-input" type="text" id="addSchoolID" required /></div>
                    <div className="ms-actions justify-end">
                      <button type="submit" className="ms-btn primary">Add Account</button>
                      <button type="button" className="ms-btn neutral" onClick={()=>window.closeAddAccountModal && window.closeAddAccountModal()}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Retrieve Account Modal */}
            <div id="retrieveAccountModal" className="modal" aria-hidden="true">
              <div className="modal-content ms-modal-skin" role="dialog" aria-modal="true" aria-labelledby="retrieveAccountTitle">
                <button className="close" onClick={()=>window.closeRetrieveAccountModal && window.closeRetrieveAccountModal()} aria-label="Close" type="button">&times;</button>
                <h3 id="retrieveAccountTitle">Retrieve Account</h3>
                <div className="ms-modal-grid">
                  <form id="retrieveAccountForm" autoComplete="off">
                    <div className="ms-field"><label htmlFor="retrieveName">Name:</label><input className="ms-input" type="text" id="retrieveName" required /></div>
                    <div className="ms-field"><label htmlFor="retrieveProfession">Profession:</label><input className="ms-input" type="text" id="retrieveProfession" required /></div>
                    <div className="ms-field"><label htmlFor="retrieveEmail">Email:</label><input className="ms-input" type="email" id="retrieveEmail" required /></div>
                    <input type="hidden" id="retrieveLevel" />

                    <div className="ms-field">
                      <label style={{ display:'block', marginBottom:'4px' }}>Level:</label>
                      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }} className="ms-radio-group">
                        <label><input type="radio" name="retrieveLevelMain" id="retrieveRadioGradeSchool" value="Grade School" /> Grade School</label>
                        <label><input type="radio" name="retrieveLevelMain" id="retrieveRadioHighSchool" value="High School" /> High School</label>
                        <label><input type="radio" name="retrieveLevelMain" id="retrieveRadioCollege" value="College" /> College</label>
                      </div>

                      <div id="retrievePanelGradeSchool" style={{ display:'none', marginTop:'8px' }}>
                        <label htmlFor="retrieveGradeSchoolLevel" style={{ fontSize:'.85em' }}>Select Grade (1-6)</label>
                        <select className="ms-input" id="retrieveGradeSchoolLevel">
                          <option value="">-- Select Grade --</option>
                          <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option>
                          <option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                        </select>
                      </div>

                      <div id="retrievePanelHighSchool" style={{ display:'none', marginTop:'8px' }}>
                        <label htmlFor="retrieveHighSchoolLevel" style={{ fontSize:'.85em' }}>Select Grade (7-12)</label>
                        <select className="ms-input" id="retrieveHighSchoolLevel">
                          <option value="">-- Select Grade --</option>
                          <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option>
                          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                        </select>
                      </div>

                      <div id="retrievePanelCollege" style={{ display:'none', marginTop:'8px' }}>
                        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                          <div style={{ flex:1, minWidth:'160px' }}>
                            <label htmlFor="retrieveCollegeYear" style={{ fontSize:'.75em', display:'block', marginBottom:'2px' }}>Year Level</label>
                            <select className="ms-input" id="retrieveCollegeYear">
                              <option value="">-- Year Level --</option>
                              <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                            </select>
                          </div>
                          <div style={{ flex:1, minWidth:'160px' }}>
                            <label htmlFor="retrieveCollegeMajor" style={{ fontSize:'.75em', display:'block', marginBottom:'2px' }}>Major</label>
                            <select className="ms-input" id="retrieveCollegeMajor">
                              <option value="">-- Major --</option>
                              <option>BSCS</option><option>BSPSYCH</option><option>BSEDUC</option>
                              <option>BSTM</option><option>BSHM</option><option>BSBA</option><option>BSMM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ms-field"><label htmlFor="retrievePassword">New Password:</label><input className="ms-input" type="password" id="retrievePassword" required /></div>
                    <div className="ms-field"><label htmlFor="retrieveSchoolName">School Name:</label><input className="ms-input" type="text" id="retrieveSchoolName" required /></div>
                    <div className="ms-field"><label htmlFor="retrieveSchoolID">School_ID:</label><input className="ms-input" type="text" id="retrieveSchoolID" required /></div>
                    <div className="ms-actions justify-end">
                      <button type="submit" className="ms-btn primary">Retrieve Account</button>
                      <button type="button" className="ms-btn neutral" onClick={()=>window.closeRetrieveAccountModal && window.closeRetrieveAccountModal()}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>

            </section>

          {/* ACCOUNT SETTINGS SECTION */}
          <section id="account" style={{ display: 'none' }}>
            <h2>Account Settings</h2>
            <div className="account-settings-list ms-accounts">
              <div className="account-settings-item" onClick={()=>window.showAccountOption && window.showAccountOption('changePassword')}>
                <span className="ms-acc-title">Change Password</span>
                <span className="ms-acc-caret"></span>
              </div>
              <div id="changePasswordOption" className="account-option-modal ms-panel-skin">
                <form id="changePasswordForm" className="ms-inline-fields ms-gap-sm">
                  <label className="ms-field">
                    <span className="ms-label">Old Password</span>
                    <input type="password" id="oldPassword" className="ms-input" required />
                  </label>
                  <label className="ms-field">
                    <span className="ms-label">New Password</span>
                    <input type="password" id="newPassword" className="ms-input" required />
                  </label>
                  <br />
                  <div className="ms-actions ms-actions">
                    <button type="submit" className="ms-btn primary">Change Password</button>
                    <button type="button" className="ms-btn neutral" onClick={()=>window.closeAccountOption && window.closeAccountOption('changePassword')}>Cancel</button>
                  </div>
                </form>
              </div>

              <div className="account-settings-item" onClick={()=>window.showAccountOption && window.showAccountOption('renameAccount')}>
                <span className="ms-acc-title">Rename Account Name</span>
                <span className="ms-acc-caret"></span>
              </div>
              <div id="renameAccountOption" className="account-option-modal ms-panel-skin">
                <form id="renameAccountForm" className="ms-inline-fields ms-gap-sm">
                  <label className="ms-field">
                    <span className="ms-label">New Account Name</span>
                    <input type="text" id="newAccountName" className="ms-input" required />
                  </label>
                  <div className="ms-actions ms-actions-inline">
                    <button type="submit" className="ms-btn primary">Rename</button>
                    <button type="button" className="ms-btn neutral" onClick={()=>window.closeAccountOption && window.closeAccountOption('renameAccount')}>Cancel</button>
                  </div>
                </form>
              </div>

              <div className="account-settings-item" onClick={()=>window.showAccountOption && window.showAccountOption('backupDatabase')}>
                <span className="ms-acc-title">Backup Database</span>
                <span className="ms-acc-caret"></span>
              </div>
              <div id="backupDatabaseOption" className="account-option-modal ms-panel-skin">
                <p className="ms-note">Download your database backup as:</p>
                <div className="ms-actions">
                  <button type="button" className="ms-btn secondary" onClick={()=>alert('.json download placeholder')}>.json file</button>
                  <button type="button" className="ms-btn secondary" onClick={()=>alert('.xlsx download placeholder')}>.xlsx file</button>
                  <button type="button" className="ms-btn neutral" onClick={()=>window.closeAccountOption && window.closeAccountOption('backupDatabase')}>Cancel</button>
                </div>
              </div>

              <div className="account-settings-item" onClick={()=>window.showAccountOption && window.showAccountOption('duplicateMaster')}>
                <span className="ms-acc-title">Duplicate Master Account</span>
                <span className="ms-acc-caret"></span>
              </div>
              <div id="duplicateMasterOption" className="account-option-modal ms-panel-skin">
                <p className="ms-warning-box">Are you sure you want to duplicate the Master Account?</p>
                <div className="ms-actions">
                  <button type="button" className="ms-btn danger" onClick={()=>alert('Master Account duplicated!')}>Yes, Duplicate</button>
                  <button type="button" className="ms-btn neutral" onClick={()=>window.closeAccountOption && window.closeAccountOption('duplicateMaster')}>Cancel</button>
                </div>
              </div>
            </div>
          </section>

          {/* LOGS SECTION */}
          <section id="logs" style={{ display: 'none' }}>
            <h2>Logs</h2>
            <p>Logs of registered schools/campus by school_id</p>
            <div className="logs-dropdowns">
              <div className="school-logs-group">
                <button className="school-logs-dropdown-btn" onClick={()=>window.toggleLogsDropdown && window.toggleLogsDropdown('logsSchoolA')}>
                  School A (school_id: 101)
                </button>
                <div className="school-logs-dropdown-content" id="logsSchoolA">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Student/Admin Name</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Date</th><th>Activity</th><th>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>John Doe</td><td>08:00</td><td></td><td>Present</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>John Doe</td><td>08:00</td><td></td><td>Present</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>John Doe</td><td>08:00</td><td></td><td>Present</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>John Doe</td><td>08:00</td><td></td><td>Present</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>Mike Cruz</td><td>08:10</td><td></td><td>Late</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>Jane Doe</td><td>08:25</td><td></td><td>Absent</td><td>08/03/2025</td><td>Logged In</td><td>Online</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="school-logs-group">
                <button className="school-logs-dropdown-btn" onClick={()=>window.toggleLogsDropdown && window.toggleLogsDropdown('logsSchoolB')}>
                  School B (school_id: 102)
                </button>
                <div className="school-logs-dropdown-content" id="logsSchoolB">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Student/Admin Name</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Date</th><th>Activity</th><th>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Teacher</td><td>08:10</td><td></td><td>null</td><td>08/03/2025</td><td>Logged In: Admin Account Updated</td><td>Online</td></tr>
                      <tr><td>Albert Lee</td><td>08:17</td><td></td><td>Late</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                      <tr><td>Sam Cruz</td><td>08:30</td><td></td><td>Present</td><td>08/03/2025</td><td>QR Attendance</td><td>Offline</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}