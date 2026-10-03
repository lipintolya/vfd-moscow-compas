/**
 * Цены услуг салона — единственный источник для «Как мы работаем» на главной,
 * FAQ и контактов. Меняете цену — обновите и PRICES_DATE (она в сноске).
 */

const NBSP = ' '

/** Дата, на которую цены актуальны (ГГГГ-ММ-ДД) */
export const PRICES_DATE = '2026-10-04'

export const SERVICES = {
  /** Замер; сумму возвращаем при заказе от refundFrom дверей */
  measure: { price: 2200, refundFrom: 2 },
  /** Установка одной двери — от этой суммы */
  install: { priceFrom: 6500 },
} as const

/** 2200 → «2 200 ₽» (пробелы неразрывные) */
export const rub = (n: number) => `${n.toLocaleString('ru-RU')}${NBSP}₽`

/** «4 октября 2026 г.» */
export const PRICES_DATE_LABEL = new Date(PRICES_DATE)
  .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** «от двух дверей» — числительное в родительном падеже */
const GENITIVE: Record<number, string> = { 2: 'двух', 3: 'трёх', 4: 'четырёх', 5: 'пяти' }
const REFUND_FROM = `от${NBSP}${GENITIVE[SERVICES.measure.refundFrom]} дверей`

/** Готовые фразы для текстов */
export const MEASURE_REFUND = `Вернём при заказе ${REFUND_FROM}`
export const MEASURE_TERMS  = `Замер стоит ${rub(SERVICES.measure.price)}, эту сумму вернём при заказе ${REFUND_FROM}`
export const INSTALL_TERMS  = `Установка одной двери — от${NBSP}${rub(SERVICES.install.priceFrom)}`
