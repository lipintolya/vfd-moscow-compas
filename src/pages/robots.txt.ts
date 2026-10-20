/* robots.txt — собирается из конфига: домен в Sitemap берётся из
   SITE.url, а не вписывается вручную (раньше это был статический файл,
   который надо было не забыть поправить при смене домена).
   Clean-param (Яндекс; Google его не читает и склеивает по canonical) —
   метки рекламы и фильтры в адресе: ?series=…, ?utm_source=… не плодят
   дубли страниц в индексе. Параметры фильтров — из констант, которые
   читают и пишут сами фильтры. */
import type { APIRoute } from 'astro'
import { SITE } from '../config/site'
import { CATALOG_URL_PARAMS } from '../lib/catalog-filter'
import { ALUM_PAGE, ALUM_URL_PARAMS } from '../data/alum-partitions'
import { HIDDEN_URL_PARAMS } from '../lib/hidden-door-price'

/** Метки рекламы и переходов — у любого адреса */
const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'ysclid', 'gclid', 'fbclid', 'from', '_openstat']
const clean = (params: readonly string[], path?: string) => `Clean-param: ${params.join('&')}${path ? ` ${path}` : ''}`

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /privacy',
      'Disallow: /consent',
      '',
      clean(TRACKING_PARAMS),
      clean(CATALOG_URL_PARAMS, '/catalog/'),
      clean(ALUM_URL_PARAMS, ALUM_PAGE.path),
      clean(HIDDEN_URL_PARAMS, '/catalog/skrytye-dveri/'),
      '',
      `Sitemap: ${SITE.url}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
