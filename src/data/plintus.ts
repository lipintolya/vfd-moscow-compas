/**
 * Напольный плинтус из МДФ — фото и описания для страницы /catalog/plintus/.
 * Названий позиций и цен нет: цену называет менеджер по запросу в мессенджере
 * (кнопка «Запросить цену», src/lib/messengers.ts).
 * Описание — по внешнему виду фото: цвет и профиль («с карнизом» или
 * «прямой профиль»). Оттенки на экране — ориентир, точный уточняйте у менеджера.
 */

export interface PlintusItem {
  /** Фото 1000×1000 — public/media/plintus/ */
  photo: string
  /** Цвет и профиль: подпись карточки и текст запроса в мессенджер */
  text: string
  /** Отрисовка в интерьере, только белый вариант — галерея в окне «Запросить цену» */
  interior: string[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const photo = (n: number) => `/media/plintus/plintus-${pad(n)}.webp`
const interior = (n: number) => [1, 2, 3].map((j) => `/media/plintus/interior/plintus-${pad(n)}-${j}.webp`)

export const PLINTUS: PlintusItem[] = [
  { photo: photo(1), text: 'Белый, с карнизом', interior: interior(1) },
  { photo: photo(2), text: 'Светло-серый, с карнизом', interior: interior(2) },
  { photo: photo(3), text: 'Серо-сиреневый, с карнизом', interior: interior(3) },
  { photo: photo(4), text: 'Жемчужно-серый, с карнизом', interior: interior(4) },
  { photo: photo(5), text: 'Кремовый, с карнизом', interior: interior(5) },
  { photo: photo(6), text: 'Бирюзовый, с карнизом', interior: interior(6) },
  { photo: photo(7), text: 'Чёрный, с карнизом', interior: interior(7) },
  { photo: photo(8), text: 'Красный, с карнизом', interior: interior(8) },
  { photo: photo(9), text: 'Белый, прямой профиль', interior: interior(9) },
  { photo: photo(10), text: 'Бежевый, прямой профиль', interior: interior(10) },
  { photo: photo(11), text: 'Серый, с лёгким карнизом', interior: interior(11) },
  { photo: photo(12), text: 'Серый, прямой профиль', interior: interior(12) },
  { photo: photo(13), text: 'Светло-бежевый, прямой профиль', interior: interior(13) },
  { photo: photo(14), text: 'Коралловый, с карнизом', interior: interior(14) },
  { photo: photo(15), text: 'Тёмно-синий, с карнизом', interior: interior(15) },
  { photo: photo(16), text: 'Тёмно-зелёный, с карнизом', interior: interior(16) },
  { photo: photo(17), text: 'Молочно-белый, с карнизом', interior: interior(17) },
  { photo: photo(18), text: 'Песочный, с карнизом', interior: interior(18) },
  { photo: photo(19), text: 'Нежно-розовый, с карнизом', interior: interior(19) },
  { photo: photo(20), text: 'Бежево-серый, с карнизом', interior: interior(20) },
  { photo: photo(21), text: 'Горчичный, прямой профиль', interior: interior(21) },
  { photo: photo(22), text: 'Сине-зелёный, с карнизом', interior: interior(22) },
  { photo: photo(23), text: 'Тёмно-коричневый, с карнизом', interior: interior(23) },
  { photo: photo(24), text: 'Фиолетовый, с карнизом', interior: interior(24) },
]
