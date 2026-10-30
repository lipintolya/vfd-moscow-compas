/* Переменные статей — данные салона и каталога, которые нельзя вписывать
   в текст руками: адрес, часы, телефон, цены скрытых дверей, условия
   замера и монтажа. Меняются здесь (точнее — в своих источниках) и сразу
   во всех статьях.

   В статьях (Strapi) — подстановки {адрес салона}, {цена комплекта
   Секрет} …: имена — src/data/article-substitutions.ts, значения — отсюда
   (articleVar); заполняет src/lib/article-substitutions.ts. */
import { SITE, PHONE } from '../config/site'
import { companyLegalInfo } from './contacts-data'
import { listRu } from './typograph'
import { MEASURE_TERMS, INSTALL_TERMS, rub } from '../data/services'
import {
  DOOR_HEIGHT, SECRET_SIZES, SECRET_REVERS_SIZES, CUSTOM_MAX_HEIGHT, REFLEX_MAX_HEIGHT,
  CUSTOM_LEAD_TIME, SECRET_MIN_KIT_PRICE, SECRET_MIN_BLADE_PRICE, SECRET_REVERS_MIN_KIT_PRICE,
  REFLEX_MIN_KIT_PRICE, HIDDEN_SPECS, SECRET_STOCK_HEIGHTS, heightTier, calcCustomPrice,
} from '../data/skrytye-dveri-products'
import { FRAMUGA_ROWS, FROM_PRICE_FRAMUGA_KIT } from '../data/decor-products'
import { DOOR_SIZES } from '../data/door-sizes'
import { ENTRANCE_DOORS, ENTRANCE_MIN_PRICE } from '../data/entrance-doors'
import { pluralRu } from './plural'

const ENTRANCE_STEELS = ENTRANCE_DOORS.map((d) => d.steel)
const ENTRANCE_STEEL = [...new Set(ENTRANCE_STEELS)].sort((a, b) => Number(a.replace(',', '.')) - Number(b.replace(',', '.'))).filter((v, i, all) => i === 0 || i === all.length - 1)
const THERMO_COUNT = ENTRANCE_DOORS.filter((d) => d.specs.some((x) => x.label === 'Терморазрыв')).length

/* Скрытая дверь 2300 мм — самый частый нестандартный запрос: цена и
   надбавка — по ступени из таблицы надбавок */
const TIER_2300 = heightTier(2300)!

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
    /** Высоты на складе: «2000, 2100 и 2300» */
    stockHeights:   listRu(SECRET_STOCK_HEIGHTS.map(String)),
    /** Комплект «Секрет» высотой 2300 мм, «от» */
    kit2300From:    rub(calcCustomPrice(SECRET_MIN_KIT_PRICE, TIER_2300.surcharge)),
    /** Надбавка за 2300 мм, «+30%» */
    surcharge2300:  TIER_2300.pct,
  },
  /** Двери каталога — src/data/door-sizes.ts */
  doors: {
    height:    String(DOOR_SIZES.standardHeight),
    /** Высота под заказ — до, мм */
    maxHeight: String(DOOR_SIZES.customMaxHeight),
  },
  /** Входные двери — src/data/entrance-doors.ts (каталог партнёра, цены «от») */
  entrance: {
    /** «57 моделей» */
    models:    `${ENTRANCE_DOORS.length} ${pluralRu(ENTRANCE_DOORS.length, ['модель', 'модели', 'моделей'])}`,
    /** Самая низкая цена в каталоге, «от» */
    priceFrom: rub(ENTRANCE_MIN_PRICE),
    /** «1,5–1,8 мм» — толщина стали полотна */
    steel:     nb(`${ENTRANCE_STEEL.join('–')} мм`),
    /** Сколько моделей с терморазрывом, «26 моделей» */
    thermo:    `${THERMO_COUNT} ${pluralRu(THERMO_COUNT, ['модель', 'модели', 'моделей'])}`,
    /** «960×2050, 880×2050» — размеры полотна, мм */
    sizes:     nb(`${ENTRANCE_DOORS[0]!.sizes} мм`),
  },
  /** Декор — src/data/decor-products.ts */
  decor: {
    /** Комплект фальшфрамуги (фрамуга, компланарная коробка, наличники), «от» */
    framugaKitFrom: rub(FROM_PRICE_FRAMUGA_KIT),
    /** «930×930×10 мм» */
    framugaSize:    nb(`${FRAMUGA_ROWS[0]!.size} мм`),
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


/** Значение переменной статей по пути 'salon.address'; нет такой — undefined */
export function articleVar(path: string): string | undefined {
  const value = path.split('.').reduce<unknown>(
    (obj, key) => (obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined),
    ARTICLE_VARS,
  )
  return typeof value === 'string' ? value : undefined
}
