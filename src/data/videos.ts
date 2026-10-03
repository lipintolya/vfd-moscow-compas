/**
 * src/data/videos.ts
 *
 * Видео руководителя шоурума: блок на главной (первые HOME_VIDEOS) и
 * страница /video/ (все). По нажатию ролик открывается в окне-плеере
 * (src/components/video/VideoPlayer.astro), ролики листаются кнопками
 * и свайпом. Страница грузит только обложки; ролик начинает скачиваться
 * после нажатия «смотреть».
 *
 * КАК ДОБАВИТЬ РОЛИК: добавь в начало VIDEOS объект с `id`, `title`,
 * `text`, `cover`, `duration` и одним из источников:
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
 * затемнение — стилем карточки (VideoCard.astro), не в файле.
 * Вертикальный ролик (снят на телефон, 9:16) — `vertical: true`.
 */

export interface Video {
  id:        string
  /** Название в две строки: перенос — \n, предлог с словом —
   *  неразрывным пробелом (\u00A0), чтобы не висел в конце строки.
   *  Все названия — в две строки: карточки в ряду выглядят ровно. */
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

/* Порядок = порядок на сайте: новые ролики — в начало списка. На главной
   показываются первые HOME_VIDEOS, все — на странице /video/.
   Описания — примерно одной длины (90–105 знаков): карточки в ряду
   выглядят ровно. */
export const HOME_VIDEOS = 5

export const VIDEOS: Video[] = [
  {
    id:       'slope-casings',
    title:    'Наличники\nпод откосы стен',
    text:     'Откосы в частном доме изменили планы: мы аккуратно подрезали наличники, чтобы вписать двери в углы.',
    src:      `${CDN}/IMG_8004.mp4`,
    cover:    '/renders/home/videos/slope-casings.webp',
    duration: '0:13',
    vertical: true,
  },
  {
    id:       'false-transom-doors',
    title:    'Двери\nс фальшфрамугой',
    text:     'Цвет «Орех американский», высота полотен 2500 мм, а фальшфрамуга над ними продолжает рисунок полотна.',
    src:      `${CDN}/IMG_6293.mp4`,
    cover:    '/renders/home/videos/false-transom-doors.webp',
    duration: '0:31',
    vertical: true,
  },
  {
    id:       'hidden-door-edge',
    title:    'Кромка\nскрытой двери',
    text:     'В цвет стены или в алюминиевом обрамлении — оно защищает торец от износа и сохраняет геометрию полотна.',
    src:      `${CDN}/hero_video_main1.mp4`,
    cover:    '/renders/home/videos/hidden-door-edge.webp',
    duration: '0:51',
    vertical: true,
  },
  {
    id:       'smart-lock-door',
    title:    'Дверь\nс электронным замком',
    text:     'Забытые ключи больше не проблема: дверь откроется по коду, отпечатку пальца или через приложение.',
    src:      `${CDN}/2026-10-03_13.06.48.mp4`,
    cover:    '/renders/home/videos/smart-lock-door.webp',
    coverAt:  2.5,   // ролик начинается с заставки-текста — первый кадр после неё
    duration: '0:39',
    vertical: true,
  },
  {
    id:       'louvre-door',
    title:    'Дверь\nс жалюзи',
    text:     'Новинка фабрики: дверь делит пространство на зоны, пропускает свет и воздух, но сохраняет уединённость.',
    src:      `${CDN}/2026-10-03_13.06.19.mp4`,
    cover:    '/renders/home/videos/louvre-door.webp',
    duration: '0:06',
    vertical: true,
  },
  {
    id:       'acoustic-panels',
    title:    'Шумоизоляционные\nстеновые панели',
    text:     'Красота и акустический комфорт в квартире, офисе, студии звукозаписи или домашнем кинотеатре.',
    src:      `${CDN}/2026-10-03_13.06.03.mp4`,
    cover:    '/renders/home/videos/acoustic-panels.webp',
    duration: '0:33',
    vertical: true,
  },
  {
    id:       'door-installation',
    title:    'Аккуратная\nустановка дверей',
    text:     'Качественная дверь и профессиональный монтаж: наш мастер устанавливает двери уже более 15 лет.',
    src:      `${CDN}/2026-10-03_12.54.36.mp4`,
    cover:    '/renders/home/videos/door-installation.webp',
    duration: '0:48',
    vertical: true,
  },
]
