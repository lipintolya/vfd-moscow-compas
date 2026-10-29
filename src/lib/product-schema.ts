/**
 * Product + AggregateOffer (schema.org) для разделов с диапазоном цен:
 * скрытые двери (раздел и посадочные), декор. Продавец — салон (LocalBusiness
 * по @id), регион — Москва и область, условия возврата — merchantPolicy.
 * Картинка — абсолютный URL.
 *
 * Цены — списком всех вариантов из прайса: «от», «до» и offerCount (число
 * вариантов) считаются из одного списка и не расходятся.
 *
 * Не заполняем (Search Console называет их «незначительными»):
 * review / aggregateRating — отзывов о самих товарах нет, а отзывы о салоне
 * Google на товарах ставить запрещает; shippingDetails — тариф доставки
 * салон пока не публикует (см. merchantPolicy).
 */
import { SITE } from '../config/site'
import { merchantPolicy } from './contacts-data'
import { sellerRef } from './local-business-schema'

/** Где работает салон — и для товаров, и для услуг (Service) */
export const AREA_SERVED = [
  { '@type': 'City', name: SITE.city.name },
  { '@type': 'AdministrativeArea', name: 'Московская область' },
]

export function productSchema(p: {
  name: string
  description: string
  image: string
  /** Цены всех вариантов из прайса (комплекты, материалы, размеры) */
  prices: number[]
  /** Есть в наличии — у товаров под заказ не указываем */
  inStock?: boolean
}) {
  if (!p.prices.length) throw new Error(`Product «${p.name}»: нет цен для разметки`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    brand: { '@type': 'Brand', name: SITE.name },
    image: new URL(p.image, SITE.url).href,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: Math.min(...p.prices),
      highPrice: Math.max(...p.prices),
      offerCount: p.prices.length,
      ...(p.inStock && { availability: 'https://schema.org/InStock' }),
      areaServed: AREA_SERVED,
      seller: sellerRef(),
      hasMerchantReturnPolicy: merchantPolicy.returnPolicy,
    },
  }
}

/**
 * Product с ценой «от» — для моделей, у которых цена зависит от отделки
 * (входные двери): AggregateOffer с lowPrice (минимальная цена модели по
 * каталогу завода), без highPrice и offerCount — полного списка вариантов
 * на странице нет. Бренд не указываем: двери не ВФД, название завода на сайт
 * не выводится. Продавец и условия возврата — как у остальных товаров.
 */
export function productSchemaFrom(p: { name: string; description: string; image: string; url: string; from: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: new URL(p.image, SITE.url).href,
    url: new URL(p.url, SITE.url).href,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: p.from,
      areaServed: AREA_SERVED,
      seller: sellerRef(),
      hasMerchantReturnPolicy: merchantPolicy.returnPolicy,
    },
  }
}
