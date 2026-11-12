/**
 * Облегчённые копии фото каталога для карточки (scripts/gen-catalog-thumbs.mjs):
 * путь выводится из пути исходника, поэтому в данные страницы ничего не
 * добавляется. Фото не из каталога (рендер, заглушка) — как есть.
 */
const CATALOG_MEDIA = /^\/media\/((?:vfd74ru\/catalog|catalog-vfd)\/.+)\.(?:webp|jpe?g|png)$/i

/** Ширины копий — те же, что в генераторе */
export const CATALOG_THUMB_WIDTHS = [280, 400, 560] as const

/** Копия нужной ширины (по умолчанию — наибольшая); не каталог — исходник */
export function catalogThumb(src: string, width: number = CATALOG_THUMB_WIDTHS[CATALOG_THUMB_WIDTHS.length - 1]): string {
  const m = CATALOG_MEDIA.exec(src)
  return m ? `/renders/catalog-thumbs/${m[1]}-${width}.webp` : src
}

/** srcset карточки: 280w, 400w, 560w; для фото не из каталога — пусто */
export function catalogThumbSrcset(src: string): string | undefined {
  if (!CATALOG_MEDIA.test(src)) return undefined
  return CATALOG_THUMB_WIDTHS.map((w) => `${catalogThumb(src, w)} ${w}w`).join(', ')
}
