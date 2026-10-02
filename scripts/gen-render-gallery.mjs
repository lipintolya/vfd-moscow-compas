/**
 * Перегенерирует public/renders/alum-covers/*.webp из оригиналов
 * на storage.yandexcloud.net/catalog-vfd/covers/alum_covers/{N}.webp.
 *
 * Зачем локальные копии, а не прямая ссылка на облако:
 * оригиналы — полноразмерные .webp до 7000px / ~2 МБ. Astro в dev-режиме
 * оптимизирует remote-картинки на КАЖДЫЙ запрос без кеша на диск (секунды
 * на каждую), а getImage({ inferSize: true, width }) без явного height
 * в Astro 6.4.4 вообще подставляет original height вместо пропорционального
 * (см. git history) — даёт принудительный crop. Поэтому: один раз сжимаем
 * сами через sharp (он сохраняет пропорции корректно) и кладём в public/.
 *
 * Запуск:  node scripts/gen-render-gallery.mjs
 * Когда запускать снова: если в src/data/partitions.ts изменилось число
 * рендеров (renderGallery) или сами оригиналы в облаке заменили.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const BASE = 'https://storage.yandexcloud.net/catalog-vfd/covers/alum_covers'
const OUT = new URL('../public/renders/alum-covers/', import.meta.url)
const N = 38
const CONCURRENCY = 6

await mkdir(OUT, { recursive: true })

async function processOne(i) {
  const res = await fetch(`${BASE}/${i}.webp`)
  if (!res.ok) throw new Error(`${i}.webp: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const lightbox = await sharp(buf).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
  await writeFile(new URL(`${i}.webp`, OUT), lightbox)

  const preview = await sharp(buf).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer()
  await writeFile(new URL(`${i}-preview.webp`, OUT), preview)

  const meta = await sharp(lightbox).metadata()
  console.log(`${i}: ${meta.width}x${meta.height}  lb=${(lightbox.length / 1024).toFixed(0)}KB prev=${(preview.length / 1024).toFixed(0)}KB`)
}

const indices = Array.from({ length: N }, (_, i) => i + 1)
for (let i = 0; i < indices.length; i += CONCURRENCY) {
  await Promise.all(indices.slice(i, i + CONCURRENCY).map(processOne))
}
console.log('done')
