/**
 * Перегенерирует public/renders/hidden-doors/*.webp — уменьшенные локальные
 * копии ключевых фото серий «Секрет»/«Секрет Реверс»/«Рефлекс».
 *
 * Зачем: оригиналы на Yandex Cloud — 1122×1402 / 1672×941 (60-156 КБ), а
 * реальный экранный размер в вёрстке (товарная карточка на /catalog/
 * skrytye-dveri/, hero на 5 сегментных лендингах) — максимум ~900px по
 * широкой стороне даже на десктопе. Эти три файла используются суммарно
 * на 6 страницах (главная + 4 сегментных лендинга + /raboty/), поэтому
 * экономия применяется сразу везде.
 *
 * Плюс фото первого экрана /catalog/skrytye-dveri/ с кадровкой под экран
 * (<picture>): hero-wide-* для компьютера (16:7) и hero-tall-* для
 * телефона (4:5, кадр по двери). Оригинал — 1920×1080.
 *
 * Запуск: node scripts/gen-hidden-doors-hero.mjs
 * Когда запускать снова: если оригиналы в облаке заменили на новые фото.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/hidden-doors/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const HERO_SRC = 'https://storage.yandexcloud.net/vfd74ru/invisible/invisible_cover.webp'

const jobs = [
  { src: 'https://storage.yandexcloud.net/catalog-vfd/invisible/invisible.webp',         out: 'sekret-900.webp',       width: 900, quality: 80 },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/invisible/invisible_reverse.webp', out: 'sekret-revers-900.webp', width: 900, quality: 80 },
  { src: 'https://storage.yandexcloud.net/vfd74ru/invisible/invisible_door.webp',        out: 'reflex-900.webp',       width: 900, quality: 80 },

  // Первый экран: 16:7 — компьютер, 4:5 — телефон (кадр по двери)
  { src: HERO_SRC, out: 'hero-wide-960.webp',  width: 960,  height: 420,  quality: 78 },
  { src: HERO_SRC, out: 'hero-wide-1600.webp', width: 1600, height: 700,  quality: 78 },
  { src: HERO_SRC, out: 'hero-tall-640.webp',  width: 640,  height: 800,  quality: 78, position: 'attention' },
  { src: HERO_SRC, out: 'hero-tall-1080.webp', width: 1080, height: 1350, quality: 78, position: 'attention' },
]

const cache = new Map()
for (const { src, out, width, height, quality, position } of jobs) {
  if (!cache.has(src)) {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
    cache.set(src, Buffer.from(await res.arrayBuffer()))
  }
  const buf = cache.get(src)
  const resized = await sharp(buf)
    .resize({ width, height, fit: 'cover', position: position ?? 'centre', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
