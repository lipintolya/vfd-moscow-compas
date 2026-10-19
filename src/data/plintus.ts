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
}

const photo = (n: number) => `/media/plintus/plintus-${String(n).padStart(2, '0')}.webp`

export const PLINTUS: PlintusItem[] = [
  { photo: photo(1), text: 'Белый, с карнизом' },
  { photo: photo(2), text: 'Светло-серый, с карнизом' },
  { photo: photo(3), text: 'Серо-сиреневый, с карнизом' },
  { photo: photo(4), text: 'Жемчужно-серый, с карнизом' },
  { photo: photo(5), text: 'Кремовый, с карнизом' },
  { photo: photo(6), text: 'Бирюзовый, с карнизом' },
  { photo: photo(7), text: 'Чёрный, с карнизом' },
  { photo: photo(8), text: 'Красный, с карнизом' },
  { photo: photo(9), text: 'Белый, прямой профиль' },
  { photo: photo(10), text: 'Бежевый, прямой профиль' },
  { photo: photo(11), text: 'Серый, с лёгким карнизом' },
  { photo: photo(12), text: 'Серый, прямой профиль' },
  { photo: photo(13), text: 'Светло-бежевый, прямой профиль' },
  { photo: photo(14), text: 'Коралловый, с карнизом' },
  { photo: photo(15), text: 'Тёмно-синий, с карнизом' },
  { photo: photo(16), text: 'Тёмно-зелёный, с карнизом' },
  { photo: photo(17), text: 'Молочно-белый, с карнизом' },
  { photo: photo(18), text: 'Песочный, с карнизом' },
  { photo: photo(19), text: 'Нежно-розовый, с карнизом' },
  { photo: photo(20), text: 'Бежево-серый, с карнизом' },
  { photo: photo(21), text: 'Горчичный, прямой профиль' },
  { photo: photo(22), text: 'Сине-зелёный, с карнизом' },
  { photo: photo(23), text: 'Тёмно-коричневый, с карнизом' },
  { photo: photo(24), text: 'Фиолетовый, с карнизом' },
]
