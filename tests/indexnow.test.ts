import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error — .mjs без типов
import { pageUrl, changedUrls, indexNowBody } from '../scripts/lib/indexnow.mjs'

const SITE = 'https://dveriziz.ru'

test('файл сборки → адрес страницы', () => {
  assert.equal(pageUrl(SITE, 'index.html'), 'https://dveriziz.ru/')
  assert.equal(pageUrl(SITE, 'catalog/index.html'), 'https://dveriziz.ru/catalog/')
  assert.equal(pageUrl(SITE, 'models/urban-zt/index.html'), 'https://dveriziz.ru/models/urban-zt/')
})

test('отправляются только изменившиеся страницы из карты сайта; первый раз — все', () => {
  const sitemap = ['https://dveriziz.ru/', 'https://dveriziz.ru/catalog/', 'https://dveriziz.ru/reviews/']
  const next = { 'index.html': 'a', 'catalog/index.html': 'b2', 'reviews/index.html': 'c', 'privacy/index.html': 'p2' }
  const prev = { 'index.html': 'a', 'catalog/index.html': 'b1', 'privacy/index.html': 'p1' }
  assert.deepEqual(changedUrls(SITE, prev, next, sitemap), ['https://dveriziz.ru/catalog/', 'https://dveriziz.ru/reviews/'])
  assert.deepEqual(changedUrls(SITE, null, next, sitemap), sitemap)
})

test('запрос IndexNow: хост, ключ, адрес файла ключа и список страниц', () => {
  assert.deepEqual(indexNowBody(SITE, 'k123', ['https://dveriziz.ru/']), {
    host: 'dveriziz.ru',
    key: 'k123',
    keyLocation: 'https://dveriziz.ru/k123.txt',
    urlList: ['https://dveriziz.ru/'],
  })
})
