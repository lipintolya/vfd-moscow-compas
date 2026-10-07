/**
 * Генерирует public/renders/mall/compass-N-{640,1170}.webp — облегчённые
 * копии фото ТЦ «Компас» с улицы (блок «Как к нам добраться», VisitBand)
 * и src/data/mall-photos.json с размерами кадров (width/height для <img>,
 * без сдвига вёрстки). Подписи и адресные данные — в src/data/mall-photos.ts.
 *
 * В ряду на ПК плитка ~300 px CSS — грузится 640 (1x и retina до ~2x);
 * 1170 — исходная ширина, для широких экранов и LocalBusiness.image.
 *
 * Запуск:        node scripts/gen-mall-photos.mjs
 * Когда запускать снова: если фото в about.block/compass_hall поменяли.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const SRC = 'https://storage.yandexcloud.net/vfd.moscow.compass/about.block/compass_hall/'
const COUNT = 4
const WIDTHS = [640, 1170]
const OUT_DIR = new URL('../public/renders/mall/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

const photos = []
for (let n = 1; n <= COUNT; n++) {
  const src = `${SRC}hall_compass_${n}.webp`
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const meta = await sharp(buf).metadata()
  for (const w of WIDTHS) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer()
    await writeFile(new URL(`compass-${n}-${w}.webp`, OUT_DIR), out)
    console.log(`compass-${n}-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
  const big = Math.min(WIDTHS.at(-1), meta.width)
  photos.push({ n, width: big, height: Math.round(meta.height * big / meta.width) })
}
await writeFile(
  new URL('../src/data/mall-photos.json', import.meta.url),
  JSON.stringify({ widths: WIDTHS, photos }, null, 2) + '\n',
)
