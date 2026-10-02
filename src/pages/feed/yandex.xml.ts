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
import { isMadeToOrder } from '../../lib/made-to-order'
import { describeTrim } from '../../lib/trim-labels'
import { companyLegalInfo } from '../../lib/contacts-data'
import { getSeriesSpec } from '../../data/series-descriptions'
import { BRAND, coatingInline, productName, productDescription } from '../../lib/product-text'
import { SITE } from '../../config/site'

const ROOT_CATEGORY_ID = 1
const ROOT_CATEGORY_NAME = 'Межкомнатные двери'

/* id категорий — постоянные: Яндекс привязывает к ним товары между
   обновлениями фида. Покрытие, которого здесь нет (новое в базе), уходит
   в корневую категорию — фид остаётся валидным; тогда добавить id сюда. */
const COATING_CATEGORY_IDS: Record<string, number> = {
  pet:      11,
  emal:     12,
  emalex:   13,
  protach:  14,
  ekoshpon: 15,
}

const MAX_PICTURES = 10
const SALES_NOTES = 'Цена за полотно, без коробки и наличников'

const xml = (s: string | number) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

/** UUID модели без дефисов, первые 20 символов — постоянный и уникальный. */
const offerId = (modelId: string) => modelId.replaceAll('-', '').slice(0, 20)

/** RFC 3339 с часовым поясом Москвы (UTC+5, без перехода на летнее время). */
function feedDate(): string {
  const local = new Date(Date.now() + 5 * 60 * 60 * 1000)
  return `${local.toISOString().slice(0, 19)}+05:00`
}

/** В наличии, если хоть один цвет модели не «под заказ» (как бейдж на сайте). */
const isAvailable = (e: ModelEntry) =>
  e.colors.some(c => !isMadeToOrder(e.seriesSlug, e.model.id, c.name))

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
    ...pictures.map(src => `        <picture>${xml(src)}</picture>`),
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
  const offers = entries.filter(e => e.minPrice && e.colors.length > 0)

  const ids = new Set(offers.map(e => offerId(e.model.id)))
  if (ids.size !== offers.length) {
    throw new Error('[feed/yandex.xml] совпали id офферов — нужен другой способ сокращения UUID')
  }

  const usedCoatings = [...new Map(
    offers
      .filter(e => COATING_CATEGORY_IDS[e.coatingSlug])
      .map(e => [e.coatingSlug, e] as const),
  ).values()]

  const categories = [
    `      <category id="${ROOT_CATEGORY_ID}">${xml(ROOT_CATEGORY_NAME)}</category>`,
    ...usedCoatings
      .sort((a, b) => COATING_CATEGORY_IDS[a.coatingSlug]! - COATING_CATEGORY_IDS[b.coatingSlug]!)
      .map(e =>
        `      <category id="${COATING_CATEGORY_IDS[e.coatingSlug]}" parentId="${ROOT_CATEGORY_ID}">${xml(`${ROOT_CATEGORY_NAME} ${coatingInline(e)}`)}</category>`),
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<yml_catalog date="${feedDate()}">`,
    '  <shop>',
    '    <name>Салон дверей ВФД</name>',
    `    <company>${xml(companyLegalInfo.fullName)}</company>`,
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
