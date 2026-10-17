<script setup lang="ts">
/**
 * Карточка модели в каталоге. Дверь целиком, на белом, без скруглений и
 * подложки — как фото образца; под ней цвета, название, характеристики
 * строками и цена. Вся карточка — ссылка на модель (растянутая ссылка у
 * названия); кружки цветов лежат выше неё и переключают фото и цену.
 * Токены — styles/home.css, нужен предок .home.
 */
import { computed, ref, watch } from 'vue'
import { calcKitPrice } from '../../data/accessories'
import { modelStatus, MODEL_STATUS_LABEL } from '../../lib/made-to-order'
import type { ColorFamilySlug } from '../../data/color-families'
import type { CatalogCardItem } from './types'

const props = withDefaults(defineProps<{
  card: CatalogCardItem
  /** Выбранные в фильтре группы цветов — карточка сразу показывает такой цвет */
  preferFamilies?: ColorFamilySlug[]
  /** Первый ряд сетки — фото сразу, не lazy: иначе тормозим LCP */
  priority?: boolean
}>(), {
  preferFamilies: () => [],
  priority: false,
})

const rub = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

/* До 5 кружков и «+N» — остальные цвета на странице модели */
const MAX_VISIBLE_SWATCHES = 5
const visibleSwatches = computed(() => props.card.colorSwatches.slice(0, MAX_VISIBLE_SWATCHES))
const extraSwatchCount = computed(() => Math.max(0, props.card.colorSwatches.length - MAX_VISIBLE_SWATCHES))

const activeSwatchIdx = ref(0)
/* Фильтр «белые» — у карточки сразу белый цвет, а не тот, что был первым */
watch(() => props.preferFamilies, (families) => {
  if (!families.length) return
  const current = props.card.colorSwatches[activeSwatchIdx.value]
  if (current && families.includes(current.family)) return
  const idx = props.card.colorSwatches.findIndex((s) => families.includes(s.family))
  if (idx !== -1) activeSwatchIdx.value = idx
}, { immediate: true })

const activeSwatch = computed(() => props.card.colorSwatches[activeSwatchIdx.value] ?? props.card.colorSwatches[0])
/* У цвета без фото под эту модель остаётся прежнее фото, а не пустое место */
const activePhoto = computed(() => activeSwatch.value?.photo || props.card.photo)
/* Цена цвета без фото не подтверждена — «по запросу», а не чужая цифра */
const activePrice = computed(() => activeSwatch.value?.available === false ? null : (activeSwatch.value?.price ?? props.card.price))
const activeColorName = computed(() => activeSwatch.value?.name ?? props.card.colorName)

const selectSwatch = (idx: number) => { activeSwatchIdx.value = idx }

/* Свайп по фото листает цвета. Слушатели — на <article>: растянутая ссылка
   перекрывает фото, касание долетает до неё; свайп ловим только над фото.
   Реальный свайп (> 40px) браузер не превращает в клик — тап открывает модель. */
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
  selectSwatch(dx > 0 ? (activeSwatchIdx.value + 1) % total : (activeSwatchIdx.value - 1 + total) % total)
}

/* Комплект (полотно, короб, наличники) — тот же расчёт, что на странице модели */
const kitPrice = computed(() =>
  activePrice.value ? activePrice.value + calcKitPrice(props.card.coatingSlug, activeColorName.value) : null
)

const specs = computed(() => [
  `Покрытие: ${props.card.coating}`,
  `Цвет: ${activeColorName.value}${activeSwatch.value?.available === false ? ' (фото уточняется)' : ''}`,
  props.card.trim,
].filter(Boolean))

const status = computed(() => modelStatus(props.card, activeColorName.value))
</script>

<template>
  <article
    class="pc"
    @touchstart.passive="onPhotoTouchStart"
    @touchend="onPhotoTouchEnd"
  >
    <div ref="photoBoxRef" class="pc__media">
      <img
        v-if="activePhoto"
        :key="activePhoto"
        :src="activePhoto"
        :alt="`${card.name}, ${activeColorName}`"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : undefined"
        decoding="async"
        width="320"
        height="512"
      />
      <svg v-else class="pc__placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M15 12h.01" stroke-linecap="round" />
      </svg>
      <span v-if="status" class="h-status h-meta h-status--photo pc__status" :data-status="status">{{ MODEL_STATUS_LABEL[status] }}</span>
    </div>

    <!-- Строка цветов есть всегда: у соседних карточек названия на одной линии -->
    <div class="pc__colors">
      <span
        v-if="card.colorSwatches.length < 2"
        class="pc__swatch pc__swatch--static"
        :style="{ backgroundColor: activeSwatch?.hex ?? card.colorHex }"
        :title="activeColorName"
        aria-hidden="true"
      />
      <button
        v-else
        v-for="(swatch, idx) in visibleSwatches"
        :key="swatch.name"
        type="button"
        class="pc__swatch"
        :class="{ 'is-empty': swatch.available === false }"
        :style="{ backgroundColor: swatch.hex }"
        :title="swatch.name"
        :aria-label="`Цвет: ${swatch.name}`"
        :aria-pressed="idx === activeSwatchIdx"
        @click="selectSwatch(idx)"
      />
      <span v-if="extraSwatchCount > 0" class="pc__more">+{{ extraSwatchCount }}</span>
    </div>

    <h3 class="pc__name">
      <a :href="`/models/${card.slug}/`" class="pc__link">{{ card.name }}</a>
    </h3>

    <ul class="pc__specs" role="list">
      <li v-for="line in specs" :key="line">{{ line }}</li>
    </ul>

    <div class="pc__price">
      <p class="pc__blade">
        <span class="pc__value">{{ activePrice ? rub(activePrice) : 'Цена по запросу' }}</span>
        <span v-if="activePrice" class="pc__unit">за полотно</span>
      </p>
      <p v-if="kitPrice" class="pc__kit">С коробом и наличниками {{ rub(kitPrice) }}</p>
    </div>
  </article>
</template>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Дверь целиком: пропорции фото фабрики ~ 1 : 2,2, рамка чуть шире —
   дверь не режется ни сверху, ни снизу. Сверху поле под статус: он не
   ложится на дверь */
.pc__media {
  position: relative;
  aspect-ratio: 3 / 5;
}
.pc__media img {
  position: absolute;
  inset: 2rem 0 0;
  width: 100%;
  height: calc(100% - 2rem);
  object-fit: contain;
  object-position: center bottom;
  transition: opacity 200ms var(--ease-out);
}
.pc:hover .pc__media img { opacity: 0.92; }
.pc__placeholder {
  position: absolute;
  inset: 0;
  width: 3rem;
  height: 3rem;
  margin: auto;
  color: var(--color-slate-300);
}
.pc__status { position: absolute; top: 0; left: 0; }

/* Кружки цветов — над растянутой ссылкой */
.pc__colors {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.pc__swatch {
  position: relative;
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 0.0625rem solid color-mix(in srgb, var(--color-slate-950) 16%, transparent);
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 150ms var(--ease-out);
}
/* Палец попадает в 2.25rem, кружок остаётся маленьким */
.pc__swatch::before { content: ''; position: absolute; inset: -0.5rem; }
.pc__swatch:hover { box-shadow: 0 0 0 0.125rem var(--h-paper), 0 0 0 0.1875rem var(--color-slate-300); }
.pc__swatch[aria-pressed='true'] { box-shadow: 0 0 0 0.125rem var(--h-paper), 0 0 0 0.1875rem var(--h-ink); }
.pc__swatch--static { cursor: default; }
.pc__swatch--static::before { content: none; }
.pc__swatch.is-empty { border: 0.125rem dashed color-mix(in srgb, var(--color-slate-950) 30%, transparent); }
.pc__swatch:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.25rem; }
.pc__more { font-size: 0.8125rem; font-weight: 500; color: var(--h-muted); }

.pc__name {
  margin: 0.75rem 0 0;
  font-family: var(--h-font);
  font-size: clamp(1.0625rem, 1.3vw, 1.1875rem);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--h-ink);
}
.pc__colors + .pc__name { margin-top: 0.625rem; }
.pc__link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 0.0625rem;
  text-underline-offset: 0.2em;
  transition: text-decoration-color 180ms var(--ease-out);
}
/* Растянутая ссылка: вся карточка открывает модель */
.pc__link::after { content: ''; position: absolute; inset: 0; }
.pc:hover .pc__link { text-decoration-color: var(--h-signal); }
.pc__link:focus-visible { outline: none; }
.pc__link:focus-visible::after { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.25rem; }

/* Характеристики — строками, как табличка у образца */
.pc__specs {
  display: grid;
  gap: 0.1875rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--h-muted);
}

/* Цена прижата к низу: у соседних карточек — на одной линии */
.pc__price { margin-top: auto; padding-top: 1rem; }
.pc__blade { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.125rem 0.375rem; margin: 0; }
.pc__value {
  font-size: clamp(1.1875rem, 1.6vw, 1.375rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--h-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pc__unit { font-size: 0.8125rem; color: var(--h-muted); }
.pc__kit { margin: 0.25rem 0 0; font-size: 0.8125rem; line-height: 1.4; color: var(--h-soft); font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  .pc__media img, .pc__link, .pc__swatch { transition: none; }
}
</style>
