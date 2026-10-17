<script setup lang="ts">
/**
 * Карточка модели в каталоге — язык дизайн-системы сайта (styles/home.css,
 * нужен предок .home): дверь на серой подложке, как образец в зале; подпись
 * под фото, а не поверх; статус одним словом; цена табличными цифрами.
 * Вся карточка — ссылка на модель (растянутая ссылка у названия); свотчи и
 * «что в комплекте» лежат выше неё и работают сами по себе.
 */
import { computed, ref } from 'vue'
import { calcKitPrice, BASE_KIT_DESCRIPTION } from '../../data/accessories'
import { modelStatus, MODEL_STATUS_LABEL } from '../../lib/made-to-order'
import type { CatalogCardItem } from './types'

const props = withDefaults(defineProps<{
  card: CatalogCardItem
  isKitOpen: boolean
  /** Первый ряд сетки — фото сразу, не lazy: иначе тормозим LCP */
  priority?: boolean
}>(), {
  priority: false,
})

const emit = defineEmits<{
  'kit-toggle': []
}>()

const rub = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

/* Свотчи переключают фото, цену и подпись цвета прямо в каталоге.
   До 5 кружков и «+N» — остальные цвета на странице модели. */
const MAX_VISIBLE_SWATCHES = 5
const visibleSwatches = computed(() => props.card.colorSwatches.slice(0, MAX_VISIBLE_SWATCHES))
const extraSwatchCount = computed(() => Math.max(0, props.card.colorSwatches.length - MAX_VISIBLE_SWATCHES))

const activeSwatchIdx = ref(0)
const activeSwatch = computed(() => props.card.colorSwatches[activeSwatchIdx.value] ?? props.card.colorSwatches[0])
/* У цвета без фото под эту модель остаётся прежнее фото, а не пустая подложка */
const activePhoto = computed(() => activeSwatch.value?.photo || props.card.photo)
/* Цена цвета без фото не подтверждена — «по запросу», а не чужая цифра */
const activePrice = computed(() => activeSwatch.value?.available === false ? null : (activeSwatch.value?.price ?? props.card.price))
const activeColorName = computed(() => activeSwatch.value?.name ?? props.card.colorName)
const activeColorHex = computed(() => activeSwatch.value?.hex ?? props.card.colorHex)
const activeSwatchUnavailable = computed(() => activeSwatch.value?.available === false)

const selectSwatch = (idx: number) => { activeSwatchIdx.value = idx }

/* Свайп по фото листает цвета. Слушатели — на <article>: растянутая ссылка
   перекрывает фото, касание долетает до неё; свайп ловим только над фото
   (координаты старта сверяем с photoBoxRef). Реальный свайп (> 40px)
   браузер не превращает в клик — тап по фото по-прежнему открывает модель. */
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

/* Комплект (полотно + короб + наличники) — тот же расчёт, что на странице
   модели, от выбранного цвета */
const kitPrice = computed(() =>
  activePrice.value ? activePrice.value + calcKitPrice(props.card.coatingSlug, activeColorName.value) : null
)

/* Покрытие и кромка/стекло — одной строкой: «Экошпон, кромка серебро» */
const meta = computed(() => [props.card.coating, props.card.trim && props.card.trim.charAt(0).toLowerCase() + props.card.trim.slice(1)].filter(Boolean).join(', '))

const status = computed(() => modelStatus(props.card, activeColorName.value))
const kitId = computed(() => `kit-${props.card.id}`)
</script>

<template>
  <article
    class="pc"
    :class="{ 'is-kit-open': isKitOpen }"
    :data-kit-card="card.id"
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
        height="480"
      />
      <svg v-else class="pc__placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M15 12h.01" stroke-linecap="round" />
      </svg>
      <span v-if="status" class="h-status h-meta h-status--photo pc__status" :data-status="status">{{ MODEL_STATUS_LABEL[status] }}</span>
    </div>

    <div class="pc__body">
      <p class="h-meta pc__meta">{{ meta }}</p>
      <h3 class="pc__name">
        <a :href="`/models/${card.slug}/`" class="pc__link">{{ card.name }}</a>
      </h3>

      <div class="pc__colors">
        <template v-if="card.colorSwatches.length > 1">
          <button
            v-for="(swatch, idx) in visibleSwatches"
            :key="swatch.name"
            type="button"
            class="pc__swatch"
            :class="{ 'is-empty': swatch.available === false }"
            :style="{ backgroundColor: swatch.hex }"
            :title="swatch.available === false ? `${swatch.name} — фото уточняется` : swatch.name"
            :aria-label="`Цвет: ${swatch.name}${swatch.available === false ? ', фото уточняется' : ''}`"
            :aria-pressed="idx === activeSwatchIdx"
            @click="selectSwatch(idx)"
          />
          <span v-if="extraSwatchCount > 0" class="h-meta pc__more">+{{ extraSwatchCount }}</span>
        </template>
        <span v-else class="pc__swatch pc__swatch--static" :style="{ backgroundColor: activeColorHex }" aria-hidden="true" />
        <span class="h-meta pc__color">{{ activeColorName }}<template v-if="activeSwatchUnavailable">, фото уточняется</template></span>
      </div>

      <div class="pc__price">
        <p class="pc__blade">
          <span class="pc__value">{{ activePrice ? rub(activePrice) : 'Цена по запросу' }}</span>
          <span v-if="activePrice" class="h-meta">за полотно</span>
        </p>
        <p v-if="kitPrice" class="h-meta pc__kit">
          Комплект {{ rub(kitPrice) }}
          <button
            type="button"
            class="pc__kit-btn"
            :aria-expanded="isKitOpen"
            :aria-controls="kitId"
            aria-label="Что входит в комплект"
            @click="emit('kit-toggle')"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <circle cx="10" cy="10" r="7.5" />
              <path d="M10 9.25v4.25" stroke-linecap="round" />
              <circle cx="10" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </p>
        <p v-if="kitPrice && isKitOpen" :id="kitId" class="pc__kit-pop">
          Полотно, {{ BASE_KIT_DESCRIPTION }}
        </p>
      </div>
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
.pc.is-kit-open { z-index: 2; }

/* Дверь целиком, с полями — как образец на стене зала */
.pc__media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: var(--h-radius);
  background: var(--h-media-bg);
}
.pc__media img {
  width: 100%;
  height: 100%;
  padding: 9% 14%;
  object-fit: contain;
  transition: transform 500ms var(--ease-out);
}
.pc:hover .pc__media img { transform: scale(1.03); }
.pc__placeholder { width: 3rem; height: 3rem; color: var(--color-slate-300); }
.pc__status { position: absolute; top: 0.625rem; left: 0.625rem; }

.pc__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: 0.875rem;
}
/* Кромка с молдингом — длинная подпись: две строки, дальше многоточие */
.pc__meta {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.pc__name {
  margin: 0.25rem 0 0;
  font-family: var(--h-font);
  font-size: clamp(1rem, 1.3vw, 1.125rem);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--h-ink);
  text-wrap: balance;
}
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
.pc__link:focus-visible::after {
  border-radius: var(--h-radius);
  outline: 0.125rem solid var(--color-secondary-500);
  outline-offset: 0.25rem;
}

/* Свотчи — над растянутой ссылкой */
.pc__colors {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
}
.pc__swatch {
  position: relative;
  flex: none;
  width: 1.375rem;
  height: 1.375rem;
  padding: 0;
  border: 0.0625rem solid color-mix(in srgb, var(--color-slate-950) 14%, transparent);
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 150ms var(--ease-out);
}
/* Палец попадает в 2.25rem, кружок остаётся маленьким */
.pc__swatch::before { content: ''; position: absolute; inset: -0.4375rem; }
.pc__swatch[aria-pressed='true'] { box-shadow: 0 0 0 0.125rem var(--h-paper), 0 0 0 0.25rem var(--h-ink); }
.pc__swatch.is-empty { border: 0.125rem dashed color-mix(in srgb, var(--color-slate-950) 30%, transparent); }
.pc__swatch--static { cursor: default; }
.pc__swatch--static::before { content: none; }
.pc__swatch:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.25rem; }
.pc__more { color: var(--h-muted); }
.pc__color {
  flex-basis: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Цена прижата к низу: у соседних карточек — на одной линии */
.pc__price { position: relative; margin-top: auto; padding-top: 0.875rem; }
.pc__blade { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.125rem 0.375rem; margin: 0; }
.pc__value {
  font-size: clamp(1.125rem, 1.5vw, 1.3125rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--h-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pc__kit {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
  margin: 0.25rem 0 0;
}
.pc__kit-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--h-muted);
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}
.pc__kit-btn::before { content: ''; position: absolute; inset: -0.75rem; }
.pc__kit-btn:hover, .pc__kit-btn[aria-expanded='true'] { color: var(--h-ink); }
.pc__kit-btn svg { width: 1rem; height: 1rem; }
.pc__kit-btn:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }
.pc__kit-pop {
  position: absolute;
  z-index: 2;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0.375rem 0 0;
  padding: 0.625rem 0.75rem;
  border: 0.0625rem solid var(--h-rule);
  border-radius: 0.75rem;
  background: var(--h-paper);
  box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--color-slate-900) 12%, transparent);
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--h-soft);
}

@media (prefers-reduced-motion: reduce) {
  .pc__media img, .pc__link, .pc__swatch { transition: none; }
  .pc:hover .pc__media img { transform: none; }
}
</style>
