/**
 * Генерирует public/renders/about/*.webp — уменьшенные локальные копии
 * картинок страницы /about и аватарку разработчика для модалки футера. Тот же приём,
 * что и gen-hero-mobile.mjs/gen-hero-bento.mjs: оригиналы на Yandex Cloud
 * storage лежат в 1920×2560 (300-750КБ каждая), а реальный экранный размер
 * в вёрстке в разы меньше — hero-фото и director помещаются в максимум
 * ~900px по ширине, feature-links карточки — ~700px, галерея жёстко
 * задана 480×600.
 *
 * Фото производства (about.block/factory/photo_N.webp, 960 px по короткой
 * стороне) → factory-N-480.webp и factory-N-960.webp + размеры кадров
 * в src/data/about-factory-photos.json (ширина/высота для <img>, без CLS).
 * В сетке на ПК плитка ~300 px CSS — грузится 480 (1x) или 960 (retina);
 * 960 же открывается в лайтбоксе.
 *
 * Запуск:        node scripts/gen-about-images.mjs
 * Когда запускать снова: если фото в папке factory добавили или заменили
 * (поправить FACTORY_COUNT).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/about/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

/* Фото салона для /about/ убраны: прежние снимки были другого салона.
   Когда появятся фото салона в ТЦ «Компас» — добавить задания сюда
   в формате { src, out, width, quality } и вывести их на /about/. */
const jobs = []

/* ── Портрет основателя — обложка /about/ (LCP страницы) ──
   Локально, а не из облака: без отдельного соединения с хранилищем
   кадр приходит раньше, его можно заранее загрузить (preload).
   Исходник — квадрат 640, поэтому 640 — потолок; 400 — для телефонов 1x. */
{
  const src = 'https://storage.yandexcloud.net/vfd.moscow.compass/about.block/ceo/ceo_main.webp'
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  for (const w of [400, 640]) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    await writeFile(new URL(`founder-${w}.webp`, OUT_DIR), out)
    console.log(`founder-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
}

/* ── Фото Владимирской фабрики дверей (блок «Официальный дилер») ──
   Исходники — квадраты 850; 480 — для сетки 2×2 на обычных экранах,
   850 — retina и окно просмотра. Размеры — в about-vfd-photos.json. */
{
  const SRC = 'https://storage.yandexcloud.net/vfd.moscow.compass/about.block/factory/'
  const COUNT = 4
  const WIDTHS = [480, 850]
  const photos = []
  for (let n = 1; n <= COUNT; n++) {
    const src = `${SRC}card_${n}.webp`
    const res = await fetch(src)
    if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const meta = await sharp(buf).metadata()
    for (const w of WIDTHS) {
      const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
      await writeFile(new URL(`vfd-${n}-${w}.webp`, OUT_DIR), out)
      console.log(`vfd-${n}-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
    }
    const big = Math.min(WIDTHS.at(-1), meta.width)
    photos.push({ n, width: big, height: Math.round(meta.height * big / meta.width) })
  }
  await writeFile(
    new URL('../src/data/about-vfd-photos.json', import.meta.url),
    JSON.stringify({ widths: WIDTHS, photos }, null, 2) + '\n',
  )
}

/* ── Фото производства ── */
const FACTORY_SRC = 'https://storage.yandexcloud.net/vfd.moscow.compass/about.block/factory/'
const FACTORY_COUNT = 11
const FACTORY_WIDTHS = [480, 960]
const factory = []
for (let n = 1; n <= FACTORY_COUNT; n++) {
  const src = `${FACTORY_SRC}photo_${n}.webp`
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const meta = await sharp(buf).metadata()
  for (const w of FACTORY_WIDTHS) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer()
    await writeFile(new URL(`factory-${n}-${w}.webp`, OUT_DIR), out)
    console.log(`factory-${n}-${w}.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`)
  }
  // Размеры самого крупного варианта — по ним <img width/height>
  const big = Math.min(FACTORY_WIDTHS.at(-1), meta.width)
  factory.push({ n, width: big, height: Math.round(meta.height * big / meta.width) })
}
await writeFile(
  new URL('../src/data/about-factory-photos.json', import.meta.url),
  JSON.stringify({ widths: FACTORY_WIDTHS, photos: factory }, null, 2) + '\n',
)

for (const { src, out, width, quality } of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}

/* Аватарка разработчика в модалке футера — показывается квадратом 64×64.
   Оригинал — квадрат 460×460, где лицо занимает небольшую часть кадра
   (фото на фоне гор/неба): без кропа на 64px лицо было бы крошечным.
   Вырезаем квадрат по голове и плечам (подобран по кадру), затем 160×160
   под retina — избыточные байты не грузим. */
{
  const src = 'https://storage.yandexcloud.net/vfd74ru/Main_page_perfomance-covers/161125105.webp'
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf)
    .extract({ left: 118, top: 70, width: 280, height: 280 })
    .resize({ width: 160, height: 160, fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()
  await writeFile(new URL('avatar-al-2-160.webp', OUT_DIR), resized)
  console.log(`avatar-al-2-160.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
