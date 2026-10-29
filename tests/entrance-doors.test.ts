import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  ENTRANCE_DOORS, ENTRANCE_PAGE, ENTRANCE_FAQ, DOOR_GROUPS, doorTitle, doorDescription, VARIANTS_SHOWN,
} from '../src/data/entrance-doors'
import { TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'
import { brandTitle } from '../src/lib/seo-title'

const BRAND = /лабиринт|labirint/i

test('входные двери: название завода нигде не выводится', () => {
  const texts = [
    ENTRANCE_PAGE.title, ENTRANCE_PAGE.h1, ENTRANCE_PAGE.description, ENTRANCE_PAGE.lead,
    ...ENTRANCE_FAQ.flatMap((f) => [f.q, f.a]),
    ...DOOR_GROUPS.flatMap((g) => [g.nav, g.title, g.lead]),
    ...ENTRANCE_DOORS.flatMap((d) => [
      d.id, d.name, d.title, d.href, d.request, doorTitle(d), doorDescription(d),
      ...d.specs.flatMap((s) => [s.label, s.value]),
      ...d.variants.flatMap((v) => [v.name, v.image.src, v.image.srcset, v.image.large, v.image.alt]),
    ]),
  ]
  for (const t of texts) assert.doesNotMatch(t, BRAND, t)
})

test('входные двери: цен на сайте нет — только «по запросу»', () => {
  const texts = [
    ENTRANCE_PAGE.description, ENTRANCE_PAGE.lead,
    ...ENTRANCE_FAQ.map((f) => f.a),
    ...ENTRANCE_DOORS.flatMap((d) => [doorDescription(d), ...d.specs.map((s) => s.value), ...d.variants.map((v) => v.name)]),
  ]
  for (const t of texts) assert.doesNotMatch(t, /\d[\d\s]*\s?(₽|руб)/i, t)
})

test('входные двери: заголовки и описания — в лимитах поисковика и без повторов', () => {
  const page = brandTitle(ENTRANCE_PAGE.title)
  assert.ok(page.length <= TITLE_MAX, `${page.length}: ${page}`)
  assert.ok(ENTRANCE_PAGE.description.length <= DESCRIPTION_MAX, `${ENTRANCE_PAGE.description.length}`)
  const titles = ENTRANCE_DOORS.map((d) => brandTitle(doorTitle(d)))
  for (const t of titles) assert.ok(t.length <= TITLE_MAX, `${t.length}: ${t}`)
  assert.equal(new Set(titles).size, titles.length, 'повтор заголовков')
  for (const d of ENTRANCE_DOORS) assert.ok(doorDescription(d).length <= DESCRIPTION_MAX, `${d.id}: ${doorDescription(d).length}`)
  const ids = ENTRANCE_DOORS.map((d) => d.id)
  assert.equal(new Set(ids).size, ids.length, 'повтор адресов')
})

test('входные двери: у каждой модели фото, размеры и характеристики; файлы на месте', () => {
  for (const d of ENTRANCE_DOORS) {
    assert.match(d.id, /^[a-z0-9-]+$/)
    assert.ok(d.variants.length >= 1 && d.variants.length <= VARIANTS_SHOWN, d.id)
    assert.ok(d.specs.length >= 8, `${d.id}: характеристик ${d.specs.length}`)
    assert.ok(d.specs.some((s) => s.label === 'Основной замок'), d.id)
    for (const v of d.variants) {
      assert.ok(existsSync(new URL(`../public${v.image.large}`, import.meta.url)), v.image.large)
      assert.ok(v.image.alt.length >= 20, v.image.alt)
    }
  }
})

test('входные двери: каждая группа не пуста', () => {
  for (const g of DOOR_GROUPS) assert.ok(ENTRANCE_DOORS.some((d) => d.group === g.id), g.id)
})
