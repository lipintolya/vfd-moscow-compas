/**
 * src/data/promos.ts
 *
 * Акции ведутся в Strapi (раздел «Акции», npm run cms); сайт читает их при
 * сборке в коллекцию promos (src/content.config.ts,
 * src/lib/strapi-content.ts). Здесь — тип для компонентов.
 *
 * Блок Promo.astro на главной и /offers/ показывают активные (validUntil ещё
 * не прошёл), /offers/archive/ — истёкшие: дата решает, переносить вручную
 * не нужно.
 */

export interface Promo {
  /** documentId записи в Strapi */
  id:            string
  /** Адрес акции в ссылке: /offers/#<slug>. Латиница; в Strapi пусто — offer-<порядок> */
  slug:          string
  title:         string
  subtitle:      string
  description:   string
  /** Уменьшенная копия Strapi под карточку; без фото карточка — только текст */
  image?:        string
  /** Все копии Strapi (srcset) — браузер берёт подходящую под экран */
  imageSrcset?:  string
  /** Размер выбранной копии — баннер показывается целиком, по своим пропорциям */
  imageWidth?:   number
  imageHeight?:  number
  /** «Что на фото» из медиатеки Strapi; пусто — подписью служит название акции */
  imageAlt?:     string
  ctaText?:      string
  ctaLink?:      string
  discount?:     string
  /** Последний день акции, YYYY-MM-DD (включительно) */
  validUntil:    string
  /** Порядок на сайте: меньше — выше; первая акция списка показывается крупно */
  order:         number
}
