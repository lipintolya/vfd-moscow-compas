/**
 * Страницы каталога, где статья может стоять «Статьёй по теме» (Strapi:
 * «Для поисковиков и каталога» → «Страницы каталога»). Подпись — значение
 * списка в Strapi (cms/src/components/article/catalog-page.json, тест
 * сверяет), путь — страница, которая зовёт relatedArticle({ pagePath }).
 * Новая такая страница — сюда и в список Strapi.
 */
export const ARTICLE_CATALOG_PAGES: Record<string, string> = {
  'Скрытые двери':                   '/catalog/skrytye-dveri/',
  'Скрытые двери для дома':          '/catalog/skrytye-dveri-dlya-doma/',
  'Скрытые двери для офиса':         '/catalog/skrytye-dveri-dlya-ofisa/',
  'Скрытые двери в новостройку':     '/catalog/skrytye-dveri-novostroyka/',
  'Скрытые двери под дизайн-проект': '/catalog/skrytye-dveri-dizayn-proekt/',
  'Двери в стиле лофт':              '/catalog/loft-dveri/',
  'Двери в стиле минимализм':        '/catalog/minimalizm-dveri/',
  'Двери в скандинавском стиле':     '/catalog/skandinavskiy-dveri/',
  'Декор и погонаж':                 '/catalog/decor/',
}
