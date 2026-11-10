/**
 * src/lib/promo-dates.ts
 * Общая логика «активна/истекла» и «сколько осталось» для акций — блок
 * акций (components/home/Promo.astro: главная и /offers/), /offers/archive/,
 * меню и /llms.txt считают одним кодом, чтобы не разойтись.
 */
import { pluralRu } from './plural'

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

/** Сегодня в Москве, YYYY-MM-DD: салон московский, срок акции — по его дню,
    а не по часам посетителя из другого пояса */
export const moscowToday = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

/** Сколько полных дней до последнего дня акции; 0 — сегодня последний, меньше — истекла */
export const daysLeft = (validUntil: string, today: string): number => {
  const day = (s: string) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y!, (m || 1) - 1, d || 1) }
  return Math.round((day(validUntil) - day(today)) / 86_400_000)
}

/** «Осталось 5 дней», «Остался 21 день», «Последний день»; истекла — пусто */
export const daysLeftLabel = (validUntil: string, today: string): string => {
  const n = daysLeft(validUntil, today)
  if (n < 0) return ''
  if (n === 0) return 'Последний день'
  const word = pluralRu(n, ['день', 'дня', 'дней'])
  return `${word === 'день' ? 'Остался' : 'Осталось'} ${n}\u00a0${word}`
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
const sortPromos = <T extends { validUntil: string; order: number; title: string }>(promos: readonly T[]): T[] =>
  [...promos].sort((a, b) => a.order - b.order || a.validUntil.localeCompare(b.validUntil) || a.title.localeCompare(b.title, 'ru'))

/** Действующие акции в порядке показа. Одно место для главной, /offers/, шапки
    и подвала — списки не расходятся. */
export const activePromos = <T extends { validUntil: string; order: number; title: string }>(promos: readonly T[], now: Date = new Date()): T[] =>
  sortPromos(promos.filter((p) => isPromoActive(p.validUntil, now)))
