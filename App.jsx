import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import './styles.css';

/* Shared layout */
import Topbar from './components/topbar.jsx';
import Footer from './components/footer.jsx';

/* Public pages */
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';

/* Master */
import Master from './master/master.jsx';

/* Admin */
import Admin from './admin/admin.jsx';
import Portal from './admin/portal.jsx';
import Pending from './admin/pending.jsx';

/* Student */
import Student from './student/student.jsx';
import StudentLogin from './student/login.jsx';

/* Optional 404 */
function NotFound() {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '12px' }}>404</h1>
      <p>Page not found.</p>
      <a className="btn btn-primary" href="/">Go Home</a>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  // Determine if full-screen shell (no marketing chrome)
  const isStandalone = useMemo(() =>
    pathname.startsWith('/master') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/student'), [pathname]
  );

  const titleMap = {
    '/': 'Merit Scan',
    '/login': 'Merit Scan | Login',
    '/register': 'Merit Scan | Register',
    '/admin': 'Admin Dashboard',
    '/admin/pending': 'Admin Pending',
    '/admin/portal': 'Admin Portal',
    '/student': 'Student Dashboard',
    '/student/login': 'Student Login',
    '/master': 'Master Dashboard'
  };

  function deriveTitle(p) {
    if (titleMap[p]) return titleMap[p];
    if (p.startsWith('/master')) return 'Master Dashboard';
    if (p.startsWith('/admin')) return 'Admin';
    if (p.startsWith('/student')) return 'Student';
    return 'Merit Scan';
  }

  useEffect(() => {
    document.title = deriveTitle(pathname);
  }, [pathname]);

  return (
    <>
      {!isStandalone && <Topbar currentPath={pathname} />}
      <main id="app-main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Master */}
          <Route path="/master/*" element={<Master />} />

          {/* Admin */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/pending" element={<Pending />} />
          <Route path="/admin/portal" element={<Portal />} />

          {/* Student */}
          <Route path="/student" element={<Student />} />
          <Route path="/student/login" element={<StudentLogin />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isStandalone && <Footer />}
    </>
  );
}