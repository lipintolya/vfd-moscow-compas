/**
 * Данные для панели «Подбор двери» на первом экране главной.
 * Всё строится из карточек каталога (getCatalogCards) — те же значения,
 * что понимает /catalog/ в URL: ?series=<slug>&coating=<slug>&color=<имя>.
 */
import type { CatalogCardItem } from '../components/catalog/types'
import { getSeriesList } from '../lib/catalog-data'

export interface FinderOption { value: string; label: string }

export interface FinderData {
  series: FinderOption[]
  coatings: FinderOption[]
  colors: FinderOption[]
  /** Компактный срез для подсчёта на клиенте: [серия, покрытие, цвета] */
  rows: [string, string, string[]][]
}

const byCountDesc = (counts: Map<string, number>) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)

export function buildFinder(cards: CatalogCardItem[]): FinderData {
  const series = getSeriesList(cards)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    .map(s => ({ value: s.slug, label: s.name }))

  const coatingNames = new Map<string, string>()
  const coatingCounts = new Map<string, number>()
  const colorCounts = new Map<string, number>()
  for (const c of cards) {
    if (c.coatingSlug) {
      coatingNames.set(c.coatingSlug, c.coating)
      coatingCounts.set(c.coatingSlug, (coatingCounts.get(c.coatingSlug) ?? 0) + 1)
    }
    for (const name of c.colorNames) colorCounts.set(name, (colorCounts.get(name) ?? 0) + 1)
  }

  return {
    series,
    coatings: byCountDesc(coatingCounts).map(slug => ({ value: slug, label: coatingNames.get(slug)! })),
    colors: byCountDesc(colorCounts).map(name => ({ value: name, label: name })),
    rows: cards.map(c => [c.seriesSlug, c.coatingSlug, c.colorNames]),
  }
}
