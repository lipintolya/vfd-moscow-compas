/**
 * Выкладка сайта на сервер (deploy/server.json, вне Git) — готовыми файлами.
 * Сайт собирается здесь: для сборки нужен Strapi (npm run cms), на сервере
 * его нет. Отправляются dist/ и фото Strapi (cms/public/uploads → /uploads/).
 *
 *   npm run deploy                      # сборка, проверки, выкладка
 *   npm run deploy -- --no-build        # выложить уже собранный dist/
 *   npm run server:setup [-- --cert]    # настроить сервер (deploy/setup-server.sh)
 *
 * Перед выкладкой проверяет сборку: все адреса из карты сайта есть в dist/,
 * robots.txt — рабочий (не закрытый от поисковиков, как демо), в страницах
 * нет домена-заглушки, домен сайта совпадает с доменом сервера. Не прошло —
 * ничего не отправляется.
 *
 * Что изменилось — по хэшам СОДЕРЖИМОГО страниц (текст, title, description,
 * разметка, картинки — без имён файлов стилей и скриптов; pageContent в
 * scripts/lib/indexnow.mjs) против прошлой выкладки (deploy/indexnow-state.json,
 * вне Git: хэш и дата его последней смены). До выкладки эта дата становится
 * <lastmod> страницы в карте сайта; после — изменившиеся страницы уходят в
 * IndexNow (Яндекс, Bing): переобход сразу, а не по графику поисковика.
 * Первый раз (и после смены формата состояния) — все страницы.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { contentHashes, changedUrls, nextState, readState, sitemapUrls, submitIndexNow, withLastmod } from './lib/indexnow.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
/* Адрес сервера — локальный deploy/server.json (вне Git: репозиторий публичный),
   образец — deploy/server.example.json */
const SERVER_FILE = path.join(ROOT, 'deploy/server.json')
if (!existsSync(SERVER_FILE)) {
  console.error('Нет deploy/server.json — скопируйте deploy/server.example.json и впишите адрес сервера')
  process.exit(1)
}
const server = JSON.parse(readFileSync(SERVER_FILE, 'utf8'))
const args = process.argv.slice(2)

const run = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit' })
const fail = (msg) => { console.error(`\n✗ ${msg}\nНичего не отправлено.`); process.exit(1) }

/* ── Настройка сервера ── */
if (args[0] === 'setup') {
  const remote = '/root/dveriziz-deploy'
  run('rsync', ['-az', '--delete', 'deploy/', `${server.host}:${remote}/`])
  run('ssh', [server.host, 'bash', `${remote}/setup-server.sh`, ...args.slice(1)])
  process.exit(0)
}

/* ── Сборка ── */
if (!args.includes('--no-build')) run('npm', ['run', 'build'])

/* ── Проверки сборки ── */
const siteUrl = readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8').match(/export const SITE_URL = '([^']+)'/)?.[1]
if (siteUrl !== `https://${server.domain}`) fail(`домен сайта ${siteUrl} не совпадает с доменом сервера ${server.domain} (deploy/server.json)`)

const robots = existsSync(path.join(DIST, 'robots.txt')) ? readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : ''
if (!robots.includes(`Sitemap: ${siteUrl}/`)) fail('robots.txt без карты сайта рабочего домена — соберите сайт заново (npm run build)')
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt закрывает весь сайт от поисковиков (это настройка демо) — соберите заново')

const sitemap = readFileSync(path.join(DIST, 'sitemap-0.xml'), 'utf8')
const missing = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => !existsSync(path.join(DIST, decodeURIComponent(p), p.endsWith('/') ? 'index.html' : '')))
if (missing.length) fail(`в сборке нет страниц из карты сайта: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`)

const htmlFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : [])
const pages = htmlFiles(DIST)
const placeholder = pages.find((f) => readFileSync(f, 'utf8').includes('domain-placeholder'))
if (placeholder) fail(`домен-заглушка в ${path.relative(DIST, placeholder)}`)
console.log(`\n✓ Сборка проверена: ${pages.length} страниц, карта сайта и robots.txt — ${server.domain}`)

/* ── Даты изменения страниц → <lastmod> в карте сайта (до выкладки) ── */
const STATE_FILE = path.join(ROOT, 'deploy/indexnow-state.json')
const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }) // ГГГГ-ММ-ДД
const prevState = readState(existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : null)
const state = nextState(prevState, contentHashes(DIST), today)
for (const f of readdirSync(DIST).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
  const file = path.join(DIST, f)
  writeFileSync(file, withLastmod(readFileSync(file, 'utf8'), siteUrl, state))
}

/* ── Выкладка: страницы, затем фото Strapi ── */
/* Без --chmod: его не знает openrsync из macOS; права файлов переносятся
   как есть (644/755) — nginx их читает */
const rsync = ['-az', '--delete']
run('rsync', [...rsync, '--exclude', '/uploads/', 'dist/', `${server.host}:${server.webRoot}/`])
run('rsync', [...rsync, '--exclude', '.gitkeep', 'cms/public/uploads/', `${server.host}:${server.webRoot}/uploads/`])
console.log(`\n✓ Выложено: https://${server.domain}`)

/* ── IndexNow: страницы с изменившимся содержимым — Яндексу и Bing ── */
const indexNowKey = readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8').match(/indexNowKey: '([0-9a-f]+)'/)?.[1]
const toSubmit = changedUrls(siteUrl, prevState, state, sitemapUrls(DIST))
if (!indexNowKey) console.warn('IndexNow: нет SITE.indexNowKey — поисковикам не сообщено')
else if (!toSubmit.length) console.log('IndexNow: изменившихся страниц нет')
else {
  const results = await submitIndexNow(siteUrl, indexNowKey, toSubmit)
  console.log(`IndexNow: ${toSubmit.length} стр. → ${results.join(', ')}`)
}
writeFileSync(STATE_FILE, JSON.stringify(state))
