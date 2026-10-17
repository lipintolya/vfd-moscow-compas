/** Яркость цвета #rrggbb по восприятию глазом (0 — чёрный, 1 — белый); не цвет — -1 */
export function hexLightness(hex: string | null | undefined): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((hex ?? '').trim())
  if (!m) return -1
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
