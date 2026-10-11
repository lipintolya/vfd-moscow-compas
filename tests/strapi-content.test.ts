import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toPromo } from '../src/lib/strapi-content'
import { isPromoActive } from '../src/lib/promo-dates'

test('акция из Strapi → вид сайта', () => {
  const promo = toPromo({
    documentId: 'p1', title: '−15 % на скрытые двери', subtitle: 'До конца месяца', description: null,
    validUntil: '2026-10-31', discount: '−15 %', ctaText: null, ctaLink: null,
    image: { url: '/uploads/p.jpg', width: 2000, height: 1200, formats: { small: { url: '/uploads/small_p.jpg', width: 640, height: 384 } } },
  })
  assert.equal(promo.id, 'p1')
  assert.equal(promo.description, '')
  assert.equal(promo.image, '/uploads/small_p.jpg')
  assert.equal(promo.imageSrcset, '/uploads/small_p.jpg 640w')
  assert.equal(promo.ctaText, undefined)
})

test('«действует до» сегодня — акция активна до конца дня', () => {
  const promo = toPromo({ documentId: 'p2', title: 'А', subtitle: 'Б', validUntil: '2026-10-11', image: null })
  assert.equal(isPromoActive(promo.validUntil, new Date(2026, 9, 11, 23, 30)), true)
  assert.equal(isPromoActive(promo.validUntil, new Date(2026, 9, 12, 0, 5)), false)
})
