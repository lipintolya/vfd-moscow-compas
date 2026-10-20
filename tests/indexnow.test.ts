import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error — .mjs без типов
import { pageUrl, changedUrls, indexNowBody, pageContent, nextState, readState, withLastmod } from '../scripts/lib/indexnow.mjs'

const SITE = 'https://dveriziz.ru'

test('файл сборки → адрес страницы', () => {
  assert.equal(pageUrl(SITE, 'index.html'), 'https://dveriziz.ru/')
  assert.equal(pageUrl(SITE, 'catalog/index.html'), 'https://dveriziz.ru/catalog/')
  assert.equal(pageUrl(SITE, 'models/urban-zt/index.html'), 'https://dveriziz.ru/models/urban-zt/')
})

test('отправляются только страницы с изменившимся содержимым; первый раз — все', () => {
  const sitemap = ['https://dveriziz.ru/', 'https://dveriziz.ru/catalog/', 'https://dveriziz.ru/reviews/']
  const prev = { 'index.html': { hash: 'a', date: '2026-10-01' }, 'catalog/index.html': { hash: 'b1', date: '2026-10-01' }, 'privacy/index.html': { hash: 'p1', date: '2026-10-01' } }
  const next = nextState(prev, { 'index.html': 'a', 'catalog/index.html': 'b2', 'reviews/index.html': 'c', 'privacy/index.html': 'p2' }, '2026-10-20')
  assert.deepEqual(changedUrls(SITE, prev, next, sitemap), ['https://dveriziz.ru/catalog/', 'https://dveriziz.ru/reviews/'])
  assert.deepEqual(changedUrls(SITE, null, next, sitemap), sitemap)
})

test('дата страницы меняется только вместе с содержимым', () => {
  const prev = { 'index.html': { hash: 'a', date: '2026-10-01' }, 'catalog/index.html': { hash: 'b', date: '2026-10-01' } }
  assert.deepEqual(nextState(prev, { 'index.html': 'a', 'catalog/index.html': 'b2', 'new/index.html': 'n' }, '2026-10-20'), {
    'index.html': { hash: 'a', date: '2026-10-01' },
    'catalog/index.html': { hash: 'b2', date: '2026-10-20' },
    'new/index.html': { hash: 'n', date: '2026-10-20' },
  })
})

test('старый формат состояния (хэш всего HTML) — как первая выкладка', () => {
  assert.equal(readState({ 'index.html': 'abc' }), null)
  assert.equal(readState(null), null)
  const state = { 'index.html': { hash: 'a', date: '2026-10-01' } }
  assert.equal(readState(state), state)
})

test('содержимое страницы: стили, скрипты и priceValidUntil не в счёт, текст и разметка — в счёт', () => {
  const page = (css: string, text: string, until: string) =>
    `<html><head><title>Дверь</title><meta name="description" content="Описание"><link rel="stylesheet" href="/_astro/${css}.css">` +
    `<script type="application/ld+json">{"@type":"Offer","priceValidUntil":"${until}","price":100}</script></head>` +
    `<body><script src="/_astro/${css}.js"></script><img src="/a.webp" alt="Фото"><p>${text}</p></body></html>`
  assert.equal(pageContent(page('aaa', 'Текст', '2027-01-01')), pageContent(page('bbb', 'Текст', '2027-02-02')))
  assert.notEqual(pageContent(page('aaa', 'Текст', '2027-01-01')), pageContent(page('aaa', 'Другой текст', '2027-01-01')))
  assert.notEqual(pageContent(page('aaa', 'Текст', '2027-01-01')), pageContent(page('aaa', 'Текст', '2027-01-01').replace('"price":100', '"price":200')))
})

test('lastmod в карте сайта: дата изменения содержимого; более поздняя дата из Strapi остаётся', () => {
  const xml = '<urlset><url><loc>https://dveriziz.ru/</loc><priority>1</priority></url>' +
    '<url><loc>https://dveriziz.ru/articles/a/</loc><lastmod>2026-10-19T10:00:00.000Z</lastmod></url>' +
    '<url><loc>https://dveriziz.ru/articles/b/</loc><lastmod>2026-09-01T10:00:00.000Z</lastmod></url></urlset>'
  const state = {
    'index.html': { hash: 'a', date: '2026-10-20' },
    'articles/a/index.html': { hash: 'b', date: '2026-10-05' },
    'articles/b/index.html': { hash: 'c', date: '2026-10-05' },
  }
  assert.equal(withLastmod(xml, SITE, state),
    '<urlset><url><loc>https://dveriziz.ru/</loc><lastmod>2026-10-20</lastmod><priority>1</priority></url>' +
    '<url><loc>https://dveriziz.ru/articles/a/</loc><lastmod>2026-10-19T10:00:00.000Z</lastmod></url>' +
    '<url><loc>https://dveriziz.ru/articles/b/</loc><lastmod>2026-10-05</lastmod></url></urlset>')
})

test('запрос IndexNow: хост, ключ, адрес файла ключа и список страниц', () => {
  assert.deepEqual(indexNowBody(SITE, 'k123', ['https://dveriziz.ru/']), {
    host: 'dveriziz.ru',
    key: 'k123',
    keyLocation: 'https://dveriziz.ru/k123.txt',
    urlList: ['https://dveriziz.ru/'],
  })
})
