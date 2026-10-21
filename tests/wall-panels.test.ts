import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  WALL_PANELS_PAGE, PANEL_VISUALS, PANEL_FAQ, PANEL_MATERIALS, PANEL_ROOMS, PANEL_PRICE, PANEL_VIDEO_IDS,
} from '../src/data/wall-panels-page'
import { renderOf, shownVisual } from '../src/lib/wall-panels'
import { WORK_VIDEOS } from '../src/data/videos'
import { TITLE_MAX, DESCRIPTION_MAX } from '../src/lib/product-text'
import { brandTitle } from '../src/lib/seo-title'

test('стеновые панели: заголовок и описание — в лимитах поисковика', () => {
  const title = brandTitle(WALL_PANELS_PAGE.title)
  assert.ok(title.length <= TITLE_MAX, `${title.length}: ${title}`)
  assert.ok(WALL_PANELS_PAGE.description.length <= DESCRIPTION_MAX, `${WALL_PANELS_PAGE.description.length}: ${WALL_PANELS_PAGE.description}`)
  // Главный запрос — в заголовке, H1 и описании
  for (const t of [WALL_PANELS_PAGE.title, WALL_PANELS_PAGE.h1, WALL_PANELS_PAGE.description]) assert.match(t, /[Сс]теновые панели/)
  assert.match(WALL_PANELS_PAGE.title, /в Москве/)
})

test('стеновые панели: у каждого места своё имя рендера и подпись', () => {
  const slots = PANEL_VISUALS.map((v) => v.slot)
  assert.equal(new Set(slots).size, slots.length, `повтор: ${slots.join(', ')}`)
  for (const v of PANEL_VISUALS) {
    assert.match(v.slot, /^[a-z0-9-]+$/, `имя файла рендера: ${v.slot}`)
    assert.ok(v.alt.length >= 15, `подпись к «${v.slot}» — для поиска по картинкам`)
  }
})

test('стеновые панели: без рендера и фото работы место пустует, фото работы берётся по номеру', () => {
  const v = { slot: 'test-slot', ratio: '4:5' as const, alt: 'Подпись к тестовому месту' }
  assert.equal(renderOf(v), null)
  assert.equal(shownVisual(v, []), null)
  const work = { id: 'w', title: 'Работа', photos: [{ src: '/a.webp', alt: 'А' }, { src: '/b.webp', alt: 'Б' }] }
  const shown = shownVisual({ ...v, work: { slug: 'w', photo: 1 } }, [work] as never)
  assert.equal(shown?.image.src, '/b.webp')
  // Пропала работа или фото — ошибка сборки, а не пустое место
  assert.throws(() => shownVisual({ ...v, work: { slug: 'nope', photo: 0 } }, [work] as never), /работы «nope» нет/)
  assert.throws(() => shownVisual({ ...v, work: { slug: 'w', photo: 5 } }, [work] as never), /нет фото №5/)
})

test('стеновые панели: ролики есть в списке видео с объектов', () => {
  for (const id of PANEL_VIDEO_IDS) assert.ok(WORK_VIDEOS.some((v) => v.id === id), id)
})

test('стеновые панели: цен за м² и сроков салон не давал — их нет в текстах', () => {
  const texts = [
    WALL_PANELS_PAGE.lead, WALL_PANELS_PAGE.description,
    ...PANEL_MATERIALS.map((m) => m.text), ...PANEL_ROOMS.map((r) => r.text),
    PANEL_PRICE.lead, ...PANEL_PRICE.factors, ...PANEL_FAQ.flatMap((f) => [f.q, f.a]),
  ].join('\n')
  assert.doesNotMatch(texts, /м²|м2|кв\.?\s*м|за метр|недел|рабочих дн/)
  // Единственная цена — рейки из прайса декора
  assert.match(PANEL_PRICE.rails, /от \d/)
})
