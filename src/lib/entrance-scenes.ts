/* Рендеры «дверь на доме»: кадры из src/data/entrance-scenes.ts с готовыми копиями
   (npm run gen:entrance-renders) и моделью каталога. Объявленный кадр без файла —
   ошибка сборки: страница не должна молча остаться без картинки. */
import { DOOR_SCENES, sceneAlt, sceneDoor } from '../data/entrance-scenes'
import type { DoorScene } from '../data/entrance-scenes'
import { ENTRANCE_DOORS } from '../data/entrance-doors'
import type { EntranceDoor } from '../data/entrance-doors'
import { renderOf } from './entrance-renders'
import type { RenderImage } from './entrance-renders'

export interface SceneImage extends RenderImage {
  slot: string
  door: EntranceDoor
  /** Отношение сторон числом — для ширины кадра в ленте при общей высоте */
  ratio: number
}

function imageOf(s: DoorScene): SceneImage {
  const r = renderOf({ slot: s.slot, alt: sceneAlt(s) })
  if (!r) throw new Error(`Рендеры «на доме»: нет файла для «${s.slot}» — положите assets/entrance-renders/${s.slot}.webp и выполните npm run gen:entrance-renders`)
  return { ...r, slot: s.slot, door: sceneDoor(s), ratio: r.width / r.height }
}

const all = DOOR_SCENES.map(imageOf)

/** Обложка первого экрана каталога входных дверей */
const covers = DOOR_SCENES.filter((s) => s.cover)
if (covers.length !== 1) throw new Error(`Рендеры «на доме»: обложка должна быть одна, сейчас ${covers.length} (cover: true в src/data/entrance-scenes.ts)`)
export const COVER_SCENE: SceneImage = all.find((s) => s.slot === covers[0]!.slot)!

/** Все кадры модели, в порядке объявления */
export const scenesOfDoor = (id: string): SceneImage[] => all.filter((s) => s.door.id === id)

/** Лента на странице каталога: первый кадр каждой модели, кроме обложки; модели — от дешёвых к дорогим, как в группах */
export const HOUSE_SCENES: SceneImage[] = ENTRANCE_DOORS
  .filter((d) => d.id !== COVER_SCENE.door.id)
  .sort((a, b) => a.from - b.from)
  .flatMap((d) => scenesOfDoor(d.id).slice(0, 1))
