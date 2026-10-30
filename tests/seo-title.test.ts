import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brandTitle } from '../src/lib/seo-title'
import { productTitle } from '../src/lib/product-text'
import { DOOR_CATEGORIES } from '../src/data/door-categories'
import { COLOR_CATEGORIES } from '../src/data/color-categories'
import { STYLE_CATEGORIES } from '../src/data/style-categories'
import { TASK_CATEGORIES } from '../src/data/task-categories'
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
  for (const c of [...DOOR_CATEGORIES, ...COLOR_CATEGORIES, ...STYLE_CATEGORIES, ...TASK_CATEGORIES]) {
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

import { fitPhrase, productMetaDescription, compactTrim, TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'
import type { ModelEntry } from '../src/lib/model-entries'

test('fitPhrase: часть добавляется, только если фраза целиком уместилась', () => {
  assert.equal(fitPhrase('Дверь', [['один', ', '], ['очень длинный признак', ', '], ['в Москве', ' ']], 22), 'Дверь, один в Москве')
  assert.equal(fitPhrase('Дверь', [['', ', '], ['в Москве', ' ']], 50), 'Дверь в Москве')
})

test('заголовок модели: не длиннее TITLE_MAX и с «| Студия Зизевского»; голова — тип и бренд', () => {
  const cases = [
    { model: { name: 'Некст НР2', trim: 'Протач' }, seriesName: 'Некст', coatingName: 'Протач', coatingSlug: 'protach' },
    { model: { name: 'Урбан 1', trim: 'Золото' }, seriesName: 'Урбан', coatingName: 'Эмалекс', coatingSlug: 'emalex' },
    { model: { name: 'Барселона 1', trim: null }, seriesName: 'Скинель', coatingName: 'эмаль', coatingSlug: 'emal' },
  ] as never[]
  for (const c of cases) {
    const t = productTitle(c)
    assert.ok(t.length <= TITLE_MAX, `${t.length}: ${t}`)
    assert.ok(t.endsWith(STUDIO), t)
    assert.match(t, /^Межкомнатная дверь ВФД /)
  }
})

test('описание модели: не длиннее DESCRIPTION_MAX, с ценой и салоном', () => {
  const m = { model: { name: 'Некст НР2', trim: 'стекло сатин белый' }, seriesName: 'Некст', seriesSlug: 'next', coatingName: 'Протач', coatingSlug: 'protach', minPrice: 10742, maxPrice: null, colors: [], extraColors: [] } as unknown as ModelEntry
  const d = productMetaDescription(m)
  assert.ok(d.length <= DESCRIPTION_MAX, `${d.length}: ${d}`)
  assert.match(d, /цена 10\s742\s₽ за полотно/)
  assert.match(d, /Салон ВФД в ТЦ «Компас»/)
})

test('заголовок не длиннее 75 знаков даже у самых длинных моделей; короткие формы — там, где полная не влезает', () => {
  const titleOf = (name: string, trim: string | null, coatingName = 'Эмалекс', coatingSlug = 'emalex', seriesName = 'Урбан') =>
    productTitle({ model: { name, trim }, seriesName, coatingName, coatingSlug } as never)
  // Длинное остекление: полная фраза не влезает — остаётся «стекло сатин белый», модель и кромка сохраняются
  const nekst = titleOf('Некст НР2', 'английская решётка, стекло сатин белый', 'Протач', 'protach', 'Некст')
  assert.equal(nekst, `Межкомнатная дверь ВФД Некст НР2, стекло сатин белый${STUDIO}`)
  // Кромка с молдингом: «с молдингом» уходит, цвет кромки остаётся
  assert.equal(titleOf('Штрих 2А', 'Золотая с молдингом'), `Межкомнатная дверь ВФД Урбан Штрих 2А, кромка золотая${STUDIO}`)
  // Название модели само содержит «стекло» и отделку: тип сокращается до «Дверь», бренд и модель остаются
  const glass = titleOf('Эмалекс E1 Флай Сатин Графит стекло', null, 'Эмалекс', 'emalex', 'Эмалекс')
  assert.ok(glass.startsWith('Дверь ВФД Эмалекс E1 Флай Сатин Графит стекло'), glass)
  for (const t of [nekst, glass]) assert.ok(t.length <= TITLE_MAX, `${t.length}: ${t}`)
})

test('compactTrim: убирает описание, сохраняет цвет кромки или последнюю часть остекления', () => {
  assert.equal(compactTrim('кромка золотая с молдингом'), 'кромка золотая')
  assert.equal(compactTrim('английская решётка, стекло сатин белый'), 'стекло сатин белый')
  assert.equal(compactTrim('кромка серебро'), 'кромка серебро')
})
