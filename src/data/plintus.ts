/**
 * Напольный плинтус из МДФ — данные и тексты страницы /catalog/plintus/.
 * Названий позиций и цен нет: цену называет менеджер по запросу в мессенджере
 * (кнопка «Запросить цену», src/lib/messengers.ts). Позиции — по номерам
 * (№ — порядок в списке): номер уходит в сообщение менеджеру.
 * Каждый профиль красят в любой из вариантов PLINTUS_SPEC.finishes — цвет на
 * фото только пример. Описание — по внешнему виду фото: цвет и профиль.
 * Размеры — у поставщика по каждой позиции: минимальная толщина и высота
 * зависят от профиля, максимум у всех один (PLINTUS_SPEC).
 */
import { SITE } from '../config/site'
import { pluralRu } from '../lib/plural'
import { listRu } from '../lib/typograph'
import lineImages from './plintus-lines-images.json'

export type PlintusProfile = 'cornice' | 'straight'

export interface PlintusItem {
  /** Номер позиции на сайте — для запроса менеджеру */
  num: number
  /** Фото 1000×1000 — public/media/plintus/ */
  photo: string
  /** srcset карточки: копия 480 px (npm run gen:plintus-lines) и оригинал 1000 px */
  photoSrcset: string
  /** Цвет и профиль на фото: подпись карточки и текст запроса в мессенджер */
  text: string
  /** Фигурный верх («с карнизом») или ровный срез («прямой профиль») — фильтр */
  profile: PlintusProfile
  /** Минимальная толщина и высота этого профиля, мм */
  thicknessFrom: number
  heightFrom: number
  /** Отрисовка в интерьере, только белый вариант — просмотрщик по фото карточки */
  interior: string[]
}

export const PLINTUS_SPEC = {
  material: 'МДФ',
  /** Толщины, мм — у профиля доступны все от его thicknessFrom */
  thickness: [8, 10, 12, 14, 16, 18, 19, 22, 25],
  /** Высота, мм — у профиля от его heightFrom до max с шагом step */
  height: { min: 60, max: 250, step: 10 },
  finishes: ['белый под покраску (загрунтован)', 'белая финишная эмаль', 'эмаль в цвет по палитре RAL или NCS'],
} as const

export const PROFILE_LABELS: Record<PlintusProfile, string> = {
  cornice: 'С карнизом',
  straight: 'Прямой профиль',
}

const pad = (n: number) => String(n).padStart(2, '0')

/* [описание, профиль, толщина от, высота от] — в порядке фото plintus-01…24 */
const ROWS: [string, PlintusProfile, number, number?][] = [
  ['Белый, с карнизом', 'cornice', 8],
  ['Светло-серый, с карнизом', 'cornice', 8],
  ['Серо-сиреневый, с карнизом', 'cornice', 10],
  ['Жемчужно-серый, с карнизом', 'cornice', 10],
  ['Кремовый, с карнизом', 'cornice', 12],
  ['Бирюзовый, с карнизом', 'cornice', 10],
  ['Чёрный, с карнизом', 'cornice', 12],
  ['Красный, с карнизом', 'cornice', 10],
  ['Белый, прямой профиль', 'straight', 8],
  ['Бежевый, прямой профиль', 'straight', 8],
  ['Серый, с лёгким карнизом', 'cornice', 8],
  ['Серый, прямой профиль', 'straight', 8],
  ['Светло-бежевый, прямой профиль', 'straight', 8],
  ['Коралловый, с карнизом', 'cornice', 8],
  ['Тёмно-синий, с карнизом', 'cornice', 10],
  ['Тёмно-зелёный, с карнизом', 'cornice', 8],
  ['Молочно-белый, с карнизом', 'cornice', 8],
  ['Песочный, с карнизом', 'cornice', 10],
  ['Нежно-розовый, с карнизом', 'cornice', 10],
  ['Бежево-серый, с карнизом', 'cornice', 12],
  ['Горчичный, прямой профиль', 'straight', 8],
  ['Сине-зелёный, с карнизом', 'cornice', 16, 70],
  ['Тёмно-коричневый, с карнизом', 'cornice', 16, 100],
  ['Фиолетовый, с карнизом', 'cornice', 10, 110],
]

function floorSrcset(n: string): string {
  if (!(`floor-${n}` in lineImages)) throw new Error(`Плинтус: нет копии floor-${n} — npm run gen:plintus-lines`)
  return `/renders/plintus/floor-${n}-480.webp 480w, /media/plintus/plintus-${n}.webp 1000w`
}

export const PLINTUS: PlintusItem[] = ROWS.map(([text, profile, thicknessFrom, heightFrom = PLINTUS_SPEC.height.min], i) => {
  const n = pad(i + 1)
  return {
    num: i + 1,
    photo: `/media/plintus/plintus-${n}.webp`,
    photoSrcset: floorSrcset(n),
    text,
    profile,
    thicknessFrom,
    heightFrom,
    interior: [1, 2, 3].map((j) => `/media/plintus/interior/plintus-${n}-${j}.webp`),
  }
})

/* ── Производные: тексты собираются из данных выше ── */
const { thickness, height, finishes, material } = PLINTUS_SPEC
const mm = (n: number) => `${n} мм`
export const THICKNESS_RANGE = `${thickness[0]}–${mm(thickness[thickness.length - 1]!)}`
export const HEIGHT_RANGE = `${height.min}–${mm(height.max)}`
const profilesWord = (n: number) => `${n} ${pluralRu(n, ['профиль', 'профиля', 'профилей'])}`
export const PROFILES_COUNT = profilesWord(PLINTUS.length)
const countOf = (p: PlintusProfile) => PLINTUS.filter((i) => i.profile === p).length
const tallOnly = PLINTUS.filter((i) => i.heightFrom > height.min)
/** «белый под покраску, белая финишная эмаль или эмаль в цвет…» */
const FINISHES_TEXT = `${finishes.slice(0, -1).join(', ')} или ${finishes[finishes.length - 1]}`

/** Размеры позиции — подпись карточки и окна запроса */
export const itemSizes = (i: PlintusItem) => `Толщина от ${mm(i.thicknessFrom)}, высота от ${mm(i.heightFrom)}`
/** Ссылка на позицию в alt и запросе */
export const itemName = (i: PlintusItem) => `профиль № ${i.num}`

export const PLINTUS_PAGE = {
  title: `Плинтус ${SITE.city.in}: напольный, скрытый, с подсветкой`,
  description:
    `Плинтус ${SITE.city.in}: напольный из МДФ (${PROFILES_COUNT}), с LED-подсветкой, скрытый, ` +
    'микроплинтус и шпонированный. Любой цвет RAL и NCS, цена по запросу.',
  h1: `Плинтус ${SITE.city.in}: напольный, скрытый, с подсветкой`,
  lead:
    `${PROFILES_COUNT} напольного плинтуса из МДФ и те же профили с LED-подсветкой, а ещё скрытый алюминиевый плинтус, ` +
    'микроплинтус и шпонированный. Красим в любой цвет по RAL и NCS — цвет на фото только пример.',
  hero: { src: PLINTUS[0]!.interior[1]!, alt: 'Белый напольный плинтус из МДФ с карнизом в интерьере' },
}

/** Характеристики — таблица на странице и ответы в FAQ */
export const PLINTUS_SPEC_ROWS: { label: string; value: string }[] = [
  { label: 'Материал', value: material },
  { label: 'В каталоге', value: `${PROFILES_COUNT}: ${countOf('cornice')} с карнизом, ${countOf('straight')} прямых` },
  { label: 'Толщина', value: `${listRu(thickness.map(String))} мм — минимальная зависит от профиля` },
  {
    label: 'Высота',
    value:
      `от ${height.min} до ${mm(height.max)} с шагом ${height.step} мм` +
      (tallOnly.length
        ? `; у профилей № ${listRu(tallOnly.map((i) => String(i.num)))} — от ${listRu(tallOnly.map((i) => String(i.heightFrom)))} мм соответственно`
        : ''),
  },
  { label: 'Покрытие', value: FINISHES_TEXT },
  { label: 'Нестандартный размер или цвет', value: 'под заказ' },
  { label: 'Цена', value: 'по запросу у менеджера' },
]

export const PLINTUS_TIPS = [
  {
    title: 'Высота',
    text: `Для потолков до 2,7 м обычно берут ${height.min}–100 мм, для высоких — от 100 мм и выше. Высокий плинтус заметнее и смотрится парадно.`,
  },
  {
    title: 'Толщина',
    text: `От ${THICKNESS_RANGE}. Наличник у двери обычно толще плинтуса: так стык выглядит аккуратно. Толщину подбирают по наличнику и неровностям стены.`,
  },
  {
    title: 'Профиль',
    text: 'Карниз — фигурный верх, он поддерживает классические двери и молдинги. Прямой профиль — ровная плоскость для современных интерьеров и скрытых дверей.',
  },
  {
    title: 'Цвет',
    text: 'В цвет двери или наличника — единая линия, в цвет стены — плинтус растворяется. Белый под покраску красят на месте вместе со стенами.',
  },
]

export const PLINTUS_FAQ = [
  {
    q: 'Какой толщины и высоты бывает напольный плинтус из МДФ?',
    a: `Толщина — ${listRu(thickness.map(String))} мм, высота — от ${height.min} до ${mm(height.max)} с шагом ${height.step} мм. Минимальные размеры зависят от профиля — они указаны под каждым фото.`,
  },
  {
    q: 'Можно ли покрасить плинтус в нужный цвет?',
    a: `Да, любой профиль: ${FINISHES_TEXT}. Цвет на фото только пример, точный оттенок уточняйте у менеджера.`,
  },
  {
    q: 'Чем плинтус с карнизом отличается от прямого?',
    a: 'У плинтуса с карнизом фигурный верхний край — он подходит к классическим дверям и молдингам. Прямой профиль — ровная плоскость без выступов, его выбирают для современных интерьеров и скрытых дверей.',
  },
  {
    q: 'Можно ли заказать нестандартный размер или цвет?',
    a: 'Да, нестандартную высоту, толщину или цвет делают под заказ. Срок и цену назовёт менеджер.',
  },
  {
    q: 'Из чего сделан плинтус?',
    a: 'Из МДФ — плиты из древесного волокна. Поверхность ровная и хорошо держит покраску.',
  },
  {
    q: 'Как узнать цену?',
    a: 'Нажмите «Запросить цену» под фото — откроется окно с телефонами менеджера и мессенджерами. Номер профиля уже будет в сообщении.',
  },
]
