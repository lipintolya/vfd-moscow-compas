/**
 * Генерирует public/renders/about/*.webp — уменьшенные локальные копии
 * картинок страницы /about и аватарку разработчика для модалки футера. Тот же приём,
 * что и gen-hero-mobile.mjs/gen-hero-bento.mjs: оригиналы на Yandex Cloud
 * storage лежат в 1920×2560 (300-750КБ каждая), а реальный экранный размер
 * в вёрстке в разы меньше — hero-фото и director помещаются в максимум
 * ~900px по ширине, feature-links карточки — ~700px, галерея жёстко
 * задана 480×600.
 *
 * Запуск:        node scripts/gen-about-images.mjs
 * Когда запускать снова: если исходники в about-data.ts поменяли на другие URL.
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT_DIR = new URL('../public/renders/about/', import.meta.url)
await mkdir(OUT_DIR, { recursive: true })

/* Фото салона для /about/ убраны: прежние снимки были другого салона.
   Когда появятся фото салона в ТЦ «Компас» — добавить задания сюда
   в формате { src, out, width, quality } и вывести их на /about/. */
const jobs = []

for (const { src, out, width, quality } of jobs) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer()
  await writeFile(new URL(out, OUT_DIR), resized)
  console.log(`${out}: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}

/* Аватарка разработчика в модалке футера — показывается квадратом 64×64.
   Оригинал — квадрат 460×460, где лицо занимает небольшую часть кадра
   (фото на фоне гор/неба): без кропа на 64px лицо было бы крошечным.
   Вырезаем квадрат по голове и плечам (подобран по кадру), затем 160×160
   под retina — избыточные байты не грузим. */
{
  const src = 'https://storage.yandexcloud.net/vfd74ru/Main_page_perfomance-covers/161125105.webp'
  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} на ${src}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const resized = await sharp(buf)
    .extract({ left: 118, top: 70, width: 280, height: 280 })
    .resize({ width: 160, height: 160, fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()
  await writeFile(new URL('avatar-al-2-160.webp', OUT_DIR), resized)
  console.log(`avatar-al-2-160.webp: ${(buf.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`)
}
