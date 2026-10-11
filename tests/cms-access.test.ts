import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ensureSiteToken, ensureDevWebhook } from '../cms/src/bootstrap/access'

/* Strapi на сервере запускают `strapi start` — NODE_ENV там могут и не
   задать. Ключ сайта и вебхук на localhost — только для `strapi develop`. */
const serverStrapi = {
  config: { get: (key: string) => (key === 'autoReload' ? false : undefined) },
  service: () => { throw new Error('ключ сайта трогать нельзя') },
  get: () => { throw new Error('вебхук трогать нельзя') },
  log: { info: () => {} },
} as never

test('strapi start без NODE_ENV — ни ключа в .env, ни вебхука', async () => {
  const saved = process.env.NODE_ENV
  delete process.env.NODE_ENV
  try {
    await ensureSiteToken(serverStrapi)
    await ensureDevWebhook(serverStrapi)
  } finally {
    if (saved !== undefined) process.env.NODE_ENV = saved
  }
})
