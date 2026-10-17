/**
 * WhatsApp салона — номер из SITE.phones с whatsapp: true. Ссылка wa.me
 * (официальный «click to chat»): на телефоне открывает приложение, на
 * компьютере — WhatsApp Web. Текст уже набран: откуда обращение (сайт —
 * менеджер видит канал) и приветствие; человек дописывает своё.
 */
import { SITE } from '../config/site'

export const WHATSAPP = SITE.phones.find((p) => 'whatsapp' in p && p.whatsapp)

/* Первая строка — откуда обращение: менеджер видит канал */
const SOURCE = `Обращение с сайта ${SITE.host}`
const GREETING = `${SOURCE}\nЗдравствуйте! Меня интересуют двери.`

export const whatsappUrl = (text: string = GREETING): string =>
  WHATSAPP ? `https://wa.me/${WHATSAPP.raw.replace(/\D/g, '')}?text=${encodeURIComponent(text)}` : ''

/** Чат с готовым текстом — например, расчётом комплекта из калькулятора */
export const whatsappWithText = (body: string): string => whatsappUrl(`${SOURCE}\nЗдравствуйте!\n\n${body}`)
