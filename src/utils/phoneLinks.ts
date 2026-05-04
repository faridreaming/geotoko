/** Normalisasi nomor Indonesia untuk tel: / WhatsApp (tanpa + di path wa.me). */
export function normalizeIndonesiaPhone(raw: string): { telHref: string; waHref: string } | null {
  const d = raw.replace(/\D/g, '')
  if (!d) return null

  let national = d
  if (d.startsWith('62')) national = d
  else if (d.startsWith('0')) national = '62' + d.slice(1)
  else if (d.length >= 8) national = '62' + d
  else return null

  return {
    telHref: `tel:+${national}`,
    waHref: `https://wa.me/${national}`,
  }
}
