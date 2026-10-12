/* Проверка при «Опубликовать»: акция, работа или статья проходят те же
   правила, что у сборки сайта, плюс правила для поисковиков
   (src/lib/content-checks.ts в корне, запуск — scripts/check-content.ts).
   Замечания директор видит в админке, запись не публикуется.
   Черновик читаем здесь, в той же транзакции, что и публикация: админка
   сначала сохраняет правку, потом публикует — через API снаружи была бы
   видна ещё прежняя версия. */
import type { Core, UID } from '@strapi/strapi'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { errors } from '@strapi/utils'

const KINDS: Record<string, 'article' | 'work' | 'promo'> = {
  'api::article.article': 'article',
  'api::work.work': 'work',
  'api::promo.promo': 'promo',
}

type Attr = { type: string; component?: string; components?: string[]; target?: string }
type Populate = Record<string, unknown>

/** Всё, что читает сайт: медиа, компоненты, зоны блоков; у связанных
    статей — только адрес */
export function deepPopulate(strapi: Core.Strapi, uid: string): Populate {
  const attrs = strapi.getModel(uid as UID.Schema).attributes as Record<string, Attr>
  const nested = (component: string) => {
    const inner = deepPopulate(strapi, component)
    return Object.keys(inner).length ? { populate: inner } : true
  }
  const out: Populate = {}
  for (const [name, attr] of Object.entries(attrs)) {
    if (attr.type === 'media') out[name] = true
    else if (attr.type === 'component') out[name] = nested(attr.component!)
    else if (attr.type === 'dynamiczone') out[name] = { on: Object.fromEntries(attr.components!.map((c) => [c, nested(c)])) }
    else if (attr.type === 'relation' && attr.target?.startsWith('api::')) out[name] = { fields: ['slug'] }
  }
  return out
}

/** Проверка в отдельном процессе: правила — TypeScript сайта (через tsx) */
function runCheck(siteRoot: string, payload: unknown): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = execFile(process.execPath, ['--import', 'tsx', 'scripts/check-content.ts', '--stdin'],
      { cwd: siteRoot, timeout: 60_000, maxBuffer: 1 << 20 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr.trim().split('\n').slice(-2).join(' ') || err.message))
        try { resolve(JSON.parse(stdout)) } catch { reject(new Error(`ответ проверки не JSON: ${stdout.slice(0, 200)}`)) }
      })
    child.stdin!.end(JSON.stringify(payload))
  })
}

export function registerPublishChecks(strapi: Core.Strapi) {
  const siteRoot = path.resolve(strapi.dirs.app.root, '..')
  strapi.documents.use(async (ctx, next) => {
    const kind = KINDS[ctx.uid]
    if (ctx.action !== 'publish' || !kind) return next()
    const { documentId } = ctx.params as { documentId: string }
    const docs = strapi.documents(ctx.uid)
    const record = await docs.findOne({ documentId, status: 'draft', populate: deepPopulate(strapi, ctx.uid) as never })
    if (!record) return next()
    const otherTitles = kind === 'article'
      ? (await docs.findMany({ status: 'draft', fields: ['title'] as never, filters: { documentId: { $ne: documentId } } as never }))
        .map((d) => (d as unknown as { title: string }).title)
      : []
    let problems: string[]
    try {
      problems = await runCheck(siteRoot, { kind, record, otherTitles })
    } catch (e) {
      strapi.log.error(`Проверка перед публикацией: ${(e as Error).message}`)
      throw new errors.ApplicationError('Не удалось проверить запись перед публикацией — напишите разработчику')
    }
    if (problems.length) {
      throw new errors.ValidationError(`Не опубликовано, исправьте: ${problems.map((p, i) => `${i + 1}) ${p}`).join('; ')}`)
    }
    return next()
  })
}
