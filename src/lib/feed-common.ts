/**
 * Общее для товарных фидов (YML): Яндекс Товары (pages/feed/yandex.xml.ts)
 * и VK Маркет (pages/feed/vk.xml.ts). Оба берут товары из одной базы
 * (lib/model-entries), поэтому цена, фото и наличие совпадают с сайтом.
 */
import type { ModelEntry } from './model-entries'
import { isMadeToOrder } from './made-to-order'

export const ROOT_CATEGORY_ID = 1
export const ROOT_CATEGORY_NAME = 'Межкомнатные двери'

/* id категорий — постоянные: площадки привязывают к ним товары между
   обновлениями фида. Покрытие, которого здесь нет (новое в базе), уходит
   в корневую категорию — фид остаётся валидным; тогда добавить id сюда. */
export const COATING_CATEGORY_IDS: Record<string, number> = {
  pet:      11,
  emal:     12,
  emalex:   13,
  protach:  14,
  ekoshpon: 15,
}

export const MAX_PICTURES = 10

export const xml = (s: string | number) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

/** UUID модели без дефисов, первые 20 символов — постоянный и уникальный. */
export const offerId = (modelId: string) => modelId.replaceAll('-', '').slice(0, 20)

/** RFC 3339 с часовым поясом Москвы (UTC+5, без перехода на летнее время). */
export function feedDate(): string {
  const local = new Date(Date.now() + 5 * 60 * 60 * 1000)
  return `${local.toISOString().slice(0, 19)}+05:00`
}

/** В наличии, если хоть один цвет модели не «под заказ» (как бейдж на сайте). */
export const isAvailable = (e: ModelEntry) =>
  e.colors.some(c => !isMadeToOrder(e.seriesSlug, e.model.id, c.name))

/** Модели, которые можно отдать площадке: есть цена и хотя бы одно фото. */
export const feedOffers = (entries: ModelEntry[]) =>
  entries.filter(e => e.minPrice && e.colors.length > 0)

/** Проверка: id офферов должны быть уникальны, иначе площадка склеит товары. */
export function assertUniqueIds(offers: ModelEntry[], feed: string) {
  const ids = new Set(offers.map(e => offerId(e.model.id)))
  if (ids.size !== offers.length) {
    throw new Error(`[${feed}] совпали id офферов — нужен другой способ сокращения UUID`)
  }
}

/** Категории YML: корень и покрытия, в которых есть товары. */
export function categoriesXml(offers: ModelEntry[], coatingName: (e: ModelEntry) => string): string[] {
  const used = [...new Map(
    offers
      .filter(e => COATING_CATEGORY_IDS[e.coatingSlug])
      .map(e => [e.coatingSlug, e] as const),
  ).values()]
  return [
    `      <category id="${ROOT_CATEGORY_ID}">${xml(ROOT_CATEGORY_NAME)}</category>`,
    ...used
      .sort((a, b) => COATING_CATEGORY_IDS[a.coatingSlug]! - COATING_CATEGORY_IDS[b.coatingSlug]!)
      .map(e =>
        `      <category id="${COATING_CATEGORY_IDS[e.coatingSlug]}" parentId="${ROOT_CATEGORY_ID}">${xml(`${ROOT_CATEGORY_NAME} ${coatingName(e)}`)}</category>`),
  ]
}
