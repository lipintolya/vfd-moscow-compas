/**
 * Картинки страницы «Перегородки ALUM фабрики ОНИКС» (/partitions/oniks-alum/).
 *
 *   npm run gen:oniks
 *
 * Берёт оригиналы из assets/oniks-alum/ (их и меняют — см. README там же)
 * и пишет облегчённые webp в public/renders/oniks-alum/:
 *   models/alum-01.webp …  — фото раскладок (ширина как у оригинала, ≤ 480);
 *   interior-{640,1000}.webp — фото интерьера для первого экрана;
 *   layouts-{960,1600}.webp  — схема всех раскладок;
 *   profile-colors-{640,1024}.webp, components-{640,1024}.webp,
 *   opti-white-{640,1024}.webp — справочные картинки.
 * Папка вывода пересобирается с нуля. Размеры (ширина × высота) нужны
 * разметке, чтобы страница не «прыгала», — скрипт печатает их, а в
 * src/data/oniks-alum.ts они записаны рядом с путями.
 */
import sharp from 'sharp'
import { readdir, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const SRC = new URL('../assets/oniks-alum/', import.meta.url)
const OUT = new URL('../public/renders/oniks-alum/', import.meta.url)
const QUALITY = 78
/* sharp принимает путь строкой, не URL */
const path = (url) => fileURLToPath(url)

await rm(OUT, { recursive: true, force: true })
await mkdir(new URL('models/', OUT), { recursive: true })

/* Фото раскладок — вертикальные карточки */
for (const file of (await readdir(new URL('models/', SRC))).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
  const name = file.replace(/\.[a-z]+$/i, '')
  const info = await sharp(path(new URL(`models/${file}`, SRC)))
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path(new URL(`models/${name}.webp`, OUT)))
  console.log(`models/${name}.webp`.padEnd(30), `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`)
}

/* Справочные — по две ширины для srcset */
const INFO = {
  interior:         [640, 1000],
  layouts:          [960, 1600],
  'profile-colors': [640, 1024],
  components:       [640, 1024],
  'opti-white':     [640, 1024],
}
for (const [name, widths] of Object.entries(INFO)) {
  for (const w of widths) {
    const info = await sharp(path(new URL(`info/${name}.jpg`, SRC)))
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(path(new URL(`${name}-${w}.webp`, OUT)))
    console.log(`${name}-${w}.webp`.padEnd(30), `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`)
  }
}
