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

import { toWork } from '../src/lib/strapi-content'

const photo = (n: number) => ({ url: `/uploads/w${n}.jpg`, width: 3000, height: 2000, alternativeText: `Фото ${n}`,
  formats: { medium: { url: `/uploads/medium_w${n}.jpg`, width: 960, height: 640 }, xlarge: { url: `/uploads/xlarge_w${n}.jpg`, width: 1920, height: 1280 } } })

test('работа из Strapi → вид сайта', () => {
  const w = toWork({
    documentId: 'd1', slug: '2026-09-28-skrytye-dveri', title: 'Скрытые двери', date: '2026-09-28',
    category: 'Скрытые двери', objectType: 'Квартира', location: 'Москва', description: 'Описание',
    story: 'Абзац 1\n\nАбзац 2', model: null, doorCount: null,
    features: [{ text: 'Заподлицо' }], tags: [], images: [photo(1), photo(2)],
    catalogLink: { section: 'Скрытые двери', label: null },
  })
  assert.equal(w.id, '2026-09-28-skrytye-dveri')
  assert.equal(w.label, '28.09.2026')
  assert.equal(w.category, 'hidden')
  assert.equal(w.objectType, 'apartment')
  assert.deepEqual(w.features, ['Заподлицо'])
  assert.deepEqual(w.images, ['/uploads/xlarge_w1.jpg', '/uploads/xlarge_w2.jpg'])
  assert.equal(w.cover.src, '/uploads/medium_w1.jpg')
  assert.deepEqual(w.relatedLink, { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери в каталоге' })
})

test('работа без ссылки на каталог и без особенностей', () => {
  const w = toWork({ documentId: 'd2', slug: 's', title: 'Т', date: '2026-01-05', category: 'Межкомнатные',
    objectType: 'Офис', description: 'О', images: [photo(3)] })
  assert.equal(w.relatedLink, undefined)
  assert.equal(w.features, undefined)
  assert.equal(w.location, '')
})

test('работа без фото — ошибка с названием работы', () => {
  assert.throws(() => toWork({ documentId: 'd3', slug: 'x', title: 'Кухня в ЖК', date: '2026-01-05', category: 'Межкомнатные',
    objectType: 'Офис', description: 'О', images: [] }), /«Кухня в ЖК».*фото/)
})

import { toArticle } from '../src/lib/strapi-content'

const media = (url: string) => ({ url, width: 1920, height: 1080, formats: { medium: { url: url.replace('/uploads/', '/uploads/medium_'), width: 960, height: 540 } } })

test('статья из Strapi → данные сайта', () => {
  const a = toArticle({
    documentId: 'd', slug: 'skrytye', title: 'Скрытые двери', kind: 'Публикация', publishDate: '2026-09-01', updatedDate: null,
    cover: media('/uploads/c.webp'), coverAlt: 'Обложка', description: 'Звоните {телефон}',
    summary: [{ text: 'Пункт' }], keywords: [], faq: [{ q: 'Где?', a: '{адрес салона}' }],
    body: [{ __component: 'article.text', content: [{ type: 'heading', level: 2, children: [{ type: 'text', text: 'Раздел' }] }, { type: 'paragraph', children: [{ type: 'text', text: 'Слово {телефон}' }] }] }],
    seo: { metaTitle: null, steps: [], coatings: [{ coating: 'Эмаль' }], series: [{ text: 'urban' }], pages: [], author: null, spotlight: null },
  })
  assert.equal(a.id, 'skrytye')
  assert.equal(a.data.kind, 'publication')
  assert.match(a.data.description, /^Звоните \S/)
  assert.doesNotMatch(a.data.description, /\{/)
  assert.equal(a.data.publishDate, '2026-09-01')
  assert.equal(a.data.coverImage, '/uploads/c.webp')
  assert.equal(a.data.cover.src, '/uploads/medium_c.webp')  // копия не шире 1280
  assert.deepEqual(a.data.relatedCoatings, ['emal'])
  assert.deepEqual(a.data.relatedSeriesSlugs, ['urban'])
  assert.deepEqual(a.data.headings, [{ depth: 2, slug: 'раздел', text: 'Раздел' }])
  assert.equal(a.data.blocks.length, 1)
  assert.match(a.body, /Раздел Слово/)
  assert.doesNotMatch(a.body, /\{/)
})

test('статья без текста — ошибка с названием', () => {
  assert.throws(() => toArticle({ documentId: 'd', slug: 's', title: 'Пустая', kind: 'Статья', publishDate: '2026-01-01',
    cover: media('/uploads/c.webp'), coverAlt: 'О', description: 'Л', body: [] }), /«Пустая».*текст/)
})
