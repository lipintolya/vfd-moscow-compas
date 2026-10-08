/**
 * Генерирует public/renders/contacts/<name>-{480,800,1100}.webp — фото
 * карточек «Что вы получаете» на /contacts/ (консультация, замер, гарантия)
 * — и src/data/contacts-images.json с размерами.
 *
 * Исходники в облаке разной формы (вертикальный, 4:3, 3:2), а в карточке
 * кадр 4:3 — поэтому режем здесь, по заданной точке кадра (focus), а не
 * object-fit в браузере: меньше вес и предсказуемый кадр. 1100 — для
 * телефонов с плотным экраном, где карточка во всю ширину.
 *
 * Запуск:        node scripts/gen-contacts-images.mjs
 * Когда запускать снова: заменили фото в contact.block или точку кадра.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const SRC = 'https://storage.yandexcloud.net/vfd.moscow.compass/contact.block/'
const OUT_DIR = new URL('../public/renders/contacts/', import.meta.url)
const WIDTHS = [480, 800, 1100]
const RATIO = 4 / 3

/* focus — доля ширины/высоты исходника, вокруг которой режем кадр 4:3 */
const PHOTOS = [
  { name: 'consultation', file: 'consultation_render.webp', focus: { x: 0.5, y: 0.25 } }, // лицо и руки консультанта
  { name: 'zamer',        file: 'zamer_render.webp',        focus: { x: 0.5, y: 0.5 } },
  { name: 'garantee',     file: 'garantee_render.webp',     focus: { x: 0.62, y: 0.5 } }, // щит справа от двери
]

await mkdir(OUT_DIR, { recursive: true })
const meta = {}
for (const p of PHOTOS) {
  const res = await fetch(SRC + p.file)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${SRC + p.file}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const { width: W, height: H } = await sharp(buf).metadata()

  // Наибольший кадр 4:3 внутри исходника, центр — в точке focus (с упором в края)
  const cw = Math.min(W, Math.round(H * RATIO))
  const ch = Math.round(cw / RATIO)
  const left = Math.max(0, Math.min(W - cw, Math.round(W * p.focus.x - cw / 2)))
  const top = Math.max(0, Math.min(H - ch, Math.round(H * p.focus.y - ch / 2)))

  for (const w of WIDTHS) {
    const out = await sharp(buf)
      .extract({ left, top, width: cw, height: ch })
      .resize({ width: Math.min(w, cw) })
      .webp({ quality: 78 })
      .toBuffer()
    await writeFile(new URL(`${p.name}-${w}.webp`, OUT_DIR), out)
    console.log(`${p.name}-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
  const big = Math.min(WIDTHS.at(-1), cw)
  meta[p.name] = { width: big, height: Math.round(big / RATIO) }
}

await writeFile(
  new URL('../src/data/contacts-images.json', import.meta.url),
  JSON.stringify({ widths: WIDTHS, photos: meta }, null, 2) + '\n',
)
