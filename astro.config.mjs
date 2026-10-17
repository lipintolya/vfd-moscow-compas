// @ts-check
import { readFileSync, existsSync } from 'node:fs'
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import { createClient } from '@supabase/supabase-js';
import { CLOUD, cloudToMedia, mediaFile } from './scripts/lib/media.mjs';
import strapiRefresh from './src/integrations/strapi-refresh.mjs';
import imageSitemap from './src/integrations/image-sitemap.mjs';

/* ── Картинки для sitemap (xmlns:image) ────────────────────────────────
   serialize() ниже — чистый Node, import.meta.env тут недоступен (это
   Vite-фича для кода приложения), поэтому читаем .env вручную. Supabase-
   запрос на старте сборки — если упадёт (сеть/лимиты), просто не будет
   картинок в sitemap: try/catch не должен уронить всю сборку сайта, как
   уже случалось с getStaticPaths при обрыве связи с Supabase. */
/** @param {string} name */
function readEnvVar(name) {
  // На проде переменные заданы настоящим process.env (без физического
  // .env-файла в чекауте) — проверяем его первым.
  if (process.env[name]) return process.env[name]
  for (const file of ['.env.local', '.env']) {
    try {
      const content = readFileSync(new URL(file, import.meta.url), 'utf8')
      const match = content.match(new RegExp(`^${name}=(.*)$`, 'm'))
      if (match) return match[1].trim()
    } catch { /* файла нет — пробуем следующий */ }
  }
  return ''
}

/* Дублирует src/lib/slugify.ts — не импортируем .ts в конфиг намеренно,
   чтобы не тянуть неопределённость esbuild-резолвинга в критичный для
   сборки файл. При правке транслитерации — поправить оба места. */
/** @type {Record<string, string>} */
const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}
/** @param {string} input */
function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .split('')
    .map(char => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
/** @param {{ id: string, name: string, seriesSlug: string }[]} models */
function buildModelSlugMap(models) {
  const baseSlugOf = new Map()
  const baseSlugCounts = new Map()
  for (const m of models) {
    const base = [slugify(m.name), m.seriesSlug].filter(Boolean).join('-')
    baseSlugOf.set(m.id, base)
    baseSlugCounts.set(base, (baseSlugCounts.get(base) ?? 0) + 1)
  }
  const slugMap = new Map()
  for (const m of models) {
    const base = baseSlugOf.get(m.id)
    slugMap.set(m.id, (baseSlugCounts.get(base) ?? 0) > 1 ? `${base}-${m.id.slice(0, 6)}` : base)
  }
  return slugMap
}

/** slug модели → массив URL её фото (все цвета). Пусто при любой ошибке. */
/** @returns {Promise<Map<string, string[]>>} */
async function fetchModelImages() {
  /** @type {Map<string, string[]>} */
  const map = new Map()
  try {
    const url = readEnvVar('PUBLIC_SUPABASE_URL')
    const key = readEnvVar('PUBLIC_SUPABASE_ANON_KEY')
    if (!url || !key) return map

    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('model_colors')
      .select('photo_url, models ( id, name, series ( slug ) )')
    if (error || !data) return map

    const byModelId = new Map()
    const modelMeta = new Map()
    for (const row of data) {
      /* Связь многие-к-одному: Supabase отдаёт объект, а не массив —
         тип клиента без схемы БД этого не знает */
      const model = /** @type {{ id: string, name: string, series: { slug?: string } | null } | null} */ (
        /** @type {unknown} */ (row.models)
      )
      if (!model || !row.photo_url) continue
      modelMeta.set(model.id, { id: model.id, name: model.name, seriesSlug: model.series?.slug ?? '' })
      /* Фото — копия в проекте (public/media), как на самих страницах
         (src/lib/media.ts); нет копии — облачная ссылка */
      const photo = row.photo_url.startsWith(CLOUD) && existsSync(mediaFile(row.photo_url))
        ? `${SITE_URL}${cloudToMedia(row.photo_url)}`
        : row.photo_url
      const list = byModelId.get(model.id) ?? []
      if (!list.includes(photo)) list.push(photo)
      byModelId.set(model.id, list)
    }

    const slugMap = buildModelSlugMap([...modelMeta.values()])
    for (const [id, images] of byModelId) {
      const slug = slugMap.get(id)
      if (slug) map.set(`${SITE_URL}/models/${slug}/`, images)
    }
  } catch {
    return new Map()
  }
  return map
}

/* Домен сайта — дублирует SITE_URL из src/config/site.ts (конфиг Astro
   намеренно не импортирует .ts, см. комментарий у slugify выше). При
   смене домена поправить оба места (robots.txt и /sitemap.xml собираются
   из SITE.url — src/pages/robots.txt.ts, sitemap.xml.ts). */
const SITE_URL = 'https://dveriziz.ru'

/* Страницы вне сайтмапа: /privacy/ — служебная; /reviews/ —
   пока пустой и закрыт noindex (SITE.features в src/config/site.ts);
   /catalog/skrytye-dveri/raboty/ — noindex, пока пуст INVISIBLE_WORKS.
   Включили раздел там — уберите его отсюда. */
const SITEMAP_EXCLUDE = ['/privacy/', '/consent/', '/catalog/skrytye-dveri/raboty/']

const modelImages = await fetchModelImages()

/** Все опубликованные записи раздела Strapi (постранично, по ключу из .env).
    Любая ошибка — пустой список: карта сайта без этих данных, а саму сборку
    остановят страницы, которые читают Strapi через src/lib/strapi.ts.
    @param {string} collection @param {Record<string, string>} params
    @returns {Promise<any[]>} */
async function fetchStrapi(collection, params) {
  const base = readEnvVar('STRAPI_URL').replace(/\/$/, '')
  const token = readEnvVar('STRAPI_TOKEN')
  if (!base || !token) return []
  const items = []
  try {
    for (let page = 1; ; page++) {
      const query = new URLSearchParams({ ...params, status: 'published', 'pagination[page]': String(page), 'pagination[pageSize]': '100' })
      const res = await fetch(`${base}/api/${collection}?${query}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) return []
      const json = await res.json()
      items.push(...json.data)
      if (page >= json.meta.pagination.pageCount) return items
    }
  } catch {
    return []
  }
}

/** Адрес страницы работы → её фото (те же копии, что на странице: как
    strapiImage(…, 1920) в src/lib/strapi.ts — самая крупная не шире
    1920 px, оригинал — если сам не шире). Strapi недоступен — пусто: без
    картинок в карте, а саму сборку остановят страницы портфолио. */
/** @returns {Promise<Map<string, string[]>>} */
async function fetchWorkImages() {
  /** @param {{ url: string, width?: number, formats?: Record<string, { url: string, width: number }> | null }} img */
  const pick = (img) => {
    const all = [...Object.values(img.formats ?? {}), ...(img.width && img.width <= 1920 ? [{ url: img.url, width: img.width }] : [])]
    return all.filter((v) => v.width <= 1920).sort((a, b) => b.width - a.width)[0]?.url ?? img.url
  }
  /** @type {{ slug: string, images: Parameters<typeof pick>[0][] }[]} */
  const works = await fetchStrapi('works', { 'fields[0]': 'slug', 'populate[images]': 'true' })
  return new Map(works.map((w) => [`${SITE_URL}/portfolio/${w.slug}/`, w.images.map((img) => `${SITE_URL}${pick(img)}`)]))
}
const workImages = await fetchWorkImages()

/* Статьи для sitemap — из Strapi (конфиг не видит коллекции Astro): только
   опубликованные, lastmod — updatedDate или publishDate. Раздел /articles/ —
   в карте, только если есть хоть одна статья. Strapi недоступен — пусто,
   но тогда сборку и так остановят страницы статей. */
/** @type {{ slug: string, publishDate: string, updatedDate?: string | null }[]} */
const ARTICLES = await fetchStrapi('articles', { 'fields[0]': 'slug', 'fields[1]': 'publishDate', 'fields[2]': 'updatedDate' })
const ARTICLE_LASTMOD = new Map(ARTICLES.map((a) => [a.slug, a.updatedDate ?? a.publishDate]))
const HAS_ARTICLES = ARTICLE_LASTMOD.size > 0
/** @param {string} page */
function isArticleInSitemap(page) {
  const m = page.match(/\/articles(?:\/([a-z0-9-]+))?\/?$/)
  if (!m) return true
  return m[1] ? ARTICLE_LASTMOD.has(m[1]) : HAS_ARTICLES
}

// https://astro.build/config
export default defineConfig({
  /* Стили — внутри страницы, а не отдельными файлами: первая отрисовка
     не ждёт 4–7 запросов CSS (замер Lighthouse, мобильный: FCP −0,07…0,23 с
     на главной, статье, контактах, каталоге). Цена — ~20 КБ к каждой
     странице без кэша между страницами. */
  build: { inlineStylesheets: 'always' },
  site: SITE_URL,

  vite: {
    plugins: [tailwindcss()],
    /* Раздельный кэш зависимостей для сборки и dev-сервера: `astro build`
       пересобирает кэш в продакшен-режиме, и запущенный в это время
       `astro dev` начинает отдавать Vue без HMR — в браузере
       «__VUE_HMR_RUNTIME__ is not defined» и ошибки гидрации островов. */
    cacheDir: process.argv.includes('build') ? 'node_modules/.vite-build' : 'node_modules/.vite',
    /* Фото из Strapi в dev — по тому же адресу /uploads/…, что на сервере
       (там nginx отдаёт папку загрузок Strapi с диска) */
    server: {
      proxy: { '/uploads': readEnvVar('STRAPI_URL') || 'http://localhost:1337' },
    },
  },

  integrations: [
    vue(),
    strapiRefresh(['strapi-promos', 'strapi-works', 'strapi-articles']),
    sitemap({
      filter: (page) =>
        !SITEMAP_EXCLUDE.some(path => page === `${SITE_URL}${path}` || page === `${SITE_URL}${path.slice(0, -1)}`) &&
        // Старые UUID-маршруты моделей остаются доступными (чтобы не 404'ить уже
        // проиндексированные ссылки), но в сайтмап должен попадать только
        // канонический слаг-адрес — иначе сайтмап задвоит каждую модель.
        !/\/models\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/.test(page) &&
        // Статьи: заглушки (закрыты noindex) — не в карте; раздел — только
        // если есть опубликованные (см. readArticles выше)
        isArticleInSitemap(page),
      serialize(item) {
        const u = item.url

        /* Картинки — модели (Supabase, см. fetchModelImages) и портфолио
           (Strapi, см. fetchWorkImages). */
        /** @param {import('@astrojs/sitemap').SitemapItem} extra */
        const withImages = (extra) => {
          const images = modelImages.get(u)
          return images ? { ...extra, img: images.map(url => ({ url })) } : extra
        }
        const portfolioMatch = u.match(/\/portfolio\/([a-z0-9-]+)\/?$/)
        const workImgs = workImages.get(u)
        const portfolioImg = workImgs ? { img: workImgs.map((url) => ({ url })) } : {}

        if (u === `${SITE_URL}/` || u === SITE_URL) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 1.0 }
        }
        if (/\/(catalog|about|contacts|partitions|designers|video)\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        // Партнёрские страницы перегородок — /partitions/alum/
        if (/\/partitions\/[a-z0-9-]+\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.8 }
        }
        if (/\/catalog\/series(\/.+)?\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        if (/\/catalog\/dveri-[^/]+\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        // Цветовые SEO-лендинги — см. src/data/color-categories.ts (слаги
        // там не начинаются с dveri-, отдельная проверка).
        if (/\/catalog\/(belye|seryye|bezhevye|shokolad-mokko)-dveri\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        // Стилевые SEO-лендинги — см. src/data/style-categories.ts.
        if (/\/catalog\/(loft-dveri|minimalizm-dveri)\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        if (/\/articles\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.7 }
        }
        const articleMatch = u.match(/\/articles\/([a-z0-9-]+)\/?$/)
        if (articleMatch) {
          const lastmod = ARTICLE_LASTMOD.get(articleMatch[1])
          return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.7, ...(lastmod ? { lastmod: new Date(lastmod).toISOString() } : {}) }
        }
        if (/\/portfolio\/?$/.test(u)) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 }
        }
        if (portfolioMatch) {
          return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.65, ...portfolioImg }
        }
        if (/\/models\/[a-z0-9-]+\/?$/.test(u)) {
          return withImages({ ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.6 })
        }
        return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.6 }
      },
    }),
    /* После sitemap(): дописывает в готовую карту фото со всех страниц */
    imageSitemap(SITE_URL),
  ]
});
