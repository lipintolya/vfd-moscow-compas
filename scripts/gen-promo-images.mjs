/**
 * Локальные ресайзы фото акций — блок «Акции» на главной (Promo.vue),
 * /akcii/ и /promo-archive/. Облако не ресайзит по query-параметрам, а
 * оригиналы кратно крупнее карточки (~400px CSS) — даём 640w/800w под retina.
 *
 * Фото берутся из src/data/promos.ts: каждый `image: '/media/…'` (или
 * облачная ссылка). Файлы —
 * public/renders/promo/<имя-файла-оригинала>-{640,800}.webp; путь для
 * поля imageSrcset скрипт печатает — вставьте его в акцию.
 *
 * Запуск:        node scripts/gen-promo-images.mjs
 * Когда запускать снова: добавили акцию с фото или сменили фото.
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { loadMedia } from './lib/media.mjs'

const OUT_DIR = new URL('../public/renders/promo/', import.meta.url)

/* promos.ts читаем как текст (без TS-импорта): нужны только адреса фото */
const data = await readFile(new URL('../src/data/promos.ts', import.meta.url), 'utf8')
const sources = [...data.matchAll(/^\s*image:\s*'((?:https?:|\/media\/)[^']+)'/gm)].map(([, src]) => ({
  src,
  base: decodeURIComponent(src.split('/').at(-1)).replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}))
if (!sources.length) {
  console.log('В src/data/promos.ts нет акций с фото (image) — делать нечего.')
  process.exit(0)
}
await mkdir(OUT_DIR, { recursive: true })

const widths = [
  { width: 640, quality: 76 },
  { width: 800, quality: 78 },
]

for (const { src, base } of sources) {
  const buf = await loadMedia(src)
  for (const { width, quality } of widths) {
    const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
    const out = `${base}-${width}.webp`
    await writeFile(new URL(out, OUT_DIR), resized)
    console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
  }
  console.log(`  imageSrcset: '${widths.map(({ width }) => `/renders/promo/${base}-${width}.webp ${width}w`).join(', ')}'`)
}
