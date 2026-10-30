import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { ARTICLE_CATALOG_PAGES } from '../src/data/article-catalog-pages'
import { STYLE_CATEGORIES } from '../src/data/style-categories'

const schema = (name: string) => JSON.parse(readFileSync(`cms/src/components/article/${name}.json`, 'utf8'))

test('страницы каталога: список в Strapi = список сайта', () => {
  assert.deepEqual(schema('catalog-page').attributes.page.enum, Object.keys(ARTICLE_CATALOG_PAGES))
})

test('каждая страница из списка показывает «Статью по теме»', () => {
  const dir = 'src/pages/catalog'
  /* Страницы-файлы и страницы-папки (vhodnye-dveri/index.astro) */
  const files = readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? [`${e.name}/index.astro`].filter((f) => existsSync(`${dir}/${f}`)) : e.name.endsWith('.astro') ? [e.name] : [])
  const named = files
    .flatMap((f) => [...readFileSync(`${dir}/${f}`, 'utf8').matchAll(/pagePath: [`'](\/catalog\/[^`']+\/)[`']/g)].map((m) => m[1]))
  const styles = STYLE_CATEGORIES.map((c) => `/catalog/${c.slug}/`)
  for (const path of Object.values(ARTICLE_CATALOG_PAGES)) {
    assert.ok([...named, ...styles].includes(path), `${path} не зовёт relatedArticle({ pagePath })`)
  }
})
