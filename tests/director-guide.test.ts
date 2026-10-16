import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ARTICLE_SUBSTITUTIONS } from '../src/data/article-substitutions'

test('в инструкции перечислены все подстановки', () => {
  const guide = readFileSync('docs/director-guide.md', 'utf8')
  for (const name of Object.keys(ARTICLE_SUBSTITUTIONS)) assert.ok(guide.includes(`{${name}}`), `нет {${name}}`)
})

import { articleVar } from '../src/lib/article-vars'

test('в инструкции у подстановок — текущие значения', () => {
  const guide = readFileSync('docs/director-guide.md', 'utf8')
  for (const [name, path] of Object.entries(ARTICLE_SUBSTITUTIONS)) {
    const row = guide.split('\n').find((l) => l.startsWith(`| \`{${name}}\` |`))
    assert.ok(row, `нет строки {${name}}`)
    /* неразрывные пробелы в значениях — в инструкции обычные */
    const plain = (t: string) => t.replace(/\s+/g, ' ').trim()
    assert.equal(plain(row.split('|')[2]!), plain(String(articleVar(path))), `{${name}}`)
  }
})
