/** Titik asal animasi clip-path lingkaran (View Transitions), dalam persen viewport. */
export function setViewTransitionOrigin(
  e?: Pick<MouseEvent, 'clientX' | 'clientY'> | null,
): void {
  const root = document.documentElement
  if (e == null || !Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) {
    root.style.removeProperty('--vt-cx')
    root.style.removeProperty('--vt-cy')
    return
  }
  const { innerWidth: w, innerHeight: h } = window
  if (w <= 0 || h <= 0) return
  root.style.setProperty('--vt-cx', `${(e.clientX / w) * 100}%`)
  root.style.setProperty('--vt-cy', `${(e.clientY / h) * 100}%`)
}
