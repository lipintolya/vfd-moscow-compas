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
    Сетка: 2 колонки × 2 строки
    [viewer  ] [decor  ]   ← строка 1 (1fr — тянется)
    [viewer  ] [thumbs ]   ← строка 2 (auto — по контенту)
    Viewer растянут через grid-row: 1 / 3
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
/* ── Layout: 2-col × 2-row grid ── */
.dlv {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  grid-template-rows: 1fr auto;
  gap: clamp(0.875rem, 2vw, 1.25rem);
}

/* ── LEFT: photo viewer — spans both rows ── */
.dlv__viewer {
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dlv__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: zoom-in;
  transition: border-color 200ms ease;
}
.dlv__stage:hover {
  border-color: #94a3b8;
}

.dlv__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 320ms ease;
  will-change: opacity;
  pointer-events: none;
}
.dlv__photo--active { opacity: 1; }

/* Zoom hint badge */
.dlv__zoom-hint {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 180ms ease, transform 180ms ease;
  pointer-events: none;
  z-index: 2;
}
.dlv__stage:hover .dlv__zoom-hint,
.dlv__decor-media:hover .dlv__zoom-hint {
  opacity: 1;
  transform: scale(1);
}

/* Arrows */
.dlv__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1;
}
.dlv__arrow:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-50%) scale(1.06);
}
.dlv__arrow--prev { left:  0.75rem; }
.dlv__arrow--next { right: 0.75rem; }

/* Model ID badge — overlaid bottom-left inside the stage */
.dlv__badge {
  position: absolute;
  bottom: 0.625rem;
  left: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #e2e8f0;
  pointer-events: none;
  z-index: 2;
}

/* ── RIGHT row 1: decor card ── */
.dlv__decor {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.dlv__decor-media {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  cursor: zoom-in;
  overflow: hidden;
}

.dlv__decor-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 240px;
  transition: transform 400ms ease;
}
.dlv__decor-media:hover .dlv__decor-img {
  transform: scale(1.03);
}

.dlv__decor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: clamp(1rem, 2vw, 1.375rem);
}

.dlv__decor-eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0d9488;
}
.dlv__decor-title {
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.1875rem);
  font-weight: 500;
  color: #0f172a;
  line-height: 1.22;
}
.dlv__decor-desc {
  margin: 0;
  font-size: clamp(0.875rem, 1.2vw, 0.9375rem);
  color: #475569;
  line-height: 1.65;
}

/* ── RIGHT row 2: SVG thumbnails — horizontal scroll strip ── */
.dlv__thumbs {
  grid-column: 2;
  grid-row: 2;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  min-width: 0;            /* не разносить грид-колонку при большом числе миниатюр */
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
  padding-bottom: 0.25rem; /* место под тонкий скроллбар */
}
.dlv__thumbs::-webkit-scrollbar { height: 5px; }
.dlv__thumbs::-webkit-scrollbar-track { background: transparent; }
.dlv__thumbs::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
.dlv__thumbs::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

.dlv__thumb {
  width: 96px;
  flex-shrink: 0;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.375rem 0.4rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
}
.dlv__thumb:hover {
  border-color: #2dd4bf;
  background: #f0fdfa;
}
.dlv__thumb--active {
  border-color: #14b8a6;
  background: #f0fdfa;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
}

.dlv__thumb-svg {
  width: 44px;
  height: auto;
  object-fit: contain;
  display: block;
}

.dlv__thumb-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}
.dlv__thumb--active .dlv__thumb-label { color: #0d9488; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .dlv {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  /* Portrait stage: fills full width, 3:4 aspect — photos display without side bars */
  .dlv__viewer {
    grid-column: 1;
    grid-row: 1;
    height: auto;
    aspect-ratio: 3 / 4;
  }
  .dlv__decor  { grid-column: 1; grid-row: 2; }
  .dlv__thumbs { grid-column: 1; grid-row: 3; }
  /* 44px minimum touch target (iOS HIG) */
  .dlv__arrow  { width: 2.75rem; height: 2.75rem; }
}
</style>
