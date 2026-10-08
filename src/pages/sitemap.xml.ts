/* /sitemap.xml — по этому адресу карту сайта ищут боты и сервисы проверки.
   Настоящую карту генерирует @astrojs/sitemap (sitemap-index.xml →
   sitemap-0.xml). Здесь — индекс, который ссылается сразу на файл с
   адресами: индекс со ссылкой на другой индекс протокол sitemaps не
   допускает (раньше так и было). Домен — из SITE.url. При росте сайта
   за 45 000 адресов интеграция добавит sitemap-1.xml — дописать сюда. */
import type { APIRoute } from 'astro'
import { SITE } from '../config/site'

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <sitemap><loc>${SITE.url}/sitemap-0.xml</loc></sitemap>\n` +
    `</sitemapindex>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  )
