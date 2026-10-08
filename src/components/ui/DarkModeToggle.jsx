import { useEffect } from 'react';

export default function DarkModeToggle() {
  useEffect(() => {
    localStorage.removeItem('eventpro_color_scheme');
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('dark-mode');
  }, []);

  return null;
}
