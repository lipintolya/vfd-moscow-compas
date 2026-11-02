/**
 * Фото товара для VK Маркета. VK принимает только JPG, PNG и GIF, а фото
 * модели в public/media — WebP, поэтому каждое фото переснимается в JPG:
 * квадрат 1000×1000 на графитовом фоне, дверь вписана по высоте целиком
 * (ВКонтакте обрезает фото до квадрата по центру, и на портретных дверях
 * пропадают верх и низ). Первое фото — обложка карточки.
 */
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import type { ModelEntry } from './model-entries'
import { offerId, MAX_PICTURES } from './feed-common'

export const PHOTO_SIZE = 1000
/* --color-graphite-card (slate-800) из src/styles/global.css */
export const PHOTO_BG = '#2d2d32'
/* Доля высоты квадрата, которую занимает дверь (остальное — поле графита) */
const DOOR_FILL = 0.9

/** Локальные фото модели по порядку (первое — обложка); внешние адреса (облако) не обкладываем */
export function vkSources(e: ModelEntry): string[] {
  return [...new Set(e.colors.map(c => c.photo))]
    .filter(src => src.startsWith('/media/'))
    .slice(0, MAX_PICTURES)
}

/** Файл исходника на диске (адрес в фиде закодирован: пробелы — %20) */
const sourceFile = (photo: string) => path.join(process.cwd(), 'public', decodeURI(photo))

/**
 * Короткий хеш фото: исходник + настройки композиции. В адресе фото он меняется
 * вместе с картинкой, поэтому площадка скачивает её заново, а не показывает
 * старую копию из прошлого импорта.
 */
async function photoKey(photo: string): Promise<string> {
  const hash = createHash('sha1')
    .update(await readFile(sourceFile(photo)))
    .update(`${PHOTO_SIZE}|${PHOTO_BG}|${DOOR_FILL}`)
  return hash.digest('hex').slice(0, 10)
}

/** Имя файла фото без расширения: <id модели>-<номер>-<хеш>; номер отличает одинаковые фото в одной карточке */
export async function vkPictureFiles(e: ModelEntry): Promise<{ src: string; file: string }[]> {
  return Promise.all(vkSources(e).map(async (src, i) => ({
    src,
    file: `${offerId(e.model.id)}-${i}-${await photoKey(src)}`,
  })))
}

export async function composePhoto(photo: string): Promise<Uint8Array> {
  const file = await readFile(sourceFile(photo))
  const door = await sharp(file)
    .resize({ height: Math.round(PHOTO_SIZE * DOOR_FILL), fit: 'inside' })
    .png()
    .toBuffer()
  const out = await sharp({
    create: { width: PHOTO_SIZE, height: PHOTO_SIZE, channels: 3, background: PHOTO_BG },
  })
    .composite([{ input: door, gravity: 'centre' }])
    .jpeg({ quality: 88 })
    .toBuffer()
  return new Uint8Array(out)
}
