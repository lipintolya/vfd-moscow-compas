<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ images: string[] }>()

const current = ref(0)

const prev = () => {
  current.value = (current.value - 1 + props.images.length) % props.images.length
}
const next = () => {
  current.value = (current.value + 1) % props.images.length
}

/* ── Лайтбокс — Teleport-модалка, гейт по mounted: SSR рендерит "закрыто"
   (mounted=false), первый клиентский рендер до гидратации — то же самое,
   расхождение появляется уже после хайдрейшна как обычное реактивное
   обновление. Без этого гейта Vue ловит "Hydration node mismatch" на
   этой странице (тот же класс бага, что чинили в Reviews.vue). ── */
const mounted = ref(false)
const lightboxOpen = ref(false)

const openLightbox = (i?: number) => {
  if (i != null) current.value = i
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft')  prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'Escape' && lightboxOpen.value) closeLightbox()
}

/* Свайп — общий для инлайн-фото и лайтбокса */
const SWIPE_THRESHOLD = 40
let touchStartX = 0
const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0]?.clientX ?? 0 }
const onTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches[0] || props.images.length < 2) return
  const dx = touchStartX - e.changedTouches[0].clientX
  if (Math.abs(dx) <= SWIPE_THRESHOLD) return
  dx > 0 ? next() : prev()
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div>
    <!-- Main photo — клик/тап открывает лайтбокс на весь экран -->
    <div
      class="relative overflow-hidden rounded-2xl bg-slate-100 aspect-4/3"
      @touchstart.passive="onTouchStart"
      @touchend="onTouchEnd"
    >
      <button
        type="button"
        class="block h-full w-full cursor-zoom-in"
        :aria-label="`Открыть фото ${current + 1} на весь экран`"
        @click="openLightbox()"
      >
        <img
          :src="images[current]"
          :alt="`Фото ${current + 1} из ${images.length}`"
          loading="eager"
          decoding="async"
          class="w-full h-full object-cover"
        />
      </button>

      <span class="pointer-events-none absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
        <svg viewBox="0 0 20 20" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75"/>
          <path d="M13.5 13.5l3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
        Увеличить
      </span>

      <!-- Prev arrow -->
      <button
        v-if="images.length > 1"
        @click.stop="prev"
        aria-label="Предыдущее фото"
        class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center text-xl hover:bg-black/60 transition-colors"
      >‹</button>

      <!-- Next arrow -->
      <button
        v-if="images.length > 1"
        @click.stop="next"
        aria-label="Следующее фото"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center text-xl hover:bg-black/60 transition-colors"
      >›</button>

      <!-- Counter -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full"
      >
        {{ current + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-2 mt-3 overflow-x-auto pb-1">
      <button
        v-for="(img, i) in images"
        :key="i"
        @click="current = i"
        :aria-label="`Фото ${i + 1}`"
        :class="[
          'flex-none w-16 h-16 overflow-hidden rounded-lg border-2 transition-colors',
          i === current ? 'border-teal-500' : 'border-transparent hover:border-slate-300'
        ]"
      >
        <img
          :src="img"
          :alt="`Миниатюра ${i + 1}`"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover"
        />
      </button>
    </div>

    <!-- Лайтбокс — полноэкранный просмотр -->
    <Teleport to="body">
      <Transition name="pf-lightbox-fade">
        <div
          v-if="mounted && lightboxOpen"
          class="pf-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="`Фото ${current + 1} из ${images.length}`"
          @click.self="closeLightbox"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
        >
          <button type="button" class="pf-lightbox__close" aria-label="Закрыть" @click="closeLightbox">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            class="pf-lightbox__nav pf-lightbox__nav--prev"
            aria-label="Предыдущее фото"
            @click="prev"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            v-if="images.length > 1"
            type="button"
            class="pf-lightbox__nav pf-lightbox__nav--next"
            aria-label="Следующее фото"
            @click="next"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <figure class="pf-lightbox__figure" @click.self="closeLightbox">
            <img
              :src="images[current]"
              :alt="`Фото ${current + 1} из ${images.length}`"
              class="pf-lightbox__img"
              decoding="async"
            />
          </figure>

          <div v-if="images.length > 1" class="pf-lightbox__counter">
            {{ current + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.pf-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.92);
}
.pf-lightbox__close {
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
.pf-lightbox__close:hover { background: rgba(255, 255, 255, 0.22); }
.pf-lightbox__close svg { width: 1.375rem; height: 1.375rem; }

.pf-lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
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
.pf-lightbox__nav:hover { background: rgba(255, 255, 255, 0.22); }
.pf-lightbox__nav svg { width: 1.375rem; height: 1.375rem; }
.pf-lightbox__nav--prev { left: 0.75rem; }
.pf-lightbox__nav--next { right: 0.75rem; }
@media (min-width: 640px) {
  .pf-lightbox__nav--prev { left: 1.5rem; }
  .pf-lightbox__nav--next { right: 1.5rem; }
}

.pf-lightbox__figure { margin: 0; }
.pf-lightbox__img {
  display: block;
  max-width: min(92vw, 1100px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #111;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.pf-lightbox__counter {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.10);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.pf-lightbox-fade-enter-active,
.pf-lightbox-fade-leave-active { transition: opacity 180ms ease; }
.pf-lightbox-fade-enter-from,
.pf-lightbox-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .pf-lightbox-fade-enter-active,
  .pf-lightbox-fade-leave-active { transition: none; }
}
</style>
