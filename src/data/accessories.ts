/**
 * src/data/accessories.ts
 *
 * Погонажные изделия по типу покрытия — с ценами (РРЦ) для расчёта
 * стоимости комплекта (коробка + наличники) поверх цены полотна.
 *
 * КАК ДОБАВИТЬ ИЗДЕЛИЕ:
 *   Найди нужный ключ покрытия (pet | emal | emalex) в accessoriesByCoating
 *   и добавь объект: { name: 'Название 0000×00×0', category: 'box', unit: 'шт', price: 0 }
 *   Если цена ещё не известна — price: null (на странице покажется «Цена уточняется»).
 *
 * Категории:
 *   kit        — Базовый комплект погонажа (см. BASE_KIT_DESCRIPTION; используется
 *                для расчёта итоговой цены «под ключ» на странице товара — см. calcKitPrice)
 *   box        — Дверной короб
 *   nalichnik  — Наличники
 *   kapitel    — Капители
 *   dobor      — Доборы
 *   plinth     — Плинтус
 *   decorative — Декоративные элементы
 *
 * НАДБАВКА ЗА ЦВЕТ (COLOR_SURCHARGE):
 *   Ключ — colors.name из Supabase, значение — доля надбавки (0.05 = +5%).
 *   Цвета, не упомянутые в COLOR_SURCHARGE, считаются базовыми (0%).
 *   Действует ТОЛЬКО на цену комплекта (коробка+наличники), не на цену полотна —
 *   цена полотна приходит из model_colors.price_rrp и уже учитывает цвет.
 *
 * ПЛИНТУС:
 *   Цены и размеры не дублируются здесь вручную — берутся из PLINTUS_ROWS
 *   (src/data/decor-products.ts, та же таблица, что на странице /catalog/decor),
 *   чтобы цифры на карточке товара и на странице декора никогда не расходились.
 */

import { PLINTUS_ROWS, type Material as PlintusMaterial } from './decor-products'

export type AccessoryCategory = 'kit' | 'box' | 'nalichnik' | 'kapitel' | 'dobor' | 'plinth' | 'decorative'

export const CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  kit:        'Базовый комплект погонажа',
  box:        'Дверной короб',
  nalichnik:  'Наличники',
  kapitel:    'Капители',
  dobor:      'Доборы',
  plinth:     'Плинтус',
  decorative: 'Декоративные элементы',
}

/** Пояснение под списком категории — пока используется только для плинтуса
    (продаётся по штукам-планкам, но меряется в погонных метрах, порядок
    расчёта неочевиден без объяснения). */
export const CATEGORY_NOTES: Partial<Record<AccessoryCategory, string>> = {
  plinth:
    'Цена — за штуку (планка 2140 мм), но подбирается по погонным метрам. ' +
    'Порядок расчёта: Периметр — измерьте рулеткой длину каждой стены и сложите их вместе. ' +
    'Проёмы — измерьте ширину дверей и арок, где плинтус не нужен, и отнимите эту сумму от периметра. ' +
    'Запас — прибавьте 5% для ровных комнат или 10% для помещений со сложной формой, выступами и углами. ' +
    'Штуки — разделите итоговую длину на длину одной планки (2140 мм).',
}

export interface Accessory {
  name:     string
  category: AccessoryCategory
  unit:     'шт' | 'комплект'
  price:    number | null
  /** Фото изделия — опционально, заполняется по мере поступления от производителя. */
  image?:   string
  /** Схема с размерами — опционально, тот же принцип, что и image. */
  scheme?:  string
  /** Пропорция блока фото/схемы ('ширина / высота') — по фото изделия.
      Не указана → '2 / 1'. Картинки вписываются без обрезки (contain). */
  mediaAspect?: string
}

export type CoatingSlug = 'pet' | 'emal' | 'emalex' | 'protach' | 'ekoshpon'

// ─────────────────────────────────────────────────────────────────────────────
// Базовый комплект погонажа — цена для базового цвета покрытия. Используется
// и как отдельная позиция в таблице ниже, и в расчёте calcKitPrice().
// BASE_KIT_DESCRIPTION — единственное место с формулировкой состава комплекта,
// чтобы текст на карточке товара и в таблице цен не расходился.
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_KIT_PRICE: Record<CoatingSlug, number> = {
  pet:      5_387,
  emal:     6_384,
  emalex:   5_145,
  protach:  3_840,
  ekoshpon: 5_150,
}
export const BASE_KIT_DESCRIPTION = 'дверной короб 2,5 шт, наличники с обеих сторон 5 шт'

// Дата последней проверки/правки цен на этой странице — обновляй вручную при правке прайса
export const PRICE_LIST_UPDATED = '03.08.2026'

// ─────────────────────────────────────────────────────────────────────────────
// Надбавка к цене комплекта за цвет (ключ — colors.name из Supabase)
// ─────────────────────────────────────────────────────────────────────────────
export const COLOR_SURCHARGE: Record<string, number> = {
  // ПЭТ — база: «Шёлковый белый»
  'Шёлковый бежевый': 0.20,
  'Шёлковый графит':  0.20,
  'Шёлковый индиго':  0.20,
  'Шёлковый муссон':  0.20,
  // Эмаль — база: «Эмаль белая»
  'Эмаль магнолия':       0.05,
  'Эмаль мокко':          0.05,
  'Эмаль слоновая кость': 0.05,
  'Эмаль серебро':        0.05,
  'Эмаль серая':          0.05,
  'Эмаль графит':         0.10,
  // Эмалекс — без надбавок (ключи не указываются, fallback = 0)
}

/** Цена комплекта (коробка + наличники) для конкретного цвета двери. */
export function calcKitPrice(coatingSlug: string, colorName: string): number {
  const base = BASE_KIT_PRICE[coatingSlug as CoatingSlug] ?? 0
  const surcharge = COLOR_SURCHARGE[colorName] ?? 0
  return Math.ceil(base * (1 + surcharge))
}

/** Строки PLINTUS_ROWS под конкретный материал → позиции для accessoriesByCoating. */
function plinthAccessories(material: PlintusMaterial): Accessory[] {
  return PLINTUS_ROWS
    .filter(row => row.prices[material] != null)
    .map(row => ({
      name:     row.size ? `${row.name} ${row.size.replace(/×/g, 'х')}` : row.name,
      category: 'plinth',
      unit:     'шт',
      price:    row.prices[material]!,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Погонажные изделия — ключ = coating slug из Supabase
// ─────────────────────────────────────────────────────────────────────────────
export const accessoriesByCoating: Record<CoatingSlug, Accessory[]> = {

  // ── ПЭТ (Иннова) ─────────────────────────────────────────────────────────
  pet: [
    { name: `Комплект погонажа (${BASE_KIT_DESCRIPTION})`,       category: 'kit',        unit: 'комплект', price: BASE_KIT_PRICE.pet },

    {
      name: 'Коробка КБТ№43П 80х32х2100', category: 'box', unit: 'шт', price: 956,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_new.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_shema_new.webp',
    },
    { name: 'Коробка КБТ№46П 80х38х2100',                        category: 'box',        unit: 'шт',       price: 1_134 },
    {
      name: 'К-т коробки КБКМ№43П 80х32х2100 компланар', category: 'box', unit: 'комплект', price: 2_384,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl_shema.webp',
      mediaAspect: '2 / 1',
    },

    {
      name: 'Наличник НТ№22 70х8х2140', category: 'nalichnik', unit: 'шт', price: 599,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8_shema.webp',
    },
    {
      name: 'Наличник НТ№35 85х16х2140 «Каскад»', category: 'nalichnik', unit: 'шт', price: 830,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad_shema.webp',
      mediaAspect: '2.35 / 1',
    },
    {
      name: 'Наличник НТ№36 80х22х2140 «Нео1»', category: 'nalichnik', unit: 'шт', price: 956,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1_shema.webp',
    },
    {
      name: 'Наличник НТ№37 80х22х2140 «Нео2»', category: 'nalichnik', unit: 'шт', price: 956,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2_shema.webp',
    },
    {
      name: 'К-т наличника КН№01 90х10х2140 компланарный', category: 'nalichnik', unit: 'комплект', price: 1_743,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl_shema.webp',
      mediaAspect: '3.2 / 1',
    },

    {
      name: 'Добор ДПТ№2 100х10х2070', category: 'dobor', unit: 'шт', price: 746,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10_shema.webp',
      mediaAspect: '3.4 / 1',
    },
    { name: 'Добор ДПТ№2 150х10х2070',                           category: 'dobor',      unit: 'шт',       price: 987 },
    { name: 'Добор ДПТ№2 200х10х2070',                           category: 'dobor',      unit: 'шт',       price: 1_176 },
    { name: 'Соединитель для доборов 35х4х2100',                 category: 'dobor',      unit: 'шт',       price: 53 },

    { name: 'Притворная планка 30х10х2100',                      category: 'decorative', unit: 'шт',       price: null },
  ],

  // ── Эмаль ────────────────────────────────────────────────────────────────
  emal: [
    { name: `Комплект погонажа (${BASE_KIT_DESCRIPTION})`,               category: 'kit',        unit: 'комплект', price: BASE_KIT_PRICE.emal },

    {
      name: 'Коробка КБТ№43П 80х32х2100', category: 'box', unit: 'шт', price: 1_208,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_new.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_shema_new.webp',
    },
    { name: 'Коробка КБТ№43П 80х32х2100 + запил под скрытые петли HH24 Morelli', category: 'box', unit: 'шт',      price: 1_365 },
    { name: 'Комплект коробки КБТ№46П 80×38×2100 (с запилом под скрытые петли HH24 Morelli, 2,5 шт)', category: 'box', unit: 'комплект', price: 3_176 },
    {
      name: 'Комплект коробки КБКМ№02/39 75×38×2100 компланарный (2,5 шт)', category: 'box', unit: 'комплект', price: 3_623,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl_shema.webp',
      mediaAspect: '2 / 1',
    },

    {
      name: 'Наличник НТ№22 70х8х2140', category: 'nalichnik', unit: 'шт', price: 672,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8_shema.webp',
    },
    { name: 'Наличник НТ№25 100х8х2200',                                 category: 'nalichnik',  unit: 'шт',       price: 935 },
    { name: 'Наличник НТ№13 80х8х2140, 3 ручья',                        category: 'nalichnik',  unit: 'шт',       price: 977 },
    {
      name: 'Наличник НТ№34 80х12х2140 «Антик»', category: 'nalichnik', unit: 'шт', price: 935,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_antik.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_antik_shema.webp',
      mediaAspect: '2.3 / 1',
    },
    {
      name: 'Наличник НТ№35 85х16х2140 «Каскад»', category: 'nalichnik', unit: 'шт', price: 935,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad_shema.webp',
      mediaAspect: '2.35 / 1',
    },
    {
      name: 'Наличник НТ№36 80х22х2140 «Нео 1»', category: 'nalichnik', unit: 'шт', price: 1_082,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1_shema.webp',
    },
    {
      name: 'Наличник НТ№37 80х22х2140 «Нео 2»', category: 'nalichnik', unit: 'шт', price: 1_082,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2_shema.webp',
    },
    {
      name: 'Комплект наличника КН№01 90×10×2140 компланарный (5 шт)', category: 'nalichnik', unit: 'комплект', price: 3_938,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl_shema.webp',
      mediaAspect: '3.2 / 1',
    },

    {
      name: 'Добор ДПТ100№2 100х10х2070', category: 'dobor', unit: 'шт', price: 1_082,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10_shema.webp',
      mediaAspect: '3.4 / 1',
    },
    { name: 'Добор ДПТ150№2 150х10х2070',                                category: 'dobor',      unit: 'шт',       price: 1_355 },
    { name: 'Добор ДПТ200№2 200х10х2070',                                category: 'dobor',      unit: 'шт',       price: 1_617 },
    { name: 'Соединитель для доборов 35х4х2100',                        category: 'dobor',      unit: 'шт',       price: 53 },

    { name: 'Капитель 0,6 / 0,7 / 0,8 / 0,9',                            category: 'kapitel',    unit: 'шт',       price: 3_024 },
    { name: 'Капитель 1,2',                                              category: 'kapitel',    unit: 'шт',       price: 4_547 },

    { name: 'Квадрат d35 85×22×85',                                      category: 'decorative', unit: 'шт',       price: 347 },
    { name: 'Банкетка d35 85×22×160',                                    category: 'decorative', unit: 'шт',       price: 483 },
    { name: 'Притворная планка 30х10х2100',                              category: 'decorative', unit: 'шт',       price: 599 },

    ...plinthAccessories('emal'),
  ],

  // ── Эмалекс ──────────────────────────────────────────────────────────────
  emalex: [
    { name: `Комплект погонажа (${BASE_KIT_DESCRIPTION})`,               category: 'kit',        unit: 'комплект', price: BASE_KIT_PRICE.emalex },

    {
      name: 'Коробка КБТ№43П 80х32х2100', category: 'box', unit: 'шт', price: 924,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_new.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_shema_new.webp',
    },
    { name: 'Коробка КБТ№43П 80х32х2100 с запилом под скрытые петли (2 шт, HH24 Morelli)', category: 'box', unit: 'шт', price: 1_082 },
    { name: 'Комплект коробки КБТ№43П 80×32×2100 под скрытые петли (2 шт, HH24 Morelli, 2,5 шт)', category: 'box', unit: 'комплект', price: 2_468 },
    { name: 'Комплект коробки КБТ№46П 80×38×2100 под скрытые петли (2 шт, HH24 Morelli, 2,5 шт)', category: 'box', unit: 'комплект', price: 3_465 },
    {
      name: 'Комплект коробки КБКМ№02/41 75×38×2100 компланарный (2,5 шт)', category: 'box', unit: 'комплект', price: 2_898,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/kkompl_shema.webp',
      mediaAspect: '2 / 1',
    },

    {
      name: 'Наличник НТ№22 70х8х2140', category: 'nalichnik', unit: 'шт', price: 567,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8_shema.webp',
    },
    { name: 'Наличник НТ№25 100х8х2200',                                 category: 'nalichnik',  unit: 'шт',       price: 788 },
    {
      name: 'Наличник НТ№24 80х16х2140 «Фигурный»', category: 'nalichnik', unit: 'шт', price: 835,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_nt24.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_nt24_shema.webp',
      mediaAspect: '2.5 / 1',
    },
    {
      name: 'Наличник НТ№34 80х12х2140 «Антик»', category: 'nalichnik', unit: 'шт', price: 767,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_antik.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_antik_shema.webp',
      mediaAspect: '2.3 / 1',
    },
    {
      name: 'Наличник НТ№35 85х16х2140 «Каскад»', category: 'nalichnik', unit: 'шт', price: 788,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_kaskad_shema.webp',
      mediaAspect: '2.35 / 1',
    },
    {
      name: 'Наличник НТ№36 80х22х2140 «Нео 1»', category: 'nalichnik', unit: 'шт', price: 882,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_1_shema.webp',
    },
    {
      name: 'Наличник НТ№37 80х22х2140 «Нео 2»', category: 'nalichnik', unit: 'шт', price: 882,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_figurniy_neo_2_shema.webp',
    },
    {
      name: 'Комплект наличника КН№01 90×10×2140 компланарный (5 шт)', category: 'nalichnik', unit: 'комплект', price: 1_838,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nkompl_shema.webp',
      mediaAspect: '3.2 / 1',
    },

    {
      name: 'Добор ДПТ100№2 100х10х2070', category: 'dobor', unit: 'шт', price: 672,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10_shema.webp',
      mediaAspect: '3.4 / 1',
    },
    { name: 'Добор ДПТ150№2 150х10х2070',                                category: 'dobor',      unit: 'шт',       price: 882 },
    { name: 'Добор ДПТ200№2 200х10х2070',                                category: 'dobor',      unit: 'шт',       price: 1_082 },
    { name: 'Добор ДПТ300№2 300х10х2070',                                category: 'dobor',      unit: 'шт',       price: 2_237 },
    { name: 'Добор ДПТ390№2 390х10х2070',                                category: 'dobor',      unit: 'шт',       price: 2_520 },
    { name: 'Соединитель для доборов 35х4х2100',                        category: 'dobor',      unit: 'шт',       price: 53 },

    ...plinthAccessories('emalex'),
  ],

  // ── Протач (Смарт/Некст) ─────────────────────────────────────────────────
  protach: [
    { name: `Комплект погонажа (${BASE_KIT_DESCRIPTION})`,               category: 'kit',        unit: 'комплект', price: BASE_KIT_PRICE.protach },

    {
      name: 'Коробка КБТ№43П 80х32х2100', category: 'box', unit: 'шт', price: 700,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_new.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/korobochniy_brus_t_2100h80h32_shema_new.webp',
    },

    {
      name: 'Наличник НТ№22 70х8х2140', category: 'nalichnik', unit: 'шт', price: 420,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/nalichnik_t_2140h70h8_shema.webp',
    },

    {
      name: 'Добор ДПТ100№2 100х10х2070', category: 'dobor', unit: 'шт', price: 510,
      image:  'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10.webp',
      scheme: 'https://storage.yandexcloud.net/vfd74ru/pogonaz/emalex/dobor_t_2130h100h10_shema.webp',
      mediaAspect: '3.4 / 1',
    },
    { name: 'Добор ДПТ150№2 150х10х2070',                                category: 'dobor',      unit: 'шт',       price: 650 },
    { name: 'Добор ДПТ200№2 200х10х2070',                                category: 'dobor',      unit: 'шт',       price: 780 },
  ],

  // ── Экошпон (Урбан Древесный) — исходные цены даны за компл. 2,5 шт,
  // не пересчитывались на 1 шт (риск ошибки округления), это отражено в name.
  ekoshpon: [
    { name: `Комплект погонажа (${BASE_KIT_DESCRIPTION})`,                        category: 'kit',        unit: 'комплект', price: BASE_KIT_PRICE.ekoshpon },

    { name: 'Коробка КБТ№43П 80х32х2100 (компл. 2,5 шт)',                          category: 'box',        unit: 'комплект', price: 2_510 },
    { name: 'Комплект коробки КБКМ№02/41 75х38х2100 компланарный (компл. 2,5 шт)', category: 'box',        unit: 'комплект', price: 3_890 },

    { name: 'Наличник НТ№22 70х8х2140 (компл. 2,5 шт)',                            category: 'nalichnik',  unit: 'комплект', price: 1_320 },
    { name: 'Комплект наличника КН№01 90х10х2140 компланарный (компл. 2,5 шт)',    category: 'nalichnik',  unit: 'комплект', price: 2_210 },

    { name: 'Комплект компланарного погонажа реверс (ЗПСП 2 шт, AGB 2.0), кор. 2,5 шт + нал. 2,5 шт, под заказ', category: 'decorative', unit: 'комплект', price: 7_020 },

    { name: 'Добор ДПТ№2 100х10х2070 (компл. 2,5 шт)', category: 'dobor', unit: 'комплект', price: 1_970 },
    { name: 'Добор ДПТ№2 150х10х2070 (компл. 2,5 шт)', category: 'dobor', unit: 'комплект', price: 2_570 },
    { name: 'Добор ДПТ№2 200х10х2070 (компл. 2,5 шт)', category: 'dobor', unit: 'комплект', price: 3_030 },
    { name: 'Добор ДПТ№2 300х10х2070 (компл. 2,5 шт)', category: 'dobor', unit: 'комплект', price: 5_160 },
    { name: 'Соединитель для доборов 35х4х2100',        category: 'dobor', unit: 'шт',       price: 50 },
  ],
}
