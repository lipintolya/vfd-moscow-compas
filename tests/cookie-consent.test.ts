import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readConsent, writeConsent, CONSENT_VERSION, metrikaKeys, cookieDomains } from '../src/lib/cookie-consent'

test('согласие: сохранённый выбор читается обратно', () => {
  const at = new Date('2026-10-17T10:00:00Z')
  assert.equal(readConsent(writeConsent('accepted', at)), 'accepted')
  assert.equal(readConsent(writeConsent('declined', at)), 'declined')
  assert.deepEqual(JSON.parse(writeConsent('accepted', at)), { v: CONSENT_VERSION, choice: 'accepted', at: '2026-10-17T10:00:00.000Z' })
})

test('согласие: нет записи, старая запись «1» или мусор — выбора нет, баннер спросит', () => {
  for (const raw of [null, '', '1', 'accepted', '{"choice":"yes"}', '{broken', 'null', '[]']) {
    assert.equal(readConsent(raw), null, String(raw))
  }
})

test('согласие: запись прошлой версии текста согласия не действует', () => {
  assert.equal(readConsent(JSON.stringify({ v: CONSENT_VERSION - 1, choice: 'accepted', at: '2026-01-01' })), null)
})

test('отзыв согласия: находятся только cookie и записи Метрики', () => {
  assert.deepEqual(metrikaKeys(['_ym_uid', '_ym_d', 'consent', '_ym12345_lsid', 'ym', 'session']), ['_ym_uid', '_ym_d', '_ym12345_lsid'])
})

test('отзыв согласия: cookie удаляются на домене и его родителях, кроме зоны', () => {
  assert.deepEqual(cookieDomains('www.dveriziz.ru'), ['', 'www.dveriziz.ru', '.www.dveriziz.ru', 'dveriziz.ru', '.dveriziz.ru'])
  assert.deepEqual(cookieDomains('localhost'), [''])
})

import { readFileSync } from 'node:fs'
import { SERVER_LOG_DAYS, PD_OPERATOR } from '../src/data/personal-data'

test('политика: срок хранения журналов сервера совпадает с настройкой logrotate', () => {
  const rotate = readFileSync('deploy/logrotate/nginx', 'utf8').match(/^\s*rotate (\d+)/m)?.[1]
  assert.match(readFileSync('deploy/logrotate/nginx', 'utf8'), /^\s*daily$/m)
  assert.equal(Number(rotate), SERVER_LOG_DAYS)
})

test('политика: оператор назван по ФИО, почта для обращений настоящая', () => {
  assert.equal(PD_OPERATOR.name, 'Зизевский Константин Владимирович')
  assert.equal(PD_OPERATOR.email, 'mail@dverizz.ru')
})
