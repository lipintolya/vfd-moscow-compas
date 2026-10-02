// src/components/about/about-data.ts
//
// Содержимое /about/ (галерея, руководитель, тексты) убрано до появления
// материалов московского салона. Здесь остались способы оплаты — их
// выводит страница контактов (ContactsSection.vue).

export const paymentMethods = [
  {
    id: 1,
    title: 'Наличные',
    description: 'Оплата наличными в салоне для оформления заказа',
    iconPath: '/icons/w_cash_icon.webp',
  },
  {
    id: 2,
    title: 'Банковская карта',
    description: 'Оплата картами Visa, Mastercard, МИР через терминал в салоне',
    iconPath: '/icons/w_bank_card.webp',
  },
  {
    id: 3,
    title: 'Безналичный расчёт',
    description: 'Оплата по счёту для юридических лиц и ИП без НДС',
    iconPath: '/icons/w_transaction_icon.webp',
  },
  {
    id: 4,
    title: 'QR-код СБП',
    description: 'Быстрая оплата через Систему быстрых платежей по QR-коду',
    iconPath: '/icons/w_sbp.webp',
  },
]