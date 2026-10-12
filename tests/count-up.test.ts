import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countFormatter } from '../src/lib/count-up'

test('промежуточные значения — в формате итогового', () => {
  assert.equal(countFormatter('1000')(537), '537')
  assert.equal(countFormatter('1000+')(537), '537+')
  assert.equal(countFormatter('12 000')(4321).replace(/\s/g, ' '), '4 321')
})
