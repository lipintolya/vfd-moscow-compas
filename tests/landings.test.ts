import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { DOOR_CATEGORIES } from '../src/data/door-categories'
import { COLOR_CATEGORIES } from '../src/data/color-categories'
import { STYLE_CATEGORIES } from '../src/data/style-categories'
import { TASK_CATEGORIES, type CatalogStats } from '../src/data/task-categories'
import { REYKI_PAGE, REYKI_FAQ, REYKI_USES } from '../src/data/reyki-page'
import { brandTitle } from '../src/lib/seo-title'
import { TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'

/* Цифры подборки при сборке берутся из каталога; для проверки длины — правдоподобные */
const STATS: CatalogStats = {
  count: 128,
  minPrice: 12_345,
  coatings: [{ name: 'Эмалекс', slug: 'emalex' }, { name: 'Протач', slug: 'protach' }, { name: 'Эмаль', slug: 'emal' }],
  series: ['Некст', 'Бэйсик', 'Урбан', 'Урбан ПЭТ', 'Урбан Древесный'],
}

test('посадочные страницы каталога: адреса не повторяются и не перекрывают страницы-файлы', () => {
  const slugs = [...DOOR_CATEGORIES, ...COLOR_CATEGORIES, ...STYLE_CATEGORIES, ...TASK_CATEGORIES].map((c) => c.slug)
  assert.equal(new Set(slugs).size, slugs.length, `повтор адреса: ${slugs.join(', ')}`)
  const files = readdirSync('src/pages/catalog').map((f) => f.replace(/\.astro$/, ''))
  for (const s of slugs) assert.ok(!files.includes(s), `/catalog/${s}/ уже есть файлом страницы`)
})

test('подборки под задачу: заголовок и описание — в лимитах поисковика, главный запрос в H1', () => {
  for (const c of TASK_CATEGORIES) {
    assert.ok(c.metaTitle.length <= TITLE_MAX, `${c.metaTitle.length}: ${c.metaTitle}`)
    const t = c.text(STATS)
    assert.ok(t.metaDescription.length <= DESCRIPTION_MAX, `${t.metaDescription.length}: ${t.metaDescription}`)
    assert.match(c.h1, /двери/i, c.h1)
    assert.ok(t.intro.length >= 120, `вводка слишком короткая: ${c.slug}`)
    assert.ok(t.sections.length >= 2, `мало разделов: ${c.slug}`)
    assert.ok(t.faq.length >= 3, `мало вопросов: ${c.slug}`)
    for (const f of t.faq) assert.ok(f.q.endsWith('?') && f.a.length > 40, `${c.slug}: ${f.q}`)
  }
})

test('подборки под задачу: у недорогих и ванной есть отбор, у высоких — нет, и они ведут в каталог', () => {
  const by = (slug: string) => TASK_CATEGORIES.find((c) => c.slug === slug)!
  assert.ok(by('nedorogie-dveri').select && 'maxPrice' in by('nedorogie-dveri').select!)
  assert.ok(by('dveri-v-vannuyu').select && 'series' in by('dveri-v-vannuyu').select!)
  assert.equal(by('vysokie-dveri').select, undefined)
  assert.ok(by('vysokie-dveri').text(STATS).sections.some((s) => s.links?.some((l) => l.href === '/catalog/')))
})

test('тексты подборок: цены и сроки — только данные сайта; «от производителя» двери салона не называют', () => {
  const all = TASK_CATEGORIES.flatMap((c) => {
    const t = c.text(STATS)
    return [c.h1, c.metaTitle, t.intro, t.metaDescription, ...t.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? []), ...(s.bullets ?? [])]), ...t.faq.flatMap((f) => [f.q, f.a])]
  }).join('\n')
  assert.doesNotMatch(all, /от производителя/i)
  assert.doesNotMatch(all, /undefined|NaN|\[object/)
  // Срок называем только у скрытых дверей (он в их данных); у обычных высоких — «зависит от серии»
  for (const line of all.split('\n').filter((l) => /недел/.test(l))) assert.match(line, /[Сс]крыт/, `срок не у скрытых дверей: ${line}`)
})

test('декоративные рейки: заголовок и описание — в лимитах, цена «от» совпадает с прайсом', () => {
  const title = brandTitle(REYKI_PAGE.title)
  assert.ok(title.length <= TITLE_MAX, `${title.length}: ${title}`)
  assert.ok(REYKI_PAGE.description.length <= DESCRIPTION_MAX, `${REYKI_PAGE.description.length}: ${REYKI_PAGE.description}`)
  for (const t of [REYKI_PAGE.title, REYKI_PAGE.h1, REYKI_PAGE.description]) assert.match(t, /[Дд]екоративные рейки/)
  assert.match(REYKI_PAGE.title, /в Москве/)
  assert.match(REYKI_PAGE.title, /от \d/)
  assert.ok(REYKI_USES.items.length >= 3)
  for (const f of REYKI_FAQ) assert.ok(f.q.endsWith('?') && f.a.length > 20, f.q)
})
