/**
 * src/data/hardware.ts
 *
 * Фурнитура для калькулятора стоимости (петли, замок) — одна цена на все
 * покрытия/серии, поэтому отдельно от accessoriesByCoating (тот ключуется
 * по покрытию). Цены — РРЦ, как и в accessories.ts.
 */

export type HingeType = 'hidden' | 'standard'

export const HINGE_PRICE: Record<HingeType, number> = {
  hidden:   1_960, // Скрытые петли Morelli, за шт
  standard: 370,   // Внешние (накладные) петли Morelli на 4 подшипниках, за шт
}

export const HINGE_LABEL: Record<HingeType, string> = {
  hidden:   'Скрытые петли',
  standard: 'Внешние петли',
}

/** Петель на дверь — одинаково для обоих типов. */
export const HINGE_QTY = 2

export const LOCK_PRICE = 1_280 // Магнитный замок, за шт
export const LOCK_LABEL = 'Магнитный замок'
export const LOCK_QTY   = 1

export const WC_PRICE = 1_030 // Завёртка WC, за шт
export const WC_LABEL = 'Завёртка WC (фиксатор для санузла)'
export const WC_QTY   = 1

/** Фото + схема с размерами — для наглядности в калькуляторе. */
export interface HardwareImages { photo: string; schema: string }

const HW_CDN = 'https://storage.yandexcloud.net/vfd74ru/info/petli/'

export const HINGE_IMAGES: Record<HingeType, HardwareImages> = {
  standard: { photo: `${HW_CDN}out_petli.webp`, schema: `${HW_CDN}out.webp` },
  hidden:   { photo: `${HW_CDN}in_petli.webp`,  schema: `${HW_CDN}in.webp`  },
}

export const LOCK_IMAGES: HardwareImages = {
  photo:  `${HW_CDN}DymddESZYJSWaIEpIWgN.webp`,
  schema: `${HW_CDN}9dY7IqXSJUnrgxPHlkYG.webp`,
}

export const WC_IMAGES: HardwareImages = {
  photo:  `${HW_CDN}o9ftrYE4fHkrxBqvqQmn.webp`,
  schema: `${HW_CDN}01K24E4T4MCPPYZ45ZB2Q8VE4Q.webp`,
}
