/**
 * Входные двери в фиде VK Маркета (/feed/vk.yml) — в том же файле, что
 * межкомнатные: импорт по той же ссылке добавляет их к каталогу и не заменяет
 * его (владелец, 3 ноя 2026). Товар — модель, как на сайте: одна карточка на
 * дверь, фото — её отделки по порядку, на белом фоне. Цена — «от» (минимум
 * модели, как на сайте); точную сумму называет менеджер.
 *
 * Без бренда: входные двери не ВФД (владелец, 3 ноя 2026), поэтому название —
 * как на сайте («Входная дверь …»), без <vendor>.
 */
import { DOOR_GROUPS, VARIANTS_SHOWN, type EntranceDoor } from '../data/entrance-doors'
import { rub } from '../data/services'
import { MAX_PICTURES } from './feed-common'
import { vkPhotoFiles, ENTRANCE_PHOTO_BG, type VkPicture } from './vk-photo'

/* id категории — постоянный, как у корня межкомнатных (1) и покрытий (11–15) */
export const ENTRANCE_CATEGORY_ID = 2
export const ENTRANCE_CATEGORY_NAME = 'Входные двери'

/* Версия id входных дверей. VK не заменяет фото у товара, который уже создан
   с этим id (импорт обновляет поля, а фото остаются старые) — как у межкомнатных
   (VK_ITEM_REV в feed-common.ts). Первая выгрузка (3 ноя 2026, id «ve…») ушла,
   когда у многих моделей была только наружная сторона; накладки добавлены
   10 ноября — версия 2 (11 ноя 2026), чтобы карточки получили фото как на
   сайте: лицевая сторона и накладка. Поднять версию — площадка создаст
   входные двери заново; старые карточки удалить в кабинете VK. */
export const VK_ENTRANCE_REV = '2'

/* Префикс «ve» + версия не совпадает с межкомнатными («v2» + hex id модели);
   длина — не больше 22 знаков, как у межкомнатных (id модели укорочен на знак) */
export const vkEntranceId = (doorId: string) => `ve${VK_ENTRANCE_REV}${doorId.replaceAll('-', '').slice(0, 19)}`

export const entranceGroupName = (d: EntranceDoor) => DOOR_GROUPS.find((g) => g.id === d.group)!.nav

/** Название — как на сайте, без бренда */
export const entranceName = (d: EntranceDoor) => d.title

/** Фото карточки: отделки по порядку, как на странице модели (первая — обложка) */
export function entrancePictureSources(d: EntranceDoor): string[] {
  return [...new Set(d.variants.slice(0, VARIANTS_SHOWN).map((v) => v.image.large))].slice(0, MAX_PICTURES)
}

export function entrancePictureFiles(d: EntranceDoor): Promise<VkPicture[]> {
  return vkPhotoFiles(vkEntranceId(d.id), entrancePictureSources(d), ENTRANCE_PHOTO_BG)
}

/** Описание — обычный текст без HTML; «от» — как на сайте. Группа — в свойстве «Тип», здесь её нет */
export function entranceDescription(d: EntranceDoor): string {
  return [
    d.chips.length > 0 ? `${d.title}. ${d.chips.join(', ')}.` : `${d.title}.`,
    `Размеры полотна ${d.sizes} мм, открывание: ${d.opening}.`,
    `Цена — от ${rub(d.from)}. Точная сумма зависит от замков и комплектации, уточняйте у менеджера салона в ТЦ «Компас».`,
  ].join(' ')
}
