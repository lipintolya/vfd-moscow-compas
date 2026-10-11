/**
 * Сравнение двух сборок сайта: какие страницы изменились по видимому
 * тексту (без стилей, скриптов, служебных атрибутов).
 *   node scripts/compare-builds.mjs <старая dist> <новая dist> [--only=/portfolio/]
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
const [a, b] = process.argv.slice(2)
const only = process.argv.find((x) => x.startsWith('--only='))?.slice(7)
const walk = async (dir, out = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, out); else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}
const text = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const files = (await walk(a)).map((f) => path.relative(a, f)).filter((f) => !only || `/${f}`.startsWith(only))
let changed = 0
for (const f of files) {
  const before = text(await readFile(path.join(a, f), 'utf8'))
  const after = await readFile(path.join(b, f), 'utf8').then(text).catch(() => null)
  if (after === null) { console.log(`нет страницы: ${f}`); changed++; continue }
  if (before !== after) {
    changed++
    const i = [...before].findIndex((c, k) => c !== after[k])
    console.log(`изменилась: ${f}\n  было:  …${before.slice(Math.max(0, i - 60), i + 80)}\n  стало: …${after.slice(Math.max(0, i - 60), i + 80)}`)
  }
}
console.log(`Страниц: ${files.length}, изменились: ${changed}`)
process.exit(changed ? 1 : 0)
