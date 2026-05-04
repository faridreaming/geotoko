import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { setViewTransitionOrigin } from '../lib/viewTransitionOrigin'

export const THEME_STORAGE_KEY = 'geotoko-theme'

export type ThemeMode = 'dark' | 'light'

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: (e?: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return 'dark'
}

function applyThemeDom(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode === 'light' ? 'light' : 'dark'
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', mode === 'light' ? '#f8fafc' : '#020617')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    typeof window !== 'undefined' ? readStoredTheme() : 'dark',
  )

  useEffect(() => {
    applyThemeDom(theme)
  }, [theme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
  }, [])

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next: ThemeMode = theme === 'dark' ? 'light' : 'dark'
      if (!document.startViewTransition) {
        setThemeState(next)
        return
      }
      setViewTransitionOrigin(e ? { clientX: e.clientX, clientY: e.clientY } : null)
      document.startViewTransition(() => {
        flushSync(() => {
          setThemeState(next)
          applyThemeDom(next)
        })
      })
    },
    [theme],
  )

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
