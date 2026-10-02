/**
 * Перегенерирует public/renders/partitions/color-swatch-{1..13}.webp из
 * оригиналов на storage.yandexcloud.net/catalog-vfd/alum_info/colors-profile/.
 *
 * Зачем: оригиналы — JPG 1000×1000 (~45-56 КБ каждый), а в вёрстке
 * (SwatchGrid, variant="square") показываются на 300×300 — с учётом
 * retina ×2 реально нужно 600×600. JPG на фотографиях текстуры профиля
 * (шум/зерно) даёт artefacts на границах, где WebP той же субъективной
 * чёткости весит меньше при том же размере. PhotoLightbox переиспользует
 * тот же <img>.src для полноразмерного просмотра (см. partitions.astro),
 * поэтому 600px — сознательный компромис между весом и чёткостью лайтбокса
 * для одноцветных свотчей профиля (не детальных фото товара).
 *
 * Запуск: node scripts/gen-partitions-color-swatches.mjs
 * Когда запускать снова: если добавили/убрали цвет профиля в data/partitions.ts
 * (обновить count ниже) или заменили оригиналы в облаке.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const BASE  = 'https://storage.yandexcloud.net/catalog-vfd/alum_info/colors-profile'
const OUT   = new URL('../public/renders/partitions/', import.meta.url)
const COUNT = 13

await mkdir(OUT, { recursive: true })

for (let i = 1; i <= COUNT; i++) {
  const res = await fetch(`${BASE}/${i}.jpg`)
  if (!res.ok) throw new Error(`${i}.jpg: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const resized = await sharp(buf).resize({ width: 600, height: 600 }).webp({ quality: 82 }).toBuffer()
  const out = `color-swatch-${i}.webp`
  await writeFile(new URL(out, OUT), resized)

  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
