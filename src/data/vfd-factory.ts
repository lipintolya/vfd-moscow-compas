/* ============================================================
   Владимирская фабрика дверей (ВФД) — производитель, официальным
   дилером которого является салон. Блок на /about/ и Organization
   в JSON-LD.

   Факты — по материалам производителя (официальный сайт фабрики,
   раздел «О компании»; перенесены со страницы /o-fabrike/, удалённой
   2026-10-04). Цифры меняются — сверять с сайтом фабрики, не дописывать
   своих.
   ============================================================ */
import { SITE } from '../config/site'
import vfdPhotos from './about-vfd-photos.json'

export const VFD = {
  name:          SITE.manufacturer,          // «Владимирская фабрика дверей»
  alternateName: 'ВФД',
  url:           'https://vfd.ru/',
  foundingYear:  2002,
}

export const VFD_DEALER = {
  title: `Официальный дилер ${SITE.manufacturerOf}`,
  lead:
    `ВФД — российский производитель межкомнатных дверей полного цикла: от обработки материала ` +
    `до готового полотна. Мы — официальный дилер фабрики ${SITE.city.in}: в салоне ` +
    `в ${SITE.address.mall} — образцы, замер и монтаж собственной бригадой.`,
  facts: [
    { value: String(VFD.foundingYear), label: 'год основания, Владимирская область' },
    { value: '38 000 м²',               label: 'собственных производственных площадок' },
    { value: '850',                     label: 'специалистов на производстве' },
    { value: '1200+',                   label: 'моделей в ассортименте фабрики' },
  ],
  source: 'По данным производителя',
  features: [
    {
      title: 'Автоматизированные линии',
      text:  'Основное оборудование — немецкое и итальянское: точная геометрия полотна и одинаковый результат от партии к партии.',
    },
    {
      title: 'Собственная обработка стекла',
      text:  'Стекло для остеклённых моделей фабрика режет и обрабатывает сама — без зависимости от сторонних поставщиков.',
    },
    {
      title: 'Контроль на входе и на выходе',
      text:  'Проверяются и сырьё, и готовое полотно перед отгрузкой.',
    },
    {
      title: 'Собственные покрытия',
      text:  'Фабрика разрабатывает свои линейки покрытий — Эмалекс и Протач, помимо ПВХ, полипропилена и эмали.',
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
  src:    vfdFile(p.n, vfdPhotos.widths[0]!),
  srcset: vfdPhotos.widths.map((w) => `${vfdFile(p.n, w)} ${w}w`).join(', '),
  /** Крупный кадр — для окна просмотра */
  large:  vfdFile(p.n, vfdPhotos.widths.at(-1)!),
  width:  p.width,
  height: p.height,
  alt:    VFD_ALTS[p.n] ?? `Производство ${SITE.manufacturerOf}`,
}))

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
  description: 'Российский производитель межкомнатных дверей полного цикла.',
})
