import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { WARRANTY_TERMS } from '../src/data/services'
import { BOOK_MESSAGE } from '../src/lib/messengers'
import { SITE } from '../src/config/site'

test('гарантия — одна формулировка: производителя на двери и перегородки, салона на монтаж', () => {
  /* «1 год» — с неразрывным пробелом: не разрывается переносом */
  assert.equal(WARRANTY_TERMS.replaceAll('\u00a0', ' '), 'На двери и перегородки — гарантия производителя 1 год, на монтаж — 1 год')
})

test('нигде нет другой трактовки гарантии: ни «2 года», ни «12 месяцев», ни «по условиям производителя»', () => {
  const files = ['src/components/home/faq-data.ts', 'src/data/how-it-works.ts', 'src/data/contacts-page.ts', 'src/lib/contacts-data.ts']
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    assert.doesNotMatch(text, /2 года|12 месяц|по условиям производителя|согласно условиям производителя/, f)
  }
})

test('счётчик продаж — год из данных: в тексте главной нет своей цифры года', () => {
  assert.match(String(SITE.doorsInstalled.year), /^20\d\d$/)
  const hero = readFileSync('src/components/home/ShowroomHero.astro', 'utf8')
  assert.doesNotMatch(hero, /2026/)
  assert.doesNotMatch(hero, /году продали/)
  assert.match(hero, /установлено нашим клиентам в&nbsp;\{year\}&nbsp;году/)
})

test('запись в салон — то же приветствие и просьба назвать удобное время', () => {
  assert.equal(BOOK_MESSAGE, `Здравствуйте, Константин! Пишу с сайта ${SITE.host} — хочу приехать в салон на консультацию. Удобное время: `)
})
