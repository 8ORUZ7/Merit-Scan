import { NavLink, Link } from 'react-router-dom'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="container">
        <Link className="brand" to="/">
          <span className="brand-name">Merit Scan</span>
        </Link>
        <nav className="topnav">
          <NavLink
            to="/register"
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            Register
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            Login
          </NavLink>
          {/* Placeholder routes for future content */}
          <a href="#" className="topnav-link">About</a>
          <a href="#" className="topnav-link">Contact</a>
        </nav>
      </div>
    </header>
  )
}