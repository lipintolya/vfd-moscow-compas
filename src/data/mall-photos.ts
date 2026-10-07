/* Фото ТЦ «Компас» с улицы — блок «Как к нам добраться» (VisitBand)
   и LocalBusiness.image. Файлы и размеры — scripts/gen-mall-photos.mjs
   (public/renders/mall/, mall-photos.json); здесь — подписи.

   Подписи — для поиска по картинкам и незрячих: что в кадре + адрес,
   чтобы фото находились по запросам «ТЦ Компас Красная Сосна». */
import { SITE } from '../config/site'
import mallPhotos from './mall-photos.json'

const { mallFull, street } = SITE.address
const PLACE = `${street}, ${SITE.city.name}`

const ALTS: Record<number, string> = {
  1: `${mallFull} на ${PLACE} — вид с проезжей части`,
  2: `Вход в ${SITE.address.mall}, ${PLACE}`,
  3: `Парковка у ${SITE.address.mall} и вход в здание, ${PLACE}`,
  4: `${SITE.address.mall} со стороны тротуара, ${PLACE}`,
}

const file = (n: number, w: number) => `/renders/mall/compass-${n}-${w}.webp`

export const MALL_PHOTOS = mallPhotos.photos.map((p) => ({
  src:    file(p.n, mallPhotos.widths[0]!),
  srcset: mallPhotos.widths.map((w) => `${file(p.n, w)} ${w}w`).join(', '),
  /** Крупный кадр — для окна просмотра */
  large:  file(p.n, mallPhotos.widths.at(-1)!),
  /** Абсолютный URL крупного кадра — для schema.org image */
  url:    new URL(file(p.n, mallPhotos.widths.at(-1)!), SITE.url).href,
  width:  p.width,
  height: p.height,
  alt:    ALTS[p.n] ?? `${mallFull}, ${PLACE}`,
}))
