import { test } from 'node:test'
import assert from 'node:assert/strict'
import { colorFamily, COLOR_FAMILIES } from '../src/data/color-families'

/* Все цвета из Supabase (colors) на 17.10.2026: название и hex_preview */
const DB_COLORS: [string, string][] = [
  ['Белый', '#F5F5F0'], ['Мокко', '#8B6F5C'], ['Пекан ванильный', '#e7e8e2'], ['Пекан дымчатый', '#837b72'],
  ['Пекан стальной', '#6c6e70'], ['Пекан таёжный', '#5c5347'], ['Серый', '#9B9B93'], ['Шёлковый бежевый', '#E8D5B7'],
  ['Шёлковый белый', '#F5F5F0'], ['Шёлковый графит', '#4A4A4A'], ['Шёлковый индиго', '#3D4B6B'], ['Шёлковый муссон', '#8B9EA8'],
  ['Шервуд бурбон', '#362b23'], ['Шервуд вишня', '#7d6b5c'], ['Шервуд солярис', '#a6947a'], ['Шервуд янтарь', '#6d6152'],
  ['Шоколад', '#4A2E1E'], ['Эмалекс бежевый', '#D4B896'], ['Эмалекс белый', '#FAFAFA'], ['Эмалекс голубой', '#a7b8c0'],
  ['Эмалекс графит', '#3C3C3C'], ['Эмалекс зелёный', '#86928e'], ['Эмалекс молочный', '#FFF8E7'], ['Эмалекс серый', '#9E9E9E'],
  ['Эмалекс тёмно-бежевый', '#a9a296'], ['Эмаль белая', '#FFFFFF'], ['Эмаль графит', '#555555'], ['Эмаль магнолия', '#F0EAD6'],
  ['Эмаль мокко', '#7B5B3A'], ['Эмаль серая', '#B0B0B0'], ['Эмаль серебро', '#C0C0C0'], ['Эмаль слоновая кость', '#FFFFF0'],
]

const familyOf = (name: string) => colorFamily(name, DB_COLORS.find(([n]) => n === name)![1])

test('каждый цвет из базы попадает в группу, а не в «другие»', () => {
  for (const [name] of DB_COLORS) assert.notEqual(familyOf(name), 'other', name)
})

test('белые — все «белые» названия покрытий, но не тёмно-бежевый и не молочные', () => {
  const white = DB_COLORS.map(([n]) => n).filter((n) => familyOf(n) === 'white')
  assert.deepEqual(white, ['Белый', 'Шёлковый белый', 'Эмалекс белый', 'Эмаль белая'])
  assert.equal(familyOf('Эмалекс тёмно-бежевый'), 'beige')
  assert.equal(familyOf('Эмаль слоновая кость'), 'milky')
})

test('древесные делятся на светлые и тёмные по тону, а не по названию', () => {
  assert.equal(familyOf('Пекан ванильный'), 'wood-light')
  assert.equal(familyOf('Шервуд солярис'), 'wood-light')
  assert.equal(familyOf('Шервуд бурбон'), 'wood-dark')
  assert.equal(familyOf('Пекан стальной'), 'wood-dark')
})

test('графит отдельно от серых, мокко и шоколад вместе', () => {
  assert.equal(familyOf('Эмаль графит'), 'graphite')
  assert.equal(familyOf('Эмаль серебро'), 'grey')
  assert.equal(familyOf('Шёлковый муссон'), 'grey')
  assert.equal(familyOf('Шоколад'), 'brown')
  assert.equal(familyOf('Эмаль мокко'), 'brown')
  assert.equal(familyOf('Шёлковый индиго'), 'colored')
})

test('новый цвет без подходящих слов не теряется — группа «другие» есть в списке', () => {
  assert.equal(colorFamily('Эмалекс терракота', '#c0603a'), 'other')
  assert.ok(COLOR_FAMILIES.some((f) => f.slug === 'other'))
})
