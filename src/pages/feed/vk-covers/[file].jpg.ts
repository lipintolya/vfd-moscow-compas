/**
 * src/pages/feed/vk-covers/<id>-<хеш>.jpg — обложки товаров для VK Маркета
 * (первое фото карточки, см. lib/vk-cover.ts). Хеш в адресе меняется вместе с
 * картинкой, чтобы площадка перекачивала обложку, а не держала старую.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { getModelEntries } from '../../../lib/model-entries'
import { feedOffers, offerId } from '../../../lib/feed-common'
import { composeCover, coverKey, coverSource } from '../../../lib/vk-cover'

export const getStaticPaths: GetStaticPaths = async () => {
  const offers = feedOffers(await getModelEntries())
  const paths = await Promise.all(offers.map(async e => {
    const src = coverSource(e)
    if (!src) return null
    return { params: { file: `${offerId(e.model.id)}-${await coverKey(src)}` }, props: { src } }
  }))
  return paths.filter((p): p is NonNullable<typeof p> => p !== null)
}

export const GET: APIRoute = async ({ props }) => {
  const body = await composeCover((props as { src: string }).src)
  return new Response(body, { headers: { 'Content-Type': 'image/jpeg' } })
}
