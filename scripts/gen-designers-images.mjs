/**
 * Перегенерирует public/renders/designers/*.webp — локальные копии тяжёлых
 * remote-картинок страницы /designers/.
 *
 * Зачем: designers-hero.webp (первый слайд hero) уже был оптимизирован
 * вручную (1.3МБ → 70КБ, см. комментарий в designers.astro) как разовый
 * прецедент, но второй слайд того же слайдера (image2.webp, 1672×941)
 * остался нетронутым — 1.26 МБ. Ещё 4 картинки блока «Формат
 * взаимодействия» (grid-cols-4 на десктопе, карточка ~280-300px CSS-
 * шириной) отдавались оригиналами 1448-1536px (142-285 КБ каждая) — при
 * реальном размере отображения нужно в 5 раз меньше.
 *
 * Запуск: node scripts/gen-designers-images.mjs
 * Когда запускать снова: если заменили исходники в облаке.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/designers/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const jobs = [
  // Hero-слайдер, второй слайд — тот же паттерн, что уже применён к первому
  // (designers-hero.webp), полноширинный кадр, поэтому 1600px с запасом.
  { src: 'https://storage.yandexcloud.net/catalog-vfd/designers/image2.webp', out: 'hero-slide-2.webp', width: 1600, quality: 80 },
  // «Формат взаимодействия» — 4 карточки в ряд на десктопе, ~300px CSS-ширина.
  { src: 'https://storage.yandexcloud.net/catalog-vfd/designers/covers_second_block/designer_render.webp', out: 'step-consultation.webp', width: 700, quality: 78 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/designers/covers_second_block/tz_render.webp',       out: 'step-tz.webp',           width: 700, quality: 78 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/designers/covers_second_block/dogovor_render.webp',  out: 'step-dogovor.webp',      width: 700, quality: 78 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/designers/covers_second_block/dostavka_render.webp', out: 'step-dostavka.webp',     width: 700, quality: 78 },
  // Перелинковка «Больше решений» — 3 карточки в ряд на десктопе, ~400px CSS-ширина.
  { src: 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/cover_doors.webp',   out: 'cross-doors.webp',      width: 900, quality: 78 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/catalog_preview/catalog-preview3.webp', out: 'cross-partitions.webp', width: 900, quality: 78 },
  { src: 'https://storage.yandexcloud.net/vfd74ru/decor/render_framuga.webp',                out: 'cross-decor.webp',      width: 900, quality: 78 },
]

for (const { src, out, width, quality } of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
