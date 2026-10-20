/**
 * Заголовки для поисковиков у работ портфолио: список и замена.
 *   npm --prefix cms run work:meta -- list
 *   npm --prefix cms run work:meta -- set <slug> "<заголовок>"
 * Замена — тем же порядком, что у set:cover: черновик, проверка правилами
 * сайта (scripts/check-content.ts), публикация только без замечаний.
 * Strapi при этом остановлен (одна SQLite-база на процесс).
 */
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')
const SITE = path.resolve(process.cwd(), '..')
const [mode, slug, metaTitle] = process.argv.slice(2)

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const works = app.documents('api::work.work')

try {
  if (mode === 'list') {
    for (const w of await works.findMany({ status: 'published', fields: ['title', 'slug', 'metaTitle'] })) {
      console.log(`${w.slug}\t${(w.metaTitle ?? '—').length}\t${w.metaTitle ?? '(нет)'}\t«${w.title}»`)
    }
  } else if (mode === 'set') {
    if (!slug || !metaTitle) throw new Error('Укажите: set <slug> "<заголовок>"')
    if (metaTitle.includes('|')) throw new Error('Без «| …»: название салона сайт добавит сам')
    const doc = await works.findFirst({ filters: { slug }, status: 'draft' })
    if (!doc) throw new Error(`Работы «${slug}» нет`)
    await works.update({ documentId: doc.documentId, data: { metaTitle } })
    const draft = await works.findOne({ documentId: doc.documentId, status: 'draft', populate: '*' })
    const check = spawnSync('npx', ['tsx', 'scripts/check-content.ts', '--stdin'], {
      cwd: SITE, input: JSON.stringify({ kind: 'work', record: draft, otherTitles: [] }), encoding: 'utf8',
    })
    if (check.status !== 0) throw new Error(`Проверка не запустилась: ${check.stderr}`)
    const problems = JSON.parse(check.stdout)
    if (problems.length) {
      console.log('Публикация не выполнена, замечания:\n - ' + problems.join('\n - '))
      process.exitCode = 1
    } else {
      await works.publish({ documentId: doc.documentId })
      console.log(`опубликовано: ${slug} → «${metaTitle}» (${metaTitle.length} знаков)`)
    }
  } else {
    throw new Error('Режим: list или set')
  }
} catch (e) {
  console.error(e.message)
  process.exitCode = 1
} finally {
  await app.destroy()
  process.exit(process.exitCode ?? 0)
}
