/**
 * Перенос статей в Strapi (один раз): .tmp/articles-export.json
 * (npm run articles:export в корне) → записи раздела «Статьи», фото и
 * ролики — в медиатеку. Повторный запуск пропускает уже перенесённые
 * (по адресу slug). Strapi при этом остановлен.
 *   npm --prefix cms run import:articles
 */
import { readFile, stat, writeFile, mkdtemp } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
/* Strapi — через require: его ESM-сборка в Node не загружается (lodash) */
const { createStrapi, compileStrapi } = require('@strapi/strapi')
const sharp = require('sharp')

const SITE = path.resolve(process.cwd(), '..')
const ARTICLES = JSON.parse(await readFile(path.join(process.cwd(), '.tmp/articles-export.json'), 'utf8'))
const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' }

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')
const uploaded = new Map()
const tmp = await mkdtemp(path.join(tmpdir(), 'articles-'))

/* Файл сайта (/media/…, /renders/…, /svg/…) → id в медиатеке; один файл — одна загрузка.
   SVG медиатека не принимает (запрет в config/plugins.ts) — переводим в PNG 512 px */
async function media(sitePath) {
  if (uploaded.has(sitePath)) return uploaded.get(sitePath)
  let file = path.join(SITE, 'public', decodeURIComponent(sitePath))
  if (file.endsWith('.svg')) {
    const png = path.join(tmp, `${path.basename(file, '.svg')}.png`)
    await writeFile(png, await sharp(file, { density: 300 }).resize({ width: 512 }).png().toBuffer())
    file = png
  }
  const { size } = await stat(file)
  const ext = path.extname(file).toLowerCase()
  if (!MIME[ext]) throw new Error(`Неизвестный тип файла: ${sitePath}`)
  const [done] = await upload.upload({
    data: { fileInfo: { name: path.basename(file) } },
    files: { filepath: file, originalFilename: path.basename(file), mimetype: MIME[ext], size },
  })
  uploaded.set(sitePath, done.id)
  return done.id
}

/* { $media: '/путь' } → id файла, на любой глубине */
async function resolve(value) {
  if (Array.isArray(value)) {
    const out = []
    for (const v of value) out.push(await resolve(v))
    return out
  }
  if (value && typeof value === 'object') {
    if ('$media' in value) return media(value.$media)
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = await resolve(v)
    return out
  }
  return value
}

for (const a of ARTICLES) {
  const exists = await app.documents('api::article.article').findFirst({ filters: { slug: a.slug } })
  if (exists) { console.log(`уже есть: ${a.slug}`); continue }
  await app.documents('api::article.article').create({ status: 'published', data: await resolve(a) })
  console.log(`перенесено: ${a.slug}`)
}
console.log(`файлов загружено: ${uploaded.size}`)
await app.destroy()
process.exit(0)
