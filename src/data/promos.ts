/**
 * src/data/promos.ts
 *
 * Акции ведутся в Strapi (раздел «Акции», npm run cms); сайт читает их при
 * сборке в коллекцию promos (src/content.config.ts,
 * src/lib/strapi-content.ts). Здесь — тип для компонентов.
 *
 * Блок Promo.vue на главной и /akcii/ показывают активные (validUntil ещё
 * не прошёл), /promo-archive/ — истёкшие: дата решает, переносить вручную
 * не нужно.
 */

export interface Promo {
  /** documentId записи в Strapi */
  id:            string
  title:         string
  subtitle:      string
  description:   string
  /** Уменьшенная копия Strapi под карточку; без фото карточка — только текст */
  image?:        string
  /** Все копии Strapi (srcset) — браузер берёт подходящую под экран */
  imageSrcset?:  string
  ctaText?:      string
  ctaLink?:      string
  discount?:     string
  /** Последний день акции, YYYY-MM-DD (включительно) */
  validUntil:    string
}
