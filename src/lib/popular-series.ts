/**
 * src/lib/popular-series.ts
 *
 * Серии, помеченные бейджем «Выбор покупателей» в каталоге и влияющие на
 * дефолтную сортировку (см. CatalogClient.vue, sort 'popular'). В Supabase
 * нет поля под это — ключ по series.slug, как у coatingSlug/seriesSlug на
 * карточке.
 *
 * Смысл: дефолтная сортировка «по цене» выводит вперёд самые дешёвые серии
 * (Некст/Смарт/Штрих — Протач), а их сейчас нет в наличии — салону выгоднее
 * вести дефолтный вид на серии, которые реально есть на складе/в работе.
 *
 * Добавлять/убирать вручную по факту наличия и продаж.
 */
export const POPULAR_SERIES_SLUGS: ReadonlySet<string> = new Set([
  'emalex',        // Эмалекс
  'urban',         // Урбан
  'emalex-modern', // Эмалекс Модерн
  'stockholm',     // Стокгольм
  'skinel',        // Скинель
])

export const isPopularSeries = (seriesSlug: string): boolean => POPULAR_SERIES_SLUGS.has(seriesSlug)
