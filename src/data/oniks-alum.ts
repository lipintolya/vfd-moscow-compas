/* ============================================================
   Страница /partitions/oniks-alum/ — алюминиевые перегородки ALUM
   фабрики ОНИКС, коллаборация со Студией Зизевского.

   Факты — со страницы фабрики (oniks-dveri.ru/catalog/alum-peregorodki/,
   октябрь 2026): раскладки №1–10, стекло, размеры, комплектация, цвета
   профиля, комплектующие. Тексты пересказаны своими словами (копия чужого
   текста — дубль для поисковиков). Цен у фабрики на сайте нет — на
   странице их тоже нет, стоимость считаем по проёму.

   Фото: оригиналы — assets/oniks-alum/, облегчённые — npm run gen:oniks
   → public/renders/oniks-alum/ (width/height ниже — их реальный размер).
   Данные салона (адрес, телефон, часы) — из src/config/site.ts.
   ============================================================ */

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
  name: 'Перегородки ОНИКС ALUM',
}

/* Первый экран: фото интерьера — справа от текста, в своих пропорциях */
export const ONIKS_HERO = {
  image: {
    src:    `${IMG}/interior-1000.webp`,
    srcset: `${IMG}/interior-640.webp 640w, ${IMG}/interior-1000.webp 1000w`,
    width:  1000,
    height: 743,
    alt:    'Раздвижные алюминиевые перегородки ALUM в гостиной: створки в белом и чёрном профиле с прозрачным и матовым стеклом',
  },
}

/* Факты под первым экраном */
export const ONIKS_FACTS = [
  { value: '10',          label: 'раскладок — от одной перекладины до сетки 3\u00a0×\u00a04' },
  { value: 'до 3000 мм',  label: 'высота створки' },
  { value: '4 или 8 мм',  label: 'стекло или триплекс' },
  { value: 'от 10 дней',  label: 'рабочих — срок изготовления на фабрике' },
]

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
  note?: string
}

export const ONIKS_PROFILES: OniksProfile[] = [
  { id: 'chrome',    name: 'Хром',    color: '#c9cdd2', shade: '#868c93' },
  { id: 'gold',      name: 'Золото',  color: '#cfaa52', shade: '#93722a' },
  { id: 'champagne', name: 'Шампань', color: '#dac6a0', shade: '#a68f66' },
  { id: 'black',     name: 'Чёрный',  color: '#1d1d1f', shade: '#45454a' },
  { id: 'white',     name: 'Белый',   color: '#f2f2ef', shade: '#bdbdb7', note: 'цвет эмали фабрики' },
]

/** clear — прозрачное (видно комнату за стеклом), frosted — матовое
    (размыто), mirror — зеркало, solid — непрозрачное */
export type GlassKind = 'clear' | 'frosted' | 'mirror' | 'solid'

export interface OniksGlass {
  id:       string
  /** Группа: стекло 4 мм или триплекс 8 мм */
  group:    '4' | '8'
  name:     string
  kind:     GlassKind
  /** Тон стекла (clear, frosted) или цвет (solid) */
  color:    string
  /** Плотность тона для clear / frosted, 0–1 */
  opacity?: number
  /** Зеркало: светлая и тёмная точки отражения */
  mirror?:  [string, string]
  note?:    string
}

export const ONIKS_GLASS_GROUPS = [
  { id: '4', title: 'Стекло 4 мм' },
  { id: '8', title: 'Триплекс 8 мм' },
] as const

export const ONIKS_GLASSES: OniksGlass[] = [
  { id: 'clear',           group: '4', name: 'Прозрачное',         kind: 'clear',   color: '#cfe3da', opacity: 0.14 },
  { id: 'clear-bronze',    group: '4', name: 'Прозрачное бронза',  kind: 'clear',   color: '#7b5a3a', opacity: 0.42 },
  { id: 'clear-graphite',  group: '4', name: 'Прозрачное графит',  kind: 'clear',   color: '#2f3236', opacity: 0.5 },
  { id: 'satin-white',     group: '4', name: 'Сатинат белый',      kind: 'frosted', color: '#f5f5f2', opacity: 0.6 },
  { id: 'satin-bronze',    group: '4', name: 'Сатинат бронза',     kind: 'frosted', color: '#8a6849', opacity: 0.55 },
  { id: 'satin-graphite',  group: '4', name: 'Сатинат графит',     kind: 'frosted', color: '#3f4246', opacity: 0.58 },
  { id: 'triplex-clear',   group: '8', name: 'Прозрачный',         kind: 'clear',   color: '#d2e6dd', opacity: 0.16 },
  { id: 'triplex-white',   group: '8', name: 'Белый',              kind: 'solid',   color: '#efefeb' },
  { id: 'triplex-black',   group: '8', name: 'Чёрный',             kind: 'solid',   color: '#161618' },
  { id: 'mirror',          group: '8', name: 'Зеркало',            kind: 'mirror',  color: '#c7ccd1', mirror: ['#eef0f2', '#8f969d'] },
  { id: 'mirror-bronze',   group: '8', name: 'Зеркало бронза',     kind: 'mirror',  color: '#a9825d', mirror: ['#e2c3a0', '#6f4f33'] },
  { id: 'mirror-graphite', group: '8', name: 'Зеркало графит',     kind: 'mirror',  color: '#6c7075', mirror: ['#a9adb2', '#2f3235'] },
  { id: 'lacobel',         group: '8', name: 'Лакобель',           kind: 'solid',   color: '#b6a48b', note: 'цвет — по палитре фабрики' },
]

/** Полное название стекла для подписей: «триплекс белый», «стекло сатинат бронза» */
export function glassLabel(g: OniksGlass): string {
  const name = g.name.toLowerCase()
  return g.group === '8' ? `триплекс ${name}` : `стекло ${name}`
}

/** «прозрачное стекло», а не «стекло прозрачное» — порядок слов, как говорят */
function glassPhrase(g: OniksGlass): string {
  if (g.group === '4' && g.id === 'clear') return 'прозрачное стекло'
  return glassLabel(g)
}

/* Раскладка — доли внутренней области створки (0–1): h — перекладины
   по высоте, v — вертикали (x, от y1 до y2). Сняты со схемы фабрики
   «Варианты перегородок» (assets/oniks-alum/info/layouts.jpg) и сверены
   с фото моделей. */
export interface OniksLayout {
  h: number[]
  v: { x: number; y1: number; y2: number }[]
}

const full = (x: number) => ({ x, y1: 0, y2: 1 })

export interface OniksModel {
  id:      string
  /** Номер раскладки по каталогу фабрики */
  num:     number
  name:    string
  /** Раскладка словами */
  layout:  string
  geometry: OniksLayout
  /** Отделка на фото фабрики — она же подставляется в конструктор по «Собрать такую» */
  profile: string
  glass:   string
  /** Что на фото — собирается из profile и glass */
  shown:   string
  image:   string
}

/* Модельный ряд = 10 раскладок. Раскладка — со схемы фабрики; отделка —
   та, что на фото (профиль «металл» на фото — хром из палитры фабрики,
   белый — цвет эмали). */
const MODELS: Omit<OniksModel, 'name' | 'shown' | 'image'>[] = [
  { id: 'alum-01', num: 1,  layout: 'Одна перекладина — 2\u00a0секции',          geometry: { h: [0.5], v: [] },                                   profile: 'champagne', glass: 'triplex-white' },
  { id: 'alum-02', num: 2,  layout: 'Узкая полоса посередине — 3\u00a0секции',   geometry: { h: [0.451, 0.549], v: [] },                          profile: 'chrome',    glass: 'triplex-white' },
  { id: 'alum-03', num: 3,  layout: 'Две перекладины — 3\u00a0секции',           geometry: { h: [0.333, 0.667], v: [] },                          profile: 'black',     glass: 'satin-bronze' },
  { id: 'alum-04', num: 4,  layout: 'Три перекладины — 4\u00a0секции',           geometry: { h: [0.25, 0.5, 0.75], v: [] },                       profile: 'black',     glass: 'clear' },
  { id: 'alum-05', num: 5,  layout: 'Четыре перекладины — 5\u00a0секций',        geometry: { h: [0.2, 0.4, 0.6, 0.8], v: [] },                    profile: 'chrome',    glass: 'mirror-bronze' },
  { id: 'alum-06', num: 6,  layout: 'Асимметричная раскладка — 4\u00a0секции',   geometry: { h: [0.5], v: [{ x: 0.68, y1: 0, y2: 0.5 }, { x: 0.326, y1: 0.5, y2: 1 }] }, profile: 'chrome', glass: 'satin-graphite' },
  { id: 'alum-07', num: 7,  layout: 'Сетка 2\u00a0×\u00a03 — 6\u00a0секций',               geometry: { h: [0.333, 0.667], v: [full(0.5)] },                 profile: 'black',     glass: 'triplex-white' },
  { id: 'alum-08', num: 8,  layout: 'Сетка 2\u00a0×\u00a04 — 8\u00a0секций',               geometry: { h: [0.25, 0.5, 0.75], v: [full(0.5)] },              profile: 'white',     glass: 'clear-graphite' },
  { id: 'alum-09', num: 9,  layout: 'Сетка 2\u00a0×\u00a05 — 10\u00a0секций',              geometry: { h: [0.2, 0.4, 0.6, 0.8], v: [full(0.5)] },           profile: 'chrome',    glass: 'satin-white' },
  { id: 'alum-10', num: 10, layout: 'Сетка 3\u00a0×\u00a04 — 12\u00a0секций',              geometry: { h: [0.25, 0.5, 0.75], v: [full(0.32), full(0.68)] }, profile: 'black',     glass: 'clear' },
]

export const profileById = (id: string) => ONIKS_PROFILES.find((p) => p.id === id)!
export const glassById = (id: string) => ONIKS_GLASSES.find((g) => g.id === id)!

/** «Профиль чёрный, триплекс белый» */
export const finishLabel = (profile: string, glass: string) =>
  `Профиль ${profileById(profile).name.toLowerCase()}, ${glassPhrase(glassById(glass))}`

export const ONIKS_MODELS: OniksModel[] = MODELS.map((m) => ({
  ...m,
  name:  `ALUM №${m.num}`,
  shown: finishLabel(m.profile, m.glass),
  image: `${IMG}/models/${m.id}.webp`,
}))

/** Сочетание, с которого открывается конструктор, — №7 как на фото фабрики */
export const ONIKS_DEFAULT = { layout: 7, profile: 'black', glass: 'triplex-white' }

/** Размер фото раскладок (все одинаковые) */
export const ONIKS_MODEL_IMAGE = { width: 402, height: 1000 }

/* Схема всех раскладок */
export const ONIKS_LAYOUTS_IMAGE = {
  src:    `${IMG}/layouts-1600.webp`,
  srcset: `${IMG}/layouts-960.webp 960w, ${IMG}/layouts-1600.webp 1600w`,
  width:  1600,
  height: 419,
  alt:    'Схема десяти раскладок перегородок ALUM: от одной перекладины (№1) до сетки 3\u00a0×\u00a04 (№10)',
}

/* Цвета профиля */
export const ONIKS_PROFILE_COLORS = ['хром', 'золото', 'шампань', 'чёрный']
export const ONIKS_PROFILE_COLORS_IMAGE = {
  src:    `${IMG}/profile-colors-1024.webp`,
  srcset: `${IMG}/profile-colors-640.webp 640w, ${IMG}/profile-colors-1024.webp 1024w`,
  width:  1024,
  height: 507,
  alt:    'Цвета алюминиевого профиля ALUM: хром, золото, шампань и чёрный',
}

export const ONIKS_OPTI_WHITE_IMAGE = {
  src:    `${IMG}/opti-white-1024.webp`,
  srcset: `${IMG}/opti-white-640.webp 640w, ${IMG}/opti-white-1024.webp 1024w`,
  width:  1024,
  height: 541,
  alt:    'Сравнение: окрашенное стекло Opti White без зеленоватого оттенка и обычное стекло с оттенком',
}

/* Размеры и комплектация */
export const ONIKS_SPECS = [
  { label: 'Материал',                value: 'алюминиевый профиль и стекло' },
  { label: 'Высота створки',          value: 'до 3000 мм' },
  { label: 'Ширина створки',          value: 'до 1100 мм' },
  { label: 'Размеры',                 value: 'нестандартные, с шагом 1 см' },
  { label: 'Срок изготовления',       value: 'от 10 рабочих дней' },
  { label: 'Система',                 value: 'раздвижная, на направляющей (трек)' },
]
export const ONIKS_KIT = {
  included: ['профиль', 'алюминиевая направляющая (трек)', 'молдинг — в зависимости от комплектации'],
  separate: ['карниз к треку', 'ролики', 'система открывания', 'ручки'],
}

/* Комплектующие — с картинки фабрики */
export const ONIKS_COMPONENTS = [
  'Алюминиевая направляющая (трек) и ролики',
  'Горизонтальный профиль 41\u00a0×\u00a025 мм',
  'Стоевой профиль 44\u00a0×\u00a023 мм — в том числе со вставками под замок',
  'Молдинг 20\u00a0×\u00a013 мм',
  'Декоративный карниз высотой 70 мм, длиной 3000 мм',
  'Торцевые заглушки, разделитель трека, кронштейн стенового крепления',
]
export const ONIKS_COMPONENTS_IMAGE = {
  src:    `${IMG}/components-1024.webp`,
  srcset: `${IMG}/components-640.webp 640w, ${IMG}/components-1024.webp 1024w`,
  width:  1024,
  height: 703,
  alt:    'Комплектующие перегородок ALUM: направляющая, ролик, профили, молдинг, карниз, заглушки, кронштейн',
}

export const ONIKS_FAQ = [
  {
    q: 'Что такое перегородки ALUM?',
    a: 'Раздвижные межкомнатные перегородки фабрики ОНИКС из алюминиевого профиля и стекла. Они делят комнату на зоны, занимают минимум места и служат недорогой альтернативой стене.',
  },
  {
    q: 'Сколько вариантов раскладки у перегородок ALUM?',
    a: 'Десять: от одной перекладины (№1) до сетки 3\u00a0×\u00a04 (№10), есть асимметричная раскладка (№6). Цвет профиля и стекло подбираются отдельно.',
  },
  {
    q: 'Какое стекло можно поставить в перегородку?',
    a: 'Стекло 4 мм — прозрачное, прозрачное бронза или графит, сатинат белый, бронза или графит — или триплекс 8 мм: прозрачный, белый, чёрный, зеркало, зеркало бронза или графит и Лакобель в цветах фабрики.',
  },
  {
    q: 'Какого размера бывают перегородки ALUM?',
    a: 'Высота створки — до 3000 мм, ширина — до 1100 мм. Размеры нестандартные, с шагом 1 см: перегородку делают под ваш проём.',
  },
  {
    q: 'Какие цвета профиля доступны?',
    a: 'Хром, золото, шампань и чёрный, а также цвета эмали фабрики — например, белый.',
  },
  {
    q: 'Что входит в комплект перегородки?',
    a: 'Профиль, алюминиевая направляющая (трек) и молдинг — в зависимости от комплектации. Карниз к треку, ролики, система открывания и ручки приобретаются отдельно.',
  },
  {
    q: 'Почему белое стекло может отличаться по оттенку?',
    a: 'Обычное прозрачное стекло имеет лёгкий зеленоватый оттенок — он заметен, когда стекло окрашивают. Для чистого цвета перегородку можно сделать на стекле Opti White, у которого этого оттенка нет.',
  },
  {
    q: 'Сколько делают перегородку ALUM?',
    a: 'Срок изготовления на фабрике — от 10 рабочих дней. Стоимость и точный срок рассчитаем по размерам вашего проёма.',
  },
]
