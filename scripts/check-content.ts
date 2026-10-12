/**
 * Проверка записей Strapi правилами src/lib/content-checks.ts.
 *
 *   npm run check:content   — всё опубликованное (акции, работы, статьи):
 *                             список замечаний, код выхода 1, если они есть
 *   … --stdin               — одна запись из Strapi при «Опубликовать»
 *                             (cms/src/bootstrap/publish-checks.ts): на входе
 *                             JSON { kind, record, otherTitles }, на выходе —
 *                             JSON-массив замечаний
 */
import { existsSync } from 'node:fs'
import { strapiFetchAll } from '../src/lib/strapi'
import { ARTICLE_QUERY, WORK_QUERY, PROMO_QUERY, type StrapiArticle, type StrapiWork, type StrapiPromo } from '../src/lib/strapi-content'
import { articleProblems, workProblems, promoProblems } from '../src/lib/content-checks'

type Kind = 'article' | 'work' | 'promo'

function problemsOf(kind: Kind, record: unknown, otherTitles: string[]): string[] {
  if (kind === 'article') return articleProblems(record as StrapiArticle, otherTitles)
  if (kind === 'work') return workProblems(record as StrapiWork)
  return promoProblems(record as StrapiPromo)
}

if (process.argv.includes('--stdin')) {
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  const { kind, record, otherTitles = [] } = JSON.parse(input) as { kind: Kind; record: unknown; otherTitles?: string[] }
  process.stdout.write(JSON.stringify(problemsOf(kind, record, otherTitles)))
} else {
  if (existsSync('.env')) process.loadEnvFile('.env')
  const [articles, works, promos] = await Promise.all([
    strapiFetchAll<StrapiArticle>('articles', ARTICLE_QUERY),
    strapiFetchAll<StrapiWork>('works', WORK_QUERY),
    strapiFetchAll<StrapiPromo>('promos', PROMO_QUERY),
  ])
  const report = [
    ...articles.map((a) => ({ name: `Статья «${a.title}»`, problems: problemsOf('article', a, articles.filter((o) => o.documentId !== a.documentId).map((o) => o.title)) })),
    ...works.map((w) => ({ name: `Работа «${w.title}»`, problems: problemsOf('work', w, []) })),
    ...promos.map((p) => ({ name: `Акция «${p.title}»`, problems: problemsOf('promo', p, []) })),
  ].filter((r) => r.problems.length)
  for (const r of report) console.log(`${r.name}:\n${r.problems.map((x) => `  — ${x}`).join('\n')}`)
  console.log(report.length ? `\nЗамечания: ${report.length} из ${articles.length + works.length + promos.length} записей` : `Замечаний нет: ${articles.length + works.length + promos.length} записей`)
  if (report.length) process.exitCode = 1
}
