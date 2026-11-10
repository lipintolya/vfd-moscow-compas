import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { toPromo } from '../src/lib/strapi-content'
import { formatDate } from '../src/lib/promo-dates'

/* Акции до конца 2026 года (cms/scripts/promos-2026-12.json → add:promos):
   пока записей нет в Strapi, этот файл — единственный источник текстов */
const PROMOS = JSON.parse(readFileSync('cms/scripts/promos-2026-12.json', 'utf8')) as {
  title: string; subtitle: string; description: string; discount: string; ctaText: string; ctaLink: string; order: number
}[]
const SCHEMA = JSON.parse(readFileSync('cms/src/api/promo/content-types/promo/schema.json', 'utf8')).attributes

test('акции конца года: шесть штук, порядок и названия не повторяются', () => {
  assert.equal(PROMOS.length, 6)
  assert.equal(new Set(PROMOS.map((p) => p.title)).size, PROMOS.length)
  assert.deepEqual(PROMOS.map((p) => p.order), [1, 2, 3, 4, 5, 6])
  assert.match(PROMOS[0]!.title, /терморазрыв/i, 'первой — сезонная акция на тёплые двери (просьба заказчика)')
})

test('акции конца года: тексты укладываются в поля Strapi и проходят сборку', () => {
  for (const p of PROMOS) {
    for (const f of ['title', 'subtitle', 'description', 'discount', 'ctaText', 'ctaLink'] as const) {
      assert.ok(p[f].length <= SCHEMA[f].maxLength, `«${p.title}»: ${f} длиннее ${SCHEMA[f].maxLength}`)
    }
    const promo = toPromo({ documentId: p.title, ...p, validUntil: '2026-12-31' })
    assert.equal(promo.order, p.order)
  }
})

test('акции конца года: срок — 31 декабря 2026, в текстах его не искажают', () => {
  assert.equal(formatDate('2026-12-31'), '31 декабря 2026 года')
  for (const p of PROMOS) {
    const dates = `${p.subtitle} ${p.description}`.match(/\d{1,2} (?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/g) ?? []
    assert.ok(dates.every((d) => d === '31 декабря'), `«${p.title}»: в тексте другая дата — ${dates}`)
  }
})

test('акции конца года: условия, которых заказчик не назвал, не придуманы', () => {
  const all = PROMOS.map((p) => `${p.subtitle} ${p.description}`).join(' ')
  assert.doesNotMatch(all, /\d[\d\s]*\s?(?:₽|руб)/, 'сумму заказа для выезда называет менеджер')
  assert.match(PROMOS.find((p) => p.title.startsWith('Дизайн'))!.description, /менеджер/)
  assert.match(PROMOS.find((p) => p.title.startsWith('Пятая'))!.description, /менеджер/)
})

test('акции конца года: ссылки — на существующие разделы сайта', () => {
  for (const p of PROMOS) assert.match(p.ctaLink, /^\/(catalog\/|contacts\/)/)
  assert.equal(PROMOS[0]!.ctaLink, '/catalog/vhodnye-dveri/#doors-thermo')
})
