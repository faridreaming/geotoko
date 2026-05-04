import {
  Compass, Map, Filter, Truck, User, Briefcase, GraduationCap,
  Star, Store, LayoutGrid, MapPin, ArrowRight, Check,
} from 'lucide-react'
import { STORE_DATA } from '../constants/stores'
import { useViewTransitionNavigate } from '../App'
import biodataImg from '../assets/biodata.jpg'
import heroImg from '../assets/hero.jpeg'

const uniqueCategories = [...new Set(STORE_DATA.map((s) => s.kategori_tokopedia))]
const avgRating = (STORE_DATA.reduce((s, t) => s + t.rating, 0) / STORE_DATA.length).toFixed(1)

export default function LandingPage() {
  const navigate = useViewTransitionNavigate()

  return (
    <main className="min-h-screen">
      {/* ═══════════════ HERO ═══════════════ */}
      <section id="hero" className="relative flex min-h-screen items-center overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-brand-500/10 blur-[120px]" />
          <div
            className="hero-mesh absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute top-20 left-[15%] h-2 w-2 rounded-full bg-brand-400/40 animate-pulse" />
          <div className="absolute top-40 right-[20%] h-3 w-3 rounded-full bg-brand-300/30 animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-32 left-[30%] h-2 w-2 rounded-full bg-brand-500/30 animate-pulse [animation-delay:0.5s]" />
        </div>

        <div className="section-container relative z-10 py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Text content */}
            <div className="text-center lg:text-left">
              <div data-aos="fade-up" className="mb-6 flex justify-center lg:justify-start">
                <span className="badge-brand">
                  <Compass size={14} />
                  Eksplorasi Toko di Peta
                </span>
              </div>

              <h1 data-aos="fade-up" data-aos-delay="100" className="heading-xl text-fg-strong mb-6">
                Temukan Toko{' '}
                <span className="text-gradient">Tokopedia</span>
                <br />
                di Kota Medan
              </h1>

              <p data-aos="fade-up" data-aos-delay="200" className="max-w-xl text-lg text-muted leading-relaxed mb-10 mx-auto lg:mx-0">
                Jelajahi sebaran toko-toko Tokopedia secara visual melalui peta interaktif.
                Filter berdasarkan kategori dan jenis pengiriman.
              </p>

              <div data-aos="fade-up" data-aos-delay="300" className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <button
                  type="button"
                  onClick={(e) => navigate('/map', e)}
                  className="btn-primary cursor-pointer px-8 py-3.5 text-base"
                >
                  <Map size={20} />
                  Jelajahi Peta
                </button>
                <a href="#about" className="btn-outline text-base">
                  Tentang Saya
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right — Hero image placeholder */}
            <div data-aos="fade-left" data-aos-delay="400" className="flex justify-center lg:justify-end">
              <img
                src={heroImg}
                alt="Peta Toko Tokopedia Medan"
                className="aspect-[4/3] w-full max-w-lg rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>

          {/* Stats */}
          <div data-aos="fade-up" data-aos-delay="500" className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-6">
            {[
              { icon: <Store size={20} />, value: STORE_DATA.length, label: 'Total Toko' },
              { icon: <LayoutGrid size={20} />, value: uniqueCategories.length, label: 'Kategori' },
              { icon: <Star size={20} />, value: `${avgRating}★`, label: 'Rata-rata Rating' },
            ].map((stat) => (
              <div key={stat.label} className="glass px-4 py-5 text-center">
                <div className="mb-2 flex justify-center text-brand-400">{stat.icon}</div>
                <div className="text-2xl font-bold text-fg-strong sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="relative py-24">
        <div className="section-container">
          <div data-aos="fade-up" className="mb-16 text-center">
            <h2 className="heading-lg text-fg-strong mb-4">Fitur Utama</h2>
            <p className="text-muted max-w-lg mx-auto">
              Semua yang kamu butuhkan untuk menemukan toko terbaik di sekitarmu.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Map size={24} />, title: 'Peta Interaktif', desc: 'Lihat lokasi setiap toko langsung pada peta dengan marker yang informatif.' },
              { icon: <Filter size={24} />, title: 'Filter Kategori', desc: 'Saring toko berdasarkan kategori produk dan jenis pengiriman.' },
              { icon: <Truck size={24} />, title: 'Info Pengiriman', desc: 'Ketahui opsi pengiriman: Instant, Same Day, Reguler, Kargo.' },
            ].map((feat, i) => (
              <div
                key={feat.title}
                data-aos="fade-up"
                data-aos-delay={String(i * 150)}
                className="card-hover group p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition-colors duration-300 group-hover:bg-brand-500/20">
                  {feat.icon}
                </div>
                <h3 className="heading-md text-fg-strong mb-2">{feat.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SHOWCASE / PREVIEW ═══════════════ */}
      <section id="showcase" className="relative py-24">
        <div className="section-container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Screenshot placeholder */}
            <div data-aos="fade-right">
              {/* PLACEHOLDER: Ganti dengan screenshot peta */}
              <div className="img-placeholder aspect-video w-full flex-col gap-3 p-8">
                <MapPin size={48} strokeWidth={1.5} />
                <span className="text-sm font-medium">Screenshot Peta</span>
                <span className="text-xs opacity-60">Ganti dengan screenshot aplikasi</span>
              </div>
            </div>

            {/* Right — Description */}
            <div data-aos="fade-left" data-aos-delay="200">
              <span className="badge-brand mb-4 inline-flex">
                <MapPin size={14} />
                Visualisasi Data
              </span>
              <h2 className="heading-lg text-fg-strong mb-4">
                Peta Interaktif dengan Data Toko Real
              </h2>
              <p className="text-muted mb-6 leading-relaxed">
                Lihat {STORE_DATA.length} toko Tokopedia di Kota Medan yang ditampilkan pada
                peta interaktif. Setiap marker menampilkan informasi lengkap: nama toko,
                kategori, alamat, rating, dan jenis pengiriman yang tersedia.
              </p>
              <ul className="space-y-3 text-sm text-surface-200/70">
                {[
                  'Filter berdasarkan kategori produk',
                  'Filter berdasarkan jenis pengiriman',
                  'Popup detail untuk setiap toko',
                  'Dark-mode map yang nyaman dilihat',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT / BIODATA ═══════════════ */}
      <section id="about" className="relative border-t border-surface-200/10 py-24">
        <div className="section-container">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
              {/* Profile image placeholder */}
              <div data-aos="zoom-in">
                <img
                  src={biodataImg}
                  alt="Muhammad Farid Yamin"
                  className="mx-auto h-48 w-48 rounded-full object-cover ring-2 ring-brand-500/30 ring-offset-2 ring-offset-surface-900 md:h-56 md:w-56"
                />
              </div>

              {/* Bio info */}
              <div data-aos="fade-left" data-aos-delay="200" className="text-center md:text-left">
                <span className="badge-brand mb-4 inline-flex">Dibuat oleh</span>
                <h2 className="heading-lg text-fg-strong mb-2">Muhammad Farid Yamin</h2>
                <p className="text-brand-400 font-medium mb-2">Frontend Developer</p>
                <p className="text-muted mb-6">
                  Mahasiswa TRPL — Politeknik Negeri Medan (Polmed)
                </p>

                <div className="glass inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-4 text-sm text-surface-200/70 md:justify-start">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-brand-400" />
                    Muhammad Farid Yamin
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-brand-400" />
                    Frontend Developer
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-brand-400" />
                    Mahasiswa TRPL Polmed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-surface-200/10 py-8">
        <div className="section-container text-center text-xs text-muted">
          © {new Date().getFullYear()} Geotoko — Muhammad Farid Yamin. Semua hak dilindungi.
        </div>
      </footer>
    </main>
  )
}
