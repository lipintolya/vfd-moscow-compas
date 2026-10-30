/**
 * Фото входных дверей на /catalog/vhodnye-dveri/: исходники — assets/entrance-doors/
 * (<модель>-<n>.webp, кадр в рост или обрезан снизу, метка в углу закрашена — см. README там) → public/renders/entrance-doors/
 * <имя>-<ширина>.webp + размеры в src/data/entrance-doors-images.json
 * (его читает src/data/entrance-doors.ts).
 *
 * В имени копии — хеш исходника (<имя>-<хеш>-<ширина>.webp): заменили фото —
 * адрес новый, кэш браузера и nginx не подсунет старое.
 *
 * Ширины: 520 — карточка и сетка вариантов, 1000 — крупно и ретина; не шире
 * исходника. Запуск: npm run gen:entrance-doors — когда фото в assets/
 * добавили или заменили.
 */
import sharp from 'sharp'
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const root = new URL('../', import.meta.url)
const SRC = new URL('assets/entrance-doors/', root)
const OUT = new URL('public/renders/entrance-doors/', root)
await rm(OUT, { recursive: true, force: true }) // старые копии не копятся
await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /^[a-z0-9-]+-\d+\.webp$/.test(f)).sort()
const meta = {}
for (const f of files) {
  const name = f.replace('.webp', '')
  const buf = await readFile(new URL(f, SRC))
  const { width: W, height: H } = await sharp(buf).metadata()
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8)
  const widths = [...new Set([520, 1000].map((w) => Math.min(w, W)))]
  for (const w of widths) {
    await writeFile(new URL(`${name}-${hash}-${w}.webp`, OUT), await sharp(buf).resize({ width: w }).webp({ quality: 78 }).toBuffer())
  }
  meta[name] = { hash, widths, width: widths.at(-1), height: Math.round((H * widths.at(-1)) / W) }
}
await writeFile(new URL('src/data/entrance-doors-images.json', root), JSON.stringify(meta, null, 2) + '\n')
console.log(`Фото: ${files.length}`)
