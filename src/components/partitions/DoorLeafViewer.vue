<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface DoorModel {
  id:       string
  schemaId: string
  photo:    string
  svg:      string
}

interface DecorType {
  image:       string
  title:       string
  description: string
}

const props = defineProps<{
  models: DoorModel[]
  decor:  DecorType
}>()

const active = ref(0)

const prev = () => { active.value = (active.value - 1 + props.models.length) % props.models.length }
const next = () => { active.value = (active.value + 1) % props.models.length }

// Лента миниатюр прокручивается горизонтально — центрируем активную при смене
const thumbsEl = ref<HTMLElement | null>(null)
watch(active, async (i) => {
  await nextTick()
  const container = thumbsEl.value
  const btn = container?.children[i] as HTMLElement | undefined
  if (!container || !btn) return
  container.scrollTo({
    left: btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2,
    behavior: 'smooth',
  })
})

// Touch swipe
const touchStartX = ref(0)
function onTouchStart(e: TouchEvent) { touchStartX.value = e.touches[0]!.clientX }
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchStartX.value
  if (Math.abs(dx) > 40) { dx < 0 ? next() : prev() }
}

function openLightbox(images: { src: string; alt: string }[], index: number) {
  window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { images, index } }))
}

const photoImages = computed(() =>
  props.models.map(m => ({ src: m.photo, alt: `Алюминиевая перегородка ${m.id}` }))
)

function openPhotoLightbox() {
  openLightbox(photoImages.value, active.value)
}

function openDecorLightbox() {
  openLightbox([{ src: props.decor.image, alt: props.decor.title }], 0)
}
</script>

<template>
  <!--
    Компьютер:  [фото] [декор ]     Телефон:  [фото  ]
                [фото] [модели]               [модели]  ← выбор сразу под фото
                                              [декор ]
    Стили — токены дизайн-системы страницы (.home, src/styles/home.css).
  -->
  <div class="dlv">

    <!-- ── LEFT: photo viewer — spans rows 1+2 ── -->
    <div class="dlv__viewer">
      <div class="dlv__stage" @click="openPhotoLightbox" role="button" tabindex="0"
           :aria-label="`Открыть фото ${models[active]?.id} в полном размере`"
           @keydown.enter="openPhotoLightbox" @keydown.space.prevent="openPhotoLightbox"
           @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <img
          v-for="(m, i) in models"
          :key="m.id"
          :src="m.photo"
          :alt="`Алюминиевая перегородка ${m.id}`"
          class="dlv__photo"
          :class="{ 'dlv__photo--active': i === active }"
          width="480"
          height="640"
          loading="lazy"
          decoding="async"
        />
        <!-- model id badge — озвучивается при смене модели -->
        <div class="dlv__badge" aria-live="polite">{{ models[active]?.id }}</div>
        <div class="dlv__zoom-hint" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <button class="dlv__arrow dlv__arrow--prev" type="button" aria-label="Предыдущая модель" @click.stop="prev">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="dlv__arrow dlv__arrow--next" type="button" aria-label="Следующая модель" @click.stop="next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── RIGHT row 1: decor card ── -->
    <div class="dlv__decor">
      <div class="dlv__decor-media" @click="openDecorLightbox"
           role="button" tabindex="0" :aria-label="`Открыть фото «${decor.title}»`"
           @keydown.enter="openDecorLightbox">
        <img
          :src="decor.image"
          :alt="decor.title"
          class="dlv__decor-img"
          width="600"
          height="400"
          loading="lazy"
          decoding="async"
        />
        <div class="dlv__zoom-hint" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <div class="dlv__decor-body">
        <p class="dlv__decor-eyebrow">Тип декора</p>
        <h3 class="dlv__decor-title">{{ decor.title }}</h3>
        <p class="dlv__decor-desc">{{ decor.description }}</p>
      </div>
    </div>

    <!-- ── RIGHT row 2: SVG thumbnails ── -->
    <div class="dlv__thumbs" ref="thumbsEl" role="group" aria-label="Выбор модели">
      <button
        v-for="(m, i) in models"
        :key="m.id"
        class="dlv__thumb"
        :class="{ 'dlv__thumb--active': i === active }"
        type="button"
        :aria-label="`Выбрать модель ${m.id}`"
        :aria-pressed="i === active"
        @click="active = i"
      >
        <img
          :src="m.svg"
          :alt="`Схема ${m.schemaId}`"
          class="dlv__thumb-svg"
          width="80"
          height="104"
        />
        <span class="dlv__thumb-label">{{ m.schemaId }}</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
.dlv {
  display: grid;
  grid-template-areas: 'stage' 'thumbs' 'decor';
  gap: 1rem;
}
@media (min-width: 48rem) {
  .dlv {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    grid-template-rows: 1fr auto;
    grid-template-areas: 'stage decor' 'stage thumbs';
    gap: 1.25rem var(--h-gutter);
  }
}

/* ── Фото модели ── */
.dlv__viewer { grid-area: stage; }
.dlv__stage {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--h-radius);
  background: var(--color-white);
  cursor: zoom-in;
}
.dlv__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 320ms var(--ease-out);
  pointer-events: none;
}
.dlv__photo--active { opacity: 1; }

.dlv__badge {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999rem;
  background: var(--h-ink);
  color: var(--color-white);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
.dlv__zoom-hint {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--h-wall);
  color: var(--h-ink);
  opacity: 0;
  transition: opacity 180ms var(--ease-out);
  pointer-events: none;
}
.dlv__stage:hover .dlv__zoom-hint,
.dlv__decor-media:hover .dlv__zoom-hint { opacity: 1; }

.dlv__arrow {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  translate: 0 -50%;
  border: 0;
  border-radius: 50%;
  background: var(--h-wall);
  color: var(--h-ink);
  cursor: pointer;
  transition: background-color 150ms var(--ease-out), color 150ms var(--ease-out);
}
.dlv__arrow:hover { background: var(--h-ink); color: var(--color-white); }
.dlv__arrow--prev { left: 0.75rem; }
.dlv__arrow--next { right: 0.75rem; }

/* ── Тип декора ── */
.dlv__decor {
  grid-area: decor;
  display: grid;
  gap: 1.25rem;
  align-content: start;
}
@media (min-width: 64rem) {
  .dlv__decor { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; }
}
.dlv__decor-media {
  position: relative;
  overflow: hidden;
  border-radius: var(--h-radius);
  background: var(--color-white);
  cursor: zoom-in;
}
.dlv__decor-img {
  display: block;
  width: 100%;
  max-height: 15rem;
  object-fit: contain;
  transition: transform 500ms var(--ease-out);
}
.dlv__decor-media:hover .dlv__decor-img { transform: scale(1.03); }

.dlv__decor-eyebrow {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--h-muted);
}
.dlv__decor-title {
  margin: 0.375rem 0 0;
  font-family: var(--h-font);
  font-size: 1.3125rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--h-ink);
}
.dlv__decor-desc {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--h-soft);
}

/* ── Схемы моделей — лента вбок ── */
.dlv__thumbs {
  grid-area: thumbs;
  display: flex;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.25rem 0.125rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.dlv__thumbs::-webkit-scrollbar { display: none; }
.dlv__thumb {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  width: 4.75rem;
  padding: 0.625rem 0.375rem 0.5rem;
  border: 0;
  border-radius: 0.75rem;
  background: var(--color-white);
  cursor: pointer;
  scroll-snap-align: center;
  box-shadow: inset 0 0 0 0.0625rem transparent;
  transition: box-shadow 150ms var(--ease-out);
}
.dlv__thumb:hover { box-shadow: inset 0 0 0 0.0625rem var(--h-signal); }
.dlv__thumb--active { box-shadow: inset 0 0 0 0.125rem var(--h-ink); }
.dlv__thumb-svg { display: block; width: 2.75rem; height: auto; }
.dlv__thumb-label {
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--h-muted);
}
.dlv__thumb--active .dlv__thumb-label { color: var(--h-ink); }

.dlv :is(button, [role='button']):focus-visible {
  outline: 0.125rem solid var(--color-secondary-500);
  outline-offset: 0.125rem;
}

@media (prefers-reduced-motion: reduce) {
  .dlv__photo, .dlv__decor-img { transition: none; }
}
</style>
