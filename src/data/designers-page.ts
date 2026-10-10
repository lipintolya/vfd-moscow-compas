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
import { renderGallery } from './partitions'
import { DOOR_SIZES } from './door-sizes'
import { SECRET_STOCK_HEIGHTS } from './skrytye-dveri-products'
import hero from './designers-hero.json'

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
    /* Кадр из галереи визуализаций (renderGallery, № 4) */
    photo: {
      src:    '/renders/alum-covers/4-preview.webp',
      srcset: '/renders/alum-covers/4-preview.webp 900w, /renders/alum-covers/4.webp 1920w',
      width:  900,
      height: 674,
      alt:    'Гардеробная за стеклянной перегородкой в чёрном профиле — пример нестандартного решения',
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

/* Ассортимент для проектов — фото те же, что у направлений на главной */
const PREVIEW = 'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/catalog.preview.main'
export const DESIGNER_RANGE = [
  { title: 'Межкомнатные двери',      text: 'Эмаль, Эмалекс, ПЭТ, экошпон — серии и цвета каталога',       href: '/catalog/',              image: `${PREVIEW}/catalog_preview_left.webp`,       position: '72% 50%' },
  { title: 'Скрытые двери',           text: `Заподлицо со стеной; в наличии ${stockList}`,                  href: '/catalog/skrytye-dveri/', image: `${PREVIEW}/catalog_preview_top_right.webp`,  position: '56% 50%' },
  { title: 'Алюминиевые перегородки', text: 'Раздвижные и стационарные конструкции со стеклом',           href: '/partitions/',            image: `${PREVIEW}/catalog_preview_down_right.webp`, position: '50% 50%' },
]
export const DESIGNER_RANGE_MORE = [
  { label: 'Декор: плинтус, фрамуги, рейки', href: '/catalog/decor/' },
  { label: 'Двери Эмалекс',                   href: '/catalog/dveri-emaleks/' },
  { label: 'Двери ПЭТ',                       href: '/catalog/dveri-pet/' },
  { label: 'Все серии',                       href: '/catalog/series/' },
  { label: 'Видео о дверях',                  href: '/video/' },
]

/* Материалы для проектирования — ресурсы фабрики (открываются на её сайте) */
export const DESIGNER_RESOURCES = [
  { kind: '3D',  title: '3D-модели алюминиевых дверей',         href: 'https://3ddd.ru/3dmodels?query=alumdoor&order=relevance' },
  { kind: 'PDF', title: 'Каталог алюминиевых дверей',           href: 'https://crm.vfd.ru/docs/pub/7c3fe99768a64437fc6c2a0371c7414f/default/?&' },
  { kind: 'PDF', title: 'Инструкции и технические чертежи',     href: 'https://crm.vfd.ru/docs/pub/1041f6446d1a6eb72c8f75161e08de65/default/?&' },
  { kind: 'PDF', title: 'Визуализация конструкций и профилей',  href: 'https://crm.vfd.ru/docs/pub/ded5bbfb131cea40a5f33f05006e5bd4/default/?path=%2F%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8F%20%D0%BF%D0%BE%D0%BB%D0%BE%D1%82%D0%B5%D0%BD%2F' },
  { kind: 'PDF', title: 'Изображения стёкол и перегородок',     href: 'https://crm.vfd.ru/docs/pub/8481c384fc078da3e1cea168258b98e0/default/?&' },
]

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
    q: 'Где взять 3D-модели и чертежи?',
    a: '3D-модели, каталоги и технические чертежи фабрики собраны в разделе «Материалы для проектирования» на этой странице.',
  },
  {
    q: 'Как начать сотрудничество?',
    a: `Позвоните по номеру ${PHONE.label} или приезжайте в шоурум — обсудим проект и условия.`,
  },
]
