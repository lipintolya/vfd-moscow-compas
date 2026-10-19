import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reviews } from '../src/data/reviews'
import { localBusinessSchema, reviewsSchema } from '../src/lib/local-business-schema'
import { SITE } from '../src/config/site'

test('отзывы: только о салоне, имя без фамилии, даты ISO, свежие первыми', () => {
  assert.ok(reviews.length > 0)
  for (const r of reviews) {
    assert.doesNotMatch(r.text, /дв[еe]р+[иеэ]з+/i, `${r.name}: другая фирма`)
    assert.doesNotMatch(r.name, /Зизевск/, 'отзыв владельца')
    assert.match(r.name, /^[^\s.]+$/, `${r.name}: только имя — без фамилии и инициала`)
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/)
    assert.doesNotMatch(r.text, / [,.!?:;]/, `${r.name}: пробел перед знаком`)
  }
  const dates = reviews.map((r) => r.date)
  assert.deepEqual(dates, [...dates].sort().reverse())
})

test('рейтинг в разметке — по опубликованным отзывам', () => {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const rating = (localBusinessSchema() as { aggregateRating: Record<string, string> }).aggregateRating
  assert.equal(rating.reviewCount, String(reviews.length))
  assert.equal(Number(rating.ratingValue), Math.round(avg * 10) / 10)
})

test('каждый отзыв — в разметке Review: автор, дата, оценка, текст', () => {
  const items = reviewsSchema()
  assert.equal(items.length, reviews.length)
  assert.deepEqual(items[0], {
    '@type': 'Review',
    author: { '@type': 'Person', name: reviews[0]!.name },
    datePublished: reviews[0]!.date,
    reviewBody: reviews[0]!.text,
    reviewRating: { '@type': 'Rating', ratingValue: String(reviews[0]!.rating), bestRating: '5', worstRating: '1' },
  })
})

test('карточка на Яндекс Картах — в sameAs', () => {
  assert.ok((localBusinessSchema() as { sameAs: string[] }).sameAs.includes(SITE.yandexMaps))
})
