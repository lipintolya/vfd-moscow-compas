import { test } from 'node:test'
import assert from 'node:assert/strict'
import { productSchema } from '../src/lib/product-schema'
import { SECRET_KIT_OFFERS, REFLEX_KIT_OFFERS, SECRET_MIN_KIT_PRICE, REFLEX_MIN_KIT_PRICE, SECRET_PRICES } from '../src/data/skrytye-dveri-products'

const offersOf = (prices: number[]) =>
  productSchema({ name: 'Тест', description: 'Тест', image: '/x.webp', prices }).offers as Record<string, unknown>

test('AggregateOffer: «от», «до» и offerCount — из одного списка цен', () => {
  const o = offersOf([300, 100, 200])
  assert.equal(o['@type'], 'AggregateOffer')
  assert.equal(o.lowPrice, 100)
  assert.equal(o.highPrice, 300)
  assert.equal(o.offerCount, 3)
})

test('без цен разметка не строится — ошибка сборки, а не пустой Product', () => {
  assert.throws(() => offersOf([]), /нет цен/)
})

test('скрытые двери: «от» в разметке — та же цена, что на странице', () => {
  assert.equal(Math.min(...SECRET_KIT_OFFERS), SECRET_MIN_KIT_PRICE)
  assert.equal(Math.min(...REFLEX_KIT_OFFERS), REFLEX_MIN_KIT_PRICE)
  assert.equal(Math.max(...SECRET_KIT_OFFERS), Math.max(...SECRET_PRICES.map((r) => r.kitStandardPrice)))
})
