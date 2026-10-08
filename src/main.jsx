import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ── Theme: apply stored preference before first paint (no flash) ──
try {
  const stored = localStorage.getItem('ems_theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = stored || (systemDark ? 'dark' : 'light')
  document.documentElement.setAttribute('data-theme', theme)
} catch (_) {
  document.documentElement.setAttribute('data-theme', 'light')
}


// ── Migration: add status='approved' to any stored users that pre-date this feature ──
try {
  const raw = localStorage.getItem('ems_all_users');
  if (raw) {
    const users = JSON.parse(raw);
    const migrated = users.map(u => u.status ? u : { ...u, status: 'approved' });
    localStorage.setItem('ems_all_users', JSON.stringify(migrated));
  }
  const rawUser = localStorage.getItem('ems_user');
  if (rawUser) {
    const u = JSON.parse(rawUser);
    if (!u.status) {
      localStorage.setItem('ems_user', JSON.stringify({ ...u, status: 'approved' }));
    }
  }
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
