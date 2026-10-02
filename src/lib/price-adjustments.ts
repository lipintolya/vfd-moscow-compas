/**
 * src/lib/price-adjustments.ts
 *
 * Повышение отпускных цен фабрики с 03.08.2026 (уведомление «Владимирской
 * фабрики дверей») — применяется поверх price_rrp из Supabase на лету,
 * без изменения самих строк в БД. Коэффициент — на серию (series.slug).
 *
 * Почему не через SQL: цена в Supabase — это «цена до повышения», сайт
 * показывает её домноженной. Такое решение принято намеренно (сайтом
 * занимается один человек, риск разойтись с БД в отчётах/выгрузках несёт
 * сам), поэтому регулярные повышения правятся здесь, а не через
 * SQL Editor на каждое изменение.
 *
 * Урбан явно ИСКЛЮЧЁН — фабрика прислала отдельное уведомление: цены на
 * Урбан остаются прежними, несмотря на то что он щитовой (как Бэйсик/Смарт).
 */
export const PRICE_MULTIPLIER: Record<string, number> = {
  // +5% — эмалекс
  emalex:          1.05,
  'emalex-modern':  1.05,
  elegant:          1.05,
  basic:            1.05,
  // +5% — протач
  smart:            1.05,
  // +5% — ПЭТ
  innova:           1.05,
  // +5% — эмаль
  linea:            1.05,
  'antique-luxe':   1.05,
  premium:          1.05,
  stockholm:        1.05,
  winter:           1.05,
  skinel:           1.05,
  'classic-luxe':   1.05,
  sektor:           1.05,
  // urban — исключён намеренно, цены прежние (отдельное уведомление фабрики)
  // urban-pet — не упомянут в уведомлении, не трогаем
}

/** Применяет повышение к цене полотна из Supabase. price=null проходит без изменений. */
export function adjustPrice(seriesSlug: string, price: number | null): number | null {
  if (price == null) return price
  const mult = PRICE_MULTIPLIER[seriesSlug]
  return mult ? Math.round(price * mult) : price
}
