import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { setPhotos, photoByN, type PhotoSetJson } from '../src/lib/photo-set'
import { FOUNDER_SLIDES, FACTORY, SHOWROOM, INSTALL_CONTROL } from '../src/data/about-page'
import { SALON } from '../src/data/contacts-page'
import showroomJson from '../src/data/showroom-photos.json'
import salonJson from '../src/data/salon-photos.json'
import factoryJson from '../src/data/about-factory-photos.json'
import founderJson from '../src/data/founder-photos.json'
import installJson from '../src/data/install-photos.json'

const SET: PhotoSetJson = {
  base: '/renders/about/demo',
  photos: [
    { n: 1, hash: 'abcdef12', widths: [480, 900], width: 900, height: 1200 },
    { n: 2, hash: '12345678', widths: [480, 853], width: 853, height: 1280 },
  ],
}

test('setPhotos: имя файла — набор, номер, хеш, ширина; srcset — настоящие ширины', () => {
  const [a, b] = setPhotos(SET, { 1: 'Первый', 2: 'Второй' })
  assert.equal(a!.src, '/renders/about/demo-1-abcdef12-480.webp')
  assert.equal(a!.srcset, '/renders/about/demo-1-abcdef12-480.webp 480w, /renders/about/demo-1-abcdef12-900.webp 900w')
  assert.equal(a!.large, '/renders/about/demo-1-abcdef12-900.webp')
  assert.equal(b!.srcset.endsWith('demo-2-12345678-853.webp 853w'), true)
  assert.deepEqual([b!.width, b!.height, b!.alt], [853, 1280, 'Второй'])
})

test('setPhotos: кадр без подписи и подпись к несуществующему кадру — ошибка сборки', () => {
  assert.throws(() => setPhotos(SET, { 1: 'Первый' }), /нет подписи к кадру 2/)
  assert.throws(() => setPhotos(SET, { 1: 'Первый', 2: 'Второй', 3: 'Лишний' }), /кадрам 3, которых нет/)
})

test('photoByN: нет кадра — ошибка с именем набора', () => {
  assert.throws(() => photoByN(setPhotos(SET, { 1: 'А', 2: 'Б' }), 7, 'demo'), /«demo»: нет кадра 7/)
})

test('фото «О нас» и «Контактов» — все копии из srcset и крупный кадр лежат в public/', () => {
  const photos = [...SHOWROOM.photos, ...FACTORY.photos, ...FOUNDER_SLIDES, INSTALL_CONTROL.photo, ...SALON.photos]
  for (const p of photos) {
    const files = [p.src, ...p.srcset.split(', ').map((s) => s.split(' ')[0]!), ...('large' in p ? [p.large] : [])]
    for (const f of files) assert.ok(existsSync(`public${f}`), `нет файла public${f}`)
    assert.ok(p.alt.length > 0 && p.width > 0 && p.height > 0)
  }
})

test('наборы: в public/ нет копий, которых нет в JSON (генератор убирает старые)', () => {
  for (const set of [showroomJson, salonJson, factoryJson, founderJson, installJson] as PhotoSetJson[]) {
    const dir = set.base.slice(0, set.base.lastIndexOf('/'))
    const name = set.base.slice(dir.length + 1)
    const own = new RegExp(`^${name}-\\d+-[0-9a-f]{8}-\\d+\\.webp$`)
    const onDisk = readdirSync(`public${dir}`).filter((f) => own.test(f)).sort()
    const expected = set.photos.flatMap((p) => p.widths.map((w) => `${name}-${p.n}-${p.hash}-${w}.webp`)).sort()
    assert.deepEqual(onDisk, expected, `набор ${name}: запустите npm run gen:photos`)
  }
})

test('галерея салона: первые кадры — вход, плашка «Вход» на первом, превью не длиннее галереи', () => {
  assert.equal(SALON.photos[0]!.chip, 'Вход')
  assert.ok(SALON.photos.slice(0, 2).every((p) => p.src.startsWith('/renders/contacts/salon-')))
  assert.ok(SALON.previewCount <= SALON.photos.length)
  assert.ok(SHOWROOM.previewCount <= SHOWROOM.photos.length)
})
