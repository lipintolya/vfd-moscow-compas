/**
 * Генерирует public/og/about.jpg — превью ссылки на /about/ в соцсетях
 * и мессенджерах (og:image, 1200×630).
 *
 * Карточка вёрстается как HTML со шрифтом сайта (Manrope из public/fonts)
 * и снимается headless Chrome — так текст набран тем же шрифтом, что на
 * сайте (sharp/SVG шрифт woff2 не подхватит). Тексты и цвета не
 * дублируются: имя студии и адрес читаются из src/config/site.ts,
 * вторая часть заголовка — COLLAB_PARTNER из src/data/about-page.ts,
 * цвета — из токенов src/styles/global.css.
 *
 * JPEG, а не WebP: WebP в превью понимают не все мессенджеры.
 *
 * Запуск:        node scripts/gen-og-about.mjs
 *                (Chrome не по стандартному пути macOS — CHROME_PATH=...)
 * Перед запуском: node scripts/gen-about-images.mjs (нужен founder-640.webp)
 * Когда запускать снова: сменился портрет, название студии или адрес.
 */
import sharp from 'sharp'
import { spawn } from 'node:child_process'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const W = 1200
const H = 630
const root = (p) => new URL(`../${p}`, import.meta.url)
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/* ── Данные — из конфига и токенов ── */
const site = await readFile(root('src/config/site.ts'), 'utf-8')
const aboutData = await readFile(root('src/data/about-page.ts'), 'utf-8')
const css = await readFile(root('src/styles/global.css'), 'utf-8')
const pick = (src, re, what) => {
  const m = src.match(re)
  if (!m) throw new Error(`Не найдено: ${what}`)
  return m[1]
}
const studio = pick(site, /studioName:\s*'([^']+)'/, 'SITE.studioName')
const mall = pick(site, /mall:\s*'([^']+)'/, 'SITE.address.mall')
const street = pick(site, /street:\s*'([^']+)'/, 'SITE.address.street')
const partner = pick(aboutData, /COLLAB_PARTNER = '([^']+)'/, 'COLLAB_PARTNER')
const cityIn = pick(site, /\bin:\s*'([^']+)'/, 'SITE.city.in')
const color = (name) => pick(css, new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})`), `--color-${name}`)
const c = {
  bg: color('slate-950'), white: '#fff', soft: color('slate-300'), muted: color('slate-400'), x: color('slate-500'),
}

const file = (p) => fileURLToPath(root(p))
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Manrope; src: url('file://${file('public/fonts/manrope-cyrillic-wght-normal.woff2')}') format('woff2'); font-weight: 200 800; unicode-range: U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116; }
@font-face { font-family: Manrope; src: url('file://${file('public/fonts/manrope-latin-wght-normal.woff2')}') format('woff2'); font-weight: 200 800; }
* { box-sizing: border-box; margin: 0; }
body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${c.bg}; color: ${c.white}; font-family: Manrope, sans-serif; }
.card { position: relative; display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 72px; }
.photo { position: absolute; top: 0; right: 0; width: ${H}px; height: ${H}px; object-fit: cover;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 40%); }
.text { position: relative; max-width: 720px; }
.kicker { font-size: 20px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${c.muted}; }
h1 { margin-top: 28px; font-size: 76px; font-weight: 560; line-height: 1.02; letter-spacing: -0.04em; }
h1 .x { font-weight: 200; color: ${c.x}; }
.lead { margin-top: 28px; font-size: 28px; line-height: 1.4; color: ${c.soft}; max-width: 600px; }
.foot { position: relative; font-size: 22px; font-weight: 500; color: ${c.muted}; }
</style></head><body><div class="card">
<img class="photo" src="file://${file('public/renders/about/founder-640.webp')}">
<div class="text">
  <p class="kicker">Двери ${cityIn}</p>
  <h1>${studio}<br><span class="x">×</span> ${partner}</h1>
  <p class="lead">Семейный бизнес с&nbsp;2014 года. Межкомнатные двери ${cityIn.replace(' ', '&nbsp;')}</p>
</div>
<p class="foot">${mall}, ${street}</p>
</div></body></html>`

/* ── Снимок в headless Chrome (CDP через встроенный WebSocket Node ≥ 22) ── */
const tmp = join(tmpdir(), `og-about-${Date.now()}`)
await mkdir(tmp, { recursive: true })
const page = join(tmp, 'card.html')
await writeFile(page, html)

const port = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmp, 'profile')}`,
  '--allow-file-access-from-files', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
try {
  let tabs
  for (let i = 0; i < 50 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(200) }
  }
  if (!tabs) throw new Error('Chrome не запустился — проверьте CHROME_PATH')
  const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  })
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })

  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  await send('Page.enable')
  await send('Page.navigate', { url: `file://${page}` })
  // Ждём шрифты и картинку
  await send('Runtime.evaluate', {
    expression: `Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())])`,
    awaitPromise: true,
  })
  await sleep(300)
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })
  ws.close()

  const out = await sharp(Buffer.from(data, 'base64')).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
  await mkdir(root('public/og/'), { recursive: true })
  await writeFile(root('public/og/about.jpg'), out)
  console.log(`public/og/about.jpg: ${W}×${H}, ${(out.length / 1024).toFixed(0)}KB`)
} finally {
  // Профиль удаляем после выхода Chrome — иначе он ещё пишет в папку
  const exited = new Promise((r) => chrome.once('exit', r))
  chrome.kill()
  await Promise.race([exited, sleep(5000)])
  await rm(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
