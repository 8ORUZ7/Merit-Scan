import { useState } from 'react'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    profession: '',
    email: '',
    password: '',
    levels: '',
    school_campus: '',
    upload_idcard: null,
  })

  function handleChange(e) {
    const { name, value, files, type } = e.target
    setForm((f) => ({ ...f, [name]: type === 'file' ? (files?.[0] || null) : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    alert(`Registration submitted for ${form.name || '(no name)'} — ${form.email}`)
  }

  return (
    <>
      {/* Hero */}
      <section className="hero hero-compact">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">Create your account</h1>
            <p className="hero-subtitle">Get set up in minutes: start tracking merits today.</p>
          </div>
          <div className="hero-art">
            <div className="logo-rect small">
              <img src="https://i.imgur.com/4Z5b1aH.png" alt="MeritScan" />
            </div>
          </div>
        </div>
      </section>

      {/* Registration form */}
      <section className="container auth-wrap">
        <div className="card form-card">
          <h2 className="form-title">Register</h2>
          <form onSubmit={handleSubmit} className="form" noValidate>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange}
            />

            <label htmlFor="profession">Profession</label>
            <select id="profession" name="profession" required value={form.profession} onChange={handleChange}>
              <option value="">Select</option>
              <option value="teacher">Teacher</option>
              <option value="professor">Professor</option>
            </select>

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

            <fieldset className="levels">
              <legend>Levels</legend>
              <label>
                <input type="radio" id="level1" name="levels" value="level1" required checked={form.levels === 'level1'} onChange={handleChange} /> Grade School
              </label>
              <label>
                <input type="radio" id="level2" name="levels" value="level2" checked={form.levels === 'level2'} onChange={handleChange} /> High School
              </label>
              <label>
                <input type="radio" id="level3" name="levels" value="level3" checked={form.levels === 'level3'} onChange={handleChange} /> College
              </label>
            </fieldset>

            <label htmlFor="school_campus">School/Campus</label>
            <input
              type="text"
              id="school_campus"
              name="school_campus"
              autoComplete="organization"
              value={form.school_campus}
              onChange={handleChange}
            />

            <label htmlFor="upload_idcard">Upload Valid ID</label>
            <input
              type="file"
              id="upload_idcard"
              name="upload_idcard"
              accept="image/*"
              required
              onChange={handleChange}
            />
            <br /><br />

            <button type="submit" className="btn btn-primary full">Create account</button>
          </form>
          <p className="form-note">
            Already have an account? <a href="/login" className="link">Sign in</a>.
          </p>
        </div>
      </section>
    </>
  )
}