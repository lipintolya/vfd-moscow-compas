import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { ARTICLE_KINDS } from './data/article-kinds'

const articles = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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
    /** Заглушка (PLACEHOLDER): статьи ещё нет — страница закрыта noindex,
        не попадает в sitemap и в блоки «Статья по теме». */
    placeholder: z.boolean().optional(),
  }),
})

export const collections = { articles }
