/**
 * Значки мессенджеров (public/icons/): onLight — на светлом фоне, onDark —
 * на тёмном. Один источник путей для WhatsAppIcon, TelegramIcon, MaxIcon,
 * шапки и подвала.
 *
 * ?v= — версия файлов: /icons/ отдаются с кэшем на неделю без перепроверки
 * (deploy/nginx/site.conf). Заменили файл значка — поднимите ICONS_VERSION,
 * иначе у посетителей неделю будет старый (так было с MAX: квадрат на iOS).
 */
const ICONS_VERSION = '2'
const icon = (file: string) => `/icons/${file}?v=${ICONS_VERSION}`

export const MESSENGER_ICONS = {
  whatsapp: { onLight: icon('whatsapp-black.png'), onDark: icon('whatsapp-white.png') },
  telegram: { onLight: icon('telegram-black.png'), onDark: icon('telegram-white.png') },
  max:      { onLight: icon('max-dark.svg'),       onDark: icon('max-white.svg') },
} as const

/** Фирменный градиент MAX — цвета из стилей max.ru (градиент логотипа/текста).
 *  Только для кольца пульсации у кнопки MAX; сам знак градиентом не красим */
export const MAX_GRADIENT = 'linear-gradient(135deg, #43d6ff 0%, #5a8cff 50%, #8f3fff 100%)'

/** Официальный знак YouTube — красный, один на светлом и тёмном фоне */
export const YOUTUBE_ICON = icon('youtube.svg')

/** Официальный знак ВКонтакте — синий квадрат, один на светлом и тёмном фоне */
export const VK_ICON = icon('vk.svg')
