/**
 * Картинки страницы «Перегородки ALUM» (/partitions/alum/).
 *
 *   npm run gen:alum
 *
 * Берёт оригиналы из assets/alum-partitions/ (их и меняют — см. README там же)
 * и пишет облегчённые webp в public/renders/alum-partitions/:
 *   interior-{640,1000}.webp — фото интерьера для первого экрана;
 *   layouts-{960,1600}.webp  — схема всех раскладок;
 *   profile-colors-{640,1024}.webp, opti-white-{640,1024}.webp —
 *   справочные картинки.
 * Фото фабрики с её логотипом (раскладки, комплектующие) не берём —
 * раскладки на странице нарисованы (AlumLeaf).
 * Папка вывода пересобирается с нуля. Размеры (ширина × высота) нужны
 * разметке, чтобы страница не «прыгала», — скрипт печатает их, а в
 * src/data/alum-partitions.ts они записаны рядом с путями.
 */
import sharp from 'sharp'
import { mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const SRC = new URL('../assets/alum-partitions/', import.meta.url)
const OUT = new URL('../public/renders/alum-partitions/', import.meta.url)
const QUALITY = 78
/* sharp принимает путь строкой, не URL */
const path = (url) => fileURLToPath(url)

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

/* Справочные — по две ширины для srcset */
const INFO = {
  interior:         [640, 1000],
  layouts:          [960, 1600],
  'profile-colors': [640, 1024],
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
