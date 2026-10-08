/**
 * src/lib/catalog-data.ts
 * Единый источник карточек каталога (модель+цвет из Supabase, нормализованные
 * в CatalogCardItem) — используется /catalog и страницами серий, чтобы не
 * дублировать JOIN и нормализацию цветов в каждом месте.
 */
import { supabase } from './supabase'
import { buildModelSlugMap } from './slugify'
import { getSeriesSpec } from '../data/series-descriptions'
import { SERIES_COVER_PREVIEWS, SERIES_COVER_THUMBS } from '../data/series-cover-previews'
import { adjustPrice } from './price-adjustments'
import { isNewModel } from './new-models'
import { isPopularSeries } from './popular-series'
import { describeTrim } from './trim-labels'

/* Подпись под названием в карточке: «Кромка серебро» / «Стекло сатин белый»
   (серия Некст хранит в models.trim остекление, не кромку — см. describeTrim). */
const trimCaption = (trim: string | null | undefined): string => {
  const phrase = describeTrim(trim)?.phrase ?? ''
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}
import { withInStockFirst } from './made-to-order'
import type { CatalogCardItem } from '../components/catalog/types'

const normalizeHexColor = (value: string | null | undefined) => {
  const normalized = (value ?? '')
    .trim()
    .replaceAll('С', 'C')
    .replaceAll('с', 'c')

  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(normalized)
    ? normalized
    : '#cccccc'
}

/* Запрос к Supabase — один на сборку: каталог нужен главной, /catalog/,
   сериям, посадочным и статьям, а данные за время сборки не меняются.
   В режиме разработки кеша нет — правки в базе видны сразу.

   Ошибка запроса роняет сборку: иначе на сайт молча уехал бы пустой
   каталог без страниц серий и моделей (getStaticPaths вернул бы пусто). */
let catalogCards: Promise<{ cards: CatalogCardItem[] }> | null = null

export function getCatalogCards(): Promise<{ cards: CatalogCardItem[] }> {
  if (import.meta.env.DEV) return loadCatalogCards()
  return (catalogCards ??= loadCatalogCards())
}

async function loadCatalogCards(): Promise<{ cards: CatalogCardItem[] }> {
  const { data, error } = await supabase
    .from('model_colors')
    .select(`
      price_rrp,
      photo_url,
      colors (
        id,
        name,
        hex_preview,
        coating_id,
        coatings ( id, name, slug )
      ),
      models (
        id,
        name,
        has_glass,
        trim,
        series (
          id,
          name,
          slug,
          coating_id,
          coatings ( id, name, slug )
        )
      )
    `)
    .order('price_rrp', { ascending: true })

  if (error) throw new Error(`Каталог не загрузился из Supabase (model_colors): ${error.message}`)

  /* ── Полный набор цветов на модель (по всем строкам, не только первой) —
     нужен для корректной фильтрации: модель может подходить под фильтр
     «цвет X», даже если её карточка показывает другой цвет как основной.
     Свотчи (name+hex) — та же карта, чтобы на карточке в каталоге сразу было
     видно все доступные цвета, а не только тот, что выбран для обложки. ── */
  const colorsByModel = new Map<string, string[]>()
  const colorSwatchesByModel = new Map<string, { name: string; hex: string; price: number | null; photo: string; available: boolean }[]>()
  for (const row of (data ?? [])) {
    const model = row.models as any
    const color = row.colors as any
    if (!model || !color?.name) continue
    const seriesSlug = model?.series?.slug ?? ''
    const list = colorsByModel.get(model.id) ?? []
    if (!list.includes(color.name)) list.push(color.name)
    colorsByModel.set(model.id, list)

    const swatches = colorSwatchesByModel.get(model.id) ?? []
    if (row.photo_url && !swatches.some(s => s.name === color.name)) {
      swatches.push({
        name:      color.name,
        hex:       normalizeHexColor(color.hex_preview),
        price:     adjustPrice(seriesSlug, row.price_rrp ?? null),
        photo:     row.photo_url,
        available: true,
      })
    }
    colorSwatchesByModel.set(model.id, swatches)
  }
  for (const [modelId, swatches] of colorSwatchesByModel) {
    colorSwatchesByModel.set(modelId, withInStockFirst(modelId, swatches))
  }

  /* ── Нормализуем: 1 модель = 1 карточка (первый цвет — для витрины) ── */
  const cards: CatalogCardItem[] = []
  const seen = new Set<string>()

  for (const row of (data ?? [])) {
    const model   = row.models as any
    const color   = row.colors as any
    if (!model || !color) continue
    if (seen.has(model.id)) continue
    seen.add(model.id)

    const series  = model?.series  as any
    const coating = series?.coatings ?? color?.coatings as any
    const seriesSlug = series?.slug ?? ''

    /* Обложка карточки — первый свотч из (уже переставленного withInStockFirst)
       списка, а не просто первая встреченная строка из Supabase: иначе цвет
       "в наличии" был бы первым в пикере, но карточка каталога всё равно
       открывалась бы другим цветом-обложкой. */
    const swatches = colorSwatchesByModel.get(model.id)
    const cover = swatches?.[0]

    cards.push({
      id:          model.id,
      slug:        '',
      name:        model.name,
      series:      series?.name   ?? '—',
      seriesSlug,
      coating:     coating?.name  ?? '—',
      coatingSlug: coating?.slug  ?? '',
      colorName:   cover?.name ?? color.name,
      colorHex:    cover?.hex  ?? normalizeHexColor(color.hex_preview),
      trim:        trimCaption(model.trim),
      colorNames:  colorsByModel.get(model.id) ?? [color.name],
      colorSwatches: swatches ?? [{ name: color.name, hex: normalizeHexColor(color.hex_preview), price: adjustPrice(seriesSlug, row.price_rrp ?? null), photo: row.photo_url ?? '', available: Boolean(row.photo_url) }],
      photo:       cover?.photo ?? row.photo_url ?? '',
      price:       cover?.price ?? adjustPrice(seriesSlug, row.price_rrp ?? null),
      hasGlass:    model.has_glass ?? false,
      isNew:       isNewModel(model.id),
      isPopular:   isPopularSeries(seriesSlug),
    })
  }

  /* ── Читаемые слаги вместо UUID — та же функция, что и в /models/[id].astro,
     иначе ссылки карточек разойдутся с реально сгенерированными маршрутами ── */
  const slugMap = buildModelSlugMap(cards.map(c => ({ id: c.id, name: c.name, seriesSlug: c.seriesSlug })))
  for (const card of cards) {
    card.slug = slugMap.get(card.id)!
  }

  return { cards }
}

export interface SeriesListItem {
  slug:        string
  name:        string
  coatingSlug: string
  coatingName: string
  modelCount:  number
  minPrice:    number | null
}

/** Группирует уже загруженные карточки по сериям — без второго запроса к Supabase. */
export function getSeriesList(cards: CatalogCardItem[]): SeriesListItem[] {
  const bySlug = new Map<string, SeriesListItem>()

  for (const card of cards) {
    if (!card.seriesSlug) continue
    const existing = bySlug.get(card.seriesSlug)
    if (existing) {
      existing.modelCount++
      if (card.price != null && (existing.minPrice == null || card.price < existing.minPrice)) {
        existing.minPrice = card.price
      }
      continue
    }
    bySlug.set(card.seriesSlug, {
      slug:        card.seriesSlug,
      name:        card.series,
      coatingSlug: card.coatingSlug,
      coatingName: card.coating,
      modelCount:  1,
      minPrice:    card.price,
    })
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

/** Карточки одной серии, отсортированные по цене — для страницы серии. */
export function getSeriesCards(cards: CatalogCardItem[], seriesSlug: string): CatalogCardItem[] {
  return cards
    .filter(c => c.seriesSlug === seriesSlug)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
}

export interface SeriesCardData extends SeriesListItem {
  tagline: string
  /** Обложка — heroImage из SeriesSpec, либо фото первой (по цене) модели серии. */
  cover: string
  /** Миниатюра 160×200 той же обложки (строки списка серий на мобильном,
      аватарки панелей) — или сама обложка, если миниатюры нет. */
  thumb: string
}

/** Данные для карточки серии (хаб /catalog/series, полоса серий на /catalog) —
    та же форма в обоих местах, чтобы не расходились при правках. */
/** Лёгкое локальное превью обложки (scripts/gen-series-covers.mjs), если есть;
    иначе оригинальный URL. Большой hero на странице серии берёт heroImage
    напрямую и сюда не ходит. */
function previewCover(url: string | undefined): string | undefined {
  return url ? (SERIES_COVER_PREVIEWS[url] ?? url) : undefined
}

export function getSeriesCardsData(cards: CatalogCardItem[]): SeriesCardData[] {
  return getSeriesList(cards).map(series => {
    const spec = getSeriesSpec(series.slug, series.coatingSlug)
    const seriesCards = getSeriesCards(cards, series.slug)
    const original = spec.previewImage || spec.heroImage
    const cover = previewCover(original) || seriesCards[0]?.photo || ''
    return {
      ...series,
      tagline: spec.tagline,
      cover,
      thumb:   (original && SERIES_COVER_THUMBS[original]) || cover,
    }
  })
}

/** Полная палитра цветов покрытия (не только сфотканные под конкретную
    модель) — для информационного блока «Доступные цвета» на странице серии
    и модели. Фабрика делает двери во всех цветах покрытия, фото под каждую
    модель присылает не сразу — это просто справочный список названий, без
    привязки к конкретному товару/фото.

    Цвет, который реально используется только ОДНОЙ серией этого покрытия
    (напр. эксклюзивная палитра Техно — тёмно-бежевый/голубой/зелёный),
    не показываем в палитре ДРУГИХ серий — там его на самом деле нельзя
    заказать. Правило выведено из реальных данных (сколько разных серий
    ссылаются на цвет через model_colors), а не захардкожено по названию —
    само разрулится для любых будущих эксклюзивов. Цвет без единой
    привязки к модели (ещё не запущен ни в одной серии) не исключается —
    это справочный «скоро будет», а не чей-то эксклюзив. */
/* Справочник цветов — тоже один запрос на сборку (страниц серий много),
   ошибка роняет сборку, а не оставляет серии без палитры молча */
let colorRows: Promise<any[]> | null = null
function getColorRows(): Promise<any[]> {
  const load = async () => {
    const { data, error } = await supabase
      .from('colors')
      .select('name, hex_preview, coatings ( slug ), model_colors ( models ( series ( slug ) ) )')
    if (error) throw new Error(`Цвета не загрузились из Supabase (colors): ${error.message}`)
    return data ?? []
  }
  if (import.meta.env.DEV) return load()
  return (colorRows ??= load())
}

export async function getColorsByCoatingSlug(
  coatingSlug: string,
  currentSeriesSlug?: string,
): Promise<{ name: string; hex: string }[]> {
  if (!coatingSlug) return []

  const data = await getColorRows()
  const seen = new Set<string>()
  const result: { name: string; hex: string }[] = []
  for (const row of data) {
    if ((row.coatings as any)?.slug !== coatingSlug || !row.name) continue
    if (seen.has(row.name)) continue

    const modelColors = (row.model_colors as any[]) ?? []
    const seriesSlugs = new Set(
      modelColors.map(mc => mc.models?.series?.slug).filter(Boolean),
    )
    if (seriesSlugs.size === 1 && !seriesSlugs.has(currentSeriesSlug)) continue

    seen.add(row.name)
    result.push({ name: row.name, hex: normalizeHexColor(row.hex_preview) })
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}
