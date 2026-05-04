import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import {
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Store as StoreIcon,
  Truck,
  X,
} from 'lucide-react'
import StoreImage from '../components/StoreImage'
import { useTheme } from '../context/ThemeContext'
import { STORE_DATA, type Store } from '../constants/stores'
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryMarkerIcon,
} from '../utils/categoryMarkers'
import {
  formatJamOperasionalList,
  getTodayDayName,
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

const TILE_DARK =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

function InvalidateMapOnTheme({ theme }: { theme: 'light' | 'dark' }) {
  const map = useMap()
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize()
    })
    return () => cancelAnimationFrame(id)
  }, [theme, map])
  return null
}

/** Peta di flex layout; pastikan tile ikut saat lebar kolom berubah */
function InvalidateMapOnResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ debounceMoveend: true })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

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

/** Hitung jumlah filter yang aktif (selain pencarian) untuk badge tombol. */
function countActiveFilters({
  selectedCategories,
  selectedShipping,
  minRating,
  sortByRatingDesc,
}: {
  selectedCategories: Set<string>
  selectedShipping: Set<ShippingKey>
  minRating: number | null
  sortByRatingDesc: boolean
}): number {
  return (
    selectedCategories.size +
    selectedShipping.size +
    (minRating != null ? 1 : 0) +
    (sortByRatingDesc ? 1 : 0)
  )
}

function MapFilterBar({
  searchQuery,
  setSearchQuery,
  filteredCount,
  hasFilters,
  clearFilters,
  minRating,
  setMinRating,
  sortByRatingDesc,
  setSortByRatingDesc,
  selectedCategories,
  toggleCategory,
  selectedShipping,
  toggleShipping,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  filteredCount: number
  hasFilters: boolean
  clearFilters: () => void
  minRating: number | null
  setMinRating: (v: number | null) => void
  sortByRatingDesc: boolean
  setSortByRatingDesc: (v: boolean) => void
  selectedCategories: Set<string>
  toggleCategory: (cat: string) => void
  selectedShipping: Set<ShippingKey>
  toggleShipping: (key: ShippingKey) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeCount = countActiveFilters({
    selectedCategories,
    selectedShipping,
    minRating,
    sortByRatingDesc,
  })

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute top-3 left-1/2 z-[1100] w-[min(28rem,calc(100%-1.5rem))] -translate-x-1/2 sm:left-3 sm:translate-x-0"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-surface-200/12 bg-surface-950/85 p-1.5 pl-3 shadow-lg shadow-black/30 backdrop-blur-xl ring-1 ring-white/[0.03]">
        <Search size={15} className="shrink-0 text-surface-200/55" aria-hidden />
        <input
          type="search"
          placeholder="Cari toko atau alamat…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-surface-100 placeholder:text-surface-200/38 focus:outline-none"
        />
        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="rounded-full p-1 text-surface-200/55 transition-colors hover:bg-surface-200/10 hover:text-surface-200"
            aria-label="Hapus pencarian"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            open || activeCount > 0
              ? 'border-brand-500/45 bg-brand-500/20 text-brand-100'
              : 'border-surface-200/12 bg-surface-900/60 text-surface-200/85 hover:border-surface-200/22 hover:bg-surface-900/85'
          }`}
        >
          <SlidersHorizontal size={14} aria-hidden />
          Filter
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Panel filter"
          className="mt-2 overflow-hidden rounded-2xl border border-surface-200/12 bg-surface-950/95 shadow-2xl shadow-black/40 ring-1 ring-white/[0.03] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-surface-200/10 px-4 py-2.5">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-surface-200/55">
              {filteredCount} toko cocok
              {hasFilters ? ', filter aktif' : ''}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-400 transition-colors hover:bg-brand-500/10 hover:text-brand-300"
              >
                <RotateCcw size={12} aria-hidden />
                Reset
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,30rem)] overflow-y-auto p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[10rem] flex-1">
                <Star
                  className="pointer-events-none absolute top-1/2 left-2.5 z-10 -translate-y-1/2 text-amber-400/75"
                  size={14}
                  aria-hidden
                />
                <select
                  value={minRating ?? ''}
                  onChange={(e) =>
                    setMinRating(e.target.value === '' ? null : Number(e.target.value))
                  }
                  className="w-full cursor-pointer appearance-none rounded-lg border border-surface-200/12 bg-surface-900/55 py-2 pr-8 pl-8 text-sm text-surface-200 focus:border-brand-500/45 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {RATING_MIN_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value ?? ''}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-surface-200/40"
                  size={14}
                  aria-hidden
                />
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sortByRatingDesc}
                onClick={() => setSortByRatingDesc(!sortByRatingDesc)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  sortByRatingDesc
                    ? 'border-brand-500/45 bg-brand-500/18 text-brand-100'
                    : 'border-surface-200/12 bg-surface-900/55 text-surface-200/80 hover:border-surface-200/22'
                }`}
              >
                <ArrowDownWideNarrow size={14} aria-hidden />
                Rating tertinggi
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold tracking-widest uppercase text-surface-200/45">
                Kategori
              </p>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategories.has(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-brand-500/55 bg-brand-500/22 text-brand-100'
                          : 'border-surface-200/10 bg-surface-950/50 text-surface-200/75 hover:border-brand-500/28'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold tracking-widest uppercase text-surface-200/45">
                Pengiriman
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = selectedShipping.has(opt.key)
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleShipping(opt.key)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-200'
                          : 'border-surface-200/10 bg-surface-950/50 text-surface-200/75 hover:border-surface-200/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryLabel({
  kategori,
  size = 12,
  className = '',
}: {
  kategori: string
  size?: number
  className?: string
}) {
  const { theme } = useTheme()
  const Icon = getCategoryIcon(kategori)
  const color = getCategoryColor(kategori, theme)
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      style={{ color }}
    >
      <Icon size={size} aria-hidden className="shrink-0" />
      <span className="min-w-0 truncate">{kategori}</span>
    </span>
  )
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

function DetailSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-200/55">
      {children}
    </h4>
  )
}

function StoreDetailBody({
  store,
  onClose,
  embedded = false,
}: {
  store: Store
  onClose: () => void
  /** Tanpa tombol tutup di gambar / kembali bawah; navigasi dari header panel */
  embedded?: boolean
}) {
  const open = isOpenNow(store.jam_operasional)
  const phone = normalizeIndonesiaPhone(store.kontak)
  const today = getTodayDayName()
  const directionsGoogle = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}`
  const directionsApple = `https://maps.apple.com/?daddr=${store.lat},${store.lon}&dirflg=d`
  const jamRows = formatJamOperasionalList(store.jam_operasional)

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* Cover image dengan overlay status */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-200/10 bg-surface-950/50 shadow-lg shadow-black/20">
        <StoreImage
          src={store.url_gambar}
          alt={store.nama_toko}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        />
        {open !== null && (
          <span
            className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur-md ${
              open
                ? 'bg-emerald-500/85 text-white ring-emerald-200/40'
                : 'bg-rose-500/85 text-white ring-rose-200/40'
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                open ? 'bg-emerald-100' : 'bg-rose-100'
              }`}
              aria-hidden
            />
            {open ? 'Buka sekarang' : 'Tutup sekarang'}
          </span>
        )}
        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/70 md:hidden"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Header: nama, kategori, rating */}
      <header className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="heading-md leading-snug text-fg-strong">{store.nama_toko}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-sm font-semibold text-amber-500 ring-1 ring-amber-400/25">
            <Star size={14} className="fill-amber-400" aria-hidden />
            {store.rating.toFixed(1)}
          </span>
        </div>
        <CategoryLabel
          kategori={store.kategori_tokopedia}
          size={14}
          className="text-sm font-semibold"
        />
      </header>

      {/* Alamat */}
      <div className="flex items-start gap-2.5 rounded-xl border border-surface-200/10 bg-surface-950/40 p-3">
        <MapPin
          size={16}
          aria-hidden
          className="mt-0.5 shrink-0 text-brand-400"
        />
        <p className="flex-1 text-sm leading-relaxed text-surface-100/85">
          {store.alamat}
        </p>
      </div>

      {store.deskripsi ? (
        <p className="text-[13px] leading-relaxed text-surface-200/75">
          {store.deskripsi}
        </p>
      ) : null}

      {/* Pengiriman */}
      <section className="space-y-2">
        <DetailSectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} aria-hidden className="text-surface-200/45" />
            Pengiriman
          </span>
        </DetailSectionTitle>
        {shippingTags(store)}
      </section>

      {/* Jadwal operasional */}
      <section className="space-y-2">
        <DetailSectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} aria-hidden className="text-surface-200/45" />
            Jadwal operasional
          </span>
        </DetailSectionTitle>
        <ul className="overflow-hidden rounded-xl border border-surface-200/10 bg-surface-950/40 text-sm">
          {jamRows.map(({ day, text }, i) => {
            const isToday = day === today
            const isClosed = /tutup|libur|closed/i.test(text)
            return (
              <li
                key={day}
                className={`flex items-center justify-between gap-3 px-3 py-2 ${
                  i === 0 ? '' : 'border-t border-surface-200/5'
                } ${isToday ? 'bg-brand-500/10' : ''}`}
              >
                <span
                  className={`flex items-center gap-2 ${
                    isToday
                      ? 'font-semibold text-brand-300'
                      : 'text-surface-200/65'
                  }`}
                >
                  {day}
                  {isToday && (
                    <span className="rounded-full bg-brand-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-200">
                      Hari ini
                    </span>
                  )}
                </span>
                <span
                  className={`text-right tabular-nums ${
                    isClosed
                      ? 'text-rose-300/85'
                      : isToday
                        ? 'font-semibold text-fg-strong'
                        : 'text-surface-100/85'
                  }`}
                >
                  {text}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Aksi */}
      <section className="space-y-2 border-t border-surface-200/10 pt-4">
        <DetailSectionTitle>Aksi</DetailSectionTitle>
        <div className="flex flex-col gap-2">
          <a
            href={store.link_toko}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full justify-center px-4 py-2.5 text-sm"
          >
            <ExternalLink size={16} />
            Kunjungi Tokopedia
          </a>
          <div className="flex gap-2">
            <a
              href={directionsGoogle}
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex-1 justify-center px-3 py-2.5 text-sm"
            >
              <Navigation size={16} />
              Google Maps
            </a>
            <a
              href={directionsApple}
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex-1 justify-center px-3 py-2.5 text-sm"
            >
              <Navigation size={16} />
              Apple Maps
            </a>
          </div>
          {phone && (
            <div className="flex gap-2">
              <a
                href={phone.waHref}
                target="_blank"
                rel="noreferrer"
                className="btn-outline flex-1 justify-center px-3 py-2.5 text-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={phone.telHref}
                className="btn-outline flex-1 justify-center px-3 py-2.5 text-sm"
              >
                <Phone size={16} />
                Telepon
              </a>
            </div>
          )}
        </div>
      </section>

      {!embedded && (
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost w-full py-2 text-sm md:hidden"
        >
          Kembali ke daftar
        </button>
      )}
    </div>
  )
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedShipping, setSelectedShipping] = useState<Set<ShippingKey>>(new Set())
  const [minRating, setMinRating] = useState<number | null>(null)
  const [sortByRatingDesc, setSortByRatingDesc] = useState(false)
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

  const { theme } = useTheme()
  const tileUrl = theme === 'light' ? TILE_LIGHT : TILE_DARK

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-0 flex min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Rail kiri: daftar toko + detail */}
        <aside className="store-rail flex min-h-0 w-full flex-1 flex-col border-t border-surface-200/10 bg-surface-900 shadow-[0_-6px_24px_rgba(0,0,0,0.2)] backdrop-blur-md md:h-full md:w-[min(100%,20rem)] md:flex-none md:border-t-0 md:border-r md:border-surface-200/10 md:shadow-none lg:w-[22rem]">
        {selectedStore ? (
          <>
            <div className="flex shrink-0 items-center gap-2 bg-surface-950 border-b border-surface-200/10 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedStoreId(null)}
                className="flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-sm text-surface-200/90 transition-colors hover:bg-surface-200/10 hover:text-fg-strong"
                aria-label="Kembali ke daftar toko"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <h2 className="min-w-0 flex-1 truncate text-fg-strong">Detail toko</h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <StoreDetailBody
                store={selectedStore}
                embedded
                onClose={() => setSelectedStoreId(null)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between bg-surface-950 gap-2 border-b border-surface-200/10 px-6 py-4">
              <h2 className="flex items-center gap-2 text-fg-strong">
                <StoreIcon size={20} className="text-brand-400 shrink-0" aria-hidden />
                Daftar toko
              </h2>
              <span className="badge-brand self-start text-xs">
                {filteredStores.length} ditampilkan
              </span>
            </div>
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pt-3">
              {filteredStores.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => pickStoreFromList(store)}
                    className={`flex w-full gap-3 rounded-xl border p-3 text-left shadow-sm transition-colors ${
                      selectedStoreId === store.id
                        ? 'border-brand-500/50 bg-brand-500/10 ring-1 ring-brand-500/20'
                        : 'border-surface-200/10 bg-surface-950/50 hover:border-brand-500/35 hover:bg-surface-950/80'
                    }`}
                  >
                    <StoreImage
                      src={store.url_gambar}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="line-clamp-2 font-medium leading-snug text-surface-100">
                        {store.nama_toko}
                      </p>
                      <CategoryLabel
                        kategori={store.kategori_tokopedia}
                        size={12}
                        className="mt-1 max-w-full text-xs font-medium"
                      />
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-yellow-400 dark:text-yellow-500">
                        <Star size={12} className="fill-yellow-400 dark:fill-yellow-500" />
                        {store.rating}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 self-center text-surface-200/35"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

        <div className="relative z-0 min-h-[min(44vh,18rem)] min-w-0 flex-1 md:min-h-0">
          <MapFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCount={filteredStores.length}
            hasFilters={hasFilters}
            clearFilters={clearFilters}
            minRating={minRating}
            setMinRating={setMinRating}
            sortByRatingDesc={sortByRatingDesc}
            setSortByRatingDesc={setSortByRatingDesc}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedShipping={selectedShipping}
            toggleShipping={toggleShipping}
          />
          <div className="geo-map-wrap absolute inset-0 z-0">
            <MapContainer
              center={MAP_CENTER}
              zoom={13}
              className="h-full w-full"
              zoomControl
            >
              <TileLayer
                key={theme}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={tileUrl}
              />
              <InvalidateMapOnTheme theme={theme} />
              <InvalidateMapOnResize />
              <MapFlyTo target={flyTarget} onDone={clearFlyTarget} />
              {filteredStores.map((store) => (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lon]}
                  icon={getCategoryMarkerIcon(store.kategori_tokopedia, theme)}
                  eventHandlers={{
                    click: () => pickStoreFromList(store),
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
                          <h3 className="text-fg-strong font-semibold leading-tight">{store.nama_toko}</h3>
                          <CategoryLabel
                            kategori={store.kategori_tokopedia}
                            size={11}
                            className="mt-1 max-w-full text-[11px] font-medium"
                          />
                          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            {store.rating}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-center text-[11px] text-surface-200/45">
                        Detail di panel kiri
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
