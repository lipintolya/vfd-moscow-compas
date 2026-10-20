/* Подписи и подсказки полей в редакторе Strapi — по-русски. Хранятся в
   настройках отображения content-manager; применяем при каждом старте,
   чтобы правка этого файла сразу попадала в админку. */
import type { Core } from '@strapi/strapi'

type Labels = Record<string, { label: string; description?: string; placeholder?: string }>
type ViewConfig = { metadatas?: Record<string, { edit: Record<string, unknown>; list: Record<string, unknown> }> }

const LABELS: Record<string, Labels> = {
  'api::promo.promo': {
    title: { label: 'Название', description: 'Коротко: «−15 % на скрытые двери»' },
    subtitle: { label: 'Условия', description: 'Одна строка под названием' },
    description: { label: 'Описание', description: 'Подробности, если нужны' },
    image: { label: 'Фото', description: 'Горизонтальное, от 1200 px по ширине' },
    validUntil: { label: 'Действует до', description: 'Включительно; на следующий день акция уйдёт в архив' },
    discount: { label: 'Скидка', placeholder: '−10 %' },
    ctaText: { label: 'Текст кнопки', placeholder: 'Узнать подробнее' },
    ctaLink: { label: 'Ссылка кнопки', placeholder: '/catalog/skrytye-dveri/' },
  },
  'api::work.work': {
    title: { label: 'Название', description: 'Заголовок страницы работы' },
    slug: { label: 'Адрес страницы', description: 'Составляется из названия; после публикации не меняйте — старая ссылка перестанет работать' },
    metaTitle: { label: 'Заголовок для поисковиков', description: 'Если пусто — «Название — место объекта». «| Студия Зизевского» добавится сам; до 55 знаков (вместе с ним — не длиннее 75)' },
    date: { label: 'Дата' },
    category: { label: 'Вид работ' },
    objectType: { label: 'Объект' },
    location: { label: 'Город, район', placeholder: 'Москва, ЖК …' },
    description: { label: 'Короткое описание', description: 'Под заголовком в поиске Яндекса и Google; от 70 знаков' },
    story: { label: 'История', description: 'Абзацы — через пустую строку' },
    model: { label: 'Модель', placeholder: 'Секрет' },
    doorCount: { label: 'Сколько дверей' },
    features: { label: 'Особенности', description: 'Каждая — отдельным пунктом' },
    tags: { label: 'Метки' },
    images: { label: 'Фото', description: 'Первое — обложка. У каждого фото заполните «Что на фото» (значок карандаша на фото)' },
    catalogLink: { label: 'Ссылка на каталог', description: 'Раздел каталога под описанием работы' },
  },
  'api::article.article': {
    title: { label: 'Заголовок', description: 'H1 статьи и заголовок карточки' },
    slug: { label: 'Адрес страницы', description: 'Составляется из заголовка; после публикации не меняйте — старая ссылка перестанет работать' },
    kind: { label: 'Вид', description: 'Публикация — новость салона или фабрики' },
    publishDate: { label: 'Дата публикации' },
    updatedDate: { label: 'Дата обновления', description: 'Если статью заметно переписали' },
    cover: { label: 'Обложка', description: 'Горизонтальная 16:9, от 1920×1080; можно с заголовком на картинке' },
    coverAlt: { label: 'Что на обложке', description: 'Для поисковиков и незрячих: «Белая скрытая дверь в гостиной». Если пусто — «Что на фото» из медиатеки' },
    description: { label: 'Лид', description: 'Под заголовком и в поиске; от 70 до 160 знаков. Подстановки: {адрес салона}, {телефон}, {часы работы} — полный список в инструкции' },
    summary: { label: 'Коротко', description: '2–5 пунктов с прямыми ответами — в начале статьи' },
    body: { label: 'Текст статьи', description: 'Блоки по порядку: текст, фото, галерея, выноска, видео, таблица, цены. В тексте — подстановки {адрес салона}, {цена комплекта Секрет} …' },
    faq: { label: 'Вопросы и ответы', description: 'В конце статьи и в поиске Яндекса и Google' },
    related: { label: 'Статьи по теме', description: '2–3 статьи для «Читайте также» в конце статьи; если пусто — самые свежие' },
    keywords: { label: 'Ключевые фразы' },
    seo: { label: 'Для поисковиков и каталога', description: 'Заполняет разработчик; можно не трогать' },
  },
  'article.text': { content: { label: 'Текст', description: 'Подзаголовки — «Заголовок 2»; подстановки — {адрес салона} и др.' } },
  'article.photo': { image: { label: 'Фото' }, alt: { label: 'Что на фото', description: 'Если пусто — из медиатеки' }, caption: { label: 'Подпись' }, layout: { label: 'Как показать', description: 'Узкое — схемы и чертежи; без обрезки — картинки с текстом' } },
  'article.gallery': { photos: { label: 'Фото', description: 'От 2 до 4' }, columns: { label: 'Колонок', description: 'Если пусто — по числу фото' }, doors: { label: 'Высокие двери', description: 'Для фото дверей из каталога — плитка вытянута, дверь видна целиком' } },
  'article.gallery-photo': { image: { label: 'Фото' }, alt: { label: 'Что на фото', description: 'Если пусто — из медиатеки, затем подпись' }, caption: { label: 'Подпись' }, link: { label: 'Ссылка подписи', placeholder: '/catalog/series/urban/' } },
  'article.callout': { kind: { label: 'Тип' }, title: { label: 'Заголовок', description: 'Если пусто — по типу: «Совет», «Важно»…' }, text: { label: 'Текст' } },
  'article.video': { video: { label: 'Ролик', description: 'MP4 до 25 МБ' }, poster: { label: 'Обложка ролика' }, title: { label: 'Что в ролике' }, caption: { label: 'Подпись' }, narrow: { label: 'Вертикальный ролик', description: 'Снят на телефон вертикально — показываем узким по центру' } },
  'article.table': { markdown: { label: 'Таблица', description: 'Строки через Enter, ячейки через |. Первая строка — заголовки, вторая — |---|---|' } },
  'article.hidden-prices': { note: { label: 'Заметка для себя', description: 'На сайт не выводится; цены — из каталога' } },
  'article.coating-prices': { note: { label: 'Заметка для себя', description: 'На сайт не выводится; цены — из каталога' } },
  'article.faq': { q: { label: 'Вопрос' }, a: { label: 'Ответ' } },
  'article.step': { name: { label: 'Шаг', description: 'Ровно как подзаголовок шага в тексте' }, text: { label: 'Суть шага' } },
  'article.coating': { coating: { label: 'Покрытие' } },
  'article.author': { name: { label: 'Имя' }, role: { label: 'Кто это' }, href: { label: 'Ссылка' }, photo: { label: 'Фото или логотип' }, linkLabel: { label: 'Подпись ссылки' }, type: { label: 'Автор' } },
  'article.spotlight': { label: { label: 'Плашка', placeholder: 'Новинка' }, lead: { label: 'Лид', description: 'Если пусто — лид статьи' }, image: { label: 'Фото', description: 'Вертикальное' }, imageAlt: { label: 'Что на фото', description: 'Если пусто — из медиатеки' }, video: { label: 'Ролик' }, poster: { label: 'Обложка ролика' }, videoTitle: { label: 'Что в ролике' }, points: { label: 'Факты', description: '2–4 коротких' } },
  'article.seo': { metaTitle: { label: 'Заголовок для поисковиков', description: 'Если пусто — заголовок статьи. «| Студия Зизевского» добавится сам; до 55 знаков (вместе с ним — не длиннее 75)' }, steps: { label: 'Шаги (инструкция)' }, coatings: { label: 'Покрытия', description: 'В конце статьи — серии с ценами; статья появится на страницах покрытий' }, series: { label: 'Серии каталога', description: 'Статья появится «статьёй по теме» у моделей серии; список — npm run cms:series' }, pages: { label: 'Страницы каталога', description: 'Где показать «Статья по теме» первой' }, author: { label: 'Автор', description: 'Если пусто — основатель студии' }, spotlight: { label: 'Показ на главной', description: 'Самая свежая статья с этим блоком — перед лентой статей' } },
  'article.catalog-page': { page: { label: 'Страница' } },
  'article.catalog-series': { series: { label: 'Серия' } },
  'shared.item': { text: { label: 'Текст' } },
  'shared.catalog-link': { section: { label: 'Раздел' }, label: { label: 'Подпись ссылки', description: 'Если пусто — название раздела' } },
}

export async function applyLabels(strapi: Core.Strapi) {
  /* то же хранилище и ключи, что у content-manager (services/utils/store) */
  const store = strapi.store({ type: 'plugin', name: 'content_manager' })
  for (const [uid, fields] of Object.entries(LABELS)) {
    const key = `configuration_${uid.includes('::') ? 'content_types' : 'components'}::${uid}`
    const config = (await store.get({ key })) as ViewConfig | null
    if (!config?.metadatas) continue
    for (const [field, text] of Object.entries(fields)) {
      const meta = config.metadatas[field]
      if (!meta) continue
      meta.edit = { ...meta.edit, ...text }
      meta.list = { ...meta.list, label: text.label }
    }
    await store.set({ key, value: config })
  }
}
