<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface ColorVariant {
  id:          string
  name:        string
  hex:         string
  photo:       string
  price:       number | null
  coatingSlug: string
  /** Зарезервировано под будущий сценарий частично доступных цветов —
      сейчас .astro отдаёт только сфотканные (available всегда true/undefined).
      Цвета без фото показаны отдельным справочным блоком (extraColors), не
      свотчем — см. ниже. */
  available?:  boolean
}

import { calcKitPrice, BASE_KIT_DESCRIPTION } from '../../data/accessories'
import { companyLegalInfo } from '../../lib/contacts-data'
import { isMadeToOrder, isInStock } from '../../lib/made-to-order'
import PriceCalculatorModal from './PriceCalculatorModal.vue'
import { SITE } from '../../config/site'

const props = defineProps<{
  colors:      ColorVariant[]
  /** Остальные цвета покрытия, для которых у ЭТОЙ модели пока нет фото —
      справочный список, не свотч (см. блок ниже под color-picker__swatches). */
  extraColors?: { name: string; hex: string }[]
  modelName:   string
  modelId:     string
  seriesSlug:  string
}>()

const phone = companyLegalInfo.contacts.phone[0]!

const selectedIdx = ref(0)

const selected = computed(() => props.colors[selectedIdx.value] ?? props.colors[0])

/* Реактивно на выбранный цвет — точечное исключение "в наличии" (см.
   IN_STOCK_OVERRIDE) относится к конкретной модели+цвету, не ко всей серии. */
const madeToOrder = computed(() => isMadeToOrder(props.seriesSlug, props.modelId, selected.value.name))
const inStock     = computed(() => isInStock(props.modelId, selected.value.name))

/* Фото не пропадает при выборе цвета без снимка — остаётся фото первого
   сфотканного цвета вместо пустого плейсхолдера. */
const displayPhoto = computed(() =>
  selected.value.photo || props.colors.find(c => c.photo)?.photo || ''
)

const kitTotal = computed(() => {
  if (selected.value.available === false || !selected.value.price) return null
  return selected.value.price + calcKitPrice(selected.value.coatingSlug, selected.value.name)
})

const formatPrice = (price: number | null) =>
  price ? `${price.toLocaleString('ru-RU')} ₽` : 'По запросу'

const normalizeHex = (hex: string) => {
  const v = (hex ?? '').trim().replaceAll('С', 'C').replaceAll('с', 'c')
  return /^#[0-9a-fA-F]{3,6}$/.test(v) ? v : 'var(--color-slate-300)'
}

/* ── mounted-гейт для обоих Teleport ниже (зум-фото и калькулятор). Раньше
   считали, что проблема Teleport+SSR-хайдрейшн бьёт только при нескольких
   экземплярах одного Teleport-таргета (см. фикс WorksGallery) — но баг был
   и здесь при единственном экземпляре: на client:load Teleport попадает в
   SSR-разметку как placeholder, конфликтует с местом, куда Astro вставляет
   свой служебный <style> для astro-island, и Vue при гидратации ловит
   hydration node mismatch — первый клик после этого либо не открывает
   модалку, либо открывает с потерянными обработчиками, помогает только
   полная перезагрузка. Тот же гейт, что уже применён в Reviews.vue и
   FigureLightbox.vue: рендерим Teleport только после реального маунта на
   клиенте, SSR отдаёт вообще без него. ── */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const zoomOpen = ref(false)
const openZoom = () => {
  if (!displayPhoto.value) return
  zoomOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closeZoom = () => {
  zoomOpen.value = false
  document.body.style.overflow = ''
}
const onZoomKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeZoom() }

onMounted(() => window.addEventListener('keydown', onZoomKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onZoomKeydown)
  document.body.style.overflow = ''
  if (shareCopiedTimer) clearTimeout(shareCopiedTimer)
})

/* ── Калькулятор стоимости — свой единственный Teleport-модал, тот же
   mounted-гейт передаётся ему пропом ниже. ── */
const calcOpen = ref(false)

/* ── Поделиться ссылкой на модель — Web Share API на устройствах, где он
   есть (в основном мобильные), иначе копируем ссылку в буфер. ── */
const shareCopied = ref(false)
let shareCopiedTimer: ReturnType<typeof setTimeout> | null = null
const shareModel = async () => {
  const url = window.location.href
  const title = `${props.modelName}${selected.value.name ? ` — ${selected.value.name}` : ''}`
  if (navigator.share) {
    try { await navigator.share({ title, url }) } catch { /* пользователь отменил — не ошибка */ }
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    shareCopied.value = true
    if (shareCopiedTimer) clearTimeout(shareCopiedTimer)
    shareCopiedTimer = setTimeout(() => { shareCopied.value = false }, 2500)
  } catch { /* буфер недоступен — молча игнорируем, как и в калькуляторе */ }
}
</script>

<template>
  <div class="color-picker">
    <!-- Фото -->
    <div class="color-picker__photo-wrap">
      <button
        v-if="displayPhoto"
        type="button"
        class="color-picker__photo-btn"
        :aria-label="`Увеличить фото: ${modelName} — ${selected.name}`"
        @click="openZoom"
      >
        <img
          :key="displayPhoto"
          :src="displayPhoto"
          :alt="`${modelName} — ${selected.name}`"
          class="color-picker__photo"
          width="600"
          height="780"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <span class="color-picker__zoom-hint" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75"/>
            <path d="M13.5 13.5l3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            <path d="M9 6.5v5M6.5 9h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
          </svg>
          Увеличить
        </span>
      </button>
      <div v-else class="color-picker__placeholder" aria-hidden="true">
        <svg fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24" width="48" height="48">
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M15 12h.01" stroke-linecap="round" />
        </svg>
      </div>

      <span v-if="inStock" class="color-picker__order-badge bg-accent-600 text-white">В наличии</span>
      <span v-else-if="madeToOrder" class="color-picker__order-badge bg-fg text-white">Под заказ</span>
    </div>

    <!-- Зум-модалка -->
    <Teleport v-if="mounted" to="body">
      <Transition name="zoom-fade">
        <div
          v-if="zoomOpen"
          class="color-picker__zoom-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="`${modelName} — ${selected.name}`"
          @click.self="closeZoom"
        >
          <button class="color-picker__zoom-close" type="button" aria-label="Закрыть" @click="closeZoom">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <figure class="color-picker__zoom-figure" @click.self="closeZoom">
            <img :src="displayPhoto" :alt="`${modelName} — ${selected.name}`" class="color-picker__zoom-img" decoding="async" />
            <figcaption class="color-picker__zoom-caption">{{ modelName }} — {{ selected.name }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>

    <!-- Цена -->
    <div class="color-picker__price-row">
      <span class="color-picker__price">{{ selected.available === false ? 'По запросу' : formatPrice(selected.price) }}</span>
      <span class="color-picker__price-note">за полотно</span>
    </div>
    <div v-if="kitTotal" class="color-picker__kit-row">
      <span class="color-picker__kit-price">{{ kitTotal.toLocaleString('ru-RU') }} ₽</span>
      <p class="color-picker__kit-note">за комплект — полотно, {{ BASE_KIT_DESCRIPTION }}</p>
    </div>

    <!-- Выбранный цвет -->
    <p class="color-picker__color-name">
      Цвет:&nbsp;<strong>{{ selected.name }}</strong>
      <span v-if="selected.available === false" class="color-picker__color-note"> — фото уточняется</span>
    </p>

    <!-- Свотчи -->
    <div
      v-if="colors.length > 1"
      class="color-picker__swatches"
      role="radiogroup"
      :aria-label="`Цвет: ${modelName}`"
    >
      <button
        v-for="(color, i) in colors"
        :key="color.id"
        type="button"
        class="color-picker__swatch"
        :class="{ 'is-active': i === selectedIdx, 'is-unavailable': color.available === false }"
        :style="{ backgroundColor: normalizeHex(color.hex) }"
        :title="color.available === false ? `${color.name} — фото уточняется` : color.name"
        :aria-label="color.available === false ? `${color.name}, фото уточняется` : color.name"
        :aria-pressed="String(i === selectedIdx)"
        @click="selectedIdx = i"
      />
    </div>

    <!-- Также доступные цвета покрытия — тот же паттерн, что у свотчей выше
         (кружок + подпись, обёрнутым рядом), но справочный текст, не свотч:
         фото под эту модель ещё не прислали, кликать/выбирать здесь нечего. -->
    <div v-if="extraColors && extraColors.length > 0" class="color-picker__extra-colors">
      <p class="color-picker__extra-colors-label">Также доступны цвета покрытия (под заказ, фото уточняйте у консультанта):</p>
      <div class="color-picker__extra-colors-list">
        <span
          v-for="color in extraColors"
          :key="color.name"
          class="color-picker__extra-color"
        >
          <span class="color-picker__extra-dot" :style="{ backgroundColor: normalizeHex(color.hex) }" aria-hidden="true" />{{ color.name }}
        </span>
      </div>
    </div>

    <!-- Калькулятор — отдельным приглашением, не наравне с контактными кнопками:
         это другое по смыслу действие (инструмент, а не связь с салоном), поэтому
         не btn-outline в общем ряду, а свой акцентный блок. -->
    <button type="button" class="color-picker__calc-promo" @click="calcOpen = true">
      <span class="color-picker__calc-promo-icon" aria-hidden="true">
        <svg fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h8M8 11h2m3 0h3M8 14.5h2m3 0h3M8 18h2m3 0h3" stroke-linecap="round" />
        </svg>
      </span>
      <span class="color-picker__calc-promo-text">
        <span class="color-picker__calc-promo-title">Рассчитать стоимость</span>
        <span class="color-picker__calc-promo-subtitle">Короб, наличники, петли, замок — соберите комплект</span>
      </span>
      <svg class="color-picker__calc-promo-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- CTA -->
    <div class="color-picker__cta">
      <a :href="SITE.social.telegram" target="_blank" rel="noopener" class="btn btn-primary">Написать в Telegram</a>
      <a :href="SITE.social.vk" target="_blank" rel="noopener" class="btn btn-outline color-picker__social-btn" aria-label="Написать в VK">
        <img src="/icons/b_vk_logo.webp" alt="" width="18" height="18" />
      </a>
      <a :href="SITE.social.max" target="_blank" rel="noopener" class="btn btn-outline color-picker__social-btn" aria-label="Написать в MAX">
        <img src="/icons/b_max_logo.webp" alt="" width="18" height="18" />
      </a>
      <a :href="`tel:${phone.raw}`" class="btn btn-outline">
        <svg class="color-picker__phone-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .95.68l1.1 3.3a1 1 0 0 1-.44 1.18l-1.7 1a11.05 11.05 0 0 0 5.6 5.6l1-1.7a1 1 0 0 1 1.18-.44l3.3 1.1a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.72 21 3 14.28 3 6V5Z" />
        </svg>
        {{ phone.label }}
      </a>
      <button
        type="button"
        class="btn btn-outline color-picker__share-btn"
        :aria-label="shareCopied ? 'Ссылка скопирована' : 'Поделиться ссылкой на модель'"
        @click="shareModel"
      >
        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path stroke-linecap="round" d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
        </svg>
        <span class="color-picker__share-tip" :class="{ 'is-visible': shareCopied }">Ссылка скопирована</span>
      </button>
    </div>

    <PriceCalculatorModal
      :open="calcOpen"
      :mounted="mounted"
      :model-name="modelName"
      :photo="displayPhoto"
      :coating-slug="selected.coatingSlug"
      :color-name="selected.name"
      :blade-price="selected.available === false ? 0 : (selected.price ?? 0)"
      @close="calcOpen = false"
    />
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-picker__photo-wrap {
  border-radius: 1.5rem;
  overflow: hidden;
  background: var(--color-slate-50);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Фолбэк для браузеров без aspect-ratio (Safari < 15, старые iOS) — без
     него блок без явной высоты схлопывается, а фото внутри (width/height:
     100%) растягивается/сжимается непропорционально. padding-bottom:100%
     держит квадрат через классический приём, а не через aspect-ratio. */
  position: relative;
  height: 0;
  padding-bottom: 100%;
}
@supports (aspect-ratio: 1 / 1) {
  .color-picker__photo-wrap {
    height: auto;
    padding-bottom: 0;
    aspect-ratio: 1 / 1;
  }
}

.color-picker__photo-btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
}

.color-picker__photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1.5rem;
  display: block;
  transition: transform 300ms ease;
}
.color-picker__photo-btn:hover .color-picker__photo {
  transform: scale(1.02);
}

.color-picker__zoom-hint {
  position: absolute;
  left: 0.875rem;
  bottom: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-slate-200);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-slate-600);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 150ms ease, transform 150ms ease;
}
.color-picker__zoom-hint svg { width: 0.875rem; height: 0.875rem; flex-shrink: 0; }
.color-picker__photo-btn:hover .color-picker__zoom-hint,
.color-picker__photo-btn:focus-visible .color-picker__zoom-hint {
  opacity: 1;
  transform: translateY(0);
}
@media (hover: none) {
  /* На тач-устройствах ховера нет — подсказка видна всегда, иначе о зуме
     нечем догадаться. */
  .color-picker__zoom-hint { opacity: 1; transform: none; }
}

.color-picker__placeholder {
  color: var(--color-slate-300);
}

/* Цвет — utility-классы Tailwind (bg-fg) в шаблоне, тут только форма/
   позиция: справа снизу от фото, симметрично зум-подсказке слева. */
.color-picker__order-badge {
  position: absolute;
  right: 0;
  bottom: 0.875rem;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px 0 0 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.color-picker__price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.color-picker__price {
  font-size: 1.875rem;
  font-weight: 500;
  color: var(--color-slate-900);
  line-height: 1;
}

.color-picker__price-note {
  font-size: 0.875rem;
  color: var(--color-slate-500);
}

.color-picker__kit-row {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.color-picker__kit-price {
  font-size: 1.875rem;
  font-weight: 500;
  color: var(--color-slate-900);
  line-height: 1;
  white-space: nowrap;
}

.color-picker__kit-note {
  font-size: 0.875rem;
  color: var(--color-slate-500);
  margin: 0;
}

.color-picker__color-name {
  font-size: 0.875rem;
  color: var(--color-slate-600);
  margin: 0;
}
.color-picker__color-note {
  color: var(--color-slate-400);
  font-weight: 400;
}

.color-picker__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-picker__swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  outline: none;
  flex-shrink: 0;
}

.color-picker__swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.color-picker__swatch.is-active {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-accent-500);
}
.color-picker__swatch.is-unavailable {
  border: 2px dashed rgba(0, 0, 0, 0.32);
}

.color-picker__swatch:focus-visible {
  outline: 2px solid var(--color-accent-500);
  outline-offset: 3px;
}

.color-picker__extra-colors {
  margin: 0;
}
.color-picker__extra-colors-label {
  margin: 0 0 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-slate-500);
}
.color-picker__extra-colors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}
.color-picker__extra-color {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--color-slate-700);
}
.color-picker__extra-dot {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  /* Тот же приём глубины, что у крупных выкрасок на странице серии
     (.sr-colors__dot) — единый язык формы/тени по сайту. */
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--color-slate-900) 10%, transparent),
    0 2px 6px -2px color-mix(in srgb, var(--color-slate-900) 22%, transparent);
  flex-shrink: 0;
}

.color-picker__calc-promo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--color-accent-50);
  border: 1px solid var(--color-accent-200);
  border-radius: 1rem;
  cursor: pointer;
  text-align: left;
  transition: background 150ms ease, border-color 150ms ease;
}
.color-picker__calc-promo:hover {
  background: var(--color-accent-100);
  border-color: var(--color-accent-300);
}
.color-picker__calc-promo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  background: #fff;
  border-radius: 0.75rem;
  color: var(--color-accent-600);
}
.color-picker__calc-promo-icon svg { width: 1.375rem; height: 1.375rem; }
.color-picker__calc-promo-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}
.color-picker__calc-promo-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-slate-900);
}
.color-picker__calc-promo-subtitle {
  font-size: 0.8125rem;
  color: var(--color-accent-700);
  line-height: 1.4;
}
/* Чуть крупнее на десктопе (иконка/паддинги, шрифт не трогаем — крупный
   текст смотрелся вычурно) + отступ сверху от кружков цвета — вместе
   подтягивают низ левой колонки ближе к низу правой. Мобильный размер не
   трогаем. */
@media (min-width: 901px) {
  .color-picker__calc-promo {
    gap: 1.125rem;
    padding: 1.5rem 1.75rem;
    border-radius: 1.25rem;
    margin-top: 1.75rem;
  }
  .color-picker__calc-promo-icon {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 0.875rem;
  }
  .color-picker__calc-promo-icon svg { width: 1.625rem; height: 1.625rem; }
  .color-picker__calc-promo-arrow { width: 1.25rem; height: 1.25rem; }
}

.color-picker__calc-promo-arrow {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  color: var(--color-accent-600);
}

.color-picker__cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}

.color-picker__phone-icon {
  width: 1.1rem;
  height: 1.1rem;
  margin-right: 0.5rem;
}

/* ── Поделиться — иконка-кнопка, без текста в общем ряду ── */
.color-picker__share-btn {
  position: relative;
  flex: 0 0 auto;
  padding: 0.6rem;
}
.color-picker__social-btn {
  flex: 0 0 auto;
  padding: 0.6rem;
}
.color-picker__social-btn img { width: 1.1rem; height: 1.1rem; }
.color-picker__share-btn svg { width: 1.1rem; height: 1.1rem; }
.color-picker__share-tip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--color-slate-900);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease, transform 150ms ease;
}
.color-picker__share-tip.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── Зум-модалка ── */
.color-picker__zoom-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.90);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.color-picker__zoom-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease;
}
.color-picker__zoom-close:hover { background: rgba(255, 255, 255, 0.22); }
.color-picker__zoom-close svg { width: 1.375rem; height: 1.375rem; }

.color-picker__zoom-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
}
.color-picker__zoom-img {
  max-width: min(95vw, 1100px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.color-picker__zoom-caption {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.zoom-fade-enter-active,
.zoom-fade-leave-active { transition: opacity 180ms ease; }
.zoom-fade-enter-from,
.zoom-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .color-picker__photo,
  .color-picker__zoom-hint,
  .zoom-fade-enter-active,
  .zoom-fade-leave-active { transition: none; }
}
</style>
