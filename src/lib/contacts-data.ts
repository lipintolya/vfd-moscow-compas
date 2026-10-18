/**
 * Данные салона для сайта.
 * Бренд, адрес салона, телефоны и соцсети берутся из src/config/site.ts.
 *
 * Владелец сайта — физическое лицо (решение владельца, 2026-10-07):
 * реквизиты юрлица (карточка ООО) на сайте не публикуются. Оператор
 * персональных данных в политике и согласии — ownerName.
 */
import { SITE } from '../config/site'
import { WARRANTY_TERMS } from '../data/services'

/** Почта задана? Пока в конфиге заглушка — адрес на сайте не выводим */
export const HAS_EMAIL = !/placeholder/i.test(SITE.email)

const { opens, closes } = SITE.hours

export const companyLegalInfo = {
  /** ФИО владельца сайта — оператора персональных данных (/privacy/, /consent/) */
  ownerName: 'Зизевский Константин Владимирович',
  shortName: SITE.fullName,

  // Адреса
  address: {
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

  // Время работы салона — ежедневно, из SITE.hours
  workingHours: {
    weekdays: { opens, closes, label: `Пн–Пт: ${opens}–${closes}` },
    saturday: { opens, closes, label: `Сб: ${opens}–${closes}` },
    sunday: { opens, closes, label: `Вс: ${opens}–${closes}` },
    shortDisplay: `Ежедневно: ${opens}–${closes}`,
  },

  // Информация о деятельности
  activity: {
    founded: 0, // год открытия салона в «Компасе» — уточнить у владельца
    description: `${SITE.fullName}. Межкомнатные и скрытые двери, алюминиевые перегородки — подбор, замер и монтаж ${SITE.city.in}.`,
    license: 'Торговля допускается без лицензии',
  },

  // Рабочее время для поисковых систем (schema.org) — синхронно с workingHours
  schemaOrgHours: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens, closes },
  ],

  // Способы оплаты — только названия, без подробностей; id — ключ иконки
  // (src/components/contacts/PaymentMethods.astro)
  paymentMethods: [
    { id: 'cash',    label: 'Наличные' },
    { id: 'card',    label: 'Банковская карта' },
    { id: 'invoice', label: 'Безналичный расчёт' },
    { id: 'sbp',     label: 'QR-код СБП' },
  ] as const,

  // Telegram-канал салона (читать); написать — WhatsApp и личный Telegram, src/lib/messengers.ts
  socialMedia: [
    { name: 'Telegram', label: 'Telegram-канал', url: SITE.social.telegram, icon: '/media/catalog-vfd/icons/tg_logo.svg' },
  ],

  // Дополнительная информация
  additional: {
    /** Гарантия — одна формулировка на весь сайт (src/data/services.ts) */
    warranty: WARRANTY_TERMS,
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
