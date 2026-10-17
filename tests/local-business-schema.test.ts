import { test } from 'node:test'
import assert from 'node:assert/strict'
import { localBusinessSchema, websiteSchema } from '../src/lib/local-business-schema'
import { HAS_EMAIL } from '../src/lib/contacts-data'
import { SITE } from '../src/config/site'

test('почта-заглушка не попадает в разметку для поисковиков', () => {
  const schema = localBusinessSchema() as Record<string, unknown>
  if (HAS_EMAIL) assert.equal(schema.email, SITE.email)
  else assert.equal('email' in schema, false)
})

import { readFileSync as readSrc } from 'node:fs'

test('название сайта для Google — студия, без домена среди запасных: иначе в выдаче остаётся «dveriziz.ru»', () => {
  const site = websiteSchema()
  assert.equal(site.name, SITE.studioName)
  assert.ok(![site.alternateName].flat().some((n) => String(n).includes(SITE.host)))
})

test('значок для поисковиков: в <head> есть PNG со стороной, кратной 48 px (требование Google)', () => {
  const layout = readSrc('src/layouts/BaseLayout.astro', 'utf8')
  const sizes = [...layout.matchAll(/rel="icon"[^>]*sizes="(\d+)x\1"/g)].map((m) => Number(m[1]))
  assert.ok(sizes.some((s) => s % 48 === 0), `есть только ${sizes.join(', ')}`)
})
