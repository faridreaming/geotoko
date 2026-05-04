import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useCallback, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { flushSync } from 'react-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'

/**
 * Hook: navigate with View Transition API.
 * Uses flushSync to ensure React DOM updates are captured
 * by the view transition snapshot before painting.
 */
export function useViewTransitionNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (to: string) => {
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
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
