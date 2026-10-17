import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countFormatter } from '../src/lib/count-up'

test('промежуточные значения — в формате итогового', () => {
  assert.equal(countFormatter('1000')(537), '537')
  assert.equal(countFormatter('1000+')(537), '537+')
  assert.equal(countFormatter('12 000')(4321).replace(/\s/g, ' '), '4 321')
})

import { countEase } from '../src/lib/count-up'

test('счёт: быстро в начале и заметно медленнее в конце — последние числа тянутся', () => {
  assert.equal(countEase(0), 0)
  assert.equal(countEase(1), 1)
  for (let p = 0; p < 1; p += 0.05) assert.ok(countEase(p + 0.05) >= countEase(p), `монотонно на ${p}`)
  assert.ok(countEase(0.5) > 0.95, 'к середине времени — больше 95 %')
  // последние 20 % времени — меньше 1 % пути: на 1000 это последние ~5 чисел
  assert.ok(1 - countEase(0.8) < 0.01)
  assert.ok(1 - countEase(0.8) > 0.002, 'но не стоит на месте: в конце ещё есть что досчитать')
})
