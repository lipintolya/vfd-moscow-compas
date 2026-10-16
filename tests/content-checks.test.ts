import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articleProblems, workProblems, promoProblems } from '../src/lib/content-checks'

const img = (name: string, alternativeText: string | null = null) => ({ url: `/uploads/${name}`, name, alternativeText, width: 1920, height: 1080 })
const h = (level: number, text: string) => ({ type: 'heading', level, children: [{ type: 'text', text }] })
const p = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const LEAD = 'Скрытая дверь — полотно вровень со стеной: как устроена, сколько стоит и что учесть до ремонта. Отвечаем по порядку.'

const article = (over: Record<string, unknown> = {}) => ({
  documentId: 'a1', slug: 's', title: 'Скрытые двери', kind: 'Статья', publishDate: '2026-01-01',
  cover: img('cover.webp'), coverAlt: 'Белая скрытая дверь', description: LEAD,
  body: [{ __component: 'article.text', content: [h(2, 'Что это'), p('Текст')] }],
  ...over,
}) as Parameters<typeof articleProblems>[0]

test('хорошая статья — замечаний нет', () => {
  assert.deepEqual(articleProblems(article(), ['Другая статья']), [])
})

test('короткий лид', () => {
  assert.match(articleProblems(article({ description: 'Коротко.' }), []).join('\n'), /Лид — 8 знаков, нужно от 70/)
})

test('нет подзаголовков и «Заголовок 1» в тексте', () => {
  const problems = articleProblems(article({ body: [{ __component: 'article.text', content: [h(1, 'Большой'), p('Текст')] }] }), []).join('\n')
  assert.match(problems, /ни одного подзаголовка «Заголовок 2»/)
  assert.match(problems, /«Заголовок 1»/)
})

test('фото без описания — по имени файла; подпись в галерее и описание в медиатеке засчитываются', () => {
  const problems = articleProblems(article({
    coverAlt: null,
    body: [
      { __component: 'article.text', content: [h(2, 'Раздел')] },
      { __component: 'article.photo', image: img('dver.jpg'), alt: null },
      { __component: 'article.photo', image: img('ok.jpg', 'Из медиатеки'), alt: null },
      { __component: 'article.gallery', photos: [{ image: img('g1.jpg'), alt: null, caption: 'Подпись' }, { image: img('g2.jpg'), alt: null, caption: null }] },
    ],
  }), [])
  assert.deepEqual(problems.filter((x) => /без описания/.test(x)), [
    'Обложка без описания — заполните «Что на обложке»',
    'Фото «dver.jpg» без описания — заполните «Что на фото»',
    'Фото «g2.jpg» без описания — заполните «Что на фото» или подпись',
  ])
})

test('заголовок уже есть у другой статьи', () => {
  assert.match(articleProblems(article(), [' скрытые двери ']).join('\n'), /Статья с заголовком «Скрытые двери» уже есть/)
})

test('заголовок для поисковиков длиннее 60 знаков', () => {
  const metaTitle = 'Скрытые двери под покраску в Москве: цены, монтаж и сроки изготовления'
  assert.match(articleProblems(article({ seo: { metaTitle } }), []).join('\n'), /Заголовок для поисковиков — \d+ знаков, нужно до 60/)
})

test('то, что уронило бы сборку, — тоже замечание', () => {
  const problems = articleProblems(article({ description: `${LEAD} {адрес салонаа}` }), [])
  assert.match(problems.join('\n'), /неизвестная подстановка \{адрес салонаа\}/)
})

const work = (over: Record<string, unknown> = {}) => ({
  documentId: 'w1', slug: 'w', title: 'Кухня', date: '2026-01-05', category: 'Межкомнатные', objectType: 'Квартира',
  description: LEAD, images: [img('w1.jpg', 'Белые двери в коридоре')], ...over,
}) as Parameters<typeof workProblems>[0]

test('работа: фото без описания в медиатеке, короткое описание', () => {
  assert.deepEqual(workProblems(work()), [])
  const problems = workProblems(work({ description: 'Кратко', images: [img('w1.jpg', 'Есть'), img('IMG_2041.jpg')] })).join('\n')
  assert.match(problems, /Фото «IMG_2041\.jpg» без описания — нажмите на фото, значок карандаша, и заполните «Что на фото»/)
  assert.match(problems, /Короткое описание — 6 знаков, нужно от 70/)
})

test('акция: опасная ссылка кнопки', () => {
  assert.match(promoProblems({ documentId: 'p', title: 'Скидка', subtitle: 'С', validUntil: '2026-12-31', ctaLink: 'javascript:alert(1)' }).join('\n'), /недопустимая ссылка/)
})

test('заголовок для поисковиков — без своего «| …»: название салона добавится само', () => {
  assert.match(articleProblems(article({ seo: { metaTitle: 'Скрытые двери: цены | ВФД в Москве' } }), []).join('\n'), /название салона добавится само/)
  assert.match(workProblems(work({ metaTitle: 'Кухня в ЖК | Студия Зизевского' })).join('\n'), /название салона добавится само/)
  assert.deepEqual(articleProblems(article({ seo: { metaTitle: 'Скрытые двери: плюсы и минусы, цены' } }), []), [])
})
