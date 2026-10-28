import { test } from 'node:test'
import assert from 'node:assert/strict'
import { xml, offerId, feedOffers, categoriesXml, COATING_CATEGORY_IDS, ROOT_CATEGORY_ID } from '../src/lib/feed-common'
import type { ModelEntry } from '../src/lib/model-entries'

test('xml(): экранирует спецсимволы — название с кавычками и амперсандом не ломает фид', () => {
  assert.equal(xml('«А» & <Б>'), '«А» &amp; &lt;Б&gt;')
  assert.equal(xml('"x" \'y\''), '&quot;x&quot; &apos;y&apos;')
})

test('offerId(): постоянный id до 20 символов без дефисов', () => {
  const id = offerId('3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b')
  assert.equal(id, '3f2b8c1e9d4a4b6e8f0a')
  assert.ok(id.length <= 20)
})

test('feedOffers(): без цены или без фото модель в фид не идёт', () => {
  const ok = { model: { id: 'a' }, minPrice: 1000, colors: [{ photo: 'x.webp' }] } as unknown as ModelEntry
  const noPrice = { ...ok, minPrice: null } as unknown as ModelEntry
  const noPhoto = { ...ok, colors: [] } as unknown as ModelEntry
  assert.deepEqual(feedOffers([ok, noPrice, noPhoto]), [ok])
})

test('categoriesXml(): корневая категория и покрытия, в которых есть товары; неизвестное покрытие — в корень', () => {
  const offer = (coatingSlug: string) => ({ coatingSlug, model: { id: 'm' }, colors: [], minPrice: 1 }) as unknown as ModelEntry
  const lines = categoriesXml([offer('emalex'), offer('pet'), offer('novoe')], (e) => e.coatingSlug)
  assert.equal(lines.length, 3)
  assert.match(lines[0]!, new RegExp(`<category id="${ROOT_CATEGORY_ID}">`))
  assert.match(lines[1]!, new RegExp(`<category id="${COATING_CATEGORY_IDS.pet}" parentId="${ROOT_CATEGORY_ID}">`))
  assert.match(lines[2]!, new RegExp(`<category id="${COATING_CATEGORY_IDS.emalex}" parentId="${ROOT_CATEGORY_ID}">`))
})
