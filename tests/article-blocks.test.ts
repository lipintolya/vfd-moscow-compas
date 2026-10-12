import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toSiteBlocks, type StrapiBlock } from '../src/lib/article-blocks'
import { ARTICLE_VARS } from '../src/lib/article-vars'

const t = (text: string, mods: Record<string, boolean> = {}) => ({ type: 'text' as const, text, ...mods })
const text = (...content: unknown[]) => ({ __component: 'article.text', content }) as StrapiBlock
const img = (n: number) => ({ url: `/uploads/i${n}.jpg`, width: 3000, height: 2000, alternativeText: null,
  formats: { medium: { url: `/uploads/medium_i${n}.jpg`, width: 960, height: 640 }, large: { url: `/uploads/large_i${n}.jpg`, width: 1280, height: 853 }, xlarge: { url: `/uploads/xlarge_i${n}.jpg`, width: 1920, height: 1280 } } })

test('текст: абзац, жирный, ссылка, подстановка', () => {
  const { blocks, text: body } = toSiteBlocks([text(
    { type: 'paragraph', children: [t('Салон: '), t('{адрес салона}', { bold: true }), t(', '), { type: 'link', url: '/contacts/', children: [t('как добраться')] }] },
  )], 'Т')
  assert.deepEqual(blocks, [{ type: 'text', html: `<p>Салон: <strong>${ARTICLE_VARS.salon.address}</strong>, <a href="/contacts/">как добраться</a></p>` }])
  assert.match(body, /Салон:\s+,\s+как добраться \/contacts\//)
})

test('заголовки: якоря как у Markdoc, одинаковые — с номером', () => {
  const { blocks, headings } = toSiteBlocks([text(
    { type: 'heading', level: 2, children: [t('Что такое скрытая дверь')] },
    { type: 'heading', level: 3, children: [t('Плюсы')] },
    { type: 'heading', level: 3, children: [t('Плюсы')] },
  )], 'Т')
  assert.deepEqual(headings, [
    { depth: 2, slug: 'что-такое-скрытая-дверь', text: 'Что такое скрытая дверь' },
    { depth: 3, slug: 'плюсы', text: 'Плюсы' },
    { depth: 3, slug: 'плюсы-1', text: 'Плюсы' },
  ])
  assert.equal((blocks[0] as { html: string }).html, '<h2 id="что-такое-скрытая-дверь">Что такое скрытая дверь</h2><h3 id="плюсы">Плюсы</h3><h3 id="плюсы-1">Плюсы</h3>')
})

test('списки и цитата', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [t('Раз')] }, { type: 'list-item', children: [t('Два')] }] },
    { type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [t('Один')] }] },
    { type: 'quote', children: [t('Цитата')] },
  )], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<ul><li>Раз</li><li>Два</li></ul><ol><li>Один</li></ol><blockquote><p>Цитата</p></blockquote>')
})

test('разметка из текста экранируется', () => {
  const { blocks } = toSiteBlocks([text({ type: 'paragraph', children: [t('a < b & "c" <script>x</script>')] })], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<p>a &lt; b &amp; &quot;c&quot; &lt;script&gt;x&lt;/script&gt;</p>')
})

test('пустой абзац от редактора не выводится', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'paragraph', children: [t('Текст')] },
    { type: 'paragraph', children: [t('')] },
  )], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<p>Текст</p>')
})

test('картинка и код, вставленные в текст кнопками редактора, выводятся', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'image', image: { ...img(1), alternativeText: 'Дверь' }, children: [t('')] },
    { type: 'code', children: [t('a < b')] },
  )], 'Т')
  const html = (blocks[0] as { html: string }).html
  assert.match(html, /<img src="\/uploads\/large_i1\.jpg" srcset="[^"]+"[^>]* alt="Дверь"/)
  assert.match(html, /<pre><code>a &lt; b<\/code><\/pre>/)
})

test('неизвестный узел текста — ошибка с названием статьи', () => {
  assert.throws(() => toSiteBlocks([text({ type: 'table', children: [] })], 'Статья «Х»'), /Статья «Х»: .*table/)
})

test('фото, галерея, выноска, видео, таблица, цены', () => {
  const { blocks, text: body } = toSiteBlocks([
    { __component: 'article.photo', image: img(1), alt: 'Короб', caption: 'Подпись', layout: 'Узкое (схема)' },
    { __component: 'article.gallery', photos: [{ image: img(2), alt: null, caption: 'Urban', link: '/catalog/series/urban/' }, { image: img(3), alt: 'Б', caption: null, link: null }], columns: 2, doors: true },
    { __component: 'article.callout', kind: 'Важно', title: 'Заголовок', text: [{ type: 'paragraph', children: [t('Тел.: {телефон}')] }] },
    { __component: 'article.video', video: { url: '/uploads/v.mp4' }, poster: img(4), title: 'Ролик', caption: null, narrow: true },
    { __component: 'article.table', markdown: '| Плюсы | Минусы |\n|---|---|\n| Стена от {мин. толщина стены} | Дороже |' },
    { __component: 'article.hidden-prices' },
    { __component: 'article.coating-prices' },
  ] as StrapiBlock[], 'Т')
  assert.deepEqual(blocks.map((b) => b.type), ['photo', 'gallery', 'callout', 'video', 'table', 'hiddenPrices', 'coatingPrices'])
  const [photo, gallery, callout, video, table] = blocks as any[]
  assert.equal(photo.layout, 'narrow')
  assert.equal(photo.image.src, '/uploads/large_i1.jpg')
  assert.equal(photo.image.alt, 'Короб')
  assert.equal(photo.zoom, '/uploads/xlarge_i1.jpg')
  assert.equal(gallery.photos[0].image.alt, 'Urban')
  assert.equal(gallery.photos[0].href, '/catalog/series/urban/')
  assert.equal(gallery.doors, true)
  assert.equal(callout.kind, 'info')
  assert.equal(callout.html, `<p>Тел.: ${ARTICLE_VARS.salon.phone}</p>`)
  assert.equal(video.src, '/uploads/v.mp4')
  assert.deepEqual(table.head, ['Плюсы', 'Минусы'])
  assert.deepEqual(table.rows, [[`Стена от ${ARTICLE_VARS.hidden.wallMin}`, 'Дороже']])
  assert.match(body, /Тел\.:/)
  assert.match(body, /Плюсы Минусы Стена от\s+Дороже/)
  assert.doesNotMatch(body, /Подпись|Заголовок|Ролик/)
})

test('таблица без строки-разделителя — понятная ошибка', () => {
  assert.throws(() => toSiteBlocks([{ __component: 'article.table', markdown: '| a | b |\n| c | d |' } as StrapiBlock], 'Статья «Х»'),
    /Статья «Х»: таблица/)
})
