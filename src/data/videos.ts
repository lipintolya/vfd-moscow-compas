/**
 * src/data/videos.ts
 *
 * Видео руководителя шоурума — блок Videos.astro на главной. По нажатию
 * ролик открывается в окне-плеере поверх страницы. Страница грузит только
 * обложку; сам ролик начинает скачиваться после нажатия «смотреть».
 *
 * КАК ДОБАВИТЬ РОЛИК: замени заглушку объектом с `title`, `text`, `cover`
 * и одним из источников:
 *   - `src`   — прямая ссылка на .mp4 (бакет Yandex Cloud) — играет
 *               встроенный плеер браузера, без сторонних сервисов.
 *               Перед загрузкой сжать (720 px по ширине, H.264, faststart):
 *               ffmpeg -i in.mp4 -vf "scale='min(720,iw)':-2" -c:v libx264 \
 *                 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 64k \
 *                 -movflags +faststart out.mp4
 *   - `embed` — адрес встраивания плеера площадки:
 *               VK Видео  https://vk.com/video_ext.php?oid=…&id=…&hash=…
 *               Rutube    https://rutube.ru/play/embed/<id>
 * Обложку из первого кадра ролика делает `npm run gen:video-covers`;
 * затемнение — стилем карточки в Videos.astro, не в файле.
 * Вертикальный ролик (снят на телефон, 9:16) — `vertical: true`.
 */

export interface Video {
  id:        string
  title:     string
  /** Одно-два предложения под названием карточки */
  text?:     string
  /** Кадр-обложка карточки, 2:3 (public/renders/home/videos/) */
  cover?:    string
  /** Секунда кадра для обложки, если начало не подходит (чёрный кадр,
   *  заставка). По умолчанию — первый кадр. Читает scripts/gen-video-covers.mjs */
  coverAt?:  number
  src?:      string
  embed?:    string
  /** Подпись длительности, например «4:12» */
  duration?: string
  vertical?: boolean
  /** Заглушка (PLACEHOLDER): ролика ещё нет — карточка без плеера */
  placeholder?: boolean
}

/* Ролики салона в облаке */
const CDN = 'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/short.video.main'

/* Названия у роликов без `text` — рабочие, по содержанию ролика;
   окончательные названия и описания допишет салон. */
export const VIDEOS: Video[] = [
  {
    id:       'hidden-door-edge',
    title:    'Кромка скрытой двери',
    text:     'В цвет стены или в алюминиевом обрамлении — оно защищает торец от износа и сохраняет геометрию полотна.',
    src:      `${CDN}/hero_video_main1.mp4`,
    cover:    '/renders/home/videos/hidden-door-edge.webp',
    duration: '0:51',
    vertical: true,
  },
  {
    id:       'smart-lock-handle',
    title:    'Ручка с электронным замком',
    src:      `${CDN}/2026-10-03_13.06.48.mp4`,
    cover:    '/renders/home/videos/smart-lock-handle.webp',
    coverAt:  2.5,   // ролик начинается с заставки-текста — первый кадр после неё
    duration: '0:39',
    vertical: true,
  },
  {
    id:       'horizontal-slats',
    title:    'Полотно с горизонтальными рейками',
    src:      `${CDN}/2026-10-03_13.06.19.mp4`,
    cover:    '/renders/home/videos/horizontal-slats.webp',
    duration: '0:06',
    vertical: true,
  },
  {
    id:       'slat-wall-door',
    title:    'Скрытая дверь в реечной стене',
    src:      `${CDN}/2026-10-03_13.06.03.mp4`,
    cover:    '/renders/home/videos/slat-wall-door.webp',
    duration: '0:33',
    vertical: true,
  },
  {
    id:       'grey-enamel-brass',
    title:    'Серая эмаль и латунная фурнитура',
    src:      `${CDN}/2026-10-03_12.54.36.mp4`,
    cover:    '/renders/home/videos/grey-enamel-brass.webp',
    duration: '0:48',
    vertical: true,
  },
]
