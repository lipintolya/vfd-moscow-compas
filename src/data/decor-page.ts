/**
 * Тексты страницы «Декор» (/catalog/decor/) и блока «Плинтус к дверям» на
 * страницах моделей. Цены, размеры и покрытия — из decor-products.ts:
 * здесь они только подставляются в текст. Категория — одна секция страницы
 * (DecorSection.astro): заголовок, пояснение, текст, инфографика, таблица.
 */
import { SITE } from '../config/site'
import { rub } from './services'
import { listRu, upperFirst } from '../lib/typograph'
import { PROFILES_COUNT } from './plintus'
import {
  IMAGES, REYKI_IMAGES, MATERIAL_LABELS,
  FRAMUGA_MATERIALS, FRAMUGA_ROWS, PLINTUS_MATERIALS, PLINTUS_ROWS, REYKI_MATERIALS, REYKI_ROWS,
  PLINTUS_HEIGHTS, PLINTUS_LENGTH, REYKI_LENGTH, REYKI_KIT_PCS,
  FROM_PRICE_FRAMUGA_KIT, FROM_PRICE_PLINTUS, FROM_PRICE_REYKI,
  priceRange,
  type DecorImage, type Material, type PriceRow,
} from './decor-products'

export type DecorId = 'framuga' | 'plintus' | 'reyki'

export interface DecorCategory {
  /** id секции — якорь и пункт навигации */
  id: DecorId
  /** Пункт плавающей навигации */
  nav: string
  title: string
  lead: string
  text: string[]
  /** Инфографика: показывается целиком, открывается крупно */
  images: (DecorImage & { alt: string })[]
  materials: Material[]
  rows: PriceRow[]
  /** Сноска под таблицей — к общей DECOR_PRICE_NOTE */
  note?: string
  /** Ссылка на соседнюю страницу раздела */
  more?: { href: string; label: string }
  /** Название товара для разметки Product */
  productName: string
}

const materials = (list: Material[]) => listRu(list.map((m) => MATERIAL_LABELS[m]))
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export const DECOR_CATEGORIES: DecorCategory[] = [
  {
    id: 'framuga',
    nav: 'Фальшфрамуга',
    title: 'Фальшфрамуга и компланарный короб',
    lead: 'Продлевает дверь до потолка: панель над проёмом, коробка и наличник стоят вровень со стеной.',
    text: [
      'Фальшфрамуга закрывает стену над дверным проёмом, когда проём ниже потолка. Коробку и наличник ставят компланарно — заподлицо, без фальца и нахлёста, поэтому дверь, панель и стена лежат в одной плоскости.',
      'Подходит для высоких потолков и интерьеров без наличников внахлёст: дверь выглядит выше, проём — частью стены.',
    ],
    images: [{ ...IMAGES.framuga, alt: 'Схема фальшфрамуги и компланарного короба над дверным проёмом' }],
    materials: FRAMUGA_MATERIALS,
    rows: FRAMUGA_ROWS,
    productName: `Фальшфрамуга и компланарный короб ${SITE.name}`,
  },
  {
    id: 'plintus',
    nav: 'Плинтус',
    title: 'Плинтус в цвет дверей',
    lead: `В тех же покрытиях, что и двери: ${materials(PLINTUS_MATERIALS)}. Пол, проём и стены — одним цветом.`,
    text: [
      'Закрывает стык пола и стены, прячет зазор и кабель. Крепится на клипсы — без саморезов на лицевой стороне.',
      `Высота ${PLINTUS_HEIGHTS[0]} мм — для стандартных комнат, ${PLINTUS_HEIGHTS[1]} мм — для высоких потолков и просторных помещений. Длина планки — ${PLINTUS_LENGTH} мм.`,
    ],
    images: [{ ...IMAGES.plintus, alt: `Профили и покрытия плинтуса к дверям ${SITE.name}` }],
    materials: PLINTUS_MATERIALS,
    rows: PLINTUS_ROWS,
    note: 'Клипсы — одна цена для всех покрытий.',
    more: { href: '/catalog/plintus/', label: `Напольный плинтус из МДФ под покраску: ${PROFILES_COUNT}` },
    productName: `Плинтус ${SITE.name} в цвет дверей`,
  },
  {
    id: 'reyki',
    nav: 'Рейки',
    title: 'Декоративные рейки',
    lead: 'Реечные панели для акцентной стены, потолка или перегородки — в цвет дверей и мебели.',
    text: [
      'Декоративная рейка — лицевой профиль, фоновая — задник между рейками. Крепёжная и соединительная собирают модули и стыкуют их между собой.',
      'Где применяют: стена у изголовья кровати, ниша под телевизор, зонирование комнаты, фасады гардеробных.',
    ],
    images: REYKI_IMAGES.map((img, i) => ({
      ...img,
      alt: [
        'Виды декоративных реек и их сечения',
        'Декоративные рейки на стене и потолке в спальне и гостиной',
        'Декоративные рейки на стене: варианты раскладки',
        'Декоративные рейки в качестве перегородки',
      ][i]!,
    })),
    materials: REYKI_MATERIALS,
    rows: REYKI_ROWS,
    note: `Длина рейки — ${REYKI_LENGTH} мм, цена — за ${REYKI_KIT_PCS} шт одного типа.`,
    productName: `Декоративные рейки ${SITE.name}`,
  },
]

/** Общая сноска под таблицами цен */
export const DECOR_PRICE_NOTE = 'Цены — РРЦ. Точный расчёт под ваш проём и стены — у менеджера салона.'

export const decorCategory = (id: DecorId) => DECOR_CATEGORIES.find((c) => c.id === id)!

const kitFrom = `комплект фальшфрамуги от ${rub(FROM_PRICE_FRAMUGA_KIT)}`
const plinthFrom = `плинтус от ${rub(FROM_PRICE_PLINTUS)}`
const reykiFrom = `декоративные рейки от ${rub(FROM_PRICE_REYKI)} за ${REYKI_KIT_PCS} шт`

export const DECOR_PAGE = {
  title: `Декор к дверям ${SITE.name} ${SITE.city.in}: плинтус, фрамуга, рейки`,
  description:
    `Плинтус от ${rub(FROM_PRICE_PLINTUS)}, фальшфрамуга с компланарным коробом — комплект от ${rub(FROM_PRICE_FRAMUGA_KIT)}, ` +
    `рейки от ${rub(FROM_PRICE_REYKI)}. Покрытия ${materials(PLINTUS_MATERIALS)}, салон в ${SITE.address.mall}.`,
  h1: `Плинтус, фальшфрамуга и рейки к дверям ${SITE.name}`,
  lead: `${upperFirst(plinthFrom)}, ${kitFrom}, ${reykiFrom}. В тех же покрытиях, что и двери.`,
  visit: 'Образцы покрытий есть в салоне: приложите их к двери, полу и стенам и рассчитайте декор вместе с менеджером.',
}

/** Product на каждую категорию — диапазон цен из таблицы */
export const decorProducts = () =>
  DECOR_CATEGORIES.map((c) => ({ name: c.productName, description: c.lead, image: c.images[0]!.large, ...priceRange(c.rows) }))

const reykiTypes = listRu(REYKI_ROWS.map((r) => lower(r.name)))
const plinthOnly = PLINTUS_MATERIALS.filter((m) => !FRAMUGA_MATERIALS.includes(m))

export const DECOR_FAQ = [
  {
    q: 'Что такое фальшфрамуга и зачем она нужна?',
    a: `Панель над дверным проёмом: закрывает стену от верха двери до потолка. Коробку и наличник ставят компланарно, вровень со стеной, и фрамуга продолжает эту плоскость. Нужна, когда проём ниже потолка. Размер панели — ${FRAMUGA_ROWS[0]!.size} мм.`,
  },
  {
    q: 'Сколько стоит декор к дверям?',
    a: `${upperFirst(plinthFrom)} за штуку, ${kitFrom}, ${reykiFrom}. Точную сумму под ваш проём и площадь стен рассчитает менеджер.`,
  },
  {
    q: 'В каких покрытиях есть декор?',
    a: `Фальшфрамуга, компланарные коробка и наличник и декоративные рейки — в покрытиях ${materials(FRAMUGA_MATERIALS)}.` +
      (plinthOnly.length ? ` Плинтус — ещё и в ${plinthOnly.length > 1 ? 'покрытиях' : 'покрытии'} ${materials(plinthOnly)}.` : ''),
  },
  {
    q: 'Можно подобрать плинтус и рейки не в цвет дверей?',
    a: 'Да. Покрытие выбирают отдельно от двери — под пол, стены или контрастом. Поможем подобрать сочетание при заказе.',
  },
  {
    q: 'Что входит в минимальный комплект декоративных реек?',
    a: `По ${REYKI_KIT_PCS} шт каждого типа: ${reykiTypes}. Длина рейки — ${REYKI_LENGTH} мм. Этого хватает на один модуль реечной панели.`,
  },
  {
    q: 'Можно купить декор отдельно, без дверей?',
    a: 'Да, плинтус, фальшфрамугу и декоративные рейки можно заказать отдельно от дверей.',
  },
  {
    q: 'Есть доставка и монтаж?',
    a: `Доставка по Москве и самовывоз из салона в ${SITE.address.mall}. Монтаж реек, плинтуса и фальшфрамуги уточняйте у менеджера.`,
  },
]
