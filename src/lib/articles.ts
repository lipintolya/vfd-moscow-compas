/* Статьи — один источник для всех мест, где они выводятся: главная
   (LatestArticles), раздел /articles/, страница статьи, «статья по теме»
   на лендингах покрытий и страницах моделей, /llms.txt.

   Заглушки (placeholder: true) наружу не выходят: их нет в списках,
   «по теме», sitemap и /llms.txt; сама страница заглушки закрыта noindex. */
import { getCollection, type CollectionEntry } from 'astro:content'
import { SITE } from '../config/site'
import { FOUNDER } from '../data/about-page'

export type Article = CollectionEntry<'articles'>

let published: Promise<Article[]> | undefined

/** Опубликованные статьи, свежие сверху (на сборку — один запрос) */
export function getArticles(): Promise<Article[]> {
  if (!published || import.meta.env.DEV) {
    published = getCollection('articles', (a) => !a.data.placeholder).then((list) =>
      list.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()),
    )
  }
  return published
}

export const articleHref = (id: string) => `/articles/${id}/`

export const formatArticleDate = (d: Date) =>
  d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

/* Слова текста без разметки Markdoc ({% … %}) и служебных символов */
export function articleWordCount(body = ''): number {
  return body
    .replace(/\{%[\s\S]*?%\}/g, ' ')
    .replace(/[#*_>|`\[\]()-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

/** Время чтения, мин — ~180 слов в минуту для русского текста */
export const readingMinutes = (body?: string) => Math.max(1, Math.round(articleWordCount(body) / 180))

/** Статья по теме для лендинга покрытия или страницы модели: первая
    (самая свежая), у которой совпала серия или покрытие */
export async function relatedArticle({ seriesSlugs = [], coatingSlugs = [] }: {
  seriesSlugs?: string[]
  coatingSlugs?: string[]
}): Promise<Article | undefined> {
  return (await getArticles()).find((a) =>
    a.data.relatedSeriesSlugs?.some((s) => seriesSlugs.includes(s)) ||
    a.data.relatedCoatings?.some((c) => coatingSlugs.includes(c)),
  )
}

/** Автор статей — основатель студии: имя и роль из SITE, портрет — тот
    же, что на «О нас» (лицо по центру — годится для аватара); страница
    «О нас» — его страница (там письмо и фото) */
export const ARTICLE_AUTHOR = {
  name:        SITE.contactPerson,
  role:        SITE.contactRole,
  photo:       FOUNDER.photo.src,
  photoSrcset: FOUNDER.photo.srcset,
  href:        '/about/',
}
