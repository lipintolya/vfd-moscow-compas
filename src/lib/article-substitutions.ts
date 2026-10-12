/* Подстановки {имя} в текстах статей из Strapi — значения из данных сайта.
   Имена — src/data/article-substitutions.ts. Неизвестное имя — ошибка
   сборки: опечатка не должна уйти на сайт. */
import { ARTICLE_SUBSTITUTIONS } from '../data/article-substitutions'
import { articleVar } from './article-vars'

const TOKEN = /\{([^{}\n]{1,60})\}/g

export function fillSubstitutions(text: string, where = 'Статья'): string {
  return text.replace(TOKEN, (_, raw: string) => {
    const name = raw.trim()
    const path = ARTICLE_SUBSTITUTIONS[name]
    const value = path ? articleVar(path) : undefined
    if (value === undefined) throw new Error(`${where}: неизвестная подстановка {${name}} — проверьте имя по таблице подстановок в инструкции (docs/director-guide.md)`)
    return value
  })
}

/** Текст без подстановок — для подсчёта слов (как раньше без {% $… %}) */
export const stripSubstitutions = (text: string) => text.replace(TOKEN, ' ')
