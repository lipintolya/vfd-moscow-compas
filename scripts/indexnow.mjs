/**
 * Сообщить Яндексу и Bing о страницах сайта (IndexNow) вручную:
 *
 *   npm run indexnow                    # все страницы карты сайта из dist/
 *   npm run indexnow -- /catalog/ /     # только эти
 *
 * Обычно не нужно: npm run deploy сам отправляет изменившиеся страницы.
 * Нужна свежая сборка (npm run build) — адреса берутся из dist/.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { sitemapUrls, submitIndexNow } from './lib/indexnow.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const config = readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8')
const siteUrl = config.match(/export const SITE_URL = '([^']+)'/)?.[1]
const key = config.match(/indexNowKey: '([0-9a-f]+)'/)?.[1]
if (!siteUrl || !key) { console.error('Нет SITE_URL или SITE.indexNowKey в src/config/site.ts'); process.exit(1) }

const args = process.argv.slice(2)
const urls = args.length ? args.map((p) => new URL(p, siteUrl).href) : sitemapUrls(path.join(ROOT, 'dist'))
if (!urls.length) { console.error('Нет адресов: соберите сайт (npm run build)'); process.exit(1) }
console.log(`IndexNow: ${urls.length} стр. → ${(await submitIndexNow(siteUrl, key, urls)).join(', ')}`)
