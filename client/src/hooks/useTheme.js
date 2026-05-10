import { useState, useEffect } from 'react';

export default function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('dv-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('dv-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  // Apply on first render too (before any state change)
  useEffect(() => {
    const saved = localStorage.getItem('dv-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  return { dark, toggle: () => setDark(d => !d) };
}
