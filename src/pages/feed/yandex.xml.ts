/**
 * src/pages/feed/yandex.xml.ts → <SITE.url>/feed/yandex.xml
 *
 * Товарный фид (YML) для Яндекс Товаров / Вебмастера: двери каталога
 * показываются в поиске Яндекса карточками с фото и ценой. Собирается при
 * каждой сборке из тех же данных, что и страницы моделей (lib/model-entries),
 * поэтому цена/фото/наличие в фиде всегда совпадают с сайтом — Яндекс это
 * сверяет и снимает с показа товары с расхождениями.
 *
 * Требования — справка Яндекс Товаров (yandex.ru/support/merchants):
 * - id оффера — до 20 символов, латиница/цифры, постоянный между выгрузками;
 * - name — тип + бренд + модель + признаки, без цены/«купить»/магазина;
 * - description обязателен, без цены, доставки, контактов и рекламы;
 * - available="false" — товара нет в наличии, в поиск не попадает;
 * - условия доставки из фида в поиске больше не показываются — задаются
 *   в кабинете Яндекс Товаров, поэтому delivery-options здесь нет;
 * - country_of_origin, manufacturer_warranty и др. маркетовские элементы
 *   для Товаров использовать нельзя.
 */
import type { APIRoute } from 'astro'
import { getModelEntries } from '../../lib/model-entries'
import type { ModelEntry } from '../../lib/model-entries'
import { describeTrim } from '../../lib/trim-labels'
import { companyLegalInfo } from '../../lib/contacts-data'
import { getSeriesSpec } from '../../data/series-descriptions'
import { BRAND, coatingInline, productName, productDescription } from '../../lib/product-text'
import { SITE } from '../../config/site'
import {
  MAX_PICTURES, ROOT_CATEGORY_ID, COATING_CATEGORY_IDS, xml, offerId, feedDate, isAvailable,
  feedOffers, assertUniqueIds, categoriesXml,
} from '../../lib/feed-common'

const SALES_NOTES = 'Цена за полотно, без коробки и наличников'

function offerXml(e: ModelEntry, site: URL): string {
  const spec     = getSeriesSpec(e.seriesSlug, e.coatingSlug)
  const trim     = describeTrim(e.model.trim)
  const pictures = [...new Set(e.colors.map(c => c.photo))].slice(0, MAX_PICTURES)
  const params: [string, string, string?][] = [
    ['Серия', e.seriesName],
    ['Покрытие', e.coatingName],
    ...(trim ? [[trim.kind === 'glass' ? 'Остекление' : 'Кромка', trim.label] as [string, string]] : []),
    ...(spec.thickness ? [['Толщина полотна', spec.thickness, 'мм'] as [string, string, string]] : []),
  ]

  return [
    `      <offer id="${offerId(e.model.id)}" available="${isAvailable(e)}">`,
    `        <name>${xml(productName(e, { withBrand: true }))}</name>`,
    `        <vendor>${xml(BRAND)}</vendor>`,
    `        <url>${xml(new URL(`/models/${e.slug}/`, site).href)}</url>`,
    `        <price>${Math.round(e.minPrice!)}</price>`,
    `        <currencyId>RUR</currencyId>`,
    `        <categoryId>${COATING_CATEGORY_IDS[e.coatingSlug] ?? ROOT_CATEGORY_ID}</categoryId>`,
    // Фото — в проекте (/media/…): Яндексу нужен полный адрес
    ...pictures.map(src => `        <picture>${xml(new URL(src, site).href)}</picture>`),
    `        <delivery>true</delivery>`,
    `        <description>${xml(productDescription(e))}</description>`,
    `        <sales_notes>${xml(SALES_NOTES)}</sales_notes>`,
    ...params
      .filter(([, value]) => value)
      .map(([name, value, unit]) =>
        `        <param name="${xml(name)}"${unit ? ` unit="${xml(unit)}"` : ''}>${xml(value)}</param>`),
    `      </offer>`,
  ].join('\n')
}

export const GET: APIRoute = async ({ site }) => {
  const base    = site ?? new URL(SITE.url)
  const entries = await getModelEntries()

  /* Пустой фид Яндекс воспримет как «все товары сняты с продажи» — при сбое
     Supabase лучше уронить сборку (деплой прервётся, на сайте останется
     прошлая версия), чем опубликовать такой фид. */
  if (entries.length === 0) {
    throw new Error('[feed/yandex.xml] Supabase не вернул ни одной модели — пустой фид не публикуем')
  }

  // Без цены и фото Яндекс товар не примет — такие модели в фид не идут.
  const offers = feedOffers(entries)
  assertUniqueIds(offers, 'feed/yandex.xml')
  const categories = categoriesXml(offers, coatingInline)

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<yml_catalog date="${feedDate()}">`,
    '  <shop>',
    `    <name>${xml(SITE.studioName)}</name>`,
    `    <company>${xml(companyLegalInfo.shortName)}</company>`,
    `    <url>${xml(base.href)}</url>`,
    '    <currencies>',
    '      <currency id="RUR" rate="1"/>',
    '    </currencies>',
    '    <categories>',
    ...categories,
    '    </categories>',
    '    <offers>',
    ...offers.map(e => offerXml(e, base)),
    '    </offers>',
    '  </shop>',
    '</yml_catalog>',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
