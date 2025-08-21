import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">Attendance and merits, simplified.</h1>
            <p className="hero-subtitle">
              Scan merits, track attendance, and reward achievement in real-time: all with a clean
              dashboard and fast workflows.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
            </div>
            <p className="hero-note">No credit card required. Try it free.</p>
          </div>
          <div className="hero-art">
            <div className="logo-rect">
              <img src="https://i.imgur.com/4Z5b1aH.png" alt="App preview" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="card feature">
              <h3 className="feature-title">Fast Scanning</h3>
              <p className="feature-desc">Log attendance and merits in seconds with minimal friction.</p>
            </div>
            <div className="card feature">
              <h3 className="feature-title">Real-time Dashboard</h3>
              <p className="feature-desc">Monitor activity, points, and trends live.</p>
            </div>
            <div className="card feature">
              <h3 className="feature-title">Secure Verification</h3>
              <p className="feature-desc">Encrypted workflows and role-based access.</p>
            </div>
            <div className="card feature">
              <h3 className="feature-title">Multi-level Support</h3>
              <p className="feature-desc">Grade School, High School, and College ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-section">
        <div className="container">
          <div className="card about">
            <h2 className="section-title">About Merit Scan</h2>
            <p className="about-text">
              Merit Scan streamlines attendance tracking and merit rewards with modern UI,
              quick scanning, and actionable reporting: built to scale for your school.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}