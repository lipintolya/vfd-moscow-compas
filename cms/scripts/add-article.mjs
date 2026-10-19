/**
 * Добавление статьи: фото из cms/.tmp/articles/<папка> — в медиатеку (с
 * «Что на фото»), статья — черновик, проверка правилами сайта
 * (scripts/check-content.ts, те же, что при «Опубликовать» в админке), и
 * только потом публикация. Если проверка нашла замечания — статья остаётся
 * черновиком, публикации нет.
 *   npm --prefix cms run add:article -- alum   (Strapi при этом остановлен)
 * Текст статьи — ARTICLES в этом файле; фото — cover.webp и interior.webp.
 */
import { stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

/* Strapi — через require: его ESM-сборка в Node не загружается (lodash) */
const { createStrapi, compileStrapi } = createRequire(import.meta.url)('@strapi/strapi')

const SITE = path.resolve(process.cwd(), '..')
const folder = process.argv[2]
if (!folder) throw new Error('Укажите папку: npm --prefix cms run add:article -- <папка>')

/* ── Блоки текста (Strapi Blocks) ── */
const t = (text) => ({ type: 'text', text })
const link = (text, url) => ({ type: 'link', url, children: [t(text)] })
const para = (...parts) => ({ type: 'paragraph', children: parts.map((p) => (typeof p === 'string' ? t(p) : p)) })
const h2 = (text) => ({ type: 'heading', level: 2, children: [t(text)] })
const list = (items, format = 'unordered') => ({ type: 'list', format, children: items.map((i) => ({ type: 'list-item', children: [t(i)] })) })
const textBlock = (...nodes) => ({ __component: 'article.text', content: nodes })
const callout = (kind, title, ...nodes) => ({ __component: 'article.callout', kind, title, text: nodes })

const ARTICLES = {
  alum: {
    title: 'Алюминиевые перегородки в квартире: из чего делают и какие задачи решают',
    slug: 'alyuminievye-peregorodki-v-kvartire',
    publishDate: '2026-10-19',
    kind: 'Статья',
    description: 'Из чего делают алюминиевые перегородки, какие задачи они решают и как выбрать раскладку, стекло и размер под ваш проём.',
    coverAlt: 'Схемы раздвижных алюминиевых перегородок на направляющей: чёрный профиль, светлое и прозрачное стекло',
    seo: {
      metaTitle: 'Алюминиевые перегородки: из чего делают и зачем нужны',
      steps: [
        { name: 'Выберите раскладку, профиль и стекло', text: 'Соберите сочетание в конструкторе на странице перегородок или выберите вместе со специалистом в салоне.' },
        { name: 'Назовите размеры проёма', text: 'Высоту и ширину проёма сообщите по телефону или в салоне. Размеры подбираются с шагом 1 см.' },
        { name: 'Получите расчёт', text: 'Посчитаем стоимость под ваш проём и выбранную отделку.' },
        { name: 'Дождитесь изготовления', text: 'Срок изготовления на фабрике — от 10 рабочих дней.' },
      ],
    },
    summary: [
      'Каркас — алюминиевый профиль, заполнение — стекло 4 мм или триплекс 8 мм.',
      'Створки скользят по направляющей и не открываются в комнату.',
      'Высота створки до 3000 мм, ширина до 1100 мм, размеры подбираются с шагом 1 см.',
      'Раскладок десять, цветов профиля пять, видов стекла тринадцать.',
      'Изготовление от 10 рабочих дней, стоимость считаем по размерам вашего проёма.',
    ],
    keywords: ['алюминиевые перегородки', 'раздвижные перегородки', 'перегородка для зонирования', 'стеклянная перегородка в квартиру', 'перегородка на кухню-гостиную'],
    relatedSlugs: ['dveri-v-stile-loft', 'dveri-so-steklom-ili-gluhie'],
    faq: [
      { q: 'Что такое алюминиевые перегородки?', a: 'Раздвижные створки в алюминиевом профиле со стеклом. Они делят комнату на зоны, занимают меньше места, чем распашная дверь, и не требуют возведения глухой стены.' },
      { q: 'Из чего делают алюминиевые перегородки?', a: 'Каркас собирают из алюминиевого профиля, заполнение — из стекла толщиной 4 мм или триплекса 8 мм. Створки движутся по направляющей, она входит в комплект.' },
      { q: 'Какого размера бывают перегородки?', a: 'Высота створки — до 3000 мм, ширина — до 1100 мм. Размеры подбираются с шагом 1 см под ваш проём.' },
      { q: 'Чем триплекс отличается от стекла 4 мм?', a: 'Триплекс — два слоя стекла с плёнкой между ними, его толщина 8 мм. Обычное стекло — 4 мм. Зеркало, белое и чёрное стекло и Лакобель делают на триплексе.' },
      { q: 'Можно ли выбрать цвет профиля отдельно от стекла?', a: 'Да. Профиль и стекло выбираются независимо: любой цвет профиля сочетается с любым стеклом из списка. Цвета профиля: хром, золото, шампань, чёрный и белый — последний из палитры эмали.' },
      { q: 'Подойдёт ли перегородка для маленькой квартиры?', a: 'Да, если нужно разделить зоны без потери места: створки не открываются в комнату, и проход остаётся свободным.' },
      { q: 'Сколько ждать перегородку?', a: 'Срок изготовления — от 10 рабочих дней. Точный срок и стоимость назовём после расчёта по размерам вашего проёма.' },
    ],
    body: [
      textBlock(
        para('Алюминиевые перегородки — это раздвижные створки в алюминиевом профиле со стеклом. Их ставят там, где комнату нужно разделить на зоны, а возводить стену неудобно или некуда: кухня и гостиная в одном пространстве, спальня с рабочим уголком, прихожая, которая продолжает комнату. Ниже — из чего их делают, какие задачи они решают и на что смотреть при выборе.'),
        h2('Из чего делают алюминиевые перегородки?'),
        para('Перегородка состоит из каркаса и заполнения. Каркас собирают из алюминиевого профиля, заполнение — из стекла толщиной 4 мм или из триплекса 8 мм.'),
        list([
          'Горизонтальный профиль 41 × 25 мм — верх, низ и перекладины створки.',
          'Стоечный профиль 44 × 23 мм — боковые стойки. Бывает со вставками под замок.',
          'Молдинг 20 × 13 мм входит в комплектацию не во всех вариантах.',
          'Направляющая (трек), по которой скользят створки, входит в комплект.',
        ]),
        para('Стекло бывает прозрачным, тонированным, сатинатом, зеркальным или сплошного цвета. Его выбирают отдельно от профиля.'),
        h2('Какие задачи решают алюминиевые перегородки?'),
        para('Главная задача — зонирование: разделить пространство, не возводя глухую стену. Кроме этого, перегородка решает и другие задачи.'),
        list([
          'Створка скользит вдоль проёма и не открывается в комнату, поэтому проход остаётся свободным.',
          'Стекло пропускает свет из соседней зоны, и комната не делится глухой стеной.',
          'Сатинат размывает вид на соседнюю зону, сплошной цвет закрывает его.',
          'Раскладка, профиль и стекло подбираются под конкретную комнату.',
          'Перегородку считают по проёму, а не подбирают из готовых вариантов.',
        ]),
        para('Раскладку, профиль и стекло удобно собрать в конструкторе на странице ', link('перегородок ALUM', '/partitions/alum/'), '. Если нужна другая раздвижная система, посмотрите ', link('перегородки GRAFIA', '/partitions/'), '.'),
      ),
      textBlock(
        h2('Какие бывают размеры и раскладки?'),
        para('Высота створки — до 3000 мм, ширина — до 1100 мм, размеры подбираются с шагом 1 см. Раскладок десять: от одной перекладины (две секции) до сетки 3 × 4 (двенадцать секций). Раскладка задаёт рисунок створки и число стёкол в ней.'),
      ),
      { __component: 'article.photo', alt: 'Раздвижные алюминиевые перегородки ALUM в гостиной: в центре прозрачное стекло, справа белое стекло в чёрном профиле', caption: 'В центре прозрачное стекло, справа белое в чёрном профиле', layout: 'Во всю колонку', _photo: 'interior' },
      textBlock(
        h2('Какое стекло выбрать для перегородки?'),
        para('Стекло определяет, что видно за перегородкой: прозрачное показывает соседнюю зону, сатинат её размывает, зеркало отражает комнату, сплошной цвет закрывает вид. Варианты по толщине — в таблице.'),
      ),
      { __component: 'article.table', markdown: [
        '| Стекло | Толщина | Что даёт |',
        '|---|---|---|',
        '| Прозрачное, бронза, графит | 4 мм | Вид на соседнюю зону; бронза и графит приглушают свет |',
        '| Сатинат: белый, бронза, графит | 4 мм | Приватность: вид размыт, свет проходит |',
        '| Прозрачный, белый, чёрный | 8 мм, триплекс | Прозрачность или ровный сплошной цвет |',
        '| Зеркало: обычное, бронза, графит | 8 мм, триплекс | Отражение комнаты |',
        '| Лакобель | 8 мм, триплекс | Непрозрачное стекло, цвет из палитры фабрики |',
      ].join('\n') },
      callout('Обратите внимание', 'Белое стекло без оттенка',
        para('У обычного прозрачного стекла лёгкий зеленоватый оттенок, и он заметен на окрашенном стекле. Для чистого цвета перегородку можно сделать на стекле Opti White: у него такого оттенка нет.'),
      ),
      textBlock(
        h2('Какой цвет профиля выбрать?'),
        para('Цвет профиля выбирают с учётом интерьера и дверей. Чёрный делает линии графичными и хорошо смотрится с прозрачным и тонированным стеклом. Хром и шампань сдержаннее и подходят светлым интерьерам, золото добавляет тепла. Белый — цвет эмали фабрики: он растворяется в светлой стене.'),
        h2('Как сочетать перегородку с дверями?'),
        para('Цвет профиля, фурнитуру и стекло подбирайте вместе с дверями: тогда линии в квартире читаются как один ряд. Двери можно посмотреть в ', link('каталоге', '/catalog/'), '.'),
      ),
      textBlock(
        h2('Как заказать перегородку?'),
        para('Заказ идёт в четыре шага: выбираете раскладку, профиль и стекло, называете размеры проёма, получаете расчёт и ждёте изготовления от 10 рабочих дней.'),
        list([
          'Выберите раскладку, профиль и стекло в конструкторе на сайте или вместе со специалистом в салоне.',
          'Назовите размеры проёма: высоту и ширину, с шагом 1 см.',
          'Получите расчёт стоимости под ваш проём и выбранную отделку.',
          'Дождитесь изготовления: срок от 10 рабочих дней.',
        ], 'ordered'),
      ),
      callout('Совет', 'Перед заказом измерьте проём',
        para('Перегородку считаем по размерам вашего проёма, поэтому точные высота и ширина нужны до расчёта. Высота створки — до 3000 мм, ширина — до 1100 мм.'),
      ),
      textBlock(
        para('Соберите перегородку в конструкторе на ', link('странице ALUM', '/partitions/alum/'), ' или приезжайте в салон: подберём раскладку, профиль и стекло и рассчитаем перегородку под ваш проём.'),
      ),
    ],
    coverFile: 'cover.webp',
    photoFiles: { interior: 'interior.webp' },
  },
}

const article = ARTICLES[folder]
if (!article) throw new Error(`Нет текста статьи для «${folder}»`)
const dir = path.join(process.cwd(), '.tmp/articles', folder)

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

async function uploadPhoto(file, alt) {
  const full = path.join(dir, file)
  const { size } = await stat(full)
  const [done] = await upload.upload({
    data: { fileInfo: { name: file, alternativeText: alt } },
    files: { filepath: full, originalFilename: file, mimetype: 'image/webp', size },
  })
  console.log(`фото ${file} → медиатека (${done.id})`)
  return done.id
}

try {
  if (await articles.findFirst({ filters: { slug: article.slug }, status: 'draft' })) {
    throw new Error(`Статья «${article.slug}» уже есть`)
  }
  const cover = await uploadPhoto(article.coverFile, article.coverAlt)
  const body = []
  for (const block of article.body) {
    if (block.__component === 'article.photo') {
      const { _photo, ...rest } = block
      body.push({ ...rest, image: await uploadPhoto(article.photoFiles[_photo], rest.alt) })
    } else {
      body.push(block)
    }
  }

  const related = []
  for (const s of article.relatedSlugs) {
    const doc = await articles.findFirst({ filters: { slug: s }, status: 'draft' })
    if (doc) related.push(doc.documentId)
    else console.log(`нет статьи «${s}» — связь не добавлена`)
  }

  const { title, slug, publishDate, kind, description, coverAlt, seo, summary, keywords, faq } = article
  const created = await articles.create({
    data: {
      title, slug, publishDate, kind, description, coverAlt, cover, seo,
      summary: summary.map((text) => ({ text })),
      keywords: keywords.map((text) => ({ text })),
      faq, body, related,
    },
  })
  const documentId = created.documentId

  const others = await articles.findMany({ status: 'draft', fields: ['title'], filters: { documentId: { $ne: documentId } } })
  const otherTitles = others.map((o) => o.title)
  const draft = await articles.findOne({ documentId, status: 'draft', populate: deepPopulate('api::article.article') })
  const check = spawnSync('npx', ['tsx', 'scripts/check-content.ts', '--stdin'], {
    cwd: SITE,
    input: JSON.stringify({ kind: 'article', record: draft, otherTitles }),
    encoding: 'utf8',
  })
  if (check.status !== 0) throw new Error(`Проверка не запустилась: ${check.stderr}`)
  const problems = JSON.parse(check.stdout)
  if (problems.length) {
    console.log('Публикация не выполнена, замечания:\n - ' + problems.join('\n - '))
    console.log(`Черновик остался: ${slug}`)
    process.exitCode = 1
  } else {
    await articles.publish({ documentId })
    console.log(`опубликовано: ${slug} (${body.length} блоков, ${faq.length} вопросов)`)
  }
} catch (e) {
  console.error(e.message)
  process.exitCode = 1
} finally {
  await app.destroy()
  process.exit(process.exitCode ?? 0)
}
