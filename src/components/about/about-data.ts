// src/components/about/about-data.ts

import { companyLegalInfo } from '../../lib/contacts-data'

/* Контакты, адрес и реквизиты — только в src/lib/contacts-data.ts, здесь не дублируем. */
export const companyInfo = {
  /** Год открытия салона; 0 → плашка «год основания» не выводится */
  founded: companyLegalInfo.activity.founded,
}

export interface Director {
  name: string
  position: string
  experience: string
  quote: string
  photo: string
}

/** Руководитель салона — блок на /about/ скрыт, пока null.
    Пример заполнения: { name: 'Фамилия Имя Отчество', position: 'Руководитель салона',
    experience: 'Более N лет в дверной отрасли', quote: '«…»', photo: '/renders/about/director-500.webp' } */
export const director: Director | null = null

/* Каждая картинка рендерится в двух местах: маленькое превью (hero/
   feature-link/нижняя галерея — src, srcThumb) и полноразмерный лайтбокс
   по клику (srcFull, настоящий оригинал с Yandex Cloud). Оригиналы там
   лежат в 1920×2560 (300-750КБ) — для превью это в разы больше реального
   экранного размера, поэтому src/srcThumb — локальные sharp-ресайзы
   (см. scripts/gen-about-images.mjs).
   ⚠ PLACEHOLDER: сейчас это фото московского салона — временно, для
   вёрстки. Заменить на фото салона в ТЦ «Компас» и перегенерировать. */
export const galleryImages = [
  {
    id: 1,
    src: '/renders/about/vfd-out-900.webp',
    srcThumb: '/renders/about/vfd-out-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/vfd_out.webp',
    alt: 'Салон дверей ВФД',
  },
  // Для блока IMAGE LINKS GRID — разные ракурсы
  {
    id: 2,
    src: '/renders/about/g-1-700.webp',
    srcThumb: '/renders/about/g-1-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-1.webp',
    alt: 'Общий вид выставочного зала салона ВФД — широкий выбор дверей',
  },
  {
    id: 3,
    src: '/renders/about/g-5-700.webp',
    srcThumb: '/renders/about/g-5-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-5.webp',
    alt: 'Примеры межкомнатных дверей в экспозиции салона ВФД',
  },
  {
    id: 4,
    src: '/renders/about/g-3-700.webp',
    srcThumb: '/renders/about/g-3-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-3.webp',
    alt: 'Образцы фурнитуры и материалов для дверей в салоне ВФД',
  },
  // Для галереи ниже
  {
    id: 5,
    src: '/renders/about/g-2-480.webp',
    srcThumb: '/renders/about/g-2-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-2.webp',
    alt: 'Экспозиция межкомнатных дверей в салоне ВФД',
  },
  {
    id: 6,
    src: '/renders/about/g-6-480.webp',
    srcThumb: '/renders/about/g-6-480.webp',
    srcFull: 'https://storage.yandexcloud.net/catalog-vfd/about_page/g-6.webp',
    alt: 'Интерьер салона ВФД — зона консультаций',
  },
]

export const requisites = {
  legalName:    companyLegalInfo.fullName,
  inn:          companyLegalInfo.requisites.inn,
  ogrnip:       companyLegalInfo.requisites.ogrnip,
  legalAddress: companyLegalInfo.address.legal,
}

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