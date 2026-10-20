import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  quote, normalize, describe, notesOf, configToParams, paramsToConfig, DEFAULT_CONFIG, type HiddenConfig,
} from '../src/lib/hidden-door-price'
import { SECRET_PRICES, REFLEX_PRICES, REFLEX_TWO_SIDED_MIRROR_SURCHARGE } from '../src/data/skrytye-dveri-products'

const cfg = (patch: Partial<HiddenConfig>): HiddenConfig => ({ ...DEFAULT_CONFIG, ...patch })

test('«Секрет» и «Секрет Реверс»: комплект Стандарт и Лайт — как в прайсе', () => {
  for (const r of SECRET_PRICES) {
    const series = r.reverse ? 'revers' : 'sekret'
    assert.equal(quote(cfg({ series, edge: r.edgeColor, box: 'standard' })).total, r.kitStandardPrice)
    // Лайта нет (золото) — калькулятор считает Стандарт, а не придумывает цену
    assert.equal(quote(cfg({ series, edge: r.edgeColor, box: 'lite' })).total, r.kitLitePrice ?? r.kitStandardPrice)
  }
})

test('«Рефлекс»: обе стороны, зеркало с одной и с двух сторон — как в прайсе', () => {
  for (const r of REFLEX_PRICES) {
    const base = { series: 'reflex' as const, edge: r.edgeColor, reverse: r.reverse }
    assert.equal(quote(cfg({ ...base, box: 'standard' })).total, r.kitStandardPrice)
    assert.equal(quote(cfg({ ...base, box: 'standard', twoSided: true })).total, r.kitStandardPrice + REFLEX_TWO_SIDED_MIRROR_SURCHARGE)
    if (r.kitLitePrice != null) {
      assert.equal(quote(cfg({ ...base, box: 'lite', twoSided: true })).total, r.kitLitePrice + REFLEX_TWO_SIDED_MIRROR_SURCHARGE)
    }
  }
})

test('нестандартная высота — цифры таблиц на странице (самый доступный комплект)', () => {
  const lite = { edge: 'black' as const, box: 'lite' as const }
  const sekret = [2050, 2300, 2400, 2600].map((height) => quote(cfg({ ...lite, series: 'sekret', height })).total)
  const revers = [2050, 2300, 2400, 2600].map((height) => quote(cfg({ ...lite, series: 'revers', height })).total)
  const reflexDirect = [2050, 2300, 2400].map((height) => quote(cfg({ ...lite, series: 'reflex', height })).total)
  const reflexReverse = [2050, 2300, 2400].map((height) => quote(cfg({ ...lite, series: 'reflex', reverse: true, height })).total)
  assert.deepEqual(sekret, [28_590, 30_970, 33_350, 35_730])
  assert.deepEqual(revers, [34_050, 36_890, 39_720, 42_560])
  assert.deepEqual(reflexDirect, [43_530, 47_160, 50_780])
  assert.deepEqual(reflexReverse, [49_320, 53_430, 57_540])
})

test('разбивка цены складывается в итог', () => {
  for (const c of [
    cfg({}),
    cfg({ series: 'revers', edge: 'gold', height: 2600 }),
    cfg({ series: 'reflex', reverse: true, box: 'lite', height: 2300, twoSided: true }),
  ]) {
    const q = quote(c)
    assert.equal(q.blade + q.box + q.heightExtra + q.mirrorExtra, q.total)
  }
})

test('выбор приводится к допустимому', () => {
  assert.equal(normalize(cfg({ series: 'sekret', reverse: true })).reverse, false)
  assert.equal(normalize(cfg({ series: 'revers' })).reverse, true)
  assert.equal(normalize(cfg({ series: 'sekret', twoSided: true })).twoSided, false)
  assert.equal(normalize(cfg({ edge: 'gold', box: 'lite' })).box, 'standard')
  // У «Рефлекс» нет ступени 2600–2700 — ближайшая ниже
  assert.equal(normalize(cfg({ series: 'reflex', height: 2600 })).height, 2400)
  // Высота внутри ступени — к её началу
  assert.equal(normalize(cfg({ height: 2100 })).height, 2050)
})

test('выбор в адресе: туда и обратно; по умолчанию — пустой адрес', () => {
  assert.equal(configToParams(DEFAULT_CONFIG).toString(), '')
  const c = cfg({ series: 'reflex', reverse: true, edge: 'silver', box: 'lite', height: 2300, twoSided: true })
  assert.deepEqual(paramsToConfig(configToParams(c)), c)
  // Мусор в адресе — значения по умолчанию, а не ошибка
  assert.deepEqual(paramsToConfig(new URLSearchParams('series=x&edge=pink&height=abc')), DEFAULT_CONFIG)
})

test('описание выбора — для подписи и сообщения менеджеру', () => {
  assert.equal(describe(cfg({})), '«Секрет», кромка чёрная, короб Стандарт, высота 2000 мм')
  assert.equal(
    describe(cfg({ series: 'reflex', reverse: true, edge: 'gold', height: 2400, twoSided: true })),
    '«Рефлекс», от себя, кромка золото, короб Стандарт, высота 2400–2500 мм, зеркало с двух сторон',
  )
})

test('срок высоты: 2100 и 2300 мм «Секрет» — в наличии, остальное и «Рефлекс» — под заказ', () => {
  const note = (c: Partial<HiddenConfig>) => notesOf(cfg(c)).at(-1)!
  assert.equal(note({ height: 2050 }), '2100 мм — в наличии, другие высоты диапазона — изготовление 6–8 недель')
  assert.equal(note({ series: 'revers', height: 2300 }), '2300 мм — в наличии, другие высоты диапазона — изготовление 6–8 недель')
  assert.equal(note({ height: 2400 }), 'Нестандартная высота — изготовление 6–8 недель')
  assert.equal(note({ series: 'reflex', height: 2300 }), 'Нестандартная высота — изготовление 6–8 недель')
  // Стандартная высота — без строки о сроке
  assert.ok(!notesOf(cfg({})).some((n) => n.includes('изготовление')))
})
