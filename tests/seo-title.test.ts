import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brandTitle } from '../src/lib/seo-title'
import { productTitle } from '../src/lib/product-text'
import { DOOR_CATEGORIES } from '../src/data/door-categories'
import { COLOR_CATEGORIES } from '../src/data/color-categories'
import { STYLE_CATEGORIES } from '../src/data/style-categories'
import { SITE } from '../src/config/site'

const STUDIO = ` | ${SITE.studioName}`

test('заголовок страницы — с названием салона в конце', () => {
  assert.equal(brandTitle('Контакты'), `Контакты${STUDIO}`)
})

test('модель: бренд дверей ВФД в названии, салон — в конце', () => {
  const t = productTitle({ model: { name: 'ЕС2', trim: null }, seriesName: 'Эмалекс', coatingName: 'Эмалекс', coatingSlug: 'emalex' } as never)
  assert.match(t, /^Межкомнатная дверь ВФД /)
  assert.ok(t.endsWith(STUDIO), t)
})

test('посадочные страницы каталога: ВФД в основной части, салон в конце, без старого «| ВФД»', () => {
  for (const c of [...DOOR_CATEGORIES, ...COLOR_CATEGORIES, ...STYLE_CATEGORIES]) {
    assert.ok(c.metaTitle.endsWith(STUDIO), c.metaTitle)
    assert.match(c.metaTitle, /ВФД/, c.metaTitle)
    assert.doesNotMatch(c.metaTitle, /\| ВФД/, c.metaTitle)
  }
})

import { localBusinessSchema, websiteSchema } from '../src/lib/local-business-schema'

test('организация в разметке — как на Яндекс Картах, бренд дверей — ВФД', () => {
  const org = localBusinessSchema() as Record<string, unknown>
  assert.equal(org.name, SITE.studioName)
  assert.equal(org.alternateName, SITE.fullName)
  assert.deepEqual(org.brand, { '@type': 'Brand', name: SITE.manufacturer })
})

test('сайт для поисковиков называется «Студия Зизевского»', () => {
  const site = websiteSchema() as Record<string, unknown>
  assert.equal(site['@type'], 'WebSite')
  assert.equal(site.name, SITE.studioName)
  assert.equal(site.url, `${SITE.url}/`)
})
