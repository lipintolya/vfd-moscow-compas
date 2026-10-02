/**
 * src/data/reviews.ts
 *
 * Реальные отзывы клиентов с Яндекс Карт и 2ГИС — используются в
 * src/components/home/Reviews.vue. Даты — ISO (YYYY-MM-DD) для
 * <time datetime> и schema.org Review/datePublished.
 *
 * Добавлять новый отзыв: просто добавь объект в конец нужного блока
 * (сортировка внутри массива не важна — компонент сам не переупорядочивает).
 */

const PHOTO_BASE = 'https://storage.yandexcloud.net/vfd74ru/info/reviews'

export type ReviewPlatform = 'yandex' | '2gis'

export interface Review {
  id:       string
  name:     string
  platform: ReviewPlatform
  /** ISO-дата. Не у всех исходных отзывов дата была указана — тогда опущено. */
  date?:    string
  text:     string
  photos?:  string[]
}

export const reviews: Review[] = [
  // Отзывов московского салона пока нет. Формат записи — см. интерфейс Review выше.
]
