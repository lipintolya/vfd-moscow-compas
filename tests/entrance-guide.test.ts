import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  GUIDE, ENTRANCE_LOBBY, GUIDE_CRITERIA, GUIDE_STEPS, GUIDE_MISTAKES, GUIDE_FAQ, GUIDE_VISUALS,
} from '../src/data/entrance-guide'
import { DOOR_GROUPS, ENTRANCE_DOORS } from '../src/data/entrance-doors'

const texts = () => [
  GUIDE.title, GUIDE.lead, GUIDE.criteriaLead,
  ENTRANCE_LOBBY.title, ENTRANCE_LOBBY.text,
  ...GUIDE_CRITERIA.flatMap((c) => [c.title, c.what, c.text, c.flat.verdict, c.flat.note, c.house.verdict, c.house.note]),
  ...GUIDE_STEPS.flatMap((s) => [s.title, s.text]),
  ...GUIDE_MISTAKES.flatMap((m) => [m.title, m.text]),
  ...GUIDE_FAQ.flatMap((f) => [f.q, f.a]),
  ...GUIDE_VISUALS.flatMap((v) => [v.slot, v.alt, v.brief]),
]

test('путеводитель: название завода не встречается и цифры подставлены', () => {
  for (const t of texts()) {
    assert.doesNotMatch(t, /лабиринт|labirint/i, t)
    assert.doesNotMatch(t, /undefined|NaN|\[object/, t)
  }
})

test('путеводитель: у каждого критерия — суть, совет и важность для квартиры и для дома', () => {
  assert.ok(GUIDE_CRITERIA.length >= 8)
  for (const c of GUIDE_CRITERIA) {
    assert.ok(c.what.length > 15 && c.text.length > 40, c.title)
    for (const v of [c.flat, c.house]) {
      assert.ok(['must', 'good', 'skip'].includes(v.level), c.title)
      // в таблице совет — одна короткая строка, пояснение — отдельно
      assert.ok(v.verdict.length >= 6 && v.verdict.length <= 45, `${c.title}: «${v.verdict}» ${v.verdict.length}`)
      assert.ok(v.note.length > 20, c.title)
    }
  }
  // фото двери: у каждого критерия — уникальный ключ, части для подсветки и хотя бы одна точка внутри кадра
  const keys = GUIDE_CRITERIA.map((c) => c.key)
  assert.equal(new Set(keys).size, keys.length)
  const known = ['leaf', 'edge', 'frame', 'seal', 'locks', 'hinges', 'finish', 'threshold', 'dims', 'panels']
  for (const c of GUIDE_CRITERIA) {
    assert.ok(c.parts.length > 0 && c.parts.every((p) => known.includes(p)), c.title)
    assert.ok(c.spots.length > 0 && c.spots.every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100), c.title)
  }
  // терморазрыв — главное различие: для дома нужен, для квартиры нет
  const thermo = GUIDE_CRITERIA.find((c) => c.title === 'Терморазрыв')!
  assert.equal(thermo.house.level, 'must')
  assert.equal(thermo.flat.level, 'skip')
})

test('путеводитель: фото двери для «На что смотреть» есть в каталоге', () => {
  assert.ok(ENTRANCE_DOORS.some((d) => d.id === GUIDE.explorerDoor), GUIDE.explorerDoor)
})

test('путеводитель: стеклопакет везде 81 мм и порог в комплекте у уличных дверей', () => {
  const glass = ENTRANCE_DOORS.filter((d) => d.group === 'glass')
  assert.ok(glass.length > 0)
  for (const d of glass) {
    assert.match(d.specs.find((s) => s.label === 'Стеклопакет')!.value, /81 мм/, d.id)
    assert.ok(d.specs.some((s) => s.label === 'Защита порога'), `${d.id}: нет порога`)
  }
})

test('рендеры: места объявлены один раз, имена — для файлов', () => {
  const slots = GUIDE_VISUALS.map((v) => v.slot)
  assert.equal(new Set(slots).size, slots.length)
  for (const v of GUIDE_VISUALS) {
    assert.match(v.slot, /^[a-z0-9-]+$/)
    assert.ok(v.alt.length >= 30 && v.brief.length >= 60, v.slot)
  }
})
