/**
 * Замена обложки у уже опубликованной статьи — тем же порядком, что add-article:
 * фото — в медиатеку (с «Что на обложке»), черновик статьи получает новую обложку,
 * проверка правилами сайта (scripts/check-content.ts, как при «Опубликовать»),
 * и только потом публикация. Замечания — публикации нет, старая обложка остаётся.
 *   npm --prefix cms run set:cover -- <slug> <файл.webp> "<что на обложке>"
 * Strapi при этом остановлен (одна SQLite-база на процесс).
 */
import { stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')

const SITE = path.resolve(process.cwd(), '..')
const [slug, file, coverAlt] = process.argv.slice(2)
if (!slug || !file || !coverAlt) throw new Error('Укажите: <slug> <файл.webp> "<что на обложке>"')
if (coverAlt.length > 160) throw new Error(`coverAlt длиннее 160 знаков: ${coverAlt.length}`)

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')
const articles = app.documents('api::article.article')

/* Как в cms/src/bootstrap/publish-checks.ts: проверка видит всё, что читает сайт */
function deepPopulate(uid) {
  const nested = (component) => {
    const inner = deepPopulate(component)
    return Object.keys(inner).length ? { populate: inner } : true
  }
  const out = {}
  for (const [name, attr] of Object.entries(app.getModel(uid).attributes)) {
    if (attr.type === 'media') out[name] = true
    else if (attr.type === 'component') out[name] = nested(attr.component)
    else if (attr.type === 'dynamiczone') out[name] = { on: Object.fromEntries(attr.components.map((c) => [c, nested(c)])) }
    else if (attr.type === 'relation' && attr.target?.startsWith('api::')) out[name] = { fields: ['slug'] }
  }
  return out
}

try {
  const doc = await articles.findFirst({ filters: { slug }, status: 'draft' })
  if (!doc) throw new Error(`Статьи «${slug}» нет`)
  const full = path.resolve(process.cwd(), file)
  const { size } = await stat(full)
  const [done] = await upload.upload({
    data: { fileInfo: { name: path.basename(file), alternativeText: coverAlt } },
    files: { filepath: full, originalFilename: path.basename(file), mimetype: 'image/webp', size },
  })
  console.log(`обложка → медиатека (${done.id})`)

  await articles.update({ documentId: doc.documentId, data: { cover: done.id, coverAlt } })
  const others = await articles.findMany({ status: 'draft', fields: ['title'], filters: { documentId: { $ne: doc.documentId } } })
  const draft = await articles.findOne({ documentId: doc.documentId, status: 'draft', populate: deepPopulate('api::article.article') })
  const check = spawnSync('npx', ['tsx', 'scripts/check-content.ts', '--stdin'], {
    cwd: SITE,
    input: JSON.stringify({ kind: 'article', record: draft, otherTitles: others.map((o) => o.title) }),
    encoding: 'utf8',
  })
  if (check.status !== 0) throw new Error(`Проверка не запустилась: ${check.stderr}`)
  const problems = JSON.parse(check.stdout)
  if (problems.length) {
    console.log('Публикация не выполнена, замечания:\n - ' + problems.join('\n - '))
    process.exitCode = 1
  } else {
    await articles.publish({ documentId: doc.documentId })
    console.log(`опубликовано: ${slug}, обложка заменена`)
  }
} catch (e) {
  console.error(e.message)
  process.exitCode = 1
} finally {
  await app.destroy()
  process.exit(process.exitCode ?? 0)
}
