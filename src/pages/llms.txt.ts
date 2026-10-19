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

const abs = (path: string) => new URL(path, SITE.url).href

export const GET: APIRoute = async () => {
  const articles = await getArticles()
  const sections = [
    ['Каталог межкомнатных дверей', '/catalog/', 'серии, покрытия, цвета и цены'],
    ['Скрытые двери', '/catalog/skrytye-dveri/', 'двери скрытого монтажа, размеры и цены'],
    ['Напольный плинтус из МДФ', '/catalog/plintus/', 'цвета и профили, цена по запросу в мессенджере'],
    ['Алюминиевые перегородки', '/partitions/', 'раздвижные и стационарные системы со стеклом'],
    [ALUM_PAGE.name, ALUM_PAGE.path, `раздвижные алюминиевые перегородки: ${ALUM_LAYOUT_COUNT}, ${ALUM_FACTS.glass}, высота ${ALUM_FACTS.height}`],
    ['Дизайнерам и архитекторам', '/designers/', 'сотрудничество и шоурум для встреч с заказчиками'],
    ['О нас', '/about/', `${SITE.studioName} — официальный дилер ${SITE.manufacturerOf}`],
    ['Контакты', '/contacts/', 'адрес, часы работы, как добраться'],
    ...(SITE.features.reviews ? [['Отзывы клиентов', '/reviews/', `${reviews.length} отзывов с Яндекс Карт, рейтинг ${YANDEX_RATING.value.toLocaleString('ru-RU', { minimumFractionDigits: 1 })} по ${YANDEX_RATING.ratings} оценкам`]] : []),
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
    '## Разделы',
    '',
    ...sections.map(([name, path, note]) => `- [${name}](${abs(path!)}): ${note}`),
  ]

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
