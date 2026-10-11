/**
 * Данные салона для сайта.
 * Бренд, адрес салона, телефоны и соцсети берутся из src/config/site.ts.
 *
 * Владелец сайта — физическое лицо (решение владельца, 2026-10-07):
 * реквизиты юрлица (карточка ООО) на сайте не публикуются. Имя владельца
 * для политики конфиденциальности — ownerName; пока пусто, политика
 * называет оператором «владельца сайта» без ФИО.
 */
import { SITE } from '../config/site'

/** Почта задана? Пока в конфиге заглушка — адрес на сайте не выводим */
export const HAS_EMAIL = !/placeholder/i.test(SITE.email)

export const companyLegalInfo = {
  /** ФИО владельца сайта (оператора персональных данных) — уточнить у владельца */
  ownerName: '',
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

  // Время работы салона — ежедневно 11:00–20:00
  workingHours: {
    weekdays: { opens: '11:00', closes: '20:00', label: 'Пн–Пт: 11:00–20:00' },
    saturday: { opens: '11:00', closes: '20:00', label: 'Сб: 11:00–20:00' },
    sunday: { opens: '11:00', closes: '20:00', label: 'Вс: 11:00–20:00' },
    shortDisplay: 'Ежедневно: 11:00–20:00',
  },

  // Информация о деятельности
  activity: {
    founded: 0, // год открытия салона в «Компасе» — уточнить у владельца
    description: `${SITE.fullName}. Межкомнатные и скрытые двери, алюминиевые перегородки — подбор, замер и монтаж ${SITE.city.in}.`,
    license: 'Торговля допускается без лицензии',
  },

  // Рабочее время для поисковых систем (schema.org) — синхронно с workingHours
  schemaOrgHours: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '11:00', closes: '20:00' },
  ],

  // Способы оплаты — только названия, без подробностей; id — ключ иконки
  // (src/components/contacts/PaymentMethods.astro)
  paymentMethods: [
    { id: 'cash',    label: 'Наличные' },
    { id: 'card',    label: 'Банковская карта' },
    { id: 'invoice', label: 'Безналичный расчёт' },
    { id: 'sbp',     label: 'QR-код СБП' },
  ] as const,

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
