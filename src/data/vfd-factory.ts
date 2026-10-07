/* ============================================================
   Владимирская фабрика дверей (ВФД) — производитель, официальным
   дилером которого является салон. Блок на /about/ и Organization
   в JSON-LD.

   Факты — только со страницы фабрики https://vfd.ru/about (сверено
   2026-10-07): формулировки близко к тексту, своих цифр и обещаний
   не дописывать. Цифры меняются — при обновлении сверять там же.
   ============================================================ */
import { SITE } from '../config/site'
import vfdPhotos from './about-vfd-photos.json'

export const VFD = {
  name:          SITE.manufacturer,          // «Владимирская фабрика дверей»
  alternateName: 'ВФД',
  url:           'https://vfd.ru/',
  aboutUrl:      'https://vfd.ru/about',
  foundingYear:  2002,
  region:        'Владимирская область',
}

export const VFD_DEALER = {
  title: `Официальный дилер ${SITE.manufacturerOf}`,
  lead:
    `Фабрика начиналась в ${VFD.foundingYear} году с небольшого деревообрабатывающего цеха ` +
    `во Владимирской области. Сегодня у неё собственные цеха по производству материалов ` +
    `и обработке стекла. Мы — официальный дилер фабрики ${SITE.city.in}: в салоне ` +
    `в ${SITE.address.mall} — образцы, замер и монтаж собственной бригадой.`,
  facts: [
    { value: String(VFD.foundingYear), label: `год основания, ${VFD.region}` },
    { value: '32 000 м²',               label: 'производственная площадь' },
    { value: '850',                     label: 'специалистов' },
    { value: '1200',                    label: 'наименований в каталоге продукции' },
  ],
  source: { label: 'По данным производителя — vfd.ru', href: VFD.aboutUrl },
  /* Пункт о производстве — подпись под своим фото (photo — номер кадра
     card_N из about.block/factory): фото и текст — одна карточка */
  features: [
    {
      photo: 1,
      title: 'Автоматизированные линии',
      text:  'Сотрудники фабрики работают на современных автоматизированных линиях немецкого и итальянского производства.',
    },
    {
      photo: 2,
      title: 'Собственная обработка стекла',
      text:  'Своё производство по обработке стекла позволяет фабрике экспериментировать с дизайном остеклённых моделей.',
    },
    {
      photo: 4,
      title: 'Контроль на всех этапах',
      text:  'Отлаженный процесс производства — своевременные отгрузки и бесперебойные поставки продукции.',
    },
    {
      photo: 3,
      title: 'Сеть по всей России',
      text:  '2000 дилерских магазинов по всей России, 10 региональных складов и 10 стран-партнёров.',
    },
  ],
  cta: { label: 'Смотреть каталог дверей ВФД', href: '/catalog/' },
}

/* Фото фабрики — локальные копии (scripts/gen-about-images.mjs →
   public/renders/about/vfd-N-*.webp, about-vfd-photos.json). Подписи —
   что в кадре + название фабрики: для поиска по картинкам. */
const VFD_ALTS: Record<number, string> = {
  1: `Оператор станка с ЧПУ на производстве ${SITE.manufacturerOf}`,
  2: `Обработка стекла для дверей на производстве ${SITE.manufacturerOf}`,
  3: `Склад готовой продукции ${SITE.manufacturerOf}`,
  4: `Станок для обработки деталей дверей на производстве ВФД`,
}

const vfdFile = (n: number, w: number) => `/renders/about/vfd-${n}-${w}.webp`

export const VFD_PHOTOS = vfdPhotos.photos.map((p) => ({
  n:      p.n,
  src:    vfdFile(p.n, vfdPhotos.widths[0]!),
  srcset: vfdPhotos.widths.map((w) => `${vfdFile(p.n, w)} ${w}w`).join(', '),
  /** Крупный кадр — для окна просмотра */
  large:  vfdFile(p.n, vfdPhotos.widths.at(-1)!),
  width:  p.width,
  height: p.height,
  alt:    VFD_ALTS[p.n] ?? `Производство ${SITE.manufacturerOf}`,
}))

/* Карточки блока: пункт + его фото, в порядке пунктов */
export const VFD_CARDS = VFD_DEALER.features.map((f) => {
  const photo = VFD_PHOTOS.find((p) => p.n === f.photo)
  if (!photo) throw new Error(`vfd-factory: нет фото card_${f.photo} для «${f.title}»`)
  return { ...f, photo }
})

/* schema.org — производитель; салон ссылается на него как на бренд */
export const VFD_ORG_ID = `${SITE.url}/#vfd-manufacturer`
export const vfdOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': VFD_ORG_ID,
  name: VFD.name,
  alternateName: VFD.alternateName,
  url: VFD.url,
  foundingDate: String(VFD.foundingYear),
  address: { '@type': 'PostalAddress', addressRegion: VFD.region, addressCountry: 'RU' },
  description: `Производитель межкомнатных дверей, ${VFD.region}. Основана в ${VFD.foundingYear} году.`,
})
