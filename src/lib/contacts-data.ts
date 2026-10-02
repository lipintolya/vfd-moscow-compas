/**
 * Данные компании согласно законодательству РФ
 * Обновлено: июнь 2026 г.
 */

export const companyLegalInfo = {
  // Основные реквизиты
  fullName: 'Индивидуальный предприниматель Липина Надежда Анатольевна',
  shortName: 'ВФД (Фирменный салон Владимирской фабрики дверей)',
  
  // Адреса
  address: {
    legal: 'г. Челябинск, ул. Братьев Кашириных, 131Б',
    postal: 'г. Челябинск, ул. Братьев Кашириных, 131Б',
    entrance: 'Вход со стороны ул. Чичерина',
    coordinates: { lat: 55.172868, lng: 61.306572 },
  },

  // Контакты
  contacts: {
    phone: [
      { raw: '+79000297888', label: '+7 (900) 029-78-88', title: 'Основной номер' },
      { raw: '+79630807888', label: '+7 (963) 080-78-88', title: 'Дополнительный номер' },
    ],
    email: 'vfddoors74@mail.ru',
    website: 'https://vfd74.ru',
  },

  // Реквизиты
  requisites: {
    ogrnip: '323745600047178',
    inn: '452402308842',
    okpo: '2021397319',
    okato: '75401364000',
    oktmo: '75701310000',
    pfr_number: '1273789246',
    fss_number: '1273789246',
  },

  // Время работы — единый круглогодичный график (без сезонных Вс)
  workingHours: {
    weekdays: { opens: '10:00', closes: '20:00', label: 'Пн–Пт: 10:00–20:00' },
    saturday: { opens: '10:00', closes: '18:00', label: 'Сб: 10:00–18:00' },
    sunday: { opens: '10:00', closes: '18:00', label: 'Вс: 10:00–18:00' },
    shortDisplay: 'Пн–Пт: 10:00–20:00, Сб–Вс: 10:00–18:00',
  },

  // Сведения о руководителе
  director: {
    firstName: 'Надежда',
    lastName: 'Липина',
    middleName: 'Анатольевна',
    fullName: 'Липина Надежда Анатольевна',
    position: 'Индивидуальный предприниматель',
    experience: 'Более 20 лет в дверной отрасли',
  },

  // Информация о деятельности
  activity: {
    founded: 2014,
    registered: '27 марта 2023 г.',
    description: 'Фирменный салон Владимирской фабрики дверей. Реализация входных и межкомнатных дверей, алюминиевых перегородок, консультации по подбору, замер и монтаж.',
    license: 'Торговля допускается без лицензии',
  },

  // СПД и налоги
  taxation: {
    system: 'УСН (упрощённая система налогообложения)',
    regime: '15% (доход минус расходы), ПСН',
    tax_office: 'Межрайонная инспекция ФНС России № 17 по Челябинской области',
  },

  // Рабочее время для поисковых систем (schema.org)
  schemaOrgHours: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '20:00' },
    { dayOfWeek: ['Saturday', 'Sunday'], opens: '10:00', closes: '18:00' },
  ],

  // Способы оплаты
  paymentMethods: ['Наличные', 'Карты (Visa, MasterCard, Maestro)', 'Переводы через Сбербанк'],

  // Социальные сети
  socialMedia: [
    { name: 'VK', label: 'ВКонтакте', url: 'https://vk.com/vfddoors74', icon: 'https://storage.yandexcloud.net/catalog-vfd/icons/vk_logo.svg' },
    { name: 'Telegram', label: 'Telegram', url: 'https://t.me/vfddoors74', icon: 'https://storage.yandexcloud.net/catalog-vfd/icons/tg_logo.svg' },
    { name: 'MAX', label: 'Max', url: 'https://max.ru/id452402308842_biz', icon: 'https://storage.yandexcloud.net/catalog-vfd/svg/max-logo.svg' },
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
  /** Доставка по Челябинску — фиксированная цена. За город — переменная
      (1000 ₽ + 45 ₽/км), в structured data не выражается (там нужна
      фиксированная цена/диапазон), поэтому в schema указан только
      городской тариф; условия за город — текстом на странице/у менеджера. */
  shipping: {
    '@type': 'OfferShippingDetails' as const,
    shippingRate: { '@type': 'MonetaryAmount' as const, value: 1000, currency: 'RUB' },
    shippingDestination: { '@type': 'DefinedRegion' as const, addressCountry: 'RU', addressLocality: 'Челябинск' },
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
