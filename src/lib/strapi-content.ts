/**
 * Записи Strapi → данные сайта прежнего вида (компоненты не меняются) и
 * загрузчики коллекций Astro (src/content.config.ts).
 */
import type { Loader } from 'astro/loaders'
import { strapiFetchAll, strapiImage, type StrapiMedia } from './strapi'
import type { Promo } from '../data/promos'
import { CATALOG_LINKS, CATEGORY_LABELS, OBJECT_TYPE_LABELS, type PortfolioWork, type WorkCategory, type ObjectType } from '../data/portfolio-works'

export interface StrapiPromo {
  documentId: string; title: string; subtitle: string; description?: string | null
  image?: StrapiMedia | null; validUntil: string; discount?: string | null
  ctaText?: string | null; ctaLink?: string | null
}

const opt = (v: string | null | undefined) => v || undefined

export function toPromo(raw: StrapiPromo): Promo {
  const img = raw.image ? strapiImage(raw.image, 800) : undefined
  return {
    id: raw.documentId,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description ?? '',
    image: img?.src,
    imageSrcset: img?.srcset,
    validUntil: raw.validUntil,
    discount: opt(raw.discount),
    ctaText: opt(raw.ctaText),
    ctaLink: opt(raw.ctaLink),
  }
}

/** Загрузчик коллекции из Strapi: забирает всё опубликованное, проверяет по схеме коллекции */
export function strapiLoader<T>(name: string, fetchAll: () => Promise<{ id: string; data: T }[]>): Loader {
  return {
    name,
    async load({ store, parseData, generateDigest, logger }) {
      const entries = await fetchAll()
      store.clear()
      for (const { id, data } of entries) {
        const parsed = await parseData({ id, data: data as Record<string, unknown> })
        store.set({ id, data: parsed, digest: generateDigest(parsed) })
      }
      logger.info(`Strapi: загружено записей: ${entries.length}`)
    },
  }
}

export const promosLoader = () =>
  strapiLoader('strapi-promos', async () =>
    (await strapiFetchAll<StrapiPromo>('promos', { 'populate[image]': 'true', sort: 'validUntil:asc' }))
      .map((raw) => ({ id: raw.documentId, data: toPromo(raw) })))

export interface StrapiWork {
  documentId: string; slug: string; title: string; date: string
  category: string; objectType: string; location?: string | null
  description: string; story?: string | null; model?: string | null; doorCount?: number | null
  features?: { text: string }[] | null; tags?: { text: string }[] | null
  images: StrapiMedia[]; catalogLink?: { section: string; label?: string | null } | null
}

/** Обратный словарь: подпись в Strapi → ключ сайта */
const keyOf = <K extends string>(labels: Record<K, string>, value: string): K => {
  const key = (Object.keys(labels) as K[]).find((k) => labels[k] === value || k === value)
  if (!key) throw new Error(`Strapi: неизвестное значение «${value}»`)
  return key
}
const list = (items?: { text: string }[] | null) => (items?.length ? items.map((i) => i.text) : undefined)

export function toWork(raw: StrapiWork): PortfolioWork {
  if (!raw.images?.length) throw new Error(`Strapi: у работы «${raw.title}» нет фото — добавьте хотя бы одно`)
  const [y, m, d] = raw.date.split('-')
  const link = raw.catalogLink ? CATALOG_LINKS[raw.catalogLink.section] : undefined
  return {
    id: raw.slug,
    date: raw.date,
    label: `${d}.${m}.${y}`,
    title: raw.title,
    description: raw.description,
    category: keyOf<WorkCategory>(CATEGORY_LABELS, raw.category),
    objectType: keyOf<ObjectType>(OBJECT_TYPE_LABELS, raw.objectType),
    location: raw.location ?? '',
    story: raw.story ?? undefined,
    model: raw.model ?? undefined,
    doorCount: raw.doorCount ?? undefined,
    features: list(raw.features),
    tags: list(raw.tags),
    images: raw.images.map((img) => strapiImage(img, 1920).src),
    cover: strapiImage(raw.images[0]!, 960),
    relatedLink: link && { href: link.href, label: raw.catalogLink?.label || link.label },
  }
}

export const worksLoader = () =>
  strapiLoader('strapi-works', async () =>
    (await strapiFetchAll<StrapiWork>('works', { 'populate[images]': 'true', 'populate[features]': 'true', 'populate[tags]': 'true', 'populate[catalogLink]': 'true', sort: 'date:desc' }))
      .map((raw) => ({ id: raw.slug, data: toWork(raw) })))
