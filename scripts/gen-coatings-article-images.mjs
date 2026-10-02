/**
 * Картинки статьи «Эмаль, Эмалекс, ПЭТ, Протач или Экошпон» (src/content/
 * articles/kakoe-pokrytie-dverei-vybrat.mdoc).
 *
 * Карточки покрытий ({% card %} в статье) рендерят <img> как есть, без
 * оптимизации, а оригиналы в Yandex Cloud — до 1920px (ПЭТ-рендер — PNG на
 * 2.7MB) при реальной ширине карточки ~300px CSS. Тот же приём, что
 * gen-promo-images.mjs: локальный ресайз 600w (retina) в public/renders.
 *
 * Обложка 21:9: исходники — вертикальные кадры дверей, в широкий hero
 * статьи их не вписать без потери двери. Собираем ряд из пяти дверей —
 * по одной на покрытие, в том же порядке, что в статье.
 *
 * Запуск:        node scripts/gen-coatings-article-images.mjs
 * Когда снова:   если в статье сменили фото какого-то покрытия.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/articles/coatings/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const sources = [
  { base: 'emal',     src: 'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/stockholm.webp' },
  { base: 'emalex',   src: 'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/emalex_render.webp' },
  { base: 'pet',      src: 'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/cover_pet.png' },
  { base: 'protach',  src: 'https://storage.yandexcloud.net/catalog-vfd/Smart/next/render/next_render.webp' },
  { base: 'ekoshpon', src: 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_cover_wood.webp' },
]

const buffers = []
for (const { base, src } of sources) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  buffers.push(buf)

  // Карточка: кроп 3:4 (как .dcard__media), 600×800 под retina.
  const card = await sharp(buf).resize(600, 800, { fit: 'cover', position: 'centre' }).webp({ quality: 78 }).toBuffer()
  await writeFile(new URL(`${base}-600.webp`, OUT_DIR), card)
  console.log(`${base}-600.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(card.length / 1024).toFixed(0)}KB`)
}

// Обложка 2100×900 (21:9): 5 вертикальных плиток с белыми просветами.
const GAP = 12
const COVER_W = 2100
const COVER_H = 900
const TILE_W = Math.floor((COVER_W - GAP * (buffers.length - 1)) / buffers.length)
const tiles = await Promise.all(buffers.map(buf =>
  sharp(buf).resize(TILE_W, COVER_H, { fit: 'cover', position: 'centre' }).toBuffer(),
))
const cover = await sharp({
  create: { width: COVER_W, height: COVER_H, channels: 3, background: '#ffffff' },
})
  .composite(tiles.map((input, i) => ({ input, left: i * (TILE_W + GAP), top: 0 })))
  .webp({ quality: 80 })
  .toBuffer()
await writeFile(new URL('cover-2100.webp', OUT_DIR), cover)
console.log(`cover-2100.webp: ${(cover.length / 1024).toFixed(0)}KB`)
