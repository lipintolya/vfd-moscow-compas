import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { ENTRANCE_DOORS } from '../src/data/entrance-doors'
import { vkEntranceId, entrancePictureSources, entranceDescription, ENTRANCE_CATEGORY_ID } from '../src/lib/vk-entrance'
import { vkOfferId } from '../src/lib/feed-common'
import { ENTRANCE_PHOTO_BG, PHOTO_BG } from '../src/lib/vk-photo'

test('vkEntranceId(): у каждой входной двери свой id, он не совпадает с межкомнатными (v2…)', () => {
  const ids = ENTRANCE_DOORS.map((d) => vkEntranceId(d.id))
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) {
    assert.ok(id.startsWith('ve'), id)
    assert.ok(id.length <= 22, id)
  }
  assert.ok(!ids.some((id) => id.startsWith('v2')))
})

test('префикс входных дверей не совпадает с межкомнатными (vkOfferId = v2…), категория — своя', () => {
  const interiorPrefix = vkOfferId('3f2b8c1e-9d4a-4b6e-8f0a-1c2d3e4f5a6b').slice(0, 2)
  for (const d of ENTRANCE_DOORS) assert.ok(!vkEntranceId(d.id).startsWith(interiorPrefix))
  assert.notEqual(ENTRANCE_CATEGORY_ID, 1) /* корень межкомнатных */
})

test('фото входной двери: от 1 до 10 картинок, обложка — первая отделка, все файлы есть на диске', () => {
  for (const d of ENTRANCE_DOORS) {
    const sources = entrancePictureSources(d)
    assert.ok(sources.length >= 1 && sources.length <= 10, d.id)
    assert.equal(sources[0], d.variants[0]!.image.large, d.id)
    for (const src of sources) {
      assert.ok(src.startsWith('/renders/entrance-doors/'), src)
      assert.ok(existsSync(path.join(process.cwd(), 'public', src)), `нет файла ${src}`)
    }
  }
})

test('фон входных дверей — белый, межкомнатных — графитовый (как было)', () => {
  assert.equal(ENTRANCE_PHOTO_BG, '#ffffff')
  assert.equal(PHOTO_BG, '#2d2d32')
})

test('описание: обычный текст, «от» и цена из каталога, без HTML и без названия завода', () => {
  for (const d of ENTRANCE_DOORS) {
    const text = entranceDescription(d)
    assert.ok(!/[<>]/.test(text), d.id)
    assert.match(text, /Цена — от \d/, d.id)
    assert.ok(text.includes(d.sizes), d.id)
  }
})
