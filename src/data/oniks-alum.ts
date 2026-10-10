/* ============================================================
   Страница /partitions/oniks-alum/ — алюминиевые перегородки ALUM
   фабрики ОНИКС, коллаборация со Студией Зизевского.

   Всё, что на странице меняют руками, — здесь: цифры фабрики, тексты
   разделов, конструктор (профили, стёкла, раскладки), характеристики,
   шаги заказа, статьи по теме, вопросы. Вёрстка —
   src/pages/partitions/oniks-alum.astro и
   src/components/partitions/OniksBuilder.astro (там только подписи кнопок).

   Цифры (высота, ширина, срок, толщина стекла) заданы один раз — в
   ONIKS_SPEC: тексты, характеристики, вопросы, описание для поисковиков
   и /llms.txt собираются из них.

   Факты — со страницы фабрики (oniks-dveri.ru/catalog/alum-peregorodki/,
   октябрь 2026), тексты пересказаны своими словами (копия чужого
   текста — дубль для поисковиков). Цен у фабрики на сайте нет — на
   странице их тоже нет, стоимость считаем по проёму. Монтаж не обещаем.

   Фото: оригиналы — assets/oniks-alum/, облегчённые — npm run gen:oniks
   → public/renders/oniks-alum/ (width/height ниже — их реальный размер).
   Название салона и адрес — из src/config/site.ts.
   ============================================================ */
import { SITE } from '../config/site'
import { pluralRu } from '../lib/plural'
import { listRu, upperFirst } from '../lib/typograph'

const IMG = '/renders/oniks-alum'

export const ONIKS = {
  /** Как пишем название фабрики в текстах */
  factory: 'фабрика ОНИКС',
  brand:   'ОНИКС',
  system:  'ALUM',
} as const

export const ONIKS_PAGE = {
  path: '/partitions/oniks-alum/',
  /** Короткое имя — хлебные крошки, ссылки с других страниц */
  name: `Перегородки ${ONIKS.brand} ${ONIKS.system}`,
}

/* ── Цифры фабрики ──────────────────────────────────────────── */

export const ONIKS_SPEC = {
  /** Высота створки — до, мм */
  maxHeight: 3000,
  /** Ширина створки — до, мм */
  maxWidth:  1100,
  /** Шаг размеров, см */
  sizeStep:  1,
  /** Срок изготовления на фабрике — от, рабочих дней */
  leadDays:  10,
  /** Толщина стекла и триплекса, мм */
  glass:     4,
  triplex:   8,
} as const

const S = ONIKS_SPEC

/** Те же цифры словами — для текстов страницы */
export const ONIKS_FACTS = {
  height:   `до ${S.maxHeight} мм`,
  width:    `до ${S.maxWidth} мм`,
  sizes:    `нестандартные, с шагом ${S.sizeStep} см`,
  leadTime: `от ${S.leadDays} ${pluralRu(S.leadDays, ['рабочего дня', 'рабочих дней', 'рабочих дней'])}`,
  glass:    `стекло ${S.glass} мм или триплекс ${S.triplex} мм`,
}

/* ── Конструктор: профиль, стекло, раскладки ──────────────────
   Цвета — условные цвета материалов для схемы в конструкторе и образцов
   (как цвета профиля GRAFIA в partitions.ts): на экране они отличаются
   от реальных, на странице об этом сказано. */

export interface OniksProfile {
  id:    string
  name:  string
  /** Цвет профиля на схеме */
  color: string
  /** Тень — ручка и кромки на схеме */
  shade: string
  /** Цвет из палитры эмали фабрики, а не базовый цвет профиля */
  enamel?: true
}

export const ONIKS_PROFILES: OniksProfile[] = [
  { id: 'chrome',    name: 'Хром',    color: '#c9cdd2', shade: '#868c93' },
  { id: 'gold',      name: 'Золото',  color: '#cfaa52', shade: '#93722a' },
  { id: 'champagne', name: 'Шампань', color: '#dac6a0', shade: '#a68f66' },
  { id: 'black',     name: 'Чёрный',  color: '#1d1d1f', shade: '#45454a' },
  { id: 'white',     name: 'Белый',   color: '#f2f2ef', shade: '#bdbdb7', enamel: true },
]

/** Подпись под цветом из палитры эмали */
export const ONIKS_ENAMEL_NOTE = 'цвет эмали фабрики'

const profileNames = (enamel: boolean) =>
  listRu(ONIKS_PROFILES.filter((p) => Boolean(p.enamel) === enamel).map((p) => p.name.toLowerCase()))

/** clear — прозрачное (видно комнату за стеклом), frosted — матовое
    (размыто), mirror — зеркало, solid — непрозрачное */
export type GlassKind = 'clear' | 'frosted' | 'mirror' | 'solid'
/** Стекло или триплекс — толщины в ONIKS_SPEC */
export type GlassGroup = 'glass' | 'triplex'

export interface OniksGlass {
  id:       string
  group:    GlassGroup
  name:     string
  kind:     GlassKind
  /** Тон стекла (clear, frosted) или цвет (solid) */
  color:    string
  /** Плотность тона для clear / frosted, 0–1 */
  opacity?: number
  /** Зеркало: светлая и тёмная точки отражения */
  mirror?:  [string, string]
  /** Как называть в тексте, если не «стекло …» / «триплекс …» */
  phrase?:  string
  note?:    string
}

export const ONIKS_GLASS_GROUPS: { id: GlassGroup; title: string }[] = [
  { id: 'glass',   title: `Стекло ${S.glass} мм` },
  { id: 'triplex', title: `Триплекс ${S.triplex} мм` },
]

export const ONIKS_GLASSES: OniksGlass[] = [
  { id: 'clear',           group: 'glass',   name: 'Прозрачное',        kind: 'clear',   color: '#cfe3da', opacity: 0.14, phrase: 'прозрачное стекло' },
  { id: 'clear-bronze',    group: 'glass',   name: 'Прозрачное бронза', kind: 'clear',   color: '#7b5a3a', opacity: 0.42 },
  { id: 'clear-graphite',  group: 'glass',   name: 'Прозрачное графит', kind: 'clear',   color: '#2f3236', opacity: 0.5 },
  { id: 'satin-white',     group: 'glass',   name: 'Сатинат белый',     kind: 'frosted', color: '#f5f5f2', opacity: 0.6 },
  { id: 'satin-bronze',    group: 'glass',   name: 'Сатинат бронза',    kind: 'frosted', color: '#8a6849', opacity: 0.55 },
  { id: 'satin-graphite',  group: 'glass',   name: 'Сатинат графит',    kind: 'frosted', color: '#3f4246', opacity: 0.58 },
  { id: 'triplex-clear',   group: 'triplex', name: 'Прозрачный',        kind: 'clear',   color: '#d2e6dd', opacity: 0.16 },
  { id: 'triplex-white',   group: 'triplex', name: 'Белый',             kind: 'solid',   color: '#efefeb' },
  { id: 'triplex-black',   group: 'triplex', name: 'Чёрный',            kind: 'solid',   color: '#161618' },
  { id: 'mirror',          group: 'triplex', name: 'Зеркало',           kind: 'mirror',  color: '#c7ccd1', mirror: ['#eef0f2', '#8f969d'] },
  { id: 'mirror-bronze',   group: 'triplex', name: 'Зеркало бронза',    kind: 'mirror',  color: '#a9825d', mirror: ['#e2c3a0', '#6f4f33'] },
  { id: 'mirror-graphite', group: 'triplex', name: 'Зеркало графит',    kind: 'mirror',  color: '#6c7075', mirror: ['#a9adb2', '#2f3235'] },
  { id: 'lacobel',         group: 'triplex', name: 'Лакобель',          kind: 'solid',   color: '#b6a48b', note: 'цвет по палитре фабрики' },
]

/** Опечатка в id (раскладка «Собрать такую», сочетание по умолчанию) —
    ошибка сборки, а не пустая схема на сайте */
export function profileById(id: string): OniksProfile {
  const p = ONIKS_PROFILES.find((x) => x.id === id)
  if (!p) throw new Error(`ОНИКС: нет цвета профиля «${id}» (src/data/oniks-alum.ts)`)
  return p
}
export function glassById(id: string): OniksGlass {
  const g = ONIKS_GLASSES.find((x) => x.id === id)
  if (!g) throw new Error(`ОНИКС: нет стекла «${id}» (src/data/oniks-alum.ts)`)
  return g
}

/** «триплекс белый», «стекло сатинат бронза» — подпись в конструкторе */
export const glassLabel = (g: OniksGlass) => `${g.group === 'triplex' ? 'триплекс' : 'стекло'} ${g.name.toLowerCase()}`
/** В тексте — как говорят: «прозрачное стекло», а не «стекло прозрачное» */
export const glassPhrase = (g: OniksGlass) => g.phrase ?? glassLabel(g)
/** «профиль чёрный» */
export const profilePhrase = (p: OniksProfile) => `профиль ${p.name.toLowerCase()}`
/** «Профиль чёрный, триплекс белый» */
export const finishLabel = (profile: string, glass: string) =>
  upperFirst(`${profilePhrase(profileById(profile))}, ${glassPhrase(glassById(glass))}`)

/* Раскладка — доли внутренней области створки (0–1): h — перекладины
   по высоте, v — вертикали (x, от y1 до y2). Сняты со схемы фабрики
   «Варианты перегородок» (assets/oniks-alum/info/layouts.jpg) и сверены
   с фото моделей. */
export interface OniksLayout {
  h: number[]
  v: { x: number; y1: number; y2: number }[]
}

const full = (x: number) => ({ x, y1: 0, y2: 1 })

/** Секций (стёкол) в раскладке — по геометрии: в каждой полосе между
    перекладинами столько стёкол, сколько её пересекает вертикалей, плюс одно */
export function sectionCount(g: OniksLayout): number {
  const ys = [0, ...g.h, 1]
  return ys.slice(1).reduce((n, y, i) => {
    const mid = (ys[i]! + y) / 2
    return n + 1 + g.v.filter((v) => v.y1 < mid && mid < v.y2).length
  }, 0)
}

export interface OniksModel {
  /** Имя файла фото: alum-01 … */
  id:       string
  /** Номер раскладки по каталогу фабрики */
  num:      number
  /** «ALUM №7» */
  name:     string
  /** Раскладка словами: «Сетка 2 × 3, 6 секций» */
  layout:   string
  geometry: OniksLayout
  /** Отделка на фото фабрики — её подставляет «Собрать такую» */
  profile:  string
  glass:    string
  /** Отделка на фото словами */
  shown:    string
  image:    string
}

/* Модельный ряд = раскладки фабрики. Раскладка — со схемы фабрики;
   отделка — та, что на фото (профиль «металл» на фото — хром из палитры
   фабрики, белый — цвет эмали). Фото — models/alum-<номер>.jpg. */
const MODELS: { num: number; title: string; geometry: OniksLayout; profile: string; glass: string }[] = [
  { num: 1,  title: 'Одна перекладина',          geometry: { h: [0.5], v: [] },                                   profile: 'champagne', glass: 'triplex-white' },
  { num: 2,  title: 'Узкая полоса посередине',   geometry: { h: [0.451, 0.549], v: [] },                          profile: 'chrome',    glass: 'triplex-white' },
  { num: 3,  title: 'Две перекладины',           geometry: { h: [0.333, 0.667], v: [] },                          profile: 'black',     glass: 'satin-bronze' },
  { num: 4,  title: 'Три перекладины',           geometry: { h: [0.25, 0.5, 0.75], v: [] },                       profile: 'black',     glass: 'clear' },
  { num: 5,  title: 'Четыре перекладины',        geometry: { h: [0.2, 0.4, 0.6, 0.8], v: [] },                    profile: 'chrome',    glass: 'mirror-bronze' },
  { num: 6,  title: 'Асимметричная раскладка',   geometry: { h: [0.5], v: [{ x: 0.68, y1: 0, y2: 0.5 }, { x: 0.326, y1: 0.5, y2: 1 }] }, profile: 'chrome', glass: 'satin-graphite' },
  { num: 7,  title: 'Сетка 2 × 3',     geometry: { h: [0.333, 0.667], v: [full(0.5)] },                 profile: 'black',     glass: 'triplex-white' },
  { num: 8,  title: 'Сетка 2 × 4',     geometry: { h: [0.25, 0.5, 0.75], v: [full(0.5)] },              profile: 'white',     glass: 'clear-graphite' },
  { num: 9,  title: 'Сетка 2 × 5',     geometry: { h: [0.2, 0.4, 0.6, 0.8], v: [full(0.5)] },           profile: 'chrome',    glass: 'satin-white' },
  { num: 10, title: 'Сетка 3 × 4',     geometry: { h: [0.25, 0.5, 0.75], v: [full(0.32), full(0.68)] }, profile: 'black',     glass: 'clear' },
]

export const ONIKS_MODELS: OniksModel[] = MODELS.map(({ title, ...m }) => {
  const id = `alum-${String(m.num).padStart(2, '0')}`
  const sections = sectionCount(m.geometry)
  return {
    ...m,
    id,
    name:   `${ONIKS.system} №${m.num}`,
    layout: `${title}, ${sections} ${pluralRu(sections, ['секция', 'секции', 'секций'])}`,
    shown:  finishLabel(m.profile, m.glass),
    image:  `${IMG}/models/${id}.webp`,
  }
})

/** Размер фото раскладок (все одинаковые) — в тех же пропорциях схема
    створки в конструкторе */
export const ONIKS_MODEL_IMAGE = { width: 402, height: 1000 }

const FIRST = ONIKS_MODELS[0]!.num
const LAST = ONIKS_MODELS.at(-1)!.num

/** «10 раскладок» — описание страницы, карточка на /partitions/, /llms.txt */
export const ONIKS_LAYOUT_COUNT =
  `${ONIKS_MODELS.length} ${pluralRu(ONIKS_MODELS.length, ['раскладка', 'раскладки', 'раскладок'])}`

/** С какой раскладки открывается конструктор — в отделке с её фото */
export const ONIKS_DEFAULT = (() => {
  const m = ONIKS_MODELS.find((x) => x.num === 7)
  if (!m) throw new Error('ОНИКС: нет раскладки по умолчанию (src/data/oniks-alum.ts)')
  return m
})()

/** Пояснения в конструкторе: под схемой и под цветами профиля */
export const ONIKS_BUILDER_NOTES = {
  preview: 'Цвета на схеме условные. Сочетание и стоимость подтвердим при расчёте.',
  profile: 'Другие цвета эмали фабрики подберём при расчёте.',
}

/* ── Тексты страницы — в порядке разделов ─────────────────────── */

/* Первый экран: фото интерьера — справа от текста, в своих пропорциях.
   Кто что делает в коллаборации — словами во вводке */
export const ONIKS_HERO = {
  title: `Перегородки ${ONIKS.system} фабрики ${ONIKS.brand}`,
  lead:  `Раздвижные перегородки из алюминиевого профиля и стекла делят комнату на зоны и занимают минимум места. Делает их ${ONIKS.factory}, а в ${SITE.studioNameOf} помогут выбрать раскладку, профиль и стекло и рассчитают перегородку под ваш проём.`,
  image: {
    src:    `${IMG}/interior-1000.webp`,
    srcset: `${IMG}/interior-640.webp 640w, ${IMG}/interior-1000.webp 1000w`,
    width:  1000,
    height: 743,
    alt:    `Раздвижные алюминиевые перегородки ${ONIKS.system} в гостиной: створки в белом и чёрном профиле с прозрачным и матовым стеклом`,
  },
}

/* Заголовки и вводки разделов; nav — пункт плавающего меню разделов */
export const ONIKS_SECTIONS = {
  builder: {
    nav:   'Конструктор',
    title: 'Соберите перегородку',
    lead:  'Выберите раскладку, цвет профиля и стекло, и схема покажет створку: сквозь прозрачное стекло видно комнату, матовое её размывает, зеркало отражает.',
  },
  photos: {
    nav:   'Фото',
    title: 'Раскладки на фото фабрики',
    lead:  'Каждая раскладка снята в одной из отделок. Если понравилась, нажмите «Собрать такую»: конструктор подставит её раскладку, профиль и стекло.',
  },
  specs: {
    nav:   'Характеристики',
    title: 'Характеристики',
    lead:  `Перегородку делают под ваш проём: размеры ${ONIKS_FACTS.sizes}.`,
  },
  order: {
    nav:   'Заказ',
    title: 'Как заказать перегородку',
    lead:  `Позвоните или приезжайте в салон в ${SITE.address.mall}: рассчитаем перегородку под ваш проём.`,
  },
  articles: {
    title: 'Статьи о стекле и зонировании',
    lead:  'Стеклянные перегородки в лофте, стекло или глухое полотно и двери под задачу интерьера.',
    /** Ссылка под вводкой — другая раздвижная система салона */
    more:  { label: 'Перегородки GRAFIA', href: '/partitions/' },
  },
  faq: {
    nav:   'Вопросы',
    title: `Вопросы о перегородках ${ONIKS.system}`,
  },
}

/* Характеристики */
export const ONIKS_SPECS = [
  { label: 'Материал',          value: 'алюминиевый профиль и стекло' },
  { label: 'Заполнение',        value: ONIKS_FACTS.glass },
  { label: 'Высота створки',    value: ONIKS_FACTS.height },
  { label: 'Ширина створки',    value: ONIKS_FACTS.width },
  { label: 'Размеры',           value: ONIKS_FACTS.sizes },
  { label: 'Срок изготовления', value: ONIKS_FACTS.leadTime },
  { label: 'Система',           value: 'раздвижная, на направляющей (трек)' },
]
export const ONIKS_KIT = {
  included: { title: 'В комплекте', items: ['профиль', 'алюминиевая направляющая (трек)', 'молдинг (в зависимости от комплектации)'] },
  separate: { title: 'Отдельно',    items: ['карниз к треку', 'ролики', 'система открывания', 'ручки'] },
}

/* Комплектующие — с картинки фабрики */
export const ONIKS_COMPONENTS = {
  title: 'Комплектующие',
  items: [
    'Алюминиевая направляющая (трек) и ролики',
    'Горизонтальный профиль 41 × 25 мм',
    'Стоевой профиль 44 × 23 мм, в том числе со вставками под замок',
    'Молдинг 20 × 13 мм',
    'Декоративный карниз высотой 70 мм, длиной 3000 мм',
    'Торцевые заглушки, разделитель трека, кронштейн стенового крепления',
  ],
  image: {
    src:    `${IMG}/components-1024.webp`,
    srcset: `${IMG}/components-640.webp 640w, ${IMG}/components-1024.webp 1024w`,
    width:  1024,
    height: 703,
    alt:    `Комплектующие перегородок ${ONIKS.system}: направляющая, ролик, профили, молдинг, карниз, заглушки, кронштейн`,
  },
}

export const ONIKS_OPTI_WHITE = {
  title: 'Стекло Opti White',
  text:  'У обычного прозрачного стекла лёгкий зеленоватый оттенок, и он становится заметен, когда стекло окрашивают. Для чистого цвета перегородку можно сделать на стекле Opti White: у него такого оттенка нет.',
  image: {
    src:    `${IMG}/opti-white-1024.webp`,
    srcset: `${IMG}/opti-white-640.webp 640w, ${IMG}/opti-white-1024.webp 1024w`,
    width:  1024,
    height: 541,
    alt:    'Сравнение: окрашенное стекло Opti White без зеленоватого оттенка и обычное стекло с оттенком',
  },
}

/* Материалы фабрики — справочные картинки под характеристиками,
   открываются во весь экран */
export const ONIKS_REFERENCES = {
  title: 'Материалы фабрики',
  items: [
    {
      caption: `Схема раскладок №${FIRST}–${LAST}`,
      image: {
        src:    `${IMG}/layouts-1600.webp`,
        srcset: `${IMG}/layouts-960.webp 960w, ${IMG}/layouts-1600.webp 1600w`,
        width:  1600,
        height: 419,
        alt:    `Схема раскладок перегородок ${ONIKS.system} №${FIRST}–${LAST}: от одной перекладины до сетки 3 × 4`,
      },
    },
    { caption: ONIKS_COMPONENTS.title, image: ONIKS_COMPONENTS.image },
    {
      caption: 'Цвета профиля вживую',
      image: {
        src:    `${IMG}/profile-colors-1024.webp`,
        srcset: `${IMG}/profile-colors-640.webp 640w, ${IMG}/profile-colors-1024.webp 1024w`,
        width:  1024,
        height: 507,
        alt:    `Цвета алюминиевого профиля ${ONIKS.system}: ${profileNames(false)}`,
      },
    },
    { caption: 'Opti White и обычное стекло', image: ONIKS_OPTI_WHITE.image },
  ],
}

/* Как заказать — реальная последовательность (StepsRow) */
export const ONIKS_STEPS = [
  { title: 'Выберите перегородку',    text: 'Соберите её в конструкторе или подберите раскладку, профиль и стекло вместе с нами в салоне.' },
  { title: 'Назовите размеры проёма', text: 'Ширину и высоту проёма можно сообщить по телефону или в салоне.' },
  { title: 'Получите расчёт',         text: 'Посчитаем стоимость под ваш проём и выбранную отделку.' },
  { title: 'Изготовление на фабрике', text: `Срок изготовления — ${ONIKS_FACTS.leadTime}.` },
].map((s, i) => ({ ...s, num: String(i + 1).padStart(2, '0') }))

/* Статьи по теме — имена файлов из src/content/articles/ без .mdoc.
   Статьи с таким именем нет — сборка остановится с ошибкой */
export const ONIKS_ARTICLES = ['vfd-dizain-dveri-pod-zadachu', 'dveri-v-stile-loft', 'dveri-so-steklom-ili-gluhie']

/** «Как к нам добраться» внизу страницы */
export const ONIKS_VISIT_LEAD = `Приезжайте обсудить проект: подберём раскладку, профиль и стекло перегородки ${ONIKS.system} и рассчитаем её по вашим размерам.`

export const ONIKS_FAQ = [
  {
    q: `Что такое перегородки ${ONIKS.system}?`,
    a: `Раздвижные межкомнатные перегородки фабрики ${ONIKS.brand} из алюминиевого профиля и стекла. Они делят комнату на зоны, занимают минимум места и служат недорогой альтернативой стене.`,
  },
  {
    q: `Сколько вариантов раскладки у перегородок ${ONIKS.system}?`,
    a: `Их ${ONIKS_MODELS.length}: от одной перекладины (№${FIRST}) до сетки 3 × 4 (№${LAST}), есть асимметричная раскладка (№6). Цвет профиля и стекло подбираются отдельно.`,
  },
  {
    q: 'Какое стекло можно поставить в перегородку?',
    a: `Стекло ${S.glass} мм — прозрачное, прозрачное бронза или графит, сатинат белый, бронза или графит — или триплекс ${S.triplex} мм: прозрачный, белый, чёрный, зеркало, зеркало бронза или графит и Лакобель в цветах фабрики.`,
  },
  {
    q: `Какого размера бывают перегородки ${ONIKS.system}?`,
    a: `Высота створки — ${ONIKS_FACTS.height}, ширина — ${ONIKS_FACTS.width}. Размеры ${ONIKS_FACTS.sizes}: перегородку делают под ваш проём.`,
  },
  {
    q: 'Какие цвета профиля доступны?',
    a: `${upperFirst(profileNames(false))}, а также цвета эмали фабрики — например, ${profileNames(true)}.`,
  },
  {
    q: 'Что входит в комплект перегородки?',
    a: `${upperFirst(listRu(ONIKS_KIT.included.items))}. ${upperFirst(listRu(ONIKS_KIT.separate.items))} приобретаются отдельно.`,
  },
  {
    q: 'Почему белое стекло может отличаться по оттенку?',
    a: ONIKS_OPTI_WHITE.text,
  },
  {
    q: `Сколько делают перегородку ${ONIKS.system}?`,
    a: `Срок изготовления на фабрике — ${ONIKS_FACTS.leadTime}. Стоимость и точный срок рассчитаем по размерам вашего проёма.`,
  },
]
