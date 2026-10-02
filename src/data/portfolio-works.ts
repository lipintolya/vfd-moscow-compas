/* ============================================================
   Наши работы — портфолио
   Чтобы добавить новую работу: вставь объект PortfolioWork
   в НАЧАЛО массива PORTFOLIO_WORKS.
   ============================================================ */

const CDN_OW = 'https://storage.yandexcloud.net/catalog-vfd/invisible/ourworks/'

export type WorkCategory = 'interior' | 'hidden' | 'partitions' | 'entrance'
export type ObjectType   = 'apartment' | 'house' | 'office' | 'commercial'

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  interior:   'Межкомнатные',
  hidden:     'Скрытые двери',
  partitions: 'Перегородки',
  entrance:   'Входные',
}

/** Цвет бейджа категории на карточке/странице работы — разные цвета на
    глаз различают категории в сетке (сейчас все были одинаковым teal). */
export const CATEGORY_BADGE_COLORS: Record<WorkCategory, string> = {
  interior:   'bg-[oklch(50.5%_0.213_27.518)]', // красный
  hidden:     'bg-accent-600',                  // фирменный акцент — флагманский продукт
  partitions: 'bg-indigo-600',                  // холодный синий — алюминий/стекло
  entrance:   'bg-amber-600',                   // тёплый янтарный — входная группа
}

/** Тот же цветовой код категории, но как цвет текста подписи — вместо
    отдельной точки-маркера перед словом (убрали как AI-slop-паттерн). */
export const CATEGORY_TEXT_COLORS: Record<WorkCategory, string> = {
  interior:   'text-[oklch(50.5%_0.213_27.518)]',
  hidden:     'text-accent-600',
  partitions: 'text-indigo-600',
  entrance:   'text-amber-600',
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
  story?:      string       // 2-3 предложения о проекте
  model?:      string       // 'Urban 1', 'Секрет', 'Alutech AL60'
  doorCount?:  number       // количество дверей / пролётов
  features?:   string[]     // ['Скрытые петли', 'Без наличников'] — атрибуты конкретного монтажа
  /** Категориальные метки для будущих фильтров (площадка/покрытие/фурнитура и
      т.п.) — отдельно от features, т.к. это не описание объекта, а признаки
      для поиска/фильтрации. Фильтр по ним пока не реализован, только данные. */
  tags?:       string[]     // ['Загородный дом', 'ПЭТ', 'Внешние петли']
  images:      string[]     // images[0] — обложка
  /** Ссылка на раздел каталога, к которому относится работа (под
      спецификацией на странице работы) — перелинковка портфолио → каталог. */
  relatedLink?: { href: string; label: string }
}

export const PORTFOLIO_WORKS: PortfolioWork[] = [
  // Объектов московского салона пока нет. Формат записи — см. интерфейс PortfolioWork выше.
]
