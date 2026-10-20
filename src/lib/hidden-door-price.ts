/**
 * Цена скрытой двери по выбору в калькуляторе (/catalog/skrytye-dveri/,
 * HiddenPriceBuilder.astro). Только чистые функции поверх прайса
 * src/data/skrytye-dveri-products.ts — без своих цифр: что не выводится из
 * прайса, калькулятор не показывает. Тесты — tests/hidden-door-price.test.ts
 * (сверяют каждую цифру таблиц прайса).
 *
 * Правила — те же, что в таблицах на странице:
 *  - серия задаёт сторону открывания: «Секрет» — на себя, «Секрет Реверс» —
 *    от себя; у «Рефлекс» сторона выбирается;
 *  - комплект Лайт есть не у всех кромок (kitLitePrice: null) — тогда Стандарт;
 *  - нестандартная высота: надбавка ступени — к цене комплекта (полотно и
 *    короб), с округлением calcCustomPrice;
 *  - зеркало с двух сторон — только «Рефлекс», доплата фиксированная.
 */
import {
  SECRET_PRICES, REFLEX_PRICES, CUSTOM_HEIGHT_TIERS, REFLEX_HEIGHT_TIERS,
  REFLEX_TWO_SIDED_MIRROR_SURCHARGE, HIDDEN_SERIES, HIDDEN_EDGES, DOOR_HEIGHT,
  SECRET_SIZES, SECRET_REVERS_SIZES, REFLEX_MAX_HEIGHT, CUSTOM_LEAD_TIME, stockHeightsIn,
  calcCustomPrice,
  type HiddenSeries, type SecretEdgeColor,
} from '../data/skrytye-dveri-products'
import { listRu } from './typograph'
import { rub } from '../data/services'

export type HiddenBox = 'standard' | 'lite'

export interface HiddenConfig {
  series: HiddenSeries
  /** Открывание от себя — выбирается только у «Рефлекс» */
  reverse: boolean
  edge: SecretEdgeColor
  box: HiddenBox
  /** Начало ступени нестандартной высоты, мм (2050, 2300…); null — стандартная */
  height: number | null
  /** Зеркало с двух сторон — только «Рефлекс» */
  twoSided: boolean
}

export const DEFAULT_CONFIG: HiddenConfig = {
  series: 'sekret', reverse: false, edge: 'black', box: 'standard', height: null, twoSided: false,
}

export const BOX_LABEL: Record<HiddenBox, string> = { standard: 'Стандарт', lite: 'Лайт' }

/** Ступени нестандартной высоты серии */
export const tiersOf = (series: HiddenSeries) => (series === 'reflex' ? REFLEX_HEIGHT_TIERS : CUSTOM_HEIGHT_TIERS)

const isReverse = (c: HiddenConfig) => c.series === 'revers' || (c.series === 'reflex' && c.reverse)

/** Строка прайса для серии, кромки и стороны открывания */
export function priceRow(c: Pick<HiddenConfig, 'series' | 'edge' | 'reverse'>) {
  const rows = c.series === 'reflex' ? REFLEX_PRICES : SECRET_PRICES
  const reverse = isReverse(c as HiddenConfig)
  const row = rows.find((r) => r.edgeColor === c.edge && r.reverse === reverse)
  if (!row) throw new Error(`Нет цены: ${c.series}, ${c.edge}, ${reverse ? 'от себя' : 'на себя'}`)
  return row
}

/** Есть ли комплект Лайт у этой кромки в этой серии */
export const liteAvailable = (c: Pick<HiddenConfig, 'series' | 'edge' | 'reverse'>) => priceRow(c).kitLitePrice != null

/** Привести выбор к допустимому: сторона — по серии, Лайт — где есть,
    высота — ступень этой серии, зеркало — только «Рефлекс». */
export function normalize(c: HiddenConfig): HiddenConfig {
  const out = { ...c }
  if (out.series !== 'reflex') { out.reverse = out.series === 'revers'; out.twoSided = false }
  if (out.box === 'lite' && !liteAvailable(out)) out.box = 'standard'
  if (out.height != null && !tiersOf(out.series).some((t) => t.from === out.height)) {
    // ступени нет в этой серии («Рефлекс» — до 2500 мм): ближайшая ниже
    const lower = tiersOf(out.series).filter((t) => t.from <= out.height!)
    out.height = lower.length ? lower[lower.length - 1]!.from : null
  }
  return out
}

export interface HiddenQuote {
  /** Полотно, стандартная высота */
  blade: number
  /** Короб, ответная планка и две скрытые петли — комплект минус полотно */
  box: number
  /** Надбавка за высоту к комплекту, ₽ (0 — стандартная высота) */
  heightExtra: number
  /** Доплата за зеркало с двух сторон, ₽ */
  mirrorExtra: number
  total: number
  tier: (typeof CUSTOM_HEIGHT_TIERS)[number] | (typeof REFLEX_HEIGHT_TIERS)[number] | undefined
}

export function quote(input: HiddenConfig): HiddenQuote {
  const c = normalize(input)
  const row = priceRow(c)
  const kit = c.box === 'lite' ? row.kitLitePrice! : row.kitStandardPrice
  const tier = c.height == null ? undefined : tiersOf(c.series).find((t) => t.from === c.height)
  const kitWithHeight = tier ? calcCustomPrice(kit, tier.surcharge) : kit
  const mirrorExtra = c.series === 'reflex' && c.twoSided ? REFLEX_TWO_SIDED_MIRROR_SURCHARGE : 0
  return {
    blade: row.bladePrice,
    box: kit - row.bladePrice,
    heightExtra: kitWithHeight - kit,
    mirrorExtra,
    total: kitWithHeight + mirrorExtra,
    tier,
  }
}

/** Высота словами: «2000 мм» или «2050–2250 мм» */
export const heightLabel = (c: HiddenConfig) => {
  const tier = c.height == null ? undefined : tiersOf(c.series).find((t) => t.from === c.height)
  return `${tier ? tier.range : DOOR_HEIGHT} мм`
}

/** Выбор словами — подпись результата и текст сообщения менеджеру */
export function describe(input: HiddenConfig): string {
  const c = normalize(input)
  return [
    `${HIDDEN_SERIES[c.series].name}${c.series === 'reflex' ? (c.reverse ? ', от себя' : ', на себя') : ''}`,
    `кромка ${HIDDEN_EDGES[c.edge].name.toLowerCase()}`,
    `короб ${BOX_LABEL[c.box]}`,
    `высота ${heightLabel(c)}`,
    ...(c.series === 'reflex' ? [c.twoSided ? 'зеркало с двух сторон' : 'зеркало с одной стороны'] : []),
  ].join(', ')
}

/** Сообщение менеджеру: выбор словами и цена с сайта */
export const managerMessage = (c: HiddenConfig) => `Хочу рассчитать скрытую дверь: ${describe(c)}. На сайте — ${rub(quote(c).total)}.`

/** Срок нестандартной высоты: высоты из наличия в ступени — названы
    («Рефлекс» делается по размеру — у него наличия нет) */
function heightNote(c: HiddenConfig) {
  const tier = tiersOf(c.series).find((t) => t.from === c.height)!
  const stock = c.series === 'reflex' ? [] : stockHeightsIn(tier)
  return stock.length
    ? `${listRu(stock.map(String))} мм — в наличии, другие высоты диапазона — изготовление ${CUSTOM_LEAD_TIME}`
    : `Нестандартная высота — изготовление ${CUSTOM_LEAD_TIME}`
}

/** Что важно знать о выборе: размеры в наличии и срок нестандартной высоты */
export function notesOf(input: HiddenConfig): string[] {
  const c = normalize(input)
  const widths = c.series === 'revers' ? SECRET_REVERS_SIZES : SECRET_SIZES
  return [
    c.series === 'reflex'
      ? `Делается по размеру проёма, высота — до ${REFLEX_MAX_HEIGHT} мм`
      : `Ширина в наличии — ${listRu(widths.map(String))} мм`,
    ...(c.height != null ? [heightNote(c)] : []),
  ]
}

/* ── Выбор в адресе страницы: ?series=reflex&edge=gold&box=lite&height=2300&opening=reverse&mirror=both ── */
export const HIDDEN_URL_PARAMS = ['series', 'opening', 'edge', 'box', 'height', 'mirror'] as const

export function configToParams(input: HiddenConfig): URLSearchParams {
  const c = normalize(input)
  const p = new URLSearchParams()
  if (c.series !== DEFAULT_CONFIG.series) p.set('series', c.series)
  if (c.series === 'reflex' && c.reverse) p.set('opening', 'reverse')
  if (c.edge !== DEFAULT_CONFIG.edge) p.set('edge', c.edge)
  if (c.box !== DEFAULT_CONFIG.box) p.set('box', c.box)
  if (c.height != null) p.set('height', String(c.height))
  if (c.twoSided) p.set('mirror', 'both')
  return p
}

export function paramsToConfig(p: URLSearchParams): HiddenConfig {
  const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T =>
    (allowed as readonly string[]).includes(v ?? '') ? (v as T) : fallback
  const height = Number(p.get('height'))
  return normalize({
    series: pick(p.get('series'), Object.keys(HIDDEN_SERIES) as HiddenSeries[], DEFAULT_CONFIG.series),
    reverse: p.get('opening') === 'reverse',
    edge: pick(p.get('edge'), Object.keys(HIDDEN_EDGES) as SecretEdgeColor[], DEFAULT_CONFIG.edge),
    box: pick(p.get('box'), ['standard', 'lite'] as const, DEFAULT_CONFIG.box),
    height: Number.isFinite(height) && height > 0 ? height : null,
    twoSided: p.get('mirror') === 'both',
  })
}
