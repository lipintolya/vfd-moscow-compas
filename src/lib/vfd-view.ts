/* Разметка блока «Входные двери VFD со сменными панелями» (components/entrance-doors/VfdDoors.astro):
   одни и те же функции собирают её на сервере (первый показ) и в браузере (смена модели и
   накладки) — вид до и после выбора не расходится. Состояние — модель, накладка, вид двери.
   Классы — BEM «vfd__*», стили — в VfdDoors.astro. Тексты экранируются: в данных бывают «&», кавычки. */
import {
  VFD_MODELS, VFD_SECTION, skinLabel, optionsOf, fromText, vfdAlt, vfdAsk,
  type VfdModel, type VfdSkin, type VfdOption,
} from '../data/entrance-vfd'
import { outsideOf, renderOf, skinImage, type VfdImage } from './entrance-vfd'

export type VfdView = 'outside' | 'render' | 'inside'
export interface VfdState { model: string; skin: string; view: VfdView }

const escMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => escMap[c]!)

export const modelOf = (id: string): VfdModel => {
  const m = VFD_MODELS.find((x) => x.id === id)
  if (!m) throw new Error(`Входные двери VFD: нет модели «${id}»`)
  return m
}

/** Накладка, подходящая модели: прежняя, если у модели такая есть, иначе первая */
export function settle(model: string, skin: string, view: VfdView): VfdState {
  const options = optionsOf(modelOf(model))
  const keep = options.find((o) => o.skin.id === skin) ?? options[0]!
  return { model, skin: keep.skin.id, view }
}

/** Первый показ страницы модели: дверь снаружи, первая накладка списка */
export function initialState(modelId: string): VfdState {
  return settle(modelId, optionsOf(modelOf(modelId))[0]!.skin.id, 'outside')
}

export const optionOf = (s: VfdState): VfdOption => optionsOf(modelOf(s.model)).find((o) => o.skin.id === s.skin)!
export const askText = (s: VfdState) => vfdAsk(modelOf(s.model), optionOf(s))

/* ---------- Кадр на сцене ---------- */

const STAGE_SIZES = '(min-width: 62.5rem) 28rem, (min-width: 43.75rem) 60vw, 92vw'

export function stageImage(s: VfdState): VfdImage & { alt: string; sizes: string } {
  const m = modelOf(s.model)
  if (s.view === 'render') return { ...renderOf(m.id), alt: vfdAlt.render(m), sizes: STAGE_SIZES }
  if (s.view === 'inside') return { ...skinImage(s.skin), alt: vfdAlt.inside(m, optionOf(s).skin), sizes: STAGE_SIZES }
  return { ...outsideOf(m.id), alt: vfdAlt.outside(m), sizes: STAGE_SIZES }
}

/* ---------- Правая колонка: название, накладка, цена ---------- */

export function headHtml(s: VfdState): string {
  const m = modelOf(s.model)
  const options = optionsOf(m)
  const cur = optionOf(s)
  const series = [...new Set(options.map((o) => o.skin.name))]
  const inSeries = options.filter((o) => o.skin.name === cur.skin.name)
  const choice = options.length > 1

  const chips = choice && series.length > 1
    ? `<div class="h-toggles vfd__series" role="group" aria-label="Серия накладки">` +
      series.map((n) => `<button type="button" class="h-toggle" data-series="${esc(n)}" aria-pressed="${n === cur.skin.name}">${esc(n)}</button>`).join('') + '</div>'
    : ''
  const thumbs = choice
    ? `<ul class="vfd__skins" role="list">` + inSeries.map((o) => skinThumb(o.skin, o.skin.id === cur.skin.id)).join('') + '</ul>'
    : ''

  return `<h1 class="vfd__name">${esc(m.name)}</h1>` +
    `<p class="h-body vfd__tagline">${esc(m.tagline)}</p>` +
    `<div class="vfd__pick"><p class="vfd__label">${esc(VFD_SECTION.panelTitle)}: <b>${esc(skinLabel(cur.skin))}</b>` +
    (cur.skin.glass ? `<span class="vfd__glass">стекло — ${esc(cur.skin.glass)}</span>` : '') + '</p>' +
    chips + thumbs + '</div>' +
    `<p class="vfd__price">${fromText(cur.price)}</p>` +
    `<p class="vfd__note">${esc(VFD_SECTION.priceNote)}</p>`
}

function skinThumb(skin: VfdSkin, pressed: boolean): string {
  const img = skinImage(skin.id)
  return `<li><button type="button" class="vfd__skin" data-skin="${skin.id}" aria-pressed="${pressed}" aria-label="${esc(skinLabel(skin))}">` +
    `<img src="${img.src}" srcset="${img.srcset}" sizes="4.5rem" alt="" role="presentation" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">` +
    '</button></li>'
}

/* ---------- Характеристики и комплектация ---------- */

export const specsHtml = (m: VfdModel) =>
  '<dl class="vfd__spec">' + m.specs.map((r) => `<div class="vfd__row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('') + '</dl>'

export const hardwareHtml = (m: VfdModel) =>
  '<ul class="vfd__hw" role="list">' + m.hardware.map((h) => `<li>${esc(h)}</li>`).join('') + '</ul>'
