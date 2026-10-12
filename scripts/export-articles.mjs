/**
 * Перенос статей (один раз): src/content/articles/*.mdoc → JSON блоков
 * для Strapi — cms/.tmp/articles-export.json. Дальше — npm --prefix cms
 * run import:articles (загрузит фото в медиатеку и создаст записи).
 *   npm run articles:export   (через tsx: конвертер берёт имена подстановок из .ts)
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { mdocToArticle } from './lib/mdoc-to-blocks.mjs'

const DIR = new URL('../src/content/articles/', import.meta.url)
const OUT = new URL('../cms/.tmp/articles-export.json', import.meta.url)
const files = (await readdir(DIR)).filter((f) => f.endsWith('.mdoc')).sort()
const articles = []
for (const f of files) articles.push(mdocToArticle(await readFile(new URL(f, DIR), 'utf8'), f.replace(/\.mdoc$/, '')))
await mkdir(new URL('.', OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(articles, null, 2))
console.log(`Статей: ${articles.length} → cms/.tmp/articles-export.json`)
