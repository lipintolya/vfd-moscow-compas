/**
 * Уменьшенные копии фото, которые на телефоне показаны мельче оригинала:
 * фасад ТЦ на главной (блок «Где нас найти»), 640 и 960 px, но не шире
 * исходника. Ширина картинки здесь совпадает с плиткой (object-fit: cover
 * на широкой плитке), поэтому sizes по ширине точен.

 * Плитки направлений и кадры первого экрана сюда не входят: у них высокая
 * плитка на телефоне, и cover растягивает кадр по высоте — отрисованная
 * ширина больше ширины плитки, и sizes по ширине выбрал бы слишком малую копию. Копии — public/renders/responsive/<имя>-<ширина>-<хеш>.webp,
 * описание для srcset — src/data/responsive-photos.json (его читает
 * src/lib/responsive-photo.ts). Исходник — тот же файл в public/media,
 * который указан в коде: ключ JSON — путь исходника как в коде.
 *
 * Хеш — от исходника и ширин: заменили фото → новое имя копии, nginx с
 * кэшем /renders/ не отдаст старый кадр. Копии, которых больше нет в списке,
 * удаляются.
 *
 * Запуск: npm run gen:responsive — когда фото в списке добавили или заменили.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises'

/** Исходники — пути как в коде (/media/…), файлы — в public/ */
const SOURCES = [
  '/media/vfd.moscow.compass/hero.block/about.compas.hall/1138447691-6.webp', // фасад ТЦ (ShowroomHero, «Где нас найти»)
]
const WIDTHS = [640, 960]
const QUALITY = 78

const root = new URL('../', import.meta.url)
const OUT = new URL('public/renders/responsive/', root)
const JSON_OUT = new URL('src/data/responsive-photos.json', root)
await mkdir(OUT, { recursive: true })

const names = SOURCES.map((s) => s.split('/').pop().replace(/\.webp$/, ''))
if (new Set(names).size !== names.length) throw new Error('Имена исходников повторяются — копии перепишут друг друга')

const data = {}
const written = new Set()
for (const src of SOURCES) {
  const name = src.split('/').pop().replace(/\.webp$/, '')
  const buf = await readFile(new URL(`public${src}`, root))
  const meta = await sharp(buf).metadata()
  const hash = createHash('sha1').update(buf).update(JSON.stringify({ WIDTHS, QUALITY })).digest('hex').slice(0, 8)
  const copies = []
  for (const w of WIDTHS.filter((w) => w < meta.width)) {
    const file = `${name}-${w}-${hash}.webp`
    const out = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
    await writeFile(new URL(file, OUT), out)
    written.add(file)
    copies.push({ width: w, src: `/renders/responsive/${file}` })
    console.log(`${file}: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
  data[src] = { width: meta.width, height: meta.height, copies }
}

const own = new RegExp(`^(${names.join('|')})-\\d+-[0-9a-f]{8}\\.webp$`)
for (const f of await readdir(OUT)) {
  if (own.test(f) && !written.has(f)) {
    await unlink(new URL(f, OUT))
    console.log(`удалён ${f}`)
  }
}
await writeFile(JSON_OUT, JSON.stringify(data, null, 2) + '\n')
