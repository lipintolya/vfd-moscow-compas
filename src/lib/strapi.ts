/**
 * Чтение Strapi (cms/) при сборке сайта: акции, портфолио, статьи.
 * Только опубликованное (черновики — для проверки перед публикацией), по ключу только для чтения (STRAPI_URL,
 * STRAPI_TOKEN в .env). Ошибка — ошибка сборки: пустой раздел на сайт
 * не уходит. Фото — уменьшенные копии Strapi (strapiImage).
 */
const PAGE_SIZE = 100

export interface StrapiMedia {
  url: string
  /** Имя файла в медиатеке — для замечаний перед публикацией */
  name?: string | null
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  formats?: Record<string, { url: string; width: number; height: number }> | null
}

export interface SiteImage { src: string; srcset?: string; width?: number; height?: number; alt: string }

type Env = Record<string, string | undefined>
interface Options {
  fetch?: typeof fetch; env?: Env
  /** draft — черновики: проверка записи перед публикацией (scripts/check-content.ts) */
  status?: 'published' | 'draft'
}

function settings(env: Env) {
  const url = env.STRAPI_URL?.replace(/\/$/, '')
  const token = env.STRAPI_TOKEN
  if (!url || !token) {
    throw new Error('Strapi: в .env нет STRAPI_URL или STRAPI_TOKEN — запустите npm run cms (в разработке ключ появится сам) или скопируйте из .env.example')
  }
  return { url, token }
}

export async function strapiFetchAll<T>(collection: string, query: Record<string, string> = {}, opts: Options = {}): Promise<T[]> {
  const env = opts.env ?? { ...process.env, ...import.meta.env }
  const doFetch = opts.fetch ?? fetch
  const { url, token } = settings(env)
  const items: T[] = []
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ ...query, status: opts.status ?? 'published', 'pagination[page]': String(page), 'pagination[pageSize]': String(PAGE_SIZE) })
    let res: Response
    try {
      res = await doFetch(`${url}/api/${collection}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    } catch {
      throw new Error(`Strapi недоступен по адресу ${url} — запустите npm run cms`)
    }
    if (!res.ok) throw new Error(`Strapi ${collection}: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`)
    const json = (await res.json()) as { data: T[]; meta: { pagination: { page: number; pageCount: number } } }
    items.push(...json.data)
    if (page >= json.meta.pagination.pageCount) return items
  }
}

/** Фото для страницы: самая крупная копия не шире maxWidth + srcset из всех.
    Оригинал участвует, только если сам не шире maxWidth — небольшое фото
    лучше своих копий, а снимок с телефона на 6000 px на страницу не идёт. */
export function strapiImage(media: StrapiMedia, maxWidth = 1280): SiteImage {
  const formats = Object.values(media.formats ?? {})
  const alt = media.alternativeText ?? ''
  if (!formats.length) return { src: media.url, width: media.width ?? undefined, height: media.height ?? undefined, alt }
  const original = media.width && media.height && media.width <= maxWidth
    ? [{ url: media.url, width: media.width, height: media.height }]
    : []
  const variants = [...formats, ...original].sort((a, b) => a.width - b.width)
  const main = [...variants].reverse().find((v) => v.width <= maxWidth) ?? variants[0]!
  return {
    src: main.url,
    srcset: variants.map((v) => `${v.url} ${v.width}w`).join(', '),
    width: main.width,
    height: main.height,
    alt,
  }
}
