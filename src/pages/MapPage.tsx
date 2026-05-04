import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  MessageCircle,
  Navigation,
  Phone,
  RotateCcw,
  Search,
  Star,
  Store as StoreIcon,
  X,
} from 'lucide-react'
import StoreImage from '../components/StoreImage'
import { STORE_DATA, type Store } from '../constants/stores'
import { getCategoryMarkerIcon } from '../utils/categoryMarkers'
import {
  formatJamOperasionalList,
  isOpenNow,
} from '../utils/openingHours'
import { normalizeIndonesiaPhone } from '../utils/phoneLinks'

const CATEGORIES = [...new Set(STORE_DATA.map((s) => s.kategori_tokopedia))].sort()

const SHIPPING_OPTIONS = [
  { key: 'is_instant' as const, label: 'Instant' },
  { key: 'is_sameday' as const, label: 'Same day' },
  { key: 'is_regular' as const, label: 'Reguler' },
  { key: 'is_kargo' as const, label: 'Kargo' },
]

type ShippingKey = (typeof SHIPPING_OPTIONS)[number]['key']

const RATING_MIN_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Semua rating', value: null },
  { label: '≥ 4.0', value: 4 },
  { label: '≥ 4.5', value: 4.5 },
  { label: '5.0', value: 5 },
]

const MAP_CENTER: [number, number] = [3.5952, 98.6722]

function MapFlyTo({
  target,
  onDone,
}: {
  target: { lat: number; lon: number } | null
  onDone: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!target) return
    map.flyTo([target.lat, target.lon], 15, { duration: 0.65 })
    const t = window.setTimeout(onDone, 720)
    return () => window.clearTimeout(t)
  }, [target, map, onDone])

  return null
}

function shippingTags(store: Store) {
  return (
    <div className="flex flex-wrap gap-1">
      {store.is_instant === 1 && (
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
          Instant
        </span>
      )}
      {store.is_sameday === 1 && (
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium text-sky-300">
          Same day
        </span>
      )}
      {store.is_regular === 1 && (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
          Reguler
        </span>
      )}
      {store.is_kargo === 1 && (
        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
          Kargo
        </span>
      )}
    </div>
  )
}

function StoreDetailBody({
  store,
  onClose,
}: {
  store: Store
  onClose: () => void
}) {
  const open = isOpenNow(store.jam_operasional)
  const phone = normalizeIndonesiaPhone(store.kontak)
  const directionsGoogle = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}`
  const directionsApple = `https://maps.apple.com/?daddr=${store.lat},${store.lon}&dirflg=d`
  const jamRows = formatJamOperasionalList(store.jam_operasional)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl border border-surface-200/10 bg-surface-950/50">
        <StoreImage
          src={store.url_gambar}
          alt={store.nama_toko}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200/20 bg-surface-950/90 text-surface-200 backdrop-blur md:hidden"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="heading-md text-white">{store.nama_toko}</h3>
            <p className="mt-0.5 text-sm text-brand-400">{store.kategori_tokopedia}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-sm font-semibold text-amber-300">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {store.rating}
          </div>
        </div>

        {open !== null && (
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                open
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {open ? 'Buka sekarang' : 'Tutup sekarang'}
            </span>
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-surface-200/80">{store.alamat}</p>

        {store.deskripsi ? (
          <p className="mt-3 text-sm leading-relaxed text-surface-200/60">{store.deskripsi}</p>
        ) : null}

        <div className="mt-4">
          <h4 className="sidebar-section-title mb-2">Jadwal operasional</h4>
          <ul className="space-y-1.5 text-sm">
            {jamRows.map(({ day, text }) => (
              <li
                key={day}
                className="flex justify-between gap-3 border-b border-surface-200/5 py-1 text-surface-200/70 last:border-0"
              >
                <span className="text-surface-200/50">{day}</span>
                <span className="text-right text-surface-200/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">{shippingTags(store)}</div>
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-200/10 pt-4">
        <p className="sidebar-section-title mb-0">Aksi</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a
            href={directionsGoogle}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex-1 justify-center py-2.5 text-sm"
          >
            <Navigation size={16} />
            Rute (Google Maps)
          </a>
          <a
            href={directionsApple}
            target="_blank"
            rel="noreferrer"
            className="btn-outline flex-1 justify-center py-2.5 text-sm"
          >
            <Navigation size={16} />
            Apple Maps
          </a>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {phone && (
            <>
              <a
                href={phone.waHref}
                target="_blank"
                rel="noreferrer"
                className="btn-outline flex flex-1 items-center justify-center gap-2 py-2.5 text-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={phone.telHref}
                className="btn-outline flex flex-1 items-center justify-center gap-2 py-2.5 text-sm"
              >
                <Phone size={16} />
                Telepon
              </a>
            </>
          )}
          <a
            href={store.link_toko}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 text-sm"
          >
            <ExternalLink size={16} />
            Kunjungi Tokopedia
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="btn-ghost w-full py-2 text-sm md:hidden"
      >
        Kembali ke daftar
      </button>
    </div>
  )
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedShipping, setSelectedShipping] = useState<Set<ShippingKey>>(new Set())
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortByRatingDesc, setSortByRatingDesc] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lon: number } | null>(null)

  const clearFlyTarget = useCallback(() => setFlyTarget(null), [])

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

  const q = searchQuery.trim().toLowerCase()

  const filteredStores = useMemo(() => {
    let list = STORE_DATA.filter((store) => {
      if (q) {
        const inName = store.nama_toko.toLowerCase().includes(q)
        const inAddr = store.alamat.toLowerCase().includes(q)
        if (!inName && !inAddr) return false
      }
      if (selectedCategories.size > 0 && !selectedCategories.has(store.kategori_tokopedia)) {
        return false
      }
      if (selectedShipping.size > 0) {
        const ok = [...selectedShipping].some((key) => store[key] === 1)
        if (!ok) return false
      }
      if (minRating != null && store.rating < minRating) return false
      return true
    })

    if (sortByRatingDesc) {
      list = [...list].sort((a, b) => b.rating - a.rating)
    }
    return list
  }, [q, selectedCategories, selectedShipping, minRating, sortByRatingDesc])

  const selectedStore = useMemo(
    () =>
      selectedStoreId != null
        ? STORE_DATA.find((s) => s.id === selectedStoreId) ?? null
        : null,
    [selectedStoreId],
  )

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories(new Set())
    setSelectedShipping(new Set())
    setMinRating(null)
    setSortByRatingDesc(false)
  }

  const hasFilters =
    searchQuery.trim().length > 0 ||
    selectedCategories.size > 0 ||
    selectedShipping.size > 0 ||
    minRating != null ||
    sortByRatingDesc

  const pickStoreFromList = (store: Store) => {
    setSelectedStoreId(store.id)
    setFlyTarget({ lat: store.lat, lon: store.lon })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-0 min-h-0">
      {/* Peta: layer penuh — lebar tidak berkurang saat sidebar terbuka */}
      <div className="geo-map-wrap absolute inset-0 z-0">
        <MapContainer
          center={MAP_CENTER}
          zoom={13}
          className="h-full w-full"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapFlyTo target={flyTarget} onDone={clearFlyTarget} />
          {filteredStores.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lon]}
              icon={getCategoryMarkerIcon(store.kategori_tokopedia)}
              eventHandlers={{
                click: () => setSelectedStoreId(store.id),
              }}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[260px] font-sans text-surface-200">
                  <div className="flex gap-3">
                    <StoreImage
                      src={store.url_gambar}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-tight text-white">{store.nama_toko}</h3>
                      <p className="mt-1 text-[11px] text-brand-400/90">{store.kategori_tokopedia}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {store.rating}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-surface-200/45">
                    Detail di panel kanan (desktop) atau bawah (HP)
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Gelap di atas peta saat drawer filter HP terbuka */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup panel"
          className="absolute inset-0 z-[1190] bg-black/45 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Panel filter: overlay kiri di atas peta */}
      <aside
        className={`filter-panel absolute top-0 bottom-0 left-0 z-[1200] flex min-h-0 w-80 max-w-[min(20rem,92vw)] flex-col border-r border-surface-200/10 bg-surface-900/90 p-5 shadow-xl backdrop-blur-md transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
      >
        <div className="flex shrink-0 flex-col gap-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="heading-md flex items-center gap-2 text-white">
              <Filter size={20} className="text-brand-400" aria-hidden />
              Filter
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1 text-xs text-brand-400 transition-colors hover:text-brand-300"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-surface-200/35"
              size={16}
            />
            <input
              type="search"
              placeholder="Cari nama toko atau area alamat…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-surface-200/15 bg-surface-950/40 py-2.5 pr-3 pl-10 text-sm text-surface-200 placeholder:text-surface-200/35 focus:border-brand-500/50 focus:outline-none"
            />
          </div>

          <div className="badge-brand self-start">
            {filteredStores.length} toko ditampilkan
          </div>

          <div>
            <h3 className="sidebar-section-title">Rating minimum</h3>
            <select
              value={minRating ?? ''}
              onChange={(e) =>
                setMinRating(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full cursor-pointer rounded-xl border border-surface-200/15 bg-surface-950/40 px-3 py-2.5 text-sm text-surface-200 focus:border-brand-500/50 focus:outline-none"
            >
              {RATING_MIN_OPTIONS.map((o) => (
                <option key={o.label} value={o.value ?? ''}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <label className="filter-item cursor-pointer rounded-xl border border-transparent hover:border-surface-200/10">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={sortByRatingDesc}
              onChange={(e) => setSortByRatingDesc(e.target.checked)}
            />
            <span>Urutkan rating tertinggi dulu</span>
          </label>

          <div>
            <h3 className="sidebar-section-title">Filter cepat kategori</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.has(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`max-w-full truncate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-brand-500/60 bg-brand-500/20 text-brand-300'
                        : 'border-surface-200/15 bg-surface-950/30 text-surface-200/70 hover:border-surface-200/25'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

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
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="sidebar-section-title">Jenis pengiriman</h3>
            <div className="flex flex-col gap-1">
              {SHIPPING_OPTIONS.map((opt) => (
                <label key={opt.key} className="filter-item">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedShipping.has(opt.key)}
                    onChange={() => toggleShipping(opt.key)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-surface-200/10 pt-5">
          <h3 className="sidebar-section-title mb-3 flex shrink-0 items-center gap-2">
            <StoreIcon size={14} aria-hidden />
            Daftar toko
          </h3>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredStores.map((store) => (
              <li key={store.id}>
                <button
                  type="button"
                  onClick={() => pickStoreFromList(store)}
                  className={`flex w-full gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selectedStoreId === store.id
                      ? 'border-brand-500/50 bg-brand-500/10'
                      : 'border-surface-200/10 bg-surface-950/40 hover:border-brand-500/30 hover:bg-surface-950/70'
                  }`}
                >
                  <StoreImage
                    src={store.url_gambar}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-surface-100">{store.nama_toko}</p>
                    <p className="truncate text-xs text-surface-200/50">{store.kategori_tokopedia}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-amber-400/90">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {store.rating}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 self-center text-surface-200/30"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <button
        type="button"
        id="toggle-sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-4 z-[1220] rounded-r-lg border border-l-0 border-surface-200/10 bg-surface-900/90 px-2 py-3 text-surface-200/70 shadow-lg backdrop-blur-md transition-[left,transform] duration-300 ease-out hover:bg-surface-800 hover:text-white"
        style={{
          left: sidebarOpen ? `min(20rem, 92vw)` : 0,
        }}
        aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft size={16} className="transition-transform duration-300" />
        ) : (
          <Filter size={16} />
        )}
      </button>

      {/* Panel detail toko: overlay kanan di atas peta (desktop) */}
      {selectedStore && (
        <aside className="detail-panel absolute top-0 right-0 bottom-0 z-[1210] hidden min-h-0 w-[min(100%,24rem)] flex-col border-l border-surface-200/10 bg-surface-900/92 shadow-xl backdrop-blur-md md:flex">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-surface-200/10 px-4 py-3">
            <h2 className="heading-md text-white">Detail toko</h2>
            <button
              type="button"
              onClick={() => setSelectedStoreId(null)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200/15 text-surface-200/80 transition-colors hover:bg-surface-200/10 hover:text-white"
              aria-label="Tutup panel detail"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <StoreDetailBody
              store={selectedStore}
              onClose={() => setSelectedStoreId(null)}
            />
          </div>
        </aside>
      )}

      {/* Mobile bottom sheet: detail */}
      {selectedStore && (
        <div className="fixed inset-x-0 bottom-0 z-[1300] max-h-[88vh] overflow-y-auto rounded-t-2xl border border-surface-200/15 border-b-0 bg-surface-900/98 p-5 pb-8 shadow-2xl backdrop-blur-lg md:hidden">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-200/25" />
          <StoreDetailBody
            store={selectedStore}
            onClose={() => setSelectedStoreId(null)}
          />
        </div>
      )}
    </div>
  )
}
