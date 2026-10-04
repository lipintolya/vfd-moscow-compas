/**
 * /visit-map-dark.svg — тёмная версия собственной карты окрестностей салона
 * для футера (Footer.vue). Геометрия та же, что у карты на главной
 * (src/data/visit-map.json, scripts/gen-visit-map.mjs).
 *
 * Отдельный файл, а не inline-SVG: футер есть на всех ~400 страницах,
 * картинка кешируется браузером один раз. Цвета — токены из global.css,
 * которые здесь подставляются при сборке (в <img> CSS-переменные не видны).
 */
import type { APIRoute } from 'astro'
import css from '../styles/global.css?raw'
import map from '../data/visit-map.json'
import { SITE } from '../config/site'

/* --name: value из global.css; var(--x) раскрывается рекурсивно */
const TOKENS = new Map([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]))
function token(name: string): string {
  const v = TOKENS.get(name)
  if (!v) throw new Error(`visit-map-dark.svg: нет токена --${name}`)
  const ref = v.match(/^var\(--([\w-]+)\)$/)
  return ref ? token(ref[1]!) : v
}

const C = {
  bg:       token('color-slate-900'),
  green:    token('color-slate-800'),
  water:    token('color-secondary-900'),
  building: token('color-slate-800'),
  minor:    token('color-slate-700'),
  rail:     token('color-slate-600'),
  major:    token('color-slate-600'),
  mall:     token('color-white'),
  label:    token('color-slate-400'),
  signal:   token('color-accent-500'),
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const { width: W, height: H, layers: L } = map
const cx = W / 2
const cy = H / 2

const labels = map.labels
  .map((l) => {
    const x = (l.x / 100) * W
    const y = (l.y / 100) * H
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${l.angle} ${x.toFixed(1)} ${y.toFixed(1)})">${esc(l.text)}</text>`
  })
  .join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${L.green}" fill="${C.green}" fill-opacity="0.55"/>
<path d="${L.water}" fill="${C.water}"/>
<path d="${L.river}" stroke="${C.water}" stroke-width="5"/>
<path d="${L.building}" fill="${C.building}"/>
<path d="${L.minor}" stroke="${C.minor}" stroke-width="6"/>
<path d="${L.rail}" stroke="${C.rail}" stroke-width="2" stroke-dasharray="10 6"/>
<path d="${L.major}" stroke="${C.major}" stroke-width="13"/>
<path d="${L.mall}" fill="${C.mall}"/>
</g>
<g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" fill="${C.label}" text-anchor="middle" dominant-baseline="middle" stroke="${C.bg}" stroke-width="4" paint-order="stroke">${labels}</g>
<circle cx="${cx}" cy="${cy}" r="26" fill="${C.signal}" fill-opacity="0.18"/>
<circle cx="${cx}" cy="${cy}" r="10" fill="${C.signal}" stroke="${C.bg}" stroke-width="4"/>
<text x="${cx + 22}" y="${cy - 18}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="${C.mall}" stroke="${C.bg}" stroke-width="5" paint-order="stroke">${esc(SITE.address.mall)}</text>
</svg>`

export const GET: APIRoute = () =>
  new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } })
