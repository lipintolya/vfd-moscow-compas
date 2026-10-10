/**
 * Облегчённый ролик для сайта + кадр-обложка (poster).
 *
 *   node scripts/optimize-video.mjs <источник: URL или путь> <выход без расширения> [секунда кадра]
 *   node scripts/optimize-video.mjs https://…/clip.mp4 public/renders/vfd-design/louvre-door 3
 *
 * Пишет <выход>.mp4 (H.264 + AAC, faststart — начинает играть, не
 * докачав файл; ширина не больше 720) и <выход>-poster.webp (кадр для
 * обложки, ширина 540). Ролик на странице грузится только по нажатию
 * «плей» (InlineVideo.astro, preload="none") — обложка видна сразу.
 * Нужен ffmpeg (brew install ffmpeg).
 */
import { execFileSync } from 'node:child_process'
import { statSync, mkdirSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const [src, out, at = '0'] = process.argv.slice(2)
if (!src || !out) {
  console.error('Использование: node scripts/optimize-video.mjs <источник> <выход без расширения> [секунда кадра]')
  process.exit(1)
}
mkdirSync(dirname(out), { recursive: true })

let input = src
if (/^https?:\/\//.test(src)) {
  input = join(tmpdir(), `optimize-video-${Date.now()}.mp4`)
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const { writeFileSync } = await import('node:fs')
  writeFileSync(input, Buffer.from(await res.arrayBuffer()))
}

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

ff([
  '-i', input,
  '-vf', "scale='min(720,iw)':-2",
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '64k',
  '-movflags', '+faststart',
  `${out}.mp4`,
])

const frame = join(tmpdir(), `optimize-video-${Date.now()}.png`)
ff(['-ss', at, '-i', input, '-frames:v', '1', frame])
await sharp(frame).resize({ width: 540 }).webp({ quality: 74 }).toFile(`${out}-poster.webp`)
rmSync(frame)
if (input !== src) rmSync(input)

const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`
console.log(`${out}.mp4 — ${kb(`${out}.mp4`)}, ${out}-poster.webp — ${kb(`${out}-poster.webp`)}`)
