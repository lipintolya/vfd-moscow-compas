import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ARTICLE_SUBSTITUTIONS } from '../src/data/article-substitutions'
import { ARTICLE_VARS, articleVar } from '../src/lib/article-vars'
import { fillSubstitutions, stripSubstitutions } from '../src/lib/article-substitutions'

const leaves = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? leaves(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`])

test('у каждой переменной статей есть русское имя, и каждое имя ведёт к значению', () => {
  const paths = new Set(Object.values(ARTICLE_SUBSTITUTIONS))
  for (const path of leaves(ARTICLE_VARS)) assert.ok(paths.has(path), `нет имени для ${path}`)
  for (const [name, path] of Object.entries(ARTICLE_SUBSTITUTIONS)) assert.equal(typeof articleVar(path), 'string', `${name} → ${path}`)
})

test('подстановка — значение из данных сайта', () => {
  assert.equal(fillSubstitutions('Адрес: {адрес салона}.'), `Адрес: ${ARTICLE_VARS.salon.address}.`)
  assert.equal(fillSubstitutions('Без подстановок'), 'Без подстановок')
})

test('пробелы по краям имени прощаются', () => {
  assert.equal(fillSubstitutions('{ телефон }'), ARTICLE_VARS.salon.phone)
})

test('неизвестная подстановка — ошибка с местом и именем', () => {
  assert.throws(() => fillSubstitutions('Звоните {телефон салона}', 'Статья «Скрытые двери»'),
    /Статья «Скрытые двери»: неизвестная подстановка \{телефон салона\}/)
})

test('для подсчёта слов подстановки убираются', () => {
  assert.equal(stripSubstitutions('Салон {название салона} работает'), 'Салон   работает')
})
