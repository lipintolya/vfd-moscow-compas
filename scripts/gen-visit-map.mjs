/**
 * Генерирует src/data/visit-map.json — собственную векторную карту окрестностей
 * салона для блока «Как к нам добраться» (VisitBand.astro). Вместо скриншота
 * Яндекс Карт: цвета берутся из токенов дизайн-системы в CSS компонента,
 * в JSON — только геометрия по слоям (классам) и подписи улиц.
 *
 * Данные — OpenStreetMap (© участники OpenStreetMap, ODbL) через Overpass API.
 *
 * Запуск:   node scripts/gen-visit-map.mjs
 * Когда запускать снова: если координаты салона в src/config/site.ts
 * (address.coordinates) поменяются.
 */
import { readFile, writeFile } from 'node:fs/promises'

const ROOT = new URL('../', import.meta.url)
const site = await readFile(new URL('src/config/site.ts', ROOT), 'utf8')
const m = site.match(/coordinates:\s*\{\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)/)
if (!m) throw new Error('Не нашёл address.coordinates в site.ts')
const LAT0 = Number(m[1])
const LNG0 = Number(m[2])

/* Холст 1000×720 единиц, 1 единица = 1,5 м → видно 1,5 × 1,1 км */
const W = 1000
const H = 720
const M_PER_UNIT = 1.5
const R = 6378137
const rad = (d) => (d * Math.PI) / 180
const project = (lat, lon) => [
  W / 2 + (rad(lon - LNG0) * Math.cos(rad(LAT0)) * R) / M_PER_UNIT,
  H / 2 - (rad(lat - LAT0) * R) / M_PER_UNIT,
]

/* bbox с запасом на поля */
const dLat = ((H / 2) * M_PER_UNIT * 1.15) / R * (180 / Math.PI)
const dLng = dLat * (W / H) / Math.cos(rad(LAT0))
const B = [LAT0 - dLat, LNG0 - dLng, LAT0 + dLat, LNG0 + dLng].map((n) => n.toFixed(5)).join(',')

const query = `[out:json][timeout:90];(
  way[highway](${B}); way[railway~"^(rail|subway|light_rail)$"](${B});
  way[building](${B}); way[landuse~"^(forest|grass|meadow|recreation_ground)$"](${B});
  way[leisure~"^(park|garden)$"](${B}); way[natural~"^(wood|water|scrub)$"](${B});
  way[waterway~"^(river|stream)$"](${B});
);out geom;`

/* Overpass часто отвечает 504 под нагрузкой — до трёх попыток.
   Можно подать готовый ответ Overpass: node … --from osm.json */
async function overpass() {
  const from = process.argv.indexOf('--from')
  if (from > 0) return JSON.parse(await readFile(process.argv[from + 1], 'utf8'))
  for (let i = 1; ; i++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': 'vfd-moscow-compas map generator', Accept: '*/*' },
      body: new URLSearchParams({ data: query }),
    })
    if (res.ok) return res.json()
    if (i === 3) throw new Error(`Overpass: HTTP ${res.status}`)
    await new Promise((r) => setTimeout(r, 5000 * i))
  }
}
const { elements } = await overpass()

/* Слой по тегам. Пешеходные дорожки и дворовые проезды не рисуем — шум */
const MAJOR = /^(motorway|trunk|primary|secondary)(_link)?$/
const MINOR = /^(tertiary|tertiary_link|residential|unclassified|living_street|pedestrian)$/
function layer(t) {
  if (t.building) return t.shop === 'mall' && /Компас/.test(t.name ?? '') ? 'mall' : 'building'
  if (t.natural === 'water' || t.waterway) return t.waterway ? 'river' : 'water'
  if (t.landuse || t.leisure || t.natural) return 'green'
  // Только главные пути: подъездные и станционные (service=*) — частокол
  if (t.railway) return t.service ? null : 'rail'
  if (t.highway && MAJOR.test(t.highway)) return 'major'
  if (t.highway && MINOR.test(t.highway)) return 'minor'
  return null
}
const CLOSED = new Set(['building', 'mall', 'water', 'green'])

/* Точки ближе 2 единиц (3 м) друг к другу выбрасываем */
function toPath(pts, closed) {
  const out = []
  for (const p of pts) {
    const q = out[out.length - 1]
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 2) out.push(p)
  }
  if (out.length < 2) return ''
  const inView = out.some(([x, y]) => x > -50 && x < W + 50 && y > -50 && y < H + 50)
  if (!inView) return ''
  return 'M' + out.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L') + (closed ? 'Z' : '')
}

const layers = { green: [], water: [], river: [], building: [], minor: [], rail: [], major: [], mall: [] }
const named = new Map() // имя улицы → её отрезки (way)
for (const e of elements) {
  const t = e.tags ?? {}
  const l = layer(t)
  if (!l || !e.geometry) continue
  const pts = e.geometry.map((g) => project(g.lat, g.lon))
  const d = toPath(pts, CLOSED.has(l))
  if (!d) continue
  layers[l].push(d)

  if ((l === 'major' || l === 'minor') && t.name && !/дублёр/.test(t.name)) {
    if (!named.has(t.name)) named.set(t.name, [])
    named.get(t.name).push({ pts, major: l === 'major' })
  }
}

/* Подпись улицы — в середине её самого длинного отрезка, попавшего в кадр
   (не у края и не под меткой салона), по направлению улицы; угол приведён
   к −90…90°, чтобы текст не шёл вверх ногами */
const length = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)
function midpoint(pts) {
  const half = length(pts) / 2
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]]
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (acc + seg >= half) {
      const k = (half - acc) / seg
      let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
      if (angle > 90) angle -= 180
      if (angle < -90) angle += 180
      return { x: (a[0] + (b[0] - a[0]) * k) / W * 100, y: (a[1] + (b[1] - a[1]) * k) / H * 100, angle: Math.round(angle) }
    }
    acc += seg
  }
}
const SHORT = [[/^улица /, 'ул. '], [/ улица$/, ' ул.'], [/^проспект /, 'пр-т '], [/ шоссе$/, ' ш.'], [/ проезд$/, ' пр.'], [/^проезд /, 'пр. ']]
const labels = [...named.entries()].flatMap(([name, ways]) => {
  const best = ways
    .filter((w) => length(w.pts) > 90)
    .map((w) => ({ ...w, len: length(w.pts), at: midpoint(w.pts) }))
    .filter(({ at }) => at.x > 10 && at.x < 90 && at.y > 8 && at.y < 92 && Math.hypot(at.x - 50, at.y - 50) > 12)
    .sort((a, b) => b.len - a.len)[0]
  if (!best) return []
  const text = SHORT.reduce((s, [re, r]) => s.replace(re, r), name)
  return [{ text, x: +best.at.x.toFixed(2), y: +best.at.y.toFixed(2), angle: best.at.angle, major: best.major }]
})

const out = {
  attribution: '© участники OpenStreetMap',
  width: W,
  height: H,
  layers: Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, v.join('')])),
  labels,
}
await writeFile(new URL('src/data/visit-map.json', ROOT), JSON.stringify(out))
console.log('visit-map.json:', JSON.stringify(out).length, 'байт;', labels.map((l) => l.text).join(', '))
