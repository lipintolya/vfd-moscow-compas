import { test } from 'node:test'
import assert from 'node:assert/strict'
import { timeLeft, daysLeft, moscowToday } from '../src/lib/promo-dates'

test('таймер акции: считает до полуночи после последнего дня по Москве', () => {
  /* 12 ноября 2026, 18:30 по Москве = 15:30 UTC */
  assert.deepEqual(timeLeft('2026-12-31', new Date('2026-11-12T15:30:00Z')), { days: 49, hours: 5, minutes: 30, seconds: 0 })
  /* последний день, 23:59:59 по Москве — ещё секунда */
  assert.deepEqual(timeLeft('2026-12-31', new Date('2026-12-31T20:59:59Z')), { days: 0, hours: 0, minutes: 0, seconds: 1 })
  /* полночь 1 января по Москве — акция кончилась */
  assert.equal(timeLeft('2026-12-31', new Date('2026-12-31T21:00:00Z')), null)
})

test('таймер акции: число дней совпадает с «Осталось N дней»', () => {
  for (const iso of ['2026-11-12T09:00:00Z', '2026-11-12T20:59:00Z', '2026-12-30T22:00:00Z']) {
    const now = new Date(iso)
    assert.equal(timeLeft('2026-12-31', now)!.days, daysLeft('2026-12-31', moscowToday(now)))
  }
})
