import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setTheme: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const saved = localStorage.getItem('cn_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  // Apply immediately
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');

  return {
    isDark,
    toggle: () => set((state) => {
      const next = !state.isDark;
      localStorage.setItem('cn_theme', next ? 'dark' : 'light');
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { isDark: next };
    }),
    setTheme: (dark) => set(() => {
      localStorage.setItem('cn_theme', dark ? 'dark' : 'light');
      if (dark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { isDark: dark };
    }),
  };
});
