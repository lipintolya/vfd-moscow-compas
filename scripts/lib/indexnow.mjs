/**
 * IndexNow — сайт сам сообщает поисковикам (Яндекс, Bing), какие страницы
 * изменились: они приходят переобходить их сразу, а не по своему графику.
 * Ключ — SITE.indexNowKey (src/config/site.ts), файл ключа /<ключ>.txt
 * отдаёт сайт (src/pages/[indexnow].txt.ts). Google IndexNow не поддерживает.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

/** Куда отправлять: Яндекс и Bing напрямую */
export const INDEXNOW_ENDPOINTS = ['https://yandex.com/indexnow', 'https://www.bing.com/indexnow']

/** dist/catalog/index.html → https://site/catalog/ */
export const pageUrl = (siteUrl, file) => `${siteUrl}/${file.replace(/(^|\/)index\.html$/, '$1')}`

/** Значение атрибута из тега: attr('<img src="a" alt="b">', 'alt') → 'b' */
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? ''

const SEO_META = new Set(['description', 'robots', 'og:title', 'og:description', 'og:image'])

/** То, что видит поисковик: title, description, robots, canonical, JSON-LD,
    картинки (src и alt) и видимый текст. Без стилей, скриптов и имён их
    файлов (_astro/…): правка CSS не делает страницу «изменившейся».
    priceValidUntil (сборка + 90 дней) из разметки убран — иначе каждая
    сборка меняла бы все страницы моделей. */
export function pageContent(html) {
  const parts = [
    ...[...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1]),
    ...[...html.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0])
      .filter((t) => SEO_META.has(attr(t, 'name') || attr(t, 'property')))
      .map((t) => `${attr(t, 'name') || attr(t, 'property')}=${attr(t, 'content')}`),
    ...[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)].map((m) => attr(m[0], 'href')),
    ...[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1].replace(/"priceValidUntil":"[^"]*",?/g, '')),
    ...[...html.matchAll(/<img\b[^>]*>/g)].map((m) => `${attr(m[0], 'src')} ${attr(m[0], 'alt')}`),
    html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  ]
  return parts.join('\n')
}

/** Хэши содержимого всех страниц сборки: { 'catalog/index.html': sha1 } */
export function contentHashes(distDir) {
  const out = {}
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.html')) out[path.relative(distDir, full)] = createHash('sha1').update(pageContent(readFileSync(full, 'utf8'))).digest('hex')
    }
  }
  walk(distDir)
  return out
}

/** Состояние прошлой выкладки: { 'catalog/index.html': { hash, date } }.
    Старый формат (хэш всего HTML строкой) несравним с хэшем содержимого —
    считается, что прошлой выкладки нет: один раз уходят все страницы. */
export function readState(json) {
  if (!json) return null
  const isNew = Object.values(json).every((v) => v && typeof v === 'object' && 'hash' in v)
  return isNew ? json : null
}

/** Новое состояние: содержимое не менялось — дата прежняя, иначе — today */
export function nextState(prev, hashes, today) {
  return Object.fromEntries(Object.entries(hashes).map(([file, hash]) =>
    [file, { hash, date: prev?.[file]?.hash === hash ? prev[file].date : today }]))
}

/** Страницы карты сайта, у которых изменилось содержимое; prev = null — все */
export function changedUrls(siteUrl, prev, next, sitemapUrls) {
  if (!prev) return [...sitemapUrls]
  const changed = new Set(Object.keys(next).filter((f) => prev[f]?.hash !== next[f].hash).map((f) => pageUrl(siteUrl, f)))
  return sitemapUrls.filter((u) => changed.has(u))
}

/** Адрес → файл сборки: https://site/catalog/ → catalog/index.html */
const fileOf = (siteUrl, url) => `${decodeURI(url.slice(siteUrl.length + 1))}index.html`

/** <lastmod> в карте сайта — дата, когда у страницы последний раз менялось
    содержимое (state). Уже стоящая дата (статьи — из Strapi) остаётся, если
    она позже. */
export function withLastmod(xml, siteUrl, state) {
  return xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const loc = inner.match(/<loc>([^<]+)<\/loc>/)?.[1]
    const date = loc && state[fileOf(siteUrl, loc)]?.date
    if (!date) return block
    const current = inner.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
    if (current && new Date(current) >= new Date(date)) return block
    const tag = `<lastmod>${date}</lastmod>`
    return current
      ? block.replace(/<lastmod>[^<]+<\/lastmod>/, tag)
      : block.replace(/(<loc>[^<]+<\/loc>)/, `$1${tag}`)
  })
}

export const indexNowBody = (siteUrl, key, urlList) => ({
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList,
})

/** Отправка; ошибка не роняет выкладку — возвращается текстом */
export async function submitIndexNow(siteUrl, key, urls) {
  const results = []
  for (let i = 0; i < urls.length; i += 10000) {
    const body = JSON.stringify(indexNowBody(siteUrl, key, urls.slice(i, i + 10000)))
    for (const endpoint of INDEXNOW_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body })
        results.push(`${new URL(endpoint).host}: ${res.status}${res.ok ? '' : ` ${(await res.text()).slice(0, 120)}`}`)
      } catch (e) {
        results.push(`${new URL(endpoint).host}: не отправлено (${e.message})`)
      }
    }
  }
  return results
}

/** Адреса из карты сайта сборки */
export function sitemapUrls(distDir) {
  return readdirSync(distDir)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) => [...readFileSync(path.join(distDir, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
}
