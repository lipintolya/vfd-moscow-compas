import { defineMarkdocConfig, component } from '@astrojs/markdoc/config'
import { SITE, PHONE } from './src/config/site'
import { companyLegalInfo } from './src/lib/contacts-data'

export default defineMarkdocConfig({
  /* Данные салона в тексте статьи — из конфига, а не вписанные руками:
     {% $salon.address %}, {% $salon.hours %}, {% $salon.phone %} … */
  variables: {
    salon: {
      name:    SITE.studioName,
      brand:   SITE.name,
      city:    SITE.city.in,
      mall:    SITE.address.mall,
      address: SITE.address.full,
      hours:   companyLegalInfo.workingHours.shortDisplay,
      phone:   PHONE.label,
    },
  },
  tags: {
    // Фото с подписью
    // Использование: {% figure src="https://..." alt="..." caption="Подпись" /%}
    // Широкий вариант: {% figure src="..." wide=true /%}
    figure: {
      render: component('./src/components/articles/Figure.astro'),
      selfClosing: true,
      attributes: {
        // Не required: без src рендерится плейсхолдер «Фото скоро» — см.
        // комментарий в Figure.astro.
        src:     { type: String },
        alt:     { type: String },
        caption: { type: String },
        wide:    { type: Boolean, default: false },
        // Схемы/чертежи: без кропа 21:9, компактно по центру колонки
        narrow:  { type: Boolean, default: false },
        // Без кропа 21:9 во всю ширину колонки — палитры, таблицы-картинки
        natural: { type: Boolean, default: false },
      },
    },

    // Выделенный блок — совет, важно, предупреждение
    // Использование: {% callout type="tip" title="Совет" %}Текст{% /callout %}
    callout: {
      render: component('./src/components/articles/Callout.astro'),
      attributes: {
        type:  { type: String, default: 'tip', matches: ['tip', 'info', 'warning'] },
        title: { type: String },
      },
    },

    // Сетка карточек (покрытия, конструкции и т.п.) во всю ширину
    // {% cards %}{% card title="Эмаль" image="url" tags="практично, любой цвет" %}текст{% /card %}{% /cards %}
    cards: {
      render: component('./src/components/articles/Cards.astro'),
      attributes: {
        min: { type: Number },
      },
    },
    card: {
      render: component('./src/components/articles/Card.astro'),
      attributes: {
        title:    { type: String, required: true },
        image:    { type: String },
        imageAlt: { type: String },
        tags:     { type: String },
        // Предметные фото на белом фоне: 4:3 + contain вместо кропа 3:4
        contain:  { type: Boolean, default: false },
      },
    },

    // Сетка равных фото-плиток (2-3 в ряд, квадрат + cover — разные по
    // пропорциям фото всегда одинаковой ширины/высоты, без искажений)
    // {% photogrid cols=3 %}{% photo src="..." alt="..." href="/models/..." /%}{% /photogrid %}
    photogrid: {
      render: component('./src/components/articles/PhotoGrid.astro'),
      attributes: {
        cols: { type: Number, default: 3 },
      },
    },
    photo: {
      render: component('./src/components/articles/Photo.astro'),
      selfClosing: true,
      attributes: {
        src:     { type: String, required: true },
        alt:     { type: String },
        caption: { type: String },
        href:    { type: String },
      },
    },

    // Слайдер реализованных проектов перегородок (кураторская подборка
    // фото из cases в src/data/partitions.ts) — {% projectsSlider /%}
    projectsSlider: {
      render: component('./src/components/articles/ProjectsSlider.astro'),
      selfClosing: true,
    },

    // Цены «от» и серии по покрытиям прямо из каталога (не устаревают
    // при изменении цен) — {% coatingPrices /%}
    coatingPrices: {
      render: component('./src/components/articles/CoatingPrices.astro'),
      selfClosing: true,
    },
  },
})
