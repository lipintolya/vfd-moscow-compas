/**
 * src/lib/promo-dates.ts
 * Общая логика "активна/истекла" для акций — используется и Promo.vue
 * (главная, активные), и /promo-archive (истёкшие), чтобы не разойтись.
 */

export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export const isPromoActive = (validUntil: string, now: Date = new Date()): boolean => {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const deadline = parseLocalDate(validUntil)
  deadline.setHours(23, 59, 59, 999)
  return today <= deadline
}

export const getDaysLeft = (validUntil: string, now: Date = new Date()): number => {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const deadline = parseLocalDate(validUntil)
  deadline.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export const formatDate = (dateStr: string): string => {
  /* «31 декабря 2026 г.» → «31 декабря 2026 года»: в середине фразы не остаётся
     «г.» с точкой (после неё предложение давало «г..») */
  return parseLocalDate(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).replace(/\s*г\.$/, ' года')
}

/** Порядок показа: по «Порядку на сайте», затем по сроку, затем по названию */
export const sortPromos = <T extends { validUntil: string; order: number; title: string }>(promos: readonly T[]): T[] =>
  [...promos].sort((a, b) => a.order - b.order || a.validUntil.localeCompare(b.validUntil) || a.title.localeCompare(b.title, 'ru'))

/** Действующие акции в порядке показа. Одно место для главной, /akcii/, шапки
    и подвала — списки не расходятся. */
export const activePromos = <T extends { validUntil: string; order: number; title: string }>(promos: readonly T[], now: Date = new Date()): T[] =>
  sortPromos(promos.filter((p) => isPromoActive(p.validUntil, now)))
