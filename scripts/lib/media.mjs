/**
 * Фото сайта в проекте — общие функции для скриптов.
 *
 * Все картинки, которые раньше лежали в облаке Yandex Cloud, хранятся в
 * public/media/<бакет>/<путь> (тот же путь, что в облаке). В коде на них
 * ссылаются как /media/<бакет>/<путь>. Наполняет папку npm run media:pull.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const ROOT = fileURLToPath(new URL('../..', import.meta.url))
export const CLOUD = 'https://storage.yandexcloud.net/'
export const MEDIA_DIR = path.join(ROOT, 'public', 'media')

/** Облачная ссылка → путь на сайте: https://storage…/bucket/a%20b.webp → /media/bucket/a%20b.webp */
export const cloudToMedia = (url) => `/media/${url.slice(CLOUD.length)}`

/** Путь на сайте или облачная ссылка → файл в public/media (имя — без %-кодирования) */
export function mediaFile(ref) {
  const rel = ref.startsWith(CLOUD) ? ref.slice(CLOUD.length) : ref.replace(/^\/media\//, '')
  return path.join(MEDIA_DIR, ...decodeURIComponent(rel.split(/[?#]/)[0]).split('/'))
}

/**
 * Исходник для скрипта картинок: /media/… или облачная ссылка. Если копия
 * есть в проекте — читаем её, иначе качаем из облака (оригиналы, которых
 * нет на сайте, например рендеры перегородок в полном размере).
 */
export async function loadMedia(ref) {
  if (ref.startsWith('/media/') || ref.startsWith(CLOUD)) {
    const file = mediaFile(ref)
    if (existsSync(file)) return readFile(file)
    if (ref.startsWith('/media/')) throw new Error(`Нет файла ${file} — запустите npm run media:pull`)
  }
  const res = await fetch(ref)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${ref}`)
  return Buffer.from(await res.arrayBuffer())
}
