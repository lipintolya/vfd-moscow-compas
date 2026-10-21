/**
 * Фото направлений плинтуса на /catalog/plintus/ (с подсветкой, скрытый,
 * микроплинтус, шпонированный): исходники — assets/plintus-lines/
 * (<направление>-<n>.webp — позиции 1:1, <направление>-banner.webp — баннер)
 * → public/renders/plintus/<имя>-<ширина>.webp + размеры в
 * src/data/plintus-lines-images.json (его читает src/data/plintus-lines.ts).
 *
 * Позиции — квадрат 400 и 800 px (карточка ~200–300 px CSS, ретина);
 * баннер — кадр 16:9 по центру, 960 и 1600 px. Не шире исходника.
 *
 * Ещё — уменьшенные копии фото напольного плинтуса (public/media/plintus/
 * plintus-NN.webp, 1000 px) для сетки профилей: floor-NN-480.webp —
 * карточка ~170–290 px CSS, оригинал 1000 px остаётся в srcset для ретины.
 *
 * Запуск: npm run gen:plintus-lines — когда фото в assets/plintus-lines/
 * добавили или заменили (новое фото — новое имя файла: /renders/ кэшируется).
 */
import sharp from 'sharp'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const SRC = new URL('assets/plintus-lines/', root)
const OUT = new URL('public/renders/plintus/', root)
await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /^[a-z]+-[a-z0-9]+\.webp$/.test(f)).sort()
const meta = {}
for (const f of files) {
  const name = f.replace('.webp', '')
  const banner = name.endsWith('-banner')
  let buf = await readFile(new URL(f, SRC))
  if (banner) {
    const { width: W, height: H } = await sharp(buf).metadata()
    const h = Math.min(H, Math.round(W * 9 / 16)), w = Math.round(h * 16 / 9)
    buf = await sharp(buf).extract({ left: Math.round((W - w) / 2), top: Math.round((H - h) / 2), width: w, height: h }).toBuffer()
  }
  const { width: W, height: H } = await sharp(buf).metadata()
  const widths = [...new Set((banner ? [960, 1600] : [400, 800]).map((w) => Math.min(w, W)))]
  for (const w of widths) {
    await writeFile(new URL(`${name}-${w}.webp`, OUT), await sharp(buf).resize({ width: w }).webp({ quality: 78 }).toBuffer())
  }
  meta[name] = { widths, width: widths.at(-1), height: Math.round(H * widths.at(-1) / W) }
}
const FLOOR = new URL('public/media/plintus/', root)
for (const f of (await readdir(FLOOR)).filter((f) => /^plintus-\d+\.webp$/.test(f)).sort()) {
  const name = f.replace('plintus-', 'floor-').replace('.webp', '')
  const buf = await readFile(new URL(f, FLOOR))
  await writeFile(new URL(`${name}-480.webp`, OUT), await sharp(buf).resize({ width: 480 }).webp({ quality: 78 }).toBuffer())
  meta[name] = { widths: [480], width: 480, height: 480 }
}
await writeFile(new URL('src/data/plintus-lines-images.json', root), JSON.stringify(meta, null, 2) + '\n')
console.log(`Фото: ${files.length}`)
