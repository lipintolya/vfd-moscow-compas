/**
 * Строки интерфейса Strapi без русского перевода — в админке, редакторе
 * записей (content-manager) и медиатеке (upload). Наш словарь
 * src/admin/translations/ru.json дополняет перевод Strapi.
 *
 * Три проверки:
 *  - словарь: ключи английского перевода Strapi, которых нет ни в его
 *    русском, ни в нашем;
 *  - разметка: русская строка с ошибкой ICU (например, у plural нет other) —
 *    Strapi такую не показывает, выводит английскую;
 *  - код: строки, заданные прямо в коде (formatMessage с defaultMessage),
 *    которых нет ни в одном словаре — Strapi показывает их по-английски.
 *    Старая медиатека (legacy) не проверяется — включена новая.
 *
 *   node scripts/ru-missing.mjs          — список недостающих (JSON en)
 *   node scripts/ru-missing.mjs --check  — код 1, если что-то не переведено
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const require = createRequire(path.join(ROOT, 'package.json'))
const SOURCES = [
  { pkg: '@strapi/admin', dir: 'dist/admin/admin/src/translations', code: 'dist/admin', prefix: '' },
  { pkg: '@strapi/content-manager', dir: 'dist/admin/translations', code: 'dist/admin', prefix: 'content-manager.' },
  { pkg: '@strapi/upload', dir: 'dist/admin/translations', code: 'dist/admin', prefix: 'upload.' },
]
const load = async (file) => (await import(file)).default
const ours = JSON.parse(await readFile(path.join(ROOT, 'src/admin/translations/ru.json'), 'utf8').catch(() => '{}'))

/* разбор ICU — тем же парсером, что у админки Strapi */
const { parse } = createRequire(require.resolve('@strapi/admin/package.json'))('@formatjs/icu-messageformat-parser')
const broken = (text) => { try { parse(text); return false } catch { return true } }

/* все ключи всех словарей Strapi — с префиксом плагина, как их видит админка */
const known = new Set(Object.keys(ours))
const missing = {}
for (const { pkg, dir, prefix } of SOURCES) {
  const base = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), dir)
  const en = await load(path.join(base, 'en.json.mjs'))
  const ru = await load(path.join(base, 'ru.json.mjs')).catch(() => ({}))
  for (const key of [...Object.keys(en), ...Object.keys(ru)]) known.add(prefix + key)
  for (const [key, text] of Object.entries(en)) {
    const full = prefix + key
    const final = ours[full] ?? ru[key]
    if (final === undefined || broken(final)) missing[full] = text
  }
}

/* и весь наш словарь — без ошибок разметки */
for (const [key, text] of Object.entries(ours)) if (broken(text)) missing[key] = text

const walk = async (dir, out = []) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (!['translations', 'legacy'].includes(e.name)) await walk(p, out) }
    else if (p.endsWith('.mjs')) out.push(p)
  }
  return out
}
/* id: 'key', defaultMessage: '…'  или  id: getTrad('key'), defaultMessage: '…' */
const MESSAGE = /id:\s*(getTrad\(|getTranslation\()?\s*(['"`])([\w.:-]+)\2\)?\s*,\s*defaultMessage:\s*(['"`])((?:\\.|(?!\4).)*)\4/g
for (const { pkg, code, prefix } of SOURCES) {
  for (const file of await walk(path.join(path.dirname(require.resolve(`${pkg}/package.json`)), code))) {
    for (const m of (await readFile(file, 'utf8')).matchAll(MESSAGE)) {
      const id = (m[1] ? prefix : '') + m[3]
      if (!known.has(id) && !(id in missing)) missing[id] = m[5].replace(/\\(['"`])/g, '$1')
    }
  }
}

const count = Object.keys(missing).length
if (process.argv.includes('--check')) {
  console.log(count ? `Не переведено строк: ${count}` : 'Перевод полный')
  process.exit(count ? 1 : 0)
}
console.log(JSON.stringify(missing, null, 2))
