/* Изображения страницы «Стеновые панели»: рендер места (JSON пишет
   scripts/gen-wall-panels.mjs) → фото работы из Strapi → ничего.
   Работа или фото, назначенные месту, пропали из Strapi — ошибка сборки
   с подсказкой, что поправить (молча показать пустое место нельзя). */
import renders from '../data/wall-panel-renders.json'
import { PANEL_VISUALS, type PanelVisual } from '../data/wall-panels-page'
import type { PortfolioWork } from '../data/portfolio-works'
import type { SiteImage } from './strapi'

type RenderJson = Record<string, { hash: string; widths: number[]; width: number; height: number }>
const table = renders as RenderJson

const DATA = 'src/data/wall-panels-page.ts'
const slots = PANEL_VISUALS.map((v) => v.slot)
const repeated = slots.filter((s, i) => slots.indexOf(s) !== i)
if (repeated.length) throw new Error(`Стеновые панели: место «${repeated[0]}» объявлено дважды — ${DATA}`)
const unknown = Object.keys(table).filter((s) => !slots.includes(s))
if (unknown.length) {
  throw new Error(`Стеновые панели: рендер assets/wall-panels/${unknown[0]}.* — такого места нет в ${DATA}. Переименуйте файл или добавьте место, затем npm run gen:wall-panels`)
}

export interface ShownVisual {
  image: SiteImage
  /** Работа, с которой фото, — для подписи со ссылкой */
  work?: PortfolioWork
}

/** Рендер места, если он есть */
export function renderOf(v: PanelVisual): SiteImage | null {
  const r = table[v.slot]
  if (!r) return null
  const file = (w: number) => `/renders/wall-panels/${v.slot}-${r.hash}-${w}.webp`
  return {
    src: file(r.widths.at(-1)!),
    srcset: r.widths.map((w) => `${file(w)} ${w}w`).join(', '),
    width: r.width,
    height: r.height,
    alt: v.alt,
  }
}

/** Что показать на месте: рендер → фото работы → null (место пустует) */
export function shownVisual(v: PanelVisual, works: PortfolioWork[]): ShownVisual | null {
  const render = renderOf(v)
  if (render) return { image: render }
  if (!v.work) return null
  const work = works.find((w) => w.id === v.work!.slug)
  if (!work) throw new Error(`Стеновые панели: работы «${v.work.slug}» нет среди опубликованных в Strapi — место «${v.slot}» в ${DATA}`)
  const image = work.photos[v.work.photo]
  if (!image) throw new Error(`Стеновые панели: у работы «${work.title}» нет фото №${v.work.photo} (их ${work.photos.length}, счёт с нуля) — место «${v.slot}» в ${DATA}`)
  return { image, work }
}

/** Места, которые ждут рендер (нет ни рендера, ни фото работы) */
export const missingRenders = () => PANEL_VISUALS.filter((v) => !table[v.slot] && !v.work)
