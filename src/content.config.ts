import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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
  }),
})

export const collections = { articles }
