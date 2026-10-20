/**
 * Облегчённые копии фото страницы «Декор» (/catalog/decor/) и блока
 * «Плинтус» на страницах моделей: исходники — public/media/vfd74ru/decor/
 * (копии в проекте, без облака) → public/renders/decor/<name>-<w>.webp
 * + размеры кадров в src/data/decor-images.json. Страница берёт копию под
 * ширину экрана (srcset), крупная — в окне просмотра.
 *
 * Кадры первого экрана (LandingHero, <picture>) — hero-wide (16:7, компьютер)
 * и hero-tall (4:5, телефон; кадр по двери и рейкам) из того же рендера.
 *
 * Запуск: npm run gen:decor — когда фото декора добавили или заменили
 * (новое фото — новое имя файла: картинки кэшируются в браузерах на неделю).
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const SRC = new URL('../public/media/vfd74ru/decor/', import.meta.url)
const OUT = new URL('../public/renders/decor/', import.meta.url)

/* widths — от телефона до крупного кадра в окне просмотра (не больше исходника);
   ratio + focus — кадрировать под пропорцию (focus — доля ширины, где центр кадра) */
const PHOTOS = [
  { name: 'hero',      file: 'render_framuga.webp',      widths: [640, 1024, 1672] },
  { name: 'hero-wide', file: 'render_framuga.webp',      widths: [960, 1600], ratio: 16 / 7, focus: 0.5 },
  { name: 'hero-tall', file: 'render_framuga.webp',      widths: [640, 752],  ratio: 4 / 5,  focus: 0.38 },
  { name: 'framuga', file: 'framuga_type.webp',          widths: [640, 1280, 1920] },
  { name: 'plintus', file: 'plintus/plintus_type.webp',  widths: [640, 1280, 1920] },
  { name: 'reyki-1', file: 'reika/reyki_1.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-2', file: 'reika/reyki_2.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-3', file: 'reika/reyki_3.webp',         widths: [400, 800, 1265] },
  { name: 'reyki-4', file: 'reika/reyki_4.webp',         widths: [400, 800, 1265] },
]

/* Наибольший кадр пропорции ratio; по ширине — с центром в focus */
async function crop(buf, ratio, focus) {
  const { width: W, height: H } = await sharp(buf).metadata()
  const w = Math.min(W, Math.round(H * ratio))
  const h = Math.min(H, Math.round(w / ratio))
  const left = Math.max(0, Math.min(W - w, Math.round(W * focus - w / 2)))
  return sharp(buf).extract({ left, top: Math.round((H - h) / 2), width: w, height: h }).toBuffer()
}

await mkdir(OUT, { recursive: true })
const meta = {}
for (const p of PHOTOS) {
  const src = await readFile(new URL(p.file, SRC))
  const buf = p.ratio ? await crop(src, p.ratio, p.focus) : src
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
