/* Рендеры путеводителя на /catalog/vhodnye-dveri/: JSON пишет
   scripts/gen-entrance-renders.mjs (assets/entrance-renders/<место>.*).
   Файл, у которого нет места в entrance-guide.ts, — ошибка сборки:
   опечатка в имени не должна тихо оставить место пустым. */
import files from '../data/entrance-render-files.json'
import { GUIDE_VISUALS, type GuideVisual } from '../data/entrance-guide'

type RenderJson = Record<string, { hash: string; widths: number[]; width: number; height: number }>
const table = files as RenderJson

const unknown = Object.keys(table).filter((slot) => !GUIDE_VISUALS.some((v) => v.slot === slot))
if (unknown.length) {
  throw new Error(`Входные двери: рендер assets/entrance-renders/${unknown[0]}.* — такого места нет в src/data/entrance-guide.ts. Переименуйте файл или добавьте место, затем npm run gen:entrance-renders`)
}

export interface RenderImage { src: string; srcset: string; width: number; height: number; alt: string }

/** Рендер места, если он положен в assets/entrance-renders/ */
export function renderOf(v: GuideVisual): RenderImage | null {
  const r = table[v.slot]
  if (!r) return null
  const file = (w: number) => `/renders/entrance-guide/${v.slot}-${r.hash}-${w}.webp`
  return { src: file(r.widths.at(-1)!), srcset: r.widths.map((w) => `${file(w)} ${w}w`).join(', '), width: r.width, height: r.height, alt: v.alt }
}

/** Места, которые ждут рендер */
export const missingRenders = () => GUIDE_VISUALS.filter((v) => !table[v.slot])
