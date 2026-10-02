export interface CatalogCardItem {
  id: string
  slug: string
  name: string
  series: string
  seriesSlug: string
  coating: string
  coatingSlug: string
  colorName: string
  colorHex: string
  /** Готовая подпись кромки/остекления («Кромка серебро», «Стекло сатин белый»)
      из Supabase models.trim — различает SKU с одинаковым названием, но разной
      кромкой (см. describeTrim в lib/trim-labels).
      Пустая строка — либо не задано, либо значение битое ("true" в БД). */
  trim: string
  /** Все цвета, в которых реально доступна эта модель — для корректной фильтрации по цвету */
  colorNames: string[]
  /** Те же цвета с hex/ценой/фото — рядок свотчей на карточке переключает
      обложку и цену прямо в каталоге, без захода в товар. available:false —
      цвет заведён у покрытия серии, но фото под эту конкретную модель фабрика
      ещё не прислала: свотч всё равно показываем (кликабельный, с hex), но
      без цены/фото — иначе выглядит так, будто модель в этом цвете не
      существует, хотя на деле просто нет фото. Такие цвета НЕ участвуют в
      фильтре каталога (см. colorNames/allColors) — иначе фильтр по ним давал
      бы пустую выдачу. */
  colorSwatches: { name: string; hex: string; price: number | null; photo: string; available: boolean }[]
  photo: string
  price: number | null
  hasGlass: boolean
  /** Бейдж "Новинка" — см. src/lib/new-models.ts */
  isNew: boolean
  /** Бейдж "Выбор покупателей" — см. src/lib/popular-series.ts */
  isPopular: boolean
}

export interface CatalogFilterOption {
  label: string
  value: string
  color?: string
  count?: number
}

export type CatalogSort = 'popular' | 'price_asc' | 'price_desc' | 'name'
