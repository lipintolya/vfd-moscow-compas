<script setup lang="ts">
import { computed, ref } from 'vue'
import { calcKitPrice, BASE_KIT_DESCRIPTION } from '../../data/accessories'
import { isMadeToOrder, isInStock } from '../../lib/made-to-order'
import type { CatalogCardItem } from './types'

const props = withDefaults(defineProps<{
  card: CatalogCardItem
  isKitOpen: boolean
  isDimmed: boolean
  /** Первый экран сетки — грузим фото сразу, не lazy, иначе тормозим LCP
      (браузер лишний раз решает, "не пора ли ещё" грузить видимую с
      первого кадра картинку). */
  priority?: boolean
}>(), {
  priority: false,
})

const emit = defineEmits<{
  'kit-toggle': []
}>()

const formatPrice = (price: number | null) =>
  price ? `${Number(price).toLocaleString('ru-RU')} ₽` : 'По запросу'

/* Свотчи доступных цветов на карточке — кликабельные: переключают обложку,
   цену и подпись цвета прямо в каталоге (раньше был виден только один цвет,
   и понять цену в другом варианте можно было только зайдя в товар).
   Показываем до 5 кружков + "+N", остальное — в самом товаре. */
const MAX_VISIBLE_SWATCHES = 5
const visibleSwatches = computed(() => props.card.colorSwatches.slice(0, MAX_VISIBLE_SWATCHES))
const extraSwatchCount = computed(() => Math.max(0, props.card.colorSwatches.length - MAX_VISIBLE_SWATCHES))

const activeSwatchIdx = ref(0)
const activeSwatch = computed(() => props.card.colorSwatches[activeSwatchIdx.value] ?? props.card.colorSwatches[0])
/* Фото не переключаем на пустое — у цвета без фото под эту модель остаётся
   текущее/дефолтное фото, а не пустой плейсхолдер (цвет выглядел бы "сломанным"). */
const activePhoto = computed(() => activeSwatch.value?.photo || props.card.photo)
/* Цену не наследуем от базовой при отсутствии фото — цена под конкретный
   цвет не подтверждена, честнее показать «По запросу», чем чужую цифру. */
const activePrice = computed(() => activeSwatch.value?.available === false ? null : (activeSwatch.value?.price ?? props.card.price))
const activeColorName = computed(() => activeSwatch.value?.name ?? props.card.colorName)
const activeColorHex = computed(() => activeSwatch.value?.hex ?? props.card.colorHex)
const activeSwatchUnavailable = computed(() => activeSwatch.value?.available === false)

const selectSwatch = (idx: number) => { activeSwatchIdx.value = idx }

/* Свайп по фото листает цвета — тот же паттерн свайпа по фото, что и в других галереях сайта.
   Порог 40px: реальный свайп (>40px) браузер сам не превращает в click по
   растянутой ссылке карточки (стандартная эвристика тач-жестов), поэтому
   тап по фото по-прежнему открывает товар, а свайп — просто меняет цвет.

   Слушатели висят на <article>, а не на самом блоке с фото: у карточки
   растянутая ссылка "Подробнее" (::after inset-0 от края до края article),
   она перекрывает фото по paint-order, так что touch-события физически
   долетают до article/<a>, а не до div с картинкой — проверяем координаты
   старта вручную через photoBoxRef, чтобы свайп ловился только над фото. */
const SWIPE_THRESHOLD = 40
const photoBoxRef = ref<HTMLElement | null>(null)
let touchStartX = 0
let touchStartY = 0
let touchActive = false

const onPhotoTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  const box = photoBoxRef.value
  touchActive = false
  if (!touch || !box) return
  const rect = box.getBoundingClientRect()
  if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  touchActive = true
}
const onPhotoTouchEnd = (e: TouchEvent) => {
  if (!touchActive || !e.changedTouches[0] || props.card.colorSwatches.length < 2) return
  touchActive = false
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) <= SWIPE_THRESHOLD) return
  const total = props.card.colorSwatches.length
  const nextIdx = dx > 0
    ? (activeSwatchIdx.value + 1) % total
    : (activeSwatchIdx.value - 1 + total) % total
  selectSwatch(nextIdx)
}

/* Цена за комплект (полотно + короб + наличники) — тот же расчёт, что и на странице
   товара, но от АКТИВНОГО (выбранного свотчем) цвета и его цены за полотно */
const kitPrice = computed(() =>
  activePrice.value ? activePrice.value + calcKitPrice(props.card.coatingSlug, activeColorName.value) : null
)

/* Бейдж серии — цвет группы вместо одного teal на всё:
   ПЭТ (Иннова, Урбан ПЭТ) — мягкий красный
   Эмалекс/Эмалекс Модерн + Урбан/Элегант/Бэйсик — мягкий синий
   остальные эмалевые коллекции — графит */
const RED_SERIES  = new Set(['innova', 'urban-pet'])
const BLUE_SERIES = new Set(['emalex', 'emalex-modern', 'urban', 'elegant', 'basic'])

const seriesBadgeClass = computed(() => {
  const slug = props.card.seriesSlug
  if (props.card.coatingSlug === 'protach') return 'bg-violet-500 text-white'
  if (RED_SERIES.has(slug))  return 'bg-rose-500 text-white'
  if (BLUE_SERIES.has(slug)) return 'bg-secondary-600 text-white'
  return 'bg-slate-700 text-white'
})

const madeToOrder = computed(() => isMadeToOrder(props.card.seriesSlug, props.card.id, activeColorName.value))
const inStock     = computed(() => isInStock(props.card.id, activeColorName.value))
</script>

<template>
  <article
    class="group @container relative flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white transition hover:border-accent-200 hover:shadow-lg hover:-translate-y-0.5"
    :class="isKitOpen ? 'z-30' : isDimmed ? 'pointer-events-none opacity-40 blur-[1px]' : ''"
    :data-kit-card="card.id"
    @touchstart.passive="onPhotoTouchStart"
    @touchend="onPhotoTouchEnd"
  >
    <div
      ref="photoBoxRef"
      class="relative m-3.5 mb-0 flex aspect-2/3 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:m-5 sm:mb-0"
    >
      <img
        v-if="activePhoto"
        :key="activePhoto"
        :src="activePhoto"
        :alt="`${card.name} — ${activeColorName}`"
        class="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        decoding="async"
        width="320"
        height="420"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-slate-300" aria-hidden="true">
        <svg class="h-13 w-13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M15 12h.01" stroke-linecap="round" />
        </svg>
      </div>

      <!-- Бейдж серии и «Новинка» — раньше стояли рядом (серия слева, «Новинка»
           справа) и на узких мобильных карточках (grid-cols-2, ~135px под
           фото) «Новинка» одна съедала половину ширины — серии почти не
           оставалось места, имя обрезалось до одной буквы. Теперь оба
           флагом друг под другом у левого края — конкурируют за высоту,
           не за ширину, и каждый читается полностью в любую сторону. -->
      <div class="absolute left-0 top-3 flex max-w-[88%] flex-col items-start gap-1">
        <span class="max-w-full truncate rounded-r-full px-2.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide" :class="seriesBadgeClass">{{ card.series }}</span>
        <span
          v-if="card.isNew"
          class="max-w-full truncate rounded-r-full bg-accent-500 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          Новинка
        </span>
        <span
          v-else-if="card.isPopular"
          class="max-w-full truncate rounded-r-full bg-slate-900 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          Выбор клиентов
        </span>
      </div>

      <span
        v-if="inStock"
        class="absolute right-0 bottom-3 max-w-[85%] truncate rounded-l-full bg-secondary-600 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white shadow-sm"
      >
        В наличии
      </span>
      <span
        v-else-if="madeToOrder"
        class="absolute right-0 bottom-3 max-w-[85%] truncate rounded-l-full bg-fg px-3 py-1 text-xs font-medium uppercase tracking-wide text-white shadow-sm"
      >
        Под заказ
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-5">
      <div>
        <h2 class="m-0 min-h-12 text-step-2 font-medium leading-snug text-ink line-clamp-2">{{ card.name }}</h2>
        <p class="m-0 mt-1 text-sm font-semibold text-slate-500">
          {{ card.coating }}<span v-if="card.trim"> · {{ card.trim }}</span>
        </p>
      </div>

      <div v-if="card.colorSwatches.length > 1" class="relative z-10 flex min-w-0 flex-wrap items-center gap-1.5">
        <button
          v-for="(swatch, idx) in visibleSwatches"
          :key="swatch.name"
          type="button"
          class="h-6 w-6 shrink-0 rounded-full transition-transform active:scale-90 lg:h-5.5 lg:w-5.5"
          :class="[
            idx === activeSwatchIdx ? 'ring-2 ring-offset-1 ring-secondary-600' : '',
            swatch.available === false
              ? 'border-2 border-dashed border-black/30'
              : 'border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]',
          ]"
          :style="{ backgroundColor: swatch.hex }"
          :title="swatch.available === false ? `${swatch.name} — фото уточняется` : swatch.name"
          :aria-label="`Цвет: ${swatch.name}${swatch.available === false ? ', фото уточняется' : ''}`"
          :aria-pressed="idx === activeSwatchIdx"
          @click="selectSwatch(idx)"
        />
        <span v-if="extraSwatchCount > 0" class="shrink-0 text-xs font-semibold text-slate-400">+{{ extraSwatchCount }}</span>
        <span class="ml-0.5 w-full truncate text-sm text-slate-500 @[13rem]:w-auto">
          {{ activeColorName }}<span v-if="activeSwatchUnavailable" class="text-slate-400"> · фото уточняется</span>
        </span>
      </div>
      <div v-else class="flex min-w-0 items-center gap-2">
        <span
          class="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
          :style="{ backgroundColor: activeColorHex }"
          :title="`Цвет: ${activeColorName}`"
        />
        <span class="truncate text-sm text-slate-500">{{ activeColorName }}</span>
      </div>

      <div class="mt-auto flex flex-col gap-2 pt-1">
        <div class="flex flex-col items-stretch gap-2.5 @[17rem]:flex-row @[17rem]:items-end @[17rem]:justify-between @[17rem]:gap-3">
          <p class="m-0 flex flex-col leading-none">
            <span class="whitespace-nowrap text-xl font-medium text-ink">{{ formatPrice(activePrice) }}</span>
            <span class="mt-1 text-xs font-semibold text-slate-500">за полотно</span>
            <span v-if="kitPrice" class="mt-1.5 whitespace-nowrap text-xs font-semibold text-slate-500">
              {{ Number(kitPrice).toLocaleString('ru-RU') }} ₽ за комплект
            </span>
          </p>
          <a
            :href="`/models/${card.slug}/`"
            class="btn btn-outline shrink-0 justify-center px-4 py-2 text-sm after:absolute after:inset-0 after:content-['']"
            :aria-label="`${card.name} — подробнее`"
          >
            Подробнее
          </a>
        </div>

        <div v-if="kitPrice" class="relative z-10">
          <button
            type="button"
            class="flex w-fit cursor-pointer items-start gap-1 text-left text-[0.6875rem] font-semibold text-accent-700 transition hover:text-accent-800"
            :aria-expanded="isKitOpen"
            @click="emit('kit-toggle')"
          >
            <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 9.25v4.25" stroke-linecap="round" />
              <circle cx="10" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
            </svg>
            Что входит в комплект?
          </button>
          <p
            v-if="isKitOpen"
            class="absolute inset-x-0 top-full z-20 m-0 mt-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[0.6875rem] leading-snug text-slate-600 shadow-xl"
          >
            Полотно, {{ BASE_KIT_DESCRIPTION }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
