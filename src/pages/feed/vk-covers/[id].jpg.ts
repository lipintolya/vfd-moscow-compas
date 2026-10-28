/**
 * src/pages/feed/vk-covers/<id>.jpg — обложки товаров для VK Маркета
 * (первое фото карточки, см. lib/vk-cover.ts). Адреса совпадают с фидом
 * /feed/vk.xml: id оффера, те же товары и то же фото модели.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { getModelEntries } from '../../../lib/model-entries'
import { feedOffers, offerId } from '../../../lib/feed-common'
import { composeCover, coverSource } from '../../../lib/vk-cover'

export const getStaticPaths: GetStaticPaths = async () => {
  const offers = feedOffers(await getModelEntries())
  return offers.flatMap(e => {
    const src = coverSource(e)
    return src ? [{ params: { id: offerId(e.model.id) }, props: { src } }] : []
  })
}

export const GET: APIRoute = async ({ props }) => {
  const body = await composeCover((props as { src: string }).src)
  return new Response(body, { headers: { 'Content-Type': 'image/jpeg' } })
}
