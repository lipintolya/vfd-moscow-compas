/**
 * schema.org LocalBusiness/Store салона — единый источник для JSON-LD на
 * главной, «О нас», «Контактах» и «Отзывах». Все данные — из
 * src/config/site.ts и src/lib/contacts-data.ts, страницы лишь дополняют
 * объект своими полями (url, description).
 */
import { SITE } from '../config/site'
import { companyLegalInfo, HAS_EMAIL } from './contacts-data'
import { reviews } from '../data/reviews'
import { HERO_COVER_IMAGE } from '../data/hero-image'
import { MALL_PHOTOS } from '../data/mall-photos'

export const LOCAL_BUSINESS_ID = `${SITE.url}/#localbusiness`

/** Карточки организации на картах — sameAs */
const MAP_PROFILES: string[] = [SITE.yandexMaps]

/** Средняя оценка опубликованных отзывов, до десятых */
const averageRating = () => Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10

/** Отзывы с сайта — schema.org Review для LocalBusiness.review (/reviews/) */
export const reviewsSchema = () => reviews.map((r) => ({
  '@type': 'Review',
  author: { '@type': 'Person', name: r.name },
  datePublished: r.date,
  reviewBody: r.text,
  reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5', worstRating: '1' },
}))

/** Сайт для поисковиков (главная): из name Google берёт название сайта
    в выдаче, вместо домена */
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.studioName,
  /* Без домена: Google берёт запасное название, и «dveriziz.ru» оставалось бы
     в выдаче вместо названия студии */
  alternateName: `${SITE.studioName} — двери ${SITE.name} ${SITE.city.in}`,
  url: `${SITE.url}/`,
  inLanguage: 'ru-RU',
  publisher: { '@id': LOCAL_BUSINESS_ID },
})

export function localBusinessSchema(overrides: Record<string, unknown> = {}) {
  const { coordinates } = SITE.address
  const founded = companyLegalInfo.activity.founded

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': LOCAL_BUSINESS_ID,
    /* Как на карточке в Яндекс Картах — одно название везде (сайт, карты,
       разметка) помогает поисковикам связать их; ВФД — бренд дверей ниже */
    name: SITE.studioName,
    alternateName: SITE.fullName,
    description: companyLegalInfo.activity.description,
    url: SITE.url,
    telephone: SITE.phones.map(p => p.raw),
    /* Почта — когда задана настоящая (пока заглушка) */
    ...(HAS_EMAIL && { email: SITE.email }),
    logo: `${SITE.url}/logo-schema.png`,
    /* Салон и здание ТЦ снаружи — по фото здания карты и поиск
       узнают место */
    image: [HERO_COVER_IMAGE, SITE.address.photo, ...MALL_PHOTOS.map((p) => p.url)],
    /* Салон — официальный дилер фабрики: её марка продаётся здесь */
    brand: { '@type': 'Brand', name: SITE.manufacturer },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.street}, ${SITE.address.mall}, ${SITE.address.floor}`,
      addressLocality: SITE.city.name,
      addressRegion: SITE.city.region,
      ...(SITE.address.postalCode ? { postalCode: SITE.address.postalCode } : {}),
      addressCountry: 'RU',
    },
    areaServed: { '@type': 'City', name: SITE.city.name },
    ...(coordinates ? {
      geo: { '@type': 'GeoCoordinates', latitude: coordinates.lat, longitude: coordinates.lng },
    } : {}),
    openingHoursSpecification: companyLegalInfo.schemaOrgHours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      ...h,
    })),
    ...(founded ? { foundingDate: String(founded) } : {}),
    priceRange: '₽₽',
    acceptsPaymentMethod: ['Cash', 'CreditCard', 'DebitCard'],
    /* Рейтинг — по отзывам, опубликованным на сайте (src/data/reviews.ts):
       разметка описывает то, что на странице. Нет отзывов — нет рейтинга:
       выдуманный рейтинг — нарушение правил Яндекса и Google. */
    ...(SITE.features.reviews && reviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(averageRating()),
        reviewCount: String(reviews.length),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
    sameAs: [SITE.social.telegram, ...MAP_PROFILES],
    ...overrides,
  }
}
