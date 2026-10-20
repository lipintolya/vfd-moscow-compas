/**
 * Проверка записи Strapi перед публикацией: Strapi при «Опубликовать»
 * отдаёт черновик в scripts/check-content.ts, замечания директор видит
 * в админке, и запись не публикуется. Сначала — то же, что делает сборка
 * (toArticle/toWork/toPromo: их ошибка уронила бы сборку), потом правила
 * для поисковиков. Пустой список — публиковать можно.
 */
import type { StrapiMedia } from './strapi'
import type { RichNode, StrapiBlock } from './article-blocks'
import { toArticle, toWork, toPromo, type StrapiArticle, type StrapiWork, type StrapiPromo } from './strapi-content'
import { TITLE_MAX } from './product-text'

/** Лид и короткое описание: короче — поисковик возьмёт кусок текста страницы */
export const LEAD_MIN = 70
/** Заголовок в выдаче — до TITLE_MAX знаков вместе с «| Студия Зизевского»
    (его сайт добавляет сам), значит поле «для поисковиков» — на 20 короче */
export const META_TITLE_MAX = TITLE_MAX - ' | Студия Зизевского'.length

/** Ошибка сборки → замечание; «Статья «…»: » в начале — лишнее, запись и так открыта */
function buildProblems(map: () => unknown): string[] {
  try {
    map()
    return []
  } catch (e) {
    return [(e as Error).message.replace(/^(Статья|Акция|Работа) «[^»]*»: /, '')]
  }
}

const fileName = (m: StrapiMedia) => m.name ?? m.url.split('/').pop() ?? m.url

function lengthProblems(text: string | null | undefined, field: string, min: number): string[] {
  const n = (text ?? '').trim().length
  return n < min ? [`${field} — ${n} знаков, нужно от ${min}: его показывают Яндекс и Google под заголовком`] : []
}

function metaTitleProblems(metaTitle: string | null | undefined): string[] {
  const t = (metaTitle ?? '').trim()
  const problems = t.length > META_TITLE_MAX ? [`Заголовок для поисковиков — ${t.length} знаков, нужно до ${META_TITLE_MAX}: длиннее поисковики обрезают`] : []
  /* «| Студия Зизевского» сайт добавляет сам (src/lib/seo-title.ts) */
  if (t.includes('|')) problems.push('В заголовке для поисковиков не нужен «| …»: название салона добавится само')
  return problems
}

function headingLevels(body: StrapiBlock[]): number[] {
  return body.flatMap((b) => (b.__component === 'article.text' ? (b.content as RichNode[]) : []))
    .filter((n): n is Extract<RichNode, { type: 'heading' }> => n.type === 'heading')
    .map((n) => n.level)
}

export function articleProblems(raw: StrapiArticle, otherTitles: string[]): string[] {
  const problems = buildProblems(() => toArticle(raw))
  problems.push(...lengthProblems(raw.description, 'Лид', LEAD_MIN))
  problems.push(...metaTitleProblems(raw.seo?.metaTitle))

  const levels = headingLevels(raw.body ?? [])
  if (!levels.includes(2)) problems.push('В тексте нет ни одного подзаголовка «Заголовок 2» — разбейте текст на разделы: по ним строится оглавление')
  if (levels.includes(1)) problems.push('В тексте есть «Заголовок 1» — он у статьи один, это её заголовок; для разделов — «Заголовок 2»')

  if (!raw.coverAlt && !raw.cover?.alternativeText) problems.push('Обложка без описания — заполните «Что на обложке»')
  for (const b of raw.body ?? []) {
    if (b.__component === 'article.photo' && !b.alt && !b.image.alternativeText) {
      problems.push(`Фото «${fileName(b.image)}» без описания — заполните «Что на фото»`)
    }
    if (b.__component === 'article.gallery') {
      for (const ph of b.photos) {
        if (!ph.alt && !ph.image.alternativeText && !ph.caption) problems.push(`Фото «${fileName(ph.image)}» без описания — заполните «Что на фото» или подпись`)
      }
    }
  }
  const spot = raw.seo?.spotlight
  if (spot && !spot.imageAlt && !spot.image.alternativeText) problems.push('Фото для показа на главной без описания — заполните «Что на фото»')

  const same = (t: string) => t.trim().toLowerCase()
  if (otherTitles.some((t) => same(t) === same(raw.title))) {
    problems.push(`Статья с заголовком «${raw.title}» уже есть — заголовки не должны повторяться: поисковик не поймёт, какую показывать`)
  }
  return problems
}

export function workProblems(raw: StrapiWork): string[] {
  const problems = buildProblems(() => toWork(raw))
  problems.push(...lengthProblems(raw.description, 'Короткое описание', LEAD_MIN))
  problems.push(...metaTitleProblems(raw.metaTitle))
  for (const img of raw.images ?? []) {
    if (!img.alternativeText) problems.push(`Фото «${fileName(img)}» без описания — нажмите на фото, значок карандаша, и заполните «Что на фото»`)
  }
  return problems
}

export const promoProblems = (raw: StrapiPromo): string[] => buildProblems(() => toPromo(raw))
