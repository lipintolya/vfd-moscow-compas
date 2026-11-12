import { test } from 'node:test'
import assert from 'node:assert/strict'
import { catalogThumb, catalogThumbSrcset, CATALOG_THUMB_WIDTHS } from '../src/lib/catalog-thumb'

test('копия фото каталога: путь выводится из исходника', () => {
  assert.equal(catalogThumb('/media/catalog-vfd/emal/flat/flat_2.webp'), '/renders/catalog-thumbs/catalog-vfd/emal/flat/flat_2-560.webp')
  assert.equal(catalogThumb('/media/vfd74ru/catalog/urban/a.webp', 280), '/renders/catalog-thumbs/vfd74ru/catalog/urban/a-280.webp')
  /* пробел в имени закодирован — копия с тем же кодированием, nginx его раскодирует */
  assert.equal(catalogThumb('/media/catalog-vfd/emal/flat/flat_2_polar%20(1).webp'), '/renders/catalog-thumbs/catalog-vfd/emal/flat/flat_2_polar%20(1)-560.webp')
})

test('не каталог (рендер, облако) — исходник без srcset', () => {
  assert.equal(catalogThumb('/media/catalog-vfd/invisible/secret.webp'), '/renders/catalog-thumbs/catalog-vfd/invisible/secret-560.webp')
  assert.equal(catalogThumb('/renders/series/pet-innova-900.webp'), '/renders/series/pet-innova-900.webp')
  assert.equal(catalogThumb('https://storage.yandexcloud.net/x/y.webp'), 'https://storage.yandexcloud.net/x/y.webp')
  assert.equal(catalogThumbSrcset('/renders/series/pet-innova-900.webp'), undefined)
})

test('srcset — все ширины генератора', () => {
  const s = catalogThumbSrcset('/media/catalog-vfd/a.webp')!
  for (const w of CATALOG_THUMB_WIDTHS) assert.ok(s.includes(`-${w}.webp ${w}w`), s)
})
