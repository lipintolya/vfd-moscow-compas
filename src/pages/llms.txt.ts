/* /llms.txt — краткая карта сайта для ИИ-ассистентов и поисковиков с ИИ
   (формат llmstxt.org): кто мы, где находимся, главные разделы и все
   опубликованные статьи с выжимкой «Коротко». Собирается из SITE и
   коллекции статей — новая статья попадает сюда сама. */
import type { APIRoute } from 'astro'
import { SITE, PHONE } from '../config/site'
import { companyLegalInfo } from '../lib/contacts-data'
import { getArticles, articleHref } from '../lib/articles'
import { ARTICLES_SECTION } from '../data/article-kinds'

const abs = (path: string) => new URL(path, SITE.url).href

export const GET: APIRoute = async () => {
  const articles = await getArticles()
  const sections = [
    ['Каталог межкомнатных дверей', '/catalog/', 'серии, покрытия, цвета и цены'],
    ['Скрытые двери', '/catalog/skrytye-dveri/', 'двери скрытого монтажа, размеры и цены'],
    ['Алюминиевые перегородки', '/partitions/', 'раздвижные и стационарные системы со стеклом'],
    ['Перегородки ОНИКС ALUM', '/partitions/oniks-alum/', 'раздвижные перегородки фабрики ОНИКС: 10 раскладок, стекло 4 мм или триплекс 8 мм, высота до 3000 мм'],
    ['Дизайнерам и архитекторам', '/designers/', 'сотрудничество и шоурум для встреч с заказчиками'],
    ['О нас', '/about/', `${SITE.studioName} — официальный дилер ${SITE.manufacturerOf}`],
    ['Контакты', '/contacts/', 'адрес, часы работы, как добраться'],
  ]

  const lines = [
    `# ${SITE.studioName} — ${SITE.fullName}`,
    '',
    `> ${companyLegalInfo.activity.description}`,
    '',
    `- Адрес: ${SITE.address.full}`,
    `- ${companyLegalInfo.workingHours.shortDisplay}`,
    `- Телефон: ${PHONE.label}`,
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
