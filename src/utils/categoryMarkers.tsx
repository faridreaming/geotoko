import L from 'leaflet'
import type { LucideIcon } from 'lucide-react'
import {
  HeartPulse,
  Laptop,
  MapPin,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
} from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ThemeMode } from '../context/ThemeContext'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Komputer & Laptop': Laptop,
  'Makanan & Minuman': UtensilsCrossed,
  Elektronik: Smartphone,
  Kesehatan: HeartPulse,
  'Rumah Tangga': ShoppingBag,
}

/** Hue sama dengan palet sebelumnya; `light` = lebih gelap di peta terang, `dark` = lebih terang di peta gelap */
const CATEGORY_COLORS: Record<string, { light: string; dark: string }> = {
  'Komputer & Laptop': { light: '#1d4ed8', dark: '#60a5fa' },
  'Makanan & Minuman': { light: '#c2410c', dark: '#fb923c' },
  Elektronik: { light: '#6d28d9', dark: '#a78bfa' },
  Kesehatan: { light: '#be185d', dark: '#f472b6' },
  'Rumah Tangga': { light: '#047857', dark: '#34d399' },
}

const DEFAULT_COLORS = { light: '#475569', dark: '#94a3b8' }

export function getCategoryIcon(kategori: string): LucideIcon {
  return CATEGORY_ICONS[kategori] ?? MapPin
}

export function getCategoryColor(kategori: string, theme: ThemeMode): string {
  const pair = CATEGORY_COLORS[kategori]
  if (!pair) return DEFAULT_COLORS[theme]
  return pair[theme]
}

const iconCache = new Map<string, L.DivIcon>()

export function getCategoryMarkerIcon(kategori: string, theme: ThemeMode): L.DivIcon {
  const cacheKey = `${kategori}\0${theme}`
  const cached = iconCache.get(cacheKey)
  if (cached) return cached

  const Icon = getCategoryIcon(kategori)
  const color = getCategoryColor(kategori, theme)

  const html = renderToStaticMarkup(
    <div className="map-marker-pin" style={{ ['--pin-color' as string]: color }}>
      <span className="map-marker-lucide">
        <Icon size={20} color="#ffffff" strokeWidth={2.25} />
      </span>
    </div>,
  )

  const icon = L.divIcon({
    className: 'map-marker-wrap',
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36],
  })
  iconCache.set(cacheKey, icon)
  return icon
}
