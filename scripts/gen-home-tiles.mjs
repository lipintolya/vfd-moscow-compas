/**
 * Генерирует public/renders/home/door-dorren-polar.webp — дверь для плитки
 * «Наши работы» на первом экране главной (ShowroomHero.astro).
 *
 * Зачем локальная копия: оригинал в облаке (WebP с прозрачностью, ALPH +
 * VP8) Chrome не декодирует — картинка приходит с кодом 200, но
 * naturalWidth = 0, и в плитке вместо двери пусто. sharp/libvips тот же
 * файл читает; после пересжатия Chrome показывает его нормально. Заодно
 * уменьшаем до реального размера: в плитке дверь ≤ 17rem в высоту
 * (~550px с retina) → 720px с запасом.
 *
 * Запуск: node scripts/gen-home-tiles.mjs
 * Когда запускать снова: если заменили дверь в облаке.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT = new URL('../public/renders/home/', import.meta.url)
await mkdir(OUT, { recursive: true })

const CDN = 'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/hero.block.main/'

const jobs = [
  [CDN + 'dorren_58dg0_polar.webp', 'door-dorren-polar.webp', { height: 720 }],
]

for (const [src, out, { height }] of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = await sharp(buf)
    .resize({ height, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 100, effort: 6 })
    .toBuffer()
  await writeFile(new URL(out, OUT), img)
  console.log(`${out.padEnd(26)} ${(buf.length / 1024).toFixed(1).padStart(6)}KB -> ${(img.length / 1024).toFixed(1).padStart(6)}KB`)
}
