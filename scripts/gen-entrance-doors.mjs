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

/**
 * Кадр из одной двери (уже 700 px) — граница не нужна, берём всю ширину.
 * Между внешней и внутренней дверью в кадре — белая полоса, её начало у разных
 * коллекций от 488 до 508 px. Карточке нужна только левая дверь, поэтому ищем
 * первый столбец, с которого идёт ≥4 белых подряд (на средней части высоты).
 * Не нашли — середина кадра.
 */
async function findSplit(buf) {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  if (W < 700) return W // только наружная сторона — второй двери в кадре нет
  const y0 = Math.round(H * 0.12), y1 = Math.round(H * 0.8)
  const white = (x) => {
    let sum = 0, n = 0
    for (let y = y0; y < y1; y += 4) for (let c = 0; c < 3; c++) { sum += data[(y * W + x) * 3 + c]; n++ }
    return sum / n >= 250
  }
  for (let x = Math.round(W * 0.44); x < Math.round(W * 0.56); x++) {
    if ([0, 1, 2, 3].every((d) => white(x + d))) return x
  }
  return Math.round(W / 2)
}

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
  const split = await findSplit(buf)
  meta[name] = { hash, widths, width: widths.at(-1), height: Math.round((H * widths.at(-1)) / W), split: Math.round((split * widths.at(-1)) / W), single: W < 700 }
}
await writeFile(new URL('src/data/entrance-doors-images.json', root), JSON.stringify(meta, null, 2) + '\n')
console.log(`Фото: ${files.length}`)
