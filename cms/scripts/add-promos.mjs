/**
 * Акции до конца 2026 года (задание заказчика, 10 ноября 2026): записи — в
 * Strapi, проверка правилами сайта (scripts/check-content.ts, те же, что при
 * «Опубликовать»), публикация. Повторный запуск обновляет записи по названию:
 * баннеры из медиатеки не трогает (поле image не пишется), загруженные в
 * админке тексты и порядок — перезаписывает.
 *   npm --prefix cms run add:promos     (Strapi при этом остановлен)
 * Баннеры заказчик пришлёт позже — загрузить в админке: «Акции» → запись →
 * «Баннер». Условия, которых заказчик не назвал (сумма заказа для выезда,
 * список моделей), в текстах не придуманы — «уточняйте у менеджера».
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')
const SITE = path.resolve(process.cwd(), '..')

/** Последний день всех акций */
const VALID_UNTIL = '2026-12-31'

/* Тексты — отдельным файлом: те же данные читает проверка внешнего вида */
const PROMOS = JSON.parse(await readFile(new URL('./promos-2026-12.json', import.meta.url), 'utf8'))

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const docs = app.documents('api::promo.promo')

try {
  for (const promo of PROMOS) {
    const data = { ...promo, validUntil: VALID_UNTIL }
    const existing = await docs.findFirst({ filters: { title: promo.title } })
    const { documentId } = existing ? await docs.update({ documentId: existing.documentId, data }) : await docs.create({ data })

    const draft = await docs.findOne({ documentId, status: 'draft', populate: ['image'] })
    const check = spawnSync('npx', ['tsx', 'scripts/check-content.ts', '--stdin'], {
      cwd: SITE,
      input: JSON.stringify({ kind: 'promo', record: draft }),
      encoding: 'utf8',
    })
    if (check.status !== 0) throw new Error(`Проверка не запустилась: ${check.stderr}`)
    const problems = JSON.parse(check.stdout)
    if (problems.length) {
      console.log(`«${promo.title}»: публикации нет, замечания:\n - ${problems.join('\n - ')}`)
      continue
    }
    await docs.publish({ documentId })
    console.log(`${existing ? 'обновлено' : 'создано'} и опубликовано: ${promo.title}`)
  }
} catch (error) {
  /* Ошибку — в вывод и код выхода: process.exit в finally её бы проглотил */
  console.error('Ошибка:', error)
  process.exitCode = 1
} finally {
  await app.destroy()
  process.exit(process.exitCode ?? 0)
}
