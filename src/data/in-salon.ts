/**
 * src/data/in-salon.ts
 *
 * Блок «Новинки и двери в наличии» на главной (InSalon.astro): главный
 * материал слева и список справа. Цены на главной не показываем — они
 * на страницах моделей.
 *
 * Ссылка — либо `href`, либо `modelId` (id модели в Supabase-каталоге):
 * адрес страницы модели берётся из живого каталога, и если модель
 * пропала из каталога, строка просто не показывается.
 *
 * Картинки — локальные уменьшенные копии (scripts/gen-home-images.mjs);
 * `width`/`height` — их реальный размер, чтобы страница не «прыгала».
 * Неразрывные пробелы ставит typograph() при выводе.
 */

export type Status = 'new' | 'stock'

export const STATUS_LABEL: Record<Status, string> = {
  new:   'Новинка',
  stock: 'В наличии',
}

export interface InSalonItem {
  status: Status
  title:  string
  text:   string
  image:  { src: string; width: number; height: number; alt: string }
  href?:     string
  modelId?:  string
}

/* Главный материал */
export const IN_SALON_LEAD: InSalonItem = {
  status: 'new',
  title:  'Серия Техно',
  text:   'Покрытие Эмалекс не боится царапин, сколов, влаги и ультрафиолета. Модель Техно 1 в белом цвете — на складе.',
  image:  { src: '/renders/home/tehno-1.webp', width: 1254, height: 1254, alt: 'Межкомнатная дверь серии «Техно», Эмалекс белый' },
  href:   '/catalog/series/tehno/',
}

/* Список справа */
export const IN_SALON_ROWS: InSalonItem[] = [
  {
    status:  'stock',
    title:   'Урбан Штрих 2А',
    text:    'Эмалекс бежевый с чёрным молдингом, алюминиевая кромка',
    image:   { src: '/renders/home/shtrih-2a-1.webp', width: 1145, height: 1374, alt: 'Дверь Урбан Штрих 2А, Эмалекс бежевый с чёрным молдингом' },
    // «Штрих 2А» в каталоге две записи (чёрный и золотой молдинг) — по id
    modelId: '7434f55c-b2a8-4f12-b0c6-56c7c57888eb',
  },
  {
    status: 'stock',
    title:  'Скрытые двери «Секрет»',
    text:   'Заподлицо со стеной, под покраску или обои',
    image:  { src: '/renders/home/secret-2.webp', width: 1300, height: 867, alt: 'Скрытая дверь «Секрет»' },
    href:   '/catalog/skrytye-dveri/',
  },
  {
    status: 'new',
    title:  'Скрытая дверь «Рефлекс»',
    text:   'Зеркало во всю высоту полотна, до 2,5 м',
    image:  { src: '/renders/home/reflex-1.webp', width: 1300, height: 732, alt: 'Скрытая дверь с зеркалом «Рефлекс»' },
    href:   '/catalog/skrytye-dveri/#reflex',
  },
]
