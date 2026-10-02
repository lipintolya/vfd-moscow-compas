/* ============================================================
   Наши работы — скрытые двери
   Добавляй новые объекты в массив INVISIBLE_WORKS.
   Последний объект — сверху (push в начало массива).
   ============================================================ */

const CDN_WORKS = 'https://storage.yandexcloud.net/catalog-vfd/invisible/ourworks/'

export interface InvisibleWork {
  id:        string    // slug: '2026-06-17-01'
  date:      string    // ISO '2026-06-17'  (Schema.org dateCreated)
  label:     string    // отображение: '17.06.2026'
  title:     string    // заголовок карточки
  story?:    string    // короткая история проекта, 1-2 предложения — факты идут в coating/features, не сюда
  location?: string    // 'Москва' или 'Москва, ЖК …'
  series?:   'Секрет' | 'Секрет Реверс'
  edge?:     'Чёрная' | 'Серебро' | 'Золото'
  coating?:  string    // тип покрытия полотна: 'Грунт под покраску', 'Шпон дуба', 'Эмаль RAL 9003' …
  features?: string[]  // особенности монтажа: ['Короб заподлицо', 'Скрытые петли', 'Без наличников']
  images:    string[]  // полные CDN-ссылки, images[0] — обложка (hero)
}

export const INVISIBLE_WORKS: InvisibleWork[] = [
  // Объектов московского салона пока нет. Формат записи — см. интерфейс InvisibleWork выше.
]
