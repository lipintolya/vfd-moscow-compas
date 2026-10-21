/**
 * Рендеры страницы «Стеновые панели» (/catalog/stenovye-paneli/) и плитки
 * на главной: исходники — assets/wall-panels/<место>.jpg|png|webp (имя
 * файла — место на странице, список мест и подписи — src/data/wall-panels-page.ts)
 * → public/renders/wall-panels/<место>-<хеш>-<ширина>.webp + размеры
 * в src/data/wall-panel-renders.json (его читает src/lib/wall-panels.ts).
 *
 * Рендер есть — страница показывает его; нет — фото с объекта, если оно
 * назначено месту, иначе в режиме разработки — рамка с подсказкой.
 *
 * Копии — 640, 960 и 1440 px, но не шире исходника (в srcset ширина должна
 * совпадать с настоящей). Хеш — от исходника и настроек: заменили рендер —
 * новое имя, nginx с кэшем /renders/ не отдаст старый кадр. Копии убранных
 * рендеров удаляются.
 *
 * Запуск: npm run gen:wall-panels — когда рендер добавили, заменили или убрали.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises'

const WIDTHS = [640, 960, 1440]
const QUALITY = 80
const root = new URL('../', import.meta.url)
const SRC = new URL('assets/wall-panels/', root)
const OUT = new URL('public/renders/wall-panels/', root)
const JSON_OUT = new URL('src/data/wall-panel-renders.json', root)

await mkdir(OUT, { recursive: true })
const sources = (await readdir(SRC)).filter((f) => /^[a-z0-9-]+\.(jpe?g|png|webp)$/i.test(f)).sort()

const data = {}
const written = new Set()
for (const f of sources) {
  const slot = f.replace(/\.[^.]+$/, '').toLowerCase()
  if (data[slot]) throw new Error(`Два файла для места «${slot}» — оставьте один`)
  const buf = await readFile(new URL(f, SRC))
  const meta = await sharp(buf).metadata()
  const hash = createHash('sha1').update(buf).update(JSON.stringify({ WIDTHS, QUALITY })).digest('hex').slice(0, 8)
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))]
  for (const w of widths) {
    const file = `${slot}-${hash}-${w}.webp`
    const out = await sharp(buf).rotate().resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
    await writeFile(new URL(file, OUT), out)
    written.add(file)
    console.log(`${file}: ${(out.length / 1024).toFixed(0)}KB`)
  }
  const big = widths.at(-1)
  data[slot] = { hash, widths, width: big, height: Math.round(meta.height * big / meta.width) }
}

for (const f of await readdir(OUT)) {
  if (/\.webp$/.test(f) && !written.has(f)) {
    await unlink(new URL(f, OUT))
    console.log(`удалён ${f}`)
  }
}
await writeFile(JSON_OUT, JSON.stringify(data, null, 2) + '\n')
console.log(sources.length ? `Рендеров: ${sources.length}` : 'Рендеров пока нет — страница покажет фото с объектов и места под рендеры')
