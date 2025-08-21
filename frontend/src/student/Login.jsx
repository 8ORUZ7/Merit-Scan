import React, { useEffect } from 'react'
import './styles.css'

export default function StudentLogin() {
  useEffect(() => {
    document.documentElement.classList.add('student-login')
    document.body.classList.add('student-login')
    document.title = 'Student Login'
    return () => {
      document.documentElement.classList.remove('student-login')
      document.body.classList.remove('student-login')
    }
  }, [])

  function onSubmit(e) {
    e.preventDefault()
    alert('Signed in (sample).')
  }

  return (
    <>
      <header className="topbar">
        <div className="container"></div>
      </header>

      <main>
        <section className="hero hero-compact" style={{ textAlign: 'center' }}>
          <div className="hero-text">
            <h1 className="hero-title">Welcome back</h1>
            <p className="hero-subtitle">Sign in to manage attendance and merits.</p>
          </div>
        </section>

        <section className="container auth-wrap">
          <div className="card form-card">
            <h2 className="form-title">Login</h2>
            <form className="form" onSubmit={onSubmit}>
              <label htmlFor="school_id">School ID</label>
              <span id="school_id_set">102842</span>
              <br /><br />

              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$#]).{8,}$"
                title="At least 8 characters, one uppercase letter, one number, and one special character (!@#$#)"
              />
              <br /><br />

              <button type="submit" className="btn btn-primary full">Sign in</button>
            </form>
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

