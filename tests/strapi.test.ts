import { test } from 'node:test'
import assert from 'node:assert/strict'
import { strapiFetchAll, strapiImage } from '../src/lib/strapi'

const env = { STRAPI_URL: 'http://cms.test', STRAPI_TOKEN: 'secret' }
const page = (data: unknown[], p: number, pageCount: number) =>
  new Response(JSON.stringify({ data, meta: { pagination: { page: p, pageCount } } }), { status: 200 })

test('забирает все страницы, только опубликованное, с ключом', async () => {
  const calls: string[] = []
  const fetch = async (url: string | URL, init?: RequestInit) => {
    calls.push(String(url))
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer secret')
    const p = Number(new URL(String(url)).searchParams.get('pagination[page]'))
    return page([{ id: p }], p, 2)
  }
  const all = await strapiFetchAll<{ id: number }>('works', { 'populate': '*' }, { fetch: fetch as typeof globalThis.fetch, env })
  assert.deepEqual(all.map((x) => x.id), [1, 2])
  for (const u of calls) {
    assert.equal(new URL(u).searchParams.get('status'), 'published')
    assert.equal(new URL(u).searchParams.get('populate'), '*')
  }
})

test('Strapi не запущен — понятная ошибка', async () => {
  const fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(strapiFetchAll('works', {}, { fetch: fetch as typeof globalThis.fetch, env }),
    /Strapi недоступен по адресу http:\/\/cms\.test — запустите npm run cms/)
})

test('ответ с ошибкой — код и коллекция в тексте', async () => {
  const fetch = async () => new Response('{"error":{"message":"Forbidden"}}', { status: 403 })
  await assert.rejects(strapiFetchAll('works', {}, { fetch: fetch as typeof globalThis.fetch, env }), /works: HTTP 403/)
})

test('нет ключа в .env — подсказка', async () => {
  await assert.rejects(strapiFetchAll('works', {}, { env: { STRAPI_URL: 'http://cms.test' } }),
    /STRAPI_TOKEN/)
})

test('фото: srcset из копий Strapi, src — не оригинал 6000 px', () => {
  const img = strapiImage({
    url: '/uploads/big.jpg', width: 6000, height: 4000, alternativeText: 'Дверь',
    formats: {
      small: { url: '/uploads/small_big.jpg', width: 640, height: 427 },
      large: { url: '/uploads/large_big.jpg', width: 1280, height: 853 },
      xlarge: { url: '/uploads/xlarge_big.jpg', width: 1920, height: 1280 },
      thumbnail: { url: '/uploads/thumbnail_big.jpg', width: 234, height: 156 },
    },
  }, 1280)
  assert.equal(img.src, '/uploads/large_big.jpg')
  assert.equal(img.srcset, '/uploads/thumbnail_big.jpg 234w, /uploads/small_big.jpg 640w, /uploads/large_big.jpg 1280w, /uploads/xlarge_big.jpg 1920w')
  assert.equal(img.width, 1280)
  assert.equal(img.alt, 'Дверь')
})

test('фото без копий — оригинал', () => {
  const img = strapiImage({ url: '/uploads/a.png', width: 300, height: 200, formats: null })
  assert.equal(img.src, '/uploads/a.png')
  assert.equal(img.srcset, undefined)
  assert.equal(img.alt, '')
})
