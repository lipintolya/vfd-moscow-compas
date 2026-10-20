/**
 * src/lib/product-text.ts
 *
 * Название и описание двери каталога — для title, H1, Product schema и
 * товарного фида. Всё из одних данных, чтобы страница и фид называли дверь
 * одинаково.
 *
 * Название — по правилам Яндекс Товаров для <name>: тип товара + [бренд] +
 * модель + отличительные признаки, без «купить», города и цены:
 * «Межкомнатная дверь Скинель Барселона 1, эмаль, кромка серебро».
 * «Купить в Москве» добавляется только в <title> страницы.
 */
import type { ModelEntry } from './model-entries'
import { brandTitle } from './seo-title'
import { SITE } from '../config/site'
import { describeTrim, lowerFirst } from './trim-labels'
import { getSeriesSpec } from '../data/series-descriptions'

export const DOOR_TYPE = 'Межкомнатная дверь'
export const BRAND     = 'ВФД'

type NamingInput = Pick<ModelEntry, 'seriesName' | 'coatingName' | 'coatingSlug'> & {
  model: Pick<ModelEntry['model'], 'name' | 'trim'>
}

/* Латинские буквы, неотличимые на глаз от кириллических. */
const LATIN_TO_CYRILLIC: Record<string, string> = {
  A: 'А', B: 'В', C: 'С', E: 'Е', H: 'Н', K: 'К', M: 'М', O: 'О', P: 'Р', T: 'Т', X: 'Х', Y: 'У',
  a: 'а', c: 'с', e: 'е', o: 'о', p: 'р', x: 'х', y: 'у',
}

/**
 * Имя модели из БД для показа. Схлопывает лишние пробелы (в БД есть имена
 * с хвостовым пробелом) и чинит слова, где латинская буква затесалась
 * в кириллическое слово («Cатин» с латинской C) — поисковик считает такое
 * слово другим. Коды целиком на латинице («E1», «02CT») не трогаем: без
 * кириллицы в слове нельзя утверждать, что это опечатка.
 * На URL не влияет — слаг строится из сырого имени (slugify.ts).
 */
export function cleanModelName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word =>
      /[а-яё]/i.test(word) && /[a-z]/i.test(word)
        ? word.replace(/[a-z]/gi, ch => LATIN_TO_CYRILLIC[ch] ?? ch)
        : word,
    )
    .join(' ')
}

/* Для сравнения слов: регистр, ё/е и э/е («Бэйсик» = «Бейсик»). */
const normWords = (s: string) =>
  s.toLowerCase().replaceAll('ё', 'е').replaceAll('э', 'е').split(/\s+/).filter(Boolean)

/** Все слова needle есть в haystack (без учёта регистра, ё/е, э/е). */
export const hasWords = (haystack: string, needle: string) => {
  const words = new Set(normWords(haystack))
  const wanted = normWords(needle)
  return wanted.length > 0 && wanted.every(w => words.has(w))
}

/**
 * Модель с серией: «Барселона 1» из серии Скинель → «Скинель Барселона 1»
 * (так её и ищут), «Иннова 01С» остаётся как есть. Проверяется первое слово
 * серии: «Урбан ЗТ» уже называет серию «Урбан Древесный».
 */
export function productHeadline(m: NamingInput): string {
  const name   = cleanModelName(m.model.name)
  const series = m.seriesName.trim()
  if (!series) return name
  return hasWords(name, series.split(/\s+/)[0]!) ? name : `${series} ${name}`
}

/* Нарицательные покрытия внутри фразы — строчными («эмаль»), торговые
   марки и аббревиатуры — как в базе (Эмалекс, Протач, ПЭТ). */
const COMMON_NOUN_COATINGS = new Set(['emal', 'ekoshpon'])

export const coatingInline = (m: Pick<ModelEntry, 'coatingName' | 'coatingSlug'>) =>
  COMMON_NOUN_COATINGS.has(m.coatingSlug) ? m.coatingName.toLowerCase() : m.coatingName

/**
 * «Межкомнатная дверь [ВФД] Скинель Барселона 1, эмаль, кромка серебро».
 * Покрытие пропускается, если уже звучит в названии («Эмалекс ЕР1»).
 * Кромка/остекление — единственное, чем различаются некоторые SKU
 * (4 «Урбан 1» с разной кромкой): без неё названия совпали бы.
 */
export function productName(m: NamingInput, opts: { withBrand?: boolean } = {}): string {
  const headline = productHeadline(m)
  const coating  = m.coatingName && !hasWords(headline, m.coatingName) ? coatingInline(m) : ''
  const trim     = describeTrim(m.model.trim)?.phrase ?? ''
  const head     = [DOOR_TYPE, opts.withBrand ? BRAND : '', headline].filter(Boolean).join(' ')
  return [head, coating, trim].filter(Boolean).join(', ')
}

export { pluralRu } from './plural'

const formatRub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

/** «от 12 422 ₽» — «от» только когда цена у цветов модели действительно разная. */
export function priceLabel(m: Pick<ModelEntry, 'minPrice' | 'maxPrice'>): string {
  if (!m.minPrice) return ''
  return `${m.maxPrice && m.maxPrice > m.minPrice ? 'от ' : ''}${formatRub(m.minPrice)}`
}

/** Длина заголовка в поиске: показываем до ~70 знаков, дальше — «…».
    Салон и «| Студия Зизевского» дописываются к базе, поэтому база короче. */
export const TITLE_MAX = 75
export const DESCRIPTION_MAX = 158

/**
 * Фраза из обязательной головы и необязательных частей по порядку: часть
 * добавляется, только если вся фраза уместилась в max. Так заголовок
 * не обрывается посреди слова, а важное (модель, бренд) остаётся всегда.
 */
export function fitPhrase(head: string, optional: [string, string][], max: number): string {
  let out = head
  for (const [part, sep] of optional) {
    if (!part) continue
    const next = `${out}${sep}${part}`
    if (next.length <= max) out = next
  }
  return out
}

/** Признаки модели для заголовка и описания — по приоритету: кромка или
    остекление (отличает SKU с одинаковым названием), покрытие, город. */
function modelAttributes(m: NamingInput, withCity: boolean): [string, string][] {
  const trim = describeTrim(m.model.trim)?.phrase ?? ''
  const coating = m.coatingName && !hasWords(productHeadline(m), m.coatingName) ? coatingInline(m) : ''
  return [
    [trim, ', '],
    [coating, ', '],
    ...(withCity ? [['в Москве', ' '] as [string, string]] : []),
  ]
}

/* «Межкомнатная дверь ВФД Эмалекс ЕС2, кромка серебро, в Москве | Студия Зизевского»:
   тип, бренд и кромка/остекление — всегда (кромка отличает модели с одним
   названием; без неё страницы получают одинаковые заголовки). Покрытие и
   город — по остатку длины. */
/* Короткая форма кромки для заголовка, когда полная не влезает: длинное
   описание («английская решётка, стекло сатин белый», «кромка золотая с
   молдингом») — у нескольких моделей. Кромка остаётся (по ней отличаются
   SKU), уходит описание: «стекло сатин белый», «кромка золотая». Проверка
   уникальности заголовков по всем моделям — в tests/seo-title.test.ts
   (на собранном сайте — npm run build + проверка дублей). */
export function compactTrim(trim: string): string {
  if (trim.includes(', ')) return trim.slice(trim.lastIndexOf(', ') + 2)
  return trim.replace(/ с молдингом$/, '')
}

/** База заголовка модели: тип → короткий тип «Дверь» → короткая кромка —
    первый вариант, который вмещается в бюджет (без покрытия и города). */
function titleHead(headline: string, trim: string, budget: number): string {
  const variants = [
    `${DOOR_TYPE} ${BRAND} ${headline}${trim ? `, ${trim}` : ''}`,
    `${DOOR_TYPE} ${BRAND} ${headline}${trim ? `, ${compactTrim(trim)}` : ''}`,
    `Дверь ${BRAND} ${headline}${trim ? `, ${compactTrim(trim)}` : ''}`,
  ]
  return variants.find((v) => v.length <= budget) ?? variants[variants.length - 1]!
}

export const productTitle = (m: NamingInput) => {
  const headline = productHeadline(m)
  const trim = describeTrim(m.model.trim)?.phrase ?? ''
  const coating = m.coatingName && !hasWords(headline, m.coatingName) ? coatingInline(m) : ''
  const budget = TITLE_MAX - ` | ${SITE.studioName}`.length
  const base = fitPhrase(titleHead(headline, trim, budget), [[coating, ', '], ['в Москве', ' ']], budget)
  return brandTitle(base)
}

/** <meta description>: цена и город — здесь (в отличие от фида), признаки — пока
    помещаются, в конце — что входит в услугу салона. */
export function productMetaDescription(m: ModelEntry): string {
  const price = m.minPrice ? `цена ${priceLabel(m)} за полотно` : 'цена по запросу'
  const tail = `. Салон ВФД в ТЦ «Компас», Москва: замер, доставка и установка.`
  const head = `${DOOR_TYPE} ${BRAND} ${productHeadline(m)}`
  const name = fitPhrase(head, modelAttributes(m, false), DESCRIPTION_MAX - tail.length - `, ${price}`.length)
  return `${name}, ${price}${tail}`
}

const stripDot = (s: string) => s.trim().replace(/\.+$/, '')

/**
 * Фактическое описание товара — для <description> фида и Product schema.
 * По правилам Яндекс Товаров без цены, доставки, контактов и рекламных
 * формулировок: серия, покрытие, конструкция, толщина, цвета.
 * Маркетинговый текст серии (spec.description) сюда намеренно не берётся.
 */
export function productDescription(m: ModelEntry): string {
  const spec  = getSeriesSpec(m.seriesSlug, m.coatingSlug)
  const trim  = describeTrim(m.model.trim)
  const parts: string[] = []

  const intro = [
    m.seriesName ? `Полотно серии «${m.seriesName}» Владимирской фабрики дверей` : 'Полотно Владимирской фабрики дверей',
    m.coatingName ? `покрытие — ${coatingInline(m)}` : '',
    trim?.phrase ?? '',
  ].filter(Boolean).join(', ')
  parts.push(`${intro}.`)

  if (spec.features.length > 0) {
    parts.push(`Особенности: ${spec.features.map(f => lowerFirst(stripDot(f))).join('; ')}.`)
  } else {
    if (spec.coating)  parts.push(`Покрытие: ${lowerFirst(stripDot(spec.coating))}.`)
    if (spec.material) parts.push(`Конструкция: ${lowerFirst(stripDot(spec.material))}.`)
    if (spec.edge && trim?.kind !== 'edge') parts.push(`Кромка: ${lowerFirst(stripDot(spec.edge))}.`)
  }

  const mentionsThickness = spec.features.some(f => /толщин/i.test(f))
  if (spec.thickness && !mentionsThickness) parts.push(`Толщина полотна — ${spec.thickness} мм.`)

  const colorNames = [...new Set([...m.colors.map(c => c.name), ...m.extraColors.map(c => c.name)])]
  if (colorNames.length > 0) parts.push(`Цвета: ${colorNames.join(', ')}.`)

  const text = parts.join(' ')
  // Лимит Яндекс Товаров — 3000 символов; режем по границе предложения.
  return text.length <= 3000 ? text : text.slice(0, 3000).replace(/[^.]*$/, '').trim()
}
