# Merit Scan — Frontend Preview

## Quick start

Prerequisites
- Node.js 18+ recommended
- npm, pnpm, or yarn

Install and run
```bash
# install deps
npm install

# start dev server
npm run dev

# build for production
npm run build
```

Open the app at http://localhost:8000 (your dev server port).

---

## Routing overview

All routes are public in this preview (no auth gate). Document titles are set from `App.jsx`.

Public
- `/` — Home
- `/login` — Generic login page (for marketing/preview)
- `/register` — Registration page (preview only)

Master (standalone layout, managed inside `Master.jsx`)
- `/master/*` — Master area and its internal screens
  - Note: Master sets its own document title internally (see `Master.jsx`)

Admin (standalone layout)
- `/admin` — Admin dashboard
- `/admin/portal` — QR Scan Portal (camera page)
- `/admin/pending` — Admin “Pending” page (review/approval preview)

Student
- `/student` — Student dashboard
- `/student/login` — Student login page (dark theme)

Preview-only disclaimer
- These routes exist for UI demonstration. Forms submit to client-side handlers (alerts, in-memory state) and do not call a backend.

---

## What’s implemented?

### Shared UI
- Responsive sidebar with collapse/expand behavior
- Main header with breadcrumb, Edit Profile, and Log Out actions
- Modals with a11y-friendly dismiss (click overlay or close button)
- Reduced motion preference respected where possible
- Document titles updated based on route

### Student area

Highlights
- Final “Merit Points” dashboard matches the HTML reference (2×2 centered KPI cards; blue border; subtle shadow; colored values)
- Sidebar sections: Dashboard (Merit Points), Appeal (Submit a ticket), Settings (Account)
- Section switching updates the active link and breadcrumb
- Edit Profile modal:
  - Change name and profile photo (FileReader for preview)
  - Sidebar avatar updates live after save
- Account settings:
  - Change email and password (alerts)
  - Profile image preview (FileReader)
  - Level select toggles between College, High School, Grade School fields (only one group visible at a time)
- Ticket form:
  - “Submit a ticket” shows alert and resets form
- Login page:
  - Applies a dark theme via adding/removing `student-login` class on `<html>` and `<body>`
  - Email/password input validation on the client (pattern/title)
- Logout: alert then reload (mirrors the static HTML behavior)

Styling notes
- Login + Student styles merged into `student/styles.css`, both Student and StudentLogin import the same file.
- A safeguard ensures the Student main has light background even if “login theme” classes linger.

### Admin area

Dashboard
- KPI cards for present, absent, late (absent derived from present vs total; late randomized for demo)
- Bar chart of Major Attendance (Chart.js v4 via UMD CDN)
  - If Chart.js fails to load, falls back to CSS-based bars
- Rank table and compact list (Top 10 in a table, Top 50 in a select)
- “Portal status” button and BroadcastChannel heartbeat with `/admin/portal` (online/offline indicator)

Students
- Searchable table (name, year, email, QR, major)
- Add/Edit/Delete with modal forms (in-memory state)
- Clicking a row opens “Edit” modal; “Delete” asks for confirmation

Daily Logs
- Date filter (client-side)
- Export to XLSX (via `xlsx` UMD CDN)
  - If the library fails to load, an alert explains the limitation

Awards
- Top 10 by merit (table)
- “Generate Cert” simulation (shows a recent action status for ~90s)

Account (matches reference design)
- Big dark-teal action buttons:
  - Change Email
  - Change Password
  - Rename Account Name
  - Backup All Data (simulated ZIP download)
  - Details (valid year and extension request)
- Each opens a white panel below with respective form/actions

School
- Per-major counts derived from mock students
- Static sample for verified admins and validity dates

Sidebar collapse behavior
- The collapsed sidebar is a 60px rail
- “Excess text” is hidden during collapse (menu text is fully hidden)
- Sidebar has `overflow-x: hidden` to prevent bleed outside the rail

### Master area
- Note: Master updates document title internally. Consider it reserved for higher-privilege operations (not functionally implemented in this preview).

---

## File structure (key parts)

```
src/
  App.jsx
  admin/
    Admin.jsx
    styles.css       
  master/
    Master.jsx
  student/
    Student.jsx
    Login.jsx
    styles.css        
  components/
    Topbar.jsx
    Footer.jsx
  pages/
    Home.jsx
    Login.jsx
    Register.jsx
```

---

## Not production-ready (preview-only)
- No real authentication: any route is accessible
- No server or database: everything is static or in-memory
- No persistence: refreshing the page resets state
- Security hardening, validation, and error handling are minimal (demo only)

---

## Backend integration notes
When wiring to a real API, consider:
- Replace mocked arrays (students, logs, etc.) with fetch calls (React Query, RTK Query, SWR, or native fetch)
- Replace client-side alerts with real toasts and API responses
- Gate routes with proper auth (JWT/Session) and protect admin/master areas
- Replace FileReader-only avatar handling with an upload endpoint (S3, GCS, etc.)
- Replace “Generate Cert” simulation with server-side certificate generation


## License

This preview is provided “as-is” for UI demonstration purposes only.
