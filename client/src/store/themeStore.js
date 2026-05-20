import { create } from 'zustand'

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('nox_theme')
    if (stored === 'light' || stored === 'dark') return stored
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  } catch {
    // ignore
  }
  return 'dark'
}

const useThemeStore = create((set, get) => ({
  theme: getStoredTheme(),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next })
    try {
      localStorage.setItem('nox_theme', next)
    } catch {
      // ignore
    }
  },

  setTheme: (theme) => {
    set({ theme })
    try {
      localStorage.setItem('nox_theme', theme)
    } catch {
      // ignore
    }
  },
}))

export default useThemeStore
