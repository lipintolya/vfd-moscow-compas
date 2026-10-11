/**
 * Строки интерфейса Strapi без русского перевода — в админке, редакторе
 * записей (content-manager) и медиатеке (upload). Наш словарь
 * src/admin/translations/ru.json дополняет перевод Strapi.
 *   node scripts/ru-missing.mjs          — список недостающих (JSON en)
 *   node scripts/ru-missing.mjs --check  — код 1, если что-то не переведено
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const require = createRequire(path.join(ROOT, 'package.json'))
const SOURCES = [
  { pkg: '@strapi/admin', dir: 'dist/admin/admin/src/translations', prefix: '' },
  { pkg: '@strapi/content-manager', dir: 'dist/admin/translations', prefix: 'content-manager.' },
  { pkg: '@strapi/upload', dir: 'dist/admin/translations', prefix: 'upload.' },
]
const load = async (file) => (await import(file)).default
const ours = JSON.parse(await readFile(path.join(ROOT, 'src/admin/translations/ru.json'), 'utf8').catch(() => '{}'))
const missing = {}
for (const { pkg, dir, prefix } of SOURCES) {
  const base = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), dir)
  const en = await load(path.join(base, 'en.json.mjs'))
  const ru = await load(path.join(base, 'ru.json.mjs')).catch(() => ({}))
  for (const [key, text] of Object.entries(en)) {
    const full = prefix + key
    if (!(key in ru) && !(full in ours)) missing[full] = text
  }
}
const count = Object.keys(missing).length
if (process.argv.includes('--check')) {
  console.log(count ? `Не переведено строк: ${count}` : 'Перевод полный')
  process.exit(count ? 1 : 0)
}
console.log(JSON.stringify(missing, null, 2))
