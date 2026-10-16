/**
 * Временное демо на Vercel для заказчика — готовые файлы, без сборки на
 * Vercel (там нет Strapi). Собранный dist/ + фото Strapi (/uploads) →
 * .vercel/output (Build Output API): домен сайта (SITE_URL из
 * src/config/site.ts) в canonical, og:image, разметке заменён адресом демо,
 * поисковикам закрыто (X-Robots-Tag и robots.txt), 404 — своя страница.
 * Исходники и dist/ не меняются.
 *   npm run build && npm run demo:vercel -- https://<проект>.vercel.app
 *   npx vercel deploy --prebuilt --prod
 */
import { cp, readdir, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const UPLOADS = path.join(ROOT, 'cms/public/uploads')
const OUT = path.join(ROOT, '.vercel/output')
const STATIC = path.join(OUT, 'static')
/* Домен сайта — из бренд-слоя, один источник */
const SITE_URL = (await readFile(path.join(ROOT, 'src/config/site.ts'), 'utf8')).match(/export const SITE_URL = '([^']+)'/)?.[1]
if (!SITE_URL) throw new Error('Не найден SITE_URL в src/config/site.ts')

const demoUrl = process.argv[2]?.replace(/\/$/, '')
if (!demoUrl?.startsWith('https://')) {
  console.error('Адрес демо: npm run demo:vercel -- https://<проект>.vercel.app')
  process.exit(1)
}

await rm(OUT, { recursive: true, force: true })
await mkdir(STATIC, { recursive: true })
await cp(DIST, STATIC, { recursive: true })
await cp(UPLOADS, path.join(STATIC, 'uploads'), { recursive: true, filter: (src) => !src.endsWith('.gitkeep') })

/* Домен сайта в canonical, og:image, JSON-LD, sitemap → адрес демо */
let replaced = 0
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) { if (entry.name !== 'uploads' && entry.name !== 'media') await walk(file); continue }
    if (!/\.(html|xml|txt|json|webmanifest)$/.test(entry.name)) continue
    const text = await readFile(file, 'utf8')
    if (!text.includes(SITE_URL)) continue
    await writeFile(file, text.replaceAll(SITE_URL, demoUrl))
    replaced++
  }
}
await walk(STATIC)

await writeFile(path.join(STATIC, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
await writeFile(path.join(OUT, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { src: '/(.*)', headers: { 'X-Robots-Tag': 'noindex, nofollow' }, continue: true },
    { handle: 'filesystem' },
    { src: '/.*', status: 404, dest: '/404.html' },
  ],
}, null, 2))

console.log(`Готово: .vercel/output (домен заменён в ${replaced} файлах). Дальше: npx vercel deploy --prebuilt --prod`)
