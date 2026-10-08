/**
 * Генерирует кадры слайдера первого экрана /designers/ (LandingHero, <picture>):
 *   public/renders/designers/hero-<N>-wide-{960,1600}.webp — компьютер, 16:7
 *   public/renders/designers/hero-<N>-tall-{640,750}.webp  — телефон, 4:5
 * и src/data/designers-hero.json — по слайду: { wide: [...], tall: [...] }.
 *
 * Исходники — рендеры интерьеров 1672×941: первый лежит в проекте
 * (облачного оригинала нет), остальные — в облаке. Вертикальный кадр —
 * вокруг focusX (доля ширины), его ширина ограничена высотой исходника:
 * 941 × 4/5 ≈ 753 px, поэтому крупнее 750 не делаем.
 *
 * Запуск:        node scripts/gen-designers-hero.mjs
 * Когда запускать снова: добавили или заменили слайд, поменяли focusX.
 * Порядок здесь — порядок слайдов; подписи (alt) — в src/data/designers-page.ts.
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const CLOUD = 'https://storage.yandexcloud.net/vfd.moscow.compass/designers.block/'
const OUT_DIR = new URL('../public/renders/designers/', import.meta.url)

const SLIDES = [
  { file: new URL('../public/renders/hero/designers-hero.webp', import.meta.url), focusX: 0.4 },  // скрытая дверь в панелях
  { url: CLOUD + 'designer_perfomance.webp',  focusX: 0.32 },  // скрытая дверь в цвет стены — слева
  { url: CLOUD + 'designer_perfomance2.webp', focusX: 0.5 },   // коридор — по центру
]

const load = async (s) => {
  if (s.file) return readFile(s.file)
  const res = await fetch(s.url)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${s.url}`)
  return Buffer.from(await res.arrayBuffer())
}

await mkdir(OUT_DIR, { recursive: true })
const meta = []
for (const [i, s] of SLIDES.entries()) {
  const n = i + 1
  const buf = await load(s)
  const { width: W, height: H } = await sharp(buf).metadata()
  const crop = (ratio, focusX) => {
    const cw = Math.min(W, Math.round(H * ratio))
    const ch = Math.min(H, Math.round(cw / ratio))
    const left = Math.max(0, Math.min(W - cw, Math.round(W * focusX - cw / 2)))
    const top = Math.round((H - ch) / 2)
    return { left, top, width: cw, height: ch }
  }
  const variants = {
    wide: { box: crop(16 / 7, 0.5), widths: [960, 1600] },
    tall: { box: crop(4 / 5, s.focusX), widths: [640, 750] },
  }
  const slide = {}
  for (const [name, { box, widths }] of Object.entries(variants)) {
    slide[name] = []
    for (const w of widths) {
      const width = Math.min(w, box.width)
      const out = await sharp(buf).extract(box).resize({ width }).webp({ quality: 80 }).toBuffer()
      const { height } = await sharp(out).metadata()
      const base = `hero-${n}-${name}-${w}.webp`
      await writeFile(new URL(base, OUT_DIR), out)
      slide[name].push({ file: `/renders/designers/${base}`, width, height })
      console.log(`${base}: ${width}×${height}, ${(out.length / 1024).toFixed(0)}KB`)
    }
  }
  meta.push(slide)
}

await writeFile(new URL('../src/data/designers-hero.json', import.meta.url), JSON.stringify(meta, null, 2) + '\n')
