/* ============================================================
   Данные скрытых дверей «Секрет» / «Секрет Реверс»
   Только РРЦ — закупочные цены на сайте не публикуются
   ============================================================ */
import { isPromoActive } from '../lib/promo-dates'

// ── Акция «Секрет» -8% (см. data/promos.ts, id: 3) ────────────
// Дата продублирована здесь намеренно: это временная переоценка цен
// в данных конкретного товара, а не часть общей витрины акций —
// удобнее держать рядом с ценами, которые она меняет. Когда истечёт,
// applySecretPromo сама перестанет применяться, ничего вручную
// возвращать не нужно.
export const SECRET_PROMO_DISCOUNT    = 0.08
export const SECRET_PROMO_VALID_UNTIL = '2026-08-30'
export const SECRET_PROMO_ACTIVE      = isPromoActive(SECRET_PROMO_VALID_UNTIL)

/** Скидка -8%, округление вверх до 10 ₽ (та же схема, что в calcCustomPrice).
    Вне акции возвращает цену без изменений. */
export function applySecretPromo(price: number): number {
  if (!SECRET_PROMO_ACTIVE) return price
  return Math.ceil(price * (1 - SECRET_PROMO_DISCOUNT) / 10) * 10
}

const CDN      = 'https://storage.yandexcloud.net/catalog-vfd/invisible/'
const INFO_CDN  = `${CDN}invisible_info/`

// ── Информационные изображения ─────────────────────────────────
export const INFO_IMAGES = {
  kompl:  `${INFO_CDN}invisible_kompl.webp`,
  lr:     `${INFO_CDN}invisible_lr.webp`,
  constr: `${INFO_CDN}invisible_constr.webp`,
} as const

// Разрезы короба «Секрет» — Стандарт (монолитный алюминий) и Лайт (алюминий + сосна)
export const BOX_PRO_IMAGE  = 'https://storage.yandexcloud.net/vfd74ru/invisible/render_alum_pro.webp'
export const BOX_LITE_IMAGE = 'https://storage.yandexcloud.net/vfd74ru/invisible/render_alum_lite.webp'

// ── Изображения ───────────────────────────────────────────────
// invisible/invisibleRev — локальные ресайзы (см. scripts/gen-hidden-doors-hero.mjs):
// оригиналы 1122×1402 (~155КБ) используются на 6 страницах максимум в ~900px
// по широкой стороне, локальная копия экономит ~75% веса на каждой из них.
export const IMAGES = {
  // Серия «Секрет» (прямой монтаж)
  invisible:    '/renders/hidden-doors/sekret-900.webp',
  // Серия «Секрет Реверс» (реверсивный монтаж)
  invisibleRev: '/renders/hidden-doors/sekret-revers-900.webp',
  // Обложка hero на /catalog/skrytye-dveri/
  heroCover: 'https://storage.yandexcloud.net/vfd74ru/invisible/invisible_cover.webp',
  // Портфолио — заменить src когда будут готовы
  portfolio: [
    { src: '', alt: 'Скрытая дверь в гостиной — Челябинск',           caption: 'Гостиная, кромка чёрная'     },
    { src: '', alt: 'Скрытая дверь в спальне — Челябинск',            caption: 'Спальня, под покраску'       },
    { src: '', alt: 'Скрытая дверь в коридоре — Челябинск',           caption: 'Коридор, реверсивный монтаж' },
    { src: '', alt: 'Скрытые двери в студии — Челябинск',             caption: 'Студия, кромка серебро'      },
    { src: '', alt: 'Скрытая дверь в санузел с завёрткой WC',         caption: 'Санузел, завёртка WC'        },
    { src: '', alt: 'Скрытая дверь под декоративную штукатурку',      caption: 'Прихожая, под штукатурку'    },
  ],
} as const

// ── Размеры в наличии ────────────────────────────────────────
export const DOOR_HEIGHT         = 2000
export const SECRET_SIZES        = [600, 700, 800, 900] as const
export const SECRET_REVERS_SIZES = [600, 700, 800]      as const

// ── Цены РРЦ — зависят от кромки и стороны открывания ──────────
// Полотно «Финиш-грунт» — единственный доступный вариант покрытия
// (позиции с простым грунтом убраны из продажи).
export const FRAME_KIT_PRICE = 19_820   // РРЦ короба «Хром» (2,5 шт) — сверено: kitStandardPrice - bladePrice = 19 820 везде

export type SecretEdgeColor = 'black' | 'silver' | 'gold'

export interface SecretPriceRow {
  edgeColor:        SecretEdgeColor
  edgeLabel:        string
  reverse:          boolean
  bladePrice:        number
  kitStandardPrice:  number
  /** null — комплект «Лайт» для этой комбинации не предлагается (сейчас так у кромки золото) */
  kitLitePrice:      number | null
}

export const SECRET_PRICES: SecretPriceRow[] = [
  { edgeColor: 'black',  edgeLabel: 'Чёрная 4×4 мм',  reverse: false, bladePrice: 11_360, kitStandardPrice: 31_180, kitLitePrice: 23_820 },
  { edgeColor: 'black',  edgeLabel: 'Чёрная 4×4 мм',  reverse: true,  bladePrice: 15_910, kitStandardPrice: 35_730, kitLitePrice: 28_370 },
  { edgeColor: 'silver', edgeLabel: 'Серебро 4×4 мм', reverse: false, bladePrice: 11_360, kitStandardPrice: 31_180, kitLitePrice: 23_820 },
  { edgeColor: 'silver', edgeLabel: 'Серебро 4×4 мм', reverse: true,  bladePrice: 15_910, kitStandardPrice: 35_730, kitLitePrice: 28_370 },
  // Золото — цена не уточнялась в последней правке, оставлена по прежним данным.
  { edgeColor: 'gold',   edgeLabel: 'Золото 4×4 мм',  reverse: false, bladePrice: 12_090, kitStandardPrice: 32_310, kitLitePrice: null },
  { edgeColor: 'gold',   edgeLabel: 'Золото 4×4 мм',  reverse: true,  bladePrice: 16_920, kitStandardPrice: 37_140, kitLitePrice: null },
]

// «От» для превью и карточки «Секрет» — самая доступная комбинация в целом;
// комплект считаем по самому дешёвому доступному уровню (Лайт, где он есть).
// *_ORIGINAL — цена без акции, нужна только для зачёркнутой цены в вёрстке;
// везде, где нужна «текущая» цена, используй версию без суффикса.
export const SECRET_MIN_BLADE_PRICE_ORIGINAL = Math.min(...SECRET_PRICES.map(r => r.bladePrice))
export const SECRET_MIN_KIT_PRICE_ORIGINAL   = Math.min(...SECRET_PRICES.map(r => r.kitLitePrice ?? r.kitStandardPrice))
export const SECRET_MIN_BLADE_PRICE = applySecretPromo(SECRET_MIN_BLADE_PRICE_ORIGINAL)
export const SECRET_MIN_KIT_PRICE   = applySecretPromo(SECRET_MIN_KIT_PRICE_ORIGINAL)

// «От» для карточки «Секрет Реверс» — минимум среди строк реверсивного открывания
const SECRET_REVERS_ROWS = SECRET_PRICES.filter(r => r.reverse)
export const SECRET_REVERS_MIN_BLADE_PRICE_ORIGINAL = Math.min(...SECRET_REVERS_ROWS.map(r => r.bladePrice))
export const SECRET_REVERS_MIN_KIT_PRICE_ORIGINAL   = Math.min(...SECRET_REVERS_ROWS.map(r => r.kitLitePrice ?? r.kitStandardPrice))
export const SECRET_REVERS_MIN_BLADE_PRICE = applySecretPromo(SECRET_REVERS_MIN_BLADE_PRICE_ORIGINAL)
export const SECRET_REVERS_MIN_KIT_PRICE   = applySecretPromo(SECRET_REVERS_MIN_KIT_PRICE_ORIGINAL)

// Полная таблица цен «Секрет» с применённой акцией — используй в таблице на
// странице вместо SECRET_PRICES (который остаётся исходником/каноном).
export const SECRET_PRICES_DISPLAY: SecretPriceRow[] = SECRET_PRICES.map(row => ({
  ...row,
  bladePrice:       applySecretPromo(row.bladePrice),
  kitStandardPrice: applySecretPromo(row.kitStandardPrice),
  kitLitePrice:      row.kitLitePrice != null ? applySecretPromo(row.kitLitePrice) : null,
}))

// ── Комплект скрытого короба ─────────────────────────────────
export const FRAME_KIT = {
  article:  'К-т скрытого короба 54×43×2200',
  size:     '54×43 мм, длина 2200 мм (2,5 пог. м)',
  priceRrp: FRAME_KIT_PRICE,
  includes: [
    'Алюминиевый профиль 54×43 мм',
    'Запил под ответную планку',
    'Ответная планка',
    'Две скрытые петли №1',
  ],
  colors: [
    { label: 'Чёрный',  inStock: 22 },
    { label: 'Серебро', inStock: 12 },
    { label: 'Золото',  inStock: 5  },
  ],
} as const

// ── Нестандартные высоты (изготовление под заказ) ────────────
// Надбавка к цене полотна; короб и фурнитура — по стандартной цене
export const CUSTOM_HEIGHT_TIERS = [
  { range: '2050–2250', from: 2050, to: 2250, surcharge: 0.20, pct: '+20%' },
  { range: '2300–2350', from: 2300, to: 2350, surcharge: 0.30, pct: '+30%' },
  { range: '2400–2550', from: 2400, to: 2550, surcharge: 0.40, pct: '+40%' },
  { range: '2600–2700', from: 2600, to: 2700, surcharge: 0.50, pct: '+50%' },
] as const

export const CUSTOM_LEAD_TIME = '6–8 недель'

// Рассчитать цену комплекта с надбавкой за нестандартную высоту (округление вверх)
export function calcCustomPrice(basePrice: number, surcharge: number): number {
  return Math.ceil(basePrice * (1 + surcharge) / 10) * 10
}

// Количество комплектов короба на одну дверь
// Один к-т: 2,5 шт × 2200 мм = 5500 мм покрытия; +200 мм на запилы
export function calcFrameKits(heightMm: number, widthMm: number): number {
  return Math.ceil((2 * heightMm + widthMm + 200) / 5500)
}

// ── Дополнительная фурнитура (опционально к основному заказу) ─
export const OPTIONAL_HARDWARE = [
  {
    name: 'Ручка скрытого монтажа',
    desc: 'Утапливается в торец полотна — не выступает за плоскость стены',
    icon: 'handle',
  },
  {
    name: 'Стопор скрытого монтажа',
    desc: 'Удерживает дверь в открытом положении без видимых деталей',
    icon: 'stop',
  },
  {
    name: 'Завёртка WC',
    desc: 'Для санузлов: блокировка изнутри, индикатор занятости снаружи',
    icon: 'wc',
  },
] as const

// ── Секрет «Рефлекс» — скрытая дверь с зеркалом ──────────────
// Локальный ресайз (см. scripts/gen-hidden-doors-hero.mjs) — оригинал
// 1672×941 используется как og:image/hero на 3 сегментных лендингах и
// в structured data, где полное разрешение не нужно.
export const REFLEX_IMAGE           = '/renders/hidden-doors/reflex-900.webp'
export const REFLEX_OPENING_DIAGRAM = 'https://storage.yandexcloud.net/vfd74ru/invisible/opredelenie_storoni_otkrivaniya_dlya_zerkal.webp'

export type ReflexEdgeColor = 'black' | 'silver' | 'gold'

export interface ReflexPriceRow {
  edgeColor:        ReflexEdgeColor
  edgeLabel:        string
  reverse:          boolean
  bladePrice:        number
  kitStandardPrice:  number
  /** null — комплект «Лайт» для этой кромки не предлагается (сейчас так у золота) */
  kitLitePrice:      number | null
}

export const REFLEX_PRICES: ReflexPriceRow[] = [
  { edgeColor: 'black',  edgeLabel: 'Чёрная',  reverse: false, bladePrice: 19_790, kitStandardPrice: 41_690, kitLitePrice: 36_270 },
  { edgeColor: 'black',  edgeLabel: 'Чёрная',  reverse: true,  bladePrice: 24_620, kitStandardPrice: 46_520, kitLitePrice: 41_100 },
  { edgeColor: 'silver', edgeLabel: 'Серебро', reverse: false, bladePrice: 19_790, kitStandardPrice: 41_690, kitLitePrice: 36_270 },
  { edgeColor: 'silver', edgeLabel: 'Серебро', reverse: true,  bladePrice: 24_620, kitStandardPrice: 46_520, kitLitePrice: 41_100 },
  { edgeColor: 'gold',   edgeLabel: 'Золото',  reverse: false, bladePrice: 19_790, kitStandardPrice: 41_690, kitLitePrice: null },
  { edgeColor: 'gold',   edgeLabel: 'Золото',  reverse: true,  bladePrice: 24_620, kitStandardPrice: 46_520, kitLitePrice: null },
]

// «От» для превью — самая доступная комбинация; комплект считаем по самому
// дешёвому доступному уровню (Лайт дешевле Стандарта там, где он есть)
export const REFLEX_MIN_BLADE_PRICE = Math.min(...REFLEX_PRICES.map(r => r.bladePrice))
export const REFLEX_MIN_KIT_PRICE   = Math.min(...REFLEX_PRICES.map(r => r.kitLitePrice ?? r.kitStandardPrice))

// Опция «зеркало с двух сторон» — дверь не делится на левую/правую,
// доплата фиксированная, не зависит от кромки и стороны открывания
export const REFLEX_TWO_SIDED_MIRROR_SURCHARGE = 5_200

// «От» для обратного открывания — минимум среди строк реверса
const REFLEX_REVERS_ROWS = REFLEX_PRICES.filter(r => r.reverse)
export const REFLEX_REVERS_MIN_KIT_PRICE = Math.min(...REFLEX_REVERS_ROWS.map(r => r.kitLitePrice ?? r.kitStandardPrice))

// Нестандартные высоты для «Рефлекс» — максимум 2500 мм (короче, чем у «Секрет»),
// поэтому верхний тир урезан до +40% и тира +50% (2600–2700 мм) для неё нет
export const REFLEX_HEIGHT_TIERS = [
  { range: '2050–2250', from: 2050, to: 2250, surcharge: 0.20, pct: '+20%' },
  { range: '2300–2350', from: 2300, to: 2350, surcharge: 0.30, pct: '+30%' },
  { range: '2400–2500', from: 2400, to: 2500, surcharge: 0.40, pct: '+40%' },
] as const

// ── Цифры и факты ────────────────────────────────────────────
export const FACTS = [
  { value: '1–2 мм',    label: 'зазор между полотном и стеной'     },
  { value: 'от 90 мм',  label: 'минимальная толщина стены'         },
  { value: 'до 70 кг',  label: 'нагрузка на скрытые петли'         },
  { value: '3 слоя',    label: 'краски принимает грунтованная поверхность' },
  { value: '1–2 дня',   label: 'срок монтажа нашей бригадой'       },
  { value: '2,5 пог. м','label': 'алюминиевого профиля в коробе'   },
] as const
