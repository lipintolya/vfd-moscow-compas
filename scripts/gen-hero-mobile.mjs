/**
 * Генерирует public/renders/hero/emalex-render-mobile.webp — уменьшенную
 * (800w) версию обложки первого слайда HeroSlider (src/data/hero-image.ts).
 *
 * Зачем: оригинал на Yandex Cloud storage — storage не поддерживает resize
 * по query-параметрам. На мобильном это единственный LCP-элемент главной,
 * throttled-4G грузила тот же файл, что и десктоп — на узком экране 800w
 * достаточно (379 CSS px × 2 DPR), см. HERO_COVER_IMAGE_SRCSET в
 * hero-image.ts.
 *
 * Запуск:        node scripts/gen-hero-mobile.mjs
 * Когда запускать снова: если HERO_COVER_IMAGE в hero-image.ts поменяли
 * на другой оригинал (тогда обновить и SRC/OUT здесь).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const SRC = 'https://storage.yandexcloud.net/vfd74ru/Main_page_perfomance-covers/emalex_render.webp'
const OUT = new URL('../public/renders/hero/emalex-render-mobile.webp', import.meta.url)
const WIDTH = 800
const QUALITY = 72

await mkdir(new URL('../public/renders/hero/', import.meta.url), { recursive: true })

const res = await fetch(SRC)
if (!res.ok) throw new Error(`HTTP ${res.status} на ${SRC}`)
const buf = Buffer.from(await res.arrayBuffer())

/* Кадр мобильной версии. Шапка на телефоне вертикальная (~0.85) и режет
   картинку по центру (object-center в HeroSlider), а дверь в этом рендере
   стоит у левого края — при полном кадре на телефоне её не было видно.
   Поэтому мобильный вариант заранее кадрируем по левой части (дверь,
   диван, фотообои) в пропорции шапки; десктоп/планшет получают полный
   оригинал через srcset. HeroSlider при этом не трогаем. */
const MOBILE_RATIO = 0.83
const { width: srcW = 0, height: srcH = 0 } = await sharp(buf).metadata()
const cropW = Math.min(srcW, Math.round(srcH * MOBILE_RATIO))
const thumb = await sharp(buf)
  .extract({ left: 0, top: 0, width: cropW, height: srcH })
  .resize({ width: WIDTH, withoutEnlargement: true })
  .webp({ quality: QUALITY })
  .toBuffer()
await writeFile(OUT, thumb)

console.log(`emalex-render-mobile.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(thumb.length / 1024).toFixed(0)}KB`)
