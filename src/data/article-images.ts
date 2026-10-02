/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {

}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {

}
