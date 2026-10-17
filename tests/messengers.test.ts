import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WHATSAPP, whatsappUrl } from '../src/lib/messengers'
import { ROUTE_URL, MAP_URL } from '../src/lib/map-links'
import { SITE } from '../src/config/site'

test('WhatsApp — номер Константина, ссылка wa.me только с цифрами номера', () => {
  assert.equal(WHATSAPP?.raw, '+79687748820')
  assert.match(whatsappUrl(), /^https:\/\/wa\.me\/79687748820\?text=/)
})

test('WhatsApp: текст сообщения — с сайта, а не «из Яндекс Карт», переносы и кириллица закодированы', () => {
  const text = decodeURIComponent(new URL(whatsappUrl()).searchParams.get('text')!)
  assert.match(text, new RegExp(`^Обращение с сайта ${SITE.host}\\nЗдравствуйте!`))
  assert.doesNotMatch(text, /Яндекс Карт/)
  assert.doesNotMatch(whatsappUrl(), /[а-яё\s]/i)
})

test('карта — карточка салона на Яндекс Картах, маршрут — до неё же', () => {
  assert.equal(MAP_URL, SITE.yandexMaps)
  const route = new URL(ROUTE_URL)
  assert.equal(route.origin + route.pathname, 'https://yandex.ru/maps/')
  assert.equal(route.searchParams.get('ruri'), '~ymapsbm1://org?oid=167320599705')
  assert.match(route.searchParams.get('rtext')!, /^~55\.\d+,37\.\d+$/)
})

import { whatsappWithText } from '../src/lib/messengers'

test('WhatsApp с готовым текстом (расчёт): та же пометка «с сайта», приветствие и сам текст', () => {
  const text = new URL(whatsappWithText('Итого: 21 760 ₽')).searchParams.get('text')!
  assert.equal(text, `Обращение с сайта ${SITE.host}\nЗдравствуйте!\n\nИтого: 21 760 ₽`)
})
