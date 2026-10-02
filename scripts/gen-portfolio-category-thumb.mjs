/**
 * Генерирует public/renders/portfolio/category-entrance.webp — крошечное
 * превью категории «Входные» в PortfolioGrid.vue.
 *
 * Зачем: оригинал 1122×1402 (256 КБ) отображается в фильтре категорий как
 * .pf-cat__thumb — 2.75rem (44px CSS, ~88px с учётом retina ×2). Остальные
 * 3 категории (interior/hidden/partitions) уже используют локальные
 * превью того же микроразмера; entrance был единственным, всё ещё тянущим
 * полноразмерный CDN-оригинал под 44-пиксельную иконку.
 *
 * Запуск: node scripts/gen-portfolio-category-thumb.mjs
 * Когда запускать снова: если заменили исходник в облаке (CATEGORY_COVERS.entrance).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const SRC = 'https://storage.yandexcloud.net/vfd74ru/metal_doors/Termo/ComfortTermo/render_confort_termo.webp'
const OUT = new URL('../public/renders/portfolio/', import.meta.url)

await mkdir(OUT, { recursive: true })

const res = await fetch(SRC)
if (!res.ok) throw new Error(`HTTP ${res.status} на ${SRC}`)
const buf = Buffer.from(await res.arrayBuffer())

const thumb = await sharp(buf).resize({ width: 176, height: 176, fit: 'cover' }).webp({ quality: 78 }).toBuffer()
await writeFile(new URL('category-entrance.webp', OUT), thumb)

console.log(`category-entrance.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(thumb.length / 1024).toFixed(0)}KB`)
