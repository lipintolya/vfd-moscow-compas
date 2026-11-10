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
import { getCollection } from 'astro:content'
import { activePromos, formatDate } from '../lib/promo-dates'
import { rub, MEASURE_TERMS, INSTALL_TERMS, WARRANTY_TERMS } from '../data/services'
import { SECRET_MIN_KIT_PRICE } from '../data/skrytye-dveri-products'
import { FROM_PRICE_PLINTUS, FROM_PRICE_REYKI, FROM_PRICE_FRAMUGA_KIT, REYKI_KIT_PCS } from '../data/decor-products'
import { REYKI_PAGE } from '../data/reyki-page'
import { TASK_CATEGORIES } from '../data/task-categories'
import { HIDDEN_DOORS_FAQ } from '../data/hidden-doors-page'
import { DECOR_FAQ } from '../data/decor-page'
import { PLINTUS_FAQ, THICKNESS_RANGE, HEIGHT_RANGE, PROFILES_COUNT } from '../data/plintus'
import { PLINTUS_LINES_FAQ } from '../data/plintus-lines'
import { ENTRANCE_DOORS, ENTRANCE_MIN_PRICE } from '../data/entrance-doors'
import { VFD_MODELS, VFD_SKINS, VFD_MIN_PRICE, VFD_SECTION } from '../data/entrance-vfd'
import { DESIGNERS_FAQ } from '../data/designers-page'
import { WALL_PANELS_PAGE, PANEL_FAQ, PANEL_PRICE_LINE, PANEL_PRICES_DATE } from '../data/wall-panels-page'
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
  /* Акции — только действующие; раздел появляется и исчезает вместе с ними */
  const promos = activePromos((await getCollection('promos')).map((e) => e.data))
  const sections = [
    ['Каталог межкомнатных дверей', '/catalog/', 'серии, покрытия, цвета и цены'],
    ['Скрытые двери', '/catalog/skrytye-dveri/', 'двери скрытого монтажа, размеры и цены'],
    ['Стеновые панели', WALL_PANELS_PAGE.path, `изготовление на заказ из натурального шпона, двери заподлицо с панелями, цены за м²`],
    ['Декоративные рейки', REYKI_PAGE.path, `реечные панели на стену, потолок и перегородкой; комплект из ${REYKI_KIT_PCS} шт от ${rub(FROM_PRICE_REYKI)}`],
    ...TASK_CATEGORIES.map((c) => [c.h1, `/catalog/${c.slug}/`, c.summary]),
    ['Входные двери', '/catalog/vhodnye-dveri/', `${ENTRANCE_DOORS.length} моделей стальных дверей: для квартиры, с терморазрывом, электронным замком и стеклопакетом; фото, характеристики, цены от ${rub(ENTRANCE_MIN_PRICE)}`],
    ['Входные двери VFD со сменными накладками', '/catalog/vhodnye-dveri/#vfd-doors', `${VFD_MODELS.length} моделей, ${VFD_SKINS.length} накладок изнутри (часть повторяет межкомнатные двери VFD), цены от ${rub(VFD_MIN_PRICE)}`],
    ['Плинтус', '/catalog/plintus/', 'напольный из МДФ, с LED-подсветкой, скрытый, микроплинтус и шпонированный; покраска по RAL и NCS, цена по запросу'],
    ['Алюминиевые перегородки', '/partitions/', 'раздвижные и стационарные системы со стеклом'],
    [ALUM_PAGE.name, ALUM_PAGE.path, `раздвижные алюминиевые перегородки: ${ALUM_LAYOUT_COUNT}, ${ALUM_FACTS.glass}, высота ${ALUM_FACTS.height}`],
    ...(promos.length ? [['Акции салона', '/offers/', `${promos.map((p) => p.title).join('; ')} — до ${formatDate(promos.map((p) => p.validUntil).sort().at(-1)!)}`]] : []),
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
    `- YouTube-канал: ${SITE.social.youtube}`,
    ...(SITE.social.vk ? [`- ВКонтакте: ${SITE.social.vk}`] : []),
    `- Telegram-канал: ${SITE.social.telegram}`,
    '',
    '## Что продаём и по каким ценам',
    '',
    `- Межкомнатные двери ВФД: ${cards.length} ${modelsWord} в ${seriesCount} ${seriesWord}, цены от ${rub(doorMin)} за полотно (${SITE.url}/catalog/). Цены указаны за полотно; комплект с коробом считается по выбранным опциям.`,
    `- Скрытые двери «Секрет», «Секрет Реверс», «Рефлекс»: комплект с алюминиевым коробом от ${rub(SECRET_MIN_KIT_PRICE)} (${SITE.url}/catalog/skrytye-dveri/). Калькулятор цены по кромке, открыванию, коробу, высоте и зеркалу.`,
    `- Стеновые панели на заказ (${abs(WALL_PANELS_PAGE.path)}): изготавливает ${SITE.studioName} из натурального шпона, двери встраиваются заподлицо с панелями. Цена за квадратный метр панели: ${PANEL_PRICE_LINE} (актуально на ${PANEL_PRICES_DATE}, актуальную стоимость уточняйте у менеджера); итог — по проекту после замера.`,
    `- Декор: плинтус от ${rub(FROM_PRICE_PLINTUS)}, рейки от ${rub(FROM_PRICE_REYKI)} за комплект, фальшфрамуга от ${rub(FROM_PRICE_FRAMUGA_KIT)} (${SITE.url}/catalog/decor/).`,
    `- Входные двери: ${ENTRANCE_DOORS.length} моделей (${SITE.url}/catalog/vhodnye-dveri/) — стальные, размеры полотна ${ENTRANCE_DOORS[0]!.sizes} мм, для квартиры и дома (терморазрыв, электронный замок, стеклопакет); у каждой модели своя страница с характеристиками и вариантами отделки. Цены от ${rub(ENTRANCE_MIN_PRICE)} (минимальная цена модели; цену выбранной отделки подтверждает менеджер).`,
    `- ${VFD_SECTION.title} (${SITE.url}/catalog/vhodnye-dveri/#vfd-doors): ${VFD_MODELS.length} моделей — для квартиры и для дома с терморазрывом; накладку изнутри выбирают отдельно (${VFD_SKINS.length} вариантов, часть повторяет цвет и рисунок межкомнатных дверей VFD). Цены от ${rub(VFD_MIN_PRICE)} (дверь с выбранной накладкой; точную сумму подтверждает менеджер).`,
    `- Плинтус: напольный из МДФ — ${PROFILES_COUNT}, толщина ${THICKNESS_RANGE}, высота ${HEIGHT_RANGE}, те же профили с LED-подсветкой; скрытый алюминиевый (60 и 80 мм), микроплинтус, шпонированный; покраска по RAL и NCS; цена по запросу (${SITE.url}/catalog/plintus/).`,
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
    ['Плинтус — частые вопросы', [...PLINTUS_FAQ, ...PLINTUS_LINES_FAQ]],
    ['Стеновые панели — частые вопросы', PANEL_FAQ],
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
