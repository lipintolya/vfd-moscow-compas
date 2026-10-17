/**
 * Фото страниц — в карту сайта (sitemap-0.xml, расширение image): так
 * Google Картинки находят фото со всех страниц, а не только с моделей и
 * работ (их добавляет serialize() в astro.config.mjs из базы и Strapi).
 *
 * После сборки читает готовые страницы dist/ и дописывает к каждой её фото
 * с подписью (alt): украшения с alt="" — не содержимое, их не отдаём.
 * Свои адреса (/media, /renders, /uploads), растровые форматы, до 1000
 * на страницу (лимит Google). Подключается после sitemap() — работает с
 * уже записанным файлом.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1'
const RASTER = /\.(webp|avif|jpe?g|png)(\?|$)/i
const MAX_PER_PAGE = 1000

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
const unescapeHtml = (s) => s.replaceAll('&amp;', '&')
const escapeXml = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** Фото страницы с подписью — абсолютными адресами, без повторов */
export function pageImages(html, siteUrl) {
  const out = []
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    const alt = attr(tag, 'alt')
    const src = attr(tag, 'src')
    if (!alt?.trim() || !src || !src.startsWith('/') || src.startsWith('//') || !RASTER.test(src)) continue
    const url = `${siteUrl}${unescapeHtml(src)}`
    if (!out.includes(url)) out.push(url)
  }
  return out
}

/** Дописать фото к страницам карты сайта; уже указанные не повторяются */
export function addImagesToSitemap(xml, imagesByUrl) {
  let result = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const loc = inner.match(/<loc>([^<]+)<\/loc>/)?.[1]
    const images = loc ? imagesByUrl.get(loc) : null
    if (!images?.length) return block
    const existing = new Set([...inner.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => unescapeHtml(m[1])))
    const room = MAX_PER_PAGE - existing.size
    const add = images.filter((u) => !existing.has(u)).slice(0, Math.max(0, room))
    if (!add.length) return block
    return `<url>${inner}${add.map((u) => `<image:image><image:loc>${escapeXml(u)}</image:loc></image:image>`).join('')}</url>`
  })
  if (!result.includes('xmlns:image=')) result = result.replace('<urlset ', `<urlset xmlns:image="${IMAGE_NS}" `)
  return result
}

/** Каждое фото — у одной страницы, где встретилось первым (в порядке карты
    сайта): наличники с каждой модели и фото ТЦ с каждой страницы не
    повторяются сотни раз. already — фото, уже указанные в карте. */
export function assignImages(pages, already) {
  const seen = new Set(already)
  return new Map(pages.map(([loc, images]) => {
    const own = images.filter((u) => !seen.has(u))
    own.forEach((u) => seen.add(u))
    return [loc, own]
  }))
}

/** dist/catalog/index.html ← https://site/catalog/ */
const pageFile = (dist, loc) => path.join(dist, decodeURIComponent(new URL(loc).pathname), 'index.html')

export default function imageSitemap(siteUrl) {
  return {
    name: 'image-sitemap',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir)
        for (const file of readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
          const full = path.join(dist, file)
          const xml = readFileSync(full, 'utf8')
          const pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
            .map(([, loc]) => [loc, pageFile(dist, loc)])
            .filter(([, page]) => existsSync(page))
            .map(([loc, page]) => [loc, pageImages(readFileSync(page, 'utf8'), siteUrl)])
          const already = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => unescapeHtml(m[1]))
          const out = addImagesToSitemap(xml, assignImages(pages, already))
          writeFileSync(full, out)
          logger.info(`${file}: фото в карте сайта — ${(out.match(/<image:loc>/g) ?? []).length}`)
        }
      },
    },
  }
}
