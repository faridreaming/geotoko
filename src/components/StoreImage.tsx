import { resolveStoreImageSrc } from '../constants/storeImageUrls'

/**
 * Gambar toko: nama file mengacu ke `src/assets/stores/` (lihat `storeImageUrls.ts`).
 * URL https eksternal tetap didukung; untuk CDN Tokopedia, `referrerPolicy`
 * membantu jika server menolak hotlink.
 */
export default function StoreImage({
  src,
  alt,
  className,
  loading,
}: {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const resolved = resolveStoreImageSrc(src)
  const external = /^https?:\/\//i.test(src.trim())

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy={external ? 'no-referrer' : undefined}
      decoding="async"
    />
  )
}
