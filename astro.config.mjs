// @ts-check
import { readFileSync } from 'node:fs'
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import markdoc from '@astrojs/markdoc';
import { createClient } from '@supabase/supabase-js';

/* ── Картинки для sitemap (xmlns:image) ────────────────────────────────
   serialize() ниже — чистый Node, import.meta.env тут недоступен (это
   Vite-фича для кода приложения), поэтому читаем .env вручную. Supabase-
   запрос на старте сборки — если упадёт (сеть/лимиты), просто не будет
   картинок в sitemap: try/catch не должен уронить всю сборку сайта, как
   уже случалось с getStaticPaths при обрыве связи с Supabase. */
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
const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}
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
async function fetchModelImages() {
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
      const model = row.models
      if (!model || !row.photo_url) continue
      modelMeta.set(model.id, { id: model.id, name: model.name, seriesSlug: model.series?.slug ?? '' })
      const list = byModelId.get(model.id) ?? []
      if (!list.includes(row.photo_url)) list.push(row.photo_url)
      byModelId.set(model.id, list)
    }

    const slugMap = buildModelSlugMap([...modelMeta.values()])
    for (const [id, images] of byModelId) {
      const slug = slugMap.get(id)
      if (slug) map.set(`https://vfd74.ru/models/${slug}/`, images)
    }
  } catch {
    return new Map()
  }
  return map
}

const modelImages = await fetchModelImages()

// https://astro.build/config
export default defineConfig({
  site: 'https://vfd74.ru',

  /* Постоянные переадресации удалённых страниц (статическая сборка —
     HTML с мгновенным meta refresh + canonical на новый адрес). */
  redirects: {
    /* «Урбан 1» с чёрной кромкой был разбит в Supabase на две записи по
       цветам; бежевый перенесён в основную (98075687), лишняя запись
       9afc9b75 удалена — её адреса ведут на основную страницу модели. */
    '/models/urban-1-urban-9afc9b/':                 '/models/urban-1-urban-980756/',
    '/models/9afc9b75-148e-4c78-8bdd-5beb62d54308/':  '/models/urban-1-urban-980756/',
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    vue(),
    markdoc(),
    sitemap({
      filter: (page) =>
        page !== 'https://vfd74.ru/privacy/' && page !== 'https://vfd74.ru/privacy' &&
        // Старые UUID-маршруты моделей остаются доступными (чтобы не 404'ить уже
        // проиндексированные ссылки), но в сайтмап должен попадать только
        // канонический слаг-адрес — иначе сайтмап задвоит каждую модель.
        !/\/models\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/.test(page),
      serialize(item) {
        const u = item.url

        /* Картинки — модели (Supabase, см. fetchModelImages) и портфолио
           (путь детерминирован из слага, без БД). */
        const withImages = (extra) => {
          const images = modelImages.get(u)
          return images ? { ...extra, img: images.map(url => ({ url })) } : extra
        }
        const portfolioMatch = u.match(/\/portfolio\/([a-z0-9-]+)\/?$/)
        const portfolioImg = portfolioMatch
          ? { img: [{ url: `https://vfd74.ru/renders/portfolio/${portfolioMatch[1]}.webp` }] }
          : {}

        if (u === 'https://vfd74.ru/' || u === 'https://vfd74.ru') {
          return { ...item, changefreq: 'weekly', priority: 1.0 }
        }
        if (/\/(catalog|about|contacts|partitions|vhodnye-dveri|designers)\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/catalog\/series(\/.+)?\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/catalog\/dveri-[^/]+\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        // Цветовые SEO-лендинги — см. src/data/color-categories.ts (слаги
        // там не начинаются с dveri-, отдельная проверка).
        if (/\/catalog\/(belye|seryye|bezhevye|shokolad-mokko)-dveri\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        // Стилевые SEO-лендинги — см. src/data/style-categories.ts.
        if (/\/catalog\/(loft-dveri|minimalizm-dveri)\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/articles\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.7 }
        }
        if (/\/portfolio\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (portfolioMatch) {
          return { ...item, changefreq: 'monthly', priority: 0.65, ...portfolioImg }
        }
        if (/\/models\/[a-z0-9-]+\/?$/.test(u)) {
          return withImages({ ...item, changefreq: 'monthly', priority: 0.6 })
        }
        return { ...item, changefreq: 'monthly', priority: 0.6 }
      },
    }),
  ]
});
