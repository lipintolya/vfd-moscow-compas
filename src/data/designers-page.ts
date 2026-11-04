/* ============================================================
   Контент страницы /designers/ — сотрудничество с дизайнерами и
   архитекторами. Тексты — от владельца салона (2026-10-08), сжаты
   и вычитаны; факты только из них: более 1000 проектов, двери до 3 м,
   скрытые двери в наличии (STOCK_HEIGHTS), бонусы и индивидуальные
   условия (размер — при встрече). Адрес, часы, телефон — из конфига.
   ============================================================ */
import { SITE, PHONE } from '../config/site'
import { companyLegalInfo } from '../lib/contacts-data'
import { pluralRu } from '../lib/plural'
import { listRu } from '../lib/typograph'
import { renderGallery } from './partitions'
import { DOOR_SIZES } from './door-sizes'
import { SECRET_STOCK_HEIGHTS } from './skrytye-dveri-products'
import hero from './designers-hero.json'
import { DIRECTION_PHOTOS } from './direction-photos'
import { CUSTOM_MAX_HEIGHT } from './skrytye-dveri-products'
import { PLINTUS_PAGE, PROFILES_COUNT, HEIGHT_RANGE } from './plintus'
import { IMAGES as DECOR_IMAGES, HERO_IMAGE as DECOR_HERO } from './decor-products'
import { PANEL_HOME_TILE } from './wall-panels-page'
import { renderOf } from '../lib/wall-panels'
import { VFD } from './vfd-factory'
import { PANEL_MIN_PRICE } from './wall-panels-page'
import { SECRET_MIN_KIT_PRICE } from './skrytye-dveri-products'
import { FROM_PRICE_FRAMUGA_KIT } from './decor-products'
import { rub } from './services'
import { VIDEOS } from './videos'
import { textWithBody } from '../lib/messengers'

const hours = companyLegalInfo.workingHours.shortDisplay
const days  = companyLegalInfo.workingHours.weekdays
const { mall, floor, street } = SITE.address

/* Высоты скрытых дверей, которые держим в наличии (мм), — первый экран,
   плитка «Двери в наличии», ассортимент и вопросы берут их отсюда */
export const STOCK_HEIGHTS = SECRET_STOCK_HEIGHTS
const stockList = `${STOCK_HEIGHTS.slice(0, -1).join(', ')} и ${STOCK_HEIGHTS.at(-1)} мм`
const stockCount = `${STOCK_HEIGHTS.length} ${pluralRu(STOCK_HEIGHTS.length, ['размер', 'размера', 'размеров'])}`

/* Первый экран (LandingHero) — слайдер из трёх интерьеров. Кадры режет
   scripts/gen-designers-hero.mjs (в том же порядке), подписи — здесь */
const HERO_ALTS = [
  'Интерьер со скрытой дверью в стеновых панелях',
  'Гостиная со скрытой дверью в цвет стены',
  'Коридор с дверями заподлицо со стеной',
]
const srcset = (list: { file: string; width: number }[]) => list.map((v) => `${v.file} ${v.width}w`).join(', ')
export const DESIGNERS_HERO = {
  title: `Сотрудничество с дизайнерами и архитекторами ${SITE.city.in}`,
  lead:  'Подбор, расчёт, образцы, замер, доставка и монтаж — берём на себя. Вы придумываете — мы помогаем воплотить.',
  images: hero.map((h, i) => {
    const wideBig = h.wide.at(-1)!
    const tallBig = h.tall.at(-1)!
    return {
      alt:  HERO_ALTS[i] ?? HERO_ALTS[0]!,
      wide: { src: h.wide[0]!.file, srcset: srcset(h.wide), width: wideBig.width, height: wideBig.height },
      tall: { srcset: srcset(h.tall), width: tallBig.width, height: tallBig.height },
    }
  }),
  /* count — число для анимации счётчика (значение в разметке — итоговое) */
  facts: [
    { value: '1000+',   count: 1000, label: 'реализованных проектов с дизайнерами и архитекторами' },
    { value: `до ${DOOR_SIZES.customMaxHeight / 1000} м`, label: 'высота межкомнатных дверей под заказ' },
    { value: stockCount, label: `скрытых дверей в наличии: ${stockList}` },
    { value: 'Шоурум',  label: `в ${mall} — приводите заказчиков` },
  ],
}

/* Манифест — главный текст страницы, набран крупно */
export const DESIGNERS_INTRO = {
  title: 'Надёжный партнёр, а не просто продавец дверей',
  paragraphs: [
    'Мы много лет работаем с дизайнерами и архитекторами и знаем: важно не просто подобрать красивую дверь, а найти партнёра, который реализует задумку точно и в срок.',
    'Изготавливаем межкомнатные двери любых размеров, в том числе высотой до 3 метров. Классические и современные модели, разные материалы, цвета и отделки — решение найдётся практически под любой интерьер.',
    'Если проекту нужно что-то особенное — нестандартный размер, цвет, отделка или конструкция, — обсудим и предложим оптимальное решение.',
  ],
}

/* Что получает дизайнер — шесть выгод из текста владельца. У каждой
   плитки своя роль и своё наполнение (designers.astro): бонусы — красная
   (главная выгода, больших красных плоскостей — одна на экран), размеры —
   схема высоты двери, наличие — высоты на складе, выбор — ссылки на
   разделы каталога, подход — рендер, этапы — дорожка процесса. */
export const DESIGNER_BENEFITS = {
  bonus: {
    title:  'Специальные условия и бонусы',
    text:   'Для дизайнеров и архитекторов, которые работают с нами, — индивидуальные условия сотрудничества и бонусы за совместные проекты.',
    action: 'Обсудить условия',
  },
  size: {
    title: 'Нестандартные размеры',
    text:  'Изготавливаем двери любых размеров, включая высокие полотна до 3 метров.',
    /* Схема: стандартная высота и предельная под заказ, мм */
    standard: DOOR_SIZES.standardHeight,
    max:      DOOR_SIZES.customMaxHeight,
  },
  stock: {
    title:   'Двери в наличии',
    heights: STOCK_HEIGHTS,
    caption: 'высота скрытых дверей на складе, мм',
    text:    'Популярные модели тоже стараемся держать в наличии — сроки проекта не затягиваются.',
  },
  range: {
    title: 'Большой выбор дверей',
    text:  'Классические и современные модели, разные материалы и отделки — в том числе натуральный шпон.',
    links: [
      { label: 'Эмаль',                  href: '/catalog/dveri-emal/' },
      { label: 'Экошпон',                href: '/catalog/dveri-ekoshpon/' },
      { label: 'Скрытые двери',          href: '/catalog/skrytye-dveri/' },
      { label: 'Раздвижные конструкции', href: '/partitions/' },
    ],
  },
  approach: {
    title: 'Индивидуальный подход',
    text:  'Для каждого проекта подбираем свои решения — от стандартных моделей до полностью нестандартных.',
    /* Фото медиатеки салона, без знаков. Не то же, что у плитки «Перегородки» */
    photo: {
      src:    '/media/designers/approach-glass-partitions.webp',
      srcset: '/media/designers/approach-glass-partitions.webp 1200w',
      width:  1200,
      height: 1000,
      alt:    'Гостиная и спальня, разделённые раздвижными стеклянными перегородками в тёмном профиле — пример нестандартного решения',
    },
  },
  help: {
    title:  'Помощь на всех этапах',
    text:   'Весь процесс — от подбора до монтажа — берём на себя.',
    stages: ['Подбор модели', 'Материалы и цвет', 'Расчёт', 'Замер', 'Производство', 'Доставка', 'Монтаж'],
  },
}

/* Шоурум — встречи с заказчиками */
export const DESIGNERS_SHOWROOM = {
  title: 'Приводите заказчиков в шоурум',
  text:  `Двери, покрытия, фурнитура и образцы материалов — всё можно посмотреть и потрогать. Приводите заказчика сами или приезжайте вместе: покажем модели, поможем с выбором и сразу посчитаем проект.`,
  facts: [
    { label: 'Адрес',       value: `${street}, ${mall}, ${floor}` },
    { label: 'Часы работы', value: hours },
  ],
  photo: {
    src:    '/renders/contacts/consultation-480.webp',
    srcset: '/renders/contacts/consultation-480.webp 480w, /renders/contacts/consultation-800.webp 800w, /renders/contacts/consultation-1100.webp 1100w',
    width:  1100,
    height: 825,
    alt:    'Консультация в шоуруме: подбор дверей по образцам',
  },
}

/* Как работаем с дизайнером — реальная последовательность (StepsRow) */
export const DESIGNER_STEPS = [
  { num: '01', title: 'Подбор моделей и материалов', text: 'Предлагаем модели, материалы и цвета под концепцию проекта и даём образцы, чтобы показать заказчику.' },
  { num: '02', title: 'Технические решения',          text: 'Помогаем с проёмами, нестандартными высотами, скрытым монтажом и раздвижными конструкциями.' },
  { num: '03', title: 'Расчёт по проекту',            text: 'Готовим расчёт по спецификации проекта — удобно согласовать с заказчиком.' },
  { num: '04', title: 'Замер, доставка и монтаж',     text: `Организуем замер, доставку и монтаж собственной бригадой ${SITE.city.in} и области.` },
]

/* Что подбираем под дизайн-проект — разделы ассортимента карточками
   «фото + что умеем + цена от». Запросы дизайнеров (скрытые двери под
   покраску, нестандартная высота, стеновые панели, плинтус по RAL/NCS,
   перегородки, фальшфрамуга); факты и цены — из данных разделов. Цена
   межкомнатных — минимум каталога (Supabase), её передаёт страница.
   Фото — те же, что у направлений на главной. */
export interface DesignerSolution {
  title:    string
  text:     string
  href:     string
  photo:    { src: string; alt: string }
  position: string
  /** «от 11 900 ₽ за м²»; без цены — строки нет (плинтус и перегородки считаются по проекту) */
  price?:   string
}

export function designerSolutions(catalogMinPrice: number): { title: string; lead: string; items: DesignerSolution[] } {
  return {
    title: `Двери, панели и плинтус под дизайн-проект ${SITE.city.in}`,
    lead: 'Подбираем всё, что стоит в проёме и вдоль стены, в одной стилистике — и показываем вживую в шоуруме. Цены «от» — для первой сметы, точную сумму считаем по спецификации.',
    items: [
      {
        title: 'Межкомнатные двери до 3 метров',
        text: `Эмаль, Эмалекс, ПЭТ, экошпон и натуральный шпон. Высота под заказ — до ${DOOR_SIZES.customMaxHeight / 1000} м, под высокие потолки и проёмы проекта.`,
        href: '/catalog/',
        photo: DIRECTION_PHOTOS.interior,
        position: '72% 50%',
        price: `от ${rub(catalogMinPrice)} за полотно`,
      },
      {
        title: 'Скрытые двери под покраску',
        text: `Полотно красят в цвет стены по проекту, короб уходит под отделку. Высота до ${CUSTOM_MAX_HEIGHT} мм, в наличии ${stockList}.`,
        href: '/catalog/skrytye-dveri-dizayn-proekt/',
        photo: DIRECTION_PHOTOS.hidden,
        position: '56% 50%',
        price: `комплект от ${rub(SECRET_MIN_KIT_PRICE)}`,
      },
      {
        title: 'Стеновые панели в цвет дверей',
        text: 'Изготавливаем панели из натурального шпона: стена и полотна в одном оттенке, скрытые двери заподлицо с панелями.',
        href: '/catalog/stenovye-paneli/',
        photo: { src: renderOf(PANEL_HOME_TILE.visual)?.src ?? DIRECTION_PHOTOS.hidden.src, alt: PANEL_HOME_TILE.visual.alt },
        position: '50% 55%',
        price: `от ${rub(PANEL_MIN_PRICE)} за м²`,
      },
      {
        title: 'Плинтус по RAL и NCS',
        text: `Напольный плинтус из МДФ — ${PROFILES_COUNT}, высота ${HEIGHT_RANGE}, красим по палитре RAL и NCS. Есть скрытый плинтус, микроплинтус и плинтус с подсветкой.`,
        href: '/catalog/plintus/',
        photo: { src: PLINTUS_PAGE.hero.src, alt: PLINTUS_PAGE.hero.alt },
        position: '50% 65%',
      },
      {
        title: 'Алюминиевые перегородки',
        text: 'Раздвижные, распашные и стационарные перегородки со стеклом: подберём профиль, стекло и раскладку под проём.',
        href: '/partitions/',
        photo: DIRECTION_PHOTOS.partitions,
        position: '50% 50%',
      },
      {
        title: 'Фальшфрамуга и декор',
        text: 'Фальшфрамуга с компланарным коробом поднимает дверь до потолка, рейки и плинтус — в тех же покрытиях, что и двери.',
        href: '/catalog/decor/',
        photo: { src: DECOR_IMAGES.hero.src, alt: DECOR_HERO.alt },
        position: '50% 50%',
        price: `комплект фальшфрамуги от ${rub(FROM_PRICE_FRAMUGA_KIT)}`,
      },
    ],
  }
}

/* Ещё разделы — пилюлями под карточками */
export const DESIGNER_RANGE_MORE = [
  { label: 'Скрытые двери: все модели',       href: '/catalog/skrytye-dveri/' },
  { label: 'Высокие двери',                   href: '/catalog/vysokie-dveri/' },
  { label: 'Перегородки ALUM',                href: '/partitions/alum/' },
  { label: 'Двери со стеклом',                href: '/catalog/dveri-so-steklom/' },
  { label: 'Двери Эмалекс',                   href: '/catalog/dveri-emaleks/' },
  { label: 'Двери ПЭТ',                       href: '/catalog/dveri-pet/' },
  { label: 'Декоративные рейки',              href: '/catalog/dekorativnye-reyki/' },
  { label: 'Все серии',                       href: '/catalog/series/' },
]

/* Работы с объектов (Strapi, «Портфолио») — те, что ближе всего к
   дизайн-проектам: натуральный шпон, скрытые двери в панелях,
   нестандартный проём. Работы нет — сборка падает (designers.astro) */
export const DESIGNER_WORK_IDS = [
  'dveri-gladkaya-luchi-naturalny-dub-patina-kvartira',
  '2026-09-28-skrytye-dveri-paneli-shpon',
  'nestandartny-proem-chetyre-polotna-tri-framugi',
  '2026-10-19-dveri-stenovye-paneli',
]

/* Видео со встречи клуба дизайнеров — ролик из общего списка (videos.ts) */
const clubVideo = VIDEOS.find((v) => v.id === 'club-designers-2026-10')
if (!clubVideo) throw new Error('[designers] нет ролика club-designers-2026-10 в src/data/videos.ts')
export const DESIGNERS_CLUB = {
  title: 'Говорим с дизайнерами о дверях',
  lead:  'Ролик со встречи клуба дизайнеров в Москве — о том, почему двери нельзя оставлять на последний момент.',
  quote: clubVideo.text,
  video: clubVideo,
}

/* Пришлите проект — главный способ начать: мессенджер, куда можно
   приложить план и спецификацию. Сообщение уже набрано (messengers.ts) */
export const DESIGNER_MESSAGE_BODY = 'Я дизайнер (архитектор), хочу обсудить проект и условия сотрудничества. Пришлю план с проёмами.'
export const DESIGNER_MESSAGE = textWithBody(DESIGNER_MESSAGE_BODY)
export const DESIGNERS_SEND = {
  title: 'Пришлите проект на расчёт',
  lead:  'Напишите в Telegram или MAX и приложите то, что уже есть по объекту, — посчитаем двери, панели и плинтус одной сметой.',
  list: [
    'План с размерами проёмов или обмерный план',
    'Спецификация дверей — если она уже есть в проекте',
    'Покрытия, цвета и референсы интерьера',
    'Адрес объекта и стадия ремонта',
  ],
}

/* Материалы для проектирования. Что за ссылкой — проверено по самим
   страницам (2026-10-20): каталог — страница скачивания одного PDF;
   инструкции — папка PDF; визуализации и стёкла — папки JPG; 3D-модели —
   подборка в каталоге 3ddd.ru. Подпись, действие и значок строки выводятся
   из type и format (resourceMeta, RESOURCE_ACTION) — в разметке их нет.
   Где лежит — по адресу: домен фабрики (VFD.url) или сторонний сайт. */
export type ResourceType = 'file' | 'folder' | 'catalog'
export type ResourceFormat = 'PDF' | 'JPG' | '3D'
export interface DesignerResource { type: ResourceType; format: ResourceFormat; title: string; href: string }

export const DESIGNER_RESOURCES: DesignerResource[] = [
  { type: 'catalog', format: '3D',  title: '3D-модели алюминиевых дверей',        href: 'https://3ddd.ru/3dmodels?query=alumdoor&order=relevance' },
  { type: 'file',    format: 'PDF', title: 'Каталог алюминиевых дверей',          href: 'https://crm.vfd.ru/docs/pub/7c3fe99768a64437fc6c2a0371c7414f/default/?&' },
  { type: 'folder',  format: 'PDF', title: 'Инструкции и технические чертежи',    href: 'https://crm.vfd.ru/docs/pub/1041f6446d1a6eb72c8f75161e08de65/default/?&' },
  { type: 'folder',  format: 'JPG', title: 'Визуализация конструкций и профилей', href: 'https://crm.vfd.ru/docs/pub/ded5bbfb131cea40a5f33f05006e5bd4/default/?path=%2F%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8F%20%D0%BF%D0%BE%D0%BB%D0%BE%D1%82%D0%B5%D0%BD%2F' },
  { type: 'folder',  format: 'JPG', title: 'Изображения стёкол и перегородок',    href: 'https://crm.vfd.ru/docs/pub/8481c384fc078da3e1cea168258b98e0/default/?&' },
]

/** Что произойдёт по нажатию — подпись кнопки строки */
export const RESOURCE_ACTION: Record<ResourceType, string> = {
  file:    'Скачать',
  folder:  'Открыть папку',
  catalog: 'Открыть каталог',
}

const FACTORY_HOST = new URL(VFD.url).hostname
const hostOf = (href: string) => new URL(href).hostname.replace(/^www\./, '')
/** Домен фабрики или его поддомен (crm.vfd.ru) */
const isFactory = (host: string) => host === FACTORY_HOST || host.endsWith(`.${FACTORY_HOST}`)
/** «на сайте фабрики» или «на 3ddd.ru» */
const whereOf = (href: string) => (isFactory(hostOf(href)) ? 'на сайте фабрики' : `на ${hostOf(href)}`)
const FOLDER_OF: Record<ResourceFormat, string> = { PDF: 'Папка с PDF-файлами', JPG: 'Папка с изображениями', '3D': 'Папка с 3D-моделями' }

/** Подпись под названием: что это и где лежит — «PDF-файл на сайте фабрики» */
export const resourceMeta = (r: DesignerResource) => {
  const what = r.type === 'file' ? `${r.format}-файл` : r.type === 'folder' ? FOLDER_OF[r.format] : 'Подборка моделей'
  return `${what} ${whereOf(r.href)}`
}

/** Вводка блока: что на сайте фабрики и что — на сторонних (по адресам списка) */
const FORMAT_NOUN: Record<ResourceFormat, string> = { PDF: 'документы', JPG: 'изображения', '3D': '3D-модели' }
const external = [...new Set(
  DESIGNER_RESOURCES.filter((r) => !isFactory(hostOf(r.href))).map((r) => `${FORMAT_NOUN[r.format]} — на ${hostOf(r.href)}`),
)]
export const DESIGNER_RESOURCES_LEAD =
  `Каталог, инструкции, чертежи и изображения — на сайте ${SITE.manufacturerOf}` +
  (external.length ? `, ${listRu(external)}` : '') +
  '. Всё открывается в новой вкладке.'

/* Визуализации — алюминиевые перегородки и двери ВФД в интерьере: та же
   галерея, что на /partitions/ (public/renders/alum-covers/: 1920 px и
   превью 900 px). В сетке — избранные кадры (индексы в галерее, первый —
   крупный), окно просмотра листает всю галерею. */
export const DESIGNER_RENDERS = renderGallery
export const DESIGNER_RENDERS_FEATURED = [0, 6, 13, 23, 34]

export const DESIGNERS_FAQ = [
  {
    q: 'Какие проекты подходят для сотрудничества?',
    a: `Любые: квартиры, частные дома, офисы и коммерческие интерьеры ${SITE.city.in} и области. Работаем и с готовыми проектами, и с концепциями на стадии эскиза.`,
  },
  {
    q: 'Можно ли привести заказчика в шоурум?',
    a: `Да. Шоурум в ${mall} (${street}, ${floor}) работает без выходных, с ${days.opens} до ${days.closes}. Приводите заказчика или приезжайте вместе: покажем двери, покрытия и фурнитуру вживую.`,
  },
  {
    q: 'Есть ли бонусы для дизайнеров?',
    a: 'Да. Для дизайнеров и архитекторов, которые работают с нами, действуют индивидуальные условия сотрудничества и бонусы за совместные проекты — обсудим при встрече.',
  },
  {
    q: 'Делаете ли вы двери нестандартных размеров?',
    a: 'Да, изготавливаем межкомнатные двери любых размеров, в том числе высотой до 3 метров. Возможные размеры и сроки для конкретной серии подскажем при расчёте.',
  },
  {
    q: 'Есть ли скрытые двери в наличии?',
    a: `Да, двери скрытого монтажа популярных размеров — ${stockList} — стараемся держать в наличии, чтобы не ждать производства.`,
  },
  {
    q: 'Делаете скрытые двери под покраску для дизайн-проекта?',
    a: `Да. Полотно скрытой двери красят в цвет стены по проекту, высота — до ${CUSTOM_MAX_HEIGHT} мм. Популярные размеры (${stockList}) есть в наличии.`,
  },
  {
    q: 'Можно сделать плинтус в цвет по RAL или NCS?',
    a: `Да. Напольный плинтус из МДФ (${PROFILES_COUNT}, высота ${HEIGHT_RANGE}) красим по палитре RAL или NCS. Под проект есть и скрытый плинтус, микроплинтус, плинтус с подсветкой.`,
  },
  {
    q: 'Есть ли стеновые панели в цвет дверей?',
    a: 'Да. Изготавливаем стеновые панели из натурального шпона, двери встраиваем заподлицо с панелями. Цена — за квадратный метр по прайсу, итоговую сумму считаем по проекту.',
  },
  {
    q: 'Где взять 3D-модели и чертежи?',
    a: '3D-модели, каталоги и технические чертежи фабрики собраны в разделе «Материалы для проектирования» на этой странице.',
  },
  {
    q: 'Как начать сотрудничество?',
    a: `Напишите в Telegram или MAX и приложите план с проёмами, позвоните по номеру ${PHONE.label} или приезжайте в шоурум — обсудим проект и условия.`,
  },
]
