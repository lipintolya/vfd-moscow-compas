/**
 * Раздел /articles/ — «Статьи и публикации». Тип материала задаётся
 * во фронтматтере (`kind`), по умолчанию — статья:
 *   - article     — статья: разбор, советы по выбору, покрытиям, монтажу;
 *   - publication — публикация: новость салона или фабрики, новинка,
 *                   выставка, материал о салоне в СМИ.
 * Название раздела и подписи типов — отсюда, в компонентах не повторять.
 */
export const ARTICLE_KINDS = ['article', 'publication'] as const
export type ArticleKind = (typeof ARTICLE_KINDS)[number]

export const KIND_LABEL: Record<ArticleKind, string> = {
  article:     'Статья',
  publication: 'Публикация',
}

/** Название раздела — хлебные крошки, заголовки, разметка */
export const ARTICLES_SECTION = 'Статьи и публикации'
