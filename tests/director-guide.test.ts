import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ARTICLE_SUBSTITUTIONS } from '../src/data/article-substitutions'

test('в инструкции перечислены все подстановки', () => {
  const guide = readFileSync('docs/director-guide.md', 'utf8')
  for (const name of Object.keys(ARTICLE_SUBSTITUTIONS)) assert.ok(guide.includes(`{${name}}`), `нет {${name}}`)
})
