/**
 * Product + AggregateOffer (schema.org) для разделов с диапазоном цен:
 * скрытые двери, декор. Продавец — салон (LocalBusiness по @id), регион —
 * Москва и область, условия возврата — merchantPolicy. Картинка — абсолютный URL.
 */
import { SITE } from '../config/site'
import { merchantPolicy } from './contacts-data'
import { sellerRef } from './local-business-schema'

const areaServed = [
  { '@type': 'City', name: SITE.city.name },
  { '@type': 'AdministrativeArea', name: 'Московская область' },
]

export function productSchema(p: {
  name: string
  description: string
  image: string
  low: number
  high: number
  /** Есть в наличии — у товаров под заказ не указываем */
  inStock?: boolean
}) {
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
      lowPrice: p.low,
      highPrice: p.high,
      ...(p.inStock && { availability: 'https://schema.org/InStock' }),
      areaServed,
      seller: sellerRef(),
      hasMerchantReturnPolicy: merchantPolicy.returnPolicy,
    },
  }
}
