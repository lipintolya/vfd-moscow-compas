/* Фото трёх направлений салона — плитки на главной (Directions) и
   ассортимент на /designers/. Подписи — что в кадре: по ним фото находят
   в Яндекс и Google Картинках. */
import { responsivePhoto } from '../lib/responsive-photo'

const DIR = '/media/vfd.moscow.compass/hero.block/catalog.preview.main'
/* srcset — уменьшенные копии (npm run gen:responsive); sizes задаёт плитка:
   кадр в ней обрезается cover, и нарисованная ширина зависит от её формы */
const photo = (src: string, alt: string) => ({ ...responsivePhoto(src), alt })

export const DIRECTION_PHOTOS = {
  interior:   photo(`${DIR}/catalog_preview_left.webp`,       'Белая филёнчатая межкомнатная дверь в гостиной'),
  hidden:     photo(`${DIR}/catalog_preview_top_right.webp`,  'Скрытая дверь в цвет стены в спальне'),
  partitions: photo(`${DIR}/catalog_preview_down_right.webp`, 'Перегородка в чёрном алюминиевом профиле между гостиной и столовой'),
} as const
