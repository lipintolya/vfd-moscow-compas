/**
 * Записи Strapi → данные сайта прежнего вида (компоненты не меняются) и
 * загрузчики коллекций Astro (src/content.config.ts).
 */
import type { Loader } from 'astro/loaders'
import { strapiFetchAll, strapiImage, type StrapiMedia } from './strapi'
import type { Promo } from '../data/promos'
import { toSiteBlocks, safeUrl, type StrapiBlock } from './article-blocks'
import { fillSubstitutions } from './article-substitutions'
import { ARTICLE_CATALOG_PAGES } from '../data/article-catalog-pages'
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
    ctaLink: raw.ctaLink ? safeUrl(raw.ctaLink, `Акция «${raw.title}»`) : undefined,
  }
}

/** Загрузчик коллекции из Strapi: забирает всё опубликованное, проверяет по схеме коллекции */
export function strapiLoader<T>(name: string, fetchAll: () => Promise<{ id: string; data: T; body?: string }[]>): Loader {
  return {
    name,
    async load({ store, parseData, generateDigest, logger }) {
      const entries = await fetchAll()
      store.clear()
      for (const { id, data, body } of entries) {
        const parsed = await parseData({ id, data: data as Record<string, unknown> })
        store.set({ id, data: parsed, body, digest: generateDigest(parsed) })
      }
      logger.info(`Strapi: загружено записей: ${entries.length}`)
    },
  }
}

/** Запросы к Strapi — одни для сборки и проверки перед публикацией (scripts/check-content.ts) */
export const PROMO_QUERY = { 'populate[image]': 'true', sort: 'validUntil:asc' }

export const promosLoader = () =>
  strapiLoader('strapi-promos', async () =>
    (await strapiFetchAll<StrapiPromo>('promos', PROMO_QUERY))
      .map((raw) => ({ id: raw.documentId, data: toPromo(raw) })))

export interface StrapiWork {
  documentId: string; slug: string; title: string; date: string
  category: string; objectType: string; location?: string | null
  description: string; story?: string | null; model?: string | null; doorCount?: number | null
  features?: { text: string }[] | null; tags?: { text: string }[] | null
  images: StrapiMedia[]; catalogLink?: { section: string; label?: string | null } | null
  metaTitle?: string | null
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
    /* «Что на фото» — из медиатеки; без него — название и номер */
    alts: raw.images.map((img, i) => img.alternativeText || `${raw.title} — фото ${i + 1}`),
    metaTitle: opt(raw.metaTitle),
    cover: strapiImage(raw.images[0]!, 960),
    relatedLink: link && { href: link.href, label: raw.catalogLink?.label || link.label },
  }
}

export const WORK_QUERY = { 'populate[images]': 'true', 'populate[features]': 'true', 'populate[tags]': 'true', 'populate[catalogLink]': 'true', sort: 'date:desc' }

export const worksLoader = () =>
  strapiLoader('strapi-works', async () =>
    (await strapiFetchAll<StrapiWork>('works', WORK_QUERY))
      .map((raw) => ({ id: raw.slug, data: toWork(raw) })))

export interface StrapiArticle {
  documentId: string; slug: string; title: string; kind: string; publishDate: string; updatedDate?: string | null
  cover: StrapiMedia; coverAlt?: string | null; description: string
  summary?: { text: string }[] | null; keywords?: { text: string }[] | null; faq?: { q: string; a: string }[] | null
  body: StrapiBlock[]
  related?: { slug: string }[] | null
  seo?: {
    metaTitle?: string | null; steps?: { name: string; text: string }[] | null; coatings?: { coating: string }[] | null
    series?: { series: string }[] | null; pages?: { page: string }[] | null
    author?: { name: string; role: string; href: string; photo?: StrapiMedia | null; linkLabel?: string | null; type?: string | null } | null
    spotlight?: { label: string; lead?: string | null; image: StrapiMedia; imageAlt?: string | null; video?: StrapiMedia | null; poster?: StrapiMedia | null; videoTitle?: string | null; points?: { text: string }[] | null } | null
  } | null
}

/** Покрытие в Strapi → coatingSlug каталога (src/data/door-categories.ts) */
const COATING_SLUG: Record<string, string> = { 'ПЭТ': 'pet', 'Эмаль': 'emal', 'Эмалекс': 'emalex', 'Протач': 'protach', 'Экошпон': 'ekoshpon' }

/** Статья Strapi → данные коллекции articles (прежние поля шапки статьи +
    готовые блоки, оглавление) и body — текст для «мин чтения», как раньше */
export function toArticle(raw: StrapiArticle) {
  const where = `Статья «${raw.title}»`
  if (!raw.body?.length) throw new Error(`${where}: нет текста статьи`)
  const fill = (s: string) => fillSubstitutions(s, where)
  const { blocks, headings, text } = toSiteBlocks(raw.body, where)
  const seo = raw.seo ?? {}
  const texts = (items?: { text: string }[] | null) => (items?.length ? items.map((i) => i.text) : undefined)
  const spot = seo.spotlight
  const spotImage = spot ? strapiImage(spot.image, 960) : undefined
  /* «Что на обложке» пусто — описание из медиатеки */
  const coverAlt = raw.coverAlt || raw.cover.alternativeText || ''
  const pages = seo.pages?.map(({ page }) => {
    const path = ARTICLE_CATALOG_PAGES[page]
    if (!path) throw new Error(`${where}: неизвестная страница каталога «${page}» — список в src/data/article-catalog-pages.ts`)
    return path
  })
  return {
    id: raw.slug,
    body: text,
    data: {
      title: raw.title,
      metaTitle: seo.metaTitle ?? undefined,
      description: fill(raw.description),
      summary: texts(raw.summary)?.map(fill),
      keywords: texts(raw.keywords),
      steps: seo.steps?.length ? seo.steps.map((s) => ({ name: s.name, text: s.text })) : undefined,
      author: seo.author ? {
        name: seo.author.name, role: seo.author.role, href: safeUrl(seo.author.href, where),
        photo: seo.author.photo ? strapiImage(seo.author.photo, 256).src : undefined,
        linkLabel: seo.author.linkLabel ?? undefined,
        type: seo.author.type === 'Человек' ? 'person' as const : 'organization' as const,
      } : undefined,
      kind: raw.kind === 'Публикация' ? 'publication' as const : 'article' as const,
      publishDate: raw.publishDate,
      updatedDate: raw.updatedDate ?? undefined,
      coverImage: strapiImage(raw.cover, 1920).src,
      coverImageAlt: coverAlt,
      cover: { ...strapiImage(raw.cover, 1280), alt: coverAlt },
      faq: raw.faq?.length ? raw.faq.map((f) => ({ q: fill(f.q), a: fill(f.a) })) : undefined,
      relatedSeriesSlugs: seo.series?.length ? seo.series.map((s) => s.series) : undefined,
      relatedCoatings: seo.coatings?.length ? seo.coatings.map((c) => {
        const slug = COATING_SLUG[c.coating]
        if (!slug) throw new Error(`${where}: неизвестное покрытие «${c.coating}»`)
        return slug
      }) : undefined,
      relatedPages: pages?.length ? pages : undefined,
      related: raw.related?.length ? raw.related.map((r) => r.slug) : undefined,
      spotlight: spot && spotImage ? {
        label: spot.label, lead: spot.lead ?? undefined, image: spotImage.src, imageSrcset: spotImage.srcset, imageAlt: spot.imageAlt || spot.image.alternativeText || '',
        video: spot.video?.url, poster: spot.poster ? strapiImage(spot.poster, 960).src : undefined,
        videoTitle: spot.videoTitle ?? undefined, points: texts(spot.points),
      } : undefined,
      blocks,
      headings,
    },
  }
}

const ALL = '*'
export const ARTICLE_QUERY = {
  'populate[cover]': 'true', 'populate[summary]': 'true', 'populate[keywords]': 'true', 'populate[faq]': 'true',
  'populate[body][on][article.text][populate]': ALL,
  'populate[body][on][article.photo][populate]': ALL,
  'populate[body][on][article.gallery][populate][photos][populate]': ALL,
  'populate[body][on][article.callout][populate]': ALL,
  'populate[body][on][article.video][populate]': ALL,
  'populate[body][on][article.table][populate]': ALL,
  'populate[body][on][article.hidden-prices][populate]': ALL,
  'populate[body][on][article.coating-prices][populate]': ALL,
  'populate[seo][populate][steps]': 'true', 'populate[seo][populate][coatings]': 'true',
  'populate[seo][populate][series]': 'true', 'populate[seo][populate][pages]': 'true',
  'populate[related][fields][0]': 'slug',
  'populate[seo][populate][author][populate]': ALL,
  'populate[seo][populate][spotlight][populate]': ALL,
  sort: 'publishDate:desc',
}

export const articlesLoader = () =>
  strapiLoader('strapi-articles', async () => (await strapiFetchAll<StrapiArticle>('articles', ARTICLE_QUERY)).map(toArticle))
