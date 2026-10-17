/**
 * Фильтры, сортировка и счётчики каталога — чистые функции: их вызывает
 * CatalogClient.vue в браузере, а тесты проверяют без Vue.
 */
import type { CatalogCardItem, CatalogSort } from '../components/catalog/types'
import { popularRank } from './popular-series'

/** Порядок покрытий в переключателе и в разделе «Покрытия и серии».
    Экошпон первым: в нём «Урбан Древесный», с которого открывается каталог.
    Новое покрытие, которого здесь нет, встаёт в конец, а не теряется. */
export const COATING_ORDER: readonly string[] = ['ekoshpon', 'emalex', 'emal', 'protach', 'pet']

export function coatingRank(slug: string): number {
  const i = COATING_ORDER.indexOf(slug)
  return i === -1 ? COATING_ORDER.length : i
}

export interface CatalogFilterState {
  series: string
  coating: string
  color: string
  glass: boolean
  query: string
}

export const NO_FILTERS: CatalogFilterState = { series: '', coating: '', color: '', glass: false, query: '' }

export type FacetKey = 'series' | 'coating' | 'color'

/** Карточки под фильтры; except — фильтр, который не применять (для счётчиков его же вариантов) */
export function filterCards(cards: readonly CatalogCardItem[], f: CatalogFilterState, except?: FacetKey): CatalogCardItem[] {
  const query = f.query.trim().toLowerCase()
  return cards.filter((c) =>
    (except === 'series' || !f.series || c.seriesSlug === f.series) &&
    (except === 'coating' || !f.coating || c.coatingSlug === f.coating) &&
    (except === 'color' || !f.color || c.colorNames.includes(f.color)) &&
    (!f.glass || c.hasGlass) &&
    (!query ||
      c.name.toLowerCase().includes(query) ||
      c.series.toLowerCase().includes(query) ||
      c.coating.toLowerCase().includes(query) ||
      c.colorNames.some((n) => n.toLowerCase().includes(query))),
  )
}

/** Сколько моделей у каждого варианта фильтра при остальных выбранных фильтрах */
export function facetCounts(cards: readonly CatalogCardItem[], f: CatalogFilterState, key: FacetKey): Map<string, number> {
  const counts = new Map<string, number>()
  for (const c of filterCards(cards, f, key)) {
    const values = key === 'series' ? [c.seriesSlug] : key === 'coating' ? [c.coatingSlug] : c.colorNames
    for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return counts
}

/* Цена — всегда за полотно (card.price): комплект зависит от цвета и покрытия
   и не задаёт единого порядка. Модели без цены — в конце при любом порядке. */
const byPriceAsc = (a: CatalogCardItem, b: CatalogCardItem) => (a.price ?? Infinity) - (b.price ?? Infinity)
const byPriceDesc = (a: CatalogCardItem, b: CatalogCardItem) => (b.price ?? -Infinity) - (a.price ?? -Infinity)

export function sortCards(cards: readonly CatalogCardItem[], sort: CatalogSort): CatalogCardItem[] {
  const list = [...cards]
  if (sort === 'popular') return list.sort((a, b) => popularRank(a.seriesSlug) - popularRank(b.seriesSlug) || byPriceAsc(a, b))
  if (sort === 'price_asc') return list.sort(byPriceAsc)
  if (sort === 'price_desc') return list.sort(byPriceDesc)
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

/** Яркость цвета #rrggbb (0…1, по восприятию глазом); не цвет — -1 */
function lightness(hex: string | undefined): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex ?? '')
  if (!m) return -1
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/** Порядок кружков в фильтре цвета: от светлых к тёмным — оттенки белого рядом, а не вразброс */
export const byLightness = (a: { color?: string }, b: { color?: string }) => lightness(b.color) - lightness(a.color)
