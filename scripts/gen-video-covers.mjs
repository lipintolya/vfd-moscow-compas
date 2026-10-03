/**
 * Генерирует обложки карточек «Видео о дверях» (src/components/home/Videos.astro)
 * из кадра самого ролика: public/renders/home/videos/<id>.webp, 2:3.
 *
 * Список роликов — src/data/videos.ts: берутся записи с `src` и `cover`.
 * Кадр — начало ролика или `coverAt`, если задан. Затемнение обложки —
 * стилем карточки, файл остаётся чистым. ffmpeg читает ролик по ссылке
 * и скачивает только нужный кусок, без всего файла.
 *
 * Нужен ffmpeg (brew install ffmpeg).
 * Запуск: npm run gen:video-covers
 * Когда запускать снова: добавили или заменили ролик.
 */
import sharp from 'sharp'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VIDEOS } from '../src/data/videos.ts'

const PUBLIC = fileURLToPath(new URL('../public', import.meta.url))
const WIDTH = 640       // карточка ≤ 17rem в ширину (~540px с retina) → 640px с запасом
const RATIO = 3 / 2     // высота к ширине — как aspect-ratio .vid__cover в Videos.astro

/** Один кадр ролика в PNG — без перекодирования всего файла */
function grabFrame(src, at) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error',
      '-ss', String(at), '-i', src,
      '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', 'pipe:1',
    ])
    const chunks = []
    let err = ''
    ff.stdout.on('data', (c) => chunks.push(c))
    ff.stderr.on('data', (c) => { err += c })
    ff.on('error', reject)
    ff.on('close', (code) => code === 0
      ? resolve(Buffer.concat(chunks))
      : reject(new Error(`ffmpeg ${code} на ${src}: ${err.trim()}`)))
  })
}

for (const v of VIDEOS) {
  if (!v.src || !v.cover) continue
  const at = v.coverAt ?? 0
  const out = PUBLIC + v.cover
  const frame = await grabFrame(v.src, at)
  // Из кадра 9:16 вырезаем 2:3 от верхнего края: там обычно лицо или
  // предмет, а в центре — красная кнопка «плей» и вшитые субтитры
  const img = await sharp(frame)
    .resize({ width: WIDTH, height: Math.round(WIDTH * RATIO), fit: 'cover', position: 'top' })
    .webp({ quality: 80, effort: 6 })
    .toBuffer()
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, img)
  console.log(`${v.cover.padEnd(44)} ${(img.length / 1024).toFixed(1).padStart(6)}KB  (кадр ${at} с)`)
}
