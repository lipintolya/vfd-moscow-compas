# ВФД в ТЦ «Компас» — Москва

Сайт и каталог дверей / алюминиевых перегородок для салона **Владимирской фабрики дверей** в ТЦ «Компас» (Москва, ул. Красная Сосна, 2А, 3 этаж). Построен на кодовой базе челябинского сайта [vfd74.ru](https://vfd74.ru) — та же проверенная архитектура, отдельный бренд-слой, контент и дизайн.

> Статус: в разработке. Домен, контакты и реквизиты салона пока заглушки — см. [«Что заменить до запуска»](#что-заменить-до-запуска).

## О проекте

Витрина + каталог на Supabase с клиентской фильтрацией, отдельные товарные линейки (скрытые двери, алюминиевые перегородки GRAFIA и ОНИКС, декор) на статических данных, статьи со своими markdoc-тегами, портфолио работ салона, калькулятор стоимости комплекта, ссылка на Telegram-канал.

Сайт статически собирается (Astro `output: static`) и деплоится по `git push` на bare-metal VPS — без CI/CD-провайдеров, без Vercel/Netlify.

## Стек

- **[Astro 7](https://astro.build)** — статическая сборка, `getStaticPaths` для каталога и товарных карточек
- **[Vue 3](https://vuejs.org)** — интерактивные острова (фильтры каталога, слайдеры, калькулятор, шапка/футер)
- **[Tailwind CSS v4](https://tailwindcss.com)** — дизайн-токены через `@theme` в CSS, без `tailwind.config.*`
- **[Supabase](https://supabase.com)** (Postgres) — основной каталог дверей, вложенные джойны `model_colors → colors → coatings`
- **[Markdoc](https://markdoc.dev)** — статьи со своими тегами (`figure`/`photo` с просмотром во весь экран, `callout`, `video`, цены из каталога)
- **[Sharp](https://sharp.pixelplumbing.com)** — облегчённые копии фото скриптами `npm run gen:*` (см. «Облегчённые картинки»)

## Архитектура

- **Каталог дверей** — данные приходят из Supabase на сервере при сборке, нормализуются в плоский `CardItem`, дальше вся фильтрация/сортировка/URL-синк — на клиенте в Vue-острове, без серверных round-trip'ов на каждый фильтр.
- **Товарные линейки вне Supabase** (`src/data/*.ts`) — скрытые двери с калькулятором цены, алюминиевые перегородки GRAFIA и ОНИКС (конструктор раскладки, профиля и стекла), декор.
- **SEO как часть архитектуры**, не довесок: `astro-sitemap` с кастомными приоритетами, JSON-LD (`Product`, `BreadcrumbList`, `FAQPage`, `Review`, `LocalBusiness`), единый trailing-slash по всем внутренним ссылкам и canonical-тегам, `robots.txt`/`sitemap.xml` и `/llms.txt` собираются из `site.ts`.
- **Портфолио работ** — статические данные + скрипт (`scripts/gen-portfolio-thumbs.mjs`) генерирует оптимизированные локальные миниатюры из исходных фото с телефона (обычно 90%+ экономии по весу), полноразмер остаётся только на странице самой работы для лайтбокса.
- **Изображения** — все фото сайта лежат в проекте: `public/media/<хранилище>/<путь>` (копии бывших облачных, в коде — `/media/…`), облегчённые версии для страниц — `public/renders/` (скрипты `npm run gen:*`), исходники, которых нет больше нигде, — `assets/`. Фото каталога из Supabase (`photo_url`) сайт при сборке подменяет на копию из `public/media` (`src/lib/media.ts`). В облаке остались только видео.

## Бренд-слой

Всё, что отличает этот сайт от исходного, собрано в нескольких местах — компоненты строк с доменом, контактами и городом не содержат:

| Файл | Что внутри |
|---|---|
| [`src/config/site.ts`](src/config/site.ts) | домен, название, город (падежи), адрес ТЦ и координаты, телефоны, email, соцсети, ID Метрики, флаги разделов `features` |
| [`src/lib/contacts-data.ts`](src/lib/contacts-data.ts) | часы работы, способы оплаты, имя владельца для `/privacy/` (собирается из `site.ts`; реквизиты юрлица не публикуются — владелец физлицо) |
| [`src/lib/local-business-schema.ts`](src/lib/local-business-schema.ts) | единый JSON-LD `Store` для всех страниц |
| [`src/styles/global.css`](src/styles/global.css) | палитра бренда: `accent-*` красный `#FF0020`, `secondary-*` голубой `#1FA0D3`, `slate-*` графит; семантические токены (`ink`, `link`, `graphite`…) |
| `astro.config.mjs` → `SITE_URL` | домен для карты сайта (дубль `site.ts`: Astro-конфиг не импортирует TS); `robots.txt` и `sitemap.xml` собираются из `site.ts` |

## Что заменить до запуска

```bash
grep -rn "PLACEHOLDER\|placeholder\.example" src astro.config.mjs public deploy
```

- домен — `SITE_URL` в `site.ts` и `astro.config.mjs`, `homepage` в `package.json`, `deploy/*`
- телефон, email, Telegram — `site.ts`
- имя владельца для политики конфиденциальности (`ownerName`), часы работы — `contacts-data.ts`
- ID счётчика Яндекс Метрики — `site.ts → analytics`
- фото салона на `/about/` (сейчас временные) — `src/data/about-page.ts` + `npm run gen:about`
- отзывы и портфолио — наполнить `src/data/reviews.ts` / `portfolio-works.ts`, включить `features` в `site.ts` и убрать путь из `SITEMAP_EXCLUDE` в `astro.config.mjs`
- московские цены (сейчас общие с Supabase-каталогом), тариф доставки — `merchantPolicy` в `contacts-data.ts`
- маркетинговые факты, перенесённые из Челябинска и требующие сверки: «60+ моделей в выставочном зале», гарантия 12 мес. на монтаж, бесплатный замер, сроки доставки; акции — сейчас заглушки в `src/data/promos.ts`

## Где менять контент

| Раздел | Тексты и данные | Фото |
|---|---|---|
| Статьи и публикации `/articles/` | `src/content/articles/<slug>.mdoc` — одна статья = один файл | ссылки в статье; облегчённые копии — `node scripts/gen-article-images.mjs` |
| Перегородки GRAFIA `/partitions/` | `src/data/partitions.ts` | `public/media/catalog-vfd/…`; рендеры — `npm run gen:renders` |
| Перегородки ОНИКС ALUM `/partitions/oniks-alum/` | `src/data/oniks-alum.ts` — все тексты страницы; цифры фабрики (высота, ширина, срок, стекло) — один раз в `ONIKS_SPEC` | оригиналы — `assets/oniks-alum/` (инструкция в README там же), облегчённые — `npm run gen:oniks` |
| Скрытые двери `/catalog/skrytye-dveri/` | `src/data/skrytye-dveri-products.ts`, `hidden-doors-page.ts` | `public/media/catalog-vfd/invisible/…` |
| Видео | `src/data/videos.ts`; ролик для статьи — `npm run video:optimize` | ролики — облако; обложки и ролики статей — `public/renders/` |

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

### Фото в проекте

| Что сделать | Как |
|---|---|
| Новое фото для страницы или статьи | положить в `public/media/…` и сослаться как `/media/…` |
| Новая модель или цвет с фото в Supabase | `npm run media:pull` — скачает новые фото каталога в `public/media/`, затем закоммитить |
| Проверить, всё ли на месте | `npm run media:pull -- --check` |

Без `media:pull` сайт всё равно соберётся: для фото, которого нет в проекте, останется облачная ссылка, а сборка напишет «нет копии в проекте».

### Облегчённые картинки

Фото из `public/media/` в полном размере; скрипты делают из них лёгкие `.webp`
в `public/renders/` (а где нужно — файл с размерами в `src/data/`). Запускать
после замены или добавления фото.

| Команда | Что обновляет |
|---|---|
| `npm run gen:articles` | Обложки и фото статей (`node scripts/gen-article-images.mjs`) — после новой статьи или смены фото |
| `npm run gen:oniks` | Фото страницы перегородок ОНИКС из `assets/oniks-alum/` |
| `npm run gen:renders` | Галерея рендеров перегородок GRAFIA |
| `npm run gen:partitions-hero` / `gen:partitions-tracks` / `gen:partitions-swatches` | Первый экран, направляющие и образцы цветов профиля на `/partitions/` |
| `npm run gen:portfolio-thumbs` | Миниатюры портфолио — после новой работы |
| `npm run gen:promo` | Фото акций из `src/data/promos.ts` (печатает строку для `imageSrcset`) |
| `npm run gen:series-covers` | Обложки серий каталога |
| `npm run gen:video-covers` | Обложки роликов |
| `npm run video:optimize -- <ссылка> <файл> [секунда]` | Облегчённый ролик для статьи и кадр-обложка |
| `npm run gen:home` / `gen:home-tiles` | Фото дверей для главной, «В салоне» и статей |
| `npm run gen:designers-hero` | Слайды первого экрана `/designers/` (исходник первого — `assets/designers/`) |
| `npm run gen:hidden-doors-hero` | Первый экран скрытых дверей |
| `npm run gen:about` / `gen:og-about` | Фото «О нас» и картинка для соцсетей |
| `npm run gen:contacts` / `gen:mall` | Фото контактов и ТЦ «Компас» |
| `npm run gen:visit-map` | Карта «Как к нам добраться» — после смены координат салона |

Нет отдельного линтера/тест-раннера — `astro check` для типов, `npm run build` как основной гейт корректности (он же гоняет `getStaticPaths` против живого Supabase-проекта).

## Деплой

`git push production main` → `post-receive` хук на VPS (Beget) выполняет `npm ci && npm run build` и синкает `dist/` в веб-рут nginx через `rsync`. Конфигурация — в [`deploy/`](deploy/).
