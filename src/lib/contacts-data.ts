/**
 * Данные компании согласно законодательству РФ.
 * Бренд, адрес, телефоны и соцсети берутся из src/config/site.ts.
 * ⚠ Реквизиты и ФИО — PLACEHOLDER, заменить реальными данными салона.
 */
import { SITE } from '../config/site'

export const companyLegalInfo = {
  // Основные реквизиты
  fullName: 'FULL_LEGAL_NAME_PLACEHOLDER', // напр. «Индивидуальный предприниматель …» / «ООО …»
  shortName: SITE.fullName,

  // Адреса
  address: {
    legal: 'LEGAL_ADDRESS_PLACEHOLDER',
    postal: `г. ${SITE.city.name}, ${SITE.address.street}`,
    entrance: `${SITE.address.mall}, ${SITE.address.floor}`,
    coordinates: SITE.address.coordinates,
  },

  // Контакты
  contacts: {
    phone: [...SITE.phones],
    email: SITE.email,
    website: SITE.url,
  },

  // Реквизиты
  requisites: {
    ogrnip: 'OGRN_PLACEHOLDER',
    inn: 'INN_PLACEHOLDER',
    okpo: '',
    okato: '',
    oktmo: '',
    pfr_number: '',
    fss_number: '',
  },

  // Время работы салона — ежедневно 11:00–20:00
  workingHours: {
    weekdays: { opens: '11:00', closes: '20:00', label: 'Пн–Пт: 11:00–20:00' },
    saturday: { opens: '11:00', closes: '20:00', label: 'Сб: 11:00–20:00' },
    sunday: { opens: '11:00', closes: '20:00', label: 'Вс: 11:00–20:00' },
    shortDisplay: 'Ежедневно: 11:00–20:00',
  },

  // Сведения о руководителе — PLACEHOLDER
  director: {
    firstName: '',
    lastName: '',
    middleName: '',
    fullName: 'DIRECTOR_NAME_PLACEHOLDER',
    position: '',
    experience: '',
  },

  // Информация о деятельности
  activity: {
    founded: 0, // TODO: год открытия салона
    registered: '',
    description: `${SITE.fullName}. Межкомнатные и скрытые двери, алюминиевые перегородки — подбор, замер и монтаж ${SITE.city.in}.`,
    license: 'Торговля допускается без лицензии',
  },

  // СПД и налоги — PLACEHOLDER
  taxation: {
    system: '',
    regime: '',
    tax_office: '',
  },

  // Рабочее время для поисковых систем (schema.org) — синхронно с workingHours
  schemaOrgHours: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '11:00', closes: '20:00' },
  ],

  // Способы оплаты
  paymentMethods: ['Наличные', 'Карты (Visa, MasterCard, Maestro)', 'Переводы через Сбербанк'],

  // Социальные сети — только Telegram-канал (см. SITE.social)
  socialMedia: [
    { name: 'Telegram', label: 'Telegram-канал', url: SITE.social.telegram, icon: 'https://storage.yandexcloud.net/catalog-vfd/icons/tg_logo.svg' },
  ],

  // Дополнительная информация
  additional: {
    warranty: 'Гарантия на двери согласно условиям производителя',
    warranty_installation: 'Гарантия на монтажные работы - 12 месяцев',
    free_consultation: true,
    free_measurement: true,
  },
}

/**
 * Условия возврата для structured data (schema.org Offer) — единый источник
 * для всех Product/Offer JSON-LD на сайте (модели, скрытые двери).
 * Доставка (shippingDetails) убрана: цены доставки по Москве пока не
 * публикуются — вернуть сюда, когда салон утвердит тариф.
 */
export const merchantPolicy = {
  /** Двери — товар, изготовленный по индивидуальному заказу (размер, цвет,
      покрытие), возврат/обмен надлежащего качества не предусмотрен
      (ст. 26.1 ЗоЗПП) — только замена при производственном браке. */
  returnPolicy: {
    '@type': 'MerchantReturnPolicy' as const,
    applicableCountry: 'RU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  },
}

/**
 * Часы работы в форматированном виде для UI
 */
export const getFormattedHours = () => {
  const hours = companyLegalInfo.workingHours
  return [
    { day: 'Пн–Пт', time: `${hours.weekdays.opens}–${hours.weekdays.closes}` },
    { day: 'Сб', time: `${hours.saturday.opens}–${hours.saturday.closes}` },
    { day: 'Вс', time: `${hours.sunday.opens}–${hours.sunday.closes}` },
  ]
}

/**
 * Определить, открыт ли салон в данный момент
 */
export const getIsOpenNow = (): { isOpen: boolean; status: string } => {
  const now = new Date()
  const day = now.getDay() // 0 = воскресенье, 1 = понедельник...
  const hoursNow = now.getHours()
  const minutes = now.getMinutes()
  const currentTime = hoursNow * 100 + minutes
  const hours = companyLegalInfo.workingHours

  // Будни (пн-пт)
  if (day >= 1 && day <= 5) {
    const openTime = Number(hours.weekdays.opens.replace(':', ''))
    const closeTime = Number(hours.weekdays.closes.replace(':', ''))
    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, status: 'Открыто' }
    }
    if (currentTime < openTime) {
      return { isOpen: false, status: `Откроемся в ${hours.weekdays.opens}` }
    }
    return { isOpen: false, status: `Закрыто · Откроемся завтра в ${hours.weekdays.opens}` }
  }

  // Суббота
  if (day === 6) {
    const openTime = Number(hours.saturday.opens.replace(':', ''))
    const closeTime = Number(hours.saturday.closes.replace(':', ''))
    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, status: 'Открыто' }
    }
    if (currentTime < openTime) {
      return { isOpen: false, status: `Откроемся в ${hours.saturday.opens}` }
    }
    return { isOpen: false, status: `Закрыто · Откроемся в вс в ${hours.sunday.opens}` }
  }

  // Воскресенье
  const openTime = Number(hours.sunday.opens.replace(':', ''))
  const closeTime = Number(hours.sunday.closes.replace(':', ''))
  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true, status: 'Открыто' }
  }
  if (currentTime < openTime) {
    return { isOpen: false, status: `Откроемся в ${hours.sunday.opens}` }
  }
  return { isOpen: false, status: `Закрыто · Откроемся завтра в ${hours.weekdays.opens}` }
}
