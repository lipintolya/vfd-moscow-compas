/**
 * src/data/videos.ts
 *
 * Видео руководителя шоурума — блок Videos.astro на главной. По нажатию
 * ролик открывается в окне-плеере поверх страницы.
 *
 * КАК ДОБАВИТЬ РОЛИК: замени заглушку объектом с `title`, `cover` и одним
 * из источников:
 *   - `src`   — прямая ссылка на .mp4 (например, в бакете Yandex Cloud) —
 *               играет встроенный плеер браузера, без сторонних сервисов;
 *   - `embed` — адрес встраивания плеера площадки:
 *               VK Видео  https://vk.com/video_ext.php?oid=…&id=…&hash=…
 *               Rutube    https://rutube.ru/play/embed/<id>
 *               YouTube   https://www.youtube-nocookie.com/embed/<id>
 * Вертикальный ролик (снят на телефон, 9:16) — `vertical: true`.
 */

export interface Video {
  id:        string
  title:     string
  /** Кадр-обложка карточки (карточка обрезает его до 4:5) */
  cover?:    string
  src?:      string
  embed?:    string
  /** Подпись длительности, например «4:12» */
  duration?: string
  vertical?: boolean
  /** Заглушка (PLACEHOLDER): ролика ещё нет — карточка без плеера */
  placeholder?: boolean
}

/* PLACEHOLDER — ролики ещё не переданы салоном. */
const placeholderVideo = (n: number): Video => ({
  id: `placeholder-${n}`,
  title: 'Название ролика',
  placeholder: true,
})

export const VIDEOS: Video[] = [1, 2, 3, 4].map(placeholderVideo)
