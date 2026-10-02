/**
 * Генерирует public/renders/partitions/track-*.webp — пересжатые локальные
 * копии трёх «интерьерных» фото в блоке «Типы направляющих»
 * (src/data/partitions.ts, tracks[].imgs[0]) на странице /partitions.
 *
 * Оригиналы (alum-first/second/third.webp на Yandex Cloud storage) весят
 * 1.3-2.1МБ при 1536×1024/1024×1024 — судя по размеру, пересжаты почти без
 * потерь, хотя показываются в узкой aspect-4/3 карточке (~1/3 ширины
 * контейнера, ~350-420px на экране). Остальные картинки в тех же слайдерах
 * (схемы/направляющие) весят 25-77КБ — эти три сильно выбиваются.
 *
 * Запуск:        node scripts/gen-partitions-tracks.mjs
 * Когда запускать снова: если исходники в partitions.ts (tracks[].imgs[0])
 * поменяли на другие URL.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/partitions/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const jobs = [
  { src: 'https://storage.yandexcloud.net/catalog-vfd/alum_info/alum-first.webp',  out: 'track-1.webp', width: 700, quality: 76 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/alum_info/alum-second.webp', out: 'track-2.webp', width: 700, quality: 76 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/alum_info/alum-third.webp',  out: 'track-3.webp', width: 700, quality: 76 },
]

for (const { src, out, width, quality } of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
