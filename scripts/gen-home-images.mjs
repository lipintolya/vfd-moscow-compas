/**
 * Генерирует уменьшенные локальные копии фото дверей в public/renders/home/
 * (оригиналы в облаке — до 1440×2560 и ~1 МБ за файл):
 *   - tehno-1, shtrih-2a-1, reflex-2, secret-2 — карточки «В салоне»
 *     (src/data/in-salon.ts) и заглушки категорий портфолио (PortfolioGrid.vue);
 *   - secret-cover, secret-2, secret-3, tehno-1 — фото в статьях;
 *   - logo-yandex, logo-2gis — логотипы площадок в отзывах (Reviews.vue).
 * Ширина 1300 — колонка ~650 CSS-px на retina. Карточкам «В салоне» —
 * ещё копии <name>-600 и -900 (srcset в src/data/in-salon.ts, CARD_WIDTHS):
 * лента на телефоне и сцена на обычном экране не тянут кадр 1300.
 *
 * Запуск: node scripts/gen-home-images.mjs
 * Когда запускать снова: заменили фото в облаке или добавили новое (тогда
 * добавьте строку в jobs).
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { loadMedia } from './lib/media.mjs'

const OUT = new URL('../public/renders/home/', import.meta.url)
await mkdir(OUT, { recursive: true })

const TEHNO = 'https://storage.yandexcloud.net/vfd74ru/doors-main_renders/tehno/'
const INVIS = 'https://storage.yandexcloud.net/vfd74ru/invisible/'
const BENTO = 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/'
const STRIX = 'https://storage.yandexcloud.net/vfd74ru/promo_main/strix/'
const LOGOS = 'https://storage.yandexcloud.net/vfd74ru/info/reviews/'

const P = { width: 1300, quality: 78 }
// Карточки «В салоне» — плюс копии под ширину экрана (CARD_WIDTHS в in-salon.ts)
const CARD = { ...P, extra: [600, 900] }
// Логотипы показываются 20×20 — 64px с запасом под retina, исходники 600×600
const LOGO = { width: 64, quality: 85 }

const jobs = [
  [TEHNO + 'tehno_render_1.webp', 'tehno-1.webp', CARD],
  [STRIX + 'strix_2a_2.webp', 'shtrih-2a-1.webp', CARD],
  [INVIS + 'A158F8FC-901B-4262-BDF6-D68E573300C8.webp', 'reflex-2.webp', CARD],
  [BENTO + 'secret_render_cover.webp', 'secret-cover.webp', P],
  [INVIS + 'B2AB966B-4BC6-43E2-AEAA-7DA6B3CEDCC5.webp', 'secret-2.webp', CARD],
  [INVIS + '937DECDF-6886-48EB-80B6-3495AA998F94.webp', 'secret-3.webp', P],
  [LOGOS + 'yandex_logo.webp', 'logo-yandex.webp', LOGO],
  [LOGOS + '2gis_logo.webp', 'logo-2gis.webp', LOGO],
]

let before = 0, after = 0
for (const [src, out, { width, height, fit, quality, extra = [] }] of jobs) {
  const buf = await loadMedia(src)
  for (const [w, name] of [[width, out], ...extra.map((e) => [e, out.replace('.webp', `-${e}.webp`)])]) {
    const img = await sharp(buf).resize({ width: w, height, fit: fit ?? 'inside', withoutEnlargement: true }).webp({ quality }).toBuffer()
    await writeFile(new URL(name, OUT), img)
    before += buf.length; after += img.length
    console.log(`${name.padEnd(24)} ${(buf.length / 1024).toFixed(0).padStart(5)}KB -> ${(img.length / 1024).toFixed(0).padStart(4)}KB`)
  }
}
console.log(`ИТОГО: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
