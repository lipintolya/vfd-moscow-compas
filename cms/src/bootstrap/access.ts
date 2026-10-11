/* Доступ:
   - роль «Редактор» (директор) может всё с акциями и работами, включая
     публикацию; настройки и устройство разделов ей не видны (так у роли
     Editor в Strapi);
   - сайт читает Strapi по ключу только для чтения; в разработке ключ
     создаётся сам и записывается в .env сайта;
   - в разработке Strapi сообщает дев-серверу сайта об изменениях. */
import type { Core } from '@strapi/strapi'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const MANAGED = ['api::promo.promo', 'api::work.work']
const ACTIONS = ['create', 'read', 'update', 'delete', 'publish'].map((a) => `plugin::content-manager.explorer.${a}`)
const SITE_TOKEN = 'site-build'
const SITE_ENV = path.resolve(process.cwd(), '..', '.env')
const DEV_WEBHOOK = 'http://localhost:4321/__strapi/refresh'
const isDev = () => process.env.NODE_ENV !== 'production'

export async function grantEditor(strapi: Core.Strapi) {
  const roles = strapi.service('admin::role')
  const editor = await roles.findOne({ code: 'strapi-editor' })
  if (!editor) return
  const has: { action: string; subject: string }[] = await strapi.service('admin::permission').findMany({ where: { role: editor.id } })
  const missing = MANAGED.flatMap((subject) => ACTIONS.map((action) => ({ action, subject })))
    .filter((p) => !has.some((h) => h.action === p.action && h.subject === p.subject))
  if (missing.length) await roles.addPermissions(editor.id, missing.map((p) => ({ ...p, properties: {}, conditions: [] })))
}

/** Строка KEY=value в .env: заменить, если есть, иначе дописать */
const upsertEnv = (env: string, key: string, value: string) => {
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(env)) return env.replace(re, line)
  return `${env}${env && !env.endsWith('\n') ? '\n' : ''}${line}\n`
}

export async function ensureSiteToken(strapi: Core.Strapi) {
  if (!isDev()) return
  const tokens = strapi.service('admin::api-token-content-api')
  let accessKey: string | undefined = (await tokens.getByName(SITE_TOKEN, { includeDecryptedKey: true }))?.accessKey
  if (!accessKey) {
    ;({ accessKey } = await tokens.create({
      name: SITE_TOKEN, description: 'Сборка сайта: только чтение', type: 'read-only', lifespan: null,
    }))
  }
  const env = await readFile(SITE_ENV, 'utf8').catch(() => '')
  let next = upsertEnv(env, 'STRAPI_TOKEN', accessKey!)
  if (!/^STRAPI_URL=/m.test(next)) next = upsertEnv(next, 'STRAPI_URL', 'http://localhost:1337')
  if (next === env) return
  await writeFile(SITE_ENV, next)
  strapi.log.info('Ключ сайта записан в .env сайта (STRAPI_TOKEN)')
}

export async function ensureDevWebhook(strapi: Core.Strapi) {
  if (!isDev()) return
  const store = strapi.get('webhookStore')
  const all: { url: string }[] = await store.findWebhooks()
  if (all.some((w) => w.url === DEV_WEBHOOK)) return
  await store.createWebhook({
    name: 'Сайт (разработка): обновить данные', url: DEV_WEBHOOK, headers: {},
    events: ['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish', 'media.update'],
  })
}
