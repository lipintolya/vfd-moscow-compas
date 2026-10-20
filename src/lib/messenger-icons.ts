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
