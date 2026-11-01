import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COMPAS_PAGE } from '../src/data/compas-mall-page'
import { TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'
import { brandTitle } from '../src/lib/seo-title'

test('ТЦ «Компас»: заголовок и описание — в лимитах поисковика', () => {
  const title = brandTitle(COMPAS_PAGE.title)
  assert.ok(title.length <= TITLE_MAX, `${title.length}: ${title}`)
  assert.ok(COMPAS_PAGE.description.length <= DESCRIPTION_MAX, `${COMPAS_PAGE.description.length}: ${COMPAS_PAGE.description}`)
})

test('ТЦ «Компас»: запросы о самом ТЦ — название, адрес, «фото», «как добраться» в заголовке; Москва в описании и вопросах', () => {
  for (const t of [COMPAS_PAGE.title, COMPAS_PAGE.h1, COMPAS_PAGE.description]) {
    assert.match(t, /ТЦ «Компас»/)
    assert.match(t, /Красн(ая|ой) Сосн(а|е), 2А/)
  }
  assert.match(COMPAS_PAGE.title, /фото/)
  assert.match(COMPAS_PAGE.title, /как добраться/)
  assert.match(COMPAS_PAGE.description, /Москв/)
  assert.ok(COMPAS_PAGE.faq.some((f) => /Где находится ТЦ «Компас»/.test(f.q)))
})
