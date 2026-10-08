/* robots.txt — собирается из конфига: домен в Sitemap берётся из
   SITE.url, а не вписывается вручную (раньше это был статический файл,
   который надо было не забыть поправить при смене домена). */
import type { APIRoute } from 'astro'
import { SITE } from '../config/site'

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /privacy',
      '',
      `Sitemap: ${SITE.url}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
