import { test } from 'node:test'
import assert from 'node:assert/strict'
import { localBusinessSchema } from '../src/lib/local-business-schema'
import { HAS_EMAIL } from '../src/lib/contacts-data'
import { SITE } from '../src/config/site'

test('почта-заглушка не попадает в разметку для поисковиков', () => {
  const schema = localBusinessSchema() as Record<string, unknown>
  if (HAS_EMAIL) assert.equal(schema.email, SITE.email)
  else assert.equal('email' in schema, false)
})
