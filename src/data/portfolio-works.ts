/* ============================================================
   Наши работы — портфолио
   Работы ведутся в Strapi (раздел «Портфолио», npm run cms); сайт
   читает их при сборке в коллекцию works (src/content.config.ts,
   src/lib/strapi-content.ts). Здесь — тип, подписи и цвета категорий.
   ============================================================ */

import type { SiteImage } from '../lib/strapi'

export type WorkCategory = 'interior' | 'hidden' | 'partitions' | 'walls'
export type ObjectType   = 'apartment' | 'house' | 'office' | 'commercial'

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  interior:   'Межкомнатные',
  hidden:     'Скрытые двери',
  partitions: 'Перегородки',
  walls:      'Стеновые панели',
}

/** Цвет бейджа категории на карточке/странице работы — разные цвета на
    глаз различают категории в сетке (сейчас все были одинаковым teal). */
export const CATEGORY_BADGE_COLORS: Record<WorkCategory, string> = {
  interior:   'bg-[oklch(50.5%_0.213_27.518)]', // красный
  hidden:     'bg-accent-600',                  // фирменный акцент — флагманский продукт
  partitions: 'bg-indigo-600',                  // холодный синий — алюминий/стекло
  walls:      'bg-slate-700',                    // графит — отделка стен
}

/** Тот же цветовой код категории, но как цвет текста подписи — вместо
    отдельной точки-маркера перед словом (убрали как AI-slop-паттерн). */
export const CATEGORY_TEXT_COLORS: Record<WorkCategory, string> = {
  interior:   'text-[oklch(50.5%_0.213_27.518)]',
  hidden:     'text-accent-600',
  partitions: 'text-indigo-600',
  walls:      'text-slate-700',
}

/** Разделы с отдельной страницей: плитка на /portfolio/ ведёт туда, а не на фильтр */
export const CATEGORY_PAGES: Partial<Record<WorkCategory, string>> = {
  walls: '/portfolio/stenovye-paneli/',
}

export const OBJECT_TYPE_LABELS: Record<ObjectType, string> = {
  apartment:  'Квартира',
  house:      'Частный дом',
  office:     'Офис',
  commercial: 'Коммерческая недвижимость',
}

export interface PortfolioWork {
  id:          string       // URL slug: '2026-06-17-urban-3room'
  date:        string       // ISO '2026-06-17'
  label:       string       // отображение: '17.06.2026'
  title:       string       // H1 на странице проекта
  description: string       // meta description, ~140 символов
  category:    WorkCategory
  objectType:  ObjectType
  location:    string       // 'Москва, ЖК …'
  story?:      string       // о проекте; абзацы — через пустую строку
  model?:      string       // 'Urban 1', 'Секрет', 'Alutech AL60'
  doorCount?:  number       // количество дверей / пролётов
  features?:   string[]     // ['Скрытые петли', 'Без наличников'] — атрибуты конкретного монтажа
  /** Категориальные метки для будущих фильтров (площадка/покрытие/фурнитура и
      т.п.) — отдельно от features, т.к. это не описание объекта, а признаки
      для поиска/фильтрации. Фильтр по ним пока не реализован, только данные. */
  tags?:       string[]     // ['Загородный дом', 'ПЭТ', 'Внешние петли']
  images:      string[]     // полноразмерные (копии Strapi до 1920 px); images[0] — обложка
  alts:        string[]     // «Что на фото» к images — из медиатеки Strapi
  /** <title> страницы работы; без него — название и место объекта */
  metaTitle?:  string
  /** Обложка для карточек — копия Strapi под карточку + srcset */
  cover:       SiteImage
  /** Ссылка на раздел каталога, к которому относится работа (под
      спецификацией на странице работы) — перелинковка портфолио → каталог. */
  relatedLink?: { href: string; label: string }
}

/** Разделы каталога для ссылки под работой — названия как в Strapi
    (поле «Ссылка на каталог → Раздел») */
export const CATALOG_LINKS: Record<string, { href: string; label: string }> = {
  'Межкомнатные двери':       { href: '/catalog/',               label: 'Межкомнатные двери в каталоге' },
  'Скрытые двери':            { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери в каталоге' },
  'Серые и графитовые двери': { href: '/catalog/seryye-dveri/',  label: 'Серые и графитовые двери в каталоге' },
  'Белые двери':              { href: '/catalog/belye-dveri/',   label: 'Белые двери в каталоге' },
  'Перегородки':              { href: '/partitions/',            label: 'Алюминиевые перегородки' },
  'Декор и погонаж':          { href: '/catalog/decor/',         label: 'Декор и погонаж' },
}
