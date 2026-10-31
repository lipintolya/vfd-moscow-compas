/**
 * Входные двери — каталог /catalog/vhodnye-dveri/ и страницы моделей.
 * Ассортимент, фото и характеристики — от партнёра-завода (согласовано);
 * название завода на сайт не выводится, модели называются как в каталоге.
 * Цены — «от» (минимум модели по каталогу завода) и цена каждой показанной
 * отделки; точную сумму подтверждает менеджер (Telegram, MAX, телефон).
 *
 * Данные — entrance-doors-catalog.json (названия, характеристики по моделям,
 * подписи вариантов отделки), фото — assets/entrance-doors/ → npm run
 * gen:entrance-doors → public/renders/entrance-doors/ + entrance-doors-images.json.
 * Модель = коллекция завода; вариантов отделки у каждой больше, чем показано —
 * на странице самые ходовые (до VARIANTS_SHOWN), остальные — по запросу.
 */
import catalog from './entrance-doors-catalog.json'
import images from './entrance-doors-images.json'
import { SITE } from '../config/site'
import { rub } from './services'
import { TITLE_MAX, DESCRIPTION_MAX, fitPhrase } from '../lib/product-text'
import { pluralRu } from '../lib/plural'

/** Сколько вариантов отделки у модели показано (скрипт выгрузки берёт до стольких) */
export const VARIANTS_SHOWN = 8

export interface DoorImage { src: string; srcset: string; large: string; width: number; height: number; split: number; single: boolean; alt: string }
export interface DoorVariant { name: string; image: DoorImage; /** Цена этой отделки по каталогу завода, ₽ */ price: number }

/** Группы страницы: у двери одна, по самому важному признаку (порядок = приоритет) */
export type DoorGroupId = 'glass' | 'smart' | 'thermo' | 'flat'

export interface EntranceDoor {
  id: string
  name: string
  /** «Входная дверь Аляска Лайт» — заголовок и подпись */
  title: string
  href: string
  group: DoorGroupId
  /** Короткие признаки для карточки */
  chips: string[]
  /** Главные параметры — четыре строки у фото на странице модели */
  facts: { label: string; value: string }[]
  /** Сталь, мм — число с запятой, как у завода («1,5») */
  steel: string
  /** Строки таблицы характеристик */
  specs: { label: string; value: string }[]
  sizes: string
  opening: string
  variants: DoorVariant[]
  cover: DoorImage
  /** Минимальная цена модели в каталоге завода, ₽ — на сайте «от …» */
  from: number
  /** Сообщение менеджеру из кнопок связи */
  request: string
}

const table = images as Record<string, { hash: string; widths: number[]; width: number; height: number; split: number; single: boolean }>
const clean = (s: string) => s.replace(/[ \s]+/g, ' ').trim()

const img_single = (file: string) => !!table[file.replace('.webp', '')]?.single

function img(file: string, alt: string): DoorImage {
  const name = file.replace('.webp', '')
  const m = table[name]
  if (!m) throw new Error(`Входные двери: нет фото «${file}» — assets/entrance-doors/${file}, затем npm run gen:entrance-doors`)
  const at = (w: number) => `/renders/entrance-doors/${name}-${m.hash}-${w}.webp`
  return { src: at(m.widths[0]!), srcset: m.widths.map((w) => `${at(w)} ${w}w`).join(', '), large: at(m.widths.at(-1)!), width: m.width, height: m.height, split: m.split, single: m.single, alt }
}

const rowOf = (specs: { label: string; value: string }[], label: string) => specs.find((s) => s.label === label)?.value

interface Raw {
  id: string
  name: string
  sizes: string | null
  opening: string | null
  from: number
  specs: [string, string][]
  variants: { name: string; file: string; price: number }[]
}

function build(raw: Raw): EntranceDoor {
  const specs = raw.specs.map(([label, value]) => ({ label: clean(label), value: clean(value) }))
  if (!raw.sizes || !raw.opening) throw new Error(`Входные двери «${raw.name}»: нет размеров или открывания`)
  const lock = rowOf(specs, 'Основной замок') ?? ''
  const group: DoorGroupId =
    rowOf(specs, 'Стеклопакет') ? 'glass'
    : /электронн/i.test(lock) || /смарт/i.test(raw.name) ? 'smart'
    : rowOf(specs, 'Терморазрыв') ? 'thermo'
    : 'flat'

  const steel = rowOf(specs, 'Конструкция')?.match(/Сталь ([\d,]+) мм/)?.[1]
  const thick = rowOf(specs, 'Толщина, вес')?.match(/Толщина двери (\d+) мм/)?.[1]
  const lockType = lock.match(/^(Сувальдный|Цилиндровый|Электронный|Двухсистемный)/i)?.[1]
  const lockClass = lock.match(/(\d)-го/)?.[1]
  const seals = rowOf(specs, 'Контуры уплотнения')?.match(/^(\d+)/)?.[1]
  const facts = [
    steel && { label: 'Сталь', value: `${steel} мм` },
    thick && { label: 'Толщина двери', value: `${thick} мм` },
    lockType && { label: 'Основной замок', value: `${lockType.toLowerCase()}${lockClass ? `, ${lockClass}-й класс` : ''}` },
    seals && { label: 'Уплотнение', value: `${seals} ${seals === '1' ? 'контур' : 'контура'}` },
  ].filter((f): f is { label: string; value: string } => !!f)
  const chips = [
    steel && `Сталь ${steel} мм`,
    thick && `Толщина ${thick} мм`,
    group === 'glass' && 'Стеклопакет',
    group === 'smart' && 'Электронный замок',
    group === 'thermo' && 'Терморазрыв',
  ].filter((c): c is string => !!c)

  const title = `Входная дверь ${raw.name}`
  const variants = raw.variants.map((v) => ({
    name: v.name,
    price: v.price,
    image: img(v.file, `${title}: ${v.name}, ${img_single(v.file) ? 'вид снаружи' : 'вид снаружи и изнутри'} — ${SITE.studioName}`),
  }))
  return {
    id: raw.id,
    name: raw.name,
    title,
    href: `/catalog/vhodnye-dveri/${raw.id}/`,
    group,
    chips,
    facts,
    steel: steel ?? '',
    specs,
    sizes: raw.sizes.replace(/х/g, '×').replace(/,\s*/g, ', '),
    opening: raw.opening,
    variants,
    cover: variants[0]!.image,
    from: raw.from,
    request: `Интересует входная дверь «${raw.name}». Подскажите, пожалуйста, цену и сроки.`,
  }
}

export const ENTRANCE_DOORS: EntranceDoor[] = (catalog as Raw[]).map(build)

/** «от 41 100 ₽» — цена модели; от — потому что отделка и комплектация меняют цену */
export const fromPrice = (d: EntranceDoor) => `от${'\u00a0'}${rub(d.from)}`
export const ENTRANCE_MIN_PRICE = Math.min(...ENTRANCE_DOORS.map((d) => d.from))

export const DOOR_GROUPS: { id: DoorGroupId; nav: string; title: string; lead: string; /** Модель, которая представляет группу на главной (groupDoor) */ cover: string }[] = [
  {
    id: 'flat',
    nav: 'Для квартиры',
    title: 'Входные двери для квартиры',
    lead: 'Стальные двери с утеплением полотна и тремя контурами уплотнения: тихо, тепло и надёжно в подъезде и на лестничной клетке.',
    cover: 'versal',
  },
  {
    id: 'thermo',
    nav: 'С терморазрывом',
    title: 'Двери с терморазрывом для дома и дачи',
    lead: 'Терморазрыв — вставка из полиамида между наружной и внутренней стороной металла: дверь не промерзает и не покрывается конденсатом.',
    cover: 'termolayt',
  },
  {
    id: 'smart',
    nav: 'Электронный замок',
    title: 'Двери с электронным замком',
    lead: 'Открываются отпечатком пальца, пин-кодом, брелком или со смартфона; обычный ключ остаётся запасным способом.',
    cover: 'smartlab',
  },
  {
    id: 'glass',
    nav: 'Со стеклопакетом',
    title: 'Уличные двери со стеклопакетом',
    lead: 'Для коттеджа и частного дома: трёхкамерный стеклопакет пропускает свет в прихожую и сохраняет тепло.',
    cover: 'frost-7024',
  },
]

/** Модель, которая представляет группу (превью на главной): должна быть из этой группы */
export const groupDoor = (id: DoorGroupId) => {
  const g = DOOR_GROUPS.find((x) => x.id === id)!
  const d = doorById(g.cover)
  if (!d || d.group !== id) throw new Error(`Входные двери: модель «${g.cover}» для группы «${id}» не найдена в этой группе`)
  return d
}

/** Модели группы — от дешёвых к дорогим */
export const doorsOfGroup = (id: DoorGroupId) => ENTRANCE_DOORS.filter((d) => d.group === id).sort((a, b) => a.from - b.from)
export const groupFromPrice = (id: DoorGroupId) => Math.min(...doorsOfGroup(id).map((d) => d.from))
export const doorById = (id: string) => ENTRANCE_DOORS.find((d) => d.id === id)

/** Три двери первого экрана — разные по цвету: чёрная, белая, дерево */
export const SHOWCASE_IDS = ['alyaska-layt', 'versal', 'karmina']
export const ENTRANCE_SHOWCASE = SHOWCASE_IDS.map((id) => {
  const d = ENTRANCE_DOORS.find((x) => x.id === id)
  if (!d) throw new Error(`Входные двери: нет модели «${id}» для первого экрана`)
  return d
})
const steels = ENTRANCE_DOORS.map((d) => Number(d.steel.replace(',', '.'))).filter(Boolean)

export const ENTRANCE_PAGE = {
  /** Основа <title>, без «| Студия Зизевского» */
  title: `Входные двери в Москве: каталог, цены от ${ENTRANCE_MIN_PRICE.toLocaleString('ru-RU')} ₽`,
  h1: 'Входные двери в Москве',
  description: `Каталог входных дверей: ${ENTRANCE_DOORS.length} моделей для квартиры и дома — с терморазрывом, электронным замком, стеклопакетом. Цены от ${rub(ENTRANCE_MIN_PRICE)}. ТЦ «Компас».`,
  lead: `${ENTRANCE_DOORS.length} моделей стальных входных дверей: фото, характеристики и варианты отделки. Цены — от ${rub(ENTRANCE_MIN_PRICE)}: точную назовём с учётом отделки и комплектации.`,
  hero: ENTRANCE_SHOWCASE[0]!.cover,
  /** Диапазон стали по каталогу: «1,5–1,8 мм» */
  steelRange: `${Math.min(...steels)}–${Math.max(...steels)}`.replace(/\./g, ','),
}

/** Плитка «Входные двери» на главной (EntrancePreview): тексты; цену и число моделей берёт из каталога */
export const ENTRANCE_HOME_TILE = {
  title: 'Входные двери',
  text: `${ENTRANCE_DOORS.length} ${pluralRu(ENTRANCE_DOORS.length, ['модель', 'модели', 'моделей'])} для квартиры и частного дома: с терморазрывом, электронным замком и стеклопакетом`,
  chip: 'для квартиры и дома',
  all: `Все ${ENTRANCE_DOORS.length} ${pluralRu(ENTRANCE_DOORS.length, ['модель', 'модели', 'моделей'])}`,
}

export const ENTRANCE_FAQ = [
  {
    q: 'Сколько стоит входная дверь?',
    a: `Цены на сайте — «от»: это минимальная цена модели в каталоге завода, она начинается от ${rub(ENTRANCE_MIN_PRICE)}. Итог зависит от отделки снаружи и изнутри, замков и комплектации. Точную сумму для выбранной двери назовёт менеджер — в Telegram, MAX или по телефону салона.`,
  },
  {
    q: 'Какие размеры у входных дверей?',
    a: `Стандартные полотна — ${ENTRANCE_DOORS[0]!.sizes} мм; открывание левое или правое. Размер по коробу и нестандартные проёмы уточняйте у менеджера.`,
  },
  {
    q: 'Чем дверь с терморазрывом отличается от обычной?',
    a: 'В такой двери металл снаружи и изнутри разделён вставкой из полиамида. Холод не проходит по стали насквозь, поэтому дверь не промерзает и на ней не появляется конденсат — это важно для дома, дачи и тамбуров без отопления.',
  },
  {
    q: 'Какую дверь выбрать в квартиру, а какую в частный дом?',
    a: 'В квартиру подойдёт дверь с утеплением полотна и тремя контурами уплотнения — она держит тепло и гасит шум из подъезда. В частный дом и на дачу лучше брать модель с терморазрывом, а для света в прихожей — со стеклопакетом.',
  },
  {
    q: 'Можно ли выбрать другую отделку?',
    a: `Да. У каждой модели на странице показаны самые ходовые варианты отделки (до ${VARIANTS_SHOWN}), но их больше: цвета и рисунок панели с обеих сторон подбираются по каталогу. Напишите менеджеру, какую отделку хотите, — пришлёт фото и назовёт цену.`,
  },
  {
    q: 'Что такое электронный замок и нужен ли он?',
    a: 'Замок открывается отпечатком пальца, пин-кодом, брелком или со смартфона, а обычный ключ остаётся запасным. Удобно, если дверью пользуется вся семья или нужно впускать гостей удалённо. Модели с таким замком собраны в отдельном разделе.',
  },
  {
    q: 'Как посмотреть дверь вживую?',
    a: `Салон «${SITE.studioName}» находится в ТЦ «Компас», ${SITE.address.full}. Какие модели можно посмотреть и потрогать, уточните у менеджера перед приездом.`,
  },
]

/** Основа <title> модели (без «| Студия Зизевского»): части добавляются, пока влезают */
export function doorTitle(d: EntranceDoor): string {
  const budget = TITLE_MAX - ` | ${SITE.studioName}`.length
  return fitPhrase(d.title, [['в Москве', ' '], [`— ${fromPrice(d)}`, ' ']], budget)
}

/** <meta description> модели: что за дверь, цена «от», размеры */
export function doorDescription(d: EntranceDoor): string {
  const kind = DOOR_GROUPS.find((g) => g.id === d.group)!.nav.toLowerCase()
  const head = `${d.title} (${kind}): ${d.chips.join(', ').toLowerCase()}`
  return fitPhrase(head, [[`цена ${fromPrice(d)}`, '; '], [`размеры ${d.sizes} мм`, '; '], ['ТЦ «Компас», Москва', '. ']], DESCRIPTION_MAX)
}
