/**
 * src/pages/feed/vk.xml.ts → <SITE.url>/feed/vk.xml (та же выгрузка — /feed/vk.yml)
 *
 * Товарный фид (YML) для VK Маркета: импорт в группе ВКонтакте по ссылке
 * (Маркет → Товары → Импорт → YML). Те же товары и те же данные, что и
 * у страниц моделей и у фида Яндекса (lib/model-entries, lib/feed-common),
 * поэтому цена, фото и наличие совпадают с сайтом.
 *
 * Требования VK (справка «Импорт товаров», раздел «Требования к YML-файлу»),
 * которые выполняются здесь: до 15 000 товаров в файле (в каталоге ~160), размер
 * до 8 МБ (сейчас ~0,3 МБ), не более 2 свойств (param) у товара, фото только
 * JPG/PNG/GIF минимум 400×400 (lib/vk-photo.ts), без HTML в описании, до 10 фото.
 * Варианты (цвет) не выделяются: цвета — это фото карточки.
 *
 * В этот же файл — входные двери (lib/vk-entrance): после межкомнатных, с
 * другими id и категорией. Межкомнатные строки от этого не меняются, поэтому
 * повторный импорт по той же ссылке добавляет двери, а не заменяет каталог.
 */
import type { APIRoute } from 'astro'
import { getModelEntries } from '../../lib/model-entries'
import { BRAND, coatingInline, productName, productDescription } from '../../lib/product-text'
import { SITE } from '../../config/site'
import {
  MAX_PICTURES, COATING_CATEGORY_IDS, ROOT_CATEGORY_ID, xml, vkOfferId, feedDate, isAvailable,
  feedOffers, assertUniqueIds, categoriesXml,
} from '../../lib/feed-common'
import type { ModelEntry } from '../../lib/model-entries'
import { vkPictureFiles, type VkPicture } from '../../lib/vk-photo'
import { ENTRANCE_DOORS, type EntranceDoor } from '../../data/entrance-doors'
import {
  ENTRANCE_CATEGORY_ID, ENTRANCE_CATEGORY_NAME, vkEntranceId, entrancePictureFiles,
  entranceGroupName, entranceDescription,
} from '../../lib/vk-entrance'

/* Ограничения VK Маркета (справка «Импорт товаров») */
const MAX_OFFERS = 15_000

/* Цена в каталоге — за полотно: в описании, потому что свойств не больше двух */
const PRICE_BASIS = 'Цена — за полотно, без коробки и наличников.'

/** Фото карточки: /feed/vk-photos/… (первое — обложка), адреса совпадают с файлами сборки */
function pictureLines(site: URL, files: { file: string }[]): string[] {
  return files
    .slice(0, MAX_PICTURES)
    .map(({ file }) => `        <picture>${xml(new URL(`/feed/vk-photos/${file}.jpg`, site).href)}</picture>`)
}

function offerXml(e: ModelEntry, site: URL, files: { file: string }[]): string {
  /* Два свойства — лимит VK; толщина и кромка уже в описании (productDescription) */
  const params: [string, string][] = [
    ['Серия', e.seriesName],
    ['Покрытие', e.coatingName],
  ]

  return [
    `      <offer id="${vkOfferId(e.model.id)}" available="${isAvailable(e)}">`,
    `        <name>${xml(productName(e, { withBrand: true }))}</name>`,
    `        <vendor>${xml(BRAND)}</vendor>`,
    `        <url>${xml(new URL(`/models/${e.slug}/`, site).href)}</url>`,
    `        <price>${Math.round(e.minPrice!)}</price>`,
    `        <currencyId>RUR</currencyId>`,
    `        <categoryId>${COATING_CATEGORY_IDS[e.coatingSlug] ?? ROOT_CATEGORY_ID}</categoryId>`,
    ...pictureLines(site, files),
    `        <description>${xml(`${productDescription(e)} ${PRICE_BASIS}`)}</description>`,
    ...params.map(([name, value]) => `        <param name="${xml(name)}">${xml(value)}</param>`),
    `      </offer>`,
  ].join('\n')
}

/** Входная дверь: без поставщика, два свойства; фото — на белом (lib/vk-entrance.ts) */
function entranceOfferXml(d: EntranceDoor, site: URL, files: VkPicture[]): string {
  const params: [string, string][] = [
    ['Тип', entranceGroupName(d)],
    ['Открывание', d.opening],
  ]

  return [
    `      <offer id="${vkEntranceId(d.id)}" available="true">`,
    `        <name>${xml(d.title)}</name>`,
    `        <url>${xml(new URL(d.href, site).href)}</url>`,
    `        <price>${Math.round(d.from)}</price>`,
    `        <currencyId>RUR</currencyId>`,
    `        <categoryId>${ENTRANCE_CATEGORY_ID}</categoryId>`,
    ...pictureLines(site, files),
    `        <description>${xml(entranceDescription(d))}</description>`,
    ...params.map(([name, value]) => `        <param name="${xml(name)}">${xml(value)}</param>`),
    `      </offer>`,
  ].join('\n')
}

export const GET: APIRoute = async ({ site }) => {
  const base    = site ?? new URL(SITE.url)
  const entries = await getModelEntries()

  /* Пустой фид площадка воспримет как «весь каталог снят с продажи» — при
     сбое базы лучше уронить сборку, чем опубликовать такой файл. */
  if (entries.length === 0) {
    throw new Error('[feed/vk.xml] Supabase не вернул ни одной модели — пустой фид не публикуем')
  }

  const offers = feedOffers(entries)
  const entrance = ENTRANCE_DOORS
  if (offers.length + entrance.length > MAX_OFFERS) {
    throw new Error(`[feed/vk.xml] ${offers.length + entrance.length} товаров — больше лимита VK (${MAX_OFFERS}), нужно делить на файлы`)
  }
  assertUniqueIds(offers, 'feed/vk.xml', vkOfferId)
  /* Межкомнатные и входные — в одном файле: их id не должны совпасть (VK сольёт товары) */
  const ids = [...offers.map(e => vkOfferId(e.model.id)), ...entrance.map(d => vkEntranceId(d.id))]
  if (new Set(ids).size !== ids.length) {
    throw new Error('[feed/vk.xml] повторяются id товаров: межкомнатные и входные двери')
  }

  /* Файлы фото по каждому товару (см. lib/vk-photo.ts, lib/vk-entrance.ts) */
  const pictures = new Map(await Promise.all(offers.map(async e =>
    [e.model.id, await vkPictureFiles(e)] as const)))
  const entrancePictures = new Map(await Promise.all(entrance.map(async d =>
    [d.id, await entrancePictureFiles(d)] as const)))

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<yml_catalog date="${feedDate()}">`,
    '  <shop>',
    `    <name>${xml(SITE.studioName)}</name>`,
    `    <company>${xml(SITE.fullName)}</company>`,
    `    <url>${xml(base.href)}</url>`,
    '    <currencies>',
    '      <currency id="RUR" rate="1"/>',
    '    </currencies>',
    '    <categories>',
    ...categoriesXml(offers, coatingInline),
    `      <category id="${ENTRANCE_CATEGORY_ID}">${xml(ENTRANCE_CATEGORY_NAME)}</category>`,
    '    </categories>',
    '    <offers>',
    ...offers.map(e => offerXml(e, base, pictures.get(e.model.id) ?? [])),
    ...entrance.map(d => entranceOfferXml(d, base, entrancePictures.get(d.id) ?? [])),
    '    </offers>',
    '  </shop>',
    '</yml_catalog>',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
