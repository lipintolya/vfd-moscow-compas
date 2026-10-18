/* Наборы фото, которые режет scripts/gen-photo-sets.mjs (шоурум, салон,
   производство, слайдер основателя): JSON набора → src / srcset / large
   для <img> и окна просмотра. Путь к файлам и хеш в имени задаёт
   генератор (base и hash в JSON) — здесь они не повторяются. */

export interface PhotoSetJson {
  /** Путь к копиям без номера кадра: '/renders/about/showroom' */
  base: string
  photos: {
    n: number
    /** Хеш исходника — в имени файла: новое фото → новое имя, без старого кадра из кэша */
    hash: string
    /** Ширины копий по возрастанию, не больше исходника */
    widths: number[]
    /** Размеры самой крупной копии — для <img width/height> */
    width: number
    height: number
  }[]
}

export interface SetPhoto {
  n: number
  src: string
  srcset: string
  /** Самая крупная копия — для окна просмотра */
  large: string
  width: number
  height: number
  alt: string
}

const setName = (set: PhotoSetJson) => set.base.split('/').pop()

/** Кадры набора с подписями по номеру кадра. Подпись обязательна (поиск
    по картинкам, экранные читалки): кадр без подписи и подпись к кадру,
    которого нет (номера сдвинулись после удаления фото), — ошибка сборки */
export function setPhotos(set: PhotoSetJson, alts: Record<number, string>): SetPhoto[] {
  const numbers = new Set(set.photos.map((p) => p.n))
  const stale = Object.keys(alts).map(Number).filter((n) => !numbers.has(n))
  if (stale.length) throw new Error(`Набор «${setName(set)}»: подписи к кадрам ${stale.join(', ')}, которых нет в наборе`)

  return set.photos.map((p) => {
    const alt = alts[p.n]
    if (!alt) throw new Error(`Набор «${setName(set)}»: нет подписи к кадру ${p.n}`)
    const file = (w: number) => `${set.base}-${p.n}-${p.hash}-${w}.webp`
    return {
      n:      p.n,
      src:    file(p.widths[0]!),
      srcset: p.widths.map((w) => `${file(w)} ${w}w`).join(', '),
      large:  file(p.widths.at(-1)!),
      width:  p.width,
      height: p.height,
      alt,
    }
  })
}

/** Кадр по номеру; нет такого — ошибка сборки, а не пустое место в галерее */
export function photoByN<T extends { n: number }>(photos: T[], n: number, name: string): T {
  const photo = photos.find((p) => p.n === n)
  if (!photo) throw new Error(`Набор «${name}»: нет кадра ${n}`)
  return photo
}
