import React, { useEffect, useRef, useState } from 'react'
import './styles.css'

export default function Portal() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const bcRef = useRef(null)
  const onlineIntervalRef = useRef(null)

  const [cameraSupported, setCameraSupported] = useState(true)
  const [permissionMsg, setPermissionMsg] = useState('Requesting camera access for QR code scanning...')
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false)
        setPermissionMsg('Camera API not supported in this browser.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setShowCamera(true)
        setPermissionMsg('')
      } catch (err) {
        setShowCamera(false)
        setPermissionMsg('Camera access denied. Please allow permission to scan QR code.')
      }
    }
    startCamera()

    return () => {

      try {
        streamRef.current?.getTracks()?.forEach((t) => t.stop())
      } catch {}
    }
  }, [])

  useEffect(() => {
    try {
      const bc = new BroadcastChannel('portalStatusChannel')
      bcRef.current = bc

      function broadcastOnline() {
        try {
          bc.postMessage('portal-online')
        } catch {}
      }

 
      broadcastOnline()

      onlineIntervalRef.current = setInterval(broadcastOnline, 2000)


      bc.onmessage = (e) => {
        if (e.data === 'status-request') {
          broadcastOnline()
        }
      }


      const onBeforeUnload = () => {
        try {
          bc.postMessage('portal-offline')
        } catch {}
        if (onlineIntervalRef.current) clearInterval(onlineIntervalRef.current)
      }
      window.addEventListener('beforeunload', onBeforeUnload)

      return () => {
        onBeforeUnload()
        try {
          bc.close()
        } catch {}
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
    } catch {
      return
    }
  }, [])

  return (
    <>
      <header className="topbar">
        <div className="container"></div>
      </header>

      <main>
        <section className="hero hero-compact" style={{ textAlign: 'center' }}>
          <div className="hero-text">
            <h1 className="hero-title">Scan Your QR Code</h1>
            <p className="hero-subtitle">Sign in to manage attendance and merits.</p>
          </div>
        </section>

        <section className="container auth-wrap">
          <div className="card form-card">
            <div id="cameraArea">
              {!showCamera && (
                <div className="camera-permission" id="cameraMessage">
                  {permissionMsg}
                </div>
              )}
              <div className="camera-container" id="cameraContainer" style={{ display: showCamera ? 'block' : 'none' }}>
                <video id="qrVideo" ref={videoRef} autoPlay playsInline />
                <div className="qr-guide"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© 2023 Merit Scan. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}