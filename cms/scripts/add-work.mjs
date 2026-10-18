/**
 * Добавление одной работы портфолио: фото из cms/.tmp/works/<папка> — в
 * медиатеку (с «Что на фото»), запись — черновик, проверка правилами сайта
 * (scripts/check-content.ts, те же, что при «Опубликовать» в админке), и
 * только потом публикация. Если проверка нашла замечания — запись остаётся
 * черновиком, публикации нет.
 *   npm --prefix cms run add:work -- flet-grafit   (Strapi при этом остановлен)
 * Описание работы — WORK в этом файле; фото — по порядку имён файлов.
 */
import { readdir, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

/* Strapi — через require: его ESM-сборка в Node не загружается (lodash) */
const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')

const SITE = path.resolve(process.cwd(), '..')
const folder = process.argv[2]
if (!folder) throw new Error('Укажите папку с фото: npm --prefix cms run add:work -- <папка>')

const WORK = {
  'flet-grafit': {
    title: 'Межкомнатные двери «Флэт» в графитовой эмали, Москва',
    slug: 'flet-grafit-chastny-dom',
    metaTitle: 'Межкомнатные двери Флэт в эмали — работа в Москве',
    date: '2026-10-17',
    category: 'Межкомнатные',
    objectType: 'Частный дом',
    location: 'Москва',
    model: 'Флэт',
    doorCount: 5,
    description: 'Межкомнатная дверь ВФД «Флэт» в графитовой эмали: полотно с филёнкой на стене из светлой доски, Москва.',
    story: 'Модель «Флэт» от ВФД: полотна в графитовой эмали, филёнка держит линию фасада. Подбор двери по цвету и стилю интерьера — в салоне, замер и монтаж — по объекту.',
    /* «Что на фото» — по порядку файлов: 31, 32, 33, 34, 35 */
    alts: [
      'Графитовая дверь ВФД «Флэт» в эмали на стене из светлой доски',
      'Графитовая дверь «Флэт» в эмали рядом с плетёной люлькой на деревянной подставке',
      'Графитовая дверь «Флэт» в эмали рядом с плетёной люлькой на светлом ламинате',
      'Графитовая дверь «Флэт» в эмали в коридоре, слева кухонный гарнитур',
      'Графитовая дверь «Флэт» в эмали у стены из светлой доски, вид в глубину коридора',
    ],
  },
  'reiki': {
    title: 'Декоративные рейки как перегородка в квартире, Москва',
    slug: 'dekorativnye-reyki-peregorodka-kvartira',
    metaTitle: 'Декоративные рейки как перегородка — работа в Москве',
    date: '2026-09-09',
    category: 'Перегородки',
    objectType: 'Квартира',
    location: 'Москва',
    model: null,
    doorCount: null,
    description: 'Декоративная перегородка из деревянных реек разделяет кухню и обеденную зону, не закрывая свет и вид.',
    story: 'Рейки стоят от пола почти до потолка: пространство разделено, но комната остаётся единой. Между рейками проходит свет, а кухня и обеденная зона видны друг из друга.',
    alts: [
      'Вертикальные деревянные рейки разделяют кухню и обеденную зону в квартире',
    ],
  },
  'dvustvorchatye': {
    title: 'Двустворчатые двери с английской решёткой и фрамугой, Москва',
    slug: 'dvustvorchatye-dveri-angliyskaya-reshetka-framuga',
    metaTitle: 'Двустворчатые двери с английской решёткой — работа в Москве',
    date: '2025-10-20',
    category: 'Межкомнатные',
    objectType: 'Квартира',
    location: 'Москва',
    model: null,
    doorCount: null,
    description: 'Двустворчатая межкомнатная дверь с английской решёткой и фрамугой: классика, проверенная веками.',
    story: 'Английская решётка — классическое остекление из мелких квадратов. В сочетании с фрамугой дверь выглядит парадно и становится главным элементом проёма.',
    alts: [
      'Двустворчатые межкомнатные двери с английской решёткой и фрамугой в проёме',
    ],
  },
}[folder]
if (!WORK) throw new Error(`Нет описания работы для «${folder}»`)

const dir = path.join(process.cwd(), '.tmp/works', folder)
const files = (await readdir(dir)).filter((f) => /^\d+\.webp$/.test(f)).sort()
if (files.length !== WORK.alts.length) throw new Error(`Фото ${files.length}, подписей ${WORK.alts.length}`)

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')

try {
  if (await app.documents('api::work.work').findFirst({ filters: { slug: WORK.slug } })) {
    throw new Error(`Работа «${WORK.slug}» уже есть`)
  }

  const images = []
  for (const [i, f] of files.entries()) {
    const file = path.join(dir, f)
    const { size } = await stat(file)
    const [done] = await upload.upload({
      data: { fileInfo: { name: f, alternativeText: WORK.alts[i] } },
      files: { filepath: file, originalFilename: f, mimetype: 'image/webp', size },
    })
    images.push(done.id)
    console.log(`фото ${f} → медиатека (${done.id})`)
  }

  const { title, slug, metaTitle, date, category, objectType, location, model, doorCount, description, story } = WORK
  const created = await app.documents('api::work.work').create({
    data: { title, slug, metaTitle, date, category, objectType, location, model, doorCount, description, story, images },
  })
  const documentId = created.documentId

  /* Проверка — та же, что при «Опубликовать» в админке */
  const draft = await app.documents('api::work.work').findOne({
    documentId,
    status: 'draft',
    populate: ['images', 'features', 'tags', 'catalogLink'],
  })
  const check = spawnSync('npx', ['tsx', 'scripts/check-content.ts', '--stdin'], {
    cwd: SITE,
    input: JSON.stringify({ kind: 'work', record: draft }),
    encoding: 'utf8',
  })
  if (check.status !== 0) throw new Error(`Проверка не запустилась: ${check.stderr}`)
  const problems = JSON.parse(check.stdout)
  if (problems.length) {
    console.log('Публикация не выполнена, замечания:\n - ' + problems.join('\n - '))
    console.log(`Черновик остался: ${slug}`)
  } else {
    await app.documents('api::work.work').publish({ documentId })
    console.log(`опубликовано: ${slug} (${images.length} фото)`)
  }
} finally {
  await app.destroy()
  process.exit(0)
}
