/* Уменьшенные копии фото для srcset: описание копий пишет
   scripts/gen-responsive.mjs (src/data/responsive-photos.json). Ключ —
   путь исходника, как он стоит в коде. Нет записи — ошибка сборки: фото
   добавили в код без генерации копий. */
import data from '../data/responsive-photos.json'

const table = data as Record<string, { width: number; height: number; copies: { width: number; src: string }[] }>

export function responsivePhoto(src: string) {
  const entry = table[src]
  if (!entry) throw new Error(`Нет уменьшенных копий для ${src} — запустите npm run gen:responsive`)
  const srcset = [...entry.copies.map((c) => `${c.src} ${c.width}w`), `${src} ${entry.width}w`].join(', ')
  return { src, srcset, width: entry.width, height: entry.height }
}
