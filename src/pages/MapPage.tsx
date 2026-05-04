import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { STORE_DATA } from '../constants/stores'

const CATEGORIES = [...new Set(STORE_DATA.map((s) => s.kategori_tokopedia))]

const SHIPPING_OPTIONS = [
  { key: 'is_instant' as const, label: 'Instant' },
  { key: 'is_sameday' as const, label: 'Same Day' },
  { key: 'is_regular' as const, label: 'Reguler' },
  { key: 'is_kargo' as const, label: 'Kargo' },
]

type ShippingKey = (typeof SHIPPING_OPTIONS)[number]['key']

// Medan center
const MAP_CENTER: [number, number] = [3.5952, 98.6722]

export default function MapPage() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedShipping, setSelectedShipping] = useState<Set<ShippingKey>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const toggleShipping = (key: ShippingKey) => {
    setSelectedShipping((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filteredStores = useMemo(() => {
    return STORE_DATA.filter((store) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(store.kategori_tokopedia)) return false
      if (selectedShipping.size > 0) {
        const hasShipping = [...selectedShipping].some((key) => store[key] === 1)
        if (!hasShipping) return false
      }
      return true
    })
  }, [selectedCategories, selectedShipping])

  const clearFilters = () => {
    setSelectedCategories(new Set())
    setSelectedShipping(new Set())
  }

  const hasFilters = selectedCategories.size > 0 || selectedShipping.size > 0

  return (
    <div className="flex h-screen pt-16">
      {/* Sidebar */}
      <aside
        className={`sidebar shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full w-0 overflow-hidden p-0 border-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="heading-md text-white">Filter</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        {/* Result Count */}
        <div className="badge-brand self-start">
          {filteredStores.length} toko ditemukan
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="sidebar-section-title">Kategori</h3>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="filter-item">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Shipping Filter */}
        <div>
          <h3 className="sidebar-section-title">Jenis Pengiriman</h3>
          <div className="flex flex-col gap-1">
            {SHIPPING_OPTIONS.map((opt) => (
              <label key={opt.key} className="filter-item">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedShipping.has(opt.key)}
                  onChange={() => toggleShipping(opt.key)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Toggle sidebar button */}
      <button
        id="toggle-sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-20 z-[1000] rounded-r-lg border border-l-0 border-surface-200/10 bg-surface-900/90 px-2 py-3 text-surface-200/70 backdrop-blur-md transition-all duration-300 hover:bg-surface-800 hover:text-white cursor-pointer"
        style={{ left: sidebarOpen ? '320px' : '0px' }}
        aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Map Area */}
      <div className="relative flex-1">
        <MapContainer center={MAP_CENTER} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {filteredStores.map((store) => (
            <Marker key={store.id} position={[store.lat, store.lon]}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{store.nama_toko}</h3>
                  <p className="text-xs text-gray-500 mb-1">{store.kategori_tokopedia}</p>
                  <p className="text-xs text-gray-600 mb-2">{store.alamat}</p>
                  <div className="flex gap-1 flex-wrap">
                    {store.is_instant === 1 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Instant</span>}
                    {store.is_sameday === 1 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Same Day</span>}
                    {store.is_regular === 1 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Reguler</span>}
                    {store.is_kargo === 1 && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Kargo</span>}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-yellow-600">★ {store.rating}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
