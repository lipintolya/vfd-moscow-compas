# Strapi, план 1: основа, русский интерфейс, акции и портфолио

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Локально поднять Strapi 5 в `cms/` с русским интерфейсом и двумя разделами — «Акции» и «Портфолио» — и перевести сайт на чтение этих разделов из Strapi.

**Architecture:** Strapi 5.57 (TypeScript, SQLite локально) живёт в `cms/` того же репозитория. Сайт (Astro, статика) при сборке читает опубликованные записи через REST API по ключу только для чтения — загрузчиками Astro content layer в коллекции `promos` и `works`; компоненты получают данные прежнего вида. В dev правка в Strapi через вебхук обновляет данные сайта без перезапуска.

**Tech Stack:** Strapi 5.57.0, Node 26, SQLite (better-sqlite3), Astro 7 content layer, Vue 3, node:test через tsx.

**Spec:** `docs/superpowers/specs/2026-10-11-strapi-cms-design.md` (план 2 — статьи — пишется после этого плана).

## Global Constraints

- Strapi `5.57.0`, версии всех `@strapi/*` зафиксированы точно (без `^`).
- Ответы, подписи, подсказки и тексты интерфейса — по-русски; интерфейс Strapi по умолчанию `ru`.
- Публичный API Strapi закрыт; сайт читает только по ключу (`STRAPI_TOKEN`, тип read-only), только опубликованные записи.
- Ошибка Strapi при сборке сайта = ошибка сборки с понятным текстом; пустой раздел не публикуется молча.
- Бренд-данные — только из `src/config/site.ts`; никаких hex/px в компонентах (токены дизайн-системы).
- Каталог и цены — Supabase, не трогаем.
- Коммиты — в `main`, без веток; push — только по просьбе пользователя. Деплой не запускать.
- Секреты (`cms/.env`, `STRAPI_TOKEN`) — вне Git.

## Review Focus

1. Strapi не запущен при `npm run dev`/`build` → ошибка «Strapi недоступен по адресу … — запустите npm run cms», а не пустой раздел (тест — Task 4).
2. Черновик в Strapi не должен попасть на сайт (запрос всегда с `status=published`) (тест — Task 4).
3. Огромное фото с телефона (6000 px) → на сайт идут уменьшенные копии Strapi в `srcset`, `src` не оригинал (тест — Task 4).
4. Акция «действует до» сегодняшней даты → ещё активна до конца дня; дата из Strapi `YYYY-MM-DD` доходит до `isPromoActive` без сдвига часового пояса (тест — Task 5).
5. В `.env` нет `STRAPI_TOKEN` или `STRAPI_URL` → понятная ошибка с подсказкой (тест — Task 4).

---

## Файлы

**Создаются:**
- `cms/` — проект Strapi (скаффолд `create-strapi`), в нём:
  - `cms/config/plugins.ts` — размеры копий фото, лимит загрузки
  - `cms/src/admin/app.tsx` — русский язык по умолчанию, словарь
  - `cms/src/admin/translations/ru.json` — недостающие строки Strapi
  - `cms/scripts/ru-missing.mjs` — проверка полноты перевода
  - `cms/src/api/promo/**`, `cms/src/api/work/**` — разделы
  - `cms/src/components/shared/item.json`, `cms/src/components/shared/catalog-link.json`
  - `cms/src/bootstrap/labels.ts` — русские подписи и подсказки полей
  - `cms/src/bootstrap/access.ts` — права роли «Редактор», ключ для сайта, вебхук dev
  - `cms/scripts/import-works.mjs` — перенос 3 работ с фото
- `src/lib/strapi.ts` — клиент REST API + `strapiImage()`
- `src/lib/strapi-content.ts` — загрузчики Astro и преобразование записей
- `src/integrations/strapi-refresh.ts` — обновление данных в dev по вебхуку
- `tests/strapi.test.ts`, `tests/strapi-content.test.ts`
- `scripts/compare-builds.mjs` — сравнение двух сборок (видимый текст)

**Меняются:** `package.json`, `.gitignore`, `.env.example`, `astro.config.mjs`, `src/content.config.ts`, `src/data/promos.ts`, `src/data/portfolio-works.ts`, `src/components/home/Promo.vue`, `src/pages/index.astro`, `src/pages/akcii.astro`, `src/pages/promo-archive.astro`, `src/components/home/OurWorks.astro`, `src/components/portfolio/PortfolioGrid.vue`, `src/components/portfolio/WorkCard.astro`, `src/pages/portfolio/index.astro`, `src/pages/portfolio/[slug].astro`, `src/pages/catalog/decor.astro`, `src/pages/catalog/skrytye-dveri.astro`, `README.md`, `CLAUDE.md`.

**Удаляются (Task 6):** `scripts/gen-portfolio-thumbs.mjs`, `public/renders/portfolio/`.

---

### Task 1: Strapi в `cms/`

**Files:** Create `cms/` (скаффолд); Modify `package.json`, `.gitignore`.

**Interfaces:** Produces: `npm run cms` (Strapi на `http://localhost:1337`), `npm run cms:install`.

- [ ] **Step 1: Создать проект**

```bash
cd /Users/tolya/Projects/vfd-moscow-compas
npx --yes create-strapi@5.57.0 cms --no-run --skip-cloud --ts --use-npm --install --no-git-init --no-example --dbclient=sqlite --dbfile=.tmp/data.db
```
Expected: папка `cms/` с `package.json`, `config/`, `src/`, `.env`, `.gitignore`.

- [ ] **Step 2: Зафиксировать версии и выключить телеметрию**

В `cms/package.json` заменить `^5.57.0` на `5.57.0` у всех `@strapi/*`. В `cms/.env` и `cms/.env.example` добавить строку `STRAPI_TELEMETRY_DISABLED=true`. Затем `npm --prefix cms install`.

- [ ] **Step 3: Команды в корне и .gitignore**

В корневой `package.json` → `scripts` добавить после `"astro"`:
```json
"cms": "npm --prefix cms run develop",
"cms:install": "npm --prefix cms install",
```
В корневой `.gitignore` добавить:
```
# Strapi (cms/) — база, загруженные фото, сборка админки, секреты
cms/.tmp/
cms/public/uploads/*
!cms/public/uploads/.gitkeep
cms/dist/
cms/.strapi/
cms/.env
```

- [ ] **Step 4: Запустить и проверить**

Run: `npm run cms` (фоном), затем `curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/_health`
Expected: `204`.

- [ ] **Step 5: Первый администратор (разработчик)**

```bash
npm --prefix cms run strapi -- admin:create-user --firstname=Разработчик --email=dev@vfd.local --password='<сгенерировать 16+ символов>'
```
Пароль сохранить в `cms/.tmp/admin.txt` (вне Git) и сообщить пользователю в итоговом сообщении.

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore cms
git commit -m "feat(cms): Strapi 5.57 в cms/ — локально на SQLite"
```

---

### Task 2: Русский интерфейс

**Files:** Create `cms/src/admin/app.tsx`, `cms/src/admin/translations/ru.json`, `cms/scripts/ru-missing.mjs`; Modify `cms/package.json` (script `check:ru`).

**Interfaces:** Produces: `npm --prefix cms run check:ru` — 0 непереведённых строк в админке, редакторе и медиатеке.

- [ ] **Step 1: Скрипт проверки полноты (сначала падает)**

`cms/scripts/ru-missing.mjs`:
```js
/**
 * Строки интерфейса Strapi без русского перевода — в админке, редакторе
 * записей (content-manager) и медиатеке (upload). Наш словарь
 * src/admin/translations/ru.json дополняет перевод Strapi.
 *   node scripts/ru-missing.mjs          — список недостающих (JSON en)
 *   node scripts/ru-missing.mjs --check  — код 1, если что-то не переведено
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const require = createRequire(path.join(ROOT, 'package.json'))
const SOURCES = [
  { pkg: '@strapi/admin', dir: 'dist/admin/admin/src/translations', prefix: '' },
  { pkg: '@strapi/content-manager', dir: 'dist/admin/translations', prefix: 'content-manager.' },
  { pkg: '@strapi/upload', dir: 'dist/admin/translations', prefix: 'upload.' },
]
const load = async (file) => (await import(file)).default
const ours = JSON.parse(await readFile(path.join(ROOT, 'src/admin/translations/ru.json'), 'utf8').catch(() => '{}'))
const missing = {}
for (const { pkg, dir, prefix } of SOURCES) {
  const base = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), dir)
  const en = await load(path.join(base, 'en.json.mjs'))
  const ru = await load(path.join(base, 'ru.json.mjs')).catch(() => ({}))
  for (const [key, text] of Object.entries(en)) {
    const full = prefix + key
    if (!(key in ru) && !(full in ours)) missing[full] = text
  }
}
const count = Object.keys(missing).length
if (process.argv.includes('--check')) {
  console.log(count ? `Не переведено строк: ${count}` : 'Перевод полный')
  process.exit(count ? 1 : 0)
}
console.log(JSON.stringify(missing, null, 2))
```
В `cms/package.json` → scripts: `"check:ru": "node scripts/ru-missing.mjs --check"`.

Run: `npm --prefix cms run check:ru` — Expected: FAIL, «Не переведено строк: ~570».

- [ ] **Step 2: Словарь**

Run: `node cms/scripts/ru-missing.mjs > cms/.tmp/ru-missing.json`. Перевести каждое значение на русский (стиль интерфейса Strapi `ru`: «Сохранить», «Опубликовать», «Медиатека»; плейсхолдеры `{name}` и разметку `<b>…</b>` сохранить как есть) и записать результат в `cms/src/admin/translations/ru.json` (те же ключи).

- [ ] **Step 3: Подключить и сделать русский языком по умолчанию**

`cms/src/admin/app.tsx`:
```tsx
/* Интерфейс Strapi — по-русски: язык ru и наш словарь недостающих строк
   (Strapi переведён не полностью; проверка — npm run check:ru).
   Русский выбран по умолчанию: при первом входе язык не нужно искать. */
import type { StrapiApp } from '@strapi/strapi/admin'
import ru from './translations/ru.json'

const LANGUAGE_KEY = 'strapi-admin-language'

export default {
  config: {
    locales: ['ru'],
    translations: { ru },
  },
  register(_app: StrapiApp) {
    try {
      if (!localStorage.getItem(LANGUAGE_KEY)) localStorage.setItem(LANGUAGE_KEY, 'ru')
    } catch {
      /* приватный режим браузера — останется английский, язык можно выбрать в профиле */
    }
  },
  bootstrap(_app: StrapiApp) {},
}
```

- [ ] **Step 4: Проверка**

Run: `npm --prefix cms run check:ru` — Expected: PASS «Перевод полный».
Перезапустить `npm run cms`, открыть `http://localhost:1337/admin` в чистом профиле браузера (CDP-снимок экрана входа и списка записей): интерфейс на русском. Если язык английский — ключ хранения языка в Strapi 5.57 другой: найти его `grep -rn "localStorage" node_modules/@strapi/admin/dist/admin | grep -i lang` и поправить `LANGUAGE_KEY`.

- [ ] **Step 5: Commit**

```bash
git add cms/src/admin cms/scripts/ru-missing.mjs cms/package.json
git commit -m "feat(cms): русский интерфейс Strapi по умолчанию, дописан перевод"
```

---

### Task 3: Разделы «Акции» и «Портфолио», подписи, доступ

**Files:** Create `cms/src/api/promo/{content-types/promo/schema.json,controllers/promo.ts,routes/promo.ts,services/promo.ts}`, то же для `work`, `cms/src/components/shared/item.json`, `cms/src/components/shared/catalog-link.json`, `cms/config/plugins.ts`, `cms/src/bootstrap/labels.ts`, `cms/src/bootstrap/access.ts`; Modify `cms/src/index.ts`, `.env.example`.

**Interfaces:** Produces REST: `GET /api/promos`, `GET /api/works` (Bearer `STRAPI_TOKEN`, только опубликованные); в корневом `.env` — `STRAPI_URL=http://localhost:1337`, `STRAPI_TOKEN=<read-only>`.

- [ ] **Step 1: Схема акции**

`cms/src/api/promo/content-types/promo/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "promos",
  "info": {
    "singularName": "promo",
    "pluralName": "promos",
    "displayName": "Акции",
    "description": "Активные — на главной и /akcii/, после даты окончания — в архиве"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": false } },
  "attributes": {
    "title": { "type": "string", "required": true, "maxLength": 80 },
    "subtitle": { "type": "string", "required": true, "maxLength": 140 },
    "description": { "type": "text", "maxLength": 600 },
    "image": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "validUntil": { "type": "date", "required": true },
    "discount": { "type": "string", "maxLength": 20 },
    "ctaText": { "type": "string", "maxLength": 40 },
    "ctaLink": { "type": "string", "maxLength": 200 }
  }
}
```
`controllers/promo.ts`: `import { factories } from '@strapi/strapi'; export default factories.createCoreController('api::promo.promo')`; `routes/promo.ts`: `…createCoreRouter('api::promo.promo')`; `services/promo.ts`: `…createCoreService('api::promo.promo')`.

- [ ] **Step 2: Компоненты и схема работы**

`cms/src/components/shared/item.json`:
```json
{ "collectionName": "components_shared_items", "info": { "displayName": "Пункт", "icon": "bulletList" },
  "attributes": { "text": { "type": "string", "required": true, "maxLength": 160 } } }
```
`cms/src/components/shared/catalog-link.json`:
```json
{ "collectionName": "components_shared_catalog_links", "info": { "displayName": "Ссылка на каталог", "icon": "link" },
  "attributes": {
    "section": { "type": "enumeration", "required": true,
      "enum": ["Межкомнатные двери", "Скрытые двери", "Серые и графитовые двери", "Белые двери", "Перегородки", "Декор и погонаж"] },
    "label": { "type": "string", "maxLength": 80 } } }
```
`cms/src/api/work/content-types/work/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "works",
  "info": { "singularName": "work", "pluralName": "works", "displayName": "Портфолио",
            "description": "Наши работы: /portfolio/, главная, страницы разделов" },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": false } },
  "attributes": {
    "title": { "type": "string", "required": true, "maxLength": 120 },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "date": { "type": "date", "required": true },
    "category": { "type": "enumeration", "required": true, "enum": ["Межкомнатные", "Скрытые двери", "Перегородки"] },
    "objectType": { "type": "enumeration", "required": true, "enum": ["Квартира", "Частный дом", "Офис", "Коммерческая недвижимость"] },
    "location": { "type": "string", "maxLength": 120 },
    "description": { "type": "text", "required": true, "maxLength": 170 },
    "story": { "type": "text" },
    "model": { "type": "string", "maxLength": 80 },
    "doorCount": { "type": "integer", "min": 1 },
    "features": { "type": "component", "repeatable": true, "component": "shared.item" },
    "tags": { "type": "component", "repeatable": true, "component": "shared.item" },
    "images": { "type": "media", "multiple": true, "required": true, "allowedTypes": ["images"] },
    "catalogLink": { "type": "component", "repeatable": false, "component": "shared.catalog-link" }
  }
}
```
Плюс controllers/routes/services для `api::work.work` (как у акции).

Если Strapi при старте отклонит кириллицу в значениях `enumeration` — заменить значения на латинские ключи (`interior|hidden|partitions`, `apartment|house|office|commercial`, `catalog|hidden|grey|white|partitions|decor`), а русские названия выводить подсказкой поля (Step 4); маппинг на сайте (Task 5–6) тогда без перевода.

- [ ] **Step 3: Фото — копии и лимит**

`cms/config/plugins.ts`:
```ts
/* Медиатека: Strapi при загрузке делает уменьшенные копии — сайт берёт
   подходящую под экран (src/lib/strapi.ts → strapiImage). Фото с телефона
   (до 25 МБ) принимаем — на сайт уходят копии, не оригинал. */
export default () => ({
  upload: {
    config: {
      sizeLimit: 25 * 1024 * 1024,
      breakpoints: { xlarge: 1920, large: 1280, medium: 960, small: 640 },
    },
  },
})
```
В `cms/config/middlewares.ts` у `'strapi::body'` задать `{ name: 'strapi::body', config: { formidable: { maxFileSize: 25 * 1024 * 1024 } } }`.

- [ ] **Step 4: Русские подписи и подсказки полей**

`cms/src/bootstrap/labels.ts`:
```ts
/* Подписи и подсказки полей в редакторе Strapi — по-русски. Хранятся в
   настройках отображения content-manager; применяем при каждом старте,
   чтобы правка этого файла сразу попадала в админку. */
import type { Core } from '@strapi/strapi'

type Labels = Record<string, { label: string; description?: string; placeholder?: string }>

const LABELS: Record<string, Labels> = {
  'api::promo.promo': {
    title: { label: 'Название', description: 'Коротко, до 80 знаков: «−15 % на скрытые двери»' },
    subtitle: { label: 'Условия', description: 'Одна строка под названием' },
    description: { label: 'Описание', description: 'Подробности, если нужны' },
    image: { label: 'Фото', description: 'Горизонтальное, от 1200 px по ширине' },
    validUntil: { label: 'Действует до', description: 'Включительно; на следующий день акция уйдёт в архив' },
    discount: { label: 'Скидка', placeholder: '−10 %' },
    ctaText: { label: 'Текст кнопки', placeholder: 'Узнать подробнее' },
    ctaLink: { label: 'Ссылка кнопки', placeholder: '/catalog/skrytye-dveri/' },
  },
  'api::work.work': {
    title: { label: 'Название', description: 'Заголовок страницы работы' },
    slug: { label: 'Адрес страницы', description: 'Составляется из названия; после публикации не меняйте — старая ссылка перестанет работать' },
    date: { label: 'Дата' },
    category: { label: 'Вид работ' },
    objectType: { label: 'Объект' },
    location: { label: 'Город, район', placeholder: 'Москва, ЖК …' },
    description: { label: 'Короткое описание', description: 'Для поисковиков, до 170 знаков' },
    story: { label: 'История', description: 'Абзацы — через пустую строку' },
    model: { label: 'Модель', placeholder: 'Секрет' },
    doorCount: { label: 'Сколько дверей' },
    features: { label: 'Особенности', description: 'Каждая — отдельным пунктом' },
    tags: { label: 'Метки' },
    images: { label: 'Фото', description: 'Первое — обложка' },
    catalogLink: { label: 'Ссылка на каталог', description: 'Раздел каталога под описанием работы' },
  },
  'shared.item': { text: { label: 'Текст' } },
  'shared.catalog-link': { section: { label: 'Раздел' }, label: { label: 'Подпись ссылки', description: 'Если пусто — название раздела' } },
}

export async function applyLabels(strapi: Core.Strapi) {
  for (const [uid, fields] of Object.entries(LABELS)) {
    const isComponent = !uid.includes('::')
    const key = `${isComponent ? 'components' : 'content_types'}::${uid}`
    const store = strapi.store({ type: 'plugin', name: 'content_manager_configuration' })
    const config = (await store.get({ key })) as { metadatas?: Record<string, { edit: Record<string, unknown>; list: Record<string, unknown> }> } | null
    if (!config?.metadatas) continue
    for (const [field, text] of Object.entries(fields)) {
      const meta = config.metadatas[field]
      if (!meta) continue
      meta.edit = { ...meta.edit, ...text }
      meta.list = { ...meta.list, label: text.label }
    }
    await store.set({ key, value: config })
  }
}
```

- [ ] **Step 5: Доступ — роль «Редактор», ключ для сайта, вебхук dev**

`cms/src/bootstrap/access.ts`:
```ts
/* Доступ:
   - роль «Редактор» (директор) может всё с акциями и работами, включая
     публикацию; настройки и устройство разделов ей не видны (так у роли
     Editor в Strapi);
   - сайт читает Strapi по ключу только для чтения; в разработке ключ
     создаётся сам и дописывается в .env сайта;
   - в разработке Strapi сообщает дев-серверу сайта об изменениях. */
import type { Core } from '@strapi/strapi'
import { appendFile, readFile } from 'node:fs/promises'
import path from 'node:path'

export const MANAGED = ['api::promo.promo', 'api::work.work']
const ACTIONS = ['create', 'read', 'update', 'delete', 'publish'].map((a) => `plugin::content-manager.explorer.${a}`)

export async function grantEditor(strapi: Core.Strapi) {
  const roles = strapi.service('admin::role')
  const editor = await roles.findOne({ code: 'strapi-editor' })
  if (!editor) return
  const has = await strapi.service('admin::permission').findMany({ where: { role: editor.id } })
  const missing = MANAGED.flatMap((subject) => ACTIONS.map((action) => ({ action, subject })))
    .filter((p) => !has.some((h: { action: string; subject: string }) => h.action === p.action && h.subject === p.subject))
  if (missing.length) await roles.addPermissions(editor.id, missing.map((p) => ({ ...p, properties: {}, conditions: [] })))
}

export async function ensureSiteToken(strapi: Core.Strapi) {
  if (process.env.NODE_ENV === 'production') return
  const tokens = strapi.service('admin::api-token')
  if (await tokens.exists({ name: 'site-build' })) return
  const { accessKey } = await tokens.create({ name: 'site-build', description: 'Сборка сайта: только чтение', type: 'read-only', lifespan: null })
  const envFile = path.resolve(process.cwd(), '..', '.env')
  const env = await readFile(envFile, 'utf8').catch(() => '')
  const lines = [!/^STRAPI_URL=/m.test(env) && 'STRAPI_URL=http://localhost:1337', `STRAPI_TOKEN=${accessKey}`].filter(Boolean)
  await appendFile(envFile, `${env.endsWith('\n') || !env ? '' : '\n'}${lines.join('\n')}\n`)
  strapi.log.info('Ключ сайта создан и записан в .env сайта (STRAPI_TOKEN)')
}

export async function ensureDevWebhook(strapi: Core.Strapi) {
  if (process.env.NODE_ENV === 'production') return
  const url = 'http://localhost:4321/__strapi/refresh'
  const all = await strapi.get('webhookStore').findWebhooks()
  if (all.some((w: { url: string }) => w.url === url)) return
  await strapi.get('webhookStore').createWebhook({
    name: 'Сайт (разработка): обновить данные', url, headers: {}, isEnabled: true,
    events: ['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish', 'media.update'],
  })
}
```
`cms/src/index.ts`:
```ts
import type { Core } from '@strapi/strapi'
import { applyLabels } from './bootstrap/labels'
import { grantEditor, ensureSiteToken, ensureDevWebhook } from './bootstrap/access'

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyLabels(strapi)
    await grantEditor(strapi)
    await ensureSiteToken(strapi)
    await ensureDevWebhook(strapi)
  },
}
```
Если сигнатуры сервисов в 5.57 отличаются (Strapi упадёт при старте с TypeError) — найти их в `cms/node_modules/@strapi/admin/dist/server/server/src/services/{role,api-token}` и `@strapi/core` (`webhookStore`) и поправить вызовы, сохранив поведение.

В корневой `.env.example` добавить:
```
# Strapi (cms/): адрес и ключ только для чтения — в разработке ключ создаётся сам (npm run cms)
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=
```

- [ ] **Step 6: Проверка API**

Перезапустить `npm run cms`. Затем:
```bash
source .env
curl -s -o /dev/null -w "%{http_code}\n" "$STRAPI_URL/api/promos"                               # без ключа
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $STRAPI_TOKEN" "$STRAPI_URL/api/promos"
curl -s -H "Authorization: Bearer $STRAPI_TOKEN" "$STRAPI_URL/api/works"
```
Expected: `403`, `200`, `{"data":[],"meta":{"pagination":…}}`. Снимок экрана редактора «Портфолио → Создать»: подписи и подсказки по-русски.

- [ ] **Step 7: Commit**

```bash
git add cms/src cms/config .env.example
git commit -m "feat(cms): разделы «Акции» и «Портфолио», русские подписи, роль редактора, ключ сайта"
```

---

### Task 4: Клиент Strapi для сайта

**Files:** Create `src/lib/strapi.ts`, `tests/strapi.test.ts`; Modify `package.json` (devDependency `tsx`, script `test`).

**Interfaces:**
- Produces:
  - `strapiFetchAll<T>(collection: string, query?: Record<string, string>, opts?: { fetch?: typeof fetch; env?: Record<string, string | undefined> }): Promise<T[]>` — все опубликованные записи, постранично;
  - `interface StrapiMedia { url: string; alternativeText?: string | null; caption?: string | null; width?: number | null; height?: number | null; formats?: Record<string, { url: string; width: number; height: number }> | null }`;
  - `interface SiteImage { src: string; srcset?: string; width?: number; height?: number; alt: string }`;
  - `strapiImage(media: StrapiMedia, maxWidth?: number): SiteImage`.

- [ ] **Step 1: Тесты (падают)**

`tests/strapi.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { strapiFetchAll, strapiImage } from '../src/lib/strapi'

const env = { STRAPI_URL: 'http://cms.test', STRAPI_TOKEN: 'secret' }
const page = (data: unknown[], p: number, pageCount: number) =>
  new Response(JSON.stringify({ data, meta: { pagination: { page: p, pageCount } } }), { status: 200 })

test('забирает все страницы, только опубликованное, с ключом', async () => {
  const calls: string[] = []
  const fetch = async (url: string | URL, init?: RequestInit) => {
    calls.push(String(url))
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer secret')
    const p = Number(new URL(String(url)).searchParams.get('pagination[page]'))
    return page([{ id: p }], p, 2)
  }
  const all = await strapiFetchAll<{ id: number }>('works', { 'populate': '*' }, { fetch: fetch as typeof globalThis.fetch, env })
  assert.deepEqual(all.map((x) => x.id), [1, 2])
  for (const u of calls) {
    assert.equal(new URL(u).searchParams.get('status'), 'published')
    assert.equal(new URL(u).searchParams.get('populate'), '*')
  }
})

test('Strapi не запущен — понятная ошибка', async () => {
  const fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(strapiFetchAll('works', {}, { fetch: fetch as typeof globalThis.fetch, env }),
    /Strapi недоступен по адресу http:\/\/cms\.test — запустите npm run cms/)
})

test('ответ с ошибкой — код и коллекция в тексте', async () => {
  const fetch = async () => new Response('{"error":{"message":"Forbidden"}}', { status: 403 })
  await assert.rejects(strapiFetchAll('works', {}, { fetch: fetch as typeof globalThis.fetch, env }), /works: HTTP 403/)
})

test('нет ключа в .env — подсказка', async () => {
  await assert.rejects(strapiFetchAll('works', {}, { env: { STRAPI_URL: 'http://cms.test' } }),
    /STRAPI_TOKEN/)
})

test('фото: srcset из копий Strapi, src — не оригинал 6000 px', () => {
  const img = strapiImage({
    url: '/uploads/big.jpg', width: 6000, height: 4000, alternativeText: 'Дверь',
    formats: {
      small: { url: '/uploads/small_big.jpg', width: 640, height: 427 },
      large: { url: '/uploads/large_big.jpg', width: 1280, height: 853 },
      xlarge: { url: '/uploads/xlarge_big.jpg', width: 1920, height: 1280 },
      thumbnail: { url: '/uploads/thumbnail_big.jpg', width: 234, height: 156 },
    },
  }, 1280)
  assert.equal(img.src, '/uploads/large_big.jpg')
  assert.equal(img.srcset, '/uploads/thumbnail_big.jpg 234w, /uploads/small_big.jpg 640w, /uploads/large_big.jpg 1280w, /uploads/xlarge_big.jpg 1920w')
  assert.equal(img.width, 1280)
  assert.equal(img.alt, 'Дверь')
})

test('фото без копий — оригинал', () => {
  const img = strapiImage({ url: '/uploads/a.png', width: 300, height: 200, formats: null })
  assert.equal(img.src, '/uploads/a.png')
  assert.equal(img.srcset, undefined)
  assert.equal(img.alt, '')
})
```
В корневом `package.json`: `npm install -D --save-exact tsx@<текущая>`; script `"test": "tsx --test tests/*.test.ts"`.

Run: `npm test` — Expected: FAIL (`Cannot find module '../src/lib/strapi'`).

- [ ] **Step 2: Реализация**

`src/lib/strapi.ts`:
```ts
/**
 * Чтение Strapi (cms/) при сборке сайта: акции, портфолио (позже — статьи).
 * Только опубликованное, по ключу только для чтения (STRAPI_URL,
 * STRAPI_TOKEN в .env). Ошибка — ошибка сборки: пустой раздел на сайт
 * не уходит. Фото — уменьшенные копии Strapi (strapiImage).
 */
const PAGE_SIZE = 100

export interface StrapiMedia {
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  formats?: Record<string, { url: string; width: number; height: number }> | null
}

export interface SiteImage { src: string; srcset?: string; width?: number; height?: number; alt: string }

type Env = Record<string, string | undefined>
interface Options { fetch?: typeof fetch; env?: Env }

function settings(env: Env) {
  const url = env.STRAPI_URL?.replace(/\/$/, '')
  const token = env.STRAPI_TOKEN
  if (!url || !token) {
    throw new Error('Strapi: в .env нет STRAPI_URL или STRAPI_TOKEN — запустите npm run cms (в разработке ключ появится сам) или скопируйте из .env.example')
  }
  return { url, token }
}

export async function strapiFetchAll<T>(collection: string, query: Record<string, string> = {}, opts: Options = {}): Promise<T[]> {
  const env = opts.env ?? { ...process.env, ...import.meta.env }
  const doFetch = opts.fetch ?? fetch
  const { url, token } = settings(env)
  const items: T[] = []
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ ...query, status: 'published', 'pagination[page]': String(page), 'pagination[pageSize]': String(PAGE_SIZE) })
    let res: Response
    try {
      res = await doFetch(`${url}/api/${collection}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    } catch {
      throw new Error(`Strapi недоступен по адресу ${url} — запустите npm run cms`)
    }
    if (!res.ok) throw new Error(`Strapi ${collection}: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`)
    const json = (await res.json()) as { data: T[]; meta: { pagination: { page: number; pageCount: number } } }
    items.push(...json.data)
    if (page >= json.meta.pagination.pageCount) return items
  }
}

export function strapiImage(media: StrapiMedia, maxWidth = 1280): SiteImage {
  const variants = Object.values(media.formats ?? {}).sort((a, b) => a.width - b.width)
  const alt = media.alternativeText ?? ''
  if (!variants.length) return { src: media.url, width: media.width ?? undefined, height: media.height ?? undefined, alt }
  const main = [...variants].reverse().find((v) => v.width <= maxWidth) ?? variants[0]!
  return {
    src: main.url,
    srcset: variants.map((v) => `${v.url} ${v.width}w`).join(', '),
    width: main.width,
    height: main.height,
    alt,
  }
}
```

- [ ] **Step 3: Тесты проходят**

Run: `npm test` — Expected: PASS (6 tests).

- [ ] **Step 4: Commit**

```bash
git add src/lib/strapi.ts tests/strapi.test.ts package.json package-lock.json
git commit -m "feat(site): клиент Strapi — только опубликованное, понятные ошибки, копии фото"
```

---

### Task 5: Акции из Strapi

**Files:** Create `src/lib/strapi-content.ts`, `tests/strapi-content.test.ts`, `src/integrations/strapi-refresh.ts`, `scripts/compare-builds.mjs`; Modify `src/content.config.ts`, `astro.config.mjs`, `src/data/promos.ts`, `src/components/home/Promo.vue`, `src/pages/index.astro`, `src/pages/akcii.astro`, `src/pages/promo-archive.astro`.

**Interfaces:**
- Consumes: `strapiFetchAll`, `strapiImage`, `StrapiMedia` (Task 4).
- Produces: коллекция `promos` (данные типа `Promo` из `src/data/promos.ts`, `id: string`); `toPromo(raw: StrapiPromo): Promo`; `strapiLoader(name, load)`; интеграция `strapiRefresh()`; `scripts/compare-builds.mjs <old dist> <new dist>`.

- [ ] **Step 1: Эталон сборки до изменений**

```bash
npm run build && rm -rf /tmp/vfd-dist-before && cp -R dist /tmp/vfd-dist-before
```
`scripts/compare-builds.mjs` — переносим проверку из чистки проекта:
```js
/**
 * Сравнение двух сборок сайта: какие страницы изменились по видимому
 * тексту (без стилей, скриптов, служебных атрибутов).
 *   node scripts/compare-builds.mjs <старая dist> <новая dist> [--only=/portfolio/]
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
const [a, b] = process.argv.slice(2)
const only = process.argv.find((x) => x.startsWith('--only='))?.slice(7)
const walk = async (dir, out = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, out); else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}
const text = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const files = (await walk(a)).map((f) => path.relative(a, f)).filter((f) => !only || `/${f}`.startsWith(only))
let changed = 0
for (const f of files) {
  const before = text(await readFile(path.join(a, f), 'utf8'))
  const after = await readFile(path.join(b, f), 'utf8').then(text).catch(() => null)
  if (after === null) { console.log(`нет страницы: ${f}`); changed++; continue }
  if (before !== after) {
    changed++
    const i = [...before].findIndex((c, k) => c !== after[k])
    console.log(`изменилась: ${f}\n  было:  …${before.slice(Math.max(0, i - 60), i + 80)}\n  стало: …${after.slice(Math.max(0, i - 60), i + 80)}`)
  }
}
console.log(`Страниц: ${files.length}, изменились: ${changed}`)
process.exit(changed ? 1 : 0)
```

- [ ] **Step 2: Тесты преобразования (падают)**

`tests/strapi-content.test.ts`:
```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toPromo } from '../src/lib/strapi-content'
import { isPromoActive } from '../src/lib/promo-dates'

test('акция из Strapi → вид сайта', () => {
  const promo = toPromo({
    documentId: 'p1', title: '−15 % на скрытые двери', subtitle: 'До конца месяца', description: null,
    validUntil: '2026-10-31', discount: '−15 %', ctaText: null, ctaLink: null,
    image: { url: '/uploads/p.jpg', width: 2000, height: 1200, formats: { small: { url: '/uploads/small_p.jpg', width: 640, height: 384 } } },
  })
  assert.equal(promo.id, 'p1')
  assert.equal(promo.description, '')
  assert.equal(promo.image, '/uploads/small_p.jpg')
  assert.equal(promo.imageSrcset, '/uploads/small_p.jpg 640w')
  assert.equal(promo.ctaText, undefined)
})

test('«действует до» сегодня — акция активна до конца дня', () => {
  const promo = toPromo({ documentId: 'p2', title: 'А', subtitle: 'Б', validUntil: '2026-10-11', image: null })
  assert.equal(isPromoActive(promo.validUntil, new Date(2026, 9, 11, 23, 30)), true)
  assert.equal(isPromoActive(promo.validUntil, new Date(2026, 9, 12, 0, 5)), false)
})
```
Run: `npm test` — Expected: FAIL (нет `src/lib/strapi-content`).

- [ ] **Step 3: Тип акции и преобразование**

`src/data/promos.ts` — оставить комментарий-шапку (переписать: «Акции ведутся в Strapi (раздел «Акции», npm run cms); здесь — тип для компонентов»), `interface Promo` с `id: string`, без `placeholder`, без массива `PROMOS` и заглушек.

`src/lib/strapi-content.ts`:
```ts
/**
 * Записи Strapi → данные сайта прежнего вида (компоненты не меняются) и
 * загрузчики коллекций Astro (src/content.config.ts).
 */
import type { Loader } from 'astro/loaders'
import { strapiFetchAll, strapiImage, type StrapiMedia } from './strapi'
import type { Promo } from '../data/promos'

export interface StrapiPromo {
  documentId: string; title: string; subtitle: string; description?: string | null
  image?: StrapiMedia | null; validUntil: string; discount?: string | null
  ctaText?: string | null; ctaLink?: string | null
}

const opt = (v: string | null | undefined) => v || undefined

export function toPromo(raw: StrapiPromo): Promo {
  const img = raw.image ? strapiImage(raw.image, 800) : undefined
  return {
    id: raw.documentId,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description ?? '',
    image: img?.src,
    imageSrcset: img?.srcset,
    validUntil: raw.validUntil,
    discount: opt(raw.discount),
    ctaText: opt(raw.ctaText),
    ctaLink: opt(raw.ctaLink),
  }
}

/** Загрузчик коллекции из Strapi: забирает всё опубликованное, проверяет по схеме коллекции */
export function strapiLoader<T>(name: string, fetchAll: () => Promise<{ id: string; data: T }[]>): Loader {
  return {
    name,
    async load({ store, parseData, generateDigest, logger }) {
      const entries = await fetchAll()
      store.clear()
      for (const { id, data } of entries) {
        const parsed = await parseData({ id, data: data as Record<string, unknown> })
        store.set({ id, data: parsed, digest: generateDigest(parsed) })
      }
      logger.info(`Strapi: ${entries.length} записей`)
    },
  }
}

export const promosLoader = () =>
  strapiLoader('strapi-promos', async () =>
    (await strapiFetchAll<StrapiPromo>('promos', { 'populate[image]': 'true', sort: 'validUntil:asc' }))
      .map((raw) => ({ id: raw.documentId, data: toPromo(raw) })))
```
`src/content.config.ts` — добавить коллекцию:
```ts
import { promosLoader } from './lib/strapi-content'
// …
/* Акции — из Strapi (раздел «Акции»). Схема — проверка на сборке:
   запись с ошибкой остановит сборку с её id */
const promos = defineCollection({
  loader: promosLoader(),
  schema: z.object({
    id: z.string(), title: z.string(), subtitle: z.string(), description: z.string(),
    image: z.string().optional(), imageSrcset: z.string().optional(),
    validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    discount: z.string().optional(), ctaText: z.string().optional(), ctaLink: z.string().optional(),
  }),
})
export const collections = { articles, promos }
```
Run: `npm test` — Expected: PASS.

- [ ] **Step 4: Страницы и блок на главной**

- `src/pages/index.astro`: `const promos = (await getCollection('promos')).map((e) => e.data)` и `<Promo client:idle promos={promos} />`; если активных нет — компонент не рендерит секцию (Step 5).
- `src/components/home/Promo.vue`: убрать импорт `PROMOS` и default; `promos: Promo[]` — обязательный проп; секция целиком `v-if="activePromos.length"`; убрать ветки `placeholder`.
- `src/pages/akcii.astro`, `src/pages/promo-archive.astro`: `const all = (await getCollection('promos')).map((e) => e.data)` вместо `PROMOS`; убрать ветки `placeholder`; пустые состояния страниц оставить как есть.

- [ ] **Step 5: Обновление данных в dev**

`src/integrations/strapi-refresh.ts`:
```ts
/* В разработке: Strapi после правки шлёт POST /__strapi/refresh
   (вебхук создаётся в cms/src/bootstrap/access.ts) — данные коллекций из
   Strapi перечитываются без перезапуска дев-сервера */
import type { AstroIntegration } from 'astro'

export default function strapiRefresh(loaders: string[]): AstroIntegration {
  return {
    name: 'strapi-refresh',
    hooks: {
      'astro:server:setup': ({ server, refreshContent, logger }) => {
        server.middlewares.use('/__strapi/refresh', async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
          await refreshContent?.({ loaders })
          logger.info('Strapi: данные обновлены')
          res.statusCode = 204
          res.end()
        })
      },
    },
  }
}
```
`astro.config.mjs`: `import strapiRefresh from './src/integrations/strapi-refresh.ts'`, в `integrations` добавить `strapiRefresh(['strapi-promos', 'strapi-works'])`; в `vite.server.proxy` добавить `'/uploads': process.env.STRAPI_URL ?? 'http://localhost:1337'` (фото Strapi в dev — с того же адреса, что на сервере).

- [ ] **Step 6: Проверка вживую**

1. `npm run cms` и `npm run dev`. В админке создать акцию «Тест −10 %», действует до завтра, фото — любой `public/media/...webp`; опубликовать.
2. Через ≤5 с главная и `/akcii/` показывают акцию с фото (CDP-снимок 390 px), консоль без ошибок.
3. Снять с публикации → акция исчезает с главной. Сохранить как черновик → на сайте её нет.
4. Остановить Strapi, `npm run build` → падает с «Strapi недоступен по адресу http://localhost:1337 — запустите npm run cms».
5. Удалить тестовую акцию. `npm run build` при запущенном Strapi; `node scripts/compare-builds.mjs /tmp/vfd-dist-before dist` — изменились только `index.html` (блок акций скрыт), `akcii/`, `promo-archive/` (заглушки ушли); остальные страницы совпадают.

- [ ] **Step 7: Commit**

```bash
git add src scripts/compare-builds.mjs astro.config.mjs tests
git commit -m "feat(site): акции из Strapi; обновление данных в dev по вебхуку"
```

---

### Task 6: Портфолио из Strapi и перенос работ

**Files:** Create `cms/scripts/import-works.mjs`; Modify `src/lib/strapi-content.ts`, `tests/strapi-content.test.ts`, `src/content.config.ts`, `src/data/portfolio-works.ts`, `src/components/home/OurWorks.astro`, `src/components/portfolio/PortfolioGrid.vue`, `src/components/portfolio/WorkCard.astro`, `src/pages/portfolio/index.astro`, `src/pages/portfolio/[slug].astro`, `src/pages/catalog/decor.astro`, `src/pages/catalog/skrytye-dveri.astro`, `cms/package.json`, `package.json`, `README.md`, `CLAUDE.md`; Delete `scripts/gen-portfolio-thumbs.mjs`, `public/renders/portfolio/`.

**Interfaces:**
- Consumes: `strapiFetchAll`, `strapiImage`, `strapiLoader` (Tasks 4–5).
- Produces: коллекция `works` (данные `PortfolioWork`, `id` = slug); `PortfolioWork.cover: SiteImage`; `toWork(raw: StrapiWork): PortfolioWork`; `npm --prefix cms run import:works`.

- [ ] **Step 1: Тесты преобразования (падают)**

Дописать в `tests/strapi-content.test.ts`:
```ts
import { toWork } from '../src/lib/strapi-content'

const photo = (n: number) => ({ url: `/uploads/w${n}.jpg`, width: 3000, height: 2000, alternativeText: `Фото ${n}`,
  formats: { medium: { url: `/uploads/medium_w${n}.jpg`, width: 960, height: 640 }, xlarge: { url: `/uploads/xlarge_w${n}.jpg`, width: 1920, height: 1280 } } })

test('работа из Strapi → вид сайта', () => {
  const w = toWork({
    documentId: 'd1', slug: '2026-09-28-skrytye-dveri', title: 'Скрытые двери', date: '2026-09-28',
    category: 'Скрытые двери', objectType: 'Квартира', location: 'Москва', description: 'Описание',
    story: 'Абзац 1\n\nАбзац 2', model: null, doorCount: null,
    features: [{ text: 'Заподлицо' }], tags: [], images: [photo(1), photo(2)],
    catalogLink: { section: 'Скрытые двери', label: null },
  })
  assert.equal(w.id, '2026-09-28-skrytye-dveri')
  assert.equal(w.label, '28.09.2026')
  assert.equal(w.category, 'hidden')
  assert.equal(w.objectType, 'apartment')
  assert.deepEqual(w.features, ['Заподлицо'])
  assert.deepEqual(w.images, ['/uploads/xlarge_w1.jpg', '/uploads/xlarge_w2.jpg'])
  assert.equal(w.cover.src, '/uploads/medium_w1.jpg')
  assert.deepEqual(w.relatedLink, { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери в каталоге' })
})

test('работа без ссылки на каталог и без особенностей', () => {
  const w = toWork({ documentId: 'd2', slug: 's', title: 'Т', date: '2026-01-05', category: 'Межкомнатные',
    objectType: 'Офис', description: 'О', images: [photo(3)] })
  assert.equal(w.relatedLink, undefined)
  assert.equal(w.features, undefined)
  assert.equal(w.location, '')
})
```
Run: `npm test` — Expected: FAIL (`toWork` не определён).

- [ ] **Step 2: Тип и преобразование**

`src/data/portfolio-works.ts`: оставить типы, `CATEGORY_LABELS`, `CATEGORY_BADGE_COLORS`, `CATEGORY_TEXT_COLORS`, `OBJECT_TYPE_LABELS`; в `PortfolioWork` добавить `cover: SiteImage` (импорт типа из `../lib/strapi`); удалить массив `PORTFOLIO_WORKS` (данные переедут в Strapi в Step 4); добавить:
```ts
/** Разделы каталога для ссылки под работой — названия как в Strapi
    (поле «Ссылка на каталог → Раздел») */
export const CATALOG_LINKS: Record<string, { href: string; label: string }> = {
  'Межкомнатные двери':       { href: '/catalog/',               label: 'Межкомнатные двери в каталоге' },
  'Скрытые двери':            { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери в каталоге' },
  'Серые и графитовые двери': { href: '/catalog/seryye-dveri/',  label: 'Серые и графитовые двери в каталоге' },
  'Белые двери':              { href: '/catalog/belye-dveri/',   label: 'Белые двери в каталоге' },
  'Перегородки':              { href: '/partitions/',            label: 'Алюминиевые перегородки' },
  'Декор и погонаж':          { href: '/catalog/decor/',         label: 'Декор и погонаж' },
}
```
В `src/lib/strapi-content.ts`:
```ts
import { CATALOG_LINKS, CATEGORY_LABELS, OBJECT_TYPE_LABELS, type PortfolioWork, type WorkCategory, type ObjectType } from '../data/portfolio-works'

export interface StrapiWork {
  documentId: string; slug: string; title: string; date: string
  category: string; objectType: string; location?: string | null
  description: string; story?: string | null; model?: string | null; doorCount?: number | null
  features?: { text: string }[] | null; tags?: { text: string }[] | null
  images: StrapiMedia[]; catalogLink?: { section: string; label?: string | null } | null
}

/** Обратный словарь: подпись в Strapi → ключ сайта */
const keyOf = <K extends string>(labels: Record<K, string>, value: string): K => {
  const key = (Object.keys(labels) as K[]).find((k) => labels[k] === value || k === value)
  if (!key) throw new Error(`Strapi: неизвестное значение «${value}»`)
  return key
}
const list = (items?: { text: string }[] | null) => (items?.length ? items.map((i) => i.text) : undefined)

export function toWork(raw: StrapiWork): PortfolioWork {
  const [y, m, d] = raw.date.split('-')
  const link = raw.catalogLink ? CATALOG_LINKS[raw.catalogLink.section] : undefined
  return {
    id: raw.slug,
    date: raw.date,
    label: `${d}.${m}.${y}`,
    title: raw.title,
    description: raw.description,
    category: keyOf<WorkCategory>(CATEGORY_LABELS, raw.category),
    objectType: keyOf<ObjectType>(OBJECT_TYPE_LABELS, raw.objectType),
    location: raw.location ?? '',
    story: raw.story ?? undefined,
    model: raw.model ?? undefined,
    doorCount: raw.doorCount ?? undefined,
    features: list(raw.features),
    tags: list(raw.tags),
    images: raw.images.map((img) => strapiImage(img, 1920).src),
    cover: strapiImage(raw.images[0]!, 960),
    relatedLink: link && { href: link.href, label: raw.catalogLink?.label || link.label },
  }
}

export const worksLoader = () =>
  strapiLoader('strapi-works', async () =>
    (await strapiFetchAll<StrapiWork>('works', { 'populate[images]': 'true', 'populate[features]': 'true', 'populate[tags]': 'true', 'populate[catalogLink]': 'true', sort: 'date:desc' }))
      .map((raw) => ({ id: raw.slug, data: toWork(raw) })))
```
`OBJECT_TYPE_LABELS` в данных — «Квартира», «Частный дом», «Офис», «Коммерческая недвижимость»; `CATEGORY_LABELS` — «Межкомнатные», «Скрытые двери», «Перегородки» — совпадают со значениями Strapi (Task 3, Step 2).

`src/content.config.ts` — коллекция `works` с `worksLoader()` и zod-схемой полей `PortfolioWork` (`cover: z.object({ src: z.string(), srcset: z.string().optional(), width: z.number().optional(), height: z.number().optional(), alt: z.string() })`, `images: z.array(z.string()).min(1)`, `category: z.enum(['interior','hidden','partitions'])`, `objectType: z.enum(['apartment','house','office','commercial'])`, остальное — как в интерфейсе). `export const collections = { articles, promos, works }`.

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Компоненты и страницы**

Во всех потребителях `PORTFOLIO_WORKS` — `const works = (await getCollection('works')).map((e) => e.data)` (порядок — уже по дате убыв.):
`src/components/home/OurWorks.astro`, `src/pages/portfolio/index.astro`, `src/pages/portfolio/[slug].astro` (getStaticPaths из коллекции), `src/pages/catalog/decor.astro`, `src/pages/catalog/skrytye-dveri.astro`.
Обложки: `/renders/portfolio/${work.id}.webp` → `work.cover.src` + `srcset={work.cover.srcset}` `sizes` по месту (карточка ≈ 22rem → `sizes="(min-width: 62.5rem) 33vw, 100vw"`), в `WorkCard.astro`, `PortfolioGrid.vue` (проп works уже приходит с сервера), `decor.astro`. Ссылки `ProjectSlider` на полные фото — `work.images` (уже xlarge-копии).

- [ ] **Step 4: Перенос трёх работ**

`cms/scripts/import-works.mjs`:
```js
/**
 * Перенос работ портфолио из прежних данных сайта в Strapi (один раз).
 * Фото берутся из public/media проекта и загружаются в медиатеку.
 * Повторный запуск пропускает уже перенесённые (по адресу slug).
 *   npm --prefix cms run import:works
 */
import { createStrapi, compileStrapi } from '@strapi/strapi'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const SITE = path.resolve(process.cwd(), '..')
const CATEGORY = { interior: 'Межкомнатные', hidden: 'Скрытые двери', partitions: 'Перегородки' }
const OBJECT = { apartment: 'Квартира', house: 'Частный дом', office: 'Офис', commercial: 'Коммерческая недвижимость' }
const SECTION = { '/catalog/': 'Межкомнатные двери', '/catalog/skrytye-dveri/': 'Скрытые двери', '/catalog/seryye-dveri/': 'Серые и графитовые двери' }

/* Прежние данные — из git (до удаления массива): node -e выводит JSON */
const WORKS = JSON.parse(await readFile(path.join(process.cwd(), '.tmp/works-export.json'), 'utf8'))

const app = await createStrapi(await compileStrapi()).load()
app.log.level = 'error'
const upload = app.plugin('upload').service('upload')

async function uploadFile(src, alt) {
  const file = path.join(SITE, 'public', decodeURIComponent(src))
  const { size } = await stat(file)
  const [done] = await upload.upload({
    data: { fileInfo: { name: path.basename(file), alternativeText: alt } },
    files: { filepath: file, originalFilename: path.basename(file), mimetype: 'image/webp', size },
  })
  return done.id
}

for (const w of WORKS) {
  const exists = await app.documents('api::work.work').findFirst({ filters: { slug: w.id } })
  if (exists) { console.log(`уже есть: ${w.id}`); continue }
  const images = []
  for (const [i, src] of w.images.entries()) images.push(await uploadFile(src, `${w.title} — фото ${i + 1}`))
  await app.documents('api::work.work').create({
    status: 'published',
    data: {
      title: w.title, slug: w.id, date: w.date, category: CATEGORY[w.category], objectType: OBJECT[w.objectType],
      location: w.location, description: w.description, story: w.story ?? null, model: w.model ?? null,
      doorCount: w.doorCount ?? null, features: (w.features ?? []).map((text) => ({ text })),
      tags: (w.tags ?? []).map((text) => ({ text })), images,
      catalogLink: w.relatedLink ? { section: SECTION[w.relatedLink.href], label: w.relatedLink.label } : null,
    },
  })
  console.log(`перенесено: ${w.id} (${images.length} фото)`)
}
await app.destroy()
```
В `cms/package.json` → scripts: `"import:works": "node scripts/import-works.mjs"`.
Порядок: до удаления массива в Step 2 выгрузить данные:
```bash
git show HEAD:src/data/portfolio-works.ts > /tmp/pw.ts && npx tsx -e "import('/tmp/pw.ts').then(m=>console.log(JSON.stringify(m.PORTFOLIO_WORKS)))" > cms/.tmp/works-export.json
```
Затем при остановленном Strapi: `npm --prefix cms run import:works` — Expected: «перенесено: …» ×3. Повторный запуск — «уже есть» ×3.

- [ ] **Step 5: Проверка**

1. `npm run cms`, `npm run build`; `node scripts/compare-builds.mjs /tmp/vfd-dist-before dist --only=/portfolio/` — Expected: «изменились: 0».
2. Полная сверка: `node scripts/compare-builds.mjs /tmp/vfd-dist-before dist` — отличаются только главная/`akcii`/`promo-archive` (из Task 5).
3. `npm run dev`: `/portfolio/`, работа, главная, `/catalog/skrytye-dveri/` — фото грузятся с `/uploads/…` (через прокси), нет 404 и ошибок консоли (CDP, 390 и 1440 px).
4. В админке поменять заголовок работы → через ≤5 с новый заголовок на `/portfolio/` в dev.

- [ ] **Step 6: Убрать устаревшее и описать**

- Удалить `scripts/gen-portfolio-thumbs.mjs`, `public/renders/portfolio/`, alias `gen:portfolio-thumbs` из `package.json` и строку из README.
- README: раздел «Strapi (контент для директора)» — `npm run cms:install` (первый раз), `npm run cms`, `npm run dev`, адрес админки, где акции и работы, что статьи переедут следующим этапом. В «Где менять контент» — строки «Акции» и «Портфолио» → «Strapi: раздел …».
- CLAUDE.md: абзац про Strapi (`cms/`, загрузчики `src/lib/strapi-content.ts`, `npm test`, ключ и вебхук dev, `/uploads` через прокси в dev и nginx на сервере, ошибки → сборка падает).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(site): портфолио из Strapi, перенос 3 работ; миниатюры — копии Strapi"
```

---

## После плана

- Итоговое сообщение пользователю: как запустить (`npm run cms:install`, `npm run cms`, `npm run dev`), адрес админки, логин разработчика (из `cms/.tmp/admin.txt`), как создать пользователя «Директор» (Настройки → Пользователи → Пригласить, роль «Редактор»).
- План 2 (статьи из блоков) — по тому же документу решений.
