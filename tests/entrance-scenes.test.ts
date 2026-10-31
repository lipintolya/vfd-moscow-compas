import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { DOOR_SCENES, ENTRANCE_HOUSES, sceneAlt, sceneDoor, sceneSection } from '../src/data/entrance-scenes'
import { COVER_SCENE, HOUSE_SCENES, scenesOfDoor } from '../src/lib/entrance-scenes'
import { ENTRANCE_DOORS } from '../src/data/entrance-doors'
import { SITE } from '../src/config/site'

const BRAND = /лабиринт|labirint/i
const onDisk = (path: string) => existsSync(new URL(`../public${path}`, import.meta.url))

test('рендеры «на доме»: у каждого кадра есть модель каталога, исходник и копии', () => {
  const slots = DOOR_SCENES.map((s) => s.slot)
  assert.equal(new Set(slots).size, slots.length, 'повтор имён кадров')
  const sources = readdirSync(new URL('../assets/entrance-renders/', import.meta.url)).map((f) => f.replace(/\.[^.]+$/, ''))
  for (const s of DOOR_SCENES) {
    assert.match(s.slot, /^[a-z0-9-]+$/)
    assert.ok(sceneDoor(s), s.slot)
    assert.ok(sources.includes(s.slot), `${s.slot}: нет исходника в assets/entrance-renders/`)
  }
  for (const s of ENTRANCE_DOORS.flatMap((d) => scenesOfDoor(d.id))) {
    for (const url of s.srcset.split(', ').map((x) => x.split(' ')[0]!)) assert.ok(onDisk(url), url)
    assert.ok(s.width > 0 && s.height > 0 && s.ratio > 0.5 && s.ratio < 2, s.slot)
  }
})

test('рендеры «на доме»: у обложки есть квадратная обрезка под телефон, файлы на месте', () => {
  const crop = COVER_SCENE.crops?.square
  assert.ok(crop, 'нет обрезки «square» — CROPS в scripts/gen-entrance-renders.mjs, затем npm run gen:entrance-renders')
  assert.equal(crop.width, crop.height, 'обрезка не квадратная')
  const urls = crop.srcset.split(', ').map((x) => x.split(' ')[0]!)
  assert.ok(urls.length >= 2)
  for (const url of urls) assert.ok(onDisk(url), url)
})

test('рендеры «на доме»: обложка одна, в ленте она не повторяется, по кадру на модель, от дешёвых к дорогим', () => {
  assert.equal(DOOR_SCENES.filter((s) => s.cover).length, 1)
  assert.ok(HOUSE_SCENES.length > 0)
  assert.ok(HOUSE_SCENES.every((s) => s.door.id !== COVER_SCENE.door.id), 'обложка попала в ленту')
  const doors = HOUSE_SCENES.map((s) => s.door.id)
  assert.equal(new Set(doors).size, doors.length, 'в ленте два кадра одной модели')
  const prices = HOUSE_SCENES.map((s) => s.door.from)
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
  // у Термолаб 2 Про два кадра (горизонтальный и вертикальный): в ленте первый, на странице модели — оба
  assert.equal(scenesOfDoor('termolab-2-pro').length, 2)
  assert.equal(HOUSE_SCENES.find((s) => s.door.id === 'termolab-2-pro')?.slot, 'house-termolab-2-pro')
})

test('рендеры «на доме»: описания картинок — что за модель, что на кадре, чьё; без названий заводов и чужих марок', () => {
  for (const s of DOOR_SCENES) {
    const alt = sceneAlt(s)
    assert.ok(alt.includes(sceneDoor(s).title), alt)
    assert.ok(alt.includes(SITE.studioName), alt)
    assert.ok(alt.length >= 60 && alt.length <= 220, `${alt.length}: ${alt}`)
    assert.doesNotMatch(alt, BRAND, alt)
    // на кадре — только русское описание: латиница в нём — это чья-то марка («BMW»…)
    assert.doesNotMatch(s.what, /[a-z]/i, s.what)
  }
})

test('рендеры «на доме»: тексты блоков без названия завода, цен «по запросу» и пустых мест', () => {
  const door = ENTRANCE_DOORS[0]!
  const texts = [ENTRANCE_HOUSES.title, ENTRANCE_HOUSES.lead, sceneSection(door).title, sceneSection(door).note]
  for (const t of texts) {
    assert.doesNotMatch(t, BRAND, t)
    assert.doesNotMatch(t, /по запросу|undefined|NaN|\[object/, t)
  }
  assert.ok(sceneSection(door).title.includes(door.name))
})
