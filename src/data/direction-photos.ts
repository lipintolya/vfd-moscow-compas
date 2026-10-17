/* Фото трёх направлений салона — плитки на главной (Directions) и
   ассортимент на /designers/. Подписи — что в кадре: по ним фото находят
   в Яндекс и Google Картинках. */
const DIR = '/media/vfd.moscow.compass/hero.block/catalog.preview.main'

export const DIRECTION_PHOTOS = {
  interior:   { src: `${DIR}/catalog_preview_left.webp`,       alt: 'Белая филёнчатая межкомнатная дверь в гостиной' },
  hidden:     { src: `${DIR}/catalog_preview_top_right.webp`,  alt: 'Скрытая дверь в цвет стены в спальне' },
  partitions: { src: `${DIR}/catalog_preview_down_right.webp`, alt: 'Перегородка в чёрном алюминиевом профиле между гостиной и столовой' },
} as const
