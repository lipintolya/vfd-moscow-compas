/**
 * «Построить маршрут» — Яндекс Карты с маршрутом до салона по координатам
 * из site.ts. Точка отправления пустая (`rtext=~…`): Карты подставят
 * местоположение пользователя и сами предложат способ; на телефоне ссылка
 * открывается в приложении.
 */
import { SITE } from '../config/site'

const { lat, lng } = SITE.address.coordinates

export const ROUTE_URL = `https://yandex.ru/maps/?rtext=~${lat},${lng}`
