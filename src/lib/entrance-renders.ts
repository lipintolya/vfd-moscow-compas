/* Рендеры на /catalog/vhodnye-dveri/ и страницах моделей: JSON пишет
   scripts/gen-entrance-renders.mjs (assets/entrance-renders/<место>.*).
   Место — это GUIDE_VISUALS (путеводитель) или DOOR_SCENES (дверь на доме, entrance-scenes.ts).
   Файл, у которого нет места, — ошибка сборки:
   опечатка в имени не должна тихо оставить место пустым. */
import files from '../data/entrance-render-files.json'
import { GUIDE_VISUALS, type GuideVisual } from '../data/entrance-guide'
import { DOOR_SCENES } from '../data/entrance-scenes'

type CropJson = { widths: number[]; width: number; height: number }
type RenderJson = Record<string, { hash: string; widths: number[]; width: number; height: number; crops?: Record<string, CropJson> }>
const table = files as RenderJson

const known = new Set([...GUIDE_VISUALS.map((v) => v.slot), ...DOOR_SCENES.map((s) => s.slot)])
const unknown = Object.keys(table).filter((slot) => !known.has(slot))
if (unknown.length) {
  throw new Error(`Входные двери: рендер assets/entrance-renders/${unknown[0]}.* — такого места нет ни в src/data/entrance-guide.ts, ни в src/data/entrance-scenes.ts. Переименуйте файл или добавьте место, затем npm run gen:entrance-renders`)
}

export interface RenderCrop { srcset: string; width: number; height: number }
/** crops — обрезки под телефон (CROPS в scripts/gen-entrance-renders.mjs): <picture><source media> */
export interface RenderImage { src: string; srcset: string; width: number; height: number; alt: string; crops?: Record<string, RenderCrop> }

/** Рендер места, если он положен в assets/entrance-renders/ */
export function renderOf(v: Pick<GuideVisual, 'slot' | 'alt'>): RenderImage | null {
  const r = table[v.slot]
  if (!r) return null
  const file = (w: number) => `/renders/entrance-guide/${v.slot}-${r.hash}-${w}.webp`
  const crops = r.crops && Object.fromEntries(Object.entries(r.crops).map(([name, c]): [string, RenderCrop] => {
    const at = (w: number) => `/renders/entrance-guide/${v.slot}-${name}-${r.hash}-${w}.webp`
    return [name, { srcset: c.widths.map((w) => `${at(w)} ${w}w`).join(', '), width: c.width, height: c.height }]
  }))
  return { src: file(r.widths.at(-1)!), srcset: r.widths.map((w) => `${file(w)} ${w}w`).join(', '), width: r.width, height: r.height, alt: v.alt, ...(crops && { crops }) }
}

/** Места, которые ждут рендер */
export const missingRenders = () => GUIDE_VISUALS.filter((v) => !table[v.slot])
