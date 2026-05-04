import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useCallback, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar'
import { ThemeProvider } from './context/ThemeContext'
import { setViewTransitionOrigin } from './lib/viewTransitionOrigin'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'

export type ViewTransitionNavigateEvent =
  | Pick<MouseEvent, 'clientX' | 'clientY'>
  | ReactMouseEvent
  | undefined

/**
 * Navigasi dengan View Transition API + clip-path lingkaran dari titik klik.
 */
export function useViewTransitionNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (to: string, event?: ViewTransitionNavigateEvent) => {
      const point =
        event && 'nativeEvent' in event
          ? { clientX: event.clientX, clientY: event.clientY }
          : event && 'clientX' in event
            ? { clientX: event.clientX, clientY: event.clientY }
            : null
      setViewTransitionOrigin(point)

      if (!document.startViewTransition) {
        navigate(to)
        return
      }

      document.startViewTransition(() => {
        flushSync(() => {
          navigate(to)
        })
      })
    },
    [navigate],
  )
}

function AppRoutes() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
