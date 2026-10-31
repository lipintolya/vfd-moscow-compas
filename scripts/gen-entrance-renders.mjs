/**
 * Рендеры путеводителя на /catalog/vhodnye-dveri/ (дом, виды дверей, разрез):
 * исходники — assets/entrance-renders/<место>.jpg|png|webp (имя файла — место
 * на странице; список мест, пропорции и описание, что нарисовать, —
 * src/data/entrance-guide.ts, GUIDE_VISUALS) → public/renders/entrance-guide/
 * <место>-<хеш>-<ширина>.webp + размеры в src/data/entrance-render-files.json
 * (его читает src/lib/entrance-renders.ts).
 *
 * Рендер есть — страница показывает его; нет — у видов дверей фото модели из
 * каталога, у остальных мест только текст.
 *
 * Копии — 640, 960 и 1440 px, не шире исходника. Хеш — от исходника и
 * настроек: заменили рендер — новое имя, кэш /renders/ не подсунет старый
 * кадр. Копии убранных рендеров удаляются.
 *
 * Обрезки под телефон (CROPS): у обложки каталога на телефоне виден только
 * квадрат с дверью — для него отдельные копии <место>-<обрезка>-<хеш>-<ширина>.webp
 * (480–960 px), чтобы телефон не качал весь рендер ради двух третей кадра.
 *
 * Запуск: npm run gen:entrance-renders — когда рендер добавили, заменили или убрали.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises'

const WIDTHS = [640, 960, 1440]
const QUALITY = 80
/* Обрезки: место → имя → пропорция и центр кадра (доля ширины рендера — где стоит дверь).
   Страница берёт обрезку из <picture>; нет обрезки — телефон получает весь рендер. */
const CROPS = {
  'house-nord-plyus': { square: { aspect: 1, focus: 0.655 } },
}
const CROP_WIDTHS = [480, 720, 960]
const root = new URL('../', import.meta.url)
const SRC = new URL('assets/entrance-renders/', root)
const OUT = new URL('public/renders/entrance-guide/', root)
const JSON_OUT = new URL('src/data/entrance-render-files.json', root)

await mkdir(OUT, { recursive: true })
const sources = (await readdir(SRC)).filter((f) => /^[a-z0-9-]+\.(jpe?g|png|webp)$/i.test(f)).sort()

const data = {}
const written = new Set()
for (const f of sources) {
  const slot = f.replace(/\.[^.]+$/, '').toLowerCase()
  if (data[slot]) throw new Error(`Два файла для места «${slot}» — оставьте один`)
  const buf = await readFile(new URL(f, SRC))
  const meta = await sharp(buf).metadata()
  const hash = createHash('sha1').update(buf).update(JSON.stringify({ WIDTHS, QUALITY })).update(CROPS[slot] ? JSON.stringify({ CROPS: CROPS[slot], CROP_WIDTHS }) : '').digest('hex').slice(0, 8)
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))]
  for (const w of widths) {
    const file = `${slot}-${hash}-${w}.webp`
    const out = await sharp(buf).rotate().resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
    await writeFile(new URL(file, OUT), out)
    written.add(file)
    console.log(`${file}: ${(out.length / 1024).toFixed(0)}KB`)
  }
  const big = widths.at(-1)
  data[slot] = { hash, widths, width: big, height: Math.round((meta.height * big) / meta.width) }

  for (const [name, c] of Object.entries(CROPS[slot] ?? {})) {
    if ((meta.orientation ?? 1) > 1) throw new Error(`«${slot}»: у исходника EXIF-поворот — обрезка ждёт кадр в нормальной ориентации`)
    const cw = Math.min(meta.width, Math.round(meta.height * c.aspect))
    const ch = Math.round(cw / c.aspect)
    const left = Math.max(0, Math.min(meta.width - cw, Math.round(c.focus * meta.width - cw / 2)))
    const cropWidths = [...new Set(CROP_WIDTHS.map((w) => Math.min(w, cw)))]
    for (const w of cropWidths) {
      const file = `${slot}-${name}-${hash}-${w}.webp`
      const out = await sharp(buf).extract({ left, top: 0, width: cw, height: ch }).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
      await writeFile(new URL(file, OUT), out)
      written.add(file)
      console.log(`${file}: ${(out.length / 1024).toFixed(0)}KB`)
    }
    const cbig = cropWidths.at(-1)
    data[slot].crops = { ...data[slot].crops, [name]: { widths: cropWidths, width: cbig, height: Math.round((ch * cbig) / cw) } }
  }
}

for (const f of await readdir(OUT)) {
  if (/\.webp$/.test(f) && !written.has(f)) {
    await unlink(new URL(f, OUT))
    console.log(`удалён ${f}`)
  }
}
await writeFile(JSON_OUT, JSON.stringify(data, null, 2) + '\n')
console.log(sources.length ? `Рендеров: ${sources.length}` : 'Рендеров пока нет — страница покажет фото моделей и текст')
