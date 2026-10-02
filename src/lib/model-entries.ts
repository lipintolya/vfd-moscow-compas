/**
 * src/lib/model-entries.ts
 *
 * Модели каталога (Supabase) в форме страницы товара: одна запись на модель,
 * цвета только с фото, цена с повышением фабрики, читаемый слаг.
 *
 * Общий источник для /models/[id].astro и товарного фида /feed/yandex.xml —
 * Яндекс сверяет цену и фото в фиде с тем, что видит на странице, поэтому
 * считать их в двух местах по отдельности нельзя: разойдутся при первой же
 * правке и товары снимут с показа.
 */
import { supabase } from './supabase'
import { buildModelSlugMap } from './slugify'
import { getColorsByCoatingSlug } from './catalog-data'
import { adjustPrice } from './price-adjustments'
import { isNewModel } from './new-models'
import { withInStockFirst } from './made-to-order'

/** Структурно совпадает с ColorVariant из ProductColorPicker.vue. */
export interface ModelColor {
  id:          string
  name:        string
  hex:         string
  photo:       string
  price:       number | null
  coatingSlug: string
}

export interface ModelEntry {
  model:       { id: string; name: string; hasGlass: boolean; trim: string | null; isNew: boolean }
  slug:        string
  seriesName:  string
  seriesSlug:  string
  coatingName: string
  coatingSlug: string
  colors:      ModelColor[]
  /** Мин./макс. цена полотна по всем цветам модели (включая цвета без фото). */
  minPrice:    number | null
  maxPrice:    number | null
  extraColors: { name: string; hex: string }[]
}

const normalizeHex = (v: string | null | undefined) => {
  const s = (v ?? '').trim().replaceAll('С', 'C').replaceAll('с', 'c')
  return /^#[0-9a-fA-F]{3,6}$/.test(s) ? s : '#cccccc'
}

async function loadModelEntries(): Promise<ModelEntry[]> {
  const { data, error } = await supabase
    .from('model_colors')
    .select(`
      price_rrp,
      photo_url,
      model_id,
      color_id,
      colors ( id, name, hex_preview, coatings ( id, name, slug ) ),
      models ( id, name, has_glass, trim, series ( id, name, slug, coatings ( id, name, slug ) ) )
    `)
    .order('price_rrp', { ascending: true })

  if (error || !data) {
    console.error('getModelEntries error:', error?.message)
    return []
  }

  const modelMap = new Map<string, ModelEntry>()

  for (const row of data) {
    const model  = row.models  as any
    const color  = row.colors  as any
    if (!model || !color) continue

    const series        = model.series   as any
    const seriesCoating = series?.coatings as any
    const colorCoating  = color.coatings  as any
    const coating       = seriesCoating ?? colorCoating

    if (!modelMap.has(model.id)) {
      modelMap.set(model.id, {
        model: {
          id:       model.id,
          name:     model.name,
          hasGlass: model.has_glass ?? false,
          trim:     model.trim ?? null,
          isNew:    isNewModel(model.id),
        },
        slug:        '',
        seriesName:  series?.name     ?? '',
        seriesSlug:  series?.slug     ?? '',
        coatingName: coating?.name    ?? '',
        coatingSlug: coating?.slug    ?? '',
        colors:      [],
        minPrice:    null,
        maxPrice:    null,
        extraColors: [],
      })
    }

    const entry = modelMap.get(model.id)!

    const adjustedPrice = adjustPrice(series?.slug ?? '', row.price_rrp ?? null)

    if (!entry.colors.some(c => c.id === color.id)) {
      entry.colors.push({
        id:          color.id,
        name:        color.name,
        hex:         normalizeHex(color.hex_preview),
        photo:       row.photo_url  ?? '',
        price:       adjustedPrice,
        coatingSlug: coating?.slug  ?? '',
      })
    }

    if (adjustedPrice && (!entry.minPrice || adjustedPrice < entry.minPrice)) {
      entry.minPrice = adjustedPrice
    }
    if (adjustedPrice && (!entry.maxPrice || adjustedPrice > entry.maxPrice)) {
      entry.maxPrice = adjustedPrice
    }
  }

  /* Показываем только реально сфотканные цвета — свотч без фото сбивает
     покупателя с толку (выглядит как рабочий вариант, а на деле «по запросу»). */
  for (const entry of modelMap.values()) {
    entry.colors = entry.colors.filter(c => Boolean(c.photo))
  }

  /* Цвет из IN_STOCK_OVERRIDE — первым в пикере (по умолчанию выбран при
     открытии страницы): логично открывать сразу тем, что есть на складе. */
  for (const entry of modelMap.values()) {
    entry.colors = withInStockFirst(entry.model.id, entry.colors)
  }

  /* «Также доступны цвета» — полная палитра покрытия за вычетом уже
     сфотканных у этой модели, справочным текстом (не свотчем/кнопкой —
     см. ProductColorPicker.vue), чтобы не выглядело кликабельным вариантом. */
  const paletteByCoating = new Map<string, { name: string; hex: string }[]>()
  for (const entry of modelMap.values()) {
    if (!entry.coatingSlug) continue
    // Ключ кэша включает серию — цвет, эксклюзивный для одной серии
    // покрытия, не должен утекать в «также доступны» у других серий
    // (см. фильтр по seriesSlugs.size===1 в getColorsByCoatingSlug).
    const cacheKey = `${entry.coatingSlug}::${entry.seriesSlug}`
    if (!paletteByCoating.has(cacheKey)) {
      paletteByCoating.set(cacheKey, await getColorsByCoatingSlug(entry.coatingSlug, entry.seriesSlug))
    }
    const palette = paletteByCoating.get(cacheKey)!
    const ownNames = new Set(entry.colors.map(c => c.name))
    entry.extraColors = palette.filter(c => !ownNames.has(c.name))
  }

  /* ── Читаемые слаги вместо UUID: имя модели + серия, с защитой от коллизий ── */
  const slugMap = buildModelSlugMap(
    [...modelMap.values()].map(entry => ({
      id:         entry.model.id,
      name:       entry.model.name,
      seriesSlug: entry.seriesSlug,
    })),
  )
  for (const entry of modelMap.values()) {
    entry.slug = slugMap.get(entry.model.id)!
  }

  return [...modelMap.values()]
}

/* Один запрос на сборку: страница товара и фид берут одни и те же данные
   (и не дёргают Supabase дважды, если сборка переиспользует модуль). */
let cached: Promise<ModelEntry[]> | null = null

export function getModelEntries(): Promise<ModelEntry[]> {
  cached ??= loadModelEntries()
  return cached
}
