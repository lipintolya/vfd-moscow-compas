/**
 * Наборы фото для страниц: исходники из assets/ (NN.webp, номер кадра —
 * из имени) → уменьшенные копии в public/renders/ + JSON набора в
 * src/data/ (его читает src/lib/photo-set.ts):
 *
 *   assets/showroom/ → /renders/about/showroom-*    (шоурум: /about/ и галерея салона на /contacts/)
 *   assets/salon/    → /renders/contacts/salon-*    (вход в салон, /contacts/)
 *   assets/factory/  → /renders/about/factory-*     (производство, /about/)
 *   assets/founder/  → /renders/about/founder-*     (слайдер основателя на обложке /about/)
 *   assets/install/  → /renders/about/install-*     (контроль качества монтажа, /about/)
 *
 * Копии — 480 (сетка, 1x) и 900 (retina и окно просмотра), но не шире
 * исходника: в srcset ширина должна совпадать с настоящей. Имя копии —
 * <набор>-<N>-<хеш>-<ширина>.webp; хеш — от исходника и настроек сжатия:
 * заменили фото — у копий новое имя, и браузер не покажет старый кадр из
 * кэша (nginx отдаёт /renders/ с кэшем на неделю). Копии кадров, которых
 * в наборе больше нет, удаляются.
 *
 * Запуск: npm run gen:photos — когда фото в этих папках добавили, убрали
 * или заменили. Подписи — src/data/showroom.ts, about-page.ts, contacts-page.ts
 * (кадр без подписи — ошибка сборки).
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises'

const WIDTHS = [480, 900]
const QUALITY = 78
const SETS = [
  { src: 'assets/showroom/', dir: 'about', name: 'showroom', json: 'src/data/showroom-photos.json' },
  { src: 'assets/salon/', dir: 'contacts', name: 'salon', json: 'src/data/salon-photos.json' },
  { src: 'assets/factory/', dir: 'about', name: 'factory', json: 'src/data/about-factory-photos.json' },
  { src: 'assets/founder/', dir: 'about', name: 'founder', json: 'src/data/founder-photos.json' },
  { src: 'assets/install/', dir: 'about', name: 'install', json: 'src/data/install-photos.json' },
]
const root = new URL('../', import.meta.url)

for (const set of SETS) {
  const SRC = new URL(set.src, root)
  const OUT = new URL(`public/renders/${set.dir}/`, root)
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(SRC)).filter((f) => /^\d+\.webp$/.test(f)).sort()
  const photos = []
  const written = new Set()
  for (const f of files) {
    const n = Number(f.replace('.webp', ''))
    const buf = await readFile(new URL(f, SRC))
    const meta = await sharp(buf).metadata()
    const hash = createHash('sha1').update(buf).update(JSON.stringify({ WIDTHS, QUALITY })).digest('hex').slice(0, 8)
    const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))]
    for (const w of widths) {
      const file = `${set.name}-${n}-${hash}-${w}.webp`
      const out = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
      await writeFile(new URL(file, OUT), out)
      written.add(file)
      console.log(`${file}: ${(out.length / 1024).toFixed(0)}KB`)
    }
    // Размеры самой крупной копии — для <img width/height> (без сдвига вёрстки)
    const big = widths.at(-1)
    photos.push({ n, hash, widths, width: big, height: Math.round(meta.height * big / meta.width) })
  }
  // Копии этого набора, которых нет в текущем запуске, — от убранных или заменённых кадров
  const own = new RegExp(`^${set.name}-\\d+-[0-9a-f]{8}-\\d+\\.webp$`)
  for (const f of await readdir(OUT)) {
    if (own.test(f) && !written.has(f)) {
      await unlink(new URL(f, OUT))
      console.log(`удалён ${f}`)
    }
  }
  const json = { base: `/renders/${set.dir}/${set.name}`, photos }
  await writeFile(new URL(set.json, root), JSON.stringify(json, null, 2) + '\n')
}
