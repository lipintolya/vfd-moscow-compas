/**
 * src/pages/feed/vk-photos/<id>-<номер>-<хеш>.jpg — фото товаров для VK Маркета
 * (см. lib/vk-photo.ts): межкомнатные — на графите, входные двери — на белом
 * (lib/vk-entrance.ts). Хеш в адресе меняется вместе с картинкой и фоном, чтобы
 * площадка перекачивала фото, а не держала старое.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { getModelEntries } from '../../../lib/model-entries'
import { feedOffers } from '../../../lib/feed-common'
import { composePhoto, vkPictureFiles } from '../../../lib/vk-photo'
import { entrancePictureFiles } from '../../../lib/vk-entrance'
import { ENTRANCE_DOORS } from '../../../data/entrance-doors'

export const getStaticPaths: GetStaticPaths = async () => {
  const offers = feedOffers(await getModelEntries())
  const groups = await Promise.all(offers.map(vkPictureFiles))
  const entrance = await Promise.all(ENTRANCE_DOORS.map(entrancePictureFiles))
  return [...groups.flat(), ...entrance.flat()]
    .map(({ src, file, bg }) => ({ params: { file }, props: { src, bg } }))
}

export const GET: APIRoute = async ({ props }) => {
  const { src, bg } = props as { src: string; bg: string }
  const body = await composePhoto(src, bg)
  return new Response(body, { headers: { 'Content-Type': 'image/jpeg' } })
}
