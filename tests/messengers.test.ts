import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  WHATSAPP, whatsappUrl, whatsappWithText,
  TELEGRAM_CHAT, telegramChatUrl, telegramWithText, CONSULT_MESSAGE,
  MAX_CHAT, maxChatUrl, maxWithText,
} from '../src/lib/messengers'
import { ROUTE_URL, MAP_URL } from '../src/lib/map-links'
import { SITE } from '../src/config/site'

const textOf = (url: string) => new URL(url).searchParams.get('text')!

test('текст обращения: по имени, откуда пишут, зачем; без «добрый день» — сообщение могут прочесть вечером', () => {
  assert.equal(CONSULT_MESSAGE, `Здравствуйте, Константин! Пишу с сайта ${SITE.host} — нужна ваша консультация.`)
})

test('WhatsApp — номер Константина, ссылка wa.me только с цифрами номера и закодированным текстом', () => {
  assert.equal(WHATSAPP?.raw, '+79687748820')
  assert.match(whatsappUrl(), /^https:\/\/wa\.me\/79687748820\?text=/)
  assert.equal(textOf(whatsappUrl()), CONSULT_MESSAGE)
  assert.doesNotMatch(whatsappUrl(), /[а-яё\s]/i)
})

test('Telegram — личный чат Константина (не канал) с тем же текстом', () => {
  assert.equal(TELEGRAM_CHAT, 'zizekos')
  assert.match(telegramChatUrl(), /^https:\/\/t\.me\/zizekos\?text=/)
  assert.equal(textOf(telegramChatUrl()), CONSULT_MESSAGE)
  assert.notEqual(new URL(telegramChatUrl()).pathname, new URL(SITE.social.telegram).pathname)
})

test('расчёт из калькулятора: приветствие, откуда пишут, пустая строка, расчёт — одинаково в обоих мессенджерах', () => {
  const expected = `Здравствуйте, Константин! Пишу с сайта ${SITE.host}.\n\nИтого: 21 760 ₽`
  assert.equal(textOf(whatsappWithText('Итого: 21 760 ₽')), expected)
  assert.equal(textOf(telegramWithText('Итого: 21 760 ₽')), expected)
})

test('карта — карточка салона на Яндекс Картах, маршрут — до неё же', () => {
  assert.equal(MAP_URL, SITE.yandexMaps)
  const route = new URL(ROUTE_URL)
  assert.equal(route.origin + route.pathname, 'https://yandex.ru/maps/')
  assert.equal(route.searchParams.get('ruri'), '~ymapsbm1://org?oid=167320599705')
  assert.match(route.searchParams.get('rtext')!, /^~55\.\d+,37\.\d+$/)
})

test('MAX — личный чат Константина; в ссылке нет текста (его копируют по клику), копия — то же приветствие', () => {
  assert.equal(MAX_CHAT, SITE.social.maxChat)
  assert.match(maxChatUrl(), /^https:\/\/max\.ru\/u\/[\w-]+$/)
  assert.doesNotMatch(maxChatUrl(), /text=/)
  assert.equal(maxWithText('Итого: 21 760 ₽'), `Здравствуйте, Константин! Пишу с сайта ${SITE.host}.\n\nИтого: 21 760 ₽`)
})
