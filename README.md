# ВФД в ТЦ «Компас» — Москва

Сайт и каталог дверей / алюминиевых перегородок для салона **Владимирской фабрики дверей** в ТЦ «Компас» (Москва, ул. Красная Сосна, 2А, 3 этаж). Построен на кодовой базе челябинского сайта [vfd74.ru](https://vfd74.ru) — та же проверенная архитектура, отдельный бренд-слой, контент и дизайн.

> Статус: в разработке. Домен, контакты и реквизиты салона пока заглушки — см. [«Что заменить до запуска»](#что-заменить-до-запуска).

## О проекте

Витрина + каталог на Supabase с клиентской фильтрацией, отдельные товарные линейки (скрытые двери, алюминиевые перегородки) на статических данных, блог со своими markdoc-компонентами, портфолио реализованных монтажей (включается флагом), калькулятор стоимости комплекта, интеграция с Telegram/VK/MAX для лидов.

Сайт статически собирается (Astro `output: static`) и деплоится по `git push` на bare-metal VPS — без CI/CD-провайдеров, без Vercel/Netlify.

## Стек

- **[Astro 6](https://astro.build)** — статическая сборка, `getStaticPaths` для каталога и товарных карточек
- **[Vue 3](https://vuejs.org)** — интерактивные острова (фильтры каталога, слайдеры, калькулятор, шапка/футер)
- **[Tailwind CSS v4](https://tailwindcss.com)** — дизайн-токены через `@theme` в CSS, без `tailwind.config.*`
- **[Supabase](https://supabase.com)** (Postgres) — основной каталог дверей, вложенные джойны `model_colors → colors → coatings`
- **[Markdoc](https://markdoc.dev)** — блог со своими тегами (`figure` с лайтбоксом, `callout`, сетка карточек, слайдер кейсов)
- **[Sharp](https://sharp.pixelplumbing.com)** — препроцессинг изображений на этапе сборки (миниатюры портфолио, рендеры перегородок)

## Архитектура

- **Каталог дверей** — данные приходят из Supabase на сервере при сборке, нормализуются в плоский `CardItem`, дальше вся фильтрация/сортировка/URL-синк — на клиенте в Vue-острове, без серверных round-trip'ов на каждый фильтр.
- **Товарные линейки вне Supabase** (`src/data/*.ts`) — скрытые двери с калькулятором цены, алюминиевые перегородки (конфигуратор направляющих/остекления/цвета/декора), входные двери, декор.
- **SEO как часть архитектуры**, не довесок: `astro-sitemap` с кастомными приоритетами, JSON-LD (`Product`, `BreadcrumbList`, `FAQPage`, `Review`, `LocalBusiness`), единый trailing-slash по всем внутренним ссылкам и canonical-тегам, `robots.txt`/`sitemap.xml`.
- **Портфолио работ** — статические данные + скрипт (`scripts/gen-portfolio-thumbs.mjs`) генерирует оптимизированные локальные миниатюры из исходных фото с телефона (обычно 90%+ экономии по весу), полноразмер остаётся только на странице самой работы для лайтбокса.
- **Изображения** — крупная товарная фотография хранится в Yandex Object Storage и подключается по URL, не бандлится; узкий набор «тяжёлых» галерей пересобирается локально через Sharp при сборке.

## Бренд-слой

Всё, что отличает этот сайт от исходного, собрано в нескольких местах — компоненты строк с доменом, контактами и городом не содержат:

| Файл | Что внутри |
|---|---|
| [`src/config/site.ts`](src/config/site.ts) | домен, название, город (падежи), адрес ТЦ и координаты, телефоны, email, соцсети, ID Метрики, флаги разделов `features` |
| [`src/lib/contacts-data.ts`](src/lib/contacts-data.ts) | юрлицо, реквизиты, часы работы (собирается из `site.ts`) |
| [`src/lib/local-business-schema.ts`](src/lib/local-business-schema.ts) | единый JSON-LD `Store` для всех страниц |
| [`src/styles/global.css`](src/styles/global.css) | палитра бренда: `accent-*` красный `#FF0020`, `secondary-*` голубой `#1FA0D3`, `slate-*` графит; семантические токены (`ink`, `link`, `graphite`…) |
| `astro.config.mjs` → `SITE_URL`, `public/robots.txt` | домен для sitemap/robots (дубль `site.ts`, Astro-конфиг не импортирует TS) |

## Что заменить до запуска

```bash
grep -rn "PLACEHOLDER\|placeholder\.example" src astro.config.mjs public deploy
```

- домен — `SITE_URL` в `site.ts`, `astro.config.mjs`, `public/robots.txt`, `public/sitemap.xml`, `deploy/*`
- телефон, email, Telegram/VK/MAX — `site.ts`
- юрлицо, ИНН, ОГРН(ИП), юрадрес, часы работы — `contacts-data.ts`
- ID счётчика Яндекс Метрики — `site.ts → analytics`
- фото салона на `/about/` (сейчас временные) — `src/components/about/about-data.ts` + `scripts/gen-about-images.mjs`
- отзывы и портфолио — наполнить `src/data/reviews.ts` / `portfolio-works.ts`, включить `features` в `site.ts` и убрать путь из `SITEMAP_EXCLUDE` в `astro.config.mjs`
- московские цены (сейчас общие с Supabase-каталогом), тариф доставки — `merchantPolicy` в `contacts-data.ts`
- маркетинговые факты, перенесённые из Челябинска и требующие сверки: «60+ моделей в выставочном зале», гарантия 12 мес. на монтаж, бесплатный замер, сроки доставки, акции (`src/data/promos.ts`)

## Запуск локально

```bash
npm install
cp .env.example .env   # заполнить PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Локальный дев-сервер |
| `npm run build` | Продакшен-сборка в `dist/` |
| `npm run preview` | Превью собранного `dist/` |
| `npm run gen:renders` | Перегенерировать рендеры перегородок из облачных оригиналов |
| `npm run gen:portfolio-thumbs` | Перегенерировать миниатюры портфолио после добавления новой работы |

Нет отдельного линтера/тест-раннера — `astro check` для типов, `npm run build` как основной гейт корректности (он же гоняет `getStaticPaths` против живого Supabase-проекта).

## Деплой

`git push production main` → `post-receive` хук на VPS (Beget) выполняет `npm ci && npm run build` и синкает `dist/` в веб-рут nginx через `rsync`. Конфигурация — в [`deploy/`](deploy/).
