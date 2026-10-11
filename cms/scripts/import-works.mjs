/**
 * Перенос работ портфолио из прежних данных сайта в Strapi (один раз).
 * Фото берутся из public/media проекта и загружаются в медиатеку.
 * Повторный запуск пропускает уже перенесённые (по адресу slug).
 *   npm --prefix cms run import:works   (Strapi при этом остановлен)
 * Данные — .tmp/works-export.json: массив PORTFOLIO_WORKS из git до
 * переезда (git show <коммит>:src/data/portfolio-works.ts → JSON).
 */
import { readFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

/* Strapi — через require: его ESM-сборка в Node не загружается (lodash) */
const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')

const SITE = path.resolve(process.cwd(), '..')
const CATEGORY = { interior: 'Межкомнатные', hidden: 'Скрытые двери', partitions: 'Перегородки' }
const OBJECT = { apartment: 'Квартира', house: 'Частный дом', office: 'Офис', commercial: 'Коммерческая недвижимость' }
const SECTION = { '/catalog/': 'Межкомнатные двери', '/catalog/skrytye-dveri/': 'Скрытые двери', '/catalog/seryye-dveri/': 'Серые и графитовые двери' }

const WORKS = JSON.parse(await readFile(path.join(process.cwd(), '.tmp/works-export.json'), 'utf8'))

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')

async function uploadFile(src, alt) {
  const file = path.join(SITE, 'public', decodeURIComponent(src))
  const { size } = await stat(file)
  const [done] = await upload.upload({
    data: { fileInfo: { name: path.basename(file), alternativeText: alt } },
    files: { filepath: file, originalFilename: path.basename(file), mimetype: 'image/webp', size },
  })
  return done.id
}

for (const w of WORKS) {
  const exists = await app.documents('api::work.work').findFirst({ filters: { slug: w.id } })
  if (exists) { console.log(`уже есть: ${w.id}`); continue }
  const images = []
  for (const [i, src] of w.images.entries()) images.push(await uploadFile(src, `${w.title} — фото ${i + 1}`))
  await app.documents('api::work.work').create({
    status: 'published',
    data: {
      title: w.title, slug: w.id, date: w.date, category: CATEGORY[w.category], objectType: OBJECT[w.objectType],
      location: w.location, description: w.description, story: w.story ?? null, model: w.model ?? null,
      doorCount: w.doorCount ?? null, features: (w.features ?? []).map((text) => ({ text })),
      tags: (w.tags ?? []).map((text) => ({ text })), images,
      catalogLink: w.relatedLink ? { section: SECTION[w.relatedLink.href], label: w.relatedLink.label } : null,
    },
  })
  console.log(`перенесено: ${w.id} (${images.length} фото)`)
}
await app.destroy()
process.exit(0)
