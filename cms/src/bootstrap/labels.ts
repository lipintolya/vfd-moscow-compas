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
    date: { label: 'Дата' },
    category: { label: 'Вид работ' },
    objectType: { label: 'Объект' },
    location: { label: 'Город, район', placeholder: 'Москва, ЖК …' },
    description: { label: 'Короткое описание', description: 'Под заголовком в поиске Яндекса и Google' },
    story: { label: 'История', description: 'Абзацы — через пустую строку' },
    model: { label: 'Модель', placeholder: 'Секрет' },
    doorCount: { label: 'Сколько дверей' },
    features: { label: 'Особенности', description: 'Каждая — отдельным пунктом' },
    tags: { label: 'Метки' },
    images: { label: 'Фото', description: 'Первое — обложка' },
    catalogLink: { label: 'Ссылка на каталог', description: 'Раздел каталога под описанием работы' },
  },
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
