/**
 * Обложка товара для VK Маркета: квадрат с графитовым фоном, дверь вписана
 * по высоте целиком (ВКонтакте обрезает фото до квадрата по центру, и на
 * портретных дверях пропадают верх и низ). Фото — исходник модели из
 * public/media (с прозрачным фоном), собирается при сборке сайта.
 */
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import type { ModelEntry } from './model-entries'

export const COVER_SIZE = 1000
/* --color-graphite-card (slate-800) из src/styles/global.css */
export const COVER_BG = '#2d2d32'
/* Доля высоты квадрата, которую занимает дверь (остальное — поле графита) */
const DOOR_FILL = 0.9

/** Локальное фото первого цвета модели; внешние адреса (облако) не обкладываем */
export function coverSource(e: ModelEntry): string | undefined {
  const photo = e.colors[0]?.photo
  return photo?.startsWith('/media/') ? photo : undefined
}

/** Файл исходника на диске (адрес в фиде закодирован: пробелы — %20) */
const sourceFile = (photo: string) => path.join(process.cwd(), 'public', decodeURI(photo))

/**
 * Короткий хеш обложки: фото + настройки композиции. В адресе обложки он
 * меняется вместе с картинкой, поэтому площадка скачивает её заново, а не
 * показывает старую копию из прошлого импорта.
 */
export async function coverKey(photo: string): Promise<string> {
  const hash = createHash('sha1')
    .update(await readFile(sourceFile(photo)))
    .update(`${COVER_SIZE}|${COVER_BG}|${DOOR_FILL}`)
  return hash.digest('hex').slice(0, 10)
}

export async function composeCover(photo: string): Promise<Uint8Array> {
  const file = await readFile(sourceFile(photo))
  const door = await sharp(file)
    .resize({ height: Math.round(COVER_SIZE * DOOR_FILL), fit: 'inside' })
    .png()
    .toBuffer()
  const out = await sharp({
    create: { width: COVER_SIZE, height: COVER_SIZE, channels: 3, background: COVER_BG },
  })
    .composite([{ input: door, gravity: 'centre' }])
    .jpeg({ quality: 88 })
    .toBuffer()
  return new Uint8Array(out)
}
