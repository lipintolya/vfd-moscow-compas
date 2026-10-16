import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openingStatus } from '../src/lib/opening-status'

/* График салона: ежедневно 10:00–19:30, Москва (UTC+3) */
const hours = { opens: '10:00', closes: '19:30' }
const week = { weekdays: hours, saturday: hours, sunday: hours }
const at = (iso: string) => openingStatus(new Date(iso), week, 'Europe/Moscow')

test('открыто до закрытия с минутами', () => {
  assert.deepEqual(at('2026-10-16T16:10:00Z'), { open: true, detail: 'Работаем до 19:30' })   // 19:10 МСК
})

test('после 19:30 — закрыто, откроемся завтра', () => {
  assert.deepEqual(at('2026-10-16T16:31:00Z'), { open: false, detail: 'Откроемся завтра в 10:00' }) // 19:31 МСК
})

test('утром до открытия — сегодня', () => {
  assert.deepEqual(at('2026-10-16T06:30:00Z'), { open: false, detail: 'Откроемся сегодня в 10:00' }) // 09:30 МСК
})

test('время — московское, не устройства', () => {
  // 21:00 UTC — в Москве уже 00:00 следующего дня
  assert.deepEqual(at('2026-10-16T21:00:00Z'), { open: false, detail: 'Откроемся сегодня в 10:00' })
})

test('выходные — по своему графику', () => {
  const custom = { weekdays: hours, saturday: { opens: '11:00', closes: '18:00' }, sunday: { opens: '12:00', closes: '17:00' } }
  // пятница 2026-10-16 20:00 МСК → завтра суббота, с 11:00
  assert.deepEqual(openingStatus(new Date('2026-10-16T17:00:00Z'), custom, 'Europe/Moscow'), { open: false, detail: 'Откроемся завтра в 11:00' })
  // воскресенье 2026-10-18 16:30 МСК → открыто до 17:00
  assert.deepEqual(openingStatus(new Date('2026-10-18T13:30:00Z'), custom, 'Europe/Moscow'), { open: true, detail: 'Работаем до 17:00' })
})
