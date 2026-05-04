import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Map, Home, Moon, Sun } from 'lucide-react'
import { useViewTransitionNavigate } from '../App'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useViewTransitionNavigate()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="main-navbar"
      className={`navbar ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
    >
      <div className="section-container flex h-16 items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={(e) => navigate('/', e)}
          className="flex items-center gap-2.5 group cursor-pointer border-none bg-transparent"
        >
          <img
            src="/logo.svg"
            alt="Geotoko"
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-fg-strong text-lg font-bold tracking-tight">
            Geo<span className="text-brand-400">toko</span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            className="btn-ghost cursor-pointer rounded-xl px-3 py-2.5"
            aria-label={theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
            title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={(e) => navigate('/', e)}
            className={`btn-ghost cursor-pointer text-sm ${pathname === '/' ? 'text-brand-400' : ''}`}
          >
            <Home size={16} />
            Beranda
          </button>
          <button
            type="button"
            onClick={(e) => navigate('/map', e)}
            className="btn-primary cursor-pointer text-sm"
          >
            <Map size={16} />
            Buka Peta
          </button>
        </div>
      </div>
    </nav>
  )
}
