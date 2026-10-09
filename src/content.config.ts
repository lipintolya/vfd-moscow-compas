import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { ARTICLE_KINDS } from './data/article-kinds'

/* Статья = один файл src/content/articles/<slug>.mdoc; всё остальное —
   карточки на главной и в разделе, разметка для поисковиков, sitemap,
   /llms.txt, связь с каталогом — собирается из этих полей
   (src/lib/articles.ts). Автор — основатель студии из SITE. */
const articles = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/articles' }),
  schema: z.object({
    /** H1 и заголовок карточки */
    title: z.string(),
    /** <title> страницы, если должен отличаться от H1 (по умолчанию —
        «title — бренд в городе»); до ~60 знаков */
    metaTitle: z.string().optional(),
    /** Лид под заголовком и meta description; до ~160 знаков */
    description: z.string(),
    /** «Коротко» — 2–5 пунктов с прямыми ответами в начале статьи. Их
        цитируют быстрые ответы поисковиков и ИИ-ассистенты; они же —
        abstract в разметке и описание в /llms.txt */
    summary: z.array(z.string()).optional(),
    /** Ключевые фразы — keywords в разметке статьи */
    keywords: z.array(z.string()).optional(),
    /** Статья или публикация — см. src/data/article-kinds.ts */
    kind: z.enum(ARTICLE_KINDS).default('article'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    /** Слаги серий каталога (src/data/door-categories.ts / catalog/series/<slug>),
        к которым статья тематически относится — используется на моделях/
        SEO-лендингах этой серии для блока "Статья по теме": перелинковка
        каталог → блог, которой раньше не было (только блог → каталог). */
    relatedSeriesSlugs: z.array(z.string()).optional(),
    /** Покрытия каталога (coatingSlug: emal, emalex, pet, protach, ekoshpon),
        о которых статья: в конце статьи — серии этих покрытий с ценами из
        каталога, а на лендинге покрытия и страницах моделей — ссылка на
        статью. Новые серии подхватываются сами. */
    relatedCoatings: z.array(z.string()).optional(),
    /** Заглушка (PLACEHOLDER): статьи ещё нет — страница закрыта noindex,
        не попадает в sitemap и в блоки «Статья по теме». */
    placeholder: z.boolean().optional(),
  }),
})

export const collections = { articles }
