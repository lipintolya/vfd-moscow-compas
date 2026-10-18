/* ============================================================
   Контент страницы /contacts/ — тексты блоков и FAQ.
   Адрес, телефон, часы — из src/config/site.ts и contacts-data.ts,
   цены услуг — из services.ts: здесь не повторяем, а подставляем.
   ============================================================ */
import { SITE } from '../config/site'
import { companyLegalInfo } from '../lib/contacts-data'
import { SERVICES, rub, MEASURE_REFUND, MEASURE_TERMS, INSTALL_TERMS } from './services'
import contactsImages from './contacts-images.json'
import salonPhotos from './salon-photos.json'

const hours = companyLegalInfo.workingHours
const phone = companyLegalInfo.contacts.phone[0]!

export const CONTACTS_INTRO = {
  title: `Контакты салона ${SITE.name} ${SITE.city.in}`,
  lead:  `Звоните или приезжайте в салон в ${SITE.address.mall} — покажем двери вживую, подберём модель и выедем на замер.`,
}

/* Фото карточек — кадр 4:3, облегчённые копии: scripts/gen-contacts-images.mjs
   (public/renders/contacts/, contacts-images.json) */
type PhotoName = keyof typeof contactsImages.photos
const photo = (name: PhotoName, alt: string) => {
  const file = (w: number) => `/renders/contacts/${name}-${w}.webp`
  return {
    src:    file(contactsImages.widths[0]!),
    srcset: contactsImages.widths.map((w) => `${file(w)} ${w}w`).join(', '),
    width:  contactsImages.photos[name].width,
    height: contactsImages.photos[name].height,
    alt,
  }
}

/* «Что вы получаете». Без photo — карточка без фото (в режиме
   разработки на его месте рамка) */
export const BENEFITS: {
  title: string
  text:  string
  price?: { value: string; note: string }
  photo?: { src: string; srcset?: string; alt: string; width: number; height: number }
}[] = [
  {
    photo: photo('consultation', 'Консультант подбирает двери по образцам в салоне'),
    title: 'Бесплатная консультация',
    text:  'Подберём модель, покрытие и цвет под ваш интерьер и бюджет — вживую, с образцами материалов. Консультация ни к чему не обязывает.',
  },
  {
    photo: photo('zamer', 'Замерщик измеряет дверной проём рулеткой'),
    title: 'Выезд на замер',
    text:  `Специалист снимет точные размеры проёма и учтёт особенности стен — от этого зависят смета и точность монтажа. По Москве и области, стоимость выезда за город уточнит менеджер.`,
    price: { value: rub(SERVICES.measure.price), note: MEASURE_REFUND },
  },
  {
    photo: photo('install-door', 'Установленная межкомнатная дверь со шпоном «ёлочкой» и чёрной ручкой'),
    title: 'Монтаж под ключ',
    text:  'Двери устанавливает собственная бригада. Соблюдаем согласованные сроки и убираем за собой строительный мусор.',
    price: { value: `от\u00A0${rub(SERVICES.install.priceFrom)}`, note: 'За установку одной двери' },
  },
]

export const CONTACTS_FAQ = [
  {
    q: 'Нужно ли записываться заранее, чтобы приехать в салон?',
    a: 'Нет, предварительная запись не обязательна — приходите в рабочие часы. Если хотите, чтобы к вашему приходу подготовили образцы под проект, предупредите заранее по телефону.',
  },
  {
    q: 'Работаете ли вы в выходные?',
    a: `Да, салон работает без выходных: ежедневно с ${hours.weekdays.opens} до ${hours.weekdays.closes}.`,
  },
  {
    q: `Выезжаете ли вы на замер за пределы ${SITE.city.of}?`,
    a: `Да, выезжаем и в Московскую область — стоимость выезда зависит от адреса, её уточнит менеджер. ${MEASURE_TERMS}.`,
  },
  {
    q: 'Сколько стоит установка?',
    a: `${INSTALL_TERMS}. Устанавливает собственная бригада салона.`,
  },
  {
    q: 'Как быстрее всего получить консультацию?',
    a: `Позвоните по номеру ${phone.label} — ${SITE.contactPerson} подскажет по моделям, ценам и срокам.`,
  },
]

/* Вход в салон и место консультации — фото салона от владельца
   (assets/salon, npm run gen:showroom). alt — что в кадре, для поиска
   по картинкам и экранных читалок; chip — плашка на фото в превью. */
const { mall, street, floorIn } = SITE.address
const SALON_TEXT: Record<number, { alt: string; chip?: string }> = {
  1: { alt: `Вход в салон ${SITE.studioNameOf}: вывеска «Фабрика дверей VFD» ${floorIn} ${mall}, ${street}`, chip: 'Вход' },
  2: { alt: `Вход в салон ${SITE.studioNameOf} с галереи ${mall}: стеклянная дверь в зелёной раме` },
  3: { alt: 'Графитовая, белая со вставкой под дерево и дверь под светлое дерево на стене шоурума' },
  4: { alt: 'Белые филёнчатые и остеклённые двери и графитовая дверь на стене шоурума' },
  5: { alt: 'Белые межкомнатные двери в ряд у серой стены шоурума, одна со стеклом в раскладке' },
  6: { alt: `Стенды дверных ручек Punto, Fuaro, Bussare и Morelli в ${SITE.studioNameOf}` },
  7: { alt: `Шоурум ${SITE.studioNameOf}: межкомнатные двери ВФД — белые филёнчатые, графитовая и белая со вставкой под дерево` },
  8: { alt: 'Белые филёнчатые и остеклённые двери на тёмно-серой стене шоурума' },
}
/** Кадры в превью (остальные — в окне просмотра): вход крупно, затем
    дверь и вид внутрь, затем место консультации */
const SALON_PREVIEW = [1, 2, 3, 4, 5]

export const SALON = {
  title: 'Как выглядит салон',
  lead:  `Салон — ${floorIn} ${mall}, вход с галереи под вывеской «Фабрика дверей VFD». За столом у образцов менеджер подберёт двери и рассчитает комплект.`,
  photos: salonPhotos.photos.map((p) => {
    const file = (w: number) => `/renders/contacts/salon2-${p.n}-${w}.webp`
    const text = SALON_TEXT[p.n] ?? { alt: `Салон ${SITE.studioNameOf}` }
    return {
      n:      p.n,
      src:    file(salonPhotos.widths[0]!),
      srcset: salonPhotos.widths.map((w) => `${file(w)} ${w}w`).join(', '),
      large:  file(salonPhotos.widths.at(-1)!),
      width:  p.width,
      height: p.height,
      ...text,
    }
  }),
  /** Номера кадров превью — по порядку (ПК: вход 2×2, рядом колонки
      «вход» и «консультация»; телефон — лента) */
  preview: SALON_PREVIEW,
}
