/* Статьи — один источник для всех мест, где они выводятся: главная
   (LatestArticles), раздел /articles/, страница статьи, «статья по теме»
   на лендингах покрытий и страницах моделей, /llms.txt.

   Заглушки (placeholder: true) наружу не выходят: их нет в списках,
   «по теме», sitemap и /llms.txt; сама страница заглушки закрыта noindex. */
import { getCollection, type CollectionEntry } from 'astro:content'
import { SITE } from '../config/site'
import { FOUNDER } from '../data/about-page'
import { fillArticleVars } from './article-vars'

export type Article = CollectionEntry<'articles'>

/** Переменные ({% $salon.phone %}, {% $hidden.kitFrom %} …) в тех полях
    фронтматтера, что выводятся текстом: лид, «Коротко», вопросы-ответы.
    Статьи берите только через getArticles / withArticleVars — иначе
    в разметку уйдёт запись переменной вместо значения. */
export function withArticleVars(article: Article): Article {
  const { data } = article
  return {
    ...article,
    data: {
      ...data,
      description: fillArticleVars(data.description),
      summary: data.summary?.map(fillArticleVars),
      faq: data.faq?.map((f) => ({ q: fillArticleVars(f.q), a: fillArticleVars(f.a) })),
    },
  }
}

let published: Promise<Article[]> | undefined

/** Опубликованные статьи, свежие сверху (на сборку — один запрос) */
export function getArticles(): Promise<Article[]> {
  if (!published || import.meta.env.DEV) {
    published = getCollection('articles', (a) => !a.data.placeholder).then((list) =>
      list
        .map(withArticleVars)
        .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()),
    )
  }
  return published
}

export const articleHref = (id: string) => `/articles/${id}/`

/** Блок-новинка на главной — самая свежая статья с spotlight */
export async function getSpotlight(): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.data.spotlight)
}

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

/** Статья по теме для страницы каталога. Сначала — статья, которая сама
    назвала эту страницу (relatedPages), затем о покрытии (она конкретнее
    серии), о серии; среди равных — самая свежая. Иначе новая статья с
    длинным списком серий перебивала бы на лендинге статью о самом покрытии. */
export async function relatedArticle({ pagePath, seriesSlugs = [], coatingSlugs = [] }: {
  /** Адрес страницы, со слешем на конце: '/catalog/skrytye-dveri/' */
  pagePath?: string
  seriesSlugs?: string[]
  coatingSlugs?: string[]
}): Promise<Article | undefined> {
  const articles = await getArticles()
  const tiers: ((a: Article) => boolean | undefined)[] = [
    (a) => pagePath !== undefined && a.data.relatedPages?.includes(pagePath),
    (a) => a.data.relatedCoatings?.some((c) => coatingSlugs.includes(c)),
    (a) => a.data.relatedSeriesSlugs?.some((s) => seriesSlugs.includes(s)),
  ]
  for (const matches of tiers) {
    const found = articles.find(matches)
    if (found) return found
  }
  return undefined
}

/** Автор статей по умолчанию — основатель студии: имя и роль из SITE,
    портрет — тот же, что на «О нас» (лицо по центру — годится для
    аватара); страница «О нас» — его страница (там письмо и фото) */
export const ARTICLE_AUTHOR = {
  name:        SITE.contactPerson,
  role:        SITE.contactRole,
  photo:       FOUNDER.photo.src,
  photoSrcset: FOUNDER.photo.srcset,
  href:        '/about/',
}

export interface ArticleAuthor {
  name:         string
  role:         string
  photo?:       string
  photoSrcset?: string
  href:         string
  /** Ссылка ведёт на другой сайт — открываем в новой вкладке */
  external:     boolean
  type:         'person' | 'organization'
  /** Строка под именем в блоке автора в конце статьи */
  about:        string
  /** Подпись ссылки в блоке автора */
  linkLabel:    string
}

const capitalize = (s: string) => `${s[0]!.toUpperCase()}${s.slice(1)}`

/** Автор статьи: из фронтматтера (author), иначе — основатель студии */
export function articleAuthor(article: Article): ArticleAuthor {
  const a = article.data.author
  if (!a) {
    return {
      ...ARTICLE_AUTHOR,
      external:  false,
      type:      'person',
      about:     `${capitalize(ARTICLE_AUTHOR.role)}. ${SITE.experience}.`,
      linkLabel: 'О студии и основателе',
    }
  }
  return {
    name:      a.name,
    role:      a.role,
    photo:     a.photo,
    href:      a.href,
    external:  /^https?:\/\//.test(a.href),
    type:      a.type,
    about:     capitalize(a.role),
    linkLabel: a.linkLabel ?? 'Подробнее об авторе',
  }
}
