import React, { useEffect, useRef } from 'react';
import './styles.css'; // core admin styles (portal specific CSS injected below)

/*
  Portal React Port
  - Converted from portal.html + portal.css
  - Keeps all original IDs / classes for styling parity.
  - Dynamically loads html5-qrcode & jsQR (if not already present) then runs original logic.
  - Fallback (jsQR + getUserMedia) preserved.
  - BroadcastChannel signalling (portalStatusChannel) preserved.
  - If you prefer a separate portal.css file, move the <style> block content there and import it.
*/

export default function Portal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const libUrls = [
      { src: 'https://unpkg.com/html5-qrcode', defer: true },
      { src: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js', defer: true },
    ];

    function loadScript({ src, defer }) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        if (defer) s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    Promise.all(libUrls.map(loadScript))
      .catch(err => console.warn('Portal libs load issue:', err))
      .finally(() => initPortal());

    function initPortal() {
      /* =========================
         Configuration & State
         ========================= */
      const TARGET_CODE = '8JKH3B4O';
      const studentMap = { '8JKH3B4O': 'John Doe' };

      const sanitize = r => (r || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 64);

      const statusBadge = document.getElementById('portalStatusBadge');
      const cameraMessage = document.getElementById('cameraMessage');
      const lastScanRaw = document.getElementById('lastScanRaw');
      const restartBtn = document.getElementById('restartBtn');
      const switchCamBtn = document.getElementById('switchCamBtn');
      const banner = document.getElementById('scanStatusBanner');

      const fbVideo = document.getElementById('fbVideo');
      const fbCanvas = document.getElementById('fbCanvas');
      const fbCtx = fbCanvas.getContext('2d');

      let h5Instance = null;
      let mode = 'h5';
      let currentCameraId = null;
      let cameraIds = [];
      let starting = false;
      let acceptScans = true;
      let camerasEnumerated = false;
      let fallbackStream = null;
      let fallbackRAF = null;

      const LS_KEY = 'ms-portal-camera-id';
      const H5_FAIL_TIMEOUT_MS = 5500;

      /* =========================
         UI Helpers
         ========================= */
      function setStatus(text, state) {
        statusBadge.textContent = text;
        statusBadge.className = 'status-badge status-' + state + (mode === 'fallback' ? ' status-fallback' : '');
      }
      function showBanner(html) {
        banner.hidden = false;
        banner.innerHTML = html;
      }
      function hideBanner() {
        banner.hidden = true;
        banner.innerHTML = '';
      }
      function updateBanner(secs, name) {
        const timeText = secs > 0 ? `Refreshing in ${secs}…` : 'Resetting…';
        showBanner(
          `<strong>Welcome ${name}! <br> Please Come In!</strong><br>
           <span class="refresh-timer">${timeText}</span>`
        );
      }

      /* =========================
         Success & Reset
         ========================= */
      function handleSuccess(code) {
        if (!acceptScans) return;
        acceptScans = false;
        setStatus('Accepted', 'success');
        const name = studentMap[code] || 'Student';
        let secs = 5;
        updateBanner(secs, name);
        const timer = setInterval(() => {
          secs--;
            updateBanner(secs, name);
          if (secs <= 0) {
            clearInterval(timer);
            softReset();
          }
        }, 1000);
      }

      function softReset() {
        hideBanner();
        lastScanRaw.textContent = '(Awaiting next scan)';
        setStatus('Scanning', 'on');
        acceptScans = true;
      }

      /* =========================
         Shared scan handlers
         ========================= */
      function onScanDecoded(raw) {
        if (!acceptScans) return;
        const clean = sanitize(raw);
        lastScanRaw.textContent = 'Scan: ' + clean;
        if (clean === TARGET_CODE) handleSuccess(clean);
      }

      /* =========================
         Primary: html5-qrcode
         ========================= */
      function startH5(cameraId) {
        if (starting) return;
        mode = 'h5';
        starting = true;
        restartBtn.disabled = true;
        switchCamBtn.disabled = true;
        hideBanner();
        cameraMessage.textContent = 'Starting camera…';
        setStatus('Starting', 'starting');

        if (!h5Instance) {
          if (!window.Html5Qrcode) {
            console.warn('html5-qrcode library missing, using fallback.');
            return startFallback(cameraId);
          }
          h5Instance = new window.Html5Qrcode('qrReader', { verbose: false });
        }

        fbVideo.style.display = 'none';

        const constraints = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };
        const config = {
          fps: 12,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          rememberLastUsedCamera: true,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        let started = false;
        const failTimer = setTimeout(() => {
          if (!started) {
            console.warn('html5-qrcode start timeout; switching fallback.');
            safeStopH5(true);
            startFallback(cameraId);
          }
        }, H5_FAIL_TIMEOUT_MS);

        h5Instance
          .start(
            constraints,
            config,
            decoded => onScanDecoded(decoded),
            () => {}
          )
          .then(() => {
            clearTimeout(failTimer);
            started = true;
            starting = false;
            const state = h5Instance.getState();
            currentCameraId = state.cameraId || cameraId;
            if (currentCameraId) {
              try {
                localStorage.setItem(LS_KEY, currentCameraId);
              } catch (_) {}
            }
            cameraMessage.textContent = '';
            setStatus('Scanning', 'on');
            restartBtn.disabled = false;
            enumerateCamerasOnce();
          })
          .catch(err => {
            clearTimeout(failTimer);
            starting = false;
            console.warn('html5-qrcode failed, fallback.', err);
            cameraMessage.textContent = 'Switching to fallback…';
            safeStopH5(true);
            startFallback(cameraId);
          });
      }

      function safeStopH5(silent) {
        if (h5Instance) {
          try {
            h5Instance.stop().catch(() => {});
          } catch (e) {}
        }
        if (!silent) setStatus('Stopped', 'off');
      }

      /* =========================
         Fallback: jsQR + getUserMedia
         ========================= */
      function startFallback(cameraId) {
        if (starting) return;
        mode = 'fallback';
        starting = true;
        restartBtn.disabled = true;
        switchCamBtn.disabled = true;
        hideBanner();
        setStatus('Starting (fallback)', 'starting');
        cameraMessage.textContent = 'Starting fallback scanner…';

        fbVideo.style.display = 'block';
        const h5Region = document.querySelector('#qrReader__scan_region');
        if (h5Region) h5Region.style.display = 'none';

        const constraints = cameraId
          ? { video: { deviceId: { exact: cameraId } } }
          : { video: { facingMode: 'environment' } };

        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => {
            fallbackStream = stream;
            fbVideo.srcObject = stream;
            fbVideo.onloadedmetadata = () => {
              fbVideo.play().then(() => {
                starting = false;
                currentCameraId = getStreamDeviceId(stream) || cameraId;
                if (currentCameraId) {
                  try {
                    localStorage.setItem(LS_KEY, currentCameraId);
                  } catch (_) {}
                }
                cameraMessage.textContent = '';
                setStatus('Scanning (fallback)', 'on');
                restartBtn.disabled = false;
                enumerateCamerasOnceFallback(stream).then(() => {
                  switchCamBtn.disabled = cameraIds.length < 2;
                });
                acceptScans = true;
                fallbackLoop();
              });
            };
          })
          .catch(err => {
            starting = false;
            cameraMessage.textContent = 'Fallback failed: ' + (err?.message || err);
            setStatus('Denied', 'error');
            restartBtn.disabled = false;
          });
      }

      function fallbackLoop() {
        if (!fallbackStream) {
          fallbackRAF = requestAnimationFrame(fallbackLoop);
          return;
        }
        if (fbVideo.readyState === fbVideo.HAVE_ENOUGH_DATA) {
          fbCanvas.width = fbVideo.videoWidth;
          fbCanvas.height = fbVideo.videoHeight;
          fbCtx.drawImage(fbVideo, 0, 0, fbCanvas.width, fbCanvas.height);
          if (window.jsQR) {
            const imgData = fbCtx.getImageData(0, 0, fbCanvas.width, fbCanvas.height);
            const code = window.jsQR(imgData.data, fbCanvas.width, fbCanvas.height, { inversionAttempts: 'attemptBoth' });
            if (code && code.data) onScanDecoded(code.data);
          }
        }
        fallbackRAF = requestAnimationFrame(fallbackLoop);
      }

      function stopFallback() {
        if (fallbackRAF) cancelAnimationFrame(fallbackRAF);
        fallbackRAF = null;
        if (fallbackStream) {
          fallbackStream.getTracks().forEach(t => t.stop());
          fallbackStream = null;
        }
        fbVideo.srcObject = null;
        fbVideo.style.display = 'none';
      }

      function getStreamDeviceId(stream) {
        const track = stream.getVideoTracks()[0];
        return track && track.getSettings && track.getSettings().deviceId;
      }

      /* =========================
         Camera Enumeration
         ========================= */
      async function enumerateCamerasOnce() {
        if (camerasEnumerated || !window.Html5Qrcode) return;
        try {
          const devices = await window.Html5Qrcode.getCameras();
          cameraIds = devices.map(d => d.id);
          camerasEnumerated = true;
          switchCamBtn.disabled = cameraIds.length < 2;
        } catch (e) {
          console.warn('Enumeration (h5) failed', e);
        }
      }

      async function enumerateCamerasOnceFallback() {
        if (camerasEnumerated) return;
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          cameraIds = devices.filter(d => d.kind === 'videoinput').map(d => d.deviceId);
          camerasEnumerated = true;
        } catch (e) {
          console.warn('Enumeration (fallback) failed', e);
        }
      }

      /* =========================
         Controls
         ========================= */
      restartBtn.addEventListener('click', () => {
        hideBanner();
        lastScanRaw.textContent = '(Restarting…)';
        acceptScans = true;
        if (mode === 'h5') {
          safeStopH5(true);
          setTimeout(() => startH5(currentCameraId), 120);
        } else {
          stopFallback();
          setTimeout(() => startFallback(currentCameraId), 120);
        }
      });

      switchCamBtn.addEventListener('click', () => {
        if (cameraIds.length < 2 || starting) return;
        const idx = cameraIds.indexOf(currentCameraId);
        const next = cameraIds[(idx + 1) % cameraIds.length];
        hideBanner();
        acceptScans = true;
        if (mode === 'h5') {
          safeStopH5(true);
          setTimeout(() => startH5(next), 140);
        } else {
          stopFallback();
          setTimeout(() => startFallback(next), 140);
        }
      });

      /* =========================
         Initialization
         ========================= */
      function init() {
        let saved;
        try {
          saved = localStorage.getItem(LS_KEY);
        } catch (_) {}
        if (window.Html5Qrcode) startH5(saved || null);
        else startFallback(saved || null);
      }

      window.addEventListener('beforeunload', () => {
        try { safeStopH5(true); } catch (_) {}
        try { stopFallback(); } catch (_) {}
      });

      // Slight delay to allow scripts to finish
      setTimeout(init, 50);

      /* =========================
         BroadcastChannel Integration
         ========================= */
      let bc;
      try { bc = new BroadcastChannel('portalStatusChannel'); } catch (_) {}
      function broadcastOnline() { bc && bc.postMessage('portal-online'); }
      broadcastOnline();
      const onlineInterval = setInterval(broadcastOnline, 2000);
      bc && (bc.onmessage = e => { if (e.data === 'status-request') broadcastOnline(); });
      window.addEventListener('beforeunload', () => {
        bc && bc.postMessage('portal-offline');
        clearInterval(onlineInterval);
      });
    }
  }, []);

  // Portal-specific CSS injected (to keep target structure without separate portal.css file)
  const portalCss = `
${`/* BEGIN portal.css (injected) */`}
:root{
  --bg:#222d32;
  --bg-soft:#1a2226;
  --surface:#ffffff;
  --surface-alt:#f4f7fa;
  --surface-inset:#0f171b;
  --accent:#1abc9c;
  --accent-hover:#159a80;
  --danger:#e74c3c;
  --warning:#f39c12;
  --text:#ffffff;
  --text-soft:#b8c7ce;
  --radius:18px;
  --focus:0 0 0 3px rgba(26,188,156,.55);
  --shadow-1:0 4px 18px rgba(0,0,0,.25),0 2px 6px rgba(0,0,0,.18);
  font-family:'Lucida Sans','Lucida Grande','Lucida Sans Unicode',Verdana,sans-serif;
}
html,body{
  margin:0;
  background:
    radial-gradient(circle at 20% 20%, rgba(26,188,156,.20), transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(52,152,219,.18), transparent 60%),
    var(--bg);
  min-height:100vh;
  color:var(--text);
  -webkit-font-smoothing:antialiased;
  line-height:1.42;
}
*{box-sizing:border-box;}
.topbar{
  background:var(--bg-soft);
  border-bottom:1px solid rgba(255,255,255,.08);
  padding:10px 16px;
  position:sticky; top:0; z-index:50;
  box-shadow:0 2px 6px rgba(0,0,0,.22);
}
.topbar-inner{display:flex;align-items:center;justify-content:space-between;max-width:1180px;margin:0 auto;}
.portal-brand{font-size:1.15rem;margin:0;letter-spacing:.8px;font-weight:700;color:#fff;}
.status-badge{
  background:var(--surface-inset);
  padding:6px 14px 7px;
  border-radius:999px;
  font-size:.62rem;
  letter-spacing:1.3px;
  text-transform:uppercase;
  font-weight:700;
  border:1px solid rgba(255,255,255,.15);
  display:inline-block;
}
.status-on{ background:linear-gradient(120deg,var(--accent),var(--accent-hover)); border:none; }
.status-success{ background:linear-gradient(120deg,#27ae60,#16904a); }
.status-error{ background:var(--danger); }
.status-off{ background:#666; }
.status-starting{ background:#3498db; }

.main-stage{max-width:1180px;margin:34px auto 60px;padding:0 20px;display:flex;justify-content:center;}
.scan-card{
  background:rgba(255,255,255,.06);
  backdrop-filter:blur(6px);
  border:1px solid rgba(255,255,255,.12);
  padding:34px 34px 40px;
  border-radius:28px;
  width:100%;max-width:540px;
  box-shadow:var(--shadow-1);
  position:relative;
}
.scan-title{margin:0 0 8px;font-size:1.9rem;letter-spacing:.6px;}
.scan-sub{margin:0 0 26px;color:var(--text-soft);font-size:.9rem;letter-spacing:.4px;}

.camera-shell{display:flex;flex-direction:column;align-items:center;gap:12px;}
.camera-container{
  position:relative;width:320px;height:320px;max-width:100%;
  background:#000;border-radius:32px;overflow:hidden;
  box-shadow:0 8px 28px -6px rgba(0,0,0,.55),0 3px 12px rgba(0,0,0,.35);
  border:2px solid rgba(255,255,255,.08);
}
#qrReader{width:100%;height:100%;}
#qrReader video{
  object-fit:cover;width:100%!important;height:100%!important;
  border-radius:32px;filter:contrast(1.05) saturate(1.2);
}
#qrReader__dashboard{display:none;}

.qr-guide{
  position:absolute;top:50%;left:50%;width:70%;height:70%;
  transform:translate(-50%,-50%);
  border:4px solid var(--accent);border-radius:22px;
  box-shadow:0 0 0 1px rgba(0,0,0,.4),0 0 16px -2px rgba(26,188,156,.75) inset;
  overflow:hidden;pointer-events:none;
}
.scan-line{
  position:absolute;top:0;left:0;width:100%;height:100%;
  background:linear-gradient(to bottom, rgba(26,188,156,0) 0%, rgba(26,188,156,.55) 48%, rgba(26,188,156,0) 100%);
  animation:scanMove 2.4s linear infinite;mix-blend-mode:screen;opacity:.55;
}
@keyframes scanMove{0%{transform:translateY(-100%);}50%{transform:translateY(0);}100%{transform:translateY(100%);}}
.camera-message{color:#ffb347;font-size:.8rem;font-weight:600;text-align:center;}
.scan-info{margin-top:8px;text-align:center;min-height:24px;font-size:.75rem;letter-spacing:.4px;color:var(--text-soft);}
.last-scan{background:rgba(255,255,255,.08);padding:6px 10px;border-radius:10px;display:inline-block;}

.scan-status-banner{
  margin:14px auto 4px;
  background:linear-gradient(90deg,var(--accent),var(--accent-hover));
  padding:14px 18px 16px;
  border-radius:18px;
  width:100%;font-size:.85rem;font-weight:600;
  text-align:center;line-height:1.35;letter-spacing:.4px;
  box-shadow:0 6px 24px -8px rgba(0,0,0,.55),0 2px 10px rgba(0,0,0,.4);
  color:#fff;animation:bannerPop .45s cubic-bezier(.45,1.3,.55,1);
}
@keyframes bannerPop{0%{transform:translateY(18px) scale(.94);opacity:0;}100%{transform:translateY(0) scale(1);opacity:1;}}
.scan-status-banner .refresh-timer{
  display:block;font-size:.68rem;letter-spacing:.8px;margin-top:4px;opacity:.9;text-transform:uppercase;
}

.actions{display:flex;justify-content:center;margin-top:18px;gap:10px;}

.btn{
  --btn-bg:var(--accent);--btn-bg-hover:var(--accent-hover);
  background:var(--btn-bg);border:none;color:#fff;font-weight:600;
  font-size:.8rem;letter-spacing:.5px;padding:11px 20px 12px;
  border-radius:14px;cursor:pointer;display:inline-flex;align-items:center;
  gap:.45em;transition:background .18s, transform .12s, box-shadow .18s;
  box-shadow:0 3px 10px rgba(0,0,0,.25);
}
.btn:hover,.btn:focus-visible{background:var(--btn-bg-hover);}
.btn:active{transform:translateY(1px);}
.btn:disabled{opacity:.55;cursor:not-allowed;}
.btn-ghost{--btn-bg:rgba(255,255,255,.12);--btn-bg-hover:rgba(255,255,255,.22);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.2);}
.btn-ghost:focus-visible{box-shadow:0 0 0 3px rgba(26,188,156,.55);}
.small{font-size:.68rem;padding:9px 16px;}

.site-footer{padding:30px 16px 50px;text-align:center;color:var(--text-soft);font-size:.65rem;letter-spacing:.5px;}
.ft-text{margin:0;}
:focus-visible{outline:none;box-shadow:var(--focus);border-radius:10px;}

@media (max-width:600px){
  .scan-card{padding:30px 24px 42px;border-radius:24px;}
  .scan-title{font-size:1.65rem;}
  .camera-container{width:280px;height:280px;border-radius:28px;}
  #qrReader video{border-radius:28px;}
  .scan-status-banner{border-radius:16px;font-size:.8rem;}
}
@media (prefers-reduced-motion:reduce){
  *, .scan-line{animation:none!important;transition:none!important;}
}
${`/* END portal.css */`}
  `;

  return (
    <body>
      <style dangerouslySetInnerHTML={{ __html: portalCss }} />
      <header className="topbar" aria-label="Portal header">
        <div className="container topbar-inner">
          <h1 className="portal-brand" aria-label="Merit Scan Portal">Merit Scan Portal</h1>
          <div className="status-badge" id="portalStatusBadge" aria-live="polite">Initializing…</div>
        </div>
      </header>

      <main className="main-stage" id="mainStage" tabIndex={-1}>
        <section className="scan-card" aria-labelledby="scanTitle">
          <h2 id="scanTitle" className="scan-title">Scan Your QR Code</h2>
          <p className="scan-sub">Hold your code steady inside the green frame.</p>

          <div className="camera-shell" id="cameraShell" aria-live="polite">
            <div className="camera-container" id="cameraContainer" aria-label="Camera preview">
              <div id="qrReader" className="qr-reader"></div>
              <video
                id="fbVideo"
                playsInline
                autoPlay
                muted
                style={{ display: 'none', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }}
              ></video>
              <div className="qr-guide">
                <span className="scan-line"></span>
              </div>
            </div>
            <div id="cameraMessage" className="camera-message">Loading scanner…</div>
            <canvas id="fbCanvas" width="0" height="0" style={{ display: 'none' }}></canvas>
          </div>

          <div className="scan-info">
            <span id="lastScanRaw" className="last-scan">(No scan yet)</span>
          </div>

            <div id="scanStatusBanner" className="scan-status-banner" aria-live="assertive" hidden></div>

          <div className="actions">
            <button id="restartBtn" className="btn btn-ghost small" type="button" disabled>
              Restart Scanner
            </button>
            <button id="switchCamBtn" className="btn btn-ghost small" type="button" disabled>
              Switch Camera
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="ft-text">© 2025 Merit Scan. All rights reserved.</p>
        </div>
      </footer>
    </body>
  );
}