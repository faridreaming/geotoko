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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Komputer & Laptop': Laptop,
  'Makanan & Minuman': UtensilsCrossed,
  Elektronik: Smartphone,
  Kesehatan: HeartPulse,
  'Rumah Tangga': ShoppingBag,
}

const CATEGORY_COLORS: Record<string, string> = {
  'Komputer & Laptop': '#2563eb',
  'Makanan & Minuman': '#ea580c',
  Elektronik: '#7c3aed',
  Kesehatan: '#db2777',
  'Rumah Tangga': '#059669',
}

const DEFAULT_COLOR = '#64748b'

const iconCache = new Map<string, L.DivIcon>()

export function getCategoryMarkerIcon(kategori: string): L.DivIcon {
  const cached = iconCache.get(kategori)
  if (cached) return cached

  const Icon = CATEGORY_ICONS[kategori] ?? MapPin
  const color = CATEGORY_COLORS[kategori] ?? DEFAULT_COLOR

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
  iconCache.set(kategori, icon)
  return icon
}
