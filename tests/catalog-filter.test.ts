import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  filterCards, sortCards, facetCounts, coatingRank, NO_FILTERS, PRICE_BUCKETS,
  parseFilterParams, filterParamsString, CATALOG_URL_PARAMS,
} from '../src/lib/catalog-filter'
import { modelStatus } from '../src/lib/made-to-order'
import type { CatalogCardItem } from '../src/components/catalog/types'
import type { ColorFamilySlug } from '../src/data/color-families'

const card = (id: string, seriesSlug: string, coatingSlug: string, price: number | null, extra: Partial<CatalogCardItem> = {}): CatalogCardItem => ({
  id, slug: id, name: `Модель ${id}`, series: seriesSlug, seriesSlug, coating: coatingSlug, coatingSlug,
  colorName: 'Белый', colorHex: '#fff', trim: '', colorNames: ['Белый'], colorFamilies: ['white'], colorSwatches: [],
  photo: '', price, hasGlass: false, isNew: false, ...extra,
})

const cards = [
  card('cheap', 'next', 'protach', 5000),
  card('emalex', 'emalex', 'emalex', 6857),
  card('ud-2', 'urban-drevesnyy', 'ekoshpon', 17750, { colorFamilies: ['wood-dark'] }),
  card('ud-1', 'urban-drevesnyy', 'ekoshpon', 16610, { colorFamilies: ['wood-light', 'wood-dark'] }),
  card('basic', 'basic', 'emalex', 12000, { colorFamilies: ['white', 'graphite'], hasGlass: true }),
  card('noprice', 'next', 'protach', null),
]
const ids = (list: CatalogCardItem[]) => list.map((c) => c.id)
const f = (patch: Partial<typeof NO_FILTERS>) => ({ ...NO_FILTERS, ...patch })

test('«Популярные»: Урбан Древесный открывает каталог, дальше популярные серии, потом остальные — по цене', () => {
  assert.deepEqual(ids(sortCards(cards, 'popular')), ['ud-1', 'ud-2', 'emalex', 'cheap', 'basic', 'noprice'])
})

test('цена по возрастанию и убыванию: модели без цены — в конце', () => {
  assert.deepEqual(ids(sortCards(cards, 'price_asc')), ['cheap', 'emalex', 'basic', 'ud-1', 'ud-2', 'noprice'])
  assert.deepEqual(ids(sortCards(cards, 'price_desc')), ['ud-2', 'ud-1', 'basic', 'emalex', 'cheap', 'noprice'])
})

test('внутри фильтра — «или», между фильтрами — «и»', () => {
  assert.deepEqual(ids(filterCards(cards, f({ series: ['emalex', 'basic'] }))), ['emalex', 'basic'])
  assert.deepEqual(ids(filterCards(cards, f({ series: ['emalex', 'basic'], colors: ['graphite'] }))), ['basic'])
  assert.deepEqual(ids(filterCards(cards, f({ colors: ['wood-light', 'graphite'] }))), ['ud-1', 'basic'])
})

test('цвет — по группе: «тёмное дерево» находит модель, у которой есть и светлое, и тёмное', () => {
  assert.deepEqual(ids(filterCards(cards, f({ colors: ['wood-dark'] }))), ['ud-2', 'ud-1'])
})

test('цена — по диапазонам, без цены в диапазон не попадает', () => {
  const [low, mid, high] = PRICE_BUCKETS.map((b) => b.slug)
  assert.deepEqual(ids(filterCards(cards, f({ prices: [low!] }))), ['cheap', 'emalex'])
  assert.deepEqual(ids(filterCards(cards, f({ prices: [mid!] }))), ['basic'])
  assert.deepEqual(ids(filterCards(cards, f({ prices: [low!, high!] }))), ['cheap', 'emalex', 'ud-2', 'ud-1'])
})

test('остекление: со стеклом, без стекла, оба — все', () => {
  assert.deepEqual(ids(filterCards(cards, f({ glass: ['with'] }))), ['basic'])
  assert.equal(filterCards(cards, f({ glass: ['without'] })).length, 5)
  assert.equal(filterCards(cards, f({ glass: ['with', 'without'] })).length, 6)
})

test('счётчики варианта не учитывают свой же фильтр, но учитывают остальные', () => {
  const state = f({ coating: 'emalex', series: ['emalex'] })
  assert.deepEqual(Object.fromEntries(facetCounts(cards, state, 'series')), { emalex: 1, basic: 1 })
  assert.deepEqual(Object.fromEntries(facetCounts(cards, state, 'coating')), { emalex: 1 })
  assert.deepEqual(Object.fromEntries(facetCounts(cards, f({ coating: 'emalex' }), 'colors')), { white: 2, graphite: 1 })
})

test('адрес ↔ фильтры: туда и обратно без потерь', () => {
  const state = f({ coating: 'emal', series: ['skinel', 'winter'], colors: ['white', 'grey'], prices: [PRICE_BUCKETS[0]!.slug], glass: ['with'] })
  const qs = filterParamsString(state)
  assert.deepEqual(parseFilterParams(new URLSearchParams(qs), () => null), state)
  assert.equal(filterParamsString(NO_FILTERS), '')
})

test('старые ссылки: ?color=<название цвета> и ?glass=1 продолжают работать', () => {
  const family = (name: string): ColorFamilySlug | null => (name === 'Эмаль белая' ? 'white' : null)
  const state = parseFilterParams(new URLSearchParams('color=Эмаль белая&glass=1&series=urban'), family)
  assert.deepEqual(state.colors, ['white'])
  assert.deepEqual(state.glass, ['with'])
  assert.deepEqual(state.series, ['urban'])
  assert.deepEqual(parseFilterParams(new URLSearchParams('color=неизвестный&price=мусор'), family), NO_FILTERS)
})

test('порядок покрытий: экошпон первым, неизвестное — в конце', () => {
  assert.ok(coatingRank('ekoshpon') < coatingRank('emalex'))
  assert.ok(coatingRank('emalex') < coatingRank('pet'))
  assert.ok(coatingRank('pet') < coatingRank('novoe'))
})

test('статус на карточке: наличие важнее новизны, «Под заказ» — у серий под заказ', () => {
  assert.equal(modelStatus({ id: '4fc7a08a-9216-4b29-a6d4-3473517e897c', seriesSlug: 'tehno', isNew: true }, 'Эмалекс белый'), 'stock')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'emalex', isNew: true }, 'Белый'), 'new')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'urban-drevesnyy', isNew: false }, 'Шервуд бурбон'), 'order')
  assert.equal(modelStatus({ id: 'x', seriesSlug: 'emalex', isNew: false }, 'Белый'), null)
})

test('CATALOG_URL_PARAMS — ровно те параметры, что пишут фильтры (robots.txt Clean-param)', () => {
  const all = f({ coating: 'emal', series: ['a'], colors: ['white'], prices: [PRICE_BUCKETS[0]!.slug], glass: ['with'] })
  const written = [...new URLSearchParams(filterParamsString(all)).keys()]
  assert.deepEqual([...written].sort(), [...CATALOG_URL_PARAMS].sort())
})
