/* ============================================================
   Данные страницы «Декор» — фальшфрамуга, плинтус, декоративные рейки
   Только РРЦ. Комплектующие в цвет дверных полотен (Эмалекс/Экошпон/Эмаль).
   ============================================================ */

// ── Фото ──
// Облегчённые копии в проекте (npm run gen:decor → public/renders/decor/,
// размеры — decor-images.json): страница берёт копию под ширину экрана,
// крупная (large) — в окне просмотра. Постеры 16:9 под таблицами секций
// (InfoImageViewer, variant="photo").
import decorImages from './decor-images.json'

export interface DecorImage {
  src: string
  srcset: string
  /** Крупная копия — окно просмотра */
  large: string
  width: number
  height: number
}

const decorImage = (name: keyof typeof decorImages): DecorImage => {
  const { widths, width, height } = decorImages[name]
  const file = (w: number) => `/renders/decor/${name}-${w}.webp`
  return {
    src: file(widths[0]!),
    srcset: widths.map((w) => `${file(w)} ${w}w`).join(', '),
    large: file(widths.at(-1)!),
    width,
    height,
  }
}

export const IMAGES = {
  hero:    decorImage('hero'),
  framuga: decorImage('framuga'),
  plintus: decorImage('plintus'),
}

// Декоративные рейки — 4 фото, по порядку соответствуют строкам REYKI_ROWS
// (портретные, ~3:4 — не 16:9, как постеры выше).
export const REYKI_IMAGES: DecorImage[] = [
  decorImage('reyki-1'),
  decorImage('reyki-2'),
  decorImage('reyki-3'),
  decorImage('reyki-4'),
]

export type Material = 'emalex' | 'ekoshpon' | 'emal'

export const MATERIAL_LABELS: Record<Material, string> = {
  emalex:   'Эмалекс',
  ekoshpon: 'Экошпон',
  emal:     'Эмаль Polar',
}

export interface PriceRow {
  name:   string
  size?:  string
  unit:   string
  prices: Partial<Record<Material, number>>
}

// ── Фальшфрамуга (комплект над проёмом — компланарный монтаж) ──
export const FRAMUGA_MATERIALS: Material[] = ['emalex', 'ekoshpon']
export const FRAMUGA_ROWS: PriceRow[] = [
  { name: 'Фальшфрамуга',            size: '930×930×10',                      unit: 'шт',    prices: { emalex: 2_744, ekoshpon: 2_534 } },
  { name: 'Коробка компланарная',    size: '75×38×2400 (2,5 шт)',             unit: 'компл', prices: { emalex: 2_590, ekoshpon: 2_422 } },
  { name: 'Наличник компланарный',   size: '90×10×2800 (2 шт)',               unit: 'компл', prices: { emalex: 1_736, ekoshpon: 1_366 } },
  { name: 'Комплект',                size: 'фальшфрамуга, 2,5 коробки, 2 наличника', unit: 'компл', prices: { emalex: 7_070, ekoshpon: 6_322 } },
]

// ── Плинтус ──
export const PLINTUS_MATERIALS: Material[] = ['emalex', 'ekoshpon', 'emal']
export const PLINTUS_ROWS: PriceRow[] = [
  { name: 'Плинтус', size: '70×16×2140',  unit: 'шт', prices: { emalex: 810,  ekoshpon: 705, emal: 950 } },
  { name: 'Плинтус', size: '100×16×2140', unit: 'шт', prices: { emalex: 1_260, ekoshpon: 900, emal: 1_370 } },
  { name: 'Клипса',                       unit: 'шт', prices: { emalex: 50,   ekoshpon: 50,  emal: 50 } },
]

// ── Декоративные рейки (реечные панели, минимальный комплект — 4 шт) ──
export const REYKI_MATERIALS: Material[] = ['emalex', 'ekoshpon']
export const REYKI_ROWS: PriceRow[] = [
  { name: 'Декоративная рейка',          size: '36×40×2750 (4 шт)', unit: '4 шт', prices: { emalex: 4_200, ekoshpon: 3_780 } },
  { name: 'Декоративная рейка фоновая',  size: '31×22×2750 (4 шт)', unit: '4 шт', prices: { emalex: 2_860, ekoshpon: 2_100 } },
  { name: 'Крепёжная рейка',             size: '22×12×2750 (4 шт)', unit: '4 шт', prices: { emalex: 540,   ekoshpon: 540 } },
  { name: 'Соединительная рейка',        size: '22×25×2750 (4 шт)', unit: '4 шт', prices: { emalex: 960,   ekoshpon: 960 } },
]

// Минимальная стоимость входа в каждую категорию — для хедера/сниппетов
const minPrice = (rows: PriceRow[]) => Math.min(...rows.flatMap(r => Object.values(r.prices) as number[]))

export const FROM_PRICE_FRAMUGA_KIT = Math.min(...Object.values(FRAMUGA_ROWS[3].prices) as number[])
export const FROM_PRICE_PLINTUS     = minPrice(PLINTUS_ROWS)
export const FROM_PRICE_REYKI       = minPrice(REYKI_ROWS)
