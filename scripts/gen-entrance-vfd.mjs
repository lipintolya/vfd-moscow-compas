/**
 * Фото входных дверей VFD со сменными накладками (блок «Входные двери VFD…» на
 * /catalog/vhodnye-dveri/): исходники — assets/entrance-vfd/
 *   models/<модель>-outside.webp  дверь снаружи (кадр по двери)
 *   models/<модель>-render.webp   визуализация двери в интерьере
 *   skins/<накладка>.webp         накладка — дверь изнутри
 * → public/renders/entrance-vfd/<папка>-<имя>-<хеш>-<ширина>.webp + размеры в
 * src/data/entrance-vfd-images.json (его читает src/lib/entrance-vfd.ts).
 *
 * Имена моделей и накладок — id из src/data/entrance-vfd.ts: файл без записи
 * или запись без файла — ошибка сборки страницы, а не пустое место.
 *
 * Ширины: дверь и накладка — 160 (миниатюры), 480 и 720; визуализация —
 * 480, 800 и 1120; не шире исходника. Хеш — от исходника и настроек: заменили
 * фото — новое имя, кэш /renders/ не подсунет старый кадр. Копии убранных
 * фото удаляются.
 *
 * Запуск: npm run gen:entrance-vfd — когда фото добавили, заменили или убрали.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises'

const QUALITY = 78
const WIDTHS = { render: [480, 800, 1120], tall: [160, 480, 720] }
const root = new URL('../', import.meta.url)
const SRC = new URL('assets/entrance-vfd/', root)
const OUT = new URL('public/renders/entrance-vfd/', root)
const JSON_OUT = new URL('src/data/entrance-vfd-images.json', root)

await mkdir(OUT, { recursive: true })

const data = {}
const written = new Set()
for (const dir of ['models', 'skins']) {
  const files = (await readdir(new URL(`${dir}/`, SRC))).filter((f) => /^[a-z0-9-]+\.webp$/.test(f)).sort()
  for (const f of files) {
    const name = f.replace(/\.webp$/, '')
    const key = `${dir}/${name}`
    const kind = name.endsWith('-render') ? 'render' : 'tall'
    const buf = await readFile(new URL(`${dir}/${f}`, SRC))
    const meta = await sharp(buf).metadata()
    const hash = createHash('sha1').update(buf).update(JSON.stringify({ widths: WIDTHS[kind], QUALITY })).digest('hex').slice(0, 8)
    const widths = [...new Set(WIDTHS[kind].map((w) => Math.min(w, meta.width)))]
    for (const w of widths) {
      const file = `${dir}-${name}-${hash}-${w}.webp`
      const out = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
      await writeFile(new URL(file, OUT), out)
      written.add(file)
    }
    const big = widths.at(-1)
    data[key] = { hash, widths, width: big, height: Math.round((meta.height * big) / meta.width) }
    console.log(`${key}: ${meta.width}×${meta.height} → ${widths.join(', ')}`)
  }
}

for (const f of await readdir(OUT)) {
  if (/\.webp$/.test(f) && !written.has(f)) {
    await unlink(new URL(f, OUT))
    console.log(`удалён ${f}`)
  }
}
await writeFile(JSON_OUT, JSON.stringify(data, null, 2) + '\n')
console.log(`Фото: ${Object.keys(data).length}, файлов: ${written.size}`)
