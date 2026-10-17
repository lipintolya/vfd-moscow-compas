/**
 * Фото шоурума для /about/ (assets/showroom/NN.webp, 900×1200) →
 * public/renders/about/showroom-N-480.webp (сетка, 1x) и -900.webp
 * (retina и окно просмотра) + размеры кадров в src/data/showroom-photos.json.
 *
 * Запуск: npm run gen:showroom — когда фото в assets/showroom добавили
 * или заменили. Подписи — src/data/about-page.ts (SHOWROOM).
 */
import sharp from 'sharp'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'

const SRC = new URL('../assets/showroom/', import.meta.url)
const OUT = new URL('../public/renders/about/', import.meta.url)
const WIDTHS = [480, 900]
await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /^\d+\.webp$/.test(f)).sort()
const photos = []
for (const f of files) {
  const n = Number(f.replace('.webp', ''))
  const buf = await readFile(new URL(f, SRC))
  const meta = await sharp(buf).metadata()
  for (const w of WIDTHS) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
    await writeFile(new URL(`showroom-${n}-${w}.webp`, OUT), out)
    console.log(`showroom-${n}-${w}.webp: ${(out.length / 1024).toFixed(0)}KB`)
  }
  const big = Math.min(WIDTHS.at(-1), meta.width)
  photos.push({ n, width: big, height: Math.round(meta.height * big / meta.width) })
}
await writeFile(new URL('../src/data/showroom-photos.json', import.meta.url), JSON.stringify({ widths: WIDTHS, photos }, null, 2) + '\n')
