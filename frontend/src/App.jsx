import { Routes, Route, useLocation } from 'react-router-dom'
import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Master from './master/Master.jsx'

// admin
import Admin from './admin/Admin.jsx'
import Portal from './admin/Portal.jsx'
import Pending from './admin/Pending.jsx'

// student
import Student from './student/Student.jsx'
import StudentLogin from './student/Login.jsx'

export default function App() {
  const location = useLocation()

  if (location.pathname.startsWith('/master')) {
  } else if (location.pathname.startsWith('/admin')) {
    if (location.pathname === '/admin') {
      document.title = 'Admin Dashboard'
    } else if (location.pathname === '/admin/portal') {
      document.title = 'Admin Portal'
    } else if (location.pathname === '/admin/pending') {
      document.title = 'Admin Pending'
    } else {
      document.title = 'Admin'
    }
  } else if (location.pathname.startsWith('/student')) {
    if (location.pathname === '/student') {
      document.title = 'Student Dashboard'
    } else if (location.pathname === '/student/login') {
      document.title = 'Student Login'
    } else {
      document.title = 'Student'
    }
  } else {
    const titleMap = {
      '/': 'Merit Scan',
      '/login': 'Merit Scan',
      '/register': 'Merit Scan',
    }
    document.title = titleMap[location.pathname] || 'Merit Scan'
  }

  const isStandalone =
    location.pathname.startsWith('/master') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/student')

  return (
    <>
      {!isStandalone && <Topbar />}
      <main>
        <Routes>
          {/* public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* master */}
          <Route path="/master/*" element={<Master />} />

          {/* admin */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/portal" element={<Portal />} />
          <Route path="/admin/pending" element={<Pending />} />

          {/* student */}
          <Route path="/student" element={<Student />} />
          <Route path="/student/login" element={<StudentLogin />} />
        </Routes>
      </main>
      {!isStandalone && <Footer />}
    </>
  )
}