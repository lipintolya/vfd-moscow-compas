/**
 * Генерирует public/renders/series/*.webp — уменьшенные превью обложек серий
 * (previewImage/heroImage из src/data/series-descriptions.ts) и карту
 * src/data/series-cover-previews.ts «оригинальный URL → локальный файл».
 *
 * Зачем: обложка серии (SeriesCardData.cover) показывается максимум на
 * ~600 CSS-px — карточка покрытия на /catalog/, SeriesCard 300×400 на
 * /catalog/series/ и лендингах, аватарки 40×40 в свёрнутых панелях. А грузился
 * оригинал 1024–1254px, 67–176 КБ. Большой hero на странице самой серии
 * по-прежнему берёт полный heroImage — карта используется только для cover.
 *
 * Плюс миниатюра 160×200 (кроп 4:5) — для строк списка серий на мобильном
 * в карточке покрытия на /catalog/ и аватарок в свёрнутых панелях: там
 * картинка 32–40 CSS-px, полная обложка 900w была бы в 10 раз тяжелее.
 *
 * Запуск: node scripts/gen-series-covers.mjs
 * Когда запускать снова: после смены previewImage/heroImage у серии или
 * добавления новой серии. Без перезапуска ничего не сломается — для URL,
 * которого нет в карте, catalog-data возьмёт оригинал.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { seriesDescriptions, getSeriesSpec } from '../src/data/series-descriptions.ts'

const OUT = new URL('../public/renders/series/', import.meta.url)
const MAP_FILE = new URL('../src/data/series-cover-previews.ts', import.meta.url)
const WIDTH = 900
const QUALITY = 78
const THUMB = { width: 160, height: 200, quality: 72 }

await mkdir(OUT, { recursive: true })

const specs = [
  ...Object.values(seriesDescriptions),
  // фолбэки по покрытию для серий без своей записи
  ...['pet', 'emal', 'emalex', 'protach', 'ekoshpon'].map(c => getSeriesSpec('__no-series__', c)),
]
const urls = [...new Set(specs.map(s => s.previewImage || s.heroImage).filter(Boolean))]

const map = {}
const thumbs = {}
let before = 0, after = 0
for (const url of urls) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
  // имя из пути, без коллизий: cover_first_section/emal/linea.webp → emal-linea-900.webp
  const name = url.split('/').slice(-2).join('-').replace(/\.webp$/, '') + `-${WIDTH}.webp`
  // Миниатюра — всегда (оригинал для неё в любом случае избыточен).
  const thumbName = name.replace(`-${WIDTH}.webp`, '-thumb.webp')
  const thumb = await sharp(buf).resize(THUMB.width, THUMB.height, { fit: 'cover', position: 'centre' }).webp({ quality: THUMB.quality }).toBuffer()
  await writeFile(new URL(thumbName, OUT), thumb)
  thumbs[url] = `/renders/series/${thumbName}`
  // если пережатие не дало выигрыша — оставляем оригинал, в карту не пишем
  if (img.length >= buf.length) {
    console.log(`${name.padEnd(44)} пропущен (оригинал уже легче)`)
    continue
  }
  await writeFile(new URL(name, OUT), img)
  map[url] = `/renders/series/${name}`
  before += buf.length; after += img.length
  console.log(`${name.padEnd(44)} ${(buf.length / 1024).toFixed(0).padStart(4)}KB -> ${(img.length / 1024).toFixed(0).padStart(3)}KB`)
}

const toBody = obj => Object.entries(obj).map(([k, v]) => `  '${k}':\n    '${v}',`).join('\n')
await writeFile(MAP_FILE, `/* СГЕНЕРИРОВАНО scripts/gen-series-covers.mjs — не править руками.
   Оригинальная обложка серии → локальное превью ${WIDTH}w для карточек. */
export const SERIES_COVER_PREVIEWS: Record<string, string> = {
${toBody(map)}
}

/* Оригинальная обложка серии → миниатюра ${THUMB.width}×${THUMB.height} (строки
   списка серий на мобильном, аватарки свёрнутых панелей на /catalog/). */
export const SERIES_COVER_THUMBS: Record<string, string> = {
${toBody(thumbs)}
}
`)
console.log(`ИТОГО: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB, ${Object.keys(map).length} файлов`)
