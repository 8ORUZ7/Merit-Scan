import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

export default function Student() {
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.remove('student-login')
    document.body.classList.remove('student-login')
    document.title = 'Merit Scan Student Account'
  }, [])

  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('points')
  const [breadcrumb, setBreadcrumb] = useState('Merit Points')

  const [profileName, setProfileName] = useState('Student Account')
  const [profilePic, setProfilePic] = useState('https://i.imgur.com/4Z5b1aH.png')

  const [showEdit, setShowEdit] = useState(false)

  const [accountPreviewSrc, setAccountPreviewSrc] = useState('https://i.imgur.com/4Z5b1aH.png')
  const [level, setLevel] = useState('College')

  useEffect(() => {
    setActive('points')
    setBreadcrumb('Merit Points')
  }, [])

  function toggleSidebar() {
    setCollapsed((c) => !c)
  }

  function switchSection(key, label) {
    setActive(key)
    setBreadcrumb(label)
  }

    function logout() {
    alert('Logged out!')
    navigate('/')
  }

  function openEdit() {
    setShowEdit(true)
  }
  function closeEdit() {
    setShowEdit(false)
  }

  function saveProfile(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = (fd.get('editName') || '').toString()
    if (name) setProfileName(name)
    const pic = fd.get('editProfilePic')
    if (pic && pic instanceof File && pic.size > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setProfilePic(ev.target.result)
          setAccountPreviewSrc(ev.target.result)
        }
      }
      reader.readAsDataURL(pic)
    }
    setShowEdit(false)
  }

  function onAccountPreviewChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') setAccountPreviewSrc(evt.target.result)
    }
    reader.readAsDataURL(file)
  }

  function submitTicket(e) {
    e.preventDefault()
    alert('Ticket submitted!')
    e.currentTarget.reset()
  }

  return (
    <div className="app-container">
      {/* sidebar */}
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Merit Scan</span>
          <button
            className="sidebar-toggle"
            id="sidebarToggle"
            aria-label="Toggle navigation"
            onClick={toggleSidebar}
          >
            &#9776;
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-img">
            <img id="profilePicSidebar" src={profilePic} alt="Student Account" />
          </div>
          <div className="profile-details">
            <span className="profile-name" id="profileNameSidebar">{profileName}</span>
            <span className="profile-status online">Online</span>
          </div>
        </div>

        <ul className={`sidebar-menu ${collapsed ? 'hide-nav' : ''}`}>
          <li className="sidebar-section">DASHBOARD</li>
          <li>
            <a
              href="#"
              className={active === 'points' ? 'active' : ''}
              data-content="points"
              onClick={(e) => { e.preventDefault(); switchSection('points', 'Merit Points') }}
            >
              Merit Points
            </a>
          </li>
          <li className="menu-gap" />
          <li className="sidebar-section">APPEAL</li>
          <li>
            <a
              href="#"
              className={active === 'errors' ? 'active' : ''}
              data-content="errors"
              onClick={(e) => { e.preventDefault(); switchSection('errors', 'Submit a ticket') }}
            >
              Submit a ticket
            </a>
          </li>
          <li className="menu-gap" />
          <li className="sidebar-section">SETTINGS</li>
          <li>
            <a
              href="#"
              className={active === 'account' ? 'active' : ''}
              data-content="account"
              onClick={(e) => { e.preventDefault(); switchSection('account', 'Account') }}
            >
              Account
            </a>
          </li>
        </ul>
      </nav>

      {/* main */}
      <main className="main-content student-main" id="mainContent">
        <header className="main-header">
          <span className="main-project">Student Account</span>
          <span className="main-breadcrumb">
            Home &gt; <span id="breadcrumb">{breadcrumb}</span>
          </span>
          <div className="profile-actions">
            <button id="editProfileBtn" className="profile-action-btn" onClick={openEdit}>Edit Profile</button>
            <button id="logoutBtn" className="profile-action-btn logout" onClick={logout}>Log Out</button>
          </div>
        </header>

        {/* points kpi cards */}
        {active === 'points' && (
          <section id="points" style={{ display: 'block' }}>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-title">Merit Points</div>
                <div className="kpi-value merit-green">120</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Late</div>
                <div className="kpi-value orange">2</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Absences</div>
                <div className="kpi-value red">1</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Streak</div>
                <div className="kpi-value merit-green">10 <span className="streak-fire">🔥</span></div>
              </div>
            </div>
          </section>
        )}

        {/* submit a ticket */}
        {active === 'errors' && (
          <section id="errors" className="ticket-section" style={{ display: 'block' }}>
            <h2>Submit a Ticket</h2>
            <form className="ticket-form" id="ticketForm" onSubmit={submitTicket}>
              <label htmlFor="ticketReason">Describe your issue or reason:</label>
              <textarea id="ticketReason" name="ticketReason" placeholder="Describe the issue or concern..." required></textarea>

              <label htmlFor="ticketSelect">Select an issue encountered:</label>
              <select id="ticketSelect" name="ticketSelect" defaultValue="">
                <option value="">Other</option>
                <option value="qr">QR Code not scanning</option>
                <option value="login">Login issue</option>
                <option value="attendance">Attendance not recorded</option>
                <option value="points">Merit points incorrect</option>
                <option value="profile">Profile info error</option>
              </select>
              <br />
              <button type="submit">Submit Ticket</button>
            </form>
          </section>
        )}

        {/* account settings */}
        {active === 'account' && (
          <section id="account" className="account-settings-section" style={{ display: 'block' }}>
            <h2>Account Settings</h2>
            <form id="accountSettingsForm" onSubmit={(e) => e.preventDefault()}>
              <div className="settings-group">
                <label htmlFor="changeEmail">Change Email:</label>
                <input type="email" id="changeEmail" name="changeEmail" defaultValue="student@email.com" required />
                <br />
                <button type="button" onClick={() => alert('Email changed!')}>Change Email</button>
              </div>

              <div className="settings-group">
                <label htmlFor="oldPassword">Current Password:</label>
                <input type="password" id="oldPassword" name="oldPassword" required />

                <label htmlFor="changePassword">New Password:</label>
                <input type="password" id="changePassword" name="changePassword" required />
                <br />
                <button type="button" onClick={() => alert('Password changed!')}>Change Password</button>
              </div>

              <div className="settings-group">
                <h3>Details</h3>
                <div className="profile-img-edit">
                  <img id="profileImgPreview" src={accountPreviewSrc} alt="Profile Image" />
                  <input type="file" id="profileImgInput" accept="image/*" onChange={onAccountPreviewChange} />
                </div>

                <label htmlFor="changeName">Name:</label>
                <input type="text" id="changeName" name="changeName" defaultValue="Jane Doe" required />

                <label htmlFor="changeLevel">Level:</label>
                <select
                  id="changeLevel"
                  name="changeLevel"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="Grade School">Grade School</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                </select>

                {level === 'College' && (
                  <div id="collegeFields" style={{ display: 'block' }}>
                    <label htmlFor="changeMajor">Major:</label>
                    <input type="text" id="changeMajor" name="changeMajor" defaultValue="Computer Science" />
                    <label htmlFor="changeCourse">Course:</label>
                    <input type="text" id="changeCourse" name="changeCourse" defaultValue="BSCS" />
                    <label htmlFor="changeYearLevelCollege">Year Level:</label>
                    <select id="changeYearLevelCollege" name="changeYearLevelCollege" defaultValue="3">
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                )}

                {level === 'High School' && (
                  <div id="highSchoolFields" style={{ display: 'block' }}>
                    <label htmlFor="changeYearLevelHS">Year Level:</label>
                    <select id="changeYearLevelHS" name="changeYearLevelHS" defaultValue="3">
                      <option value="1">Grade 7</option>
                      <option value="2">Grade 8</option>
                      <option value="3">Grade 9</option>
                      <option value="4">Grade 10</option>
                      <option value="5">Grade 11</option>
                      <option value="6">Grade 12</option>
                    </select>
                  </div>
                )}

                {level === 'Grade School' && (
                  <div id="gradeSchoolFields" style={{ display: 'block' }}>
                    <label htmlFor="changeYearLevelGS">Year Level:</label>
                    <select id="changeYearLevelGS" name="changeYearLevelGS" defaultValue="3">
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                      <option value="4">Grade 4</option>
                      <option value="5">Grade 5</option>
                      <option value="6">Grade 6</option>
                    </select>
                  </div>
                )}

                <br />
                <button type="button" onClick={() => alert('Details updated!')}>Update Details</button>
              </div>
            </form>
          </section>
        )}

        {/* edit profile modal */}
        {showEdit && (
          <div
            id="editProfileModal"
            className="modal"
            style={{ display: 'block' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
          >
            <div className="modal-content">
              <span className="close" id="closeModalBtn" onClick={closeEdit}>&times;</span>
              <h2>Edit Profile</h2>
              <form id="editProfileForm" onSubmit={saveProfile}>
                <label htmlFor="editName">Name:</label>
                <input type="text" id="editName" name="editName" required defaultValue={profileName} />
                <br />
                <label htmlFor="editProfilePic">Profile Picture:</label>
                <input type="file" id="editProfilePic" name="editProfilePic" accept="image/*" />
                <br />
                <button type="submit">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}