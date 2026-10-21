/* ============================================================
   Данные страницы «Декор» — фальшфрамуга, плинтус, декоративные рейки
   Только РРЦ. Комплектующие в цвет дверных полотен (Эмалекс/Экошпон/Эмаль).
   Тексты страницы — src/data/decor-page.ts; здесь только товары и цены.
   ============================================================ */

// ── Фото ──
// Облегчённые копии в проекте (npm run gen:decor → public/renders/decor/,
// размеры — decor-images.json): страница берёт копию под ширину экрана,
// крупная (large) — в окне просмотра. framuga, plintus и reyki-* —
// инфографика с текстом: показывается целиком, без кадрирования.
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

/* Первый экран (LandingHero): 16:7 — компьютер, 4:5 — телефон */
const heroWide = decorImage('hero-wide')
const heroTall = decorImage('hero-tall')
export const HERO_IMAGE = {
  alt:  'Дверь с фальшфрамугой до потолка и стена из декоративных реек в гостиной',
  wide: { src: heroWide.large, srcset: heroWide.srcset, width: heroWide.width, height: heroWide.height },
  tall: { srcset: heroTall.srcset, width: heroTall.width, height: heroTall.height },
}

// Декоративные рейки — 4 листа инфографики (портретные, ~3:4): виды реек,
// сборка на стене и потолке (два варианта), сборка перегородкой.
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
  /** Сечение и длина, мм */
  size?:  string
  /** Сколько штук в комплекте (unit — «комплект») */
  qty?:   string
  /** Состав — у строки-комплекта */
  contents?: string
  /** За что цена: «шт», «комплект», «4 шт» */
  unit:   string
  prices: Partial<Record<Material, number>>
  /** Комплект — строка-итог таблицы фальшфрамуги */
  kit?:   true
  /** Расходник (клипса, крепёжная рейка) — не входит в цену «от» */
  part?:  true
}

// ── Фальшфрамуга (комплект над проёмом — компланарный монтаж) ──
export const FRAMUGA_MATERIALS: Material[] = ['emalex', 'ekoshpon']
export const FRAMUGA_ROWS: PriceRow[] = [
  { name: 'Фальшфрамуга',          size: '930×930×10',               unit: 'шт',       prices: { emalex: 2_744, ekoshpon: 2_534 } },
  { name: 'Коробка компланарная',  size: '75×38×2400', qty: '2,5 шт', unit: 'комплект', prices: { emalex: 2_590, ekoshpon: 2_422 } },
  { name: 'Наличник компланарный', size: '90×10×2800', qty: '2 шт',   unit: 'комплект', prices: { emalex: 1_736, ekoshpon: 1_366 } },
  { name: 'Комплект', contents: 'фальшфрамуга, 2,5 коробки и 2 наличника', unit: 'комплект', prices: { emalex: 7_070, ekoshpon: 6_322 }, kit: true },
]

// ── Плинтус ──
export const PLINTUS_LENGTH    = 2140
export const PLINTUS_THICKNESS = 16
/** Высоты, мм: первая — для стандартных комнат, вторая — для высоких потолков */
export const PLINTUS_HEIGHTS   = [70, 100] as const
export const PLINTUS_MATERIALS: Material[] = ['emalex', 'ekoshpon', 'emal']
const plinth = (height: number, prices: PriceRow['prices']): PriceRow =>
  ({ name: 'Плинтус', size: `${height}×${PLINTUS_THICKNESS}×${PLINTUS_LENGTH}`, unit: 'шт', prices })
export const PLINTUS_ROWS: PriceRow[] = [
  plinth(PLINTUS_HEIGHTS[0], { emalex: 810,   ekoshpon: 705, emal: 950 }),
  plinth(PLINTUS_HEIGHTS[1], { emalex: 1_260, ekoshpon: 900, emal: 1_370 }),
  { name: 'Клипса', unit: 'шт', prices: { emalex: 50, ekoshpon: 50, emal: 50 }, part: true },
]

// ── Декоративные рейки (реечные панели, минимальный комплект) ──
export const REYKI_LENGTH  = 2750
/** Реек каждого типа в минимальном комплекте */
export const REYKI_KIT_PCS = 4
export const REYKI_MATERIALS: Material[] = ['emalex', 'ekoshpon']
const rail = (name: string, section: string, prices: PriceRow['prices'], part?: true): PriceRow =>
  ({ name, size: `${section}×${REYKI_LENGTH}`, unit: `${REYKI_KIT_PCS} шт`, prices, ...(part && { part }) })
export const REYKI_ROWS: PriceRow[] = [
  rail('Декоративная рейка',         '36×40', { emalex: 4_200, ekoshpon: 3_780 }),
  rail('Декоративная рейка фоновая', '31×22', { emalex: 2_860, ekoshpon: 2_100 }),
  rail('Крепёжная рейка',            '22×12', { emalex: 540,   ekoshpon: 540 }, true),
  rail('Соединительная рейка',       '22×25', { emalex: 960,   ekoshpon: 960 }, true),
]

// ── Цены «от» и «до» — для первого экрана, описания и разметки Product ──
/** Цены всех вариантов (строка × материал), без расходников */
export const offerPrices = (rows: PriceRow[]) => rows.filter((r) => !r.part).flatMap((r) => Object.values(r.prices) as number[])
export const priceRange = (rows: PriceRow[]) => ({ low: Math.min(...offerPrices(rows)), high: Math.max(...offerPrices(rows)) })

const FRAMUGA_KIT = FRAMUGA_ROWS.find((r) => r.kit)!
export const FROM_PRICE_FRAMUGA_KIT = priceRange([FRAMUGA_KIT]).low
export const FROM_PRICE_PLINTUS     = priceRange(PLINTUS_ROWS).low
export const FROM_PRICE_REYKI       = priceRange(REYKI_ROWS).low
