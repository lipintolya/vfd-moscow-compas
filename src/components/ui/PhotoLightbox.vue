<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

interface LightboxImg {
  src: string
  alt: string
}

const images   = ref<LightboxImg[]>([])
const curIndex = ref<number | null>(null)

/* Предзагрузка соседних кадров — листание в галерее ощущается мгновенным,
   даже если изображение ещё не открывалось (иначе кажется, что «не листается»). */
function preloadNeighbors(idx: number) {
  const len = images.value.length
  if (len < 2) return
  for (const n of [(idx + 1) % len, (idx - 1 + len) % len]) {
    const src = images.value[n]?.src
    if (src) { const im = new Image(); im.src = src }
  }
}

function open(imgs: LightboxImg[], idx: number) {
  images.value   = imgs
  curIndex.value = idx
  document.body.style.overflow = 'hidden'
  preloadNeighbors(idx)
}

function close() {
  curIndex.value = null
  images.value   = []
  document.body.style.overflow = ''
}

function prev() {
  if (curIndex.value === null) return
  curIndex.value = (curIndex.value - 1 + images.value.length) % images.value.length
  preloadNeighbors(curIndex.value)
}

function next() {
  if (curIndex.value === null) return
  curIndex.value = (curIndex.value + 1) % images.value.length
  preloadNeighbors(curIndex.value)
}

function onKey(e: KeyboardEvent) {
  if (curIndex.value === null) return
  if (e.key === 'Escape')      close()
  if (e.key === 'ArrowLeft')   prev()
  if (e.key === 'ArrowRight')  next()
}

function onEvent(e: Event) {
  const { images: imgs, index } = (e as CustomEvent<{ images: LightboxImg[]; index: number }>).detail
  open(imgs, index)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('open-lightbox', onEvent)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('open-lightbox', onEvent)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="curIndex !== null"
      class="lb-backdrop"
      @click.self="close"
    >
      <button class="lb-close" @click="close" aria-label="Закрыть">✕</button>

      <button
        v-if="images.length > 1"
        class="lb-nav lb-nav--prev"
        @click="prev"
        aria-label="Предыдущее фото"
      >‹</button>

      <img
        :src="images[curIndex!]?.src"
        :alt="images[curIndex!]?.alt"
        class="lb-img"
        decoding="async"
      />

      <button
        v-if="images.length > 1"
        class="lb-nav lb-nav--next"
        @click="next"
        aria-label="Следующее фото"
      >›</button>

      <div v-if="images.length > 1" class="lb-counter">
        {{ curIndex! + 1 }} / {{ images.length }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.92);
  animation: lb-fade-in 180ms ease;
}

@keyframes lb-fade-in {
  from { opacity: 0 }
  to   { opacity: 1 }
}

.lb-img {
  max-width: 92vw;
  max-height: 88vh;
  border-radius: 20px;
  object-fit: contain;
  animation: lb-zoom-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes lb-zoom-in {
  from { transform: scale(0.92); opacity: 0 }
  to   { transform: scale(1);    opacity: 1 }
}

.lb-close,
.lb-nav {
  position: absolute;
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  cursor: pointer;
  font-size: 1.75rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 180ms ease, transform 180ms ease;
}

.lb-close:hover,
.lb-nav:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(1.08);
}

.lb-close {
  top: 1.5rem;
  right: 1.5rem;
}

.lb-nav--prev { left: 1.5rem; }
.lb-nav--next { right: 1.5rem; }

.lb-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.875rem;
  font-weight: 600;
  pointer-events: none;
}

@media (max-width: 640px) {
  .lb-nav--prev { left: 0.75rem; }
  .lb-nav--next { right: 0.75rem; }
  .lb-close     { top: 0.75rem; right: 0.75rem; }
}
</style>
