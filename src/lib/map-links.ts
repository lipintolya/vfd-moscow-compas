/**
 * Яндекс Карты: карточка салона (MAP_URL — «Открыть на карте») и маршрут
 * до неё (ROUTE_URL). Точка отправления пустая (`rtext=~…`): Карты
 * подставят местоположение пользователя и предложат способ; ruri — сама
 * организация, поэтому в маршруте её название, а не просто точка. На
 * телефоне ссылки открываются в приложении Карт.
 */
import { SITE } from '../config/site'

const { lat, lng } = SITE.address.coordinates
const ORG_ID = SITE.yandexMaps.match(/\/org\/[^/]+\/(\d+)/)?.[1]

export const MAP_URL = SITE.yandexMaps

export const ROUTE_URL = `https://yandex.ru/maps/?rtext=~${lat},${lng}`
  + (ORG_ID ? `&ruri=${encodeURIComponent(`~ymapsbm1://org?oid=${ORG_ID}`)}` : '')
