import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mdocToArticle } from '../scripts/lib/mdoc-to-blocks.mjs'

const doc = (body: string, extra = '') => `---
title: 'Т'
description: 'Лид с {% $salon.phone %}'
publishDate: 2026-09-01
coverImage: '/media/a/cover.webp'
coverImageAlt: 'Обложка'
summary:
  - 'Пункт'
${extra}---

${body}`

test('шапка статьи → поля Strapi, переменные → подстановки', () => {
  const a = mdocToArticle(doc('Текст.', "relatedCoatings:\n  - emal\nrelatedPages:\n  - /catalog/decor/\n"), 'slug')
  assert.equal(a.slug, 'slug')
  assert.equal(a.kind, 'Статья')
  assert.equal(a.publishDate, '2026-09-01')
  assert.equal(a.description, 'Лид с {телефон}')
  assert.deepEqual(a.cover, { $media: '/media/a/cover.webp' })
  assert.deepEqual(a.summary, [{ text: 'Пункт' }])
  assert.deepEqual(a.seo.coatings, [{ coating: 'Эмаль' }])
  assert.deepEqual(a.seo.pages, [{ text: '/catalog/decor/' }])
})

test('текст: подряд идущие абзацы, заголовки и списки — один блок «Текст»', () => {
  const a = mdocToArticle(doc('## Где {% $salon.city %}\n\nЕсть **жирный** и [ссылка](/x/).\n\n- раз\n- два\n\n1. один'), 's')
  assert.equal(a.body.length, 1)
  assert.deepEqual(a.body[0], { __component: 'article.text', content: [
    { type: 'heading', level: 2, children: [{ type: 'text', text: 'Где ' }, { type: 'text', text: '{в городе}' }] },
    { type: 'paragraph', children: [{ type: 'text', text: 'Есть ' }, { type: 'text', text: 'жирный', bold: true }, { type: 'text', text: ' и ' }, { type: 'link', url: '/x/', children: [{ type: 'text', text: 'ссылка' }] }, { type: 'text', text: '.' }] },
    { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', text: 'раз' }] }, { type: 'list-item', children: [{ type: 'text', text: 'два' }] }] },
    { type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', text: 'один' }] }] },
  ] })
})

test('теги → блоки: фото, галерея, выноска, видео, таблица, цены', () => {
  const a = mdocToArticle(doc([
    'До.',
    '{% figure src="/media/f.webp" alt="Ф" caption="П" narrow=true /%}',
    '{% photogrid cols=2 doors=true %}\n{% photo src="/media/1.webp" alt="1" caption="Urban" href="/catalog/series/urban/" /%}\n{% photo src="/media/2.webp" alt="2" /%}\n{% /photogrid %}',
    '{% callout type="info" title="Важно" %}\nЗвоните {% $salon.phone %}.\n{% /callout %}',
    '{% video src="/renders/v.mp4" poster="/renders/p.webp" title="Ролик" caption="Подпись" narrow=true /%}',
    '{% table %}\n* Плюсы\n* Минусы\n---\n* От {% $hidden.wallMin %}\n* Дороже\n{% /table %}',
    '{% hiddenHeightPrices /%}',
    '{% coatingPrices /%}',
    'После.',
  ].join('\n\n')), 's')
  assert.deepEqual(a.body.map((b: any) => b.__component), ['article.text', 'article.photo', 'article.gallery', 'article.callout', 'article.video', 'article.table', 'article.hidden-prices', 'article.coating-prices', 'article.text'])
  const [, photo, gallery, callout, video, table] = a.body as any[]
  assert.deepEqual(photo, { __component: 'article.photo', image: { $media: '/media/f.webp' }, alt: 'Ф', caption: 'П', layout: 'Узкое (схема)' })
  assert.deepEqual(gallery, { __component: 'article.gallery', columns: 2, doors: true, photos: [
    { image: { $media: '/media/1.webp' }, alt: '1', caption: 'Urban', link: '/catalog/series/urban/' },
    { image: { $media: '/media/2.webp' }, alt: '2', caption: null, link: null }] })
  assert.deepEqual(callout, { __component: 'article.callout', kind: 'Важно', title: 'Важно',
    text: [{ type: 'paragraph', children: [{ type: 'text', text: 'Звоните ' }, { type: 'text', text: '{телефон}' }, { type: 'text', text: '.' }] }] })
  assert.deepEqual(video, { __component: 'article.video', video: { $media: '/renders/v.mp4' }, poster: { $media: '/renders/p.webp' }, title: 'Ролик', caption: 'Подпись', narrow: true })
  assert.equal(table.markdown, '| Плюсы | Минусы |\n|---|---|\n| От {мин. толщина стены} | Дороже |')
})

test('неизвестный тег или переменная — ошибка с адресом статьи', () => {
  assert.throws(() => mdocToArticle(doc('{% projectsSlider /%}'), 'x'), /x: .*projectsSlider/)
  assert.throws(() => mdocToArticle(doc('{% $salon.nope %}'), 'x'), /x: .*salon\.nope/)
})
