import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { toPromo } from '../src/lib/strapi-content'
import { formatDate } from '../src/lib/promo-dates'

/* Акции до конца 2026 года (cms/scripts/promos-2026-12.json → add:promos):
   пока записей нет в Strapi, этот файл — единственный источник текстов */
interface FilePromo {
  slug: string; title: string; subtitle: string; description: string; discount: string; ctaText: string; ctaLink: string; order: number
  bannerAlt: string
}
const FILE = JSON.parse(readFileSync('cms/scripts/promos-2026-12.json', 'utf8')) as { validUntil: string; promos: FilePromo[]; retired: string[] }
const PROMOS = FILE.promos
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
    const { bannerAlt: _alt, ...fields } = p
    const promo = toPromo({ documentId: p.slug, ...fields, validUntil: FILE.validUntil })
    assert.equal(promo.slug, p.slug)
    assert.equal(promo.order, p.order)
  }
})

test('акции конца года: срок — 31 декабря 2026, в текстах его не искажают', () => {
  assert.equal(FILE.validUntil, '2026-12-31')
  assert.equal(formatDate(FILE.validUntil), '31 декабря 2026 года')
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
  for (const p of PROMOS) assert.match(p.ctaLink, /^\/(catalog\/|contacts\/|partitions\/)/)
  assert.equal(PROMOS[0]!.ctaLink, '/catalog/vhodnye-dveri/#doors-thermo')
})

test('«Комплект под ключ» снят заказчиком (11 ноября 2026): его нет среди акций, он в списке на снятие', () => {
  assert.ok(FILE.retired.includes('Комплект под ключ'))
  for (const title of FILE.retired) assert.ok(!PROMOS.some((p) => p.title === title), `«${title}» снята, но осталась в акциях`)
})

test('баннеры акций: у каждой — файл заказчика и подпись с текстом баннера', () => {
  assert.equal(new Set(PROMOS.map((p) => p.slug)).size, PROMOS.length)
  for (const p of PROMOS) {
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `«${p.title}»: адрес — латиница через дефис (/offers/#…), он же имя файла баннера`)
    assert.ok(existsSync(`assets/promo-banners/${p.slug}.webp`), `«${p.title}»: нет баннера assets/promo-banners/${p.slug}.webp`)
    assert.ok(p.bannerAlt.length > 30 && /надпись/.test(p.bannerAlt), `«${p.title}»: в подписи баннера опишите фото и его надпись`)
  }
})
