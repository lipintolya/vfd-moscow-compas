<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScrollLock } from '../../lib/scroll-lock'

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
import { TELEGRAM_CHAT, telegramWithText, MAX_CHAT, maxChatUrl, maxWithText } from '../../lib/messengers'
import TelegramIcon from '../ui/TelegramIcon.vue'
import MaxIcon from '../ui/MaxIcon.vue'
import PriceCalculatorModal from './PriceCalculatorModal.vue'

/* Страница модели целиком: фото слева, справа — заголовок (слот head,
   статичный H1 из .astro), цена, выбор цвета, панель покупки и короткие
   характеристики (слот facts). Цвет меняет фото, цену, сумму комплекта и
   текст сообщения менеджеру, поэтому всё это — в одном острове. На телефоне
   панель раскладывается вокруг фото: заголовок и цена над ним, остальное ниже. */
const props = defineProps<{
  colors:      ColorVariant[]
  /** Остальные цвета покрытия, для которых у ЭТОЙ модели пока нет фото —
      справочный список, не свотч (см. блок под свотчами). */
  extraColors?: { name: string; hex: string }[]
  modelName:   string
  modelId:     string
  seriesSlug:  string
  isNew?:      boolean
}>()

const phone = companyLegalInfo.contacts.phone[0]!

const selectedIdx = ref(0)

const selected = computed(() => props.colors[selectedIdx.value] ?? props.colors[0])

/* Реактивно на выбранный цвет — точечное исключение "в наличии" (см.
   IN_STOCK_OVERRIDE) относится к конкретной модели+цвету, не ко всей серии. */
const madeToOrder = computed(() => isMadeToOrder(props.seriesSlug, props.modelId, selected.value.name))
const inStock     = computed(() => isInStock(props.modelId, selected.value.name))

/* Статус словом у цены — те же роли, что на карточке каталога (.h-status) */
const status = computed(() => {
  if (inStock.value) return { key: 'stock', label: 'В наличии' }
  if (props.isNew) return { key: 'new', label: 'Новинка' }
  if (madeToOrder.value) return { key: 'order', label: 'Под заказ' }
  return null
})

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

/* Сообщение менеджеру — с моделью и выбранным цветом, как у входных дверей */
const askText = computed(() =>
  `Интересует межкомнатная дверь «${props.modelName}», цвет: ${selected.value.name}. Подскажите, пожалуйста, сроки и наличие.`)
const telegramHref = computed(() => telegramWithText(askText.value))
const maxCopy      = computed(() => maxWithText(askText.value))

/* ── mounted-гейт для обоих Teleport ниже (зум-фото и калькулятор). Раньше
   считали, что проблема Teleport+SSR-хайдрейшн бьёт только при нескольких
   экземплярах одного Teleport-таргета (так было у галереи работ) — но баг был
   и здесь при единственном экземпляре: на client:load Teleport попадает в
   SSR-разметку как placeholder, конфликтует с местом, куда Astro вставляет
   свой служебный <style> для astro-island, и Vue при гидратации ловит
   hydration node mismatch — первый клик после этого либо не открывает
   модалку, либо открывает с потерянными обработчиками, помогает только
   полная перезагрузка. Тот же гейт, что у других островов с Teleport:
   рендерим Teleport только после реального маунта на
   клиенте, SSR отдаёт вообще без него. ── */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const zoomOpen = ref(false)
/* Прокрутка страницы под открытым окном — src/lib/scroll-lock.ts */
const pageLock = useScrollLock()

const openZoom = () => {
  if (!displayPhoto.value) return
  zoomOpen.value = true
  pageLock.lock()
}
const closeZoom = () => {
  zoomOpen.value = false
  pageLock.unlock()
}
const onZoomKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeZoom() }

onMounted(() => window.addEventListener('keydown', onZoomKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onZoomKeydown)
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
  <div class="pp">
    <!-- Фото -->
    <div class="pp__media">
      <div class="pp__frame">
        <button
          v-if="displayPhoto"
          type="button"
          class="pp__photo-btn"
          :aria-label="`Увеличить фото: ${modelName} — ${selected.name}`"
          @click="openZoom"
        >
          <img
            :key="displayPhoto"
            :src="displayPhoto"
            :alt="`Межкомнатная дверь ${modelName}, ${selected.name}`"
            class="pp__photo"
            width="508"
            height="1115"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <span class="pp__zoom" aria-hidden="true">Увеличить</span>
        </button>
        <div v-else class="pp__placeholder" aria-hidden="true">
          <svg fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24" width="48" height="48">
            <rect x="5" y="3" width="14" height="18" rx="1.5" />
            <path d="M15 12h.01" stroke-linecap="round" />
          </svg>
        </div>

        <button
          type="button"
          class="pp__share"
          :aria-label="shareCopied ? 'Ссылка скопирована' : 'Поделиться ссылкой на модель'"
          @click="shareModel"
        >
          <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path stroke-linecap="round" d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
          </svg>
          <span class="pp__share-tip" :class="{ 'is-visible': shareCopied }">Ссылка скопирована</span>
        </button>
      </div>
    </div>

    <div class="pp__panel">
      <!-- Заголовок и цена: на телефоне — над фото -->
      <div class="pp__head">
        <slot name="head" />
        <p class="pp__price-row">
          <span class="pp__price h-price">{{ selected.available === false ? 'По запросу' : formatPrice(selected.price) }}</span>
          <span class="pp__price-note">за полотно</span>
          <span v-if="status" class="h-status pp__status" :data-status="status.key">{{ status.label }}</span>
        </p>
      </div>

      <!-- Цвет -->
      <div class="pp__colors">
        <p class="pp__color-name">
          Цвет: <b>{{ selected.name }}</b>
          <span v-if="selected.available === false" class="pp__color-note">, фото уточняется</span>
        </p>
        <div
          v-if="colors.length > 1"
          class="pp__swatches"
          role="group"
          :aria-label="`Цвет: ${modelName}`"
        >
          <button
            v-for="(color, i) in colors"
            :key="color.id"
            type="button"
            class="pp__swatch"
            :class="{ 'is-unavailable': color.available === false }"
            :style="{ backgroundColor: normalizeHex(color.hex) }"
            :title="color.available === false ? `${color.name}, фото уточняется` : color.name"
            :aria-label="color.available === false ? `${color.name}, фото уточняется` : color.name"
            :aria-pressed="String(i === selectedIdx)"
            @click="selectedIdx = i"
          />
        </div>

        <!-- Цвета покрытия без фото этой модели — справка, не выбор -->
        <div v-if="extraColors && extraColors.length > 0" class="pp__extra">
          <p class="pp__extra-label">Под заказ есть и другие цвета покрытия, фото пришлёт менеджер:</p>
          <ul class="pp__extra-list" role="list">
            <li v-for="color in extraColors" :key="color.name" class="pp__extra-color">
              <span class="pp__extra-dot" :style="{ backgroundColor: normalizeHex(color.hex) }" aria-hidden="true" />{{ color.name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Покупка: комплект, калькулятор, связь -->
      <div class="pp__buy">
        <div v-if="kitTotal" class="pp__kit">
          <p class="pp__kit-row"><span>Комплект</span><span class="h-price pp__kit-price">{{ kitTotal.toLocaleString('ru-RU') }} ₽</span></p>
          <p class="pp__kit-note">Полотно, {{ BASE_KIT_DESCRIPTION }}. Петли, замок и добор добавите в расчёте.</p>
        </div>

        <button type="button" class="h-btn h-btn--signal pp__calc" @click="calcOpen = true">
          <svg class="pp__btn-ico" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="4" y="2.75" width="12" height="14.5" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M7 6.25h6M7 10h.01M10 10h.01M13 10h.01M7 13.25h.01M10 13.25h.01M13 13.25h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Рассчитать стоимость
        </button>

        <div v-if="TELEGRAM_CHAT || MAX_CHAT" class="pp__ask">
          <a
            v-if="TELEGRAM_CHAT"
            class="h-btn h-btn--ink pp__ask-btn"
            :href="telegramHref"
            target="_blank"
            rel="noopener"
            :aria-label="`Написать в Telegram: @${TELEGRAM_CHAT}`"
          >
            <TelegramIcon class="pp__btn-ico" tone="dark" />Telegram
          </a>
          <a
            v-if="MAX_CHAT"
            class="h-btn h-btn--ink pp__ask-btn"
            :href="maxChatUrl()"
            target="_blank"
            rel="noopener"
            :data-copy-text="maxCopy"
            aria-label="Написать в MAX (текст скопируется)"
          >
            <MaxIcon class="pp__btn-ico" tone="dark" />MAX
          </a>
        </div>

        <p class="pp__call">Позвонить в салон: <a :href="`tel:${phone.raw}`">{{ phone.label }}</a></p>
      </div>

      <div class="pp__facts">
        <slot name="facts" />
      </div>
    </div>

    <!-- Зум-модалка -->
    <Teleport v-if="mounted" to="body">
      <Transition name="zoom-fade">
        <div
          v-if="zoomOpen"
          class="pp-zoom"
          role="dialog"
          aria-modal="true"
          :aria-label="`${modelName} — ${selected.name}`"
          @click.self="closeZoom"
        >
          <button class="pp-zoom__close" type="button" aria-label="Закрыть" @click="closeZoom">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <figure class="pp-zoom__figure" @click.self="closeZoom">
            <img :src="displayPhoto" :alt="`Межкомнатная дверь ${modelName}, ${selected.name}`" class="pp-zoom__img" decoding="async" />
            <figcaption class="pp-zoom__caption">{{ modelName }}, {{ selected.name }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>

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
/* Раскладка в языке страницы входной двери (catalog/vhodnye-dveri/[id]):
   фото — 6 колонок из 12, панель — 5, между ними колонка воздуха. Стили
   кнопок, цены и статуса — общие из styles/home.css (.h-btn, .h-price,
   .h-status), страница оборачивает остров в .home. */
.pp {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}

/* Телефон и планшет: заголовок с ценой — над фото, остальное — под ним */
.pp__panel { display: contents; }
.pp__head   { order: 1; }
.pp__media  { order: 2; }
.pp__colors { order: 3; }
.pp__buy    { order: 4; }
.pp__facts  { order: 5; }

@media (min-width: 62.5rem) {
  .pp { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 0 var(--h-gutter); }
  .pp__media { grid-column: 1 / span 6; }
  .pp__panel { grid-column: 8 / span 5; display: grid; gap: 1.75rem; }
  .pp__head, .pp__media, .pp__colors, .pp__buy, .pp__facts { order: 0; }
}
/* Фото не уезжает, пока листается панель, — если целиком помещается в экран */
@media (min-width: 62.5rem) and (min-height: 50rem) {
  .pp__media { position: sticky; top: calc(var(--header-height) + 1rem); }
}

/* ── Фото ── */
.pp__frame {
  position: relative;
  aspect-ratio: 5 / 6;
  overflow: hidden;
  border-radius: var(--h-tile-radius);
  background: var(--h-wall);
}
@media (min-width: 62.5rem) {
  .pp__frame { aspect-ratio: 4 / 5; }
}
.pp__photo-btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}
/* Дверь — примерно на 20 % меньше прежнего: высота 73 % кадра, по центру
   (раньше дверь занимала почти весь кадр, около 92 % высоты) */
.pp__photo {
  position: absolute;
  top: 13.5%;
  left: 0;
  display: block;
  width: 100%;
  height: 73%;
  object-fit: contain;
  transition: transform 400ms var(--ease-out);
}
.pp__photo-btn:hover .pp__photo { transform: scale(1.02); }
.pp__photo-btn:focus-visible { outline: 0.1875rem solid var(--color-secondary-700); outline-offset: -0.1875rem; border-radius: inherit; }
.pp__zoom {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999rem;
  background: color-mix(in srgb, var(--color-white) 92%, transparent);
  color: var(--h-ink);
  font-size: 0.8125rem;
  font-weight: 600;
}
.pp__placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-slate-300);
}

.pp__share {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-white) 92%, transparent);
  color: var(--h-ink);
  cursor: pointer;
  transition: color 180ms var(--ease-out);
}
.pp__share:hover { color: var(--h-signal); }
.pp__share:focus-visible { outline: 0.1875rem solid var(--color-secondary-700); outline-offset: 0.125rem; }
.pp__share svg { width: 1.125rem; height: 1.125rem; }
.pp__share-tip {
  position: absolute;
  top: 50%;
  right: calc(100% + 0.5rem);
  transform: translate(4px, -50%);
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--h-ink);
  color: var(--color-white);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease, transform 150ms ease;
}
.pp__share-tip.is-visible { opacity: 1; transform: translate(0, -50%); }

/* ── Заголовок и цена ── */
.pp__price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.625rem;
  margin: 1rem 0 0;
}
.pp__price {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.1;
}
.pp__price-note { color: var(--h-soft); }
.pp__status { align-self: center; font-size: 0.8125rem; }

/* ── Цвет ── */
.pp__color-name { margin: 0; color: var(--h-soft); }
.pp__color-name b { color: var(--h-ink); font-weight: 600; }
.pp__color-note { color: var(--h-muted); }
.pp__swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.875rem;
}
/* Тот же свотч, что на карточке каталога (.pc__swatch): выбранный — графитовое кольцо */
.pp__swatch {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: inset 0 0 0 0.0625rem color-mix(in srgb, var(--color-slate-900) 12%, transparent);
  transition: box-shadow 150ms var(--ease-out);
}
.pp__swatch:hover { box-shadow: inset 0 0 0 0.0625rem color-mix(in srgb, var(--color-slate-900) 12%, transparent), 0 0 0 0.1875rem var(--h-paper), 0 0 0 0.25rem var(--color-slate-300); }
.pp__swatch[aria-pressed='true'] { box-shadow: inset 0 0 0 0.0625rem color-mix(in srgb, var(--color-slate-900) 12%, transparent), 0 0 0 0.1875rem var(--h-paper), 0 0 0 0.3125rem var(--h-ink); }
/* Телефон: восемь цветов — один ряд на 358 px, без «сироты» во втором */
@media (max-width: 30rem) {
  .pp__swatches { gap: 0.5rem; }
  .pp__swatch { width: 2.25rem; height: 2.25rem; }
}
.pp__swatch.is-unavailable { outline: 0.125rem dashed color-mix(in srgb, var(--color-slate-900) 32%, transparent); outline-offset: -0.125rem; }
.pp__swatch:focus-visible { outline: 0.1875rem solid var(--color-secondary-700); outline-offset: 0.375rem; }

.pp__extra { margin-top: 1.25rem; }
.pp__extra-label { margin: 0 0 0.625rem; font-size: 0.875rem; line-height: 1.45; color: var(--h-muted); }
.pp__extra-list { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin: 0; padding: 0; list-style: none; }
.pp__extra-color { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; color: var(--h-soft); }
.pp__extra-dot {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 0 0.0625rem color-mix(in srgb, var(--color-slate-900) 12%, transparent);
}

/* ── Покупка ── */
.pp__buy {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: var(--h-radius);
  background: var(--h-wall);
}
.pp__kit { margin-bottom: 0.5rem; }
.pp__kit-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin: 0;
  font-weight: 600;
  color: var(--h-ink);
}
.pp__kit-price { font-size: 1.3125rem; }
.pp__kit-note { margin: 0.25rem 0 0; font-size: 0.875rem; line-height: 1.45; color: var(--h-soft); }
.pp__calc, .pp__ask-btn { gap: 0.5rem; width: 100%; }
.pp__btn-ico { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
.pp__ask { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; }
.pp__ask-btn { padding-inline: 1rem; }
.pp__call { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--h-soft); text-align: center; }
.pp__call a { color: var(--h-ink); font-weight: 600; text-decoration: none; white-space: nowrap; font-variant-numeric: tabular-nums; }
.pp__call a:hover { color: var(--h-signal); }

/* ── Зум-модалка ── */
.pp-zoom {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.9);
}
.pp-zoom__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease;
}
.pp-zoom__close:hover { background: rgba(255, 255, 255, 0.22); }
.pp-zoom__close svg { width: 1.375rem; height: 1.375rem; }
.pp-zoom__figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  margin: 0;
}
.pp-zoom__img {
  max-width: min(95vw, 1100px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.pp-zoom__caption { font-size: 0.875rem; font-weight: 500; color: rgba(255, 255, 255, 0.72); }

.zoom-fade-enter-active,
.zoom-fade-leave-active { transition: opacity 180ms ease; }
.zoom-fade-enter-from,
.zoom-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .pp__photo, .pp__swatch, .pp__share-tip,
  .zoom-fade-enter-active,
  .zoom-fade-leave-active { transition: none; }
  .pp__photo-btn:hover .pp__photo { transform: none; }
}
</style>
