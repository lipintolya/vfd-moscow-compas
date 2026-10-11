/* Интерфейс Strapi — по-русски: язык ru и наш словарь недостающих строк
   (Strapi переведён не полностью; проверка — npm run check:ru).
   Русский выбран по умолчанию: при первом входе язык не нужно искать. */
import type { StrapiApp } from '@strapi/strapi/admin'
import ru from './translations/ru.json'

const LANGUAGE_KEY = 'strapi-admin-language'

export default {
  config: {
    locales: ['ru'],
    translations: { ru },
  },
  register(_app: StrapiApp) {
    try {
      if (!localStorage.getItem(LANGUAGE_KEY)) localStorage.setItem(LANGUAGE_KEY, 'ru')
    } catch {
      /* приватный режим браузера — останется английский, язык можно выбрать в профиле */
    }
  },
  bootstrap(_app: StrapiApp) {},
}
