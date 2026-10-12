# Strapi, план 2: статьи из блоков

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Статьи и публикации ведутся в Strapi блоками (текст, фото, галерея, выноска, видео, таблица, цены) с подстановками `{адрес салона}`; 11 нынешних статей перенесены, страницы сайта по тексту не меняются, у директора есть инструкция.

**Architecture:** Раздел `api::article.article` с dynamic zone `body` из компонентов `article.*`. Сайт забирает опубликованные статьи загрузчиком в коллекцию `articles` (вместо `glob(*.mdoc)`); `toArticle()` превращает блоки в готовые к выводу `SiteBlock` (HTML текста со стабильными якорями заголовков, фото с `srcset`), считает оглавление и текст для «мин чтения». Страница статьи выводит блоки компонентом `ArticleBlocks.astro` из нынешних компонентов статей. Перенос — двумя шагами: `scripts/export-articles.mjs` (Markdoc → JSON блоков, сайт) и `cms/scripts/import-articles.mjs` (фото в медиатеку + записи, Strapi).

**Tech Stack:** Strapi 5.57.0 (Blocks, dynamic zone), Astro 7 content layer, `@markdoc/markdoc` (только для переноса), `github-slugger` (якоря как у Astro Markdoc), node:test через tsx.

**Spec:** `docs/superpowers/specs/2026-10-11-strapi-cms-design.md` (разделы «Статья», «Блоки статьи», «Подстановки в тексте», «Как сайт читает Strapi», «Перенос и проверка»). План 1 выполнен: `docs/superpowers/plans/2026-10-11-strapi-1-foundation-promos-works.md`.

## Global Constraints

- Strapi `5.57.0`, `@strapi/*` — точные версии; интерфейс и все подписи — по-русски.
- Сайт читает только опубликованное по ключу только для чтения; ошибка Strapi или записи — ошибка сборки с названием статьи.
- После переноса тексты всех страниц сайта совпадают с нынешними (`node scripts/compare-builds.mjs <эталон> dist` → 0 изменений, кроме перечисленных в задаче).
- Неизвестная подстановка — ошибка сборки; список подстановок — подсказкой у полей и в инструкции.
- Бренд-данные — только из `src/config/site.ts` и источников `ARTICLE_VARS`; никаких hex/px в компонентах.
- Каталог и цены — Supabase, не трогаем. Видео — Strapi-медиатека только для ролика статьи; остальные ролики сайта не трогаем.
- Коммиты — в `main`; push — только по просьбе пользователя; деплой не запускать.
- Перед запуском: `npm run cms` (Strapi на :1337) и `npm run dev` (:4321) — оба нужны для проверок.

## Review Focus

1. Директор вставил в текст картинку или блок кода кнопками редактора Blocks (узлы `image`, `code`) → статья собирается, картинка выводится (тест — Task 2).
2. Два одинаковых подзаголовка в статье → разные якоря (`…`, `…-1`), оглавление ведёт на нужный (тест — Task 2).
3. Текст с `<`, `&`, `"` или `<script>` → выводится как текст, не как разметка (тест — Task 2).
4. Пустой абзац, который редактор Strapi оставляет после Enter → не превращается в `<p></p>` (тест — Task 2).
5. Опечатка в подстановке `{адрес салона }`/`{адрес}` → пробелы по краям прощаются, неизвестное имя — ошибка с названием статьи и подстановки (тест — Task 1).

---

## Файлы

**Создаются:**
- `src/data/article-substitutions.ts` — русские имена подстановок → пути `ARTICLE_VARS`
- `src/lib/article-substitutions.ts` — `fillSubstitutions`, `stripSubstitutions`
- `src/lib/article-blocks.ts` — блоки Strapi → `SiteBlock[]`, HTML текста, якоря, текст для подсчёта слов
- `src/components/articles/ArticleBlocks.astro` — вывод блоков
- `cms/src/api/article/**`, `cms/src/components/article/*.json`
- `scripts/lib/mdoc-to-blocks.mjs`, `scripts/export-articles.mjs` — перенос, сторона сайта
- `cms/scripts/import-articles.mjs` — перенос, сторона Strapi
- `docs/director-guide.md` — инструкция для директора
- `tests/article-substitutions.test.ts`, `tests/article-blocks.test.ts`, `tests/mdoc-to-blocks.test.ts`

**Меняются:** `src/lib/article-vars.ts`, `src/lib/articles.ts`, `src/lib/strapi-content.ts`, `src/content.config.ts`, `src/pages/articles/[slug].astro`, `src/components/articles/{ArticleCard,Figure,Photo}.astro`, `src/components/home/Spotlight.astro`, `astro.config.mjs`, `cms/src/bootstrap/{labels,access}.ts`, `cms/src/components/shared/item.json`, `cms/package.json`, `package.json`, `README.md`, `CLAUDE.md`, `cms/README.md`.

**Удаляются (Task 7):** `src/content/articles/*.mdoc`, `markdoc.config.ts`, зависимость `@astrojs/markdoc`, `scripts/gen-article-images.mjs`, `src/data/article-images.ts`, `src/lib/article-images.ts`, `public/renders/articles/`, `src/components/articles/{Cards,Card,ProjectsSlider}.astro` (если после переноса не используются).

---

### Task 1: Подстановки `{адрес салона}`

**Files:** Create `src/data/article-substitutions.ts`, `src/lib/article-substitutions.ts`, `tests/article-substitutions.test.ts`; Modify `src/lib/article-vars.ts`.

**Interfaces:**
- Produces: `ARTICLE_SUBSTITUTIONS: Record<string, string>` (имя → путь); `articleVar(path: string): string | undefined`; `fillSubstitutions(text: string, where?: string): string`; `stripSubstitutions(text: string): string`.

- [ ] **Step 0: Эталон сборки до плана 2**

Strapi запущен. `npm run build && rm -rf "$SCRATCH/dist-before-2" && cp -R dist "$SCRATCH/dist-before-2"` (`$SCRATCH` — папка сессии для временных файлов). Expected: сборка проходит, 385 страниц.

- [ ] **Step 1: Тесты (падают)**

`tests/article-substitutions.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ARTICLE_SUBSTITUTIONS } from '../src/data/article-substitutions'
import { ARTICLE_VARS, articleVar } from '../src/lib/article-vars'
import { fillSubstitutions, stripSubstitutions } from '../src/lib/article-substitutions'

const leaves = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? leaves(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`])

test('у каждой переменной статей есть русское имя, и каждое имя ведёт к значению', () => {
  const paths = new Set(Object.values(ARTICLE_SUBSTITUTIONS))
  for (const path of leaves(ARTICLE_VARS)) assert.ok(paths.has(path), `нет имени для ${path}`)
  for (const [name, path] of Object.entries(ARTICLE_SUBSTITUTIONS)) assert.equal(typeof articleVar(path), 'string', `${name} → ${path}`)
})

test('подстановка — значение из данных сайта', () => {
  assert.equal(fillSubstitutions('Адрес: {адрес салона}.'), `Адрес: ${ARTICLE_VARS.salon.address}.`)
  assert.equal(fillSubstitutions('Без подстановок'), 'Без подстановок')
})

test('пробелы по краям имени прощаются', () => {
  assert.equal(fillSubstitutions('{ телефон }'), ARTICLE_VARS.salon.phone)
})

test('неизвестная подстановка — ошибка с местом и именем', () => {
  assert.throws(() => fillSubstitutions('Звоните {телефон салона}', 'Статья «Скрытые двери»'),
    /Статья «Скрытые двери»: неизвестная подстановка \{телефон салона\}/)
})

test('для подсчёта слов подстановки убираются', () => {
  assert.equal(stripSubstitutions('Салон {название салона} работает'), 'Салон   работает')
})
```
Run: `npm test` — Expected: FAIL (`Cannot find module '../src/data/article-substitutions'`).

- [ ] **Step 2: Реализация**

`src/lib/article-vars.ts` — вынести обход пути в экспорт и использовать его в `fillArticleVars`:
```ts
/** Значение переменной статей по пути 'salon.address'; нет такой — undefined */
export function articleVar(path: string): string | undefined {
  const value = path.split('.').reduce<unknown>(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined),
    ARTICLE_VARS,
  )
  return typeof value === 'string' ? value : undefined
}

export function fillArticleVars(text: string): string {
  return text.replace(/\{%\s*\$([\w.]+)\s*%\}/g, (_, path: string) => {
    const value = articleVar(path)
    if (value === undefined) throw new Error(`Статья: нет переменной $${path}`)
    return value
  })
}
```

`src/data/article-substitutions.ts`:
```ts
/**
 * Подстановки в текстах статей (Strapi): директор пишет {адрес салона},
 * {цена комплекта Секрет} … — при сборке на их месте значения из данных
 * сайта (src/lib/article-vars.ts). Имя → путь в ARTICLE_VARS.
 * Новое имя — сюда и в инструкцию docs/director-guide.md (тест сверяет).
 */
export const ARTICLE_SUBSTITUTIONS: Record<string, string> = {
  'название салона':                 'salon.name',
  'бренд':                           'salon.brand',
  'в городе':                        'salon.city',
  'торговый центр':                  'salon.mall',
  'адрес салона':                    'salon.address',
  'часы работы':                     'salon.hours',
  'телефон':                         'salon.phone',
  'официальный дилер':               'salon.dealer',
  'цена комплекта Секрет':           'hidden.kitFrom',
  'цена полотна Секрет':             'hidden.bladeFrom',
  'цена комплекта Секрет Реверс':    'hidden.reversKitFrom',
  'цена комплекта Рефлекс':          'hidden.reflexKitFrom',
  'высота скрытой двери':            'hidden.height',
  'макс. высота скрытой двери':      'hidden.maxHeight',
  'макс. высота Рефлекс':            'hidden.reflexMaxHeight',
  'срок изготовления скрытой двери': 'hidden.leadTime',
  'ширины Секрет':                   'hidden.widths',
  'ширины Секрет Реверс':            'hidden.reversWidths',
  'зазор скрытой двери':             'hidden.gap',
  'мин. толщина стены':              'hidden.wallMin',
  'нагрузка на петли':               'hidden.hingeLoad',
  'слои покраски':                   'hidden.paintCoats',
  'срок монтажа скрытой двери':      'hidden.installDays',
  'профиль короба':                  'hidden.boxProfile',
  'высоты на складе':                'hidden.stockHeights',
  'цена комплекта 2300':             'hidden.kit2300From',
  'надбавка за 2300':                'hidden.surcharge2300',
  'стандартная высота двери':        'doors.height',
  'макс. высота двери':              'doors.maxHeight',
  'цена фальшфрамуги':               'decor.framugaKitFrom',
  'размер фальшфрамуги':             'decor.framugaSize',
  'условия замера':                  'services.measure',
  'условия установки':               'services.install',
}

/** Путь в ARTICLE_VARS → имя подстановки (для переноса статей из Markdoc) */
export const SUBSTITUTION_BY_PATH: Record<string, string> =
  Object.fromEntries(Object.entries(ARTICLE_SUBSTITUTIONS).map(([name, path]) => [path, name]))
```
Если тест «у каждой переменной есть имя» назовёт путь, которого нет в списке (в `ARTICLE_VARS` появилось новое поле), — добавить имя по тому же образцу.

`src/lib/article-substitutions.ts`:
```ts
/* Подстановки {имя} в текстах статей из Strapi — значения из данных сайта.
   Имена — src/data/article-substitutions.ts. Неизвестное имя — ошибка
   сборки: опечатка не должна уйти на сайт. */
import { ARTICLE_SUBSTITUTIONS } from '../data/article-substitutions'
import { articleVar } from './article-vars'

const TOKEN = /\{([^{}\n]{1,60})\}/g

export function fillSubstitutions(text: string, where = 'Статья'): string {
  return text.replace(TOKEN, (_, raw: string) => {
    const name = raw.trim()
    const path = ARTICLE_SUBSTITUTIONS[name]
    const value = path ? articleVar(path) : undefined
    if (value === undefined) throw new Error(`${where}: неизвестная подстановка {${name}} — список в docs/director-guide.md`)
    return value
  })
}

/** Текст без подстановок — для подсчёта слов (как раньше без {% $… %}) */
export const stripSubstitutions = (text: string) => text.replace(TOKEN, ' ')
```

- [ ] **Step 3: Тесты проходят**

Run: `npm test` — Expected: PASS (все, включая прежние 13).

- [ ] **Step 4: Commit**
```bash
git add src/data/article-substitutions.ts src/lib/article-substitutions.ts src/lib/article-vars.ts tests/article-substitutions.test.ts
git commit -m "feat(articles): подстановки {адрес салона} для статей из Strapi"
```

---

### Task 2: Блоки статьи → вывод на сайте

**Files:** Create `src/lib/article-blocks.ts`, `tests/article-blocks.test.ts`.

**Interfaces:**
- Consumes: `fillSubstitutions`, `stripSubstitutions` (Task 1); `strapiImage`, `StrapiMedia`, `SiteImage` (`src/lib/strapi.ts`).
- Produces:
  - `type RichNode` (узлы Strapi Blocks), `interface Heading { depth: number; slug: string; text: string }`;
  - `type StrapiBlock` (элементы dynamic zone, поле `__component`);
  - `type SiteBlock` (см. код);
  - `toSiteBlocks(raw: StrapiBlock[], where: string): { blocks: SiteBlock[]; headings: Heading[]; text: string }`;
  - `CALLOUT_KIND`, `PHOTO_LAYOUT` — словари русских значений Strapi.

- [ ] **Step 1: Тесты (падают)**

`tests/article-blocks.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toSiteBlocks, type StrapiBlock } from '../src/lib/article-blocks'
import { ARTICLE_VARS } from '../src/lib/article-vars'

const t = (text: string, mods: Record<string, boolean> = {}) => ({ type: 'text' as const, text, ...mods })
const text = (...content: unknown[]) => ({ __component: 'article.text', content }) as StrapiBlock
const img = (n: number) => ({ url: `/uploads/i${n}.jpg`, width: 3000, height: 2000, alternativeText: null,
  formats: { medium: { url: `/uploads/medium_i${n}.jpg`, width: 960, height: 640 }, large: { url: `/uploads/large_i${n}.jpg`, width: 1280, height: 853 }, xlarge: { url: `/uploads/xlarge_i${n}.jpg`, width: 1920, height: 1280 } } })

test('текст: абзац, жирный, ссылка, подстановка', () => {
  const { blocks, text: body } = toSiteBlocks([text(
    { type: 'paragraph', children: [t('Салон: '), t('{адрес салона}', { bold: true }), t(', '), { type: 'link', url: '/contacts/', children: [t('как добраться')] }] },
  )], 'Т')
  assert.deepEqual(blocks, [{ type: 'text', html: `<p>Салон: <strong>${ARTICLE_VARS.salon.address}</strong>, <a href="/contacts/">как добраться</a></p>` }])
  assert.match(body, /Салон:\s+, как добраться \/contacts\//)
})

test('заголовки: якоря как у Markdoc, одинаковые — с номером', () => {
  const { blocks, headings } = toSiteBlocks([text(
    { type: 'heading', level: 2, children: [t('Что такое скрытая дверь')] },
    { type: 'heading', level: 3, children: [t('Плюсы')] },
    { type: 'heading', level: 3, children: [t('Плюсы')] },
  )], 'Т')
  assert.deepEqual(headings, [
    { depth: 2, slug: 'что-такое-скрытая-дверь', text: 'Что такое скрытая дверь' },
    { depth: 3, slug: 'плюсы', text: 'Плюсы' },
    { depth: 3, slug: 'плюсы-1', text: 'Плюсы' },
  ])
  assert.equal((blocks[0] as { html: string }).html, '<h2 id="что-такое-скрытая-дверь">Что такое скрытая дверь</h2><h3 id="плюсы">Плюсы</h3><h3 id="плюсы-1">Плюсы</h3>')
})

test('списки и цитата', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [t('Раз')] }, { type: 'list-item', children: [t('Два')] }] },
    { type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [t('Один')] }] },
    { type: 'quote', children: [t('Цитата')] },
  )], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<ul><li>Раз</li><li>Два</li></ul><ol><li>Один</li></ol><blockquote><p>Цитата</p></blockquote>')
})

test('разметка из текста экранируется', () => {
  const { blocks } = toSiteBlocks([text({ type: 'paragraph', children: [t('a < b & "c" <script>x</script>')] })], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<p>a &lt; b &amp; &quot;c&quot; &lt;script&gt;x&lt;/script&gt;</p>')
})

test('пустой абзац от редактора не выводится', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'paragraph', children: [t('Текст')] },
    { type: 'paragraph', children: [t('')] },
  )], 'Т')
  assert.equal((blocks[0] as { html: string }).html, '<p>Текст</p>')
})

test('картинка и код, вставленные в текст кнопками редактора, выводятся', () => {
  const { blocks } = toSiteBlocks([text(
    { type: 'image', image: { ...img(1), alternativeText: 'Дверь' }, children: [t('')] },
    { type: 'code', children: [t('a < b')] },
  )], 'Т')
  const html = (blocks[0] as { html: string }).html
  assert.match(html, /<img src="\/uploads\/large_i1\.jpg" srcset="[^"]+" alt="Дверь"/)
  assert.match(html, /<pre><code>a &lt; b<\/code><\/pre>/)
})

test('неизвестный узел текста — ошибка с названием статьи', () => {
  assert.throws(() => toSiteBlocks([text({ type: 'table', children: [] })], 'Статья «Х»'), /Статья «Х»: .*table/)
})

test('фото, галерея, выноска, видео, таблица, цены', () => {
  const { blocks, text: body } = toSiteBlocks([
    { __component: 'article.photo', image: img(1), alt: 'Короб', caption: 'Подпись', layout: 'Узкое (схема)' },
    { __component: 'article.gallery', photos: [{ image: img(2), alt: null, caption: 'Urban', link: '/catalog/series/urban/' }, { image: img(3), alt: 'Б', caption: null, link: null }], columns: 2, doors: true },
    { __component: 'article.callout', kind: 'Важно', title: 'Заголовок', text: [{ type: 'paragraph', children: [t('Тел.: {телефон}')] }] },
    { __component: 'article.video', video: { url: '/uploads/v.mp4' }, poster: img(4), title: 'Ролик', caption: null, narrow: true },
    { __component: 'article.table', markdown: '| Плюсы | Минусы |\n|---|---|\n| Стена от {мин. толщина стены} | Дороже |' },
    { __component: 'article.hidden-prices' },
    { __component: 'article.coating-prices' },
  ] as StrapiBlock[], 'Т')
  assert.deepEqual(blocks.map((b) => b.type), ['photo', 'gallery', 'callout', 'video', 'table', 'hiddenPrices', 'coatingPrices'])
  const [photo, gallery, callout, video, table] = blocks as any[]
  assert.equal(photo.layout, 'narrow')
  assert.equal(photo.image.src, '/uploads/large_i1.jpg')
  assert.equal(photo.image.alt, 'Короб')
  assert.equal(photo.zoom, '/uploads/xlarge_i1.jpg')
  assert.equal(gallery.photos[0].image.alt, 'Urban')
  assert.equal(gallery.photos[0].href, '/catalog/series/urban/')
  assert.equal(gallery.doors, true)
  assert.equal(callout.kind, 'info')
  assert.equal(callout.html, `<p>Тел.: ${ARTICLE_VARS.salon.phone}</p>`)
  assert.equal(video.src, '/uploads/v.mp4')
  assert.deepEqual(table.head, ['Плюсы', 'Минусы'])
  assert.deepEqual(table.rows, [[`Стена от ${ARTICLE_VARS.hidden.wallMin}`, 'Дороже']])
  assert.match(body, /Тел\.:/)
  assert.match(body, /Плюсы Минусы Стена от\s+Дороже/)
  assert.doesNotMatch(body, /Подпись|Заголовок|Ролик/)
})

test('таблица без строки-разделителя — понятная ошибка', () => {
  assert.throws(() => toSiteBlocks([{ __component: 'article.table', markdown: '| a | b |\n| c | d |' } as StrapiBlock], 'Статья «Х»'),
    /Статья «Х»: таблица/)
})
```
Run: `npm test` — Expected: FAIL (`Cannot find module '../src/lib/article-blocks'`).

- [ ] **Step 2: Реализация**

`src/lib/article-blocks.ts`:
```ts
/**
 * Тело статьи из Strapi (dynamic zone body) → блоки для ArticleBlocks.astro.
 * Текст (Strapi Blocks) — готовый HTML: подстановки {…} заполнены, разметка
 * из текста экранирована, у заголовков якоря как у прежнего Markdoc
 * (github-slugger, один на статью). Попутно — оглавление (headings) и текст
 * для «мин чтения» (как раньше: без подписей к фото и подстановок).
 */
import Slugger from 'github-slugger'
import { fillSubstitutions, stripSubstitutions } from './article-substitutions'
import { strapiImage, type SiteImage, type StrapiMedia } from './strapi'

interface Leaf { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }
interface Link { type: 'link'; url: string; children: Leaf[] }
type Inline = Leaf | Link
export type RichNode =
  | { type: 'paragraph' | 'quote' | 'code'; children: Inline[] }
  | { type: 'heading'; level: number; children: Inline[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: Inline[] }[] }
  | { type: 'image'; image: StrapiMedia; children?: Inline[] }

export interface Heading { depth: number; slug: string; text: string }

type Opt = string | null | undefined
export type StrapiBlock =
  | { __component: 'article.text'; content: RichNode[] }
  | { __component: 'article.photo'; image: StrapiMedia; alt: string; caption?: Opt; layout?: Opt }
  | { __component: 'article.gallery'; photos: { image: StrapiMedia; alt?: Opt; caption?: Opt; link?: Opt }[]; columns?: number | null; doors?: boolean | null }
  | { __component: 'article.callout'; kind?: Opt; title?: Opt; text: RichNode[] }
  | { __component: 'article.video'; video: StrapiMedia; poster: StrapiMedia; title: string; caption?: Opt; narrow?: boolean | null }
  | { __component: 'article.table'; markdown: string }
  | { __component: 'article.hidden-prices' }
  | { __component: 'article.coating-prices' }

export type SiteBlock =
  | { type: 'text'; html: string }
  | { type: 'photo'; image: SiteImage; zoom: string; caption?: string; layout: 'column' | 'narrow' | 'natural' }
  | { type: 'gallery'; photos: { image: SiteImage; zoom: string; caption?: string; href?: string }[]; columns?: number; doors: boolean }
  | { type: 'callout'; kind: 'tip' | 'info' | 'warning'; title?: string; html: string }
  | { type: 'video'; src: string; poster: string; title: string; caption?: string; narrow: boolean }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'hiddenPrices' }
  | { type: 'coatingPrices' }

/** Значения полей Strapi (по-русски) → значения сайта */
export const CALLOUT_KIND: Record<string, 'tip' | 'info' | 'warning'> = { 'Совет': 'tip', 'Важно': 'info', 'Обратите внимание': 'warning' }
export const PHOTO_LAYOUT: Record<string, 'column' | 'narrow' | 'natural'> = { 'Во всю колонку': 'column', 'Узкое (схема)': 'narrow', 'Без обрезки': 'natural' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const opt = (v: Opt) => v || undefined

class TextRenderer {
  words: string[] = []
  headings: Heading[] = []
  constructor(private slugger: Slugger, private where: string) {}

  private leaf(l: Leaf): string {
    this.words.push(stripSubstitutions(l.text))
    let html = esc(fillSubstitutions(l.text, this.where))
    if (l.code) html = `<code>${html}</code>`
    if (l.bold) html = `<strong>${html}</strong>`
    if (l.italic) html = `<em>${html}</em>`
    if (l.underline) html = `<u>${html}</u>`
    if (l.strikethrough) html = `<s>${html}</s>`
    return html
  }
  private inline(nodes: Inline[]): string {
    return nodes.map((n) => {
      if (n.type === 'link') {
        const html = `<a href="${esc(n.url)}">${n.children.map((c) => this.leaf(c)).join('')}</a>`
        this.words.push(n.url)
        return html
      }
      return this.leaf(n)
    }).join('')
  }
  private plain(nodes: Inline[]): string {
    return nodes.map((n) => (n.type === 'link' ? n.children.map((c) => c.text).join('') : n.text)).join('')
  }
  render(nodes: RichNode[]): string {
    return nodes.map((n) => {
      switch (n.type) {
        case 'paragraph': {
          if (!this.plain(n.children).trim()) return ''
          return `<p>${this.inline(n.children)}</p>`
        }
        case 'heading': {
          const text = fillSubstitutions(this.plain(n.children), this.where)
          const slug = this.slugger.slug(text)
          this.headings.push({ depth: n.level, slug, text })
          return `<h${n.level} id="${esc(slug)}">${this.inline(n.children)}</h${n.level}>`
        }
        case 'list': {
          const tag = n.format === 'ordered' ? 'ol' : 'ul'
          return `<${tag}>${n.children.map((item) => `<li>${this.inline(item.children)}</li>`).join('')}</${tag}>`
        }
        case 'quote':
          return `<blockquote><p>${this.inline(n.children)}</p></blockquote>`
        case 'code':
          return `<pre><code>${esc(this.plain(n.children))}</code></pre>`
        case 'image': {
          const img = strapiImage(n.image, 1280)
          return `<p><img src="${esc(img.src)}"${img.srcset ? ` srcset="${esc(img.srcset)}" sizes="(min-width: 1312px) 1280px, calc(100vw - 32px)"` : ''} alt="${esc(img.alt)}" loading="lazy" decoding="async"></p>`
        }
        default:
          throw new Error(`${this.where}: в тексте неизвестный элемент «${(n as { type: string }).type}»`)
      }
    }).join('')
  }
}

function parseTable(markdown: string, where: string, words: string[]): { head: string[]; rows: string[][] } {
  const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean)
  const cells = (line: string) => line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  if (lines.length < 2 || !/^\|?\s*:?-{3,}/.test(lines[1]!)) {
    throw new Error(`${where}: таблица — первая строка с заголовками, вторая |---|---|, дальше строки`)
  }
  const fill = (row: string[]) => row.map((c) => { words.push(stripSubstitutions(c)); return esc(fillSubstitutions(c, where)) })
  return { head: fill(cells(lines[0]!)), rows: lines.slice(2).map((l) => fill(cells(l))) }
}

const photo = (media: StrapiMedia, alt: string) => ({ image: { ...strapiImage(media, 1280), alt }, zoom: strapiImage(media, 1920).src })

export function toSiteBlocks(raw: StrapiBlock[], where: string): { blocks: SiteBlock[]; headings: Heading[]; text: string } {
  const text = new TextRenderer(new Slugger(), where)
  const blocks = raw.map((b): SiteBlock => {
    switch (b.__component) {
      case 'article.text':
        return { type: 'text', html: text.render(b.content) }
      case 'article.photo':
        return { type: 'photo', ...photo(b.image, b.alt), caption: opt(b.caption), layout: PHOTO_LAYOUT[b.layout ?? ''] ?? 'column' }
      case 'article.gallery':
        return {
          type: 'gallery',
          photos: b.photos.map((p) => ({ ...photo(p.image, p.alt || p.caption || ''), caption: opt(p.caption), href: opt(p.link) })),
          columns: b.columns ?? undefined,
          doors: Boolean(b.doors),
        }
      case 'article.callout':
        return { type: 'callout', kind: CALLOUT_KIND[b.kind ?? ''] ?? 'tip', title: opt(b.title), html: text.render(b.text) }
      case 'article.video':
        return { type: 'video', src: b.video.url, poster: strapiImage(b.poster, 960).src, title: b.title, caption: opt(b.caption), narrow: Boolean(b.narrow) }
      case 'article.table':
        return { type: 'table', ...parseTable(b.markdown, where, text.words) }
      case 'article.hidden-prices':
        return { type: 'hiddenPrices' }
      case 'article.coating-prices':
        return { type: 'coatingPrices' }
      default:
        throw new Error(`${where}: неизвестный блок «${(b as { __component: string }).__component}»`)
    }
  })
  return { blocks, headings: text.headings, text: text.words.join(' ') }
}
```
Если `github-slugger` не разрешается как зависимость сайта (он стоит транзитивно от `@astrojs/markdoc`, который удаляется в Task 7), — `npm install --save-exact github-slugger@<версия из node_modules/github-slugger/package.json>`.

- [ ] **Step 3: Тесты проходят**

Run: `npm test` — Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add src/lib/article-blocks.ts tests/article-blocks.test.ts package.json package-lock.json
git commit -m "feat(articles): блоки статьи из Strapi → HTML, якоря, фото, таблицы"
```

---

### Task 3: Раздел «Статьи» в Strapi

**Files:** Create `cms/src/api/article/{content-types/article/schema.json,controllers/article.ts,routes/article.ts,services/article.ts}`, `cms/src/components/article/{text,photo,gallery,gallery-photo,callout,video,table,hidden-prices,coating-prices,faq,step,author,spotlight,seo,coating}.json`; Modify `cms/src/components/shared/item.json` (maxLength 160 → 200: пункт «Коротко» до 176 знаков), `cms/src/bootstrap/labels.ts`, `cms/src/bootstrap/access.ts` (`MANAGED` + `api::article.article`).

**Interfaces:** Produces REST `GET /api/articles` (только по ключу); поля, которые читает Task 6: `title, slug, kind, publishDate, updatedDate, cover, coverAlt, description, summary[].text, body[] (__component), faq[].{q,a}, keywords[].text, seo.{metaTitle, steps[].{name,text}, coatings[].coating, series[].text, pages[].text, author, spotlight}`.

- [ ] **Step 1: Компоненты блоков**

`cms/src/components/article/text.json`:
```json
{ "collectionName": "components_article_texts", "info": { "displayName": "Текст", "icon": "pencil" },
  "attributes": { "content": { "type": "blocks", "required": true } } }
```
`photo.json`:
```json
{ "collectionName": "components_article_photos", "info": { "displayName": "Фото", "icon": "picture" },
  "attributes": {
    "image": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["images"] },
    "alt": { "type": "string", "required": true, "maxLength": 160 },
    "caption": { "type": "string", "maxLength": 200 },
    "layout": { "type": "enumeration", "enum": ["Во всю колонку", "Узкое (схема)", "Без обрезки"], "default": "Во всю колонку" } } }
```
`gallery-photo.json`:
```json
{ "collectionName": "components_article_gallery_photos", "info": { "displayName": "Фото галереи", "icon": "picture" },
  "attributes": {
    "image": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["images"] },
    "alt": { "type": "string", "maxLength": 160 },
    "caption": { "type": "string", "maxLength": 120 },
    "link": { "type": "string", "maxLength": 200 } } }
```
`gallery.json`:
```json
{ "collectionName": "components_article_galleries", "info": { "displayName": "Галерея", "icon": "apps" },
  "attributes": {
    "photos": { "type": "component", "repeatable": true, "component": "article.gallery-photo", "required": true, "min": 2, "max": 4 },
    "columns": { "type": "integer", "min": 2, "max": 4 },
    "doors": { "type": "boolean", "default": false } } }
```
`callout.json`:
```json
{ "collectionName": "components_article_callouts", "info": { "displayName": "Выноска", "icon": "information" },
  "attributes": {
    "kind": { "type": "enumeration", "enum": ["Совет", "Важно", "Обратите внимание"], "default": "Совет" },
    "title": { "type": "string", "maxLength": 120 },
    "text": { "type": "blocks", "required": true } } }
```
`video.json`:
```json
{ "collectionName": "components_article_videos", "info": { "displayName": "Видео", "icon": "play" },
  "attributes": {
    "video": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["videos"] },
    "poster": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["images"] },
    "title": { "type": "string", "required": true, "maxLength": 120 },
    "caption": { "type": "string", "maxLength": 200 },
    "narrow": { "type": "boolean", "default": true } } }
```
`table.json`:
```json
{ "collectionName": "components_article_tables", "info": { "displayName": "Таблица", "icon": "grid" },
  "attributes": { "markdown": { "type": "text", "required": true } } }
```
`hidden-prices.json` и `coating-prices.json` (поле `note` — чтобы у компонента было поле; на сайт не выводится):
```json
{ "collectionName": "components_article_hidden_prices", "info": { "displayName": "Цены скрытых дверей", "icon": "priceTag" },
  "attributes": { "note": { "type": "string", "maxLength": 120 } } }
```
```json
{ "collectionName": "components_article_coating_prices", "info": { "displayName": "Цены по покрытиям", "icon": "priceTag" },
  "attributes": { "note": { "type": "string", "maxLength": 120 } } }
```

- [ ] **Step 2: Служебные компоненты и раздел**

`faq.json`:
```json
{ "collectionName": "components_article_faqs", "info": { "displayName": "Вопрос-ответ", "icon": "question" },
  "attributes": { "q": { "type": "string", "required": true, "maxLength": 200 }, "a": { "type": "text", "required": true } } }
```
`step.json`:
```json
{ "collectionName": "components_article_steps", "info": { "displayName": "Шаг", "icon": "arrowRight" },
  "attributes": { "name": { "type": "string", "required": true, "maxLength": 120 }, "text": { "type": "text", "required": true } } }
```
`coating.json`:
```json
{ "collectionName": "components_article_coatings", "info": { "displayName": "Покрытие", "icon": "brush" },
  "attributes": { "coating": { "type": "enumeration", "required": true, "enum": ["ПЭТ", "Эмаль", "Эмалекс", "Протач", "Экошпон"] } } }
```
`author.json`:
```json
{ "collectionName": "components_article_authors", "info": { "displayName": "Автор", "icon": "user" },
  "attributes": {
    "name": { "type": "string", "required": true, "maxLength": 80 },
    "role": { "type": "string", "required": true, "maxLength": 120 },
    "href": { "type": "string", "required": true, "maxLength": 200 },
    "photo": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "linkLabel": { "type": "string", "maxLength": 80 },
    "type": { "type": "enumeration", "enum": ["Человек", "Организация"], "default": "Организация" } } }
```
`spotlight.json`:
```json
{ "collectionName": "components_article_spotlights", "info": { "displayName": "Показ на главной", "icon": "star" },
  "attributes": {
    "label": { "type": "string", "required": true, "maxLength": 30 },
    "lead": { "type": "text", "maxLength": 300 },
    "image": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["images"] },
    "imageAlt": { "type": "string", "required": true, "maxLength": 160 },
    "video": { "type": "media", "multiple": false, "allowedTypes": ["videos"] },
    "poster": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "videoTitle": { "type": "string", "maxLength": 120 },
    "points": { "type": "component", "repeatable": true, "component": "shared.item", "max": 4 } } }
```
`seo.json`:
```json
{ "collectionName": "components_article_seos", "info": { "displayName": "Для поисковиков и каталога", "icon": "search" },
  "attributes": {
    "metaTitle": { "type": "string", "maxLength": 70 },
    "steps": { "type": "component", "repeatable": true, "component": "article.step" },
    "coatings": { "type": "component", "repeatable": true, "component": "article.coating" },
    "series": { "type": "component", "repeatable": true, "component": "shared.item" },
    "pages": { "type": "component", "repeatable": true, "component": "shared.item" },
    "author": { "type": "component", "repeatable": false, "component": "article.author" },
    "spotlight": { "type": "component", "repeatable": false, "component": "article.spotlight" } } }
```
`cms/src/api/article/content-types/article/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": { "singularName": "article", "pluralName": "articles", "displayName": "Статьи",
            "description": "Статьи и публикации: /articles/, главная, «статья по теме» в каталоге" },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": false } },
  "attributes": {
    "title": { "type": "string", "required": true, "maxLength": 120 },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "kind": { "type": "enumeration", "enum": ["Статья", "Публикация"], "default": "Статья", "required": true },
    "publishDate": { "type": "date", "required": true },
    "updatedDate": { "type": "date" },
    "cover": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["images"] },
    "coverAlt": { "type": "string", "required": true, "maxLength": 160 },
    "description": { "type": "text", "required": true, "maxLength": 170 },
    "summary": { "type": "component", "repeatable": true, "component": "shared.item", "max": 5 },
    "body": { "type": "dynamiczone", "required": true,
      "components": ["article.text", "article.photo", "article.gallery", "article.callout", "article.video", "article.table", "article.hidden-prices", "article.coating-prices"] },
    "faq": { "type": "component", "repeatable": true, "component": "article.faq" },
    "keywords": { "type": "component", "repeatable": true, "component": "shared.item" },
    "seo": { "type": "component", "repeatable": false, "component": "article.seo" }
  }
}
```
Контроллер, маршруты, сервис — `factories.createCoreController/createCoreRouter/createCoreService('api::article.article')`, как у `promo`. `shared.item.json` → `"maxLength": 200`. `access.ts`: `MANAGED = ['api::promo.promo', 'api::work.work', 'api::article.article']`.

- [ ] **Step 3: Подписи**

В `LABELS` (`cms/src/bootstrap/labels.ts`) добавить:
```ts
  'api::article.article': {
    title: { label: 'Заголовок', description: 'H1 статьи и заголовок карточки' },
    slug: { label: 'Адрес страницы', description: 'Составляется из заголовка; после публикации не меняйте — старая ссылка перестанет работать' },
    kind: { label: 'Вид', description: 'Публикация — новость салона или фабрики' },
    publishDate: { label: 'Дата публикации' },
    updatedDate: { label: 'Дата обновления', description: 'Если статью заметно переписали' },
    cover: { label: 'Обложка', description: 'Горизонтальная 16:9, от 1920×1080; можно с заголовком на картинке' },
    coverAlt: { label: 'Что на обложке', description: 'Для поисковиков и незрячих: «Белая скрытая дверь в гостиной»' },
    description: { label: 'Лид', description: 'Под заголовком и в поиске, до 160 знаков. Подстановки: {адрес салона}, {телефон}, {часы работы} — полный список в инструкции' },
    summary: { label: 'Коротко', description: '2–5 пунктов с прямыми ответами — в начале статьи' },
    body: { label: 'Текст статьи', description: 'Блоки по порядку: текст, фото, галерея, выноска, видео, таблица, цены. В тексте — подстановки {адрес салона}, {цена комплекта Секрет} …' },
    faq: { label: 'Вопросы и ответы', description: 'В конце статьи и в поиске Яндекса и Google' },
    keywords: { label: 'Ключевые фразы' },
    seo: { label: 'Для поисковиков и каталога', description: 'Заполняет разработчик; можно не трогать' },
  },
  'article.text': { content: { label: 'Текст', description: 'Подзаголовки — «Заголовок 2»; подстановки — {адрес салона} и др.' } },
  'article.photo': { image: { label: 'Фото' }, alt: { label: 'Что на фото' }, caption: { label: 'Подпись' }, layout: { label: 'Как показать', description: 'Узкое — схемы и чертежи; без обрезки — картинки с текстом' } },
  'article.gallery': { photos: { label: 'Фото', description: 'От 2 до 4' }, columns: { label: 'Колонок', description: 'Если пусто — по числу фото' }, doors: { label: 'Высокие двери', description: 'Для фото дверей из каталога — плитка вытянута, дверь видна целиком' } },
  'article.gallery-photo': { image: { label: 'Фото' }, alt: { label: 'Что на фото', description: 'Если пусто — подпись' }, caption: { label: 'Подпись' }, link: { label: 'Ссылка подписи', placeholder: '/catalog/series/urban/' } },
  'article.callout': { kind: { label: 'Тип' }, title: { label: 'Заголовок', description: 'Если пусто — по типу: «Совет», «Важно»…' }, text: { label: 'Текст' } },
  'article.video': { video: { label: 'Ролик', description: 'MP4 до 25 МБ' }, poster: { label: 'Обложка ролика' }, title: { label: 'Что в ролике' }, caption: { label: 'Подпись' }, narrow: { label: 'Вертикальный ролик', description: 'Снят на телефон вертикально — показываем узким по центру' } },
  'article.table': { markdown: { label: 'Таблица', description: 'Строки через Enter, ячейки через |. Первая строка — заголовки, вторая — |---|---|' } },
  'article.hidden-prices': { note: { label: 'Заметка для себя', description: 'На сайт не выводится; цены — из каталога' } },
  'article.coating-prices': { note: { label: 'Заметка для себя', description: 'На сайт не выводится; цены — из каталога' } },
  'article.faq': { q: { label: 'Вопрос' }, a: { label: 'Ответ' } },
  'article.step': { name: { label: 'Шаг', description: 'Ровно как подзаголовок шага в тексте' }, text: { label: 'Суть шага' } },
  'article.coating': { coating: { label: 'Покрытие' } },
  'article.author': { name: { label: 'Имя' }, role: { label: 'Кто это' }, href: { label: 'Ссылка' }, photo: { label: 'Фото или логотип' }, linkLabel: { label: 'Подпись ссылки' }, type: { label: 'Автор' } },
  'article.spotlight': { label: { label: 'Плашка', placeholder: 'Новинка' }, lead: { label: 'Лид', description: 'Если пусто — лид статьи' }, image: { label: 'Фото', description: 'Вертикальное' }, imageAlt: { label: 'Что на фото' }, video: { label: 'Ролик' }, poster: { label: 'Обложка ролика' }, videoTitle: { label: 'Что в ролике' }, points: { label: 'Факты', description: '2–4 коротких' } },
  'article.seo': { metaTitle: { label: 'Заголовок для поисковиков', description: 'Если пусто — «Заголовок — бренд в городе»; до 60 знаков' }, steps: { label: 'Шаги (инструкция)' }, coatings: { label: 'Покрытия', description: 'В конце статьи — серии с ценами; статья появится на страницах покрытий' }, series: { label: 'Серии каталога', description: 'Адрес серии: urban, urban-pet …' }, pages: { label: 'Страницы каталога', description: 'Где показать «Статья по теме»: /catalog/loft-dveri/' }, author: { label: 'Автор', description: 'Если пусто — основатель студии' }, spotlight: { label: 'Показ на главной', description: 'Самая свежая статья с этим блоком — перед лентой статей' } },
```

- [ ] **Step 4: Проверка**

Strapi перезапустится сам. Run:
```bash
set -a; . ./.env; set +a
curl -s -o /dev/null -w "%{http_code}\n" "$STRAPI_URL/api/articles"
curl -s -H "Authorization: Bearer $STRAPI_TOKEN" "$STRAPI_URL/api/articles"
npm --prefix cms run check:ru
```
Expected: `403`, `{"data":[],…}`, «Перевод полный». Снимок экрана «Статьи → Новая запись» (scratchpad `strapi-shot.mjs`): поля и блоки по-русски; группа «Для поисковиков и каталога» свёрнута. Если Strapi не стартует из-за компонента без полей или `min/max` у повторяемого компонента — сообщение покажет поле; исправить по нему и записать решение в журнал.

- [ ] **Step 5: Commit**
```bash
git add cms/src
git commit -m "feat(cms): раздел «Статьи» — блоки, вопросы-ответы, группа для поисковиков"
```

---

### Task 4: Выгрузка статей из Markdoc в блоки

**Files:** Create `scripts/lib/mdoc-to-blocks.mjs`, `scripts/export-articles.mjs`, `tests/mdoc-to-blocks.test.ts`; Modify `package.json` (script `articles:export`).

**Interfaces:**
- Consumes: `SUBSTITUTION_BY_PATH` (Task 1).
- Produces: `mdocToArticle(source: string, slug: string): ExportedArticle`; файл `cms/.tmp/articles-export.json` — массив `ExportedArticle`. Фото в нём — `{ "$media": "/путь/на/сайте.webp" }` (заменяются на id файла при импорте).

```ts
interface ExportedArticle {
  slug: string; title: string; kind: 'Статья' | 'Публикация'; publishDate: string; updatedDate: string | null
  cover: { $media: string }; coverAlt: string; description: string
  summary: { text: string }[]; keywords: { text: string }[]; faq: { q: string; a: string }[]
  body: object[]   // элементы dynamic zone с __component, как ждёт Strapi
  seo: { metaTitle: string | null; steps: { name: string; text: string }[]; coatings: { coating: string }[];
         series: { text: string }[]; pages: { text: string }[]; author: object | null; spotlight: object | null }
}
```

- [ ] **Step 1: Тесты (падают)**

`tests/mdoc-to-blocks.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mdocToArticle } from '../scripts/lib/mdoc-to-blocks.mjs'

const doc = (body: string, extra = '') => `---
title: 'Т'
description: 'Лид с {% $salon.phone %}'
publishDate: 2026-09-01
coverImage: '/media/a/cover.webp'
coverImageAlt: 'Обложка'
summary:
  - 'Пункт'
${extra}---

${body}`

test('шапка статьи → поля Strapi, переменные → подстановки', () => {
  const a = mdocToArticle(doc('Текст.', "relatedCoatings:\n  - emal\nrelatedPages:\n  - /catalog/decor/\n"), 'slug')
  assert.equal(a.slug, 'slug')
  assert.equal(a.kind, 'Статья')
  assert.equal(a.publishDate, '2026-09-01')
  assert.equal(a.description, 'Лид с {телефон}')
  assert.deepEqual(a.cover, { $media: '/media/a/cover.webp' })
  assert.deepEqual(a.summary, [{ text: 'Пункт' }])
  assert.deepEqual(a.seo.coatings, [{ coating: 'Эмаль' }])
  assert.deepEqual(a.seo.pages, [{ text: '/catalog/decor/' }])
})

test('текст: подряд идущие абзацы, заголовки и списки — один блок «Текст»', () => {
  const a = mdocToArticle(doc('## Где {% $salon.city %}\n\nЕсть **жирный** и [ссылка](/x/).\n\n- раз\n- два\n\n1. один'), 's')
  assert.equal(a.body.length, 1)
  assert.deepEqual(a.body[0], { __component: 'article.text', content: [
    { type: 'heading', level: 2, children: [{ type: 'text', text: 'Где ' }, { type: 'text', text: '{в городе}' }] },
    { type: 'paragraph', children: [{ type: 'text', text: 'Есть ' }, { type: 'text', text: 'жирный', bold: true }, { type: 'text', text: ' и ' }, { type: 'link', url: '/x/', children: [{ type: 'text', text: 'ссылка' }] }, { type: 'text', text: '.' }] },
    { type: 'list', format: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', text: 'раз' }] }, { type: 'list-item', children: [{ type: 'text', text: 'два' }] }] },
    { type: 'list', format: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', text: 'один' }] }] },
  ] })
})

test('теги → блоки: фото, галерея, выноска, видео, таблица, цены', () => {
  const a = mdocToArticle(doc([
    'До.',
    '{% figure src="/media/f.webp" alt="Ф" caption="П" narrow=true /%}',
    '{% photogrid cols=2 doors=true %}\n{% photo src="/media/1.webp" alt="1" caption="Urban" href="/catalog/series/urban/" /%}\n{% photo src="/media/2.webp" alt="2" /%}\n{% /photogrid %}',
    '{% callout type="info" title="Важно" %}\nЗвоните {% $salon.phone %}.\n{% /callout %}',
    '{% video src="/renders/v.mp4" poster="/renders/p.webp" title="Ролик" caption="Подпись" narrow=true /%}',
    '{% table %}\n* Плюсы\n* Минусы\n---\n* От {% $hidden.wallMin %}\n* Дороже\n{% /table %}',
    '{% hiddenHeightPrices /%}',
    '{% coatingPrices /%}',
    'После.',
  ].join('\n\n')), 's')
  assert.deepEqual(a.body.map((b: any) => b.__component), ['article.text', 'article.photo', 'article.gallery', 'article.callout', 'article.video', 'article.table', 'article.hidden-prices', 'article.coating-prices', 'article.text'])
  const [, photo, gallery, callout, video, table] = a.body as any[]
  assert.deepEqual(photo, { __component: 'article.photo', image: { $media: '/media/f.webp' }, alt: 'Ф', caption: 'П', layout: 'Узкое (схема)' })
  assert.deepEqual(gallery, { __component: 'article.gallery', columns: 2, doors: true, photos: [
    { image: { $media: '/media/1.webp' }, alt: '1', caption: 'Urban', link: '/catalog/series/urban/' },
    { image: { $media: '/media/2.webp' }, alt: '2', caption: null, link: null }] })
  assert.deepEqual(callout, { __component: 'article.callout', kind: 'Важно', title: 'Важно',
    text: [{ type: 'paragraph', children: [{ type: 'text', text: 'Звоните ' }, { type: 'text', text: '{телефон}' }, { type: 'text', text: '.' }] }] })
  assert.deepEqual(video, { __component: 'article.video', video: { $media: '/renders/v.mp4' }, poster: { $media: '/renders/p.webp' }, title: 'Ролик', caption: 'Подпись', narrow: true })
  assert.equal(table.markdown, '| Плюсы | Минусы |\n|---|---|\n| От {мин. толщина стены} | Дороже |')
})

test('неизвестный тег или переменная — ошибка с адресом статьи', () => {
  assert.throws(() => mdocToArticle(doc('{% projectsSlider /%}'), 'x'), /x: .*projectsSlider/)
  assert.throws(() => mdocToArticle(doc('{% $salon.nope %}'), 'x'), /x: .*salon\.nope/)
})
```
Run: `npm test` — Expected: FAIL (`Cannot find module '../scripts/lib/mdoc-to-blocks.mjs'`).

- [ ] **Step 2: Реализация**

`scripts/lib/mdoc-to-blocks.mjs` — разбор `Markdoc.parse(source)`; фронтматтер — `js-yaml` из `ast.attributes.frontmatter`. Правила:
- Узлы `heading`/`paragraph`/`list`/`blockquote` верхнего уровня копятся в текущий блок `article.text` (`content`), любой тег закрывает его.
- Внутри строки: `text` → `{type:'text', text}`; если `attributes.content` — переменная Markdoc (объект с массивом `path`), текст `{${SUBSTITUTION_BY_PATH[path.join('.')]}}`, нет имени — ошибка `${slug}: нет подстановки для $${path}`; `strong`/`em` → те же листья с `bold`/`italic: true`; `link` → `{type:'link', url: href, children}`; `softbreak` → `{type:'text', text:' '}`. Соседние листья с одинаковыми флагами не склеивать (тест сравнивает побуквенно).
- `list` — `format` по `attributes.ordered`; пункт — инлайн-содержимое (если в пункте `paragraph` — его инлайн).
- `blockquote` → `{type:'quote', children: инлайн первого абзаца}`.
- Теги: `figure` → `article.photo` (`layout`: `narrow` → «Узкое (схема)», `natural` → «Без обрезки», иначе «Во всю колонку»; `caption` нет → `null`); `photogrid` → `article.gallery` (`columns` = `cols` атрибута, если задан, иначе `null`; `doors` — булево; фото — дочерние `photo`); `callout` → `article.callout` (`kind`: tip→«Совет», info→«Важно», warning→«Обратите внимание»; `title` — атрибут или `null`; `text` — абзацы внутри по правилам текста); `video` → `article.video`; `table` → `article.table` (строки `tr`, ячейки `th`/`td`, первая строка — заголовки; `| a | b |` + `|---|---|`); `hiddenHeightPrices` → `article.hidden-prices` с `note: null`; `coatingPrices` → `article.coating-prices` с `note: null`; другие — ошибка `${slug}: тег {% имя %} не переносится`.
- Шапка: `kind` publication → «Публикация», иначе «Статья»; даты — `YYYY-MM-DD` (`js-yaml` отдаёт `Date` — `toISOString().slice(0,10)`); `description`, `summary`, `faq` — переменные `{% $путь %}` → `{имя}` той же заменой по строке; `relatedCoatings` slug → «ПЭТ|Эмаль|Эмалекс|Протач|Экошпон» по `{pet, emal, emalex, protach, ekoshpon}`; `relatedSeriesSlugs` → `seo.series`, `relatedPages` → `seo.pages`; `metaTitle` → `seo.metaTitle`; `steps` → `seo.steps`; `author` → `{ name, role, href, photo: {$media}|null, linkLabel, type: person→«Человек», иначе «Организация» }`; `spotlight` → `{ label, lead|null, image:{$media}, imageAlt, video:{$media}|null, poster:{$media}|null, videoTitle|null, points:[{text}] }`.

Отладка дерева Markdoc: `node -e "const M=require('@markdoc/markdoc');console.dir(M.parse(src),{depth:8})"` — сверить имена узлов (`tr`, `th`, `td`, `item`, `inline`) с реальными перед реализацией правил.

`scripts/export-articles.mjs`:
```js
/**
 * Перенос статей (один раз): src/content/articles/*.mdoc → JSON блоков
 * для Strapi — cms/.tmp/articles-export.json. Дальше — npm --prefix cms
 * run import:articles (загрузит фото в медиатеку и создаст записи).
 *   npm run articles:export
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { mdocToArticle } from './lib/mdoc-to-blocks.mjs'

const DIR = new URL('../src/content/articles/', import.meta.url)
const OUT = new URL('../cms/.tmp/articles-export.json', import.meta.url)
const files = (await readdir(DIR)).filter((f) => f.endsWith('.mdoc')).sort()
const articles = []
for (const f of files) articles.push(mdocToArticle(await readFile(new URL(f, DIR), 'utf8'), f.replace(/\.mdoc$/, '')))
await mkdir(new URL('.', OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(articles, null, 2))
console.log(`Статей: ${articles.length} → cms/.tmp/articles-export.json`)
```
`package.json` → scripts: `"articles:export": "node scripts/export-articles.mjs"` (временный — удаляется в Task 7 вместе с `.mdoc`).

`mdoc-to-blocks.mjs` импортирует `SUBSTITUTION_BY_PATH` из `src/data/article-substitutions.ts` — `.mjs` не загрузит `.ts` под голым Node. Поэтому `export-articles.mjs` запускать через tsx: `"articles:export": "tsx scripts/export-articles.mjs"`.

- [ ] **Step 3: Тесты проходят, выгрузка**

Run: `npm test` — Expected: PASS. Run: `npm run articles:export` — Expected: «Статей: 11 → cms/.tmp/articles-export.json», без ошибок.

- [ ] **Step 4: Commit**
```bash
git add scripts/lib/mdoc-to-blocks.mjs scripts/export-articles.mjs tests/mdoc-to-blocks.test.ts package.json
git commit -m "feat(articles): выгрузка статей из Markdoc в блоки Strapi"
```

---

### Task 5: Импорт статей в Strapi

**Files:** Create `cms/scripts/import-articles.mjs`; Modify `cms/package.json` (script `import:articles`).

**Interfaces:** Consumes `cms/.tmp/articles-export.json` (Task 4). Produces 11 опубликованных записей `api::article.article`.

- [ ] **Step 1: Скрипт**

`cms/scripts/import-articles.mjs`:
```js
/**
 * Перенос статей в Strapi (один раз): .tmp/articles-export.json
 * (npm run articles:export в корне) → записи раздела «Статьи», фото и
 * ролики — в медиатеку. Повторный запуск пропускает уже перенесённые
 * (по адресу slug). Strapi при этом остановлен.
 *   npm --prefix cms run import:articles
 */
import { readFile, stat, writeFile, mkdtemp } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
/* Strapi — через require: его ESM-сборка в Node не загружается (lodash) */
const { createStrapi, compileStrapi } = require('@strapi/strapi')
const sharp = require('sharp')

const SITE = path.resolve(process.cwd(), '..')
const ARTICLES = JSON.parse(await readFile(path.join(process.cwd(), '.tmp/articles-export.json'), 'utf8'))
const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' }

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')
const uploaded = new Map()
const tmp = await mkdtemp(path.join(tmpdir(), 'articles-'))

/* Файл сайта (/media/…, /renders/…, /svg/…) → id в медиатеке; один файл — одна загрузка.
   SVG медиатека не принимает (запрет в config/plugins.ts) — переводим в PNG 512 px */
async function media(sitePath) {
  if (uploaded.has(sitePath)) return uploaded.get(sitePath)
  let file = path.join(SITE, 'public', decodeURIComponent(sitePath))
  if (file.endsWith('.svg')) {
    const png = path.join(tmp, `${path.basename(file, '.svg')}.png`)
    await writeFile(png, await sharp(file, { density: 300 }).resize({ width: 512 }).png().toBuffer())
    file = png
  }
  const { size } = await stat(file)
  const ext = path.extname(file).toLowerCase()
  if (!MIME[ext]) throw new Error(`Неизвестный тип файла: ${sitePath}`)
  const [done] = await upload.upload({
    data: { fileInfo: { name: path.basename(file) } },
    files: { filepath: file, originalFilename: path.basename(file), mimetype: MIME[ext], size },
  })
  uploaded.set(sitePath, done.id)
  return done.id
}

/* { $media: '/путь' } → id файла, на любой глубине */
async function resolve(value) {
  if (Array.isArray(value)) return Promise.all(value.map(resolve))
  if (value && typeof value === 'object') {
    if ('$media' in value) return media(value.$media)
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = await resolve(v)
    return out
  }
  return value
}

for (const a of ARTICLES) {
  const exists = await app.documents('api::article.article').findFirst({ filters: { slug: a.slug } })
  if (exists) { console.log(`уже есть: ${a.slug}`); continue }
  await app.documents('api::article.article').create({ status: 'published', data: await resolve(a) })
  console.log(`перенесено: ${a.slug}`)
}
await app.destroy()
process.exit(0)
```
`cms/package.json` → scripts: `"import:articles": "node scripts/import-articles.mjs"`.

- [ ] **Step 2: Перенос**

Остановить Strapi (`pkill -f "strapi develop"`). Run: `npm --prefix cms run import:articles` — Expected: «перенесено: …» ×11. Повторно — «уже есть: …» ×11. Если запись не проходит проверку Strapi (длина поля, обязательное поле) — текст ошибки назовёт поле: поправить схему (Task 3) или выгрузку (Task 4), записать решение в журнал, удалить частично созданное и повторить.

- [ ] **Step 3: Проверка**

`npm run cms`; Run:
```bash
set -a; . ./.env; set +a
curl -s -g -H "Authorization: Bearer $STRAPI_TOKEN" "$STRAPI_URL/api/articles?status=published&fields[0]=slug&pagination[pageSize]=100" | node -pe "JSON.parse(require('fs').readFileSync(0)).data.map(a=>a.slug).join('\n')"
```
Expected: 11 адресов, как имена файлов `src/content/articles/*.mdoc`. В админке открыть «Скрытые двери: плюсы и минусы» — блоки по порядку, таблица, выноска, фото на месте (снимок).

- [ ] **Step 4: Commit**
```bash
git add cms/scripts/import-articles.mjs cms/package.json
git commit -m "feat(cms): перенос 11 статей с фото в Strapi"
```

---

### Task 6: Сайт читает статьи из Strapi

**Files:** Create `src/components/articles/ArticleBlocks.astro`; Modify `src/lib/strapi-content.ts`, `tests/strapi-content.test.ts`, `src/content.config.ts`, `src/lib/articles.ts`, `src/pages/articles/[slug].astro`, `src/components/articles/{ArticleCard,Figure,Photo}.astro`, `src/components/home/Spotlight.astro`, `astro.config.mjs`.

**Interfaces:**
- Consumes: `toSiteBlocks`, `SiteBlock`, `Heading` (Task 2); `fillSubstitutions` (Task 1); `strapiFetchAll`, `strapiImage`, `strapiLoader` (план 1).
- Produces: `toArticle(raw: StrapiArticle): { id: string; data: ArticleData; body: string }`; `articlesLoader()` (имя `strapi-articles`); данные коллекции `articles`: прежние поля + `cover: SiteImage`, `blocks: SiteBlock[]`, `headings: Heading[]`, `spotlight.imageSrcset?`; `article.body` — текст для «мин чтения».

- [ ] **Step 1: Тест преобразования (падает)**

Дописать в `tests/strapi-content.test.ts`:
```ts
import { toArticle } from '../src/lib/strapi-content'

const media = (url: string) => ({ url, width: 1920, height: 1080, formats: { medium: { url: url.replace('/uploads/', '/uploads/medium_'), width: 960, height: 540 } } })

test('статья из Strapi → данные сайта', () => {
  const a = toArticle({
    documentId: 'd', slug: 'skrytye', title: 'Скрытые двери', kind: 'Публикация', publishDate: '2026-09-01', updatedDate: null,
    cover: media('/uploads/c.webp'), coverAlt: 'Обложка', description: 'Звоните {телефон}',
    summary: [{ text: 'Пункт' }], keywords: [], faq: [{ q: 'Где?', a: '{адрес салона}' }],
    body: [{ __component: 'article.text', content: [{ type: 'heading', level: 2, children: [{ type: 'text', text: 'Раздел' }] }, { type: 'paragraph', children: [{ type: 'text', text: 'Слово {телефон}' }] }] }],
    seo: { metaTitle: null, steps: [], coatings: [{ coating: 'Эмаль' }], series: [{ text: 'urban' }], pages: [], author: null, spotlight: null },
  })
  assert.equal(a.id, 'skrytye')
  assert.equal(a.data.kind, 'publication')
  assert.match(a.data.description, /^Звоните \S/)
  assert.doesNotMatch(a.data.description, /\{/)
  assert.equal(a.data.publishDate, '2026-09-01')
  assert.equal(a.data.coverImage, '/uploads/c.webp')
  assert.equal(a.data.cover.src, '/uploads/c.webp')
  assert.deepEqual(a.data.relatedCoatings, ['emal'])
  assert.deepEqual(a.data.relatedSeriesSlugs, ['urban'])
  assert.deepEqual(a.data.headings, [{ depth: 2, slug: 'раздел', text: 'Раздел' }])
  assert.equal(a.data.blocks.length, 1)
  assert.match(a.body, /Раздел Слово/)
  assert.doesNotMatch(a.body, /\{/)
})

test('статья без текста — ошибка с названием', () => {
  assert.throws(() => toArticle({ documentId: 'd', slug: 's', title: 'Пустая', kind: 'Статья', publishDate: '2026-01-01',
    cover: media('/uploads/c.webp'), coverAlt: 'О', description: 'Л', body: [] }), /«Пустая».*текст/)
})
```
Run: `npm test` — Expected: FAIL (нет `toArticle`).

- [ ] **Step 2: Преобразование и загрузчик**

В `src/lib/strapi-content.ts`:
```ts
import { toSiteBlocks, type StrapiBlock } from './article-blocks'
import { fillSubstitutions } from './article-substitutions'

export interface StrapiArticle {
  documentId: string; slug: string; title: string; kind: string; publishDate: string; updatedDate?: string | null
  cover: StrapiMedia; coverAlt: string; description: string
  summary?: { text: string }[] | null; keywords?: { text: string }[] | null; faq?: { q: string; a: string }[] | null
  body: StrapiBlock[]
  seo?: {
    metaTitle?: string | null; steps?: { name: string; text: string }[] | null; coatings?: { coating: string }[] | null
    series?: { text: string }[] | null; pages?: { text: string }[] | null
    author?: { name: string; role: string; href: string; photo?: StrapiMedia | null; linkLabel?: string | null; type?: string | null } | null
    spotlight?: { label: string; lead?: string | null; image: StrapiMedia; imageAlt: string; video?: StrapiMedia | null; poster?: StrapiMedia | null; videoTitle?: string | null; points?: { text: string }[] | null } | null
  } | null
}

/** Покрытие в Strapi → coatingSlug каталога (src/data/door-categories.ts) */
const COATING_SLUG: Record<string, string> = { 'ПЭТ': 'pet', 'Эмаль': 'emal', 'Эмалекс': 'emalex', 'Протач': 'protach', 'Экошпон': 'ekoshpon' }

export function toArticle(raw: StrapiArticle) {
  const where = `Статья «${raw.title}»`
  if (!raw.body?.length) throw new Error(`${where}: нет текста статьи`)
  const fill = (s: string) => fillSubstitutions(s, where)
  const { blocks, headings, text } = toSiteBlocks(raw.body, where)
  const seo = raw.seo ?? {}
  const texts = (items?: { text: string }[] | null) => (items?.length ? items.map((i) => i.text) : undefined)
  const cover = { ...strapiImage(raw.cover, 1280), alt: raw.coverAlt }
  const spot = seo.spotlight
  const spotImage = spot ? strapiImage(spot.image, 960) : undefined
  return {
    id: raw.slug,
    body: text,
    data: {
      title: raw.title,
      metaTitle: seo.metaTitle ?? undefined,
      description: fill(raw.description),
      summary: texts(raw.summary)?.map(fill),
      keywords: texts(raw.keywords),
      steps: seo.steps?.length ? seo.steps.map((s) => ({ name: s.name, text: s.text })) : undefined,
      author: seo.author ? {
        name: seo.author.name, role: seo.author.role, href: seo.author.href,
        photo: seo.author.photo ? strapiImage(seo.author.photo, 256).src : undefined,
        linkLabel: seo.author.linkLabel ?? undefined,
        type: seo.author.type === 'Человек' ? 'person' as const : 'organization' as const,
      } : undefined,
      kind: raw.kind === 'Публикация' ? 'publication' as const : 'article' as const,
      publishDate: raw.publishDate,
      updatedDate: raw.updatedDate ?? undefined,
      coverImage: strapiImage(raw.cover, 1920).src,
      coverImageAlt: raw.coverAlt,
      cover,
      faq: raw.faq?.length ? raw.faq.map((f) => ({ q: fill(f.q), a: fill(f.a) })) : undefined,
      relatedSeriesSlugs: texts(seo.series),
      relatedCoatings: seo.coatings?.length ? seo.coatings.map((c) => {
        const slug = COATING_SLUG[c.coating]
        if (!slug) throw new Error(`${where}: неизвестное покрытие «${c.coating}»`)
        return slug
      }) : undefined,
      relatedPages: texts(seo.pages),
      spotlight: spot && spotImage ? {
        label: spot.label, lead: spot.lead ?? undefined, image: spotImage.src, imageSrcset: spotImage.srcset, imageAlt: spot.imageAlt,
        video: spot.video?.url, poster: spot.poster ? strapiImage(spot.poster, 960).src : undefined,
        videoTitle: spot.videoTitle ?? undefined, points: texts(spot.points),
      } : undefined,
      blocks,
      headings,
    },
  }
}
```
`body` — как прежний `article.body`: текст статьи без H1 и без подстановок.

`strapiLoader` — передавать `body`: сигнатура `fetchAll: () => Promise<{ id: string; data: T; body?: string }[]>`, в `load` — `store.set({ id, data: parsed, body, digest: generateDigest(parsed) })`.

Загрузчик:
```ts
const IMG = 'true'
export const articlesLoader = () =>
  strapiLoader('strapi-articles', async () =>
    (await strapiFetchAll<StrapiArticle>('articles', {
      'populate[cover]': IMG,
      'populate[summary]': IMG, 'populate[keywords]': IMG, 'populate[faq]': IMG,
      'populate[body][on][article.text][populate]': '*',
      'populate[body][on][article.photo][populate]': '*',
      'populate[body][on][article.gallery][populate][photos][populate]': '*',
      'populate[body][on][article.callout][populate]': '*',
      'populate[body][on][article.video][populate]': '*',
      'populate[body][on][article.table][populate]': '*',
      'populate[body][on][article.hidden-prices][populate]': '*',
      'populate[body][on][article.coating-prices][populate]': '*',
      'populate[seo][populate][steps]': IMG, 'populate[seo][populate][coatings]': IMG,
      'populate[seo][populate][series]': IMG, 'populate[seo][populate][pages]': IMG,
      'populate[seo][populate][author][populate]': '*',
      'populate[seo][populate][spotlight][populate]': '*',
      sort: 'publishDate:desc',
    })).map((raw) => ({ ...toArticle(raw) })))
```
Проверить запрос вживую до подключения: `curl -g` с этими параметрами → у статьи есть `body[].__component`, у фото — `formats`, у галереи — `photos[].image.formats`, у `seo.spotlight` — `image`. Если Strapi отвечает 400 на какой-то `populate` — ответ назовёт путь; поправить и записать решение.

- [ ] **Step 3: Коллекция**

`src/content.config.ts`: `loader: articlesLoader()` вместо `glob(...)`; в схеме `publishDate: z.coerce.date()` и `updatedDate` — как были (строка `YYYY-MM-DD` приводится к дате), `coverImage`, `coverImageAlt` — обязательные строки; добавить:
```ts
    cover: z.object({ src: z.string(), srcset: z.string().optional(), width: z.number().optional(), height: z.number().optional(), alt: z.string() }),
    blocks: z.array(z.object({ type: z.string() }).passthrough()),
    headings: z.array(z.object({ depth: z.number(), slug: z.string(), text: z.string() })),
```
в `spotlight` — `imageSrcset: z.string().optional()`. Импорт `glob` убрать, если больше не используется. В `astro.config.mjs` → `strapiRefresh(['strapi-promos', 'strapi-works', 'strapi-articles'])`.

`src/lib/articles.ts`: `withArticleVars` больше не нужен (подстановки заполнены при загрузке) — `getArticles` возвращает статьи как есть; `withArticleVars` удалить вместе с импортом `fillArticleVars`, у потребителей (`[slug].astro`) убрать вызов.

- [ ] **Step 4: Вывод блоков**

`src/components/articles/ArticleBlocks.astro`:
```astro
---
/**
 * Тело статьи из Strapi: блоки по порядку (src/lib/article-blocks.ts).
 * Текст — готовый HTML (подстановки заполнены, разметка экранирована);
 * фото, галерея, выноска, видео, цены — прежние компоненты статей.
 */
import type { SiteBlock } from '../../lib/article-blocks'
import Figure from './Figure.astro'
import PhotoGrid from './PhotoGrid.astro'
import Photo from './Photo.astro'
import Callout from './Callout.astro'
import InlineVideo from './InlineVideo.astro'
import HiddenHeightPrices from './HiddenHeightPrices.astro'
import CoatingPrices from './CoatingPrices.astro'

interface Props { blocks: SiteBlock[] }
const { blocks } = Astro.props
---
{blocks.map((b) => {
  switch (b.type) {
    case 'text': return <Fragment set:html={b.html} />
    case 'photo': return <Figure src={b.image.src} srcset={b.image.srcset} zoom={b.zoom} alt={b.image.alt} caption={b.caption} narrow={b.layout === 'narrow'} natural={b.layout === 'natural'} />
    case 'gallery': return (
      <PhotoGrid cols={b.columns ?? b.photos.length} doors={b.doors}>
        {b.photos.map((p) => <Photo src={p.image.src} srcset={p.image.srcset} zoom={p.zoom} alt={p.image.alt} caption={p.caption} href={p.href} />)}
      </PhotoGrid>
    )
    case 'callout': return <Callout type={b.kind} title={b.title}><Fragment set:html={b.html} /></Callout>
    case 'video': return <InlineVideo src={b.src} poster={b.poster} title={b.title} caption={b.caption} narrow={b.narrow} />
    case 'table': return (
      <table>
        <thead><tr>{b.head.map((c) => <th set:html={c} />)}</tr></thead>
        <tbody>{b.rows.map((r) => <tr>{r.map((c) => <td set:html={c} />)}</tr>)}</tbody>
      </table>
    )
    case 'hiddenPrices': return <HiddenHeightPrices />
    case 'coatingPrices': return <CoatingPrices />
  }
})}
```
Если у прежнего `{% photogrid %}` без `cols` было значение по умолчанию 3 (а не число фото), — сверить с `PhotoGrid.astro` и подставить то же правило.

`Figure.astro` и `Photo.astro` — новые необязательные пропсы `srcset?: string` (готовый набор копий) и `zoom?: string` (что открыть во весь экран): `const inline = srcset ? { src: src!, srcset } : src ? articleImg(src) : undefined`; `data-zoom={zoom ?? src}`. В `Photo` — `<img src={inline.src} srcset={inline.srcset} …>` по тому же правилу.

`src/pages/articles/[slug].astro`: вместо `const { Content, headings } = await render(article)` — `const headings = data.headings`; `<Content />` → `<ArticleBlocks blocks={data.blocks} />`; `cover` → `data.cover` (`{ src, srcset }`), импорт `articleCoverImg` и `render` убрать. `getStaticPaths` — `props: { article }` без `withArticleVars`.

`ArticleCard.astro`: `{...articleCoverImg(data.coverImage, …)}` → `src={data.cover.src} srcset={data.cover.srcset}` (sizes — как были). `Spotlight.astro`: `{...articleImg(spot.image)}` → `src={spot.image} srcset={spot.imageSrcset}`.

- [ ] **Step 5: Карта сайта**

`astro.config.mjs`: `readArticles()` из `.mdoc` заменить на загрузку из Strapi тем же способом, что `fetchWorkImages` (`readEnvVar('STRAPI_URL')`, `STRAPI_TOKEN`, `status=published`, `fields[0]=slug&fields[1]=publishDate&fields[2]=updatedDate`, все страницы): `ARTICLE_LASTMOD` — `slug → updatedDate ?? publishDate`, `HAS_ARTICLES` — есть хоть одна. Ошибка — пустая карта (страницы статей и так остановят сборку). Комментарий над ней — что статьи берутся из Strapi.

- [ ] **Step 6: Проверка**

1. `npm test` — PASS.
2. `npm run build` (Strapi запущен) → `[strapi-articles] Strapi: загружено записей: 11`.
3. `node scripts/compare-builds.mjs "$SCRATCH/dist-before-2" dist` — Expected: «изменились: 0». Отличия в «N мин чтения» (подсчёт слов по блокам) — разобрать: если разница из-за слов, которых раньше не было в счёте (подписи, URL), — привести `text` в `toSiteBlocks` к прежнему правилу; записать решение.
4. Карта сайта: `grep -c '/articles/' dist/sitemap-0.xml` — как в эталоне; `lastmod` у статей совпадают (`diff` выборки `<loc>…/articles/…</loc><lastmod>` эталона и новой).
5. `npm run dev`: статья со скрытыми дверями, «Дверь с жалюзи» (видео, автор, показ на главной), главная, `/articles/` — 390 и 1440 px, консоль без ошибок (`console.mjs`), фото с `/uploads/`, оглавление ведёт к разделам, лайтбокс открывает фото, видео играет.
6. Правка заголовка статьи в админке → через ≤5 с видна на `/articles/` в dev; вернуть.

- [ ] **Step 7: Commit**
```bash
git add -A src astro.config.mjs tests
git commit -m "feat(site): статьи из Strapi — блоки, оглавление, карта сайта"
```

---

### Task 7: Убрать Markdoc и генератор картинок статей

**Files:** Delete `src/content/articles/*.mdoc`, `markdoc.config.ts`, `scripts/gen-article-images.mjs`, `src/data/article-images.ts`, `src/lib/article-images.ts`, `public/renders/articles/`, `scripts/export-articles.mjs`, `scripts/lib/mdoc-to-blocks.mjs`, `tests/mdoc-to-blocks.test.ts`; Modify `package.json`, `astro.config.mjs`, `src/components/articles/{Figure,Photo}.astro`, `src/lib/article-vars.ts`, `README.md`, `CLAUDE.md`, `cms/README.md`.

- [ ] **Step 1: Сохранить выгрузку и убрать исходники**

`cms/.tmp/articles-export.json` уже есть (вне Git) — статьи в Strapi. Удалить перечисленные файлы. Компоненты `Cards.astro`, `Card.astro`, `ProjectsSlider.astro` — `grep -rn "Cards\|Card.astro\|ProjectsSlider" src` → если используются только из `markdoc.config.ts`, удалить. `npm uninstall @astrojs/markdoc`, из `astro.config.mjs` убрать `markdoc()` и импорт. Из `package.json` — скрипты `gen:articles`, `articles:export`. `@markdoc/markdoc` и `js-yaml` больше не нужны — если они не в `dependencies` корня, ничего не делать.

- [ ] **Step 2: Компоненты фото**

`Figure.astro`, `Photo.astro`: убрать `articleImg` — `const inline = src ? { src, srcset } : undefined`. `src/lib/article-vars.ts`: `fillArticleVars` — `grep -rn fillArticleVars src` → не используется — удалить (оставить `ARTICLE_VARS`, `articleVar`); обновить шапку-комментарий: переменные статей — подстановки `{имя}` в Strapi (`src/data/article-substitutions.ts`).

- [ ] **Step 3: Проверка**

`npm test` — PASS (без тестов выгрузки). `npm run build` → 385 страниц; `node scripts/compare-builds.mjs "$SCRATCH/dist-before-2" dist` → «изменились: 0». `grep -rn "renders/articles\|\.mdoc\|markdoc" src astro.config.mjs package.json` — пусто (кроме истории в комментариях, если осталась, — убрать).

- [ ] **Step 4: Документация**

README: «Где менять контент» — «Статьи и публикации» → «Strapi: раздел «Статьи»»; раздел Strapi — статьи теперь там, «Статьи переедут…» убрать; строку `gen:articles` убрать; про Markdoc-теги — убрать. CLAUDE.md: абзац «Articles» переписать под Strapi (блоки, подстановки `{имя}` из `src/data/article-substitutions.ts`, `ArticleBlocks.astro`, якоря как у github-slugger, `toArticle` в `strapi-content.ts`, поля SEO-группы → прежние поля данных; «restart astro dev after content.config change» оставить). `cms/README.md` — раздел «Статьи» в таблице.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore(articles): Markdoc и генератор картинок статей больше не нужны"
```

---

### Task 8: Инструкция для директора

**Files:** Create `docs/director-guide.md`, `tests/director-guide.test.ts`.

**Interfaces:** Consumes `ARTICLE_SUBSTITUTIONS` (Task 1).

- [ ] **Step 1: Тест (падает)**

`tests/director-guide.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ARTICLE_SUBSTITUTIONS } from '../src/data/article-substitutions'

test('в инструкции перечислены все подстановки', () => {
  const guide = readFileSync('docs/director-guide.md', 'utf8')
  for (const name of Object.keys(ARTICLE_SUBSTITUTIONS)) assert.ok(guide.includes(`{${name}}`), `нет {${name}}`)
})
```
Run: `npm test` — Expected: FAIL (нет файла).

- [ ] **Step 2: Инструкция**

`docs/director-guide.md` — для директора, без технических слов. Разделы:
1. **Вход** — адрес админки (на сервере — `admin.<домен>`, пока локально `http://localhost:1337/admin`), логин из приглашения, язык — русский.
2. **Как устроено** — черновик и «Опубликовать»; что видно на сайте только опубликованное; «Снять с публикации»; через сколько изменения появятся на сайте (локально — сразу; на сервере — после пересборки, 1–2 минуты).
3. **Акция** — пошагово: «Контент → Акции → Создать запись», поля по порядку (название, условия, описание, фото — горизонтальное от 1200 px, «действует до» — включительно, скидка, кнопка), «Опубликовать»; когда уйдёт в архив.
4. **Работа в портфолио** — поля, фото (первое — обложка, порядок перетаскиванием), «ссылка на каталог», адрес страницы не менять после публикации.
5. **Статья** — заголовок, лид (до 160 знаков), обложка 16:9, «Коротко», блоки: как добавить «Текст» (подзаголовки — «Заголовок 2», списки, ссылки, жирный), «Фото» (что на фото, подпись, как показать), «Галерея» (2–4 фото, «высокие двери»), «Выноска», «Видео» (MP4 до 25 МБ, обложка, вертикальный), «Таблица» (пример с `|`), «Цены…» — ставятся блоком, цифры — из каталога; вопросы-ответы; группа «Для поисковиков и каталога» — можно не трогать.
6. **Подстановки** — зачем (адрес, телефон, цены меняются в одном месте), как писать (`{адрес салона}` в фигурных скобках, имя точно из списка), таблица всех имён `{…}` с примером значения; опечатка — сайт не соберётся, разработчик увидит название статьи.
7. **Фото** — с телефона можно (до 25 МБ), сайт сам уменьшит; «Что на фото» заполнять всегда; медиатека — папки.
8. **Если что-то пошло не так** — черновик не появляется (не опубликован), ошибка при сохранении (красное поле — что не так), кому писать (разработчик).

Таблицу подстановок собрать из `ARTICLE_SUBSTITUTIONS` и `ARTICLE_VARS` (значение — пример на сегодня): `npx tsx -e "import('./src/data/article-substitutions.ts').then(async ({ARTICLE_SUBSTITUTIONS}) => { const {articleVar} = await import('./src/lib/article-vars.ts'); for (const [n,p] of Object.entries(ARTICLE_SUBSTITUTIONS)) console.log('| {'+n+'} | '+articleVar(p)+' |') })"`.

- [ ] **Step 3: Тест проходит**

Run: `npm test` — Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add docs/director-guide.md tests/director-guide.test.ts
git commit -m "docs: инструкция для директора — акции, работы, статьи, подстановки"
```

---

## После плана

- Итог пользователю: статьи в Strapi, сверка сборки, ссылка на инструкцию; предложить опубликовать её страницей (Artifact) для директора.
- Этап 2 (сервер) — отдельный план: Strapi + PostgreSQL на VPS, nginx `/uploads`, пересборка по вебхуку публикации, ночная пересборка, резервные копии, удалить ключ «Full Access», `NODE_ENV=production`.
