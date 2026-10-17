import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterCards, sortCards, facetCounts, coatingRank, NO_FILTERS } from '../src/lib/catalog-filter'
import type { CatalogCardItem } from '../src/components/catalog/types'

const card = (id: string, seriesSlug: string, coatingSlug: string, price: number | null, extra: Partial<CatalogCardItem> = {}): CatalogCardItem => ({
  id, slug: id, name: `Модель ${id}`, series: seriesSlug, seriesSlug, coating: coatingSlug, coatingSlug,
  colorName: 'Белый', colorHex: '#fff', trim: '', colorNames: ['Белый'], colorSwatches: [],
  photo: '', price, hasGlass: false, isNew: false, ...extra,
})

const cards = [
  card('cheap', 'next', 'protach', 5000),
  card('emalex', 'emalex', 'emalex', 6857),
  card('ud-2', 'urban-drevesnyy', 'ekoshpon', 17750),
  card('ud-1', 'urban-drevesnyy', 'ekoshpon', 16610),
  card('basic', 'basic', 'emalex', 9000, { colorNames: ['Белый', 'Графит'], hasGlass: true }),
  card('noprice', 'next', 'protach', null),
]

test('«Популярные»: Урбан Древесный открывает каталог, дальше популярные серии, потом остальные — по цене', () => {
  assert.deepEqual(sortCards(cards, 'popular').map((c) => c.id), ['ud-1', 'ud-2', 'emalex', 'cheap', 'basic', 'noprice'])
})

test('цена по возрастанию и убыванию: модели без цены — в конце', () => {
  assert.deepEqual(sortCards(cards, 'price_asc').map((c) => c.id), ['cheap', 'emalex', 'basic', 'ud-1', 'ud-2', 'noprice'])
  assert.deepEqual(sortCards(cards, 'price_desc').map((c) => c.id), ['ud-2', 'ud-1', 'basic', 'emalex', 'cheap', 'noprice'])
})

test('фильтры складываются: покрытие + цвет + стекло', () => {
  const f = { ...NO_FILTERS, coating: 'emalex', color: 'Графит', glass: true }
  assert.deepEqual(filterCards(cards, f).map((c) => c.id), ['basic'])
})

test('поиск — по названию, серии, покрытию и цвету, без учёта регистра', () => {
  assert.deepEqual(filterCards(cards, { ...NO_FILTERS, query: 'ГРАФИТ' }).map((c) => c.id), ['basic'])
  assert.deepEqual(filterCards(cards, { ...NO_FILTERS, query: 'ekoshpon' }).map((c) => c.id), ['ud-2', 'ud-1'])
})

test('счётчики покрытий не учитывают выбранное покрытие, но учитывают остальные фильтры', () => {
  const f = { ...NO_FILTERS, coating: 'emalex', color: 'Белый' }
  assert.deepEqual(Object.fromEntries(facetCounts(cards, f, 'coating')), { protach: 2, emalex: 2, ekoshpon: 2 })
  assert.deepEqual(Object.fromEntries(facetCounts(cards, f, 'series')), { emalex: 1, basic: 1 })
  assert.deepEqual(Object.fromEntries(facetCounts(cards, { ...NO_FILTERS, coating: 'emalex' }, 'color')), { 'Белый': 2, 'Графит': 1 })
})

test('порядок покрытий: экошпон первым, неизвестное — в конце', () => {
  assert.ok(coatingRank('ekoshpon') < coatingRank('emalex'))
  assert.ok(coatingRank('emalex') < coatingRank('pet'))
  assert.ok(coatingRank('pet') < coatingRank('novoe'))
})

import { modelStatus } from '../src/lib/made-to-order'

test('статус на карточке: наличие важнее новизны, «Под заказ» — у серий под заказ', () => {
  assert.equal(modelStatus({ id: '4fc7a08a-9216-4b29-a6d4-3473517e897c', seriesSlug: 'tehno', isNew: true }, 'Эмалекс белый'), 'stock')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'emalex', isNew: true }, 'Белый'), 'new')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'urban-drevesnyy', isNew: false }, 'Шервуд бурбон'), 'order')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'emalex', isNew: false }, 'Белый'), null)
})

import { byLightness } from '../src/lib/catalog-filter'

test('цвета в фильтре — от светлых к тёмным, похожие оттенки рядом', () => {
  const colors = ['#3a2a20', '#ffffff', '#808080', '#f5f0e6', 'не цвет'].map((color) => ({ color }))
  assert.deepEqual([...colors].sort(byLightness).map((c) => c.color), ['#ffffff', '#f5f0e6', '#808080', '#3a2a20', 'не цвет'])
})
