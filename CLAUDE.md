# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Site for the ВФД (Владимирская фабрика дверей) door & aluminum-partition showroom in **ТЦ «Компас», Moscow** (ул. Красная Сосна, 2А, 3 этаж). Forked from the Chelyabinsk site `vfd74.ru` (`~/Projects/vfd-door`, github.com/lipintolya/vfd74) — same architecture, separate brand layer, content and design. Astro 6 + Vue 3 islands + Tailwind v4, content and product data primarily in Russian. Statically built; deploy target not set up yet.

**Brand layer — never hardcode these in components:** domain, name, city (with case forms), address/coordinates, phones, email, socials, Metrika ID and section feature flags live in `src/config/site.ts` (`SITE`, `PHONE`). Legal entity/requisites/hours live in `src/lib/contacts-data.ts` (built from `SITE`). LocalBusiness JSON-LD comes from `src/lib/local-business-schema.ts` — don't hand-write it per page. `astro.config.mjs` duplicates the domain as `SITE_URL` (the config can't import TS) — change both plus `public/robots.txt`. Values containing `PLACEHOLDER` / `placeholder.example` are unfilled real data — never invent real-looking replacements, ask the user.

**Reviews / portfolio / hidden-door works** are empty for this salon. `SITE.features.{reviews,portfolio}` gates nav links, home sections, aggregateRating and noindex; `SITEMAP_EXCLUDE` in `astro.config.mjs` must be kept in sync. Never reuse Chelyabinsk objects/reviews as this salon's.

## Commands

```bash
npm run dev       # astro dev — local dev server
npm run build     # astro build — static build into dist/
npm run preview   # preview the production build locally
npm run gen:renders  # regenerate public/renders/alum-covers/*.webp from cloud originals (see scripts/gen-render-gallery.mjs)
npm run deploy    # git push production main — no production remote yet; DO NOT run unless the user explicitly asks
```

There is no test runner or linter configured in this repo. `tsconfig.json` extends `astro/tsconfigs/strict`; rely on `astro check` / editor TS diagnostics for type issues, and `npm run build` as the main correctness gate (it runs `getStaticPaths` against the live Supabase project, so a broken query fails the build).

## Deployment — never run automatically

Deploy scripts in `deploy/` are templates carried over from vfd74 (domain = placeholder): a `post-receive` hook on a VPS checks out `main`, runs `npm ci && npm run build`, then `rsync`'s `dist/` to the nginx web root. There is no `production` remote yet. The GitHub remote is `origin` (github.com/lipintolya/vfd-moscow-compas). **Do not push to the `production` remote or run `npm run deploy` unless the user explicitly asks in that turn.** Default to local build/preview only.

## Architecture

**Rendering model**: Astro pages are server/build-time rendered (mostly static, with `getStaticPaths` for dynamic routes). Interactivity lives in Vue 3 "islands" mounted with explicit `client:*` directives (`client:only="vue"`, `client:load`, `client:visible`, `client:idle`) — pick the directive based on how critical-path the component is (e.g. `Header`/`Footer` use `client:only="vue"` to avoid hydration mismatches; below-the-fold sections use `client:visible`/`client:idle`).

**Data sources** — two distinct patterns, don't mix them up:
1. **Supabase-backed catalog** (`src/lib/supabase.ts`, requires `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY` in env): the main door catalog (`src/pages/catalog.astro`, `src/pages/models/[id].astro`) queries the `model_colors` table with nested joins to `colors → coatings` and `models → series → coatings`. Pages fetch all data server-side at build time, normalize into a flat `CardItem`/`CatalogCardItem` shape (one card per model, first color picked, hex colors normalized for a `С`/`C` Cyrillic-Latin typo seen in the DB), then hand the flat array to a Vue island (`CatalogClient.vue`) which owns all filtering/sorting/pagination/URL-query-sync client-side — there is no server round-trip for filtering.
   - Model pages and the Yandex product feed (`src/pages/feed/yandex.xml.ts` → `/feed/yandex.xml`, YML for Яндекс Товары) share one data source, `src/lib/model-entries.ts`, and one naming/description module, `src/lib/product-text.ts`. Yandex checks feed price/photos against the page, so change prices, photos or names there — never compute them separately in the page or the feed.
2. **Static TypeScript data modules** (`src/data/*.ts`): standalone product lines that aren't in Supabase yet — e.g. `skrytye-dveri-products.ts` (hidden/flush doors — sizes, pricing tiers, `calcCustomPrice`), `partitions.ts` (aluminum partitions), `door-categories.ts` (SEO landing-page content keyed by `slug`, rendered through the generic `DoorCategoryLanding.astro` template), `accessories.ts`, `series-descriptions.ts`. These pages are otherwise fully static/content-driven.

**Images**: large product photography lives on Yandex Cloud storage (`storage.yandexcloud.net/catalog-vfd/...`) and is referenced by URL from the data modules — not bundled. A narrow exception is `public/renders/alum-covers/`, populated by `scripts/gen-render-gallery.mjs`: Astro's remote-image optimizer re-processes remote images on every dev request with no disk cache and mishandles aspect ratio for this particular gallery (see comment at the top of that script), so those renders are pre-resized with `sharp` and committed as local static files instead. Re-run `gen:renders` only if the partitions render count or the cloud originals change. Same pattern for blog images: `node scripts/gen-article-images.mjs` writes `public/renders/articles/{covers,images}/` + `src/data/article-images.ts` (srcset variants for covers and `{% figure/photo/card %}` images, applied via `src/lib/article-images.ts`) — **re-run it after adding an article or changing its images**; without it new images still work, just load the heavy originals.

**SEO infrastructure** is load-bearing, not incidental:
- `BaseLayout.astro` centralizes `<head>` (OG/Twitter meta, canonical, favicons, JSON-LD via `structuredData` prop, font preloads, Yandex Metrika, the ФЗ-152 cookie-consent banner).
- `astro.config.mjs` wires `@astrojs/sitemap` with custom `serialize()`/`filter()` — priority/changefreq rules and `/privacy` exclusion are intentional, keep them when adding routes.
- Landing pages under `/catalog/<slug>` follow the `DoorCategory` data shape in `door-categories.ts` + `DoorCategoryLanding.astro` template; adding a new SEO-targeted category landing page means adding a data object there, not a new bespoke `.astro` file, unless the page needs a real product grid (Supabase-backed) rather than static content.

**Styling**: Tailwind v4 is loaded via `@tailwindcss/vite` (no `tailwind.config.*`); design tokens are declared with `@theme` in `src/styles/global.css` (e.g. `--color-ink`, `--color-body`) and consumed as Tailwind utilities (`text-ink`, `bg-ink`). Page-specific CSS (e.g. `src/styles/partitions.css`) is imported directly by the page that needs it.

**Legal/company data**: `src/lib/contacts-data.ts` holds the legally-required business info (requisites, address, hours, phones — derived from `src/config/site.ts`) used across contacts, footer, and structured data — update once, not per-component. For display use `address.postal` + `address.entrance` (two lines) or `SITE.address.full` (one line); `address.legal` is the legal-entity address for requisites only.
