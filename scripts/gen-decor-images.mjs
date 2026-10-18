/**
 * Облегчённые копии фото страницы «Декор» (/catalog/decor/) и блока
 * «Плинтус» на страницах моделей: исходники — public/media/vfd74ru/decor/
 * (копии в проекте, без облака) → public/renders/decor/<name>-<w>.webp
 * + размеры кадров в src/data/decor-images.json. Страница берёт копию под
 * ширину экрана (srcset), крупная — в окне просмотра.
 *
 * Запуск: npm run gen:decor — когда фото декора добавили или заменили
 * (новое фото — новое имя файла: картинки кэшируются в браузерах на неделю).
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const SRC = new URL('../public/media/vfd74ru/decor/', import.meta.url)
const OUT = new URL('../public/renders/decor/', import.meta.url)

/* widths — от телефона до крупного кадра в окне просмотра (не больше исходника) */
const PHOTOS = [
  { name: 'hero',    file: 'render_framuga.webp',        widths: [640, 1024, 1672] },
  { name: 'framuga', file: 'framuga_type.webp',          widths: [640, 1280, 1920] },
  { name: 'plintus', file: 'plintus/plintus_type.webp',  widths: [640, 1280, 1920] },
  { name: 'reyki-1', file: 'reika/reyki_1.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-2', file: 'reika/reyki_2.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-3', file: 'reika/reyki_3.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-4', file: 'reika/reyki_4.webp',         widths: [400, 800, 1265] },
]

await mkdir(OUT, { recursive: true })
const meta = {}
for (const p of PHOTOS) {
  const buf = await readFile(new URL(p.file, SRC))
  const { width: W, height: H } = await sharp(buf).metadata()
  const widths = [...new Set(p.widths.map((w) => Math.min(w, W)))]
  for (const w of widths) {
    const out = await sharp(buf).resize({ width: w }).webp({ quality: 78 }).toBuffer()
    await writeFile(new URL(`${p.name}-${w}.webp`, OUT), out)
    console.log(`${p.name}-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
  meta[p.name] = { widths, width: W, height: H }
}
await writeFile(new URL('../src/data/decor-images.json', import.meta.url), JSON.stringify(meta, null, 2) + '\n')
