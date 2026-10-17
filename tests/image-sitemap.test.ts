import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-expect-error — .mjs без типов
import { pageImages, addImagesToSitemap } from '../src/integrations/image-sitemap.mjs'

const SITE = 'https://dveriziz.ru'

test('с страницы берутся фото с подписью; украшения (alt=""), значки и чужие адреса — нет', () => {
  const html = `
    <img src="/media/a.webp" alt="Белая дверь">
    <img src="/media/a.webp" alt="Та же — второй раз">
    <img alt="Скрытая дверь" class="x" src="/renders/b.jpg?v=1">
    <img src="/renders/c.webp" alt="">
    <img src="/media/d.webp">
    <img src="/svg/icon.svg" alt="Значок">
    <img src="https://storage.yandexcloud.net/x.webp" alt="Чужое">`
  assert.deepEqual(pageImages(html, SITE), ['https://dveriziz.ru/media/a.webp', 'https://dveriziz.ru/renders/b.jpg?v=1'])
})

test('фото дописываются к своей странице в карте сайта, без повторов', () => {
  const xml = '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
    + '<url><loc>https://dveriziz.ru/</loc></url>'
    + '<url><loc>https://dveriziz.ru/models/x/</loc><image:image><image:loc>https://dveriziz.ru/media/m.webp</image:loc></image:image></url></urlset>'
  const out = addImagesToSitemap(xml, new Map([
    ['https://dveriziz.ru/', ['https://dveriziz.ru/media/a.webp?w=1&h=2']],
    ['https://dveriziz.ru/models/x/', ['https://dveriziz.ru/media/m.webp', 'https://dveriziz.ru/media/n.webp']],
  ]))
  assert.match(out, /<loc>https:\/\/dveriziz\.ru\/<\/loc><image:image><image:loc>https:\/\/dveriziz\.ru\/media\/a\.webp\?w=1&amp;h=2<\/image:loc><\/image:image><\/url>/)
  assert.equal(out.match(/m\.webp/g)!.length, 1)
  assert.match(out, /n\.webp/)
})

test('пространство имён картинок добавляется, если его не было', () => {
  const xml = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://dveriziz.ru/</loc></url></urlset>'
  assert.match(addImagesToSitemap(xml, new Map([['https://dveriziz.ru/', ['https://dveriziz.ru/a.webp']]])), /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/)
})

// @ts-expect-error — .mjs без типов
import { assignImages } from '../src/integrations/image-sitemap.mjs'

test('каждое фото — у одной страницы, где оно встретилось первым; уже указанные в карте не повторяются', () => {
  const pages: [string, string[]][] = [
    ['/', ['mall.webp', 'hero.webp']],
    ['/models/a/', ['a.webp', 'nalichnik.webp', 'mall.webp']],
    ['/models/b/', ['b.webp', 'nalichnik.webp']],
  ]
  const out = assignImages(pages, new Set(['a.webp']))
  assert.deepEqual([...out], [
    ['/', ['mall.webp', 'hero.webp']],
    ['/models/a/', ['nalichnik.webp']],
    ['/models/b/', ['b.webp']],
  ])
})
