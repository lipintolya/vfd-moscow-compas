/**
 * src/lib/article-images.ts
 *
 * Атрибуты <img> для картинок статей: облегчённые варианты из
 * scripts/gen-article-images.mjs через srcset — телефон берёт маленький
 * файл, десктоп побольше. URL, которого нет в карте (скрипт не
 * перезапускали после новой статьи), отдаётся оригиналом — работает,
 * просто тяжелее.
 */
import { ARTICLE_COVER_PREVIEWS, ARTICLE_IMAGE_VARIANTS } from '../data/article-images'
import type { ImageVariant } from '../data/article-images'

type ImgAttrs = { src: string; srcset?: string }

const toAttrs = (original: string, variants: ImageVariant[] | undefined): ImgAttrs =>
  variants?.length
    ? { src: variants[variants.length - 1]!.src, srcset: variants.map(v => `${v.src} ${v.w}w`).join(', ') }
    : { src: original }

/** Обложка: card — кроп 16:9 для карточек, hero — шапка статьи. */
export const articleCoverImg = (cover: string, kind: 'card' | 'hero'): ImgAttrs =>
  toAttrs(cover, ARTICLE_COVER_PREVIEWS[cover]?.[kind])

/** Фото из текста статьи ({% figure %}, {% photo %}, {% card %}). */
export const articleImg = (url: string): ImgAttrs =>
  toAttrs(url, ARTICLE_IMAGE_VARIANTS[url])
