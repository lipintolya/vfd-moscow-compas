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
    postal: SITE.address.full,
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

  // Время работы — PLACEHOLDER, уточнить график ТЦ «Компас»
  workingHours: {
    weekdays: { opens: '10:00', closes: '22:00', label: 'Пн–Пт: 10:00–22:00' },
    saturday: { opens: '10:00', closes: '22:00', label: 'Сб: 10:00–22:00' },
    sunday: { opens: '10:00', closes: '22:00', label: 'Вс: 10:00–22:00' },
    shortDisplay: 'Ежедневно: 10:00–22:00',
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
    description: `${SITE.fullName}. Межкомнатные и входные двери, скрытые двери, алюминиевые перегородки — подбор, замер и монтаж ${SITE.city.in}.`,
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
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '10:00', closes: '22:00' },
  ],

  // Способы оплаты
  paymentMethods: ['Наличные', 'Карты (Visa, MasterCard, Maestro)', 'Переводы через Сбербанк'],

  // Социальные сети
  socialMedia: [
    { name: 'VK', label: 'ВКонтакте', url: SITE.social.vk, icon: 'https://storage.yandexcloud.net/catalog-vfd/icons/vk_logo.svg' },
    { name: 'Telegram', label: 'Telegram', url: SITE.social.telegram, icon: 'https://storage.yandexcloud.net/catalog-vfd/icons/tg_logo.svg' },
    { name: 'MAX', label: 'Max', url: SITE.social.max, icon: 'https://storage.yandexcloud.net/catalog-vfd/svg/max-logo.svg' },
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
 * Условия возврата и доставки для structured data (schema.org Offer) —
 * единый источник для всех Product/Offer JSON-LD на сайте (модели, входные
 * двери, скрытые двери). Актуально на 22.09.2026 — при изменении сроков/цен
 * обновить здесь, а не в каждой странице по отдельности.
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
  /** Доставка по городу — фиксированная цена (PLACEHOLDER: тариф
      перенесён из челябинского салона, уточнить московский). В schema
      указан только городской тариф; условия за город — текстом на
      странице/у менеджера. */
  shipping: {
    '@type': 'OfferShippingDetails' as const,
    shippingRate: { '@type': 'MonetaryAmount' as const, value: 1000, currency: 'RUB' },
    shippingDestination: { '@type': 'DefinedRegion' as const, addressCountry: 'RU', addressLocality: SITE.city.name },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime' as const,
      handlingTime: { '@type': 'QuantitativeValue' as const, minValue: 0, maxValue: 1, unitCode: 'DAY' },
      transitTime:  { '@type': 'QuantitativeValue' as const, minValue: 42, maxValue: 56, unitCode: 'DAY' },
    },
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
