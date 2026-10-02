/**
 * schema.org LocalBusiness/Store салона — единый источник для JSON-LD на
 * главной, «О нас», «Контактах» и «Отзывах». Все данные — из
 * src/config/site.ts и src/lib/contacts-data.ts, страницы лишь дополняют
 * объект своими полями (url, description).
 */
import { SITE } from '../config/site'
import { companyLegalInfo } from './contacts-data'
import { reviews } from '../data/reviews'

export const LOCAL_BUSINESS_ID = `${SITE.url}/#localbusiness`

/** Ссылки на карточки организации на картах (2ГИС, Яндекс Карты) —
    добавить, когда салон появится на картах. */
const MAP_PROFILES: string[] = []

export function localBusinessSchema(overrides: Record<string, unknown> = {}) {
  const { coordinates } = SITE.address
  const founded = companyLegalInfo.activity.founded

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': LOCAL_BUSINESS_ID,
    name: `${SITE.name} — ${SITE.fullName}`,
    description: companyLegalInfo.activity.description,
    url: SITE.url,
    telephone: SITE.phones.map(p => p.raw),
    email: SITE.email,
    logo: `${SITE.url}/logo-schema.png`,
    image: 'https://storage.yandexcloud.net/vfd74ru/promo_main/main_render_innova.webp',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.street}, ${SITE.address.mall}, ${SITE.address.floor}`,
      addressLocality: SITE.city.name,
      addressRegion: SITE.city.region,
      ...(SITE.address.postalCode ? { postalCode: SITE.address.postalCode } : {}),
      addressCountry: 'RU',
    },
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
    /* Рейтинг — только из реальных отзывов (src/data/reviews.ts). Нет
       отзывов → нет aggregateRating: выдуманный рейтинг в разметке —
       нарушение правил Яндекса/Google. ratingValue — уточнить по картам. */
    ...(SITE.features.reviews && reviews.length > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: String(reviews.length),
        bestRating: '5',
      },
    } : {}),
    sameAs: [SITE.social.vk, SITE.social.telegram, SITE.social.max, ...MAP_PROFILES],
    ...overrides,
  }
}
