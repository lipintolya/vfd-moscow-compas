/**
 * Входные двери VFD со сменными панелями (накладками) — отдельный блок на
 * /catalog/vhodnye-dveri/ (components/entrance-doors/VfdDoors.astro).
 *
 * Дверь выбирают в два шага: модель (полотно, короб, замки) и накладка —
 * декоративная панель с внутренней стороны. Накладка одна для всех моделей, а
 * цена зависит от пары «модель + накладка»: у каждой модели свои ступени цены
 * (tiers). Часть накладок повторяет цвет и рисунок межкомнатных дверей VFD —
 * входная дверь сочетается с дверями внутри квартиры.
 *
 * Цены — «от»: цена двери с выбранной накладкой, точную сумму называет менеджер.
 * Фото: assets/entrance-vfd/ (models/<модель>-outside|render, skins/<накладка>)
 * → npm run gen:entrance-vfd → public/renders/entrance-vfd/ + entrance-vfd-images.json.
 * Накладка без фото в список не попадает (пустых плашек нет).
 */
import { rub } from './services'
import { SITE } from '../config/site'
import { TITLE_MAX, DESCRIPTION_MAX, fitPhrase } from '../lib/product-text'
import { pluralRu } from '../lib/plural'

export interface VfdSkin {
  id: string
  /** Серия накладки: Niuta, ER 1, Atum Pro 28… */
  name: string
  /** Цвет: Ice, Onyx, Дуб Арктический; у накладки «Сектор» его нет */
  color: string
  /** Цвет стекла, если накладка со стеклом */
  glass?: string
}

export interface VfdSpec { label: string; value: string }

export interface VfdModel {
  id: string
  name: string
  tagline: string
  description: string
  /** Квартирная (подъезд) или уличная с терморазрывом (дом) */
  purpose: 'apartment' | 'house'
  /** Самая ходовая модель линейки */
  hit?: true
  specs: VfdSpec[]
  hardware: string[]
  /** Ступени цены: накладки одной цены — одним списком; ₽, «от» */
  tiers: { price: number; skins: string[] }[]
}

export const VFD_SKINS: VfdSkin[] = [
  { id: 'niuta-ice', name: 'Niuta', color: 'Ice' },
  { id: 'niuta-steel', name: 'Niuta', color: 'Steel' },
  { id: 'niuta-onyx', name: 'Niuta', color: 'Onyx' },
  { id: 'niuta-taupe', name: 'Niuta', color: 'Taupe' },
  { id: 'niuta-midwhite', name: 'Niuta', color: 'Midwhite' },
  { id: 'niuta-dub-tehas', name: 'Niuta', color: 'Дуб Техас' },
  { id: 'stockholm-ice', name: 'Stockholm', color: 'White' },
  { id: 'er1-ice', name: 'ER 1', color: 'Ice' },
  { id: 'er1-onyx', name: 'ER 1', color: 'Onyx' },
  { id: 'er2-steel', name: 'ER 2', color: 'Steel' },
  { id: 'er2-taupe', name: 'ER 2', color: 'Taupe' },
  { id: 'glanta-ice', name: 'Glanta', color: 'Ice' },
  { id: 'glanta-onyx', name: 'Glanta', color: 'Onyx' },
  { id: 'dorren-ice', name: 'Dorren', color: 'Ice' },
  { id: 'dorren-midwhite', name: 'Dorren', color: 'Midwhite' },
  { id: 'atumpro33-dub-arktik', name: 'Atum Pro 33', color: 'Дуб Арктический', glass: 'Лакобель Черный' },
  { id: 'atumpro33-dub-kamenny', name: 'Atum Pro 33', color: 'Дуб Каменный', glass: 'Лакобель Черный' },
  { id: 'e33-ice', name: 'E33', color: 'Ice', glass: 'Лакобель Черный' },
  { id: 'e33-taupe', name: 'E33', color: 'Taupe', glass: 'Лакобель Черный' },
  { id: 'e33-onyx', name: 'E33', color: 'Onyx', glass: 'Лакобель Черный' },
  { id: 'graphica-vr-ice', name: 'Graphica VR', color: 'Ice' },
  { id: 'graphica-vr-beton-svetly', name: 'Graphica VR', color: 'Бетон Светлый' },
  { id: 'graphica-vr-beton-temny', name: 'Graphica VR', color: 'Бетон Темный' },
  { id: 'atum5-snezhny', name: 'Atum 5', color: 'Снежный', glass: 'Лакобель Черный' },
  { id: 'atum5-belenyi-dub', name: 'Atum 5', color: 'Беленый Дуб', glass: 'Лакобель Белый' },
  { id: 'atum5-kapuchino', name: 'Atum 5', color: 'Капучино', glass: 'Лакобель Черный' },
  { id: 'atum5-dub-sery', name: 'Atum 5', color: 'Дуб Серый', glass: 'Лакобель Черный' },
  { id: 'atumpro32-dub-kamenny', name: 'Atum Pro 32', color: 'Дуб Каменный' },
  { id: 'atumpro28-dub-arktik', name: 'Atum Pro 28', color: 'Дуб Арктический', glass: 'Лакобель Черный' },
  { id: 'atumpro28-dub-kamenny', name: 'Atum Pro 28', color: 'Дуб Каменный', glass: 'Лакобель Черный' },
  { id: 'atumpro28-dub-krasny', name: 'Atum Pro 28', color: 'Дуб Красный', glass: 'Лакобель Черный' },
  { id: 'atumpro28-dub-skandinavsky', name: 'Atum Pro 28', color: 'Дуб Скандинавский', glass: 'Лакобель Черный' },
  { id: 'atumpro28-beton-svetly', name: 'Atum Pro 28', color: 'Бетон Светлый', glass: 'Лакобель Черный' },
  { id: 'atumpro26-dub-arktik', name: 'Atum Pro 26', color: 'Дуб Арктический', glass: 'Лакобель Черный' },
  { id: 'atum6-belenyi-dub', name: 'Atum 6', color: 'Беленый Дуб' },
  { id: 'atum6-kapuchino', name: 'Atum 6', color: 'Капучино' },
  { id: 'atum6-venge', name: 'Atum 6', color: 'Венге' },
  { id: 'maxi-mirror-ice', name: 'MAXI Mirror', color: 'Ice', glass: 'Зеркало' },
  { id: 'sektor', name: 'Сектор', color: '' },
  { id: 'richmond-white', name: 'Richmond', color: 'Белый' },
]

export const VFD_MODELS: VfdModel[] = [
  {
    id: 'optima',
    name: 'Оптима',
    tagline: 'Квартирная входная дверь для подъезда',
    description: 'Стальное полотно с декоративной штамповкой, три контура уплотнения и утеплённый закрытый короб — надёжная дверь для квартиры в подъезде.',
    purpose: 'apartment',
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Отделка снаружи', value: 'Стальной лист с декоративной штамповкой наружу в порошковой окраске' },
      { label: 'Цвет', value: 'Муар серый (RAL 7016)' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 10–16 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '94–100 мм' },
      { label: 'Толщина стали полотна', value: '1,2 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×860 мм, 2050×960 мм' },
      { label: 'Вес дверного блока', value: '80 кг' },
      { label: 'Ширина наличника', value: '70 мм' },
      { label: 'Тип короба', value: 'Закрытый с утеплением' },
      { label: 'Толщина короба', value: '117 мм' },
      { label: 'Толщина стали короба', value: '1,4 мм' },
      { label: 'Уплотнение', value: 'Три контура' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Пенополистирол' },
      { label: 'Петли', value: '3 шт., приварные, на подшипнике' },
    ],
    hardware: [
      'Дверная ручка',
      'Замок нижний — Галеон 816, цилиндровый, 4 класс защиты',
      'Замок верхний — Галеон 817, сувальдный, 4 класс защиты',
      'Ночная задвижка',
      'Цилиндровый механизм ключ-вертушок',
      'Панорамный глазок с пластиковой линзой',
      'Декоративная накладка со шторкой',
      'Броненакладка',
      'Металлический регулируемый эксцентрик',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 36_200, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'stockholm-ice', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 34_000, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
      { price: 33_400, skins: ['atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny'] },
    ],
  },
  {
    id: 'ekspertpro',
    name: 'ЭкспертПро',
    tagline: 'Усиленная квартирная дверь с комбинированным утеплением',
    description: 'Стальное полотно 102 мм с комбинированным утеплением (минплита + XPS), замки Гардиан 3 и 4 класса защиты, три контура уплотнения — дверь повышенной защиты для квартиры.',
    purpose: 'apartment',
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Назначение', value: 'Для квартиры' },
      { label: 'Толщина металла', value: '1,4 мм' },
      { label: 'Цвет металла', value: 'Антрацит' },
      { label: 'Внешняя отделка', value: 'Гладкий лист металла, цвет Антрацит' },
      { label: 'Внутренняя отделка', value: 'Фрезерованная МДФ-панель, 12 мм, цвет Ice' },
      { label: 'Верхний замок', value: 'Гардиан 3001, цилиндровый, 3 класс защиты' },
      { label: 'Нижний замок', value: 'Гардиан 3211, сувальдный, 4 класс защиты' },
      { label: 'Петли', value: 'Шарниры на опорном подшипнике, 3 шт., угол открывания 180°' },
      { label: 'Наполнитель полотна', value: 'Комбинированное: минеральная плита «Технониколь» (50 мм) + панель пенополистирола XPS (30 мм)' },
      { label: 'Уплотнитель', value: 'Три контура уплотнения. На полотне — Schlegel (2 контура). На коробе — EPDM (1 контур)' },
      { label: 'Размер по коробу', value: '860×2050 мм' },
      { label: 'Глубина по коробу', value: '117 мм' },
      { label: 'Полотно толщина', value: '102 мм' },
      { label: 'Крепёж', value: 'Рамный дюбель 10×132 (арт. 000860), 6 шт. — приобретается отдельно' },
    ],
    hardware: [
      'Глазок',
      'Ночная задвижка',
      'Накладки на замок',
      'Эксцентрик',
      'Противосъёмные штыри',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 39_400, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-midwhite', 'niuta-taupe', 'niuta-dub-tehas', 'glanta-ice', 'glanta-onyx', 'er2-steel', 'er2-taupe', 'er1-ice', 'er1-onyx', 'dorren-ice', 'dorren-midwhite'] },
      { price: 38_400, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-skandinavsky', 'atumpro28-dub-krasny', 'atumpro28-beton-svetly', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atum5-snezhny', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'atumpro26-dub-arktik'] },
    ],
  },
  {
    id: 'ekspertnext',
    name: 'ЭкспертНекст',
    tagline: 'Квартирная входная дверь повышенной защиты',
    description: 'Стальное полотно 102 мм с комбинированным утеплением (минплита + XPS), замки Гардиан 3 и 4 класса защиты, три контура уплотнения — усиленная дверь для квартиры.',
    purpose: 'apartment',
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Назначение', value: 'Для квартиры' },
      { label: 'Толщина металла', value: '1,4 мм' },
      { label: 'Цвет металла', value: 'Антрацит' },
      { label: 'Внешняя отделка', value: 'Гладкий лист металла, цвет Антрацит' },
      { label: 'Внутренняя отделка', value: 'Фрезерованная МДФ-панель, 12 мм, цвет Ice' },
      { label: 'Верхний замок', value: 'Гардиан 3001, цилиндровый, 3 класс защиты' },
      { label: 'Нижний замок', value: 'Гардиан 3211, сувальдный, 4 класс защиты' },
      { label: 'Петли', value: 'Шарниры на опорном подшипнике, 3 шт., угол открывания 180°' },
      { label: 'Наполнитель полотна', value: 'Комбинированное: минеральная плита «Технониколь» (50 мм) + панель пенополистирола XPS (30 мм)' },
      { label: 'Уплотнитель', value: 'Три контура уплотнения. На полотне — Schlegel (2 контура). На коробе — EPDM (1 контур)' },
      { label: 'Размер по коробу', value: '860×2050 мм' },
      { label: 'Глубина по коробу', value: '117 мм' },
      { label: 'Полотно толщина', value: '102 мм' },
      { label: 'Крепёж', value: 'Рамный дюбель 10×132 (арт. 000860), 6 шт. — приобретается отдельно' },
    ],
    hardware: [
      'Глазок',
      'Ночная задвижка',
      'Накладки на замок',
      'Эксцентрик',
      'Противосъёмные штыри',
      'Цвет фурнитуры — чёрный',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 43_800, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 42_800, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
    ],
  },
  {
    id: 'ekspertlt',
    name: 'ЭкспертЛТ',
    tagline: 'Квартирная входная дверь с открытым коробом',
    description: 'Стальное полотно 100 мм со штамповкой внутрь, металлический порог, три контура уплотнения — облегчённая дверь для квартиры в подъезде.',
    purpose: 'apartment',
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Отделка снаружи', value: 'Стальной лист с декоративной штамповкой внутрь в порошковой окраске' },
      { label: 'Цвет', value: 'Букле Графит' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 10–16 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '100 мм' },
      { label: 'Толщина стали полотна', value: '1,2 мм' },
      { label: 'Толщина стали короба', value: '1,4 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Открытый' },
      { label: 'Толщина короба', value: '117 мм' },
      { label: 'Вес дверного блока', value: '80 кг' },
      { label: 'Порог', value: 'Металлический' },
      { label: 'Уплотнение', value: 'Три контура' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Пенополистирол' },
      { label: 'Количество петель', value: '3 петли' },
    ],
    hardware: [
      'Замок нижний — Галеон 816, цилиндровый, 4 класс защиты',
      'Замок верхний — Галеон 817, сувальдный, 4 класс защиты',
      'Ночная задвижка',
      'Цилиндровая вставка ключ-шток-вертушок',
      'Броненакладка',
      'Металлический регулируемый эксцентрик',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 34_300, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 33_400, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
    ],
  },
  {
    id: 'balancetwin',
    name: 'БалансТвин',
    tagline: 'Отличное сочетание качества сборки, дизайна и звукоизоляции',
    description: 'Стальное полотно 102 мм с комбинированным утеплением (минплита + XPS), усиленная сталь короба 1,7 мм, три контура уплотнения — самая популярная модель.',
    purpose: 'apartment',
    hit: true,
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Отделка снаружи', value: 'Стальной лист в порошковой окраске' },
      { label: 'Цвет', value: 'Букле Чёрный' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 12 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '102 мм' },
      { label: 'Толщина стали полотна', value: '1,5 мм' },
      { label: 'Толщина стали короба', value: '1,7 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Открытый' },
      { label: 'Толщина короба', value: '117 мм' },
      { label: 'Вес дверного блока', value: '90 кг' },
      { label: 'Порог', value: 'Нержавеющая сталь (дополнительная опция)' },
      { label: 'Уплотнение', value: 'Три контура уплотнителя. На полотне — Schlegel (2 контура). На коробе — EPDM (1 контур)' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Комбинированное: минеральная плита «Технониколь» (50 мм) + панель пенополистирола XPS (30 мм)' },
      { label: 'Количество петель', value: '3 петли' },
    ],
    hardware: [
      'Замок нижний — Гардиан 3211, сувальдный, 4 класс защиты',
      'Замок верхний — Гардиан 3001, цилиндровый, 3 класс защиты',
      'Ночная задвижка',
      'Цилиндровая вставка ключ-шток-вертушок',
      'Броненакладка',
      'Металлический регулируемый эксцентрик',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 49_600, skins: ['maxi-mirror-ice'] },
      { price: 46_900, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 46_000, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
    ],
  },
  {
    id: 'balanceduo',
    name: 'БалансДуо',
    tagline: 'Отличное сочетание качества сборки, дизайна и звукоизоляции',
    description: 'Стальное полотно 102 мм с комбинированным утеплением (минплита + XPS), усиленная сталь короба 1,7 мм, три контура уплотнения — вторая модель линейки Баланс.',
    purpose: 'apartment',
    hit: true,
    specs: [
      { label: 'Тип двери', value: 'Квартирная входная дверь, для эксплуатации в подъезде' },
      { label: 'Отделка снаружи', value: 'Стальной лист в порошковой окраске' },
      { label: 'Цвет', value: 'Букле Чёрный' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 12 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '102 мм' },
      { label: 'Толщина стали полотна', value: '1,5 мм' },
      { label: 'Толщина стали короба', value: '1,7 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Открытый' },
      { label: 'Толщина короба', value: '117 мм' },
      { label: 'Вес дверного блока', value: '90 кг' },
      { label: 'Порог', value: 'Нержавеющая сталь (дополнительная опция)' },
      { label: 'Уплотнение', value: 'Три контура уплотнителя. На полотне — Schlegel (2 контура). На коробе — EPDM (1 контур)' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Комбинированное: минеральная плита «Технониколь» (50 мм) + панель пенополистирола XPS (30 мм)' },
      { label: 'Количество петель', value: '3 петли' },
    ],
    hardware: [
      'Замок нижний — Гардиан 3211, сувальдный, 4 класс защиты',
      'Замок верхний — Гардиан 3001, цилиндровый, 3 класс защиты',
      'Ночная задвижка',
      'Цилиндровая вставка ключ-шток-вертушок',
      'Броненакладка',
      'Металлический регулируемый эксцентрик',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 48_200, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'stockholm-ice', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'e33-ice', 'e33-taupe'] },
      { price: 47_400, skins: ['niuta-dub-tehas', 'atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'atumpro28-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-beton-svetly', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro26-dub-arktik', 'atum5-belenyi-dub', 'atum5-snezhny', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge'] },
    ],
  },
  {
    id: 'comforttermo',
    name: 'КомфортТермо',
    tagline: 'Уличная входная дверь с терморазрывом',
    description: 'Термомост по периметру полотна и короба, комбинированный утеплитель XPS + ДВП, три контура EPDM-уплотнения — для входа в частный дом, где одна сторона двери на улице.',
    purpose: 'house',
    specs: [
      { label: 'Тип двери', value: 'Уличная входная дверь с терморазрывом' },
      { label: 'Отделка снаружи', value: 'Стальной лист в порошково-полимерной атмосферостойкой покраске' },
      { label: 'Цвет', value: 'Букле графит' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 12 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '110 мм' },
      { label: 'Толщина стали полотна', value: '1,5 мм' },
      { label: 'Толщина стали короба', value: '1,7 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Открытый, двухсоставной, с терморазрывом' },
      { label: 'Толщина короба', value: '150 мм' },
      { label: 'Вес дверного блока', value: '95 кг' },
      { label: 'Порог', value: 'Нержавеющая сталь (дополнительная опция)' },
      { label: 'Уплотнение', value: 'Три контура высококачественного EPDM-уплотнителя' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Терморазрыв (термомост) из пластика по периметру полотна толщиной 10 мм и между внутренним и наружным профилями коробки — 25 мм. Наполнение полотна — теплоизоляционный сэндвич из панели пенополистирола (XPS) и древесноволокнистой плиты' },
      { label: 'Количество петель', value: '3 петли' },
    ],
    hardware: [
      'Замок нижний — Галеон 816, цилиндровый с термоштоком, 4 класс защиты',
      'Замок верхний — Галеон 817, сувальдный, 4 класс защиты',
      'Ночная задвижка',
      'Декоративная накладка с металлическими шторками',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 51_200, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'stockholm-ice', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 50_400, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
    ],
  },
  {
    id: 'strongtermo',
    name: 'СтронгТермо',
    tagline: 'Уличная входная дверь с терморазрывом',
    description: 'Сварная багетная рамка, закрытый утеплённый короб с терморазрывом, утепление пенополистиролом, минплитой и изолоном — усиленная дверь для входа в частный дом.',
    purpose: 'house',
    specs: [
      { label: 'Тип двери', value: 'Уличная входная дверь с терморазрывом' },
      { label: 'Отделка снаружи', value: 'Стальной лист со сварной багетной рамкой в порошковой окраске' },
      { label: 'Цвет', value: 'Муар коричневый (RAL 8019)' },
      { label: 'Отделка внутри', value: 'Декоративная панель MDF от 12 мм с отделкой PVC/PP' },
      { label: 'Толщина дверного полотна', value: '114–120 мм' },
      { label: 'Толщина стали полотна', value: '1,5 мм' },
      { label: 'Толщина стали короба', value: '1,5 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Закрытый утеплённый с терморазрывом' },
      { label: 'Толщина короба', value: '130 мм' },
      { label: 'Вес дверного блока', value: '100 кг' },
      { label: 'Порог', value: 'Нержавеющая сталь (дополнительная опция)' },
      { label: 'Уплотнение', value: 'Три контура высококачественного уплотнителя' },
      { label: 'Открывание', value: '180°' },
      { label: 'Утепление', value: 'Пенополистирол, минплита и изолон' },
      { label: 'Количество петель', value: '3 петли' },
    ],
    hardware: [
      'Замок нижний — Галеон 816, цилиндровый с термоштоком, 4 класс защиты',
      'Замок верхний — Галеон 817, сувальдный, 4 класс защиты',
      'Ночная задвижка',
      'Декоративная накладка со шторкой',
      'Цилиндровый механизм ключ-вертушок',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 67_500, skins: ['niuta-ice', 'niuta-steel', 'niuta-onyx', 'niuta-taupe', 'niuta-midwhite', 'stockholm-ice', 'er1-ice', 'er1-onyx', 'er2-steel', 'er2-taupe', 'glanta-ice', 'glanta-onyx', 'dorren-ice', 'dorren-midwhite', 'e33-ice', 'e33-taupe', 'e33-onyx', 'graphica-vr-ice'] },
      { price: 66_600, skins: ['atumpro33-dub-arktik', 'atumpro33-dub-kamenny', 'graphica-vr-beton-svetly', 'graphica-vr-beton-temny', 'atum5-snezhny', 'atum5-belenyi-dub', 'atum5-kapuchino', 'atum5-dub-sery', 'atumpro32-dub-kamenny', 'atumpro28-dub-arktik', 'atumpro28-dub-kamenny', 'atumpro28-dub-krasny', 'atumpro28-dub-skandinavsky', 'atumpro28-beton-svetly', 'atumpro26-dub-arktik', 'atum6-belenyi-dub', 'atum6-kapuchino', 'atum6-venge', 'niuta-dub-tehas'] },
    ],
  },
  {
    id: 'richmondtermo',
    name: 'РичмондТермо',
    tagline: 'Уличная дверь со стеклопакетом и терморазрывом',
    description: 'Энергоэффективный трёхкамерный стеклопакет из закалённого стекла, полиамидный термопрофиль в полотне и коробе, фурнитура матовый хром — уличная дверь с остеклением для частного дома.',
    purpose: 'house',
    specs: [
      { label: 'Тип двери', value: 'Уличная входная дверь с терморазрывом и стеклопакетом' },
      { label: 'Остекление', value: 'Энергоэффективный трёхкамерный стеклопакет из закалённого стекла — устойчиво к перепадам температур и механическим воздействиям, высокие тепло- и шумоизоляционные свойства' },
      { label: 'Цвет фурнитуры', value: 'Матовый хром' },
      { label: 'Внешняя накладка', value: 'Металл, цвет «Букле графит»' },
      { label: 'Внутренняя накладка', value: 'МДФ 16 мм, цвет белый' },
      { label: 'Толщина дверного полотна', value: '110 мм' },
      { label: 'Толщина стали полотна', value: '1,3 мм' },
      { label: 'Размер дверного блока по коробке', value: '2050×960 мм, 2050×860 мм' },
      { label: 'Тип короба', value: 'Открытый короб' },
      { label: 'Уплотнение', value: 'Три контура уплотнения' },
      { label: 'Утепление', value: 'Заполнение полотна комбинированное: пенополистирол + базальтовая плита' },
      { label: 'Терморазрыв', value: 'Полиамидное термопрофильное полотно и рама, полиамидный профиль 10 мм' },
      { label: 'Вес дверного блока', value: '115 кг' },
    ],
    hardware: [
      'Фурнитура цвета матовый хром',
    ],
    /* Цена накладки для этой модели, ₽; накладки одной цены — одним списком */
    tiers: [
      { price: 66_400, skins: ['richmond-white'] },
    ],
  },
]

/* ---------- Выводимое из данных ---------- */

const skinIndex = new Map(VFD_SKINS.map((s, i) => [s.id, i]))
export const skinById = (id: string): VfdSkin => {
  const s = VFD_SKINS.find((x) => x.id === id)
  if (!s) throw new Error(`Входные двери VFD: нет накладки «${id}»`)
  return s
}
/** «Niuta, Ice» / «Сектор» */
export const skinLabel = (s: VfdSkin) => (s.color ? `${s.name}, ${s.color}` : s.name)

export interface VfdOption { skin: VfdSkin; price: number }
/** Накладки модели с ценой — в порядке общего списка (по сериям) */
export function optionsOf(m: VfdModel): VfdOption[] {
  return m.tiers
    .flatMap((t) => t.skins.map((id) => ({ skin: skinById(id), price: t.price })))
    .sort((a, b) => skinIndex.get(a.skin.id)! - skinIndex.get(b.skin.id)!)
}
export const modelFrom = (m: VfdModel) => Math.min(...m.tiers.map((t) => t.price))
export const fromText = (price: number) => `от ${rub(price)}`

for (const m of VFD_MODELS) {
  const ids = m.tiers.flatMap((t) => t.skins)
  if (!ids.length) throw new Error(`Входные двери VFD «${m.name}»: нет ни одной накладки`)
  if (new Set(ids).size !== ids.length) throw new Error(`Входные двери VFD «${m.name}»: накладка в двух ступенях цены`)
  ids.forEach(skinById)
}

export const VFD_MIN_PRICE = Math.min(...VFD_MODELS.map(modelFrom))
const modelsText = `${VFD_MODELS.length} ${pluralRu(VFD_MODELS.length, ['модель', 'модели', 'моделей'])}`
const skinsText = `${VFD_SKINS.length} ${pluralRu(VFD_SKINS.length, ['накладка', 'накладки', 'накладок'])}`

export const PURPOSE_LABEL = { apartment: 'Для квартиры', house: 'Для дома' } as const
export const VIEW_LABEL = { outside: 'Снаружи', render: 'В интерьере', inside: 'Изнутри' } as const

/* ---------- Тексты блока ---------- */

export const VFD_SECTION = {
  id: 'vfd-doors',
  title: 'Входные двери VFD со сменными панелями (накладками)',
  lead: 'Накладку изнутри выбирают отдельно от модели. Часть накладок повторяет цвет и рисунок межкомнатных дверей VFD, поэтому входная дверь сочетается с дверями в квартире. Откройте модель и выберите панель.',
  meta: `${modelsText}, ${skinsText}, ${fromText(VFD_MIN_PRICE)}`,
  panelTitle: 'Накладка изнутри',
  priceNote: 'Цена «от» — дверь с выбранной накладкой. Точную сумму с учётом размера, комплектации и монтажа подтвердит менеджер.',
  specsTitle: 'Характеристики',
  hardwareTitle: 'Комплектация',
}

/** Обращение к менеджеру: модель, накладка и цена уже в тексте */
export const vfdAsk = (model: VfdModel, option: VfdOption) =>
  `Интересует входная дверь VFD «${model.name}», накладка: ${skinLabel(option.skin)} (${fromText(option.price)}). Подскажите, пожалуйста, цену и сроки.`

export const VFD_FAQ = [
  {
    q: 'Что такое сменные панели (накладки) у входных дверей VFD?',
    a: `Накладка — декоративная панель с внутренней стороны двери. Её выбирают отдельно от модели: ${skinsText}, часть из них повторяет цвет и рисунок межкомнатных дверей VFD, поэтому входная дверь сочетается с дверями внутри квартиры.`,
  },
  {
    q: 'Сколько стоят входные двери VFD с накладками?',
    a: `${modelsText} от ${rub(VFD_MIN_PRICE)}: цена зависит от модели и накладки, на странице она показана для каждой пары. Точную сумму с учётом размера, комплектации и монтажа подтвердит менеджер — в Telegram, MAX или по телефону салона.`,
  },
]

/** Название для разметки и подписей: «Входная дверь VFD Оптима» */
export const vfdTitle = (m: VfdModel) => `Входная дверь VFD ${m.name}`
export const vfdAlt = {
  outside: (m: VfdModel) => `${vfdTitle(m)}, вид снаружи — ${SITE.studioName}`,
  render: (m: VfdModel) => `${vfdTitle(m)} в интерьере, визуализация — ${SITE.studioName}`,
  inside: (m: VfdModel, s: VfdSkin) => `${vfdTitle(m)}, накладка ${skinLabel(s)}, вид изнутри — ${SITE.studioName}`,
}

/* ---------- Страница модели ---------- */

export const vfdHref = (m: VfdModel) => `/catalog/vhodnye-dveri/vfd/${m.id}/`

/** Основа <title> (без «| Студия Зизевского»): части добавляются, пока влезают */
export function vfdPageTitle(m: VfdModel): string {
  const budget = TITLE_MAX - ` | ${SITE.studioName}`.length
  return fitPhrase(vfdTitle(m), [['с накладками', ' '], ['в Москве', ' '], [`— ${fromText(modelFrom(m))}`, ' ']], budget)
}

/** <meta description> модели: что за дверь, число накладок, цена «от» */
export function vfdDescription(m: VfdModel): string {
  const n = optionsOf(m).length
  const head = `${vfdTitle(m)} со сменными накладками изнутри`
  const panels = n > 1 ? `${n} ${pluralRu(n, ['вариант', 'варианта', 'вариантов'])} цвета и рисунка` : 'накладка в цвет межкомнатных дверей'
  return fitPhrase(head, [[panels, ': '], [`цена ${fromText(modelFrom(m))}`, ', '], ['ТЦ «Компас», Москва', '. ']], DESCRIPTION_MAX)
}
