/* ============================================================
   Данные скрытых дверей «Секрет» / «Секрет Реверс»
   Только РРЦ — закупочные цены на сайте не публикуются
   ============================================================ */
import type { ModelStatus } from '../lib/made-to-order'

const CDN      = '/media/catalog-vfd/invisible/'
const INFO_CDN  = `${CDN}invisible_info/`

/** Статус серии — карточки на /catalog/skrytye-dveri/ и блок
    «Новинки и двери в наличии» на главной (src/data/in-salon.ts) */
export const HIDDEN_STATUS = {
  sekret: 'stock',
  revers: 'stock',
  reflex: 'new',
} as const satisfies Record<string, ModelStatus>

// ── Информационные изображения ─────────────────────────────────
export const INFO_IMAGES = {
  kompl:  `${INFO_CDN}invisible_kompl.webp`,
  lr:     `${INFO_CDN}invisible_lr.webp`,
  constr: `${INFO_CDN}invisible_constr.webp`,
} as const

// Разрезы короба «Секрет» — Стандарт (монолитный алюминий) и Лайт (алюминий + сосна)
export const BOX_PRO_IMAGE  = '/media/vfd74ru/invisible/render_alum_pro.webp'
export const BOX_LITE_IMAGE = '/media/vfd74ru/invisible/render_alum_lite.webp'

// ── Изображения ───────────────────────────────────────────────
// invisible/invisibleRev — локальные ресайзы (см. scripts/gen-hidden-doors-hero.mjs):
// оригиналы 1122×1402 (~155КБ) используются на 6 страницах максимум в ~900px
// по широкой стороне, локальная копия экономит ~75% веса на каждой из них.
export const IMAGES = {
  // Серия «Секрет» (прямой монтаж)
  invisible:    '/renders/hidden-doors/sekret-900.webp',
  // Серия «Секрет Реверс» (реверсивный монтаж)
  invisibleRev: '/renders/hidden-doors/sekret-revers-900.webp',
} as const

// ── Первый экран /catalog/skrytye-dveri/ — кадровка под экран (<picture>,
// scripts/gen-hidden-doors-hero.mjs): 16:7 для компьютера, 4:5 для телефона
const HERO = '/renders/hidden-doors'
export const HERO_IMAGES = {
  alt:  'Скрытая дверь вровень со стеной в прихожей — без наличников и видимых петель',
  wide: { src: `${HERO}/hero-wide-1600.webp`, srcset: `${HERO}/hero-wide-960.webp 960w, ${HERO}/hero-wide-1600.webp 1600w`, width: 1600, height: 700 },
  tall: { srcset: `${HERO}/hero-tall-640.webp 640w, ${HERO}/hero-tall-1080.webp 1080w`, width: 1080, height: 1350 },
} as const

// ── Размеры в наличии ────────────────────────────────────────
export const DOOR_HEIGHT         = 2000
/** Высоты, которые держим на складе (мм); остальные — под заказ */
export const SECRET_STOCK_HEIGHTS = [2000, 2100, 2300] as const
export const SECRET_SIZES        = [600, 700, 800, 900] as const
export const SECRET_REVERS_SIZES = [600, 700, 800]      as const

// ── Цены РРЦ — зависят от кромки и стороны открывания ──────────
// Полотно «Финиш-грунт» — единственный доступный вариант покрытия
// (позиции с простым грунтом убраны из продажи).
export type SecretEdgeColor = 'black' | 'silver' | 'gold'

/** Кромка: название и цвета образца — превью кромки (ColorSelector.vue) и
    калькулятор цены. Цвета — физического материала (анод), поэтому здесь,
    а не в токенах сайта; серебро — тот же графит сайта */
export const HIDDEN_EDGES: Record<SecretEdgeColor, { name: string; material: string; main: string; highlight: string; shadow: string; gradient: boolean }> = {
  black:  { name: 'Чёрная',  material: 'Чёрный анод',          main: '#1a1a1a', highlight: '#363636', shadow: '#0a0a0a', gradient: false },
  silver: { name: 'Серебро', material: 'Натуральный алюминий', main: 'var(--color-slate-400)', highlight: 'var(--color-slate-200)', shadow: 'var(--color-slate-500)', gradient: true },
  gold:   { name: 'Золото',  material: 'Золотой анод',         main: '#c5a84a', highlight: '#e8c96e', shadow: '#9e8236', gradient: true },
}

/** Серии: название и сторона открывания — карточки серий и калькулятор */
export type HiddenSeries = 'sekret' | 'revers' | 'reflex'
export const HIDDEN_SERIES: Record<HiddenSeries, { name: string; opening: string }> = {
  sekret: { name: '«Секрет»',        opening: 'Открывается на себя' },
  revers: { name: '«Секрет Реверс»', opening: 'Открывается от себя' },
  reflex: { name: '«Рефлекс»',       opening: 'Зеркало во всю высоту' },
}

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
export const SECRET_MIN_BLADE_PRICE = Math.min(...SECRET_PRICES.map(r => r.bladePrice))
export const SECRET_MIN_KIT_PRICE   = Math.min(...SECRET_PRICES.map(r => r.kitLitePrice ?? r.kitStandardPrice))

// «От» для карточки «Секрет Реверс» — минимум среди строк реверсивного открывания
const SECRET_REVERS_ROWS = SECRET_PRICES.filter(r => r.reverse)
export const SECRET_REVERS_MIN_BLADE_PRICE = Math.min(...SECRET_REVERS_ROWS.map(r => r.bladePrice))
export const SECRET_REVERS_MIN_KIT_PRICE   = Math.min(...SECRET_REVERS_ROWS.map(r => r.kitLitePrice ?? r.kitStandardPrice))

// ── Нестандартные высоты (изготовление под заказ) ────────────
// Надбавка к цене полотна; короб и фурнитура — по стандартной цене
export const CUSTOM_HEIGHT_TIERS = [
  { range: '2050–2250', from: 2050, to: 2250, surcharge: 0.20, pct: '+20%' },
  { range: '2300–2350', from: 2300, to: 2350, surcharge: 0.30, pct: '+30%' },
  { range: '2400–2550', from: 2400, to: 2550, surcharge: 0.40, pct: '+40%' },
  { range: '2600–2700', from: 2600, to: 2700, surcharge: 0.50, pct: '+50%' },
] as const

export const CUSTOM_LEAD_TIME = '6–8 недель'

/** Нестандартные высоты из наличия («Секрет» и «Секрет Реверс»): срок
    изготовления к ним не относится, надбавка ступени — относится */
export const SECRET_STOCK_CUSTOM_HEIGHTS = SECRET_STOCK_HEIGHTS.filter((h) => h !== DOOR_HEIGHT)
/** Высоты из наличия внутри ступени */
export const stockHeightsIn = (tier: { from: number; to: number }) =>
  SECRET_STOCK_CUSTOM_HEIGHTS.filter((h) => h >= tier.from && h <= tier.to)
/** Максимальная высота под заказ, мм — из таблицы надбавок */
export const CUSTOM_MAX_HEIGHT = CUSTOM_HEIGHT_TIERS[CUSTOM_HEIGHT_TIERS.length - 1]!.to

/** Ступень надбавки для высоты, мм (undefined — стандартная высота) */
export function heightTier(heightMm: number) {
  return CUSTOM_HEIGHT_TIERS.find(t => heightMm >= t.from && heightMm <= t.to)
}

// Рассчитать цену комплекта с надбавкой за нестандартную высоту (округление вверх)
export function calcCustomPrice(basePrice: number, surcharge: number): number {
  return Math.ceil(basePrice * (1 + surcharge) / 10) * 10
}

// ── Секрет «Рефлекс» — скрытая дверь с зеркалом ──────────────
// Локальный ресайз (см. scripts/gen-hidden-doors-hero.mjs) — оригинал
// 1672×941 используется как og:image/hero на 3 сегментных лендингах и
// в structured data, где полное разрешение не нужно.
export const REFLEX_IMAGE           = '/renders/hidden-doors/reflex-900.webp'
export const REFLEX_OPENING_DIAGRAM = '/media/vfd74ru/invisible/opredelenie_storoni_otkrivaniya_dlya_zerkal.webp'

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

/** Максимальная высота «Рефлекс», мм */
export const REFLEX_MAX_HEIGHT = REFLEX_HEIGHT_TIERS[REFLEX_HEIGHT_TIERS.length - 1]!.to

// ── Цифры и факты ────────────────────────────────────────────
// Отдельно — для подстановки в тексты статей (src/lib/article-vars.ts)
export const HIDDEN_SPECS = {
  gap:         '1–2 мм',
  wallMin:     '90 мм',
  hingeLoad:   '70 кг',
  paintCoats:  '3 слоя',
  installDays: '1–2 дня',
  /** Сечение профиля короба */
  boxProfile:  '54×43 мм',
} as const

export const FACTS = [
  { value: HIDDEN_SPECS.gap,                label: 'зазор между полотном и стеной'     },
  { value: `от ${HIDDEN_SPECS.wallMin}`,    label: 'минимальная толщина стены'         },
  { value: `до ${HIDDEN_SPECS.hingeLoad}`,  label: 'нагрузка на скрытые петли'         },
  { value: HIDDEN_SPECS.paintCoats,         label: 'краски принимает грунтованная поверхность' },
  { value: HIDDEN_SPECS.installDays,        label: 'срок монтажа нашей бригадой'       },
  { value: '2,5 пог. м','label': 'алюминиевого профиля в коробе'   },
] as const
