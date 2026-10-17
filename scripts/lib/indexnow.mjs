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

/** Хэши всех страниц сборки: { 'catalog/index.html': sha1 } */
export function htmlHashes(distDir) {
  const out = {}
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (e.name.endsWith('.html')) out[path.relative(distDir, full)] = createHash('sha1').update(readFileSync(full)).digest('hex')
    }
  }
  walk(distDir)
  return out
}

/** Страницы карты сайта, которые изменились с прошлой выкладки; prev = null — все */
export function changedUrls(siteUrl, prev, next, sitemapUrls) {
  if (!prev) return [...sitemapUrls]
  const changed = new Set(Object.keys(next).filter((f) => prev[f] !== next[f]).map((f) => pageUrl(siteUrl, f)))
  return sitemapUrls.filter((u) => changed.has(u))
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
