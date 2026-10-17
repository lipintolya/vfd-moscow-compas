/* Манифест сайта (значок и имя при «добавить на экран») — из конфига:
   название студии, а не вписанное вручную. theme_color — литерал: манифест
   не читает CSS-переменные (= slate-900, как <meta name=theme-color>). */
import type { APIRoute } from 'astro'
import { SITE } from '../../config/site'

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: `${SITE.studioName} — двери ${SITE.name} ${SITE.city.in}`,
      short_name: SITE.studioName,
      description: `Салон дверей ${SITE.name} в ${SITE.address.mall}, ${SITE.city.name}`,
      start_url: '/',
      display: 'browser',
      theme_color: '#1f1f23',
      background_color: '#ffffff',
      icons: [
        { src: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    }, null, 2),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  )
