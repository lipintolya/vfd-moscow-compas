import { test } from 'node:test'
import assert from 'node:assert/strict'
import { companyLegalInfo } from '../src/lib/contacts-data'
import { SITE, PHONE } from '../src/config/site'

test('график: ежедневно 10:00–19:30 — и в подписи, и в разметке для поисковиков', () => {
  assert.equal(companyLegalInfo.workingHours.shortDisplay, 'Ежедневно: 10:00–19:30')
  assert.deepEqual(companyLegalInfo.schemaOrgHours, [{
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '10:00', closes: '19:30',
  }])
})

test('телефоны салона: городской — основной, затем мобильный', () => {
  assert.deepEqual(SITE.phones.map((p) => [p.raw, p.label]), [
    ['+74993910057', '+7 (499) 391-00-57'],
    ['+79687748820', '+7 (968) 774-88-20'],
  ])
  assert.equal(PHONE.raw, '+74993910057')
})

import { readFileSync } from 'node:fs'
import { SITE_URL } from '../src/config/site'

test('домен в astro.config.mjs совпадает с SITE_URL (конфиг не импортирует TS)', () => {
  const config = readFileSync('astro.config.mjs', 'utf8').match(/const SITE_URL = '([^']+)'/)?.[1]
  assert.equal(config, SITE_URL)
  assert.doesNotMatch(SITE_URL, /placeholder|\/$/)
})
