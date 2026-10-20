/* /llms.txt — краткая карта сайта для ИИ-ассистентов и поисковиков с ИИ
   (формат llmstxt.org): кто мы, где находимся, главные разделы и все
   опубликованные статьи с выжимкой «Коротко». Собирается из SITE и
   коллекции статей — новая статья попадает сюда сама. */
import type { APIRoute } from 'astro'
import { SITE } from '../config/site'
import { reviews, YANDEX_RATING } from '../data/reviews'
import { companyLegalInfo } from '../lib/contacts-data'
import { getArticles, articleHref } from '../lib/articles'
import { ARTICLES_SECTION } from '../data/article-kinds'
import { ALUM_PAGE, ALUM_FACTS, ALUM_LAYOUT_COUNT } from '../data/alum-partitions'
import { getCatalogCards } from '../lib/catalog-data'
import { rub, MEASURE_TERMS, INSTALL_TERMS, WARRANTY_TERMS } from '../data/services'
import { SECRET_MIN_KIT_PRICE } from '../data/skrytye-dveri-products'
import { FROM_PRICE_PLINTUS, FROM_PRICE_REYKI, FROM_PRICE_FRAMUGA_KIT } from '../data/decor-products'
import { HIDDEN_DOORS_FAQ } from '../data/hidden-doors-page'
import { DECOR_FAQ } from '../data/decor-page'
import { PLINTUS_FAQ, THICKNESS_RANGE, HEIGHT_RANGE, PROFILES_COUNT } from '../data/plintus'
import { DESIGNERS_FAQ } from '../data/designers-page'
import { pluralRu } from '../lib/plural'

const abs = (path: string) => new URL(path, SITE.url).href

/* Плоский текст для ИИ: без разметки и без неразрывных пробелов в ответах
   (они нужны вёрстке, а в тексте ломают поиск по фразе) */
const plain = (t: string) => t.replace(/\u00a0|\u202f/g, ' ').trim()

export const GET: APIRoute = async () => {
  const articles = await getArticles()
  const { cards } = await getCatalogCards()
  const doorPrices = cards.map((c) => c.price).filter((p): p is number => typeof p === 'number' && p > 0)
  const doorMin = Math.min(...doorPrices)
  const seriesCount = new Set(cards.map((c) => c.seriesSlug)).size
  const modelsWord = pluralRu(cards.length, ['модель', 'модели', 'моделей'])
  const seriesWord = pluralRu(seriesCount, ['серия', 'серии', 'серий'])
  const reviewsWord = pluralRu(reviews.length, ['отзыв', 'отзыва', 'отзывов'])
  const ratingsWord = pluralRu(YANDEX_RATING.ratings, ['оценка', 'оценки', 'оценок'])
  const sections = [
    ['Каталог межкомнатных дверей', '/catalog/', 'серии, покрытия, цвета и цены'],
    ['Скрытые двери', '/catalog/skrytye-dveri/', 'двери скрытого монтажа, размеры и цены'],
    ['Напольный плинтус из МДФ', '/catalog/plintus/', 'профили, размеры и покраска по RAL и NCS, цена по запросу'],
    ['Алюминиевые перегородки', '/partitions/', 'раздвижные и стационарные системы со стеклом'],
    [ALUM_PAGE.name, ALUM_PAGE.path, `раздвижные алюминиевые перегородки: ${ALUM_LAYOUT_COUNT}, ${ALUM_FACTS.glass}, высота ${ALUM_FACTS.height}`],
    ['Дизайнерам и архитекторам', '/designers/', 'сотрудничество и шоурум для встреч с заказчиками'],
    ['О нас', '/about/', `${SITE.studioName} — официальный дилер ${SITE.manufacturerOf}`],
    ['Контакты', '/contacts/', 'адрес, часы работы, как добраться'],
    ...(SITE.features.reviews ? [['Отзывы клиентов', '/reviews/', `${reviews.length} ${reviewsWord} с Яндекс Карт, рейтинг ${YANDEX_RATING.value.toLocaleString('ru-RU', { minimumFractionDigits: 1 })} по ${YANDEX_RATING.ratings} ${ratingsWord}`]] : []),
  ]

  const lines = [
    `# ${SITE.studioName} — ${SITE.fullName}`,
    '',
    `> ${companyLegalInfo.activity.description}`,
    '',
    `- Адрес: ${SITE.address.full}`,
    `- ${companyLegalInfo.workingHours.shortDisplay}`,
    `- Телефон: ${SITE.phones.map((p) => p.label).join(', ')}`,
    `- Сайт: ${SITE.url}`,
    '',
    '## Что продаём и по каким ценам',
    '',
    `- Межкомнатные двери ВФД: ${cards.length} ${modelsWord} в ${seriesCount} ${seriesWord}, цены от ${rub(doorMin)} за полотно (${SITE.url}/catalog/). Цены указаны за полотно; комплект с коробом считается по выбранным опциям.`,
    `- Скрытые двери «Секрет», «Секрет Реверс», «Рефлекс»: комплект с алюминиевым коробом от ${rub(SECRET_MIN_KIT_PRICE)} (${SITE.url}/catalog/skrytye-dveri/). Калькулятор цены по кромке, открыванию, коробу, высоте и зеркалу.`,
    `- Декор: плинтус от ${rub(FROM_PRICE_PLINTUS)}, рейки от ${rub(FROM_PRICE_REYKI)} за комплект, фальшфрамуга от ${rub(FROM_PRICE_FRAMUGA_KIT)} (${SITE.url}/catalog/decor/).`,
    `- Напольный плинтус из МДФ: ${PROFILES_COUNT}, толщина ${THICKNESS_RANGE}, высота ${HEIGHT_RANGE}, покраска по RAL и NCS; цена по запросу (${SITE.url}/catalog/plintus/).`,
    `- Алюминиевые раздвижные перегородки: ${ALUM_LAYOUT_COUNT}, ${ALUM_FACTS.glass}, высота ${ALUM_FACTS.height} (${SITE.url}/partitions/ и ${SITE.url}/partitions/alum/). Цены — после расчёта по проёму.`,
    `- ${plain(MEASURE_TERMS)}.`,
    `- ${plain(INSTALL_TERMS)}; устанавливает собственная бригада салона.`,
    `- ${plain(WARRANTY_TERMS)}.`,
    '',
    '## Разделы',
    '',
    ...sections.map(([name, path, note]) => `- [${name}](${abs(path!)}): ${note}`),
  ]

  /* Ответы из тех же FAQ, что на страницах — ИИ берёт формулировку прямо оттуда */
  const faqBlocks: [string, { q: string; a: string }[]][] = [
    ['Скрытые двери — частые вопросы', HIDDEN_DOORS_FAQ],
    ['Декор — частые вопросы', DECOR_FAQ],
    ['Плинтус — частые вопросы', PLINTUS_FAQ],
    ['Дизайнерам — частые вопросы', DESIGNERS_FAQ],
  ]
  for (const [title, items] of faqBlocks) {
    lines.push('', `## ${title}`, '')
    for (const f of items) lines.push(`- ${plain(f.q)} ${plain(f.a)}`)
  }

  if (articles.length) {
    lines.push('', `## ${ARTICLES_SECTION}`, '')
    for (const a of articles) {
      const summary = a.data.summary?.join(' ') ?? a.data.description
      lines.push(`- [${a.data.title}](${abs(articleHref(a.id))}): ${summary}`)
    }
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
