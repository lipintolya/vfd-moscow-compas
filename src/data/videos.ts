/**
 * src/data/videos.ts
 *
 * Видео основателя студии: блок на главной (первые HOME_VIDEOS) и
 * страница /video/ (все). По нажатию ролик открывается в окне-плеере
 * (src/components/video/VideoPlayer.astro), ролики листаются кнопками
 * и свайпом. Страница грузит только обложки; ролик начинает скачиваться
 * после нажатия «смотреть».
 *
 * КАК ДОБАВИТЬ РОЛИК: добавь в начало VIDEOS объект с `id`, `title`,
 * `text`, `cover`, `duration` и одним из источников:
 *   - `src`   — прямая ссылка на .mp4 (бакет Yandex Cloud) — играет
 *               встроенный плеер браузера, без сторонних сервисов.
 *               Файл из public/ — путь от корня сайта, например /renders/home/videos/….mp4.
 *               Перед загрузкой сжать (720 px по ширине, H.264, faststart):
 *               ffmpeg -i in.mp4 -vf "scale='min(720,iw)':-2" -c:v libx264 \
 *                 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 64k \
 *                 -movflags +faststart out.mp4
 *   - `embed` — адрес встраивания плеера площадки:
 *               VK Видео  https://vk.com/video_ext.php?oid=…&id=…&hash=…
 *               Rutube    https://rutube.ru/play/embed/<id>
 * Обложку из кадра ролика делает `npm run gen:video-covers`, кроме
 * `coverManual` (её рисуют вручную);
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
  /** Обложка нарисована вручную (кадр обрезан, чтобы убрать субтитры):
   *  gen:video-covers её не перезаписывает */
  coverManual?: boolean
  src?:      string
  embed?:    string
  /** Подпись длительности, например «4:12» */
  duration?: string
  vertical?: boolean
  /** Ссылка под описанием карточки — например, на модель из ролика в каталоге */
  link?:    { href: string; label: string }
  /** Заглушка (PLACEHOLDER): ролика ещё нет — карточка без плеера */
  placeholder?: boolean
  /** День публикации на сайте (ГГГГ-ММ-ДД) — uploadDate в VideoObject
   *  (src/lib/video-schema.ts). Нужен ролику, у которого есть своя
   *  страница с разметкой видео */
  uploaded?: string
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
    /* Разметка VideoObject — только на /partitions/alum/ (ALUM_OBJECT):
       там ролик главный, здесь и на главной — просто карточка */
    id:       'alum-partition-review',
    title:    'Обзор алюминиевой\nраздвижной перегородки',
    text:     'Перегородка в золотистом профиле между спальней и гостиной: стеклянные створки уходят к стенам.',
    src:      'https://storage.yandexcloud.net/vfd.moscow.compass/video.block/alum_doors.mp4',
    cover:    '/renders/home/videos/alum-partition-review.webp',
    coverAt:  5,     // в начале ролика — субтитры поверх кадра
    duration: '0:18',
    vertical: true,
    link:     { href: '/partitions/alum/', label: 'Раздвижные перегородки на сайте' },
    uploaded: '2026-11-12',
  },
  {
    id:       'club-designers-2026-10',
    title:    'Встреча клуба\nдизайнеров в\u00A0Москве',
    text:     'К сожалению, двери недооценивают: их выбирают в последнюю очередь, хотя от них зависит весь интерьер.',
    src:      '/renders/home/videos/club-designers-2026-10-19.mp4',
    cover:    '/renders/home/videos/club-designers-2026-10-19.webp',
    coverManual: true,  // кадр обрезан ниже субтитров: gen:video-covers его не трогает
    duration: '0:55',
    vertical: true,
  },
  {
    id:       'funny-reel',
    title:    'Бэкстейдж\nсо съёмок',
    text:     'Закулисье съёмок: короткий весёлый ролик без серьёзных советов — просто хорошее настроение.',
    src:      'https://storage.yandexcloud.net/vfd.moscow.compass/video.block/compressed_reels1.mp4',
    cover:    '/renders/home/videos/funny-reel.webp',
    coverAt:  4,
    duration: '0:16',
    vertical: true,
  },
  {
    id:       'hidden-handles',
    title:    'Скрытые ручки\nдля межкомнатных дверей',
    text:     'Такой стиль набирает популярность: его выбирают не только для квартир, но и для коммерческих помещений.',
    src:      `${CDN}/IMG_7597.mp4`,
    cover:    '/renders/home/videos/hidden-handles.webp',
    duration: '0:24',
    vertical: true,
  },
  {
    id:       'hidden-door-secrets',
    title:    'Секреты дверей\nскрытого монтажа',
    text:     'С виду — просто ровная стена. Но за этой гладью стоят точный монтаж и тщательный подбор деталей.',
    src:      `${CDN}/IMG_7520.mp4`,
    cover:    '/renders/home/videos/hidden-door-secrets.webp',
    duration: '0:46',
    vertical: true,
  },
  {
    id:       'mirror-wardrobe-door',
    title:    'Зеркальная дверь\nв гардеробную',
    text:     'Заказчики хотели раздвижную дверь, но в гардеробной не предусмотрели вытяжку, и мы поставили распашную.',
    src:      `${CDN}/IMG_7514.mp4`,
    cover:    '/renders/home/videos/mirror-wardrobe-door.webp',
    duration: '1:09',
    vertical: true,
  },
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
  {
    id:       'artdom-fabric-partitions',
    title:    'Тканевые перегородки\nна выставке ARTDOM',
    text:     'VFD Design представила алюминиевые перегородки с тканевым заполнением — и они произвели настоящий фурор.',
    src:      `${CDN}/IMG_6795.mp4`,
    cover:    '/renders/home/videos/artdom-fabric-partitions.webp',
    duration: '0:22',
    vertical: true,
  },
]

/* Ролики с наших работ — вертикальные клипы с объектов. Отдельный список:
   на главной и на /video/ не показываются, их выводит раздел «Наши работы»
   (/portfolio/). Обложки — npm run gen:video-covers; первый кадр часто
   чёрный или смазанный, поэтому обложка берётся со 2-й секунды (coverAt). */
const WORK = 'https://storage.yandexcloud.net/vfd.moscow.compass/video.block'

export const WORK_VIDEOS: Video[] = [
  /* Замер на объектах (12 Nov 2026): обход на черновой отделке, основатель
     комментирует в окошке. Речь не расшифрована — в подписях только то, что
     видно в кадре, и общие правила замера. Источник — облако, video.block/object1.mp4 и object2.mp4 */
  {
    id:       'work-measure-house',
    title:    'Замер в\u00A0частном доме\nна\u00A0черновой отделке',
    text:     'Проёмы меряем ещё до отделки: ширину, высоту и толщину стены в каждом, чтобы дверь встала точно.',
    src:      `${WORK}/object1.mp4`,
    cover:    '/renders/home/videos/work-measure-house.webp',
    coverAt:  15,
    duration: '1:02',
    vertical: true,
  },
  {
    id:       'work-measure-why',
    title:    'Почему замер\nделает специалист',
    text:     'Ошибка в пару сантиметров — и дверь не встанет. Замерщик учтёт неровные стены и будущий пол.',
    src:      `${WORK}/object2.mp4`,
    cover:    '/renders/home/videos/work-measure-why.webp',
    coverAt:  3,
    duration: '0:28',
    vertical: true,
  },
  /* Два ролика с отзывом клиента по объекту «Эмалекс в новостройке» (12 Nov 2026).
     Сжатые копии — в облаке, video.block/FILE 2026-11-12 17_26_24/30_compross.mp4 */
  {
    id:       'work-emalex-review-1',
    title:    'Двери в покрытии\nЭмалекс в новостройке',
    text:     'Клиент выбирал долго и купил восемь дверей: подбор, фото и видео от салона, доставка в полном комплекте.',
    src:      `${WORK}/FILE%202026-11-12%2017_26_24_compross.mp4`,
    cover:    '/renders/home/videos/work-emalex-review-1.webp',
    coverAt:  2,
    duration: '0:16',
    vertical: true,
  },
  {
    id:       'work-emalex-review-2',
    title:    'Отзыв клиента\nо покупке дверей',
    text:     'Двери в покрытии Эмалекс для квартиры в Москве: задачу выполнили оперативно, клиент остался доволен.',
    src:      `${WORK}/FILE%202026-11-12%2017_26_30_compross.mp4`,
    cover:    '/renders/home/videos/work-emalex-review-2.webp',
    coverAt:  2,
    duration: '0:27',
    vertical: true,
  },
  {
    id:       'work-replace-door',
    title:    'Замена двери:\nподберём и установим',
    text:     'Подберём практически любую дверь и оперативно заменим старую — установим аккуратно.',
    /* Сжатая копия (4,0 МБ, 720×1280); источник — облако, video.block/IMG_6318_compross.mp4 */
    src:      '/renders/home/videos/work-replace-door.mp4',
    cover:    '/renders/home/videos/work-replace-door.webp',
    coverAt:  4,
    duration: '0:32',
    vertical: true,
  },
  {
    id:       'work-urban-skin',
    title:    'Двери «Урбан 2В»\nи\u00A0скин-накладка',
    text:     'Межкомнатные двери и накладка на входную дверь в одной отделке: прихожая выглядит единым целым.',
    /* Сжатая копия (2,9 → 0,8 МБ); источник — облако, video.block/FILE 2026-11-01 12:16:32.mp4 */
    src:      '/renders/home/videos/work-urban-skin.mp4',
    cover:    '/renders/home/videos/work-urban-skin.webp',
    coverAt:  2,
    duration: '0:13',
    vertical: true,
    link:     { href: '/models/urban-2vr-urban-48ab6a/', label: 'Модель «Урбан 2В» в каталоге' },
  },
  {
    id:       'work-entrance-ayslab',
    title:    'Входная дверь «Айслаб»\nв загородном доме',
    text:     'Дверь с рейками под дерево и чёрной панелью на входе в дом: как она выглядит на фасаде вживую.',
    /* Сжатая копия (5,4 → 1,6 МБ); источник — облако, video.block/outdoor_video_main_1.11.26.mp4 */
    src:      '/renders/home/videos/work-entrance-ayslab.mp4',
    cover:    '/renders/home/videos/work-entrance-ayslab.webp',
    coverAt:  2,
    duration: '0:25',
    vertical: true,
  },
  {
    id:       'work-panel-door',
    title:    'Дверь в стеновой панели\nна объекте',
    text:     'Полотно стоит в одной плоскости с отделкой стены, поэтому дверь почти не видна среди панелей.',
    src:      `${WORK}/compressed_object1.mp4`,
    cover:    '/renders/home/videos/work-panel-door.webp',
    coverAt:  2,
    duration: '0:28',
    /* Горизонтальный ролик 16:9 — плеер показывает его без вертикальной рамки */
    vertical: false,
  },
  {
    id:       'work-trim-door',
    title:    'Дверь с наличником\nи золотистой ручкой',
    text:     'Проём отделан наличником, полотно в цвет стены, ручка и замок — в одном тоне.',
    src:      `${WORK}/compressed_object2.mp4`,
    cover:    '/renders/home/videos/work-trim-door.webp',
    coverAt:  2,
    duration: '0:23',
    vertical: true,
  },
  {
    id:       'work-wood-door',
    title:    'Дверь в одном тоне\nс деревянной стеной',
    text:     'Полотно и стеновая панель вокруг выполнены в одном оттенке, поэтому проём смотрится цельно.',
    src:      `${WORK}/compressed_object3.mp4`,
    cover:    '/renders/home/videos/work-wood-door.webp',
    coverAt:  2,
    duration: '0:34',
    vertical: true,
  },
  {
    id:       'work-interior-doors',
    title:    'Межкомнатные двери\nв интерьере',
    text:     'Тёмные двери на фоне светлого пола и отделки: так выглядит проект целиком, а не отдельная дверь.',
    src:      `${WORK}/compressed_object17.10.26.mp4`,
    cover:    '/renders/home/videos/work-interior-doors.webp',
    coverAt:  2,
    duration: '0:32',
    vertical: true,
  },
]

/** Видео с монтажа входной двери — блок на странице входных дверей (catalog/vhodnye-dveri/).
 *  Не в WORK_VIDEOS: это отчёт с монтажа, а не ролик «Видео с объектов».
 *  Сжатая копия (1,6 МБ, 352×640); источник — облако, video.block/IMG_5649_compross.mp4 */
export const ENTRANCE_INSTALL_VIDEO = {
  src:      '/renders/entrance-install-video/montazh.mp4',
  poster:   '/renders/entrance-install-video/montazh-poster.webp',
  title:    'Видео с монтажа входной двери',
  duration: '0:33',
} as const
