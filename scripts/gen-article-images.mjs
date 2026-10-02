/**
 * Облегчённые картинки статей блога:
 *   public/renders/articles/covers/  — обложки (coverImage);
 *   public/renders/articles/images/  — фото из текста ({% figure %},
 *                                      {% photo %}, {% card image %});
 *   src/data/article-images.ts       — карта «оригинальный URL → варианты».
 *
 * Зачем: и обложки, и фото в тексте грузились оригиналами из Yandex Cloud
 * (1672–2100px, до ~400 КБ): на главной три обложки подряд, в статье —
 * несколько тяжёлых фото. Компоненты берут варианты через srcset
 * (src/lib/article-images.ts), телефон получает маленький файл. Для
 * увеличения по клику (FigureLightbox) по-прежнему открывается оригинал.
 *
 * Обложки: card — кроп 16:9 (как aspect-video карточки) 480w/800w;
 *          hero — ресайз по ширине 960w/1600w (шапка режет в 21:9 через cover).
 * Фото:    640/960/1280/1600w по ширине, только меньше оригинала и только
 *          если файл реально легче исходника.
 *
 * Запуск: node scripts/gen-article-images.mjs
 * Когда запускать снова: после добавления статьи, смены обложки или фото
 * в тексте. Без перезапуска ничего не сломается — для URL, которого нет
 * в карте, компоненты возьмут оригинал.
 */
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'

const ARTICLES = new URL('../src/content/articles/', import.meta.url)
const PUBLIC = new URL('../public/', import.meta.url)
const COVERS_OUT = new URL('../public/renders/articles/covers/', import.meta.url)
const IMAGES_OUT = new URL('../public/renders/articles/images/', import.meta.url)
const MAP_FILE = new URL('../src/data/article-images.ts', import.meta.url)

const CARD_WIDTHS = [480, 800]
const HERO_WIDTHS = [960, 1600]
const BODY_WIDTHS = [640, 960, 1280, 1600]
const QUALITY = 76

// Пересобираем с нуля — чтобы не копились файлы удалённых статей/фото.
for (const dir of [COVERS_OUT, IMAGES_OUT]) {
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
}

async function load(src) {
  if (src.startsWith('/')) return readFile(new URL(src.slice(1), PUBLIC))
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  return Buffer.from(await res.arrayBuffer())
}

const kb = n => `${(n / 1024).toFixed(0)}KB`
const files = (await readdir(ARTICLES)).filter(f => f.endsWith('.mdoc')).sort()

/* ── Обложки ── */
const covers = {}
for (const file of files) {
  const slug = file.replace(/\.mdoc$/, '')
  const text = await readFile(new URL(file, ARTICLES), 'utf8')
  const cover = text.match(/^coverImage:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1]
  if (!cover || covers[cover]) continue

  const buf = await load(cover)
  const entry = { card: [], hero: [] }
  for (const w of CARD_WIDTHS) {
    const out = await sharp(buf)
      .resize(w, Math.round(w * 9 / 16), { fit: 'cover', position: 'centre', withoutEnlargement: true })
      .webp({ quality: QUALITY }).toBuffer()
    const name = `${slug}-card-${w}.webp`
    await writeFile(new URL(name, COVERS_OUT), out)
    entry.card.push({ src: `/renders/articles/covers/${name}`, w })
  }
  for (const w of HERO_WIDTHS) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
    const name = `${slug}-hero-${w}.webp`
    await writeFile(new URL(name, COVERS_OUT), out)
    entry.hero.push({ src: `/renders/articles/covers/${name}`, w })
  }
  covers[cover] = entry
  console.log(`обложка ${slug.padEnd(40)} ${kb(buf.length)}`)
}

/* ── Фото из текста ── */
const TAG_IMAGE = /\{%\s*(?:figure|photo|card)\b[^%]*?\b(?:src|image)="([^"]+)"/g
const bodyUrls = new Set()
for (const file of files) {
  const text = await readFile(new URL(file, ARTICLES), 'utf8')
  for (const m of text.matchAll(TAG_IMAGE)) bodyUrls.add(m[1])
}

const images = {}
let before = 0, after = 0
for (const url of [...bodyUrls].sort()) {
  const buf = await load(url)
  const { width = 0 } = await sharp(buf).metadata()
  const base = url.split('/').pop().replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40)
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 6)
  const variants = []
  for (const w of BODY_WIDTHS.filter(w => w < width)) {
    const out = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer()
    if (out.length >= buf.length) continue // пережатие не дало выигрыша
    const name = `${base}-${hash}-${w}.webp`
    await writeFile(new URL(name, IMAGES_OUT), out)
    variants.push({ src: `/renders/articles/images/${name}`, w, bytes: out.length })
  }
  if (!variants.length) {
    console.log(`фото    ${base.padEnd(40)} ${kb(buf.length)} — оставлен оригинал`)
    continue
  }
  images[url] = variants.map(({ src, w }) => ({ src, w }))
  before += buf.length
  after += variants[0].bytes
  console.log(`фото    ${base.padEnd(40)} ${kb(buf.length)} -> ${variants.map(v => `${v.w}w ${kb(v.bytes)}`).join(', ')}`)
}

const fmt = list => `[${list.map(c => `{ src: '${c.src}', w: ${c.w} }`).join(', ')}]`
const coversBody = Object.entries(covers)
  .map(([k, v]) => `  '${k}': {\n    card: ${fmt(v.card)},\n    hero: ${fmt(v.hero)},\n  },`).join('\n')
const imagesBody = Object.entries(images)
  .map(([k, v]) => `  '${k}':\n    ${fmt(v)},`).join('\n')

await writeFile(MAP_FILE, `/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {
${coversBody}
}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {
${imagesBody}
}
`)
console.log(`\nобложек: ${Object.keys(covers).length}; фото: ${Object.keys(images).length} из ${bodyUrls.size}, мобильный вариант вместо оригиналов ${kb(before)} -> ${kb(after)}`)
