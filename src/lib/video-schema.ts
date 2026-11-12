/**
 * src/lib/video-schema.ts
 *
 * VideoObject для JSON-LD — один на сайт, страницы его не пишут руками.
 * Google требует uploadDate полной датой-временем с часовым поясом
 * (ISO 8601): «2026-11-01» без времени Search Console отмечает как
 * «не указан часовой пояс» и «недопустимое значение даты/времени».
 * Поэтому в данных — день публикации, а здесь он становится полднем
 * по Москве (UTC+3 круглый год, перехода на летнее время нет).
 *
 * Разметку ролика ставим только на одну страницу — ту, где он главный
 * (страница-«просмотр»); на /video/ и главной тот же ролик — просто карточка.
 */

const MOSCOW_OFFSET = '+03:00'

/** «2026-11-01» → «2026-11-01T12:00:00+03:00»; неверная дата — ошибка сборки */
export function uploadDateTime(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  if (!m || !d || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    throw new Error(`VideoObject: дата публикации «${day}» — нужен день в виде ГГГГ-ММ-ДД`)
  }
  return `${day}T12:00:00${MOSCOW_OFFSET}`
}

/** «0:18», «1:09» → «PT18S», «PT1M9S» */
export function durationIso(label: string): string {
  const m = /^(\d+):([0-5]\d)$/.exec(label)
  if (!m) throw new Error(`VideoObject: длительность «${label}» — нужна в виде М:СС`)
  const min = +m[1]
  const sec = +m[2]
  return `PT${min ? `${min}M` : ''}${sec || !min ? `${sec}S` : ''}`
}

export interface VideoSchemaInput {
  name:        string
  description: string
  /** Кадр-обложка; путь от корня сайта — BaseLayout сделает адрес полным */
  thumbnailUrl: string
  contentUrl:  string
  /** День публикации на сайте, ГГГГ-ММ-ДД */
  uploadDate:  string
  /** Длительность как на карточке, М:СС, или целых секунд */
  duration:    string | number
}

export function videoSchema(v: VideoSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.name,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl,
    contentUrl: v.contentUrl,
    uploadDate: uploadDateTime(v.uploadDate),
    duration: typeof v.duration === 'number' ? `PT${Math.round(v.duration)}S` : durationIso(v.duration),
  }
}
