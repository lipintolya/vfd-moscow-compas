/**
 * Генерирует public/renders/footer-map.webp — статичный скриншот карты для
 * футера (Footer.vue). Карта там чисто декоративная (pointer-events:none,
 * aria-hidden, есть отдельная ссылка «Открыть в Яндекс Картах» рядом), но
 * раньше рендерилась как живой iframe Yandex Maps — со своим JS и тайлами
 * на КАЖДОЙ из ~400 страниц сайта, т.к. футер общий для всего сайта.
 * Static Maps API отдаёт одну картинку с меткой без JS-рантайма — то же
 * визуально, кратно легче.
 *
 * Запуск:        node scripts/gen-footer-map.mjs
 * Когда запускать снова: если координаты салона в contacts-data.ts
 * (address.coordinates) поменяются.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const LAT = 55.172868
const LNG = 61.306572
const OUT = new URL('../public/renders/footer-map.webp', import.meta.url)

await mkdir(new URL('../public/renders/', import.meta.url), { recursive: true })

// 650x450 — максимум, который Yandex Static Maps API отдаёт без API-ключа.
const src = `https://static-maps.yandex.ru/1.x/?ll=${LNG},${LAT}&z=16&l=map&pt=${LNG},${LAT},pm2rdm&size=650,450`

const res = await fetch(src)
if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
const buf = Buffer.from(await res.arrayBuffer())

const webp = await sharp(buf).webp({ quality: 85 }).toBuffer()
await writeFile(OUT, webp)

console.log(`footer-map.webp: ${(buf.length / 1024).toFixed(0)}KB (png) -> ${(webp.length / 1024).toFixed(0)}KB (webp)`)
