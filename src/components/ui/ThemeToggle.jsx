import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ems_theme';

function readTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm font-black uppercase text-xs"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      id="theme-toggle-btn"
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
