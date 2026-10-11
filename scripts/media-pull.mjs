/**
 * Фото из облака — в проект: скачивает в public/media/<бакет>/<путь> все
 * картинки Yandex Cloud, которые показывает сайт:
 *   - фото каталога из Supabase (model_colors.photo_url) — модели и цены
 *     правятся в базе, а фото сайт берёт из проекта;
 *   - облачные ссылки, оставшиеся в коде и статьях (src/);
 *   - облачные ссылки в собранном сайте (dist/), если он есть;
 *   - пути /media/… в коде и сборке, файла для которых ещё нет, — берутся
 *     из облака по тому же пути.
 * Уже скачанные файлы не трогает. Видео (.mp4) остаются в облаке.
 *
 * Запуск:   npm run media:pull
 *           npm run media:pull -- --check   — только показать, чего не хватает
 * Когда:    добавили модель или цвет с новым фото в Supabase, вставили
 *           облачную ссылку в статью. Сборка сама напомнит: «нет копии
 *           в проекте … npm run media:pull».
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { ROOT, CLOUD, mediaFile } from './lib/media.mjs'

const CHECK = process.argv.includes('--check')
const IMAGE = /\.(webp|jpe?g|png|gif|avif|svg)$/i
// Скобки в имени бывают («фото(2).webp») — закрывающую срезаем, только
// если она чужая (url(…) в CSS)
const URL_RE = /https:\/\/storage\.yandexcloud\.net\/[\w.-]+\/[^"'`\s<>,\\]+/g
const trimUrl = (u) => {
  u = u.split(/[?#]/)[0].replace(/[;.]+$/, '')
  while (u.endsWith(')') && (u.match(/\(/g) ?? []).length < (u.match(/\)/g) ?? []).length) u = u.slice(0, -1)
  return u
}

/* ── Ссылки из файлов ── */
async function* walk(dir) {
  if (!existsSync(dir)) return
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.(astro|vue|ts|mjs|js|mdoc|md|json|html|xml|css)$/.test(e.name)) yield p
  }
}
const urls = new Set()
const MEDIA_RE = /\/media\/[\w.-]+\/[^"'`\s<>,\\]+/g
const decodeHtml = (t) => t.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&#x27;', "'").replaceAll('&amp;', '&')
const addFrom = (text) => {
  text = decodeHtml(text)
  for (const m of text.matchAll(URL_RE)) {
    const url = trimUrl(m[0])
    if (IMAGE.test(url)) urls.add(url)
  }
  for (const m of text.matchAll(MEDIA_RE)) {
    const ref = trimUrl(m[0])
    if (IMAGE.test(ref)) urls.add(CLOUD + ref.slice('/media/'.length))
  }
}
for (const dir of ['src', 'dist']) {
  for await (const file of walk(path.join(ROOT, dir))) addFrom(await readFile(file, 'utf8'))
}

/* ── Фото каталога из Supabase ── */
async function supabaseEnv() {
  const env = { ...process.env }
  const file = path.join(ROOT, '.env')
  if (existsSync(file)) {
    for (const line of (await readFile(file, 'utf8')).split('\n')) {
      const m = line.match(/^\s*([\w]+)\s*=\s*(.*)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return { url: env.PUBLIC_SUPABASE_URL, key: env.PUBLIC_SUPABASE_ANON_KEY }
}
const { url: SB_URL, key: SB_KEY } = await supabaseEnv()
if (SB_URL && SB_KEY) {
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${SB_URL}/rest/v1/model_colors?select=photo_url&photo_url=not.is.null`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Range: `${from}-${from + PAGE - 1}` },
    })
    if (!res.ok) throw new Error(`Supabase: HTTP ${res.status} — ${await res.text()}`)
    const rows = await res.json()
    for (const r of rows) if (r.photo_url?.startsWith(CLOUD) && IMAGE.test(r.photo_url)) urls.add(r.photo_url)
    if (rows.length < PAGE) break
  }
} else {
  console.warn('Нет PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY в .env — фото каталога пропущены')
}

/* ── Что уже есть ── */
const todo = [...urls].filter((u) => !existsSync(mediaFile(u))).sort()
console.log(`Фото в облаке: ${urls.size}, в проекте уже есть: ${urls.size - todo.length}, не хватает: ${todo.length}`)
if (CHECK) {
  todo.forEach((u) => console.log('  ' + u))
  process.exit(todo.length ? 1 : 0)
}

/* ── Скачиваем ── */
let bytes = 0
const failed = []
const queue = [...todo]
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift()
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        const file = mediaFile(url)
        await mkdir(path.dirname(file), { recursive: true })
        await writeFile(file, buf)
        bytes += buf.length
        break
      } catch (e) {
        if (attempt < 3) continue
        failed.push(`${url} — ${e.message}`)
        break
      }
    }
  }
}))
console.log(`Скачано: ${todo.length - failed.length} файлов, ${(bytes / 1048576).toFixed(1)} МБ`)
if (failed.length) {
  console.error(`Не скачались (${failed.length}):\n  ${failed.join('\n  ')}`)
  process.exit(1)
}
