/**
 * Генерирует public/renders/partitions/hero-*.webp — фото первого экрана
 * /partitions/ с разной кадровкой под экран (<picture>, src/data/partitions.ts →
 * heroImages):
 *   - hero-wide-*  — широкий кадр для компьютера (гостиная с рифлёным
 *     стеклом, alum-1, 1600×712);
 *   - hero-tall-*  — вертикальный 4:5 для телефона (спальня с чёрным
 *     профилем, alum-3, 3000×3000 — широкий кадр на узком экране
 *     обрезался бы до середины и растягивался бы по высоте).
 * Оригиналы весят до 4 МБ, здесь — облегчённые копии по ширине показа.
 *
 * Плюс обложки (poster) двух видео страницы — кадр из ролика, чтобы до
 * загрузки видео на его месте было фото, а не чёрный прямоугольник.
 * Нужен ffmpeg (brew install ffmpeg).
 *
 * Запуск:        node scripts/gen-partitions-hero.mjs
 * Когда запускать снова: если сменили исходные фото или видео.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const OUT_DIR = new URL('../public/renders/partitions/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const CDN = 'https://storage.yandexcloud.net/catalog-vfd/alum'
const sources = {
  wide: `${CDN}/alum-1.webp`,
  tall: `${CDN}/alum-3.webp`,
}

const jobs = [
  { from: 'wide', out: 'hero-wide-960.webp',  width: 960 },
  { from: 'wide', out: 'hero-wide-1600.webp', width: 1600 },
  // 4:5, центр кадра правее середины — там перегородка
  { from: 'tall', out: 'hero-tall-640.webp',  width: 640,  height: 800,  position: 'attention' },
  { from: 'tall', out: 'hero-tall-1080.webp', width: 1080, height: 1350, position: 'attention' },
]

const buffers = {}
for (const [key, url] of Object.entries(sources)) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${url}`)
  buffers[key] = Buffer.from(await res.arrayBuffer())
}

for (const { from, out, width, height, position } of jobs) {
  const img = await sharp(buffers[from])
    .resize({ width, height, fit: 'cover', position: position ?? 'centre', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer()
  await writeFile(new URL(out, OUT_DIR), img)
  const meta = await sharp(img).metadata()
  console.log(`${out}: ${meta.width}×${meta.height}, ${(img.length / 1024).toFixed(0)} КБ`)
}

/* ── Обложки видео: кадр на 1-й секунде ── */
const VIDEO = 'https://storage.yandexcloud.net/catalog-vfd/video'
const posters = [
  { src: `${VIDEO}/alum_animation.mp4`, out: 'poster-animation.webp', width: 1280 },
  { src: `${VIDEO}/pivot_system.mp4`,   out: 'poster-pivot.webp',     width: 720 },
]
for (const { src, out, width } of posters) {
  const frame = execFileSync('ffmpeg', ['-v', 'error', '-ss', '1', '-i', src, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 64 * 1024 * 1024 })
  const img = await sharp(frame).resize({ width, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), img)
  const meta = await sharp(img).metadata()
  console.log(`${out}: ${meta.width}×${meta.height}, ${(img.length / 1024).toFixed(0)} КБ`)
}
