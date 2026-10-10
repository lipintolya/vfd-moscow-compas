/* Переменные статей — данные салона и каталога, которые нельзя вписывать
   в текст руками: адрес, часы, телефон, цены скрытых дверей, условия
   замера и монтажа. Меняются здесь (точнее — в своих источниках) и сразу
   во всех статьях.

   В тексте статьи — {% $salon.address %}, {% $hidden.kitFrom %} …
   (markdoc.config.ts). Во фронтматтере (description, summary, faq) —
   та же запись: её подставляет fillArticleVars при выводе
   (src/lib/articles.ts), Markdoc фронтматтер не обрабатывает. */
import { SITE, PHONE } from '../config/site'
import { companyLegalInfo } from './contacts-data'
import { MEASURE_TERMS, INSTALL_TERMS, rub } from '../data/services'
import {
  DOOR_HEIGHT, SECRET_SIZES, SECRET_REVERS_SIZES, CUSTOM_MAX_HEIGHT, REFLEX_MAX_HEIGHT,
  CUSTOM_LEAD_TIME, SECRET_MIN_KIT_PRICE, SECRET_MIN_BLADE_PRICE, SECRET_REVERS_MIN_KIT_PRICE,
  REFLEX_MIN_KIT_PRICE, HIDDEN_SPECS,
} from '../data/skrytye-dveri-products'

export const ARTICLE_VARS = {
  salon: {
    name:    SITE.studioName,
    brand:   SITE.name,
    city:    SITE.city.in,
    mall:    SITE.address.mall,
    address: SITE.address.full,
    hours:   companyLegalInfo.workingHours.shortDisplay,
    phone:   PHONE.label,
    /** «официальный дилер Владимирской фабрики дверей» */
    dealer:  `официальный дилер ${SITE.manufacturerOf}`,
  },
  /** Скрытые двери — src/data/skrytye-dveri-products.ts */
  hidden: {
    /** Комплект «Секрет» (полотно + короб + петли), «от» */
    kitFrom:        rub(SECRET_MIN_KIT_PRICE),
    /** Полотно «Секрет», «от» */
    bladeFrom:      rub(SECRET_MIN_BLADE_PRICE),
    reversKitFrom:  rub(SECRET_REVERS_MIN_KIT_PRICE),
    reflexKitFrom:  rub(REFLEX_MIN_KIT_PRICE),
    /** Стандартная высота, мм */
    height:         String(DOOR_HEIGHT),
    /** Максимальная высота под заказ, мм */
    maxHeight:      String(CUSTOM_MAX_HEIGHT),
    reflexMaxHeight: String(REFLEX_MAX_HEIGHT),
    leadTime:       nb(CUSTOM_LEAD_TIME),
    /** «600, 700, 800 и 900» */
    widths:         listRu(SECRET_SIZES.map(String)),
    reversWidths:   listRu(SECRET_REVERS_SIZES.map(String)),
    /** Зазор между полотном и стеной, «1–2 мм» */
    gap:            nb(HIDDEN_SPECS.gap),
    /** Минимальная толщина стены, «90 мм» */
    wallMin:        nb(HIDDEN_SPECS.wallMin),
    /** Нагрузка на скрытые петли, «70 кг» */
    hingeLoad:      nb(HIDDEN_SPECS.hingeLoad),
    paintCoats:     nb(HIDDEN_SPECS.paintCoats),
    installDays:    nb(HIDDEN_SPECS.installDays),
    boxProfile:     nb(HIDDEN_SPECS.boxProfile),
  },
  /** Замер и установка — src/data/services.ts */
  services: {
    /** «Замер стоит 2 200 ₽, эту сумму вернём при заказе от двух дверей» */
    measure: MEASURE_TERMS,
    /** «Установка одной двери — от 6 500 ₽» */
    install: INSTALL_TERMS,
  },
}

/** Пробелы — неразрывные: число не отрывается от единицы («70 кг») */
function nb(text: string): string {
  return text.replace(/ /g, '\u00a0')
}

function listRu(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} и ${items.at(-1)}` : items.join('')
}

/** Подставляет {% $путь.к.значению %} в строку фронтматтера. Неизвестная
    переменная — ошибка сборки: опечатка не должна уйти на сайт. */
export function fillArticleVars(text: string): string {
  return text.replace(/\{%\s*\$([\w.]+)\s*%\}/g, (_, path: string) => {
    const value = path.split('.').reduce<unknown>(
      (obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined),
      ARTICLE_VARS,
    )
    if (typeof value !== 'string') throw new Error(`Статья: нет переменной $${path}`)
    return value
  })
}
