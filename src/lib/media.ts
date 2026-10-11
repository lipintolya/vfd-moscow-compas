/**
 * Фото каталога из Supabase → копия в проекте.
 *
 * Модели, цвета и цены правятся в Supabase, а в photo_url там — ссылки на
 * облако Yandex Cloud. Сайт отдаёт фото со своего сервера: копии лежат в
 * public/media/<бакет>/<путь> (npm run media:pull), и облачная ссылка
 * заменяется на /media/<бакет>/<путь>.
 *
 * Нет копии (новое фото в базе, media:pull ещё не запускали) — остаётся
 * облачная ссылка, сборка предупреждает. Только для сборки (node:fs) —
 * в клиентский код не импортировать.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

const CLOUD = 'https://storage.yandexcloud.net/'
const PUBLIC_DIR = path.resolve('public')
const warned = new Set<string>()

export function localMedia(url: string): string
export function localMedia(url: string | null | undefined): string | null | undefined
export function localMedia(url: string | null | undefined) {
  if (!url?.startsWith(CLOUD)) return url
  const rel = url.slice(CLOUD.length)
  const file = path.join(PUBLIC_DIR, 'media', ...decodeURIComponent(rel).split('/'))
  if (existsSync(file)) return `/media/${rel}`
  if (!warned.has(url)) {
    warned.add(url)
    console.warn(`[media] нет копии в проекте: ${url} — запустите npm run media:pull`)
  }
  return url
}
