/**
 * Факты об обработке персональных данных для политики (/privacy/) и
 * согласия на cookie (/consent/): кто оператор, куда писать, что, где и
 * сколько хранится. Поменялось что-то в согласии — поднимите
 * CONSENT_VERSION в src/lib/cookie-consent.ts, баннер спросит заново.
 */
import { SITE } from '../config/site'
import { companyLegalInfo } from '../lib/contacts-data'

export const PD_OPERATOR = {
  name: companyLegalInfo.ownerName,
  email: SITE.email,
}

/** Яндекс Метрика включена (задан счётчик) — только тогда сайт ставит cookie и спрашивает согласие */
export const METRIKA_ON = Boolean(SITE.analytics.yandexMetrikaId)

/** Журналы веб-сервера хранятся столько дней (deploy/logrotate/nginx, тест сверяет) */
export const SERVER_LOG_DAYS = 14

/** Обработчик данных Метрики по поручению оператора (ч. 3 ст. 6 152-ФЗ) */
export const METRIKA_PROCESSOR = {
  name: 'ООО «Яндекс»',
  address: '119021, г. Москва, ул. Льва Толстого, д. 16',
  policy: 'https://yandex.ru/legal/confidential/',
}

/** Что собирает Метрика — перечень для согласия и политики */
export const METRIKA_DATA = [
  'файлы cookie и идентификатор браузера',
  'IP-адрес и примерное местоположение по нему',
  'тип устройства, операционная система, браузер, размер экрана',
  'адреса просмотренных страниц, страница, с которой пришли, дата и время визита',
  'действия на страницах: прокрутка, нажатия, переходы по ссылкам (Вебвизор)',
]

/** Редакция политики и согласия — показывается в конце документов */
export const PD_DOCS_DATE = '17 октября 2026 г.'
