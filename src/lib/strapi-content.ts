/**
 * Записи Strapi → данные сайта прежнего вида (компоненты не меняются) и
 * загрузчики коллекций Astro (src/content.config.ts).
 */
import type { Loader } from 'astro/loaders'
import { strapiFetchAll, strapiImage, type StrapiMedia } from './strapi'
import type { Promo } from '../data/promos'

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
