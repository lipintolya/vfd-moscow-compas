import { SITE } from '../config/site'
import type { Step } from './partitions'
import { SERVICES, rub, MEASURE_REFUND } from './services'

/* «Как мы работаем» на главной — общий процесс покупки (двери, скрытые
   двери, перегородки), в отличие от steps в partitions.ts (тот описывает
   только производственный цикл алюминиевых перегородок: 45 дней, RAL и т.д.) */
export type HowStep = Step & {
  /** Цена услуги под текстом шага; сноска о дате цен — в StepsRow */
  price?: { value: string; note: string }
}

export const howItWorksSteps: HowStep[] = [
  {
    num:   '01',
    title: 'Выбор модели',
    text:  `Приходите к нам в ${SITE.address.mall} или звоните — подберём модель, цвет и комплектацию под ваш интерьер и бюджет.`,
  },
  {
    num:   '02',
    title: 'Замер',
    text:  'Специалист выезжает на объект по Москве и области, снимает точные размеры проёма и учитывает особенности стен: от этого зависят смета и точность монтажа.',
    price: { value: rub(SERVICES.measure.price), note: MEASURE_REFUND },
  },
  {
    num:   '03',
    title: 'Монтаж под ключ',
    text:  'Двери устанавливает собственная бригада. Соблюдаем согласованные сроки и убираем за собой строительный мусор.',
    price: { value: `от\u00A0${rub(SERVICES.install.priceFrom)}`, note: 'За установку одной двери' },
  },
  {
    num:   '04',
    title: 'Гарантия и поддержка',
    text:  'На монтажные работы даём гарантию 12 месяцев, на сами двери и перегородки — по условиям производителя. Если возникнут вопросы, обращайтесь напрямую в салон.',
  },
]

/** HowTo-разметка для rich-результатов Google/Яндекс — шаги совпадают
    с howItWorksSteps 1:1 (name/text), чтобы разметка не расходилась с
    видимым контентом страницы. */
export const howToSchema = {
  '@context': 'https://schema.org',
  '@type':    'HowTo',
  name:       `Как купить и установить двери или перегородки в ${SITE.name}`,
  description: `Процесс покупки и монтажа дверей и алюминиевых перегородок в салоне ${SITE.name} в ${SITE.address.mall}, ${SITE.city.name} — от выбора модели до гарантии.`,
  step: howItWorksSteps.map((s) => ({
    '@type': 'HowToStep',
    position: Number(s.num),
    name:     s.title,
    text:     s.text,
  })),
}
