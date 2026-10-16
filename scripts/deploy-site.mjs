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
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

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

/* ── Выкладка: страницы, затем фото Strapi ── */
/* Без --chmod: его не знает openrsync из macOS; права файлов переносятся
   как есть (644/755) — nginx их читает */
const rsync = ['-az', '--delete']
run('rsync', [...rsync, '--exclude', '/uploads/', 'dist/', `${server.host}:${server.webRoot}/`])
run('rsync', [...rsync, '--exclude', '.gitkeep', 'cms/public/uploads/', `${server.host}:${server.webRoot}/uploads/`])
console.log(`\n✓ Выложено: https://${server.domain}`)
