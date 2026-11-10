/**
 * Акции до конца 2026 года (задание заказчика, 10–11 ноября 2026): записи и
 * баннеры — в Strapi, проверка правилами сайта (scripts/check-content.ts, те
 * же, что при «Опубликовать»), публикация. Повторный запуск обновляет записи
 * по названию: тексты и порядок из файла перезаписывают правки админки.
 *   npm --prefix cms run add:promos     (Strapi при этом остановлен)
 *
 * Баннеры — от заказчика, лежат в assets/promo-banners/<slug>.webp. Скрипт
 * загружает баннер в медиатеку под именем promo-<slug>-<хеш>.webp (подпись —
 * bannerAlt) и ставит в поле «Баннер». Свой баннер, загруженный в админке
 * (имя другое), не трогает; прежний загруженный скриптом — заменяет и
 * удаляет из медиатеки, если файл баннера изменился.
 *
 * retired — названия акций, которые заказчик снял: снимаются с публикации
 * (запись остаётся черновиком, её можно вернуть в админке).
 *
 * Условия, которых заказчик не назвал (сумма заказа для выезда, список
 * моделей), в текстах не придуманы — «уточняйте у менеджера».
 */
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')
const SITE = path.resolve(process.cwd(), '..')
const BANNERS = path.join(SITE, 'assets/promo-banners')

/* Тексты, срок, подписи баннеров и снятые акции — один файл: его же читают тесты */
const { validUntil, promos, retired = [] } = JSON.parse(await readFile(new URL('./promos-2026-12.json', import.meta.url), 'utf8'))

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const docs = app.documents('api::promo.promo')
const upload = app.plugin('upload').service('upload')

/** Баннер акции: id файла в медиатеке и файл на замену; null — ставить нечего */
async function bannerFor(promo, current) {
  const file = path.join(BANNERS, `${promo.slug}.webp`)
  if (!existsSync(file)) return null
  /* Свой прежний баннер скрипт узнаёт по имени promo-<адрес>-<хеш>; другое имя —
     загружен в админке вручную, его не трогаем */
  const generated = current && /^promo-[a-z0-9-]+-[0-9a-f]{8}(\.webp)?$/.test(current.name)
  if (current && !generated) return null
  const hash = createHash('sha1').update(await readFile(file)).digest('hex').slice(0, 8)
  const name = `promo-${promo.slug}-${hash}.webp`
  /* Тот же файл под тем же адресом акции — загружать нечего; сменился файл или
     адрес — загружаем заново (имя файла видно в ссылке на картинку) */
  if (current && current.name.replace(/\.webp$/, '') === name.replace(/\.webp$/, '')) return null
  const { size } = await stat(file)
  const [done] = await upload.upload({
    data: { fileInfo: { name, alternativeText: promo.bannerAlt } },
    files: { filepath: file, originalFilename: name, mimetype: 'image/webp', size },
  })
  return { id: done.id, replaced: current }
}

try {
  for (const promo of promos) {
    const { bannerAlt: _alt, ...fields } = promo
    const data = { ...fields, validUntil }
    const existing = await docs.findFirst({ filters: { title: promo.title }, populate: ['image'] })
    const banner = await bannerFor(promo, existing?.image)
    if (banner) data.image = banner.id
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
    /* Прежний сгенерированный баннер больше нигде не нужен */
    if (banner?.replaced) await upload.remove(banner.replaced)
    console.log(`${existing ? 'обновлено' : 'создано'} и опубликовано: ${promo.title}${banner ? ' — баннер загружен' : ''}`)
  }
  for (const title of retired) {
    const doc = await docs.findFirst({ filters: { title }, status: 'published' })
    if (!doc) { console.log(`снята раньше или не было: ${title}`); continue }
    await docs.unpublish({ documentId: doc.documentId })
    console.log(`снята с публикации: ${title}`)
  }
} catch (error) {
  /* Ошибку — в вывод и код выхода: process.exit в finally её бы проглотил */
  console.error('Ошибка:', error)
  process.exitCode = 1
} finally {
  await app.destroy()
  process.exit(process.exitCode ?? 0)
}
