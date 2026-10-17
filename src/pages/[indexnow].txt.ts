/* Файл ключа IndexNow: /<ключ>.txt с самим ключом — поисковик сверяет его
   с ключом в запросе (scripts/lib/indexnow.mjs). Ключ — SITE.indexNowKey. */
import type { APIRoute, GetStaticPaths } from 'astro'
import { SITE } from '../config/site'

export const getStaticPaths: GetStaticPaths = () => [{ params: { indexnow: SITE.indexNowKey } }]

export const GET: APIRoute = () =>
  new Response(SITE.indexNowKey, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
