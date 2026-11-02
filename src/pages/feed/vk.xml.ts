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
import { vkPictureFiles } from '../../lib/vk-photo'

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

export const GET: APIRoute = async ({ site }) => {
  const base    = site ?? new URL(SITE.url)
  const entries = await getModelEntries()

  /* Пустой фид площадка воспримет как «весь каталог снят с продажи» — при
     сбое базы лучше уронить сборку, чем опубликовать такой файл. */
  if (entries.length === 0) {
    throw new Error('[feed/vk.xml] Supabase не вернул ни одной модели — пустой фид не публикуем')
  }

  const offers = feedOffers(entries)
  if (offers.length > MAX_OFFERS) {
    throw new Error(`[feed/vk.xml] ${offers.length} товаров — больше лимита VK (${MAX_OFFERS}), нужно делить на файлы`)
  }
  assertUniqueIds(offers, 'feed/vk.xml', vkOfferId)

  /* Файлы фото по каждому товару (см. lib/vk-photo.ts) */
  const pictures = new Map(await Promise.all(offers.map(async e =>
    [e.model.id, await vkPictureFiles(e)] as const)))

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
    '    </categories>',
    '    <offers>',
    ...offers.map(e => offerXml(e, base, pictures.get(e.model.id) ?? [])),
    '    </offers>',
    '  </shop>',
    '</yml_catalog>',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
