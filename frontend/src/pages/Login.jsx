import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({ school_id: '', email: '', password: '' })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    alert(`Login submitted:\nSchool ID: ${form.school_id}\nEmail: ${form.email}`)
  }

  return (
    <>
      {/* Hero */}
      <section className="hero hero-compact">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">Welcome back</h1>
            <p className="hero-subtitle">Sign in to manage attendance and merits.</p>
          </div>
          <div className="hero-art">
            <div className="logo-rect small">
              <img src="https://i.imgur.com/4Z5b1aH.png" alt="MeritScan" />
            </div>
          </div>
        </div>
      </section>

      {/* Auth form */}
      <section className="container auth-wrap">
        <div className="card form-card">
          <h2 className="form-title">Login</h2>
          <form onSubmit={handleSubmit} className="form" noValidate>
            <label htmlFor="school_id">School ID</label>
            <input type="text" id="school_id" name="school_id" value={form.school_id} onChange={handleChange} />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required value={form.email} onChange={handleChange} />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$#]).{8,}$"
              title="At least 8 characters, one uppercase letter, one number, and one special character (!@#$#)"
              value={form.password}
              onChange={handleChange}
            />
            <br /><br />

            <button type="submit" className="btn btn-primary full">Sign in</button>
          </form>
          <p className="form-note">
            New to Merit Scan? <a href="/register" className="link">Create an account</a>.
          </p>
        </div>
      </section>
    </>
  )
}