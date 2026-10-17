/**
 * src/lib/made-to-order.ts
 *
 * Серии, которых нет на складе постоянно — доступны только под заказ.
 * Бейдж «Под заказ» на карточке каталога и странице товара.
 *
 * Добавлять/убирать вручную, когда серия появляется/уходит со склада.
 */
export const MADE_TO_ORDER_SERIES: ReadonlySet<string> = new Set([
  'next',
  'smart',
  'urban-drevesnyy',
  'tehno',
])

/** Точечное исключение: конкретная модель+цвет реально в наличии на складе,
    хотя остальные модели/цвета серии — под заказ (MADE_TO_ORDER_SERIES бьёт
    только по серии целиком). Ключ — `${models.id}:${colors.name}`. */
export const IN_STOCK_OVERRIDE: ReadonlySet<string> = new Set([
  '4fc7a08a-9216-4b29-a6d4-3473517e897c:Эмалекс белый',   // Техно 1, белый — в наличии
  '7434f55c-b2a8-4f12-b0c6-56c7c57888eb:Эмалекс бежевый', // Урбан Штрих 2А, бежевый, чёрный молдинг — в наличии
])

/** Конкретная модель+цвет из IN_STOCK_OVERRIDE — есть на складе: плашка
    «В наличии» на карточке каталога и в пикере цвета на странице модели. */
export const isInStock = (modelId: string, colorName: string): boolean =>
  IN_STOCK_OVERRIDE.has(`${modelId}:${colorName}`)

export const isMadeToOrder = (seriesSlug: string, modelId?: string, colorName?: string): boolean => {
  if (modelId && colorName && IN_STOCK_OVERRIDE.has(`${modelId}:${colorName}`)) return false
  return MADE_TO_ORDER_SERIES.has(seriesSlug)
}

/** Цвет из IN_STOCK_OVERRIDE — первым в списке (свотчи/пикер): логично
    показать сразу то, что реально на складе, а не то, что первым пришло
    из Supabase. Остальной порядок не трогает (стабильно). */
export function withInStockFirst<T extends { name: string }>(modelId: string, colors: T[]): T[] {
  const idx = colors.findIndex(c => IN_STOCK_OVERRIDE.has(`${modelId}:${c.name}`))
  if (idx <= 0) return colors
  return [colors[idx]!, ...colors.slice(0, idx), ...colors.slice(idx + 1)]
}

/** Статус модели в выбранном цвете — одно слово на карточке каталога:
    наличие важнее новизны, «Под заказ» — только у серий под заказ */
export type ModelStatus = 'stock' | 'new' | 'order'

export const MODEL_STATUS_LABEL: Record<ModelStatus, string> = {
  stock: 'В наличии',
  new:   'Новинка',
  order: 'Под заказ',
}

export function modelStatus(model: { id: string; seriesSlug: string; isNew: boolean }, colorName: string): ModelStatus | null {
  if (isInStock(model.id, colorName)) return 'stock'
  if (model.isNew) return 'new'
  return isMadeToOrder(model.seriesSlug, model.id, colorName) ? 'order' : null
}
