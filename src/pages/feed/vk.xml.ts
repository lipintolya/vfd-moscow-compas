/**
 * src/pages/feed/vk.xml.ts → <SITE.url>/feed/vk.xml
 *
 * Товарный фид (YML) для VK Маркета: импорт в группе ВКонтакте по ссылке
 * (Маркет → Товары → Импорт → YML). Те же товары и те же данные, что и
 * у страниц моделей и у фида Яндекса (lib/model-entries, lib/feed-common),
 * поэтому цена, фото и наличие совпадают с сайтом.
 *
 * Ограничения VK, которые выполняются здесь: до 15 000 товаров в файле
 * (в каталоге сейчас ~160), размер до 8 МБ (сейчас ~0,3 МБ), до 10 фото
 * на товар. Варианты (цвет) не выделяются: цвета — это фото карточки, а
 * характеристики — обычные <param>, то есть не более двух свойств варианта.
 */
import type { APIRoute } from 'astro'
import { getModelEntries } from '../../lib/model-entries'
import { describeTrim } from '../../lib/trim-labels'
import { getSeriesSpec } from '../../data/series-descriptions'
import { BRAND, coatingInline, productName, productDescription } from '../../lib/product-text'
import { SITE } from '../../config/site'
import {
  MAX_PICTURES, COATING_CATEGORY_IDS, ROOT_CATEGORY_ID, xml, offerId, feedDate, isAvailable,
  feedOffers, assertUniqueIds, categoriesXml,
} from '../../lib/feed-common'
import type { ModelEntry } from '../../lib/model-entries'
import { coverSource, coverKey } from '../../lib/vk-cover'

/* Ограничения VK Маркета (справка «Импорт товаров») */
const MAX_OFFERS = 15_000

/* Цена в каталоге — за полотно: сказано в параметре, а не только в описании */
const PRICE_BASIS = 'за полотно, без коробки и наличников'

/** Первое фото — обложка на квадрате с графитом (/feed/vk-covers/…), дальше — фото цветов */
function pictureLines(e: ModelEntry, site: URL, key: string | undefined): string[] {
  const cover = coverSource(e)
  const rest = [...new Set(e.colors.map(c => c.photo))].filter(src => src !== cover)
  const urls = [
    ...(cover && key ? [new URL(`/feed/vk-covers/${offerId(e.model.id)}-${key}.jpg`, site).href] : []),
    ...rest.map(src => new URL(src, site).href),
  ].slice(0, MAX_PICTURES)
  return urls.map(href => `        <picture>${xml(href)}</picture>`)
}

function offerXml(e: ModelEntry, site: URL, key: string | undefined): string {
  const spec     = getSeriesSpec(e.seriesSlug, e.coatingSlug)
  const trim     = describeTrim(e.model.trim)
  const params: [string, string, string?][] = [
    ['Серия', e.seriesName],
    ['Покрытие', e.coatingName],
    ...(trim ? [[trim.kind === 'glass' ? 'Остекление' : 'Кромка', trim.label] as [string, string]] : []),
    ...(spec.thickness ? [['Толщина полотна', spec.thickness, 'мм'] as [string, string, string]] : []),
    ['Цена', PRICE_BASIS],
  ]

  return [
    `      <offer id="${offerId(e.model.id)}" available="${isAvailable(e)}">`,
    `        <name>${xml(productName(e, { withBrand: true }))}</name>`,
    `        <vendor>${xml(BRAND)}</vendor>`,
    `        <url>${xml(new URL(`/models/${e.slug}/`, site).href)}</url>`,
    `        <price>${Math.round(e.minPrice!)}</price>`,
    `        <currencyId>RUR</currencyId>`,
    `        <categoryId>${COATING_CATEGORY_IDS[e.coatingSlug] ?? ROOT_CATEGORY_ID}</categoryId>`,
    ...pictureLines(e, site, key),
    `        <description>${xml(productDescription(e))}</description>`,
    ...params.map(([name, value, unit]) =>
      `        <param name="${xml(name)}"${unit ? ` unit="${xml(unit)}"` : ''}>${xml(value)}</param>`),
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
  assertUniqueIds(offers, 'feed/vk.xml')

  /* Хеш обложки — по каждому товару (см. lib/vk-cover.ts) */
  const keys = new Map(await Promise.all(offers.map(async e => {
    const src = coverSource(e)
    return [e.model.id, src ? await coverKey(src) : undefined] as const
  })))

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
    ...offers.map(e => offerXml(e, base, keys.get(e.model.id))),
    '    </offers>',
    '  </shop>',
    '</yml_catalog>',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
