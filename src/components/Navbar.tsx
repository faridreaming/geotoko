import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Map, Home } from 'lucide-react'
import { useViewTransitionNavigate } from '../App'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useViewTransitionNavigate()
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
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none"
        >
          <img
            src="/logo.svg"
            alt="Geotoko"
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-lg font-bold text-white tracking-tight">
            Geo<span className="text-brand-400">toko</span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className={`btn-ghost text-sm cursor-pointer ${pathname === '/' ? 'text-brand-400' : ''}`}
          >
            <Home size={16} />
            Beranda
          </button>
          <button
            onClick={() => navigate('/map')}
            className="btn-primary text-sm cursor-pointer"
          >
            <Map size={16} />
            Buka Peta
          </button>
        </div>
      </div>
    </nav>
  )
}
