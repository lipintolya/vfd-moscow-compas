/**
 * Обложка товара для VK Маркета: квадрат с графитовым фоном, дверь вписана
 * по высоте целиком (ВКонтакте обрезает фото до квадрата по центру, и на
 * портретных дверях пропадают верх и низ). Фото — исходник модели из
 * public/media (с прозрачным фоном), собирается при сборке сайта.
 */
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
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

export async function composeCover(photo: string): Promise<Uint8Array> {
  // Адрес в фиде закодирован (пробелы — %20), на диске имя обычное
  const file = await readFile(path.join(process.cwd(), 'public', decodeURI(photo)))
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
