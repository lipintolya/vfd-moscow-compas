/**
 * Группы цветов для фильтра каталога. Названия цветов в базе привязаны к
 * покрытию («Белый» у Протача, «Эмалекс белый», «Эмаль белая») — фильтр по
 * точному названию находил только часть белых дверей. Фильтр работает по
 * группам: «Белые» — все белые, какое бы ни было покрытие.
 *
 * Группа определяется по словам в названии цвета (новый «Эмалекс белый
 * матовый» сам попадёт в белые), древесные делятся на светлые и тёмные
 * по тону (hex из базы). Цвет без подходящих слов — в «Другие», не теряется.
 * Тест tests/color-families.test.ts проверяет все цвета, что сейчас в базе.
 */
import { hexLightness } from '../lib/color-lightness'

export type ColorFamilySlug =
  | 'white' | 'milky' | 'beige' | 'grey' | 'graphite' | 'brown' | 'colored'
  | 'wood-light' | 'wood-dark' | 'other'

export interface ColorFamily {
  slug: ColorFamilySlug
  label: string
  /** Подзаголовок в фильтре: однотонные / под дерево */
  group: 'Однотонные' | 'Древесные'
}

/** Порядок — как в фильтре */
export const COLOR_FAMILIES: readonly ColorFamily[] = [
  { slug: 'white',      label: 'Белые',           group: 'Однотонные' },
  { slug: 'milky',      label: 'Молочные',        group: 'Однотонные' },
  { slug: 'beige',      label: 'Бежевые',         group: 'Однотонные' },
  { slug: 'grey',       label: 'Серые',           group: 'Однотонные' },
  { slug: 'graphite',   label: 'Графит',          group: 'Однотонные' },
  { slug: 'brown',      label: 'Мокко и шоколад', group: 'Однотонные' },
  { slug: 'colored',    label: 'Цветные',         group: 'Однотонные' },
  { slug: 'other',      label: 'Другие',          group: 'Однотонные' },
  { slug: 'wood-light', label: 'Светлое дерево',  group: 'Древесные' },
  { slug: 'wood-dark',  label: 'Тёмное дерево',   group: 'Древесные' },
]

/* Слова в названии цвета → группа. Порядок важен: «тёмно-бежевый» —
   бежевый, а не белый; «серебро» — серый. */
const WOOD_WORDS = ['шервуд', 'пекан', 'дуб', 'орех', 'ясень', 'шпон']
const RULES: [ColorFamilySlug, string[]][] = [
  ['graphite', ['графит', 'антрацит']],
  ['milky',    ['молочн', 'магнол', 'слонов', 'крем']],
  ['beige',    ['беж']],
  ['white',    ['бел']],
  ['grey',     ['сер', 'муссон']],
  ['brown',    ['мокко', 'шоколад', 'кофе', 'коричн']],
  ['colored',  ['индиго', 'голуб', 'зелён', 'зелен', 'син', 'олив']],
]
/** Светлее этого тона — «светлое дерево» (ванильный, солярис), темнее — «тёмное» */
const WOOD_LIGHT_FROM = 0.55

export function colorFamily(name: string, hex?: string | null): ColorFamilySlug {
  const n = name.toLowerCase()
  if (WOOD_WORDS.some((w) => n.includes(w))) return hexLightness(hex) >= WOOD_LIGHT_FROM ? 'wood-light' : 'wood-dark'
  return RULES.find(([, words]) => words.some((w) => n.includes(w)))?.[0] ?? 'other'
}
