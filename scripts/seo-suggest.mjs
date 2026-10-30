/**
 * Подсказки поиска Яндекса по затравкам из docs/seo/seeds.json — что на самом
 * деле набирают люди рядом с нашими темами. Это не частота Вордстата (её
 * отдаёт только кабинет Яндекса), а порядок: запрос, который всплыл у
 * нескольких затравок и стоит выше в списке, ищут чаще.
 *
 *   npm run seo:suggest                      — все группы, результат в docs/seo/suggest.json
 *   npm run seo:suggest -- "Скрытые двери"   — одна группа (остальные в файле сохраняются)
 *
 * Открытый адрес suggest.yandex.ru, без ключей; между запросами — пауза.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const SEEDS = new URL('../docs/seo/seeds.json', import.meta.url)
const OUT = new URL('../docs/seo/suggest.json', import.meta.url)
const URL_BASE = 'https://suggest.yandex.ru/suggest-ya.cgi?v=4&uil=ru&part='
const PAUSE_MS = 250
const RETRIES = 3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Подсказки к одному запросу; null — не удалось после повторов */
async function suggest(query) {
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(URL_BASE + encodeURIComponent(query), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      return (json[1] ?? []).map((x) => (Array.isArray(x) ? x[1] ?? x[0] : x)).filter((x) => typeof x === 'string')
    } catch {
      await sleep(1500)
    }
  }
  return null
}

const { suffixes, groups } = JSON.parse(readFileSync(SEEDS, 'utf8'))
const only = process.argv[2]
if (only && !groups[only]) {
  console.error(`Нет группы «${only}». Есть: ${Object.keys(groups).join(', ')}`)
  process.exit(1)
}

const result = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { groups: {} }
let failed = 0

for (const [group, seeds] of Object.entries(groups)) {
  if (only && group !== only) continue
  /** запрос → в скольких ответах встретился и на какой позиции был выше всего */
  const found = new Map()
  for (const seed of seeds) {
    for (const suffix of suffixes) {
      const list = await suggest(seed + suffix)
      if (!list) { failed++; continue }
      list.forEach((q, i) => {
        const e = found.get(q) ?? { query: q, hits: 0, best: Infinity }
        e.hits++
        e.best = Math.min(e.best, i + 1)
        found.set(q, e)
      })
      await sleep(PAUSE_MS)
    }
  }
  result.groups[group] = [...found.values()].sort((a, b) => b.hits - a.hits || a.best - b.best)
  console.log(`${group}: ${found.size} запросов`)
}

result.fetched = new Date().toISOString().slice(0, 10)
result.source = 'suggest.yandex.ru'
writeFileSync(OUT, JSON.stringify(result, null, 1) + '\n')
console.log(`Сохранено: docs/seo/suggest.json${failed ? `, не получено ответов: ${failed}` : ''}`)
