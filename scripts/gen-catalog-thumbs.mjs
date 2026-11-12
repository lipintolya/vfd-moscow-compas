/**
 * Облегчённые копии фото каталога для карточек (CatalogProductCard): каталог,
 * посадочные, серии, «Другие модели серии». Исходники — зеркало бакета в
 * public/media (их не трогаем: копия байт в байт), а весят они 100–260 КБ
 * при ширине ~500 px — плохо сжаты; Lighthouse насчитал ~1,1 МБ лишнего на
 * /catalog/ (аудит 12 Nov 2026). Копии — 280, 400 и 560 px (две карточки в ряд на
 * телефоне — 400, на ретине — 560), не шире исходника, WebP q78:
 * обычно в 3–5 раз легче; карточка выбирает по srcset.
 *
 * Путь копии выводится из пути исходника (src/lib/catalog-thumb.ts):
 *   /media/<папка>/<путь>.webp → /renders/catalog-thumbs/<папка>/<путь>-<280|400|560>.webp
 * Сборка падает, если у фото карточки нет копии (src/lib/catalog-data.ts).
 *
 * Запуск: npm run gen:catalog-thumbs — после npm run media:pull (новые фото
 * каталога). Делает только недостающие и устаревшие копии, лишние удаляет.
 */
import sharp from 'sharp'
import { readdir, stat, mkdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const DIRS = ['vfd74ru/catalog', 'catalog-vfd']
const WIDTHS = [280, 400, 560]
const QUALITY = 78
const OUT = path.join(ROOT, 'public/renders/catalog-thumbs')

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(p))
    else if (/\.(webp|jpe?g|png)$/i.test(e.name)) out.push(p)
  }
  return out
}

const wanted = new Set()
let made = 0, kept = 0, before = 0, after = 0
for (const d of DIRS) {
  const base = path.join(ROOT, 'public/media', d)
  for (const src of await walk(base)) {
    const rel = path.relative(path.join(ROOT, 'public/media'), src).replace(/\.(webp|jpe?g|png)$/i, '')
    const s = await stat(src)
    for (const width of WIDTHS) {
      const out = path.join(OUT, `${rel}-${width}.webp`)
      wanted.add(out)
      const o = await stat(out).catch(() => null)
      if (o && o.mtimeMs >= s.mtimeMs) { kept++; continue }
      await mkdir(path.dirname(out), { recursive: true })
      const info = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out)
      if (width === WIDTHS.at(-1)) before += s.size
      after += info.size; made++
    }
  }
}
/* Копии фото, которых больше нет в зеркале */
let removed = 0
for (const f of await walk(OUT).catch(() => [])) if (!wanted.has(f)) { await unlink(f); removed++ }
console.log(`catalog-thumbs: сделано ${made} (${(before / 1048576).toFixed(1)} → ${(after / 1048576).toFixed(1)} МБ), без изменений ${kept}, удалено ${removed}`)
