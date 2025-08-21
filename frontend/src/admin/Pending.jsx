import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

export default function Pending() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileName, setProfileName] = useState('Admin Account')
  const [profilePic, setProfilePic] = useState('https://i.imgur.com/4Z5b1aH.png')
  const [showEdit, setShowEdit] = useState(false)
  const navigate = useNavigate()

  function logout() {
    alert('Logged out!')
    navigate('/')
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
        if (typeof ev.target?.result === 'string') setProfilePic(ev.target.result)
      }
      reader.readAsDataURL(pic)
    }
    setShowEdit(false)
  }

  return (
    <div className="app-container">
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Merit Scan</span>
          <button className="sidebar-toggle" id="sidebarToggle" aria-label="Toggle navigation" onClick={() => setCollapsed((c) => !c)}>
            &#9776;
          </button>
        </div>
        <div className="sidebar-profile">
          <div className="profile-img">
            <img id="profilePicSidebar" src={profilePic} alt="Master Account" />
          </div>
          <div className="profile-details">
            <span className="profile-name" id="profileNameSidebar">
              {profileName}
            </span>
            <span className="profile-status online">Online</span>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-section">STATUS</li>
          <li>
            <a href="#" className="active" data-content="dashboard" onClick={(e) => e.preventDefault()}>
              Waiting Area
            </a>
          </li>
        </ul>
      </nav>

      <main className="main-content" id="mainContent">
        <header className="main-header">
          <span className="main-project">Admin Account</span>
          <span className="main-breadcrumb">
            Home &gt; <span id="breadcrumb">Dashboard</span>
          </span>
          <div className="profile-actions">
            <button id="editProfileBtn" className="profile-action-btn" onClick={() => setShowEdit(true)}>
              Edit Profile
            </button>
            <button id="logoutBtn" className="profile-action-btn logout" onClick={logout}>
              Log Out
            </button>
          </div>
        </header>

        {showEdit && (
          <div className="modal" style={{ display: 'block' }} onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
            <div className="modal-content">
              <span className="close" id="closeModalBtn" onClick={() => setShowEdit(false)}>
                &times;
              </span>
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

        <section className="dashboard" id="dashboard" style={{ display: 'block' }}>
          <div className="waiting-area">
            <h2>Registration Pending</h2>
            <p>Your registration is being reviewed by the developer. Please wait for approval.</p>

            <div className="registration-info">
              <h3>Your Registration Details</h3>
              <form className="readonly-form">
                <div className="readonly-row">
                  <label>Name:</label>
                  <input type="text" value="Jane Doe" readOnly />
                </div>
                <div className="readonly-row">
                  <label>Profession:</label>
                  <input type="text" value="Admin" readOnly />
                </div>
                <div className="readonly-row">
                  <label>Email:</label>
                  <input type="email" value="jane.doe@schoola.com" readOnly />
                </div>
                <div className="readonly-row">
                  <label>Password:</label>
                  <input type="password" value="********" readOnly />
                </div>
                <div className="readonly-row">
                  <label>Levels:</label>
                  <input type="text" value="High School" readOnly />
                </div>
                <div className="readonly-row">
                  <label>School/Campus:</label>
                  <input type="text" value="School A" readOnly />
                </div>
                <div className="readonly-row">
                  <label>Upload Valid ID:</label>
                  <div className="approval-id-upload">
                    <img src="https://i.imgur.com/4Z5b1aH.png" alt="Uploaded ID" className="approval-modal-id-img" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}