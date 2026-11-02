/**
 * src/pages/feed/vk-photos/<id>-<номер>-<хеш>.jpg — фото товаров для VK Маркета
 * (см. lib/vk-photo.ts). Хеш в адресе меняется вместе с картинкой, чтобы
 * площадка перекачивала фото, а не держала старое.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { getModelEntries } from '../../../lib/model-entries'
import { feedOffers } from '../../../lib/feed-common'
import { composePhoto, vkPictureFiles } from '../../../lib/vk-photo'

export const getStaticPaths: GetStaticPaths = async () => {
  const offers = feedOffers(await getModelEntries())
  const groups = await Promise.all(offers.map(vkPictureFiles))
  return groups.flat().map(({ src, file }) => ({ params: { file }, props: { src } }))
}

export const GET: APIRoute = async ({ props }) => {
  const body = await composePhoto((props as { src: string }).src)
  return new Response(body, { headers: { 'Content-Type': 'image/jpeg' } })
}
