import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

function loadScriptOnce(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id)
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve()
      } else {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', (e) => reject(e))
      }
      return
    }
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.async = true
    s.onload = () => {
      s.setAttribute('data-loaded', 'true')
      resolve()
    }
    s.onerror = (e) => reject(e)
    document.head.appendChild(s)
  })
}
async function ensureChart() {
  if (window.Chart) return window.Chart
  const urls = [
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
    'https://unpkg.com/chart.js@4.4.4/dist/chart.umd.min.js',
  ]
  let lastErr
  for (let i = 0; i < urls.length; i++) {
    try {
      await loadScriptOnce('chartjs-umd', urls[i])
      if (window.Chart) return window.Chart
    } catch (e) { lastErr = e }
  }
  throw lastErr || new Error('Chart.js UMD could not be loaded')
}
async function ensureXLSX() {
  if (window.XLSX) return window.XLSX
  const urls = [
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js',
  ]
  let lastErr
  for (let i = 0; i < urls.length; i++) {
    try {
      await loadScriptOnce('xlsx-cdn', urls[i])
      if (window.XLSX) return window.XLSX
    } catch (e) { lastErr = e }
  }
  throw lastErr || new Error('XLSX could not be loaded')
}

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  students: 'Students',
  logs: 'Daily Logs',
  awards: 'Awards',
  account: 'Account',
  school: 'School',
}

const MAJORS = ['BSCS', 'BSPSYCH', 'BSEDUC', 'BSTM', 'BSHM', 'BSBA', 'BSMM']

export default function Admin() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('dashboard')
  const breadcrumb = SECTION_TITLES[active] || 'Dashboard'

  const [profileName, setProfileName] = useState('Admin Account')
  const [profilePic, setProfilePic] = useState('https://i.imgur.com/4Z5b1aH.png')
  const [showEditProfile, setShowEditProfile] = useState(false)

  const [students, setStudents] = useState(() => {
    const arr = []
    for (let i = 0; i < 55; i++) {
      arr.push({
        name: `Student ${i + 1}`,
        year: String((i % 4) + 1),
        email: `student${i + 1}@school.edu`,
        password: '********',
        qr: `QR${100 + i}`,
        merit: Math.floor(Math.random() * 100),
        major: MAJORS[i % MAJORS.length],
        present: Math.random() > 0.2,
      })
    }
    return arr
  })

  const [logs] = useState([
    { name: 'Student 1', qr: 'QR100', login: '08:10', logout: '16:00', date: '2025-08-18' },
    { name: 'Student 2', qr: 'QR101', login: '08:15', logout: '16:15', date: '2025-08-18' },
  ])

  function toggleSidebar() {
    setCollapsed((c) => !c)
  }

  function onSaveProfile(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newName = (fd.get('editName') || '').toString()
    if (newName) setProfileName(newName)
    const file = fd.get('editProfilePic')
    if (file && file instanceof File && file.size > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') setProfilePic(ev.target.result)
      }
      reader.readAsDataURL(file)
    }
    setShowEditProfile(false)
  }

  function logout() {
    alert('Logged out!')
    navigate('/')
  }

  return (
    <div className="app-container">
      {/* sidebar */}
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Merit Scan</span>
          <button className="sidebar-toggle" id="sidebarToggle" aria-label="Toggle navigation" onClick={toggleSidebar}>
            &#9776;
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-img">
            <img id="profilePicSidebar" src={profilePic} alt="Admin Account" />
          </div>
          <div className="profile-details">
            <span className="profile-name" id="profileNameSidebar">{profileName}</span>
            <span className="profile-status online">Online</span>
          </div>
        </div>

        <ul className={`sidebar-menu ${collapsed ? 'hide-nav' : ''}`}>
          <li className="sidebar-section">REPORTS</li>
          <li>
            <a href="#" className={active === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('dashboard') }}>
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className={active === 'students' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('students') }}>
              Students
            </a>
          </li>
          <li className="menu-gap"></li>

          <li className="sidebar-section">MANAGE</li>
          <li>
            <a href="#" className={active === 'logs' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('logs') }}>
              Daily Logs
            </a>
          </li>
          <li>
            <a href="#" className={active === 'awards' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('awards') }}>
              Awards
            </a>
          </li>
          <li className="menu-gap"></li>

          <li className="sidebar-section">SETTINGS</li>
          <li>
            <a href="#" className={active === 'account' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('account') }}>
              Account
            </a>
          </li>
          <li>
            <a href="#" className={active === 'school' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive('school') }}>
              School
            </a>
          </li>
        </ul>
      </nav>

      {/* main content */}
      <main className="main-content" id="mainContent">
        <header className="main-header">
          <span className="main-project">Admin Account</span>
          <span className="main-breadcrumb">
            Home &gt; <span id="breadcrumb">{breadcrumb}</span>
          </span>
          <div className="profile-actions">
            <button id="editProfileBtn" className="profile-action-btn" onClick={() => setShowEditProfile(true)}>
              Edit Profile
            </button>
            <button id="logoutBtn" className="profile-action-btn logout" onClick={logout}>
              Log Out
            </button>
          </div>
        </header>

        {showEditProfile && (
          <div id="editProfileModal" className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false) }}>
            <div className="modal-content">
              <span className="close" id="closeModalBtn" onClick={() => setShowEditProfile(false)}>&times;</span>
              <h2>Edit Profile</h2>
              <form id="editProfileForm" onSubmit={onSaveProfile}>
                <label htmlFor="editName">Name:</label>
                <input id="editName" name="editName" type="text" required defaultValue={profileName} />
                <label htmlFor="editProfilePic">Profile Picture:</label>
                <input id="editProfilePic" name="editProfilePic" type="file" accept="image/*" />
                <button type="submit">Save Changes</button>
              </form>
            </div>
          </div>
        )}

        {active === 'dashboard' && <section id="dashboardSection" style={{ display: 'block' }}><Dashboard students={students} /></section>}
        {active === 'students' && <section id="studentsSection" style={{ display: 'block' }}><Students students={students} setStudents={setStudents} /></section>}
        {active === 'logs' && <section id="logsSection" style={{ display: 'block' }}><Logs logs={logs} /></section>}
        {active === 'awards' && <section id="awardsSection" style={{ display: 'block' }}><Awards students={students} /></section>}

        {active === 'account' && (
          <section id="accountSection" className="account-settings-section" style={{ display: 'block' }}>
            <Account />
          </section>
        )}

        {active === 'school' && <section id="schoolSection" style={{ display: 'block' }}><School students={students} /></section>}
      </main>
    </div>
  )
}

/* dashboard */
function Dashboard({ students }) {
  const presentCount = useMemo(() => students.filter((s) => s.present).length, [students])
  const absentCount = students.length - presentCount
  const lateCount = useMemo(() => Math.floor(Math.random() * 3), []) // demo like HTML

  const sortedByMerit = useMemo(() => students.slice().sort((a, b) => b.merit - a.merit), [students])
  const rankTop10 = useMemo(() => sortedByMerit.slice(0, 10), [sortedByMerit])
  const rankTop50 = useMemo(() => sortedByMerit.slice(0, 50), [sortedByMerit])

  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [chartAvailable, setChartAvailable] = useState(true)

  const totals = useMemo(() => MAJORS.map((m) => students.filter((s) => s.major === m).length), [students])
  const presents = useMemo(() => MAJORS.map((m) => students.filter((s) => s.major === m && s.present).length), [students])

  useEffect(() => {
    let chartInstance = null
    let mounted = true
    ;(async () => {
      try {
        const ChartCtor = await ensureChart()
        if (!mounted || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (chartRef.current) {
          chartRef.current.destroy()
          chartRef.current = null
        }
        chartInstance = new ChartCtor(ctx, {
          type: 'bar',
          data: {
            labels: MAJORS,
            datasets: [
              { label: 'Total', data: totals, backgroundColor: '#1abc9c' },
              { label: 'Present', data: presents, backgroundColor: '#3498db' },
            ],
          },
          options: { responsive: true, scales: { y: { beginAtZero: true } } },
        })
        chartRef.current = chartInstance
        setChartAvailable(true)
      } catch (e) { setChartAvailable(false) }
    })()
    return () => {
      mounted = false
      try { chartInstance?.destroy() } catch {}
      chartRef.current = null
    }
  }, [totals, presents])

  const [portalOnline, setPortalOnline] = useState(false)
  const bcRef = useRef(null)
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('portalStatusChannel')
      bcRef.current = bc
      bc.onmessage = (e) => {
        if (e.data === 'portal-online') setPortalOnline(true)
        if (e.data === 'portal-offline') setPortalOnline(false)
      }
      const int = setInterval(() => { try { bc.postMessage('status-request') } catch {} }, 2000)
      return () => { clearInterval(int); try { bc.close() } catch {} }
    } catch {}
  }, [])

  function openPortal() {
    window.open('/admin/portal', '_blank')
  }

  const maxTotal = Math.max(1, ...totals)

  return (
    <>
      <div className="side-section">
        <div id="portalStatusContainer" style={{ marginBottom: 16, marginTop: -50 }}>
          <button
            id="portalStatusBtn"
            onClick={openPortal}
            style={{
              display: 'inline-block',
              border: 'none',
              padding: '12px 34px',
              borderRadius: 24,
              fontSize: '1.15em',
              fontWeight: 600,
              color: '#fff',
              background: portalOnline ? '#19bc6b' : '#e74c3c',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              transition: 'background 0.22s',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {portalOnline ? 'Portal: Online' : 'Portal: Offline'}
          </button>
        </div>

        <h3>Student Rank by Merit</h3>
        <table className="rank-table" id="sideRankTable">
          <thead>
            <tr><th>Rank</th><th>Name</th><th>Merit</th></tr>
          </thead>
          <tbody>
            {rankTop10.map((s, i) => (
              <tr key={s.qr}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.merit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rank-dropdown-container">
          <label htmlFor="sideRankDropdown">Compact View (up to 50 students):</label>
          <select id="sideRankDropdown" size={6} style={{ width: '100%' }}>
            {rankTop50.map((s, i) => (
              <option key={s.qr} value={s.qr}>{i + 1}. {s.name} ({s.merit} pts)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <span className="card-title">Present Today</span>
            <span className="card-count" id="presentToday">{presentCount}</span>
            <span className="card-info">Students present</span>
          </div>
          <div className="dashboard-card">
            <span className="card-title">Absent Today</span>
            <span className="card-count" id="absentToday">{absentCount}</span>
            <span className="card-info">Students absent</span>
          </div>
          <div className="dashboard-card">
            <span className="card-title">Late Comers</span>
            <span className="card-count" id="lateToday">{lateCount}</span>
            <span className="card-info">Late arrivals</span>
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-card">
            <span className="chart-title">Major Attendance Today</span>
            {chartAvailable ? (
              <canvas id="majorAttendanceChart" ref={canvasRef} width="400" height="180" />
            ) : (
              <div className="chart-bar" aria-label="Fallback chart">
                {MAJORS.map((m, i) => (
                  <div className="bar-group" key={m}>
                    <label>{m}</label>
                    <div className="bar" style={{ width: `${Math.round((totals[i] / (maxTotal || 1)) * 100)}%`, background: '#1abc9c' }}>
                      Total: {totals[i]}
                    </div>
                    <div className="bar" style={{ width: `${Math.round((presents[i] / (maxTotal || 1)) * 100)}%`, background: '#3498db', marginLeft: 6 }}>
                      Present: {presents[i]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* student */
function Students({ students, setStudents }) {
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', idx: -1 })

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return students.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.qr.toLowerCase().includes(q) ||
        s.major.toLowerCase().includes(q)
    )
  }, [students, query])

  function addStudent(data) {
    setStudents((prev) => [...prev, { ...data, merit: 0, present: false }])
  }
  function updateStudent(idx, data) {
    setStudents((prev) => {
      const next = prev.slice()
      const old = next[idx]
      next[idx] = { ...old, ...data }
      return next
    })
  }
  function deleteStudent(idx) {
    if (confirm('Delete this student?')) {
      setStudents((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  return (
    <div className="students-table-container">
      <div className="students-table-header-bar">
        <div className="students-table-search-box">
          <svg className="students-search-logo" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="#888" strokeWidth="2" />
            <line x1="18" y1="18" x2="15.5" y2="15.5" stroke="#888" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            id="studentsSearchBar"
            className="students-table-search"
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button id="addStudentBtn" className="profile-action-btn add-student-btn" onClick={() => setModal({ open: true, mode: 'add', idx: -1 })}>
          Add Student
        </button>
      </div>

      <div className="scrollable-table-wrapper">
        <table className="retrieval-table" id="studentsTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Year Level</th>
              <th>Email</th>
              <th>Password</th>
              <th>QR Code No</th>
              <th>Major</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const realIdx = students.indexOf(s)
              return (
                <tr
                  key={s.qr}
                  onClick={(ev) => {
                    if (ev.target.tagName?.toLowerCase() === 'button') return
                    setModal({ open: true, mode: 'edit', idx: realIdx })
                  }}
                >
                  <td>{s.name}</td>
                  <td>{s.year}</td>
                  <td>{s.email}</td>
                  <td>{s.password}</td>
                  <td>{s.qr}</td>
                  <td>{s.major}</td>
                  <td>
                    <button className="profile-action-btn" onClick={(e) => { e.stopPropagation(); setModal({ open: true, mode: 'edit', idx: realIdx }) }}>
                      Edit
                    </button>
                    <button className="profile-action-btn logout" onClick={(e) => { e.stopPropagation(); deleteStudent(realIdx) }}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <Modal title={modal.mode === 'add' ? 'Add Student' : 'Edit Student'} onClose={() => setModal({ open: false, mode: 'add', idx: -1 })}>
          <StudentForm
            mode={modal.mode}
            student={modal.mode === 'edit' ? students[modal.idx] : undefined}
            onSubmit={(data) => { if (modal.mode === 'add') addStudent(data); else updateStudent(modal.idx, data) }}
            onDone={() => setModal({ open: false, mode: 'add', idx: -1 })}
          />
          {modal.mode === 'edit' && <small>(Password changes will be sent to student's email by end of the day)</small>}
        </Modal>
      )}
    </div>
  )
}

function StudentForm({ mode, student, onSubmit, onDone }) {
  const [form, setForm] = useState({
    name: student?.name || '',
    year: student?.year || '',
    email: student?.email || '',
    password: student?.password || '',
    qr: student?.qr || '',
    major: student?.major || MAJORS[0],
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
        onDone()
      }}
    >
      <label>Name:</label>
      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <label>Year Level:</label>
      <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
      <label>Email:</label>
      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <label>Password:</label>
      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <label>QR Code No:</label>
      <input type="text" value={form.qr} onChange={(e) => setForm({ ...form, qr: e.target.value })} required />
      <label>Major:</label>
      <select value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })}>
        {MAJORS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <button type="submit">{mode === 'add' ? 'Add' : 'Save'}</button>
    </form>
  )
}

/* logs */
function Logs({ logs }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const filtered = useMemo(() => logs.filter((l) => l.date === date), [logs, date])

  async function exportToXLSX() {
    try {
      const XLSX = await ensureXLSX()
      const data = filtered.map((l) => ({ Name: l.name, QR: l.qr, LogIn: l.login, LogOut: l.logout }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Logs')
      XLSX.writeFile(wb, `logs-${date}.xlsx`)
    } catch (e) {
      alert('Unable to load XLSX library from CDN.')
    }
  }

  return (
    <>
      <div style={{ margin: 32 }}>
        <label htmlFor="logsDate">Show logs for date:</label>{' '}
        <input id="logsDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />{' '}
        <button id="exportLogsBtn" className="profile-action-btn" onClick={exportToXLSX}>
          Export to XLSX
        </button>
      </div>
      <table className="logs-table" id="logsTable">
        <thead>
          <tr><th>Name</th><th>QR Code No</th><th>Log In</th><th>Log Out</th></tr>
        </thead>
        <tbody>
          {filtered.map((l, i) => (
            <tr key={`${l.qr}-${i}`}>
              <td>{l.name}</td>
              <td>{l.qr}</td>
              <td>{l.login}</td>
              <td>{l.logout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

/* awards */
function Awards({ students }) {
  const sorted = useMemo(() => students.slice().sort((a, b) => b.merit - a.merit), [students])
  const top10 = useMemo(() => sorted.slice(0, 10), [sorted])
  const [confirmIdx, setConfirmIdx] = useState(null)
  const [lastCert, setLastCert] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function confirmGenerate(idx) {
    setConfirmIdx(idx)
  }
  function doGenerate() {
    setLastCert({ idx: confirmIdx, timeMs: Date.now() })
    setConfirmIdx(null)
  }
  const secondsAgo = lastCert && Math.floor((Date.now() - lastCert.timeMs) / 1000)

  return (
    <>
      <div style={{ margin: 32 }}><h3>Top 10 Students by Merit</h3></div>
      <table className="retrieval-table" id="awardsTable">
        <thead>
          <tr><th>Rank</th><th>Name</th><th>Merit Points</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {top10.map((s, i) => (
            <tr key={s.qr}>
              <td>{i + 1}</td>
              <td>{s.name}</td>
              <td>{s.merit}</td>
              <td><button className="profile-action-btn" onClick={() => confirmGenerate(i)}>Generate Cert</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ margin: 32 }}>
        <h4>Student with Most Merit Points:</h4>
        {sorted[0] && (
          <div id="mostMeritStudent">
            <strong>{sorted[0].name}</strong> ({sorted[0].merit} pts)
            {lastCert && secondsAgo < 90 && top10[lastCert.idx] && (
              <>
                <br />
                <span style={{ color: '#1abc9c' }}>
                  Certificate generated for <b>{top10[lastCert.idx].name}</b> <i>({secondsAgo} seconds ago)</i>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {confirmIdx !== null && (
        <Modal title="Generate Certificate" onClose={() => setConfirmIdx(null)}>
          <p>Generate certificate for <b>{top10[confirmIdx].name}</b>?</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" id="confirmCertBtn" onClick={doGenerate}>Yes</button>
            <button type="button" onClick={() => setConfirmIdx(null)}>No</button>
          </div>
        </Modal>
      )}
    </>
  )
}

/* account section */
function Account() {
  const [open, setOpen] = useState(null) // 'email'|'password'|'name'|'backup'|'details'|null
  return (
    <div className="account-settings-list">
      <h1 className="account-title">Account Settings</h1>

      <button className="account-setting-btn" onClick={() => setOpen(open === 'email' ? null : 'email')}>
        Change Email
      </button>
      <div className="account-option-modal" style={{ display: open === 'email' ? 'block' : 'none' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Email changed and verification sent!')
            setOpen(null)
          }}
        >
          <label>Old Email:</label>
          <input type="email" name="oldEmail" required />
          <label>New Email:</label>
          <input type="email" name="newEmail" required />
          <div className="btn-row">
            <button type="submit">Save</button>
            <button type="button" className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </form>
      </div>

      <button className="account-setting-btn" onClick={() => setOpen(open === 'password' ? null : 'password')}>
        Change Password
      </button>
      <div className="account-option-modal" style={{ display: open === 'password' ? 'block' : 'none' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Password changed!')
            setOpen(null)
          }}
        >
          <label>Old Password:</label>
          <input type="password" name="oldPass" required />
          <label>New Password:</label>
          <input type="password" name="newPass" required />
          <div className="btn-row">
            <button type="submit">Change Password</button>
            <button type="button" className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </form>
      </div>

      <button className="account-setting-btn" onClick={() => setOpen(open === 'name' ? null : 'name')}>
        Rename Account Name
      </button>
      <div className="account-option-modal" style={{ display: open === 'name' ? 'block' : 'none' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Account name changed!')
            setOpen(null)
          }}
        >
          <label>New Account Name:</label>
          <input type="text" required />
          <div className="btn-row">
            <button type="submit">Save</button>
            <button type="button" className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </form>
      </div>

      <button className="account-setting-btn" onClick={() => setOpen(open === 'backup' ? null : 'backup')}>
        Backup All Data
      </button>
      <div className="account-option-modal" style={{ display: open === 'backup' ? 'block' : 'none' }}>
        <div className="btn-row">
          <button id="doBackup" onClick={() => alert('Backup ZIP downloaded (simulated)!')}>Download Backup as ZIP</button>
          <button type="button" className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
        </div>
      </div>

      <button className="account-setting-btn" onClick={() => setOpen(open === 'details' ? null : 'details')}>
        Details
      </button>
      <div className="account-option-modal" style={{ display: open === 'details' ? 'block' : 'none' }}>
        <p>Valid year: 2025</p>
        <div className="btn-row">
          <button id="extendYearBtn" onClick={() => alert('Extension request sent to developer!')}>Request School Year Extension</button>
          <button type="button" className="cancel-btn" onClick={() => setOpen(null)}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* school */
function School({ students }) {
  const countsByMajor = useMemo(() => {
    const m = {}
    for (const major of MAJORS) {
      m[major] = students.filter((s) => s.major === major).length
    }
    return m
  }, [students])

  return (
    <div style={{ margin: 32 }}>
      <h3>School Information</h3>
      <ul>
        <li>School ID: <span id="schoolID">SCH-2025-0001</span></li>
        <li>
          Number of Registered Students (per major):
          <ul id="majorCounts">
            {MAJORS.map((maj) => (<li key={maj}>{maj}: {countsByMajor[maj]}</li>))}
          </ul>
        </li>
        <li>Admin Account School Year Validity: <span id="schoolYearValidity">2025-08-18 to 2026-08-18</span></li>
        <li>Verified Admin Accounts (with ID):</li>
        <ul id="verifiedAdmins">
          <li>
            Prof. Stella (T12345, Verified) - XYZ College
            <br />
            <img src="https://i.imgur.com/4Z5b1aH.png" alt="ID" style={{ width: 60, height: 60, borderRadius: 7, border: '2px solid #1abc9c', marginTop: 3, objectFit: 'cover' }} />
          </li>
        </ul>
      </ul>
    </div>
  )
}

/* generic modals */
function Modal({ title, children, onClose }) {
  return (
    <div className="modal" style={{ display: 'block' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        <div id="modalBody">{children}</div>
      </div>
    </div>
  )
}