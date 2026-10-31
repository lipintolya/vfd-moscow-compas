/* Фото входных дверей VFD: JSON пишет scripts/gen-entrance-vfd.mjs (assets/entrance-vfd/).
   Модель без фото «снаружи» и «в интерьере», накладка без фото, а также файл, которого нет
   в src/data/entrance-vfd.ts, — ошибка сборки: опечатка в имени не должна тихо оставить
   на странице пустое место или лишнюю картинку. */
import files from '../data/entrance-vfd-images.json'
import { VFD_MODELS, VFD_SKINS } from '../data/entrance-vfd'

type ImageJson = Record<string, { hash: string; widths: number[]; width: number; height: number }>
const table = files as ImageJson

const keys = (m: string) => [`models/${m}-outside`, `models/${m}-render`]
const known = new Set([...VFD_MODELS.flatMap((m) => keys(m.id)), ...VFD_SKINS.map((s) => `skins/${s.id}`)])
const missing = [...known].filter((k) => !table[k])
if (missing.length) throw new Error(`Входные двери VFD: нет фото «${missing[0]}» — assets/entrance-vfd/${missing[0]}.webp, затем npm run gen:entrance-vfd`)
const extra = Object.keys(table).filter((k) => !known.has(k))
if (extra.length) throw new Error(`Входные двери VFD: фото assets/entrance-vfd/${extra[0]}.webp не названо в src/data/entrance-vfd.ts — переименуйте файл или добавьте запись, затем npm run gen:entrance-vfd`)

export interface VfdImage { src: string; srcset: string; width: number; height: number }

export function vfdImage(key: string): VfdImage {
  const r = table[key]
  if (!r) throw new Error(`Входные двери VFD: нет фото «${key}»`)
  const at = (w: number) => `/renders/entrance-vfd/${key.replace('/', '-')}-${r.hash}-${w}.webp`
  return { src: at(r.widths.at(-1)!), srcset: r.widths.map((w) => `${at(w)} ${w}w`).join(', '), width: r.width, height: r.height }
}

export const outsideOf = (modelId: string) => vfdImage(`models/${modelId}-outside`)
export const renderOf = (modelId: string) => vfdImage(`models/${modelId}-render`)
export const skinImage = (skinId: string) => vfdImage(`skins/${skinId}`)
