/**
 * Ссылки на маршрут в Яндекс Картах до салона — по координатам из site.ts.
 * Точка отправления пустая (`rtext=~…`): Карты подставят местоположение
 * пользователя, на телефоне ссылка открывается в приложении.
 */
import { SITE } from '../config/site'

/** auto — на машине, mt — на общественном транспорте, pd — пешком */
export type RouteMode = 'auto' | 'mt' | 'pd'

const { lat, lng } = SITE.address.coordinates

export const routeUrl = (mode: RouteMode) =>
  `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=${mode}`
