/**
 * src/data/in-salon.ts
 *
 * Блок «Новинки и двери в наличии» на главной (InSalon.astro): витрина —
 * сцена с фото и список позиций; на телефоне — лента карточек. Цены на
 * главной не показываем — они на страницах моделей.
 *
 * Здесь только то, чего нет в каталоге: заголовок, описание и фото.
 * Статусы и «На складе» не пишем руками:
 *  - модель каталога (`modelId`) — «В наличии» и цвет на складе из
 *    IN_STOCK_OVERRIDE (src/lib/made-to-order.ts), «Новинка» — из
 *    NEW_MODEL_IDS (src/lib/new-models.ts), ссылка — страница модели
 *    (или `href`, если позиция шире модели — например, серия). Модель
 *    пропала из каталога — позиция не показывается;
 *  - скрытые двери — статус серии и размеры на складе из
 *    src/data/skrytye-dveri-products.ts (те же, что на их странице).
 *
 * Фото — локальные копии (scripts/gen-home-images.mjs, CARD): основная
 * ширины `width` и копии CARD_WIDTHS для srcset. `position` — точка кадра
 * (object-position): кадр режется под сцену и карточку 4:5, дверь должна
 * остаться в кадре. Неразрывные пробелы ставит typograph() при выводе.
 */
import type { ModelStatus } from '../lib/made-to-order'
import { listRu } from '../lib/typograph'
import { HIDDEN_STATUS, REFLEX_MAX_HEIGHT, SECRET_SIZES, SECRET_STOCK_HEIGHTS } from './skrytye-dveri-products'

/** Копии фото под ширину экрана — те же числа, что CARD.extra в gen-home-images.mjs */
export const CARD_WIDTHS = [600, 900] as const

export interface InSalonPhoto {
  src: string
  srcset: string
  width: number
  height: number
  alt: string
  position: string
}

const photo = (name: string, width: number, height: number, position: string, alt: string): InSalonPhoto => {
  const file = (w?: number) => `/renders/home/${name}${w ? `-${w}` : ''}.webp`
  return {
    src: file(),
    srcset: [...CARD_WIDTHS.map((w) => `${file(w)} ${w}w`), `${file()} ${width}w`].join(', '),
    width, height, position, alt,
  }
}

export interface InSalonItem {
  title: string
  text:  string
  image: InSalonPhoto
  /** Модель каталога — статусы, склад и ссылка берутся из каталога */
  modelId?: string
  /** Ссылка вместо страницы модели (серия, раздел); без modelId — обязательна */
  href?: string
  /** Только без modelId: статусы и что есть на складе */
  statuses?: ModelStatus[]
  stock?: string
}

const mm = (list: readonly number[]) => `${list[0]}–${list[list.length - 1]} мм`

/* Порядок — порядок в списке; первая позиция открыта на сцене сразу */
export const IN_SALON: InSalonItem[] = [
  {
    title:   'Серия Техно',
    text:    'Покрытие Эмалекс не боится царапин, сколов, влаги и ультрафиолета.',
    image:   photo('tehno-1', 1254, 1254, '58% 50%', 'Межкомнатная дверь серии «Техно», Эмалекс белый'),
    modelId: '4fc7a08a-9216-4b29-a6d4-3473517e897c', // Техно 1 — статус и цвет на складе
    href:    '/catalog/series/tehno/',
  },
  {
    title:   'Урбан Штрих 2А',
    text:    'Полотно с чёрным молдингом и алюминиевой кромкой.',
    image:   photo('shtrih-2a-1', 1145, 1374, '50% 45%', 'Дверь Урбан Штрих 2А, Эмалекс бежевый с чёрным молдингом'),
    // «Штрих 2А» в каталоге две записи (чёрный и золотой молдинг) — по id
    modelId: '7434f55c-b2a8-4f12-b0c6-56c7c57888eb',
  },
  {
    title:    'Скрытые двери «Секрет»',
    text:     'Заподлицо со стеной, под покраску или обои.',
    image:    photo('secret-2', 1300, 867, '28% 50%', 'Скрытая дверь «Секрет» в тёмной стене'),
    href:     '/catalog/skrytye-dveri/',
    statuses: [HIDDEN_STATUS.sekret],
    stock:    `ширина ${mm(SECRET_SIZES)}, высота ${listRu(SECRET_STOCK_HEIGHTS.map(String))} мм`,
  },
  {
    title:    'Скрытая дверь «Рефлекс»',
    text:     `Зеркало во всю высоту полотна, по размеру до ${(REFLEX_MAX_HEIGHT / 1000).toLocaleString('ru-RU')} м.`,
    image:    photo('reflex-2', 1300, 1040, '45% 50%', 'Скрытая дверь с зеркалом «Рефлекс»'),
    href:     '/catalog/skrytye-dveri/#reflex',
    statuses: [HIDDEN_STATUS.reflex],
  },
]
