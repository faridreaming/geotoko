const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

export function getTodayDayName(): (typeof DAYS_ID)[number] {
  return DAYS_ID[new Date().getDay()]
}

export function parseJamOperasional(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of text.split('\n')) {
    const m = line.match(
      /^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)\s*:\s*(.+)$/i,
    )
    if (m) map.set(m[1], m[2].trim())
  }
  return map
}

function parseOpenCloseMinutes(range: string): { open: number; close: number } | null {
  const m = range.match(
    /(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/,
  )
  if (!m) return null
  const open = parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
  const close = parseInt(m[3], 10) * 60 + parseInt(m[4], 10)
  return { open, close }
}

/**
 * Apakah toko sedang buka (berdasarkan jam lokal perangkat). `null` jika tidak bisa ditentukan.
 */
export function isOpenNow(jamOperasional: string): boolean | null {
  const today = getTodayDayName()
  const schedule = parseJamOperasional(jamOperasional)
  const entry = schedule.get(today)
  if (!entry) return null
  if (/tutup|libur|closed|istirahat\s*tetap/i.test(entry)) return false

  const times = parseOpenCloseMinutes(entry)
  if (!times) return null

  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()

  if (times.close < times.open) {
    return mins >= times.open || mins < times.close
  }
  return mins >= times.open && mins < times.close
}

export function formatJamOperasionalList(jamOperasional: string): { day: string; text: string }[] {
  const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const map = parseJamOperasional(jamOperasional)
  return order.map((day) => ({
    day,
    text: map.get(day) ?? '-',
  }))
}
