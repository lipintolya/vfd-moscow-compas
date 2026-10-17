/**
 * Фото салона от владельца (assets/, 900×1200) → уменьшенные копии
 * NAME-N-480.webp (сетка, 1x) и -900.webp (retina и окно просмотра)
 * + размеры кадров в src/data/<набор>-photos.json:
 *
 *   assets/showroom/ → public/renders/about/showroom-*    (шоурум, /about/)
 *   assets/salon/    → public/renders/contacts/salon-*    (вход и консультация, /contacts/)
 *
 * Запуск: npm run gen:showroom — когда фото в этих папках добавили или
 * заменили. Подписи — src/data/about-page.ts (SHOWROOM) и contacts-page.ts (SALON).
 */
import sharp from 'sharp'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'

const WIDTHS = [480, 900]
const SETS = [
  { src: 'assets/showroom/', out: 'public/renders/about/', name: 'showroom', json: 'src/data/showroom-photos.json' },
  { src: 'assets/salon/', out: 'public/renders/contacts/', name: 'salon', json: 'src/data/salon-photos.json' },
]
const root = new URL('../', import.meta.url)

for (const set of SETS) {
  const SRC = new URL(set.src, root)
  const OUT = new URL(set.out, root)
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(SRC)).filter((f) => /^\d+\.webp$/.test(f)).sort()
  const photos = []
  for (const f of files) {
    const n = Number(f.replace('.webp', ''))
    const buf = await readFile(new URL(f, SRC))
    const meta = await sharp(buf).metadata()
    for (const w of WIDTHS) {
      const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
      await writeFile(new URL(`${set.name}-${n}-${w}.webp`, OUT), out)
      console.log(`${set.name}-${n}-${w}.webp: ${(out.length / 1024).toFixed(0)}KB`)
    }
    const big = Math.min(WIDTHS.at(-1), meta.width)
    photos.push({ n, width: big, height: Math.round(meta.height * big / meta.width) })
  }
  await writeFile(new URL(set.json, root), JSON.stringify({ widths: WIDTHS, photos }, null, 2) + '\n')
}
