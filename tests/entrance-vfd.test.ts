import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  VFD_MODELS, VFD_SKINS, VFD_SECTION, VFD_FAQ, VFD_MIN_PRICE, optionsOf, modelFrom, skinLabel, fromText, vfdAsk, vfdPageTitle, vfdDescription, vfdHref,
} from '../src/data/entrance-vfd'
import { outsideOf, renderOf, skinImage } from '../src/lib/entrance-vfd'
import { initialState, settle, headHtml, stageImage, askText, specsHtml, hardwareHtml, optionOf } from '../src/lib/vfd-view'

import { TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'
import { brandTitle } from '../src/lib/seo-title'
const BRAND = /лабиринт|labirint/i
// на сайт не должны попасть следы чужого города и сайта-источника
const FOREIGN = /челябинск|vfd74/i
const onDisk = (path: string) => existsSync(new URL(`../public${path}`, import.meta.url))
const urls = (srcset: string) => srcset.split(', ').map((x) => x.split(' ')[0]!)

test('входные двери VFD: у каждой модели есть накладки, ступени цены без повторов, накладки из общего списка', () => {
  assert.ok(VFD_MODELS.length >= 9)
  const ids = VFD_MODELS.map((m) => m.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const m of VFD_MODELS) {
    assert.match(m.id, /^[a-z0-9-]+$/)
    assert.ok(m.specs.length >= 10 && m.hardware.length >= 1, m.id)
    const options = optionsOf(m)
    assert.ok(options.length >= 1, m.id)
    assert.equal(new Set(options.map((o) => o.skin.id)).size, options.length, `${m.id}: накладка дважды`)
    assert.equal(modelFrom(m), Math.min(...options.map((o) => o.price)), m.id)
  }
  const skinIds = VFD_SKINS.map((s) => s.id)
  assert.equal(new Set(skinIds).size, skinIds.length)
})

test('входные двери VFD: цены — ровные сотни и правдоподобные, «от» с неразрывным пробелом', () => {
  for (const m of VFD_MODELS) {
    for (const t of m.tiers) {
      assert.equal(t.price % 100, 0, `${m.id}: ${t.price}`)
      assert.ok(t.price >= 25_000 && t.price <= 150_000, `${m.id}: ${t.price}`)
    }
  }
  assert.equal(VFD_MIN_PRICE, Math.min(...VFD_MODELS.map(modelFrom)))
  assert.match(fromText(33_400), /^от 33 400 ₽$/)
})

test('входные двери VFD: фото на диске — дверь снаружи, в интерьере и каждая накладка', () => {
  for (const m of VFD_MODELS) {
    for (const img of [outsideOf(m.id), renderOf(m.id)]) for (const u of urls(img.srcset)) assert.ok(onDisk(u), u)
  }
  for (const s of VFD_SKINS) for (const u of urls(skinImage(s.id).srcset)) assert.ok(onDisk(u), u)
})

test('входные двери VFD: тексты без названия завода, чужого города и «по запросу»', () => {
  const texts = [
    VFD_SECTION.title, VFD_SECTION.lead, VFD_SECTION.meta, VFD_SECTION.priceNote,
    ...VFD_FAQ.flatMap((f) => [f.q, f.a]),
    ...VFD_MODELS.flatMap((m) => [m.name, m.tagline, m.description, ...m.specs.flatMap((s) => [s.label, s.value]), ...m.hardware]),
    ...VFD_SKINS.map(skinLabel),
  ]
  for (const t of texts) {
    assert.doesNotMatch(t, BRAND, t)
    assert.doesNotMatch(t, FOREIGN, t)
    assert.doesNotMatch(t, /по запросу|undefined|NaN|\[object/, t)
  }
  // название не перегружено: «VFD» один раз
  assert.equal((VFD_SECTION.title.match(/VFD/g) ?? []).length, 1)
  assert.match(VFD_SECTION.title, /накладк/)
})

test('входные двери VFD: подпись блока и цифры считаются из данных', () => {
  assert.ok(VFD_SECTION.meta.includes(String(VFD_MODELS.length)))
  assert.ok(VFD_SECTION.meta.includes(String(VFD_SKINS.length)))
  assert.ok(VFD_FAQ.some((f) => f.a.includes(String(VFD_SKINS.length))))
  assert.ok(VFD_FAQ.some((f) => f.a.includes(fromText(VFD_MIN_PRICE).replace('от ', ''))))
})

test('входные двери VFD: выбор — накладка сохраняется при смене модели, иначе первая; сообщение менеджеру с моделью, накладкой и ценой', () => {
  const start = initialState('balancetwin')
  assert.equal(start.view, 'outside')
  const other = VFD_MODELS.find((m) => m.id !== start.model)!
  const kept = settle(other.id, start.skin, 'inside')
  assert.equal(kept.skin, start.skin)
  // у Ричмонд Термо одна накладка — любая прежняя заменяется ею
  const rich = settle('richmondtermo', start.skin, 'outside')
  assert.equal(rich.skin, 'richmond-white')
  for (const m of VFD_MODELS) {
    for (const o of optionsOf(m)) {
      const s = settle(m.id, o.skin.id, 'inside')
      assert.equal(optionOf(s).price, o.price)
      const ask = askText(s)
      assert.ok(ask.includes(m.name) && ask.includes(skinLabel(o.skin)) && ask.includes(fromText(o.price)), ask)
      assert.equal(ask, vfdAsk(m, o))
    }
  }
})

test('входные двери VFD: разметка выбора — все модели в ленте, накладки текущей серии, экранирование', () => {
  const s = initialState('optima')
  const head = headHtml(s)
  assert.ok(head.includes(`aria-pressed="true"`))
  for (const m of VFD_MODELS) {
    assert.ok(specsHtml(m).includes('vfd__row') && hardwareHtml(m).includes('<li>'))
    for (const view of ['outside', 'render', 'inside'] as const) {
      const first = optionsOf(m)[0]!
      const img = stageImage(settle(m.id, first.skin.id, view))
      assert.ok(img.alt.includes('Студия Зизевского') && img.srcset.length > 20, `${m.id} ${view}`)
    }
  }
  // данные не должны открывать теги: всё, что выводится в разметку, экранировано
  assert.equal(head.includes('<script'), false)
})

test('входные двери VFD: у каждой модели своя страница — адрес, заголовок и описание в лимитах поисковика, без повторов', () => {
  const titles = VFD_MODELS.map((m) => brandTitle(vfdPageTitle(m)))
  for (const [i, m] of VFD_MODELS.entries()) {
    assert.match(vfdHref(m), /^\/catalog\/vhodnye-dveri\/vfd\/[a-z0-9-]+\/$/)
    assert.ok(titles[i]!.length <= TITLE_MAX, `${titles[i]!.length}: ${titles[i]}`)
    assert.ok(vfdDescription(m).length <= DESCRIPTION_MAX && vfdDescription(m).includes(m.name), vfdDescription(m))
    assert.doesNotMatch(vfdDescription(m), FOREIGN)
  }
  assert.equal(new Set(titles).size, titles.length, 'повтор заголовков')
  assert.equal(new Set(VFD_MODELS.map(vfdHref)).size, VFD_MODELS.length)
})
