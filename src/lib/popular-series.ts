/**
 * src/lib/popular-series.ts
 *
 * Порядок каталога по умолчанию (сортировка «Популярные», src/lib/catalog-filter.ts).
 * В Supabase поля под это нет — ключ по series.slug, как у seriesSlug на карточке.
 *
 * LEAD_SERIES_SLUGS открывают каталог: «Урбан Древесный» — самый спрашиваемый
 * сегмент в Москве (решение салона, 17.10.2026). Дальше — POPULAR_SERIES_SLUGS:
 * серии, которые есть на складе или в работе; дешёвые серии под заказ
 * (Некст/Смарт — Протач) при сортировке по цене открывали бы каталог собой.
 *
 * Добавлять/убирать вручную по факту наличия и продаж.
 */
export const LEAD_SERIES_SLUGS: readonly string[] = [
  'urban-drevesnyy', // Урбан Древесный
]

export const POPULAR_SERIES_SLUGS: ReadonlySet<string> = new Set([
  ...LEAD_SERIES_SLUGS,
  'emalex',        // Эмалекс
  'urban',         // Урбан
  'emalex-modern', // Эмалекс Модерн
  'stockholm',     // Стокгольм
  'skinel',        // Скинель
])

/** Место серии в «Популярных»: ведущие — по порядку списка, затем популярные, затем остальные */
export function popularRank(seriesSlug: string): number {
  const lead = LEAD_SERIES_SLUGS.indexOf(seriesSlug)
  if (lead !== -1) return lead
  return LEAD_SERIES_SLUGS.length + (POPULAR_SERIES_SLUGS.has(seriesSlug) ? 0 : 1)
}
