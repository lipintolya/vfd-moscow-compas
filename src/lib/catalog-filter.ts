/**
 * Фильтры, сортировка и счётчики каталога — чистые функции: их вызывает
 * CatalogClient.vue в браузере, а тесты проверяют без Vue.
 */
import type { CatalogCardItem, CatalogSort } from '../components/catalog/types'
import { popularRank } from './popular-series'
import { rub } from '../data/services'
import { COLOR_FAMILIES, type ColorFamilySlug } from '../data/color-families'

/** Порядок покрытий в переключателе и в разделе «Покрытия и серии».
    Экошпон первым: в нём «Урбан Древесный», с которого открывается каталог.
    Новое покрытие, которого здесь нет, встаёт в конец, а не теряется. */
export const COATING_ORDER: readonly string[] = ['ekoshpon', 'emalex', 'emal', 'protach', 'pet']

export function coatingRank(slug: string): number {
  const i = COATING_ORDER.indexOf(slug)
  return i === -1 ? COATING_ORDER.length : i
}

export interface CatalogFilterState {
  /** Покрытие — один вариант: выбирается карточками покрытий над каталогом */
  coating: string
  /** Остальные — несколько вариантов: внутри фильтра «или», между фильтрами «и» */
  series: string[]
  colors: ColorFamilySlug[]
  prices: string[]
  glass: GlassOption[]
}

export const NO_FILTERS: CatalogFilterState = { coating: '', series: [], colors: [], prices: [], glass: [] }

export type FacetKey = 'coating' | 'series' | 'colors' | 'prices' | 'glass'

/** Диапазоны цены за полотно; границы — по ценам каталога: до 10 тыс. —
    Протач и Эмалекс, 10–15 тыс. — основная часть эмали, дороже — экошпон и ПЭТ */
export const PRICE_BUCKETS: readonly { slug: string; label: string; min?: number; max?: number }[] = [
  { slug: 'do-10000',    label: `до ${rub(10000)}`,             max: 10000 },
  { slug: '10000-15000', label: `${rub(10000)} – ${rub(15000)}`, min: 10000, max: 15000 },
  { slug: 'ot-15000',    label: `от ${rub(15000)}`,             min: 15000 },
]

export type GlassOption = 'with' | 'without'
export const GLASS_OPTIONS: readonly { slug: GlassOption; label: string }[] = [
  { slug: 'without', label: 'Без стекла' },
  { slug: 'with',    label: 'Со стеклом' },
]

const inBucket = (price: number | null, slug: string) => {
  const b = PRICE_BUCKETS.find((x) => x.slug === slug)
  return !!b && price != null && price >= (b.min ?? 0) && price < (b.max ?? Infinity)
}

const pass: { [K in FacetKey]: (c: CatalogCardItem, f: CatalogFilterState) => boolean } = {
  coating: (c, f) => !f.coating || c.coatingSlug === f.coating,
  series:  (c, f) => !f.series.length || f.series.includes(c.seriesSlug),
  colors:  (c, f) => !f.colors.length || c.colorFamilies.some((fam) => f.colors.includes(fam)),
  prices:  (c, f) => !f.prices.length || f.prices.some((slug) => inBucket(c.price, slug)),
  glass:   (c, f) => !f.glass.length || f.glass.includes(c.hasGlass ? 'with' : 'without'),
}
const FACETS = Object.keys(pass) as FacetKey[]

/** Карточки под фильтры; except — фильтр, который не применять (для вариантов этого же фильтра) */
export function filterCards(cards: readonly CatalogCardItem[], f: CatalogFilterState, except?: FacetKey): CatalogCardItem[] {
  return cards.filter((c) => FACETS.every((key) => key === except || pass[key](c, f)))
}

/** Сколько моделей у каждого варианта фильтра при остальных выбранных фильтрах */
export function facetCounts(cards: readonly CatalogCardItem[], f: CatalogFilterState, key: FacetKey): Map<string, number> {
  const counts = new Map<string, number>()
  const valuesOf: Record<FacetKey, (c: CatalogCardItem) => string[]> = {
    coating: (c) => [c.coatingSlug],
    series:  (c) => [c.seriesSlug],
    colors:  (c) => c.colorFamilies,
    prices:  (c) => PRICE_BUCKETS.filter((b) => inBucket(c.price, b.slug)).map((b) => b.slug),
    glass:   (c) => [c.hasGlass ? 'with' : 'without'],
  }
  for (const c of filterCards(cards, f, key)) {
    for (const v of valuesOf[key](c)) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return counts
}

/* ── Фильтры в адресе: ?coating=emal&series=skinel,winter&color=white&price=do-10000&glass=with ── */
const list = (value: string | null) => (value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [])

/** familyOfColor — группа по точному названию цвета: старые ссылки вели на ?color=<название> */
export function parseFilterParams(params: URLSearchParams, familyOfColor: (name: string) => ColorFamilySlug | null): CatalogFilterState {
  const families = new Set(COLOR_FAMILIES.map((f) => f.slug as string))
  const colors = list(params.get('color'))
    .map((v) => (families.has(v) ? (v as ColorFamilySlug) : familyOfColor(v)))
    .filter((v): v is ColorFamilySlug => v !== null)
  const glassParam = params.get('glass') === '1' ? ['with'] : list(params.get('glass'))
  return {
    coating: params.get('coating') ?? '',
    series: list(params.get('series')),
    colors: [...new Set(colors)],
    prices: list(params.get('price')).filter((v) => PRICE_BUCKETS.some((b) => b.slug === v)),
    glass: glassParam.filter((v): v is GlassOption => GLASS_OPTIONS.some((g) => g.slug === v)),
  }
}

export function filterParamsString(f: CatalogFilterState): string {
  const params = new URLSearchParams()
  if (f.coating) params.set('coating', f.coating)
  if (f.series.length) params.set('series', f.series.join(','))
  if (f.colors.length) params.set('color', f.colors.join(','))
  if (f.prices.length) params.set('price', f.prices.join(','))
  if (f.glass.length) params.set('glass', f.glass.join(','))
  return params.toString().replaceAll('%2C', ',')
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
