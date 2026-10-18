/**
 * Написать Константину: WhatsApp (номер из SITE.phones с whatsapp: true,
 * ссылка wa.me) и личный Telegram (SITE.social.telegramChat, ссылка
 * t.me/<имя>). На телефоне открывают приложение, на компьютере — веб-версию.
 *
 * Сообщение уже набрано — одно для обоих мессенджеров: обращение по имени,
 * откуда пишут (менеджер видит, что человек с сайта) и зачем. «Здравствуйте»,
 * а не «Добрый день»: сообщение могут прочесть в любое время. Человек
 * дописывает своё или отправляет как есть.
 */
import { SITE } from '../config/site'

const FIRST_NAME = SITE.contactPerson.split(' ')[0]
const HELLO = `Здравствуйте, ${FIRST_NAME}! Пишу с сайта ${SITE.host}`

/** Обращение по умолчанию — кнопки «Написать» */
export const CONSULT_MESSAGE = `${HELLO} — нужна ваша консультация.`
/** Запись в салон — кнопка первого экрана; человек дописывает удобное время */
export const BOOK_MESSAGE = `${HELLO} — хочу приехать в салон на консультацию. Удобное время: `
/** Перед готовым текстом (расчёт из калькулятора) — приветствие и пустая строка */
const withBody = (body: string) => `${HELLO}.\n\n${body}`

export const WHATSAPP = SITE.phones.find((p) => 'whatsapp' in p && p.whatsapp)

export const whatsappUrl = (text: string = CONSULT_MESSAGE): string =>
  WHATSAPP ? `https://wa.me/${WHATSAPP.raw.replace(/\D/g, '')}?text=${encodeURIComponent(text)}` : ''

export const whatsappWithText = (body: string): string => whatsappUrl(withBody(body))

/** Личный Telegram (без @); пусто — ссылки Telegram «написать» не выводятся */
export const TELEGRAM_CHAT: string = SITE.social.telegramChat

/* ?text= — набранное сообщение в поле ввода (Telegram deep links); клиент,
   который его не понимает, просто откроет чат */
export const telegramChatUrl = (text: string = CONSULT_MESSAGE): string =>
  TELEGRAM_CHAT ? `https://t.me/${TELEGRAM_CHAT}?text=${encodeURIComponent(text)}` : ''

export const telegramWithText = (body: string): string => telegramChatUrl(withBody(body))
