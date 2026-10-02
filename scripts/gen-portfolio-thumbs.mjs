/**
 * Генерирует public/renders/portfolio/{work.id}.webp — облегчённые превью
 * обложек портфолио (первое фото каждой работы из src/data/portfolio-works.ts).
 *
 * Зачем: оригиналы — прямые фото с телефона (works_prod/*, invisible/ourworks/*),
 * обычно ~1920×1920 и 800КБ–1МБ каждое. PortfolioGrid.vue и PortfolioPreview.astro
 * показывают их в карточках максимум ~700px CSS-шириной — грузить мегабайтный
 * оригинал под маленькую карточку бессмысленно. Полноразмерные оригиналы
 * остаются как есть — их отдаёт ProjectSlider.vue на странице самой работы
 * (там нужно качество для лайтбокса).
 *
 * Источник данных читается из portfolio-works.ts регэкспом (без TS-импорта):
 * берётся id и первый URL из images[] — как обычная строка, так и
 * `${CDN_OW}...`-шаблон.
 *
 * Запуск:        node scripts/gen-portfolio-thumbs.mjs
 * Когда запускать снова: после добавления новой работы в PORTFOLIO_WORKS
 * (или если у существующей работы поменяли обложку — images[0]).
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const DATA_FILE = new URL('../src/data/portfolio-works.ts', import.meta.url)
const OUT = new URL('../public/renders/portfolio/', import.meta.url)
const CDN_OW = 'https://storage.yandexcloud.net/catalog-vfd/invisible/ourworks/'
const WIDTH = 1080
const QUALITY = 76
const CONCURRENCY = 6

const src = await readFile(DATA_FILE, 'utf-8')
const re = /id:\s*'([^']+)'[\s\S]*?images:\s*\[\s*\n\s*(?:'([^']+)'|`\$\{CDN_OW\}([^`]+)`)/g

const works = []
let m
while ((m = re.exec(src))) {
  const cover = m[2] ?? (CDN_OW + m[3])
  works.push({ id: m[1], cover })
}

if (works.length === 0) throw new Error('Ни одной работы не найдено — проверь регэксп/формат portfolio-works.ts')
console.log(`Найдено работ: ${works.length}`)

await mkdir(OUT, { recursive: true })

async function processOne({ id, cover }) {
  const res = await fetch(cover)
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status} на ${cover}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const thumb = await sharp(buf).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
  await writeFile(new URL(`${id}.webp`, OUT), thumb)

  const before = buf.length
  const after = thumb.length
  console.log(`${id}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${Math.round((1 - after / before) * 100)}% меньше)`)
}

for (let i = 0; i < works.length; i += CONCURRENCY) {
  await Promise.all(works.slice(i, i + CONCURRENCY).map(processOne))
}
console.log('done')
