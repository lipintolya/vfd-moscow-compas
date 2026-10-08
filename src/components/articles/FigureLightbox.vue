<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScrollLock } from '../../lib/scroll-lock'

/* natural — без кропа 21:9: картинка в своих пропорциях (схемы, чертежи). */
const props = defineProps<{
  /** Оригинал — открывается в полноэкранном просмотре. */
  src: string
  /** Облегчённая версия для показа в тексте (см. lib/article-images.ts). */
  inlineSrc?: string
  inlineSrcset?: string
  sizes?: string
  alt?: string
  natural?: boolean
}>()

/* Teleport гейтится через mounted, чтобы SSR и первый клиентский рендер
   совпадали (иначе Vue ловит "Hydration node mismatch") — тот же паттерн,
   что в Reviews.vue и ProjectSlider.vue. */
const mounted = ref(false)
const open = ref(false)

const lightboxLock = useScrollLock()

const show = () => {
  open.value = true
  lightboxLock.lock()
}
const close = () => {
  open.value = false
  lightboxLock.unlock()
}
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open.value) close() }

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <button
    type="button"
    class="fig-zoom-btn"
    :aria-label="`Открыть фото на весь экран${alt ? ': ' + alt : ''}`"
    @click="show"
  >
    <img
      :src="inlineSrc ?? src"
      :srcset="inlineSrcset"
      :sizes="inlineSrcset ? sizes : undefined"
      :alt="alt ?? ''"
      loading="lazy"
      decoding="async"
      class="fig-zoom-img"
      :class="natural ? 'fig-zoom-img--natural' : ''"
    />
    <span class="fig-zoom-hint" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75"/>
        <path d="M13.5 13.5l3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        <path d="M9 6.5v5M6.5 9h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      Увеличить
    </span>
  </button>

  <Teleport v-if="mounted" to="body">
    <Transition name="fig-lightbox-fade">
      <div
        v-if="open"
        class="fig-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="alt || 'Фото'"
        @click.self="close"
      >
        <button type="button" class="fig-lightbox__close" aria-label="Закрыть" @click="close">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <figure class="fig-lightbox__figure" @click.self="close">
          <img :src="src" :alt="alt ?? ''" class="fig-lightbox__img" decoding="async" />
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fig-zoom-btn {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: zoom-in;
}
.fig-zoom-img {
  display: block;
  width: 100%;
  aspect-ratio: 21 / 9;
  border-radius: 0.75rem;
  object-fit: cover;
}
.fig-zoom-img--natural {
  aspect-ratio: auto;
  object-fit: contain;
  background: #fff;
  border: 1px solid var(--color-slate-200);
}
.fig-zoom-hint {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 150ms ease, transform 150ms ease;
}
.fig-zoom-hint svg { width: 0.875rem; height: 0.875rem; }
.fig-zoom-btn:hover .fig-zoom-hint,
.fig-zoom-btn:focus-visible .fig-zoom-hint {
  opacity: 1;
  transform: translateY(0);
}
.fig-zoom-btn:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 3px;
  border-radius: 0.75rem;
}
@media (hover: none) {
  /* На тач-устройствах ховера нет — подсказка видна сразу */
  .fig-zoom-hint { opacity: 1; transform: none; }
}

.fig-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.92);
}
.fig-lightbox__close {
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
.fig-lightbox__close:hover { background: rgba(255, 255, 255, 0.22); }
.fig-lightbox__close svg { width: 1.375rem; height: 1.375rem; }

.fig-lightbox__figure { margin: 0; }
.fig-lightbox__img {
  display: block;
  max-width: min(92vw, 1400px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: var(--color-slate-900);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.fig-lightbox-fade-enter-active,
.fig-lightbox-fade-leave-active { transition: opacity 180ms ease; }
.fig-lightbox-fade-enter-from,
.fig-lightbox-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .fig-lightbox-fade-enter-active,
  .fig-lightbox-fade-leave-active { transition: none; }
  .fig-zoom-hint { transition: none; }
}
</style>
