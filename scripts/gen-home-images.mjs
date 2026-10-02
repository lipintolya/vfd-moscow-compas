/**
 * Генерирует public/renders/home/*.webp — уменьшенные локальные копии
 * картинок главной страницы (Features.vue и промо-слайдеры
 * TehnoPromo/ShtrihPromo/MirrorDoorPromo/HiddenDoorsPromo).
 *
 * Зачем: оригиналы на Yandex Cloud — до 1440×2560 и 1 МБ за файл (суммарно
 * ~5 МБ на главной), а на экране:
 *   - Features: карточка ~400×375 CSS-px (на мобильном — во всю ширину,
 *     ~800px с retina) → 800w;
 *   - промо-слайдеры: колонка ~половина контейнера (~650 CSS-px, ~1300
 *     с retina) → 1300w.
 * Все картинки слайдеров лежат в DOM одновременно (кросс-фейд по opacity),
 * поэтому грузятся все сразу при подлёте к секции — каждый лишний килобайт
 * тут умножается на число слайдов.
 *
 * Запуск: node scripts/gen-home-images.mjs
 * Когда запускать снова: если заменили фото в облаке или добавили новое
 * в эти компоненты (тогда добавь строку в jobs и поменяй URL в компоненте).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT = new URL('../public/renders/home/', import.meta.url)
await mkdir(OUT, { recursive: true })

const CARDS    = 'https://storage.yandexcloud.net/vfd74ru/Main_page/cards/'
const FEAT     = 'https://storage.yandexcloud.net/catalog-vfd/features_block/'
const TEHNO    = 'https://storage.yandexcloud.net/vfd74ru/doors-main_renders/tehno/'
const INVIS    = 'https://storage.yandexcloud.net/vfd74ru/invisible/'
const BENTO    = 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/'
const STRIX    = 'https://storage.yandexcloud.net/vfd74ru/promo_main/strix/'

// Features: контейнер фото — aspect-[16/12.65] на всех брейкпоинтах, img с
// object-cover (центр). Кадрируем заранее тем же центральным кропом: на экране
// пиксель в пиксель то же самое, но без 2/3 высоты портретных исходников,
// которые всё равно обрезались CSS'ом.
const F = { width: 800, height: 633, fit: 'cover', quality: 78 }
const P = { width: 1300, quality: 78 }

const jobs = [
  // Features.vue
  [FEAT + 'card-1.webp', 'features-card-1.webp', F],
  [FEAT + 'card-2.webp', 'features-card-2.webp', F],
  [FEAT + 'card-3.webp', 'features-card-3.webp', F],
  ...['f1', 'f2', 'f3', 'f4', 't1', 't2', 't3', 'foto1', 'foto2', 'foto3', 'foto4', 'foto6']
    .map(n => [CARDS + n + '.webp', `features-${n}.webp`, F]),
  // TehnoPromo.vue
  [TEHNO + 'tehno_render_1.webp', 'tehno-1.webp', P],
  [TEHNO + 'tehno_render.webp',   'tehno-2.webp', P],
  [TEHNO + 'render_3.webp',       'tehno-3.webp', P],
  // ShtrihPromo.vue — рендер-обложка и фото Урбан Штрих 2А
  [STRIX + 'strix_2a_2.webp', 'shtrih-2a-1.webp', P],
  [STRIX + 'strix_2a_1.webp', 'shtrih-2a-2.webp', P],
  [STRIX + 'strix_2a_3.webp', 'shtrih-2a-3.webp', P],
  // MirrorDoorPromo.vue
  [INVIS + '2213EA7D-2E12-4D33-9BC3-63E4943E0098.webp', 'reflex-1.webp', P],
  [INVIS + 'A158F8FC-901B-4262-BDF6-D68E573300C8.webp', 'reflex-2.webp', P],
  [INVIS + '41CFB5EC-5142-462A-A702-E9AECDE149AD.webp', 'reflex-3.webp', P],
  // HiddenDoorsPromo.vue (reverse_render_11zon.webp не трогаем — оригинал 15КB,
  // пережатие делало его только тяжелее)
  [BENTO + 'secret_render_cover.webp',                  'secret-cover.webp', P],
  [INVIS + 'B2AB966B-4BC6-43E2-AEAA-7DA6B3CEDCC5.webp', 'secret-2.webp', P],
  [INVIS + '937DECDF-6886-48EB-80B6-3495AA998F94.webp', 'secret-3.webp', P],
  // Reviews.vue — логотипы площадок показываются 20×20 (64px — с запасом под retina),
  // исходники 600×600
  ['https://storage.yandexcloud.net/vfd74ru/info/reviews/yandex_logo.webp', 'logo-yandex.webp', { width: 64, quality: 85 }],
  ['https://storage.yandexcloud.net/vfd74ru/info/reviews/2gis_logo.webp',   'logo-2gis.webp',   { width: 64, quality: 85 }],
]

let before = 0, after = 0
for (const [src, out, { width, height, fit, quality }] of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = await sharp(buf).resize({ width, height, fit: fit ?? 'inside', withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT), img)
  before += buf.length; after += img.length
  console.log(`${out.padEnd(24)} ${(buf.length / 1024).toFixed(0).padStart(5)}KB -> ${(img.length / 1024).toFixed(0).padStart(4)}KB`)
}
console.log(`ИТОГО: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
