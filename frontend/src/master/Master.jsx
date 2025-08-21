import React, { useState } from 'react'
import { NavLink, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './styles.css'

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  schools: 'Schools',
  notification: 'Notification',
  modification: 'Modification',
  retrieval: 'Retrieval',
  account: 'Account',
  logs: 'Logs',
}

export default function Master() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  // Profile state
  const [profileName, setProfileName] = useState('Master Account')
  const [profilePic, setProfilePic] = useState('https://i.imgur.com/4Z5b1aH.png')
  const [showEditProfile, setShowEditProfile] = useState(false)

  const currentPath = location.pathname.split('/').filter(Boolean)
  const activeSection = currentPath[1] || 'dashboard'
  const breadcrumb = SECTION_TITLES[activeSection] || 'Dashboard'
  document.title = `Merit Scan Master — ${breadcrumb}`

  function handleEditProfileSave(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newName = formData.get('editName')?.toString() || profileName
    setProfileName(newName)

    const file = formData.get('editProfilePic')
    if (file && file instanceof File && file.size > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') setProfilePic(ev.target.result)
      }
      reader.readAsDataURL(file)
    }
    setShowEditProfile(false)
  }

  function handleLogout() {
    alert('Logged out!')
    navigate('/')
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
            onClick={() => setCollapsed((c) => !c)}
          >
            &#9776;
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-img">
            <img id="profilePicSidebar" src={profilePic} alt="Master Account" />
          </div>
          <div className="profile-details">
            <span className="profile-name" id="profileNameSidebar">{profileName}</span>
            <span className="profile-status online">Online</span>
          </div>
        </div>

        <ul className={`sidebar-menu ${collapsed ? 'hide-nav' : ''}`}>
          <li className="sidebar-section">REPORTS</li>
          <li><NavLink to="/master/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
          <li><NavLink to="/master/schools" className={({ isActive }) => isActive ? 'active' : ''}>Schools</NavLink></li>
          <li><NavLink to="/master/notification" className={({ isActive }) => isActive ? 'active' : ''}>Notification</NavLink></li>
          <li className="menu-gap" />
          <li className="sidebar-section">MANAGE</li>
          <li><NavLink to="/master/modification" className={({ isActive }) => isActive ? 'active' : ''}>Modification</NavLink></li>
          <li><NavLink to="/master/retrieval" className={({ isActive }) => isActive ? 'active' : ''}>Retrieval</NavLink></li>
          <li className="menu-gap" />
          <li className="sidebar-section">SETTINGS</li>
          <li><NavLink to="/master/account" className={({ isActive }) => isActive ? 'active' : ''}>Account</NavLink></li>
          <li><NavLink to="/master/logs" className={({ isActive }) => isActive ? 'active' : ''}>Logs</NavLink></li>
        </ul>
      </nav>

      {/* main content */}
      <main className="main-content" id="mainContent">
        <header className="main-header">
          <span className="main-project">Master Account</span>
          <span className="main-breadcrumb">
            Home &gt; <span id="breadcrumb">{breadcrumb}</span>
          </span>
          <div className="profile-actions">
            <button id="editProfileBtn" className="profile-action-btn" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
            <button id="logoutBtn" className="profile-action-btn logout" onClick={handleLogout}>Log Out</button>
          </div>
        </header>

        {/* edit profile modal */}
        {showEditProfile && (
          <div id="editProfileModal" className="modal show" onClick={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false) }}>
            <div className="modal-content">
              <span className="close" id="closeModalBtn" onClick={() => setShowEditProfile(false)}>&times;</span>
              <h2>Edit Profile</h2>
              <form id="editProfileForm" onSubmit={handleEditProfileSave}>
                <label htmlFor="editName">Name:</label>
                <input type="text" id="editName" name="editName" defaultValue={profileName} required />
                <label htmlFor="editProfilePic">Profile Picture:</label>
                <input type="file" id="editProfilePic" name="editProfilePic" accept="image/*" />
                <button type="submit">Save Changes</button>
              </form>
            </div>
          </div>
        )}

        {/* nested routes */}
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SectionDashboard />} />
          <Route path="schools" element={<SectionSchools />} />
          <Route path="notification" element={<SectionNotification />} />
          <Route path="modification" element={<SectionModification />} />
          <Route path="retrieval" element={<SectionRetrieval />} />
          <Route path="account" element={<SectionAccount />} />
          <Route path="logs" element={<SectionLogs />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

/* dashboard */
function SectionDashboard() {
  return (
    <section className="dashboard" id="dashboard" style={{ display: 'block' }}>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-title">Active Schools</div>
          <div className="card-count">2</div>
          <div className="card-info">school_id: 101, 102</div>
          <a href="#" className="card-link" onClick={(e)=>e.preventDefault()}>More info &#9432;</a>
        </div>
        <div className="dashboard-card">
          <div className="card-title">Report Issues</div>
          <div className="card-count">5</div>
          <div className="card-info">Errors in website</div>
          <a href="#" className="card-link" onClick={(e)=>e.preventDefault()}>More info &#9432;</a>
        </div>
        <div className="dashboard-card">
          <div className="card-title">Online Accounts</div>
          <div className="card-count">14</div>
          <div className="card-info">Student/Admin</div>
          <a href="#" className="card-link" onClick={(e)=>e.preventDefault()}>More info &#9432;</a>
        </div>
        <div className="dashboard-card">
          <div className="card-title">Offline Accounts</div>
          <div className="card-count">4</div>
          <div className="card-info">Student/Admin</div>
          <a href="#" className="card-link" onClick={(e)=>e.preventDefault()}>More info &#9432;</a>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Active School Stats</div>
          <div className="chart-bar">
            <div className="bar-group">
              <label>School ID 101</label>
              <div className="bar" style={{ width: '70%' }}>Online: 8</div>
            </div>
            <div className="bar-group">
              <label>School ID 102</label>
              <div className="bar" style={{ width: '40%' }}>Online: 6</div>
            </div>
          </div>
        </div>
        <div className="chart-card-issue">
          <div className="chart-title">Issues Summary</div>
          <div className="chart-bar">
            <div className="bar-group">
              <label>Error Reports</label>
              <div className="bar error" style={{ width: '50%' }}>3</div>
            </div>
            <div className="bar-group">
              <label>Website Issues</label>
              <div className="bar error" style={{ width: '30%' }}>2</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* schools */
function SectionSchools() {
  return (
    <section id="schools" style={{ display: 'block' }}>
      <h2>Registered Schools</h2>
      <div className="school-list">
        <div className="school-card">
          <div className="school-card-row">
            <div className="school-card-meta">
              <span className="school-name">School A</span>
              <span className="school-id">school_id: 101</span>
              <span className="school-online">Online Accounts: 8</span>
              <span className="school-offline">Offline Accounts: 2</span>
            </div>
            <span className="school-portal online">Attendance Portal: Online</span>
          </div>
        </div>

        <div className="school-card">
          <div className="school-card-row">
            <div className="school-card-meta">
              <span className="school-name">School B</span>
              <span className="school-id">school_id: 102</span>
              <span className="school-online">Online Accounts: 6</span>
              <span className="school-offline">Offline Accounts: 2</span>
            </div>
            <span className="school-portal offline">Attendance Portal: Offline</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* notifs*/
function SectionNotification() {
  const [unreadApproval, setUnreadApproval] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [notif2Open, setNotif2Open] = useState(false)
  const [notif3Open, setNotif3Open] = useState(false)

  function handleApprovalSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const schoolName = form.schoolName.value.trim()
    const schoolID = form.schoolID.value.trim()
    const level = form.level.value
    const schoolYear = form.schoolYear.value
    if (!schoolID) {
      alert('School ID is required.')
      form.schoolID.focus()
      return
    }
    alert(`School Registration Approved!
School Name: ${schoolName}
School ID: ${schoolID}
Level: ${level}
School Year: ${schoolYear}`)
    setShowApprovalModal(false)
    setUnreadApproval(false)
  }

  const approvalCardClass = `notification-card approval ${unreadApproval ? 'notification-unread' : 'notification-read'}`

  return (
    <section id="notification" style={{ display: 'block' }}>
      <h2>Notifications</h2>
      <div className="notification-section">
        {/* approvals */}
        <div className="notification-group-title">School Registration Approvals</div>
        <div className="notification-list">
          <div className={approvalCardClass} id="notif-approval-1" onClick={()=>setUnreadApproval(false)}>
            <span>School Registration Approval</span>
            <span>Valid ID: <img src="https://i.imgur.com/4Z5b1aH.png" alt="ID" className="id-img" /></span>
            <button className="approve-btn" onClick={(e) => { e.stopPropagation(); setShowApprovalModal(true) }}>
              Approve
            </button>
          </div>
        </div>

        {/* approval modal */}
        {showApprovalModal && (
          <div id="approvalModal" className="modal show" onClick={(e)=>{ if(e.target===e.currentTarget) setShowApprovalModal(false) }}>
            <div className="modal-content">
              <span className="close" onClick={() => setShowApprovalModal(false)}>&times;</span>
              <h3>School Registration Approval</h3>

              {/* read only user-provided info */}
              <label>Name:</label>
              <input type="text" value="Jane Doe" readOnly />
              <label>Profession:</label>
              <input type="text" value="Admin" readOnly />
              <label>Email:</label>
              <input type="email" value="jane.doe@schoola.com" readOnly />
              <label>Password:</label>
              <input type="password" value="********" readOnly />
              <label>Levels:</label>
              <input type="text" value="Level 1" readOnly />
              <label>School/Campus:</label>
              <input type="text" value="School A" readOnly />
              <label>Upload Valid ID:</label>
              <div className="approval-id-upload">
                <span>No file chosen</span>
                <img src="https://i.imgur.com/4Z5b1aH.png" alt="ID" className="approval-modal-id-img" />
              </div>

              <hr />
              <form id="approvalForm" onSubmit={handleApprovalSubmit}>
                <label htmlFor="approvalSchoolName">Name of School:</label>
                <input type="text" id="approvalSchoolName" name="schoolName" required />

                <label htmlFor="approvalSchoolID">School ID:</label>
                <input type="text" id="approvalSchoolID" name="schoolID" required />

                <label htmlFor="approvalLevel">Level:</label>
                <select id="approvalLevel" name="level" required defaultValue="">
                  <option value="" disabled>Select Level</option>
                  <option value="Grade School">Grade School</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                </select>

                <label htmlFor="approvalSchoolYear">School Year:</label>
                <input type="number" id="approvalSchoolYear" name="schoolYear" min="2024" max="2100" defaultValue="2026" required />

                <button type="submit" className="approve-btn">Approve Registration</button>
              </form>
            </div>
          </div>
        )}

        {/* reports */}
        <div className="notification-group-title" style={{ marginTop: 32 }}>Report Issues</div>
        <div className="notification-list">
          <div
            className={`notification-card report ${notif2Open ? 'notification-read' : 'notification-unread'}`}
            id="notif2"
            onClick={() => setNotif2Open((v) => !v)}
          >
            <span>Report Issue</span>
            <span>From Student (school_id: 101)</span>
            <span>Issue: Website Error</span>
            {notif2Open && (
              <div className="notification-detail" id="notif2-detail">
                <p>
                  The student encountered an error when logging in to the school portal at 08:01 AM. Issue details:
                  '504 Gateway Timeout'.
                </p>
              </div>
            )}
          </div>

          <div
            className={`notification-card report ${notif3Open ? 'notification-read' : 'notification-unread'}`}
            id="notif3"
            onClick={() => setNotif3Open((v) => !v)}
          >
            <span>Report Issue</span>
            <span>From Admin (school_id: 102)</span>
            <span>Issue: Login Problem</span>
            {notif3Open && (
              <div className="notification-detail" id="notif3-detail">
                <p>
                  Admin reported login issues at 08:02 AM. Issue details: 'Account locked after 3 failed attempts.'
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* modification */
function SectionModification() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({ schoolA: false, schoolB: false })
  const [showUpdate, setShowUpdate] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    name: '', role: '', email: '', level: '', password: '', schoolId: ''
  })

  function openUpdateModal(name, role, email, level, password, schoolId) {
    setUpdateForm({ name, role, email, level, password, schoolId })
    setShowUpdate(true)
  }
  function submitUpdate(e) {
    e.preventDefault()
    alert('Account updated!')
    setShowUpdate(false)
  }

  const listA = [
    { name:'John Doe', role:'Student', school:'School A', level:'College', email:'john@example.com', pass:'passwordA', id:'101' },
    { name:'Mike Cruz', role:'Student', school:'School A', level:'College', email:'mike@example.com', pass:'passwordB', id:'101' },
  ]
  const listB = [
    { name:'Jane Smith', role:'Admin', school:'School B', level:'High School', email:'jane@example.com', pass:'passwordC', id:'102' },
  ]

  function filterList(list){
    const q = query.toLowerCase().trim()
    return list.filter(card => (card.name + card.role + card.school + card.level + card.email).toLowerCase().includes(q))
  }

  return (
    <section id="modification" style={{ display: 'block' }}>
      <h2>Account Modification</h2>
      <p>Add, update, rename, or delete student/admin accounts (grouped by school/campus).</p>

      <div className="modification-dropdowns">
        <input
          type="text"
          id="modificationSearchInput"
          className="modification-search-bar"
          placeholder="Search accounts..."
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />

        {/* school a */}
        <div className="school-group">
          <button
            className={`school-dropdown-btn ${open.schoolA ? 'active' : ''}`}
            onClick={()=>setOpen((o)=>({ ...o, schoolA: !o.schoolA }))}
          >
            School A (school_id: 101)
          </button>
          <div className={`school-dropdown-content ${open.schoolA ? 'show' : ''}`} id="schoolA">
            {filterList(listA).map((card, idx)=>(
              <div className="account-card" key={`a-${idx}`}>
                <div className="account-info">
                  <span><strong>Name:</strong> {card.name}</span>
                  <span><strong>Role:</strong> {card.role}</span>
                  <span><strong>School:</strong> {card.school} (school_id: {card.id})</span>
                  <span><strong>Level:</strong> {card.level}</span>
                </div>
                <div className="account-actions">
                  <button className="account-action-btn" onClick={()=>openUpdateModal(card.name, card.role, card.email, card.level, card.pass, card.id)}>Update</button>
                  <button className="account-action-btn">Rename</button>
                  <button className="account-action-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* school b */}
        <div className="school-group">
          <button
            className={`school-dropdown-btn ${open.schoolB ? 'active' : ''}`}
            onClick={()=>setOpen((o)=>({ ...o, schoolB: !o.schoolB }))}
          >
            School B (school_id: 102)
          </button>
          <div className={`school-dropdown-content ${open.schoolB ? 'show' : ''}`} id="schoolB">
            {filterList(listB).map((card, idx)=>(
              <div className="account-card" key={`b-${idx}`}>
                <div className="account-info">
                  <span><strong>Name:</strong> {card.name}</span>
                  <span><strong>Role:</strong> {card.role}</span>
                  <span><strong>School:</strong> {card.school} (school_id: {card.id})</span>
                  <span><strong>Level:</strong> {card.level}</span>
                </div>
                <div className="account-actions">
                  <button className="account-action-btn" onClick={()=>openUpdateModal(card.name, card.role, card.email, card.level, card.pass, card.id)}>Update</button>
                  <button className="account-action-btn">Rename</button>
                  <button className="account-action-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* update modal */}
      {showUpdate && (
        <div id="updateModal" className="modal show" onClick={(e)=>{ if(e.target===e.currentTarget) setShowUpdate(false) }}>
          <div className="modal-content">
            <span className="close" id="closeUpdateModalBtn" onClick={()=>setShowUpdate(false)}>&times;</span>
            <h2>Update Account</h2>
            <form id="updateAccountForm" onSubmit={submitUpdate}>
              <label htmlFor="updateName">Name:</label>
              <input type="text" id="updateName" name="updateName" required defaultValue={updateForm.name} />
              <label htmlFor="updateRole">Role:</label>
              <input type="text" id="updateRole" name="updateRole" required defaultValue={updateForm.role} />
              <label htmlFor="updateEmail">Email:</label>
              <input type="email" id="updateEmail" name="updateEmail" required defaultValue={updateForm.email} />
              <label htmlFor="updateLevel">Level:</label>
              <input type="text" id="updateLevel" name="updateLevel" defaultValue={updateForm.level} />
              <label htmlFor="updatePassword">Password:</label>
              <input type="password" id="updatePassword" name="updatePassword" defaultValue={updateForm.password} />
              <label htmlFor="updateSchoolID">School ID:</label>
              <input type="text" id="updateSchoolID" name="updateSchoolID" defaultValue={updateForm.schoolId} />
              <button type="submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

/* retrieval */
function SectionRetrieval() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({ tableA: false, tableB: false })
  const [showAdd, setShowAdd] = useState(false)
  const [showRetrieve, setShowRetrieve] = useState(false)
  const [retrieveForm, setRetrieveForm] = useState({
    name:'', profession:'', email:'', level:'', schoolName:'', schoolId:'', password:''
  })

  function openRetrieve(row) {
    setRetrieveForm(row)
    setShowRetrieve(true)
  }

  const dataA = [
    { name:'John Doe', profession:'Professor', email:'john.doe@schoola.com', level:'College', status:'Online', schoolName:'School A', schoolId:'101' },
    { name:'Mike Cruz', profession:'Professor', email:'mike.cruz@schoola.com', level:'College', status:'Offline', schoolName:'School A', schoolId:'101' },
  ]
  const dataB = [
    { name:'Jane Smith', profession:'Teacher', email:'jane.smith@schoolb.com', level:'High School', status:'Online', schoolName:'School B', schoolId:'102' },
    { name:'Albert Lee', profession:'Teacher', email:'albert.lee@schoolb.com', level:'High School', status:'Offline', schoolName:'School B', schoolId:'102' },
  ]

  function filterRows(rows) {
    const q = query.toLowerCase()
    return rows.filter(r => Object.values(r).join(' ').toLowerCase().includes(q))
  }

  function submitAdd(e){
    e.preventDefault()
    alert('Account added!')
    setShowAdd(false)
  }
  function submitRetrieve(e){
    e.preventDefault()
    alert('Account retrieved!')
    setShowRetrieve(false)
  }

  return (
    <section id="retrieval" style={{ display: 'block' }}>
      <h2>Account Retrieval</h2>
      <p>Retrieve or manually add admin/school accounts to a registered school (developer only).</p>

      <div className="retrieval-controls">
        <input
          type="text"
          id="retrievalSearch"
          className="retrieval-search"
          placeholder="Search admin accounts..."
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        <button className="retrieval-btn" onClick={()=>setShowAdd(true)}>Add Account</button>
      </div>

      <div className="retrieval-tables">
        {/* school a */}
        <div className="retrieval-table-group">
          <button className="retrieval-table-dropdown-btn" onClick={()=>setOpen((o)=>({ ...o, tableA: !o.tableA }))}>
            School A (school_id: 101)
          </button>
        </div>
        <div className={`retrieval-table-dropdown-content ${open.tableA ? 'show' : ''}`} id="tableA">
          <table className="retrieval-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Profession</th>
                <th>Email</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filterRows(dataA).map((r, i)=>(
                <tr key={`ra-${i}`} onClick={()=>openRetrieve({ name:r.name, profession:r.profession, email:r.email, level:r.level, schoolName:r.schoolName, schoolId:r.schoolId, password:'' })}>
                  <td>{r.name}</td>
                  <td>{r.profession}</td>
                  <td>{r.email}</td>
                  <td>{r.level}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* school b */}
        <div className="retrieval-table-group">
          <button className="retrieval-table-dropdown-btn" onClick={()=>setOpen((o)=>({ ...o, tableB: !o.tableB }))}>
            School B (school_id: 102)
          </button>
        </div>
        <div className={`retrieval-table-dropdown-content ${open.tableB ? 'show' : ''}`} id="tableB">
          <table className="retrieval-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Profession</th>
                <th>Email</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filterRows(dataB).map((r, i)=>(
                <tr key={`rb-${i}`} onClick={()=>openRetrieve({ name:r.name, profession:r.profession, email:r.email, level:r.level, schoolName:r.schoolName, schoolId:r.schoolId, password:'' })}>
                  <td>{r.name}</td>
                  <td>{r.profession}</td>
                  <td>{r.email}</td>
                  <td>{r.level}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* add account modal */}
      {showAdd && (
        <div id="addAccountModal" className="modal show" onClick={(e)=>{ if(e.target===e.currentTarget) setShowAdd(false) }}>
          <div className="modal-content">
            <span className="close" onClick={()=>setShowAdd(false)}>&times;</span>
            <h3>Add Account</h3>
            <form id="addAccountForm" onSubmit={submitAdd}>
              <label htmlFor="addName">Name:</label>
              <input type="text" id="addName" required />
              <label htmlFor="addProfession">Profession:</label>
              <input type="text" id="addProfession" required />
              <label htmlFor="addEmail">Email:</label>
              <input type="email" id="addEmail" required />
              <label htmlFor="addPassword">New Password:</label>
              <input type="password" id="addPassword" required />
              <label htmlFor="addLevel">Levels:</label>
              <input type="text" id="addLevel" required />
              <label htmlFor="addSchoolName">School Name:</label>
              <input type="text" id="addSchoolName" required />
              <label htmlFor="addSchoolID">School_ID:</label>
              <input type="text" id="addSchoolID" required />
              <button type="submit">Add Account</button>
            </form>
          </div>
        </div>
      )}

      {/* retrieve account modal */}
      {showRetrieve && (
        <div id="retrieveAccountModal" className="modal show" onClick={(e)=>{ if(e.target===e.currentTarget) setShowRetrieve(false) }}>
          <div className="modal-content">
            <span className="close" onClick={()=>setShowRetrieve(false)}>&times;</span>
            <h3>Retrieve Account</h3>
            <form id="retrieveAccountForm" onSubmit={(e)=>{ e.preventDefault(); alert('Account retrieved!'); setShowRetrieve(false) }}>
              <label htmlFor="retrieveName">Name:</label>
              <input type="text" id="retrieveName" defaultValue={retrieveForm.name} required />
              <label htmlFor="retrieveProfession">Profession:</label>
              <input type="text" id="retrieveProfession" defaultValue={retrieveForm.profession} required />
              <label htmlFor="retrieveEmail">Email:</label>
              <input type="email" id="retrieveEmail" defaultValue={retrieveForm.email} required />
              <label htmlFor="retrievePassword">New Password:</label>
              <input type="password" id="retrievePassword" required />
              <label htmlFor="retrieveLevel">Levels:</label>
              <input type="text" id="retrieveLevel" defaultValue={retrieveForm.level} required />
              <label htmlFor="retrieveSchoolName">School Name:</label>
              <input type="text" id="retrieveSchoolName" defaultValue={retrieveForm.schoolName} required />
              <label htmlFor="retrieveSchoolID">School_ID:</label>
              <input type="text" id="retrieveSchoolID" defaultValue={retrieveForm.schoolId} required />
              <button type="submit">Retrieve Account</button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

/*account */
function SectionAccount() {
  const [open, setOpen] = useState({
    changePassword:false, renameAccount:false, backupDatabase:false, duplicateMaster:false
  })
  function showOption(key){ setOpen({ changePassword:false, renameAccount:false, backupDatabase:false, duplicateMaster:false, [key]:true }) }
  function closeOption(key){ setOpen((o)=>({ ...o, [key]: false })) }

  function submitChangePassword(e){ e.preventDefault(); alert('Password changed!'); closeOption('changePassword') }
  function submitRename(e){ e.preventDefault(); alert('Account name renamed!'); closeOption('renameAccount') }

  return (
    <section id="account" style={{ display: 'block' }}>
      <h2>Account Settings</h2>
      <div className="account-settings-list">
        <div className="account-settings-item" onClick={()=>showOption('changePassword')}>Change Password</div>
        <div id="changePasswordOption" className={`account-option-modal ${open.changePassword ? 'show' : ''}`}>
          <form id="changePasswordForm" onSubmit={submitChangePassword}>
            <label htmlFor="oldPassword">Old Password:</label>
            <input type="password" id="oldPassword" required />
            <label htmlFor="newPassword">New Password:</label>
            <input type="password" id="newPassword" required />
            <button type="submit">Change Password</button>
            <button type="button" onClick={()=>closeOption('changePassword')}>Cancel</button>
          </form>
        </div>

        <div className="account-settings-item" onClick={()=>showOption('renameAccount')}>Rename Account Name</div>
        <div id="renameAccountOption" className={`account-option-modal ${open.renameAccount ? 'show' : ''}`}>
          <form id="renameAccountForm" onSubmit={submitRename}>
            <label htmlFor="newAccountName">New Account Name:</label>
            <input type="text" id="newAccountName" required />
            <button type="submit">Rename</button>
            <button type="button" onClick={()=>closeOption('renameAccount')}>Cancel</button>
          </form>
        </div>

        <div className="account-settings-item" onClick={()=>showOption('backupDatabase')}>Backup Database</div>
        <div id="backupDatabaseOption" className={`account-option-modal ${open.backupDatabase ? 'show' : ''}`}>
          <p>Download your database backup as:</p>
          <button onClick={()=>alert('Downloading as .json file...')}>.json file</button>
          <button onClick={()=>alert('Downloading as .xlsx file...')}>.xlsx file</button>
          <button type="button" onClick={()=>closeOption('backupDatabase')}>Cancel</button>
        </div>

        <div className="account-settings-item" onClick={()=>showOption('duplicateMaster')}>Duplicate Master Account</div>
        <div id="duplicateMasterOption" className={`account-option-modal ${open.duplicateMaster ? 'show' : ''}`}>
          <p>Are you sure you want to duplicate the Master Account?</p>
          <button onClick={()=>alert('Master Account duplicated!')}>Yes, Duplicate</button>
          <button type="button" onClick={()=>closeOption('duplicateMaster')}>Cancel</button>
        </div>
      </div>
    </section>
  )
}

/* logs */
function SectionLogs() {
  const [open, setOpen] = useState({ logsSchoolA:false, logsSchoolB:false })
  return (
    <section id="logs" style={{ display: 'block' }}>
      <h2>Logs</h2>
      <p>Logs of registered schools/campus by school_id</p>
      <div className="logs-dropdowns">
        <div className="school-logs-group">
          <button className="school-logs-dropdown-btn" onClick={()=>setOpen((o)=>({ ...o, logsSchoolA: !o.logsSchoolA }))}>
            School A (school_id: 101)
          </button>
          <div className={`school-logs-dropdown-content ${open.logsSchoolA ? 'show' : ''}`} id="logsSchoolA">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Student/Admin Name</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Account Status</th>
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
          <button className="school-logs-dropdown-btn" onClick={()=>setOpen((o)=>({ ...o, logsSchoolB: !o.logsSchoolB }))}>
            School B (school_id: 102)
          </button>
          <div className={`school-logs-dropdown-content ${open.logsSchoolB ? 'show' : ''}`} id="logsSchoolB">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Student/Admin Name</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Account Status</th>
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
  )
}
