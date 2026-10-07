<script setup lang="ts">
/**
 * Окно просмотра фото — один экземпляр на весь сайт (BaseLayout,
 * client:only). Открывается событием 'open-lightbox' с { images, index }:
 * src/lib/lightbox.ts (группы [data-lightbox]), слайдеры, DoorLeafViewer.
 *
 * Модальный диалог: фокус переходит на «Закрыть» и не уходит из окна
 * (Tab по кругу), после закрытия возвращается на кнопку, которой окно
 * открыли. Листание — стрелки, клавиши ←/→, свайп; Esc и клик по фону
 * закрывают. Под фото — подпись (alt кадра) и номер.
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

interface LightboxImg {
  src: string
  alt: string
}

const images   = ref<LightboxImg[]>([])
const curIndex = ref<number | null>(null)
const dialog   = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null

const current = computed(() => (curIndex.value === null ? null : images.value[curIndex.value] ?? null))
const many    = computed(() => images.value.length > 1)

/* Предзагрузка соседних кадров — листание ощущается мгновенным */
function preloadNeighbors(idx: number) {
  const len = images.value.length
  if (len < 2) return
  for (const n of [(idx + 1) % len, (idx - 1 + len) % len]) {
    const src = images.value[n]?.src
    if (src) { const im = new Image(); im.src = src }
  }
}

async function open(imgs: LightboxImg[], idx: number) {
  if (!imgs.length) return
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  images.value   = imgs
  curIndex.value = Math.min(Math.max(idx, 0), imgs.length - 1)
  document.documentElement.style.overflow = 'hidden'
  preloadNeighbors(curIndex.value)
  await nextTick()
  closeBtn.value?.focus()
}

function close() {
  if (curIndex.value === null) return
  curIndex.value = null
  images.value   = []
  document.documentElement.style.overflow = ''
  returnFocus?.focus()
  returnFocus = null
}

function go(step: number) {
  if (curIndex.value === null || !many.value) return
  const len = images.value.length
  curIndex.value = (curIndex.value + step + len) % len
  preloadNeighbors(curIndex.value)
}

/* Tab не уходит из окна: с последней кнопки — на первую и обратно */
function trapTab(e: KeyboardEvent) {
  const els = dialog.value?.querySelectorAll<HTMLElement>('button')
  if (!els?.length) return
  const first = els[0]!
  const last  = els[els.length - 1]!
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

function onKey(e: KeyboardEvent) {
  if (curIndex.value === null) return
  if (e.key === 'Escape')     close()
  if (e.key === 'ArrowLeft')  go(-1)
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'Tab')        trapTab(e)
}

/* Свайп: горизонтальный жест длиннее 2.5rem — листание */
let startX = 0
let startY = 0
function onTouchStart(e: TouchEvent) {
  startX = e.touches[0]?.clientX ?? 0
  startY = e.touches[0]?.clientY ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!t) return
  const dx = t.clientX - startX
  const dy = t.clientY - startY
  const threshold = 2.5 * parseFloat(getComputedStyle(document.documentElement).fontSize)
  if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
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
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="current"
      ref="dialog"
      class="lb"
      role="dialog"
      aria-modal="true"
      :aria-label="current.alt || 'Просмотр фото'"
      @click.self="close"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <button ref="closeBtn" type="button" class="lb__btn lb__close" aria-label="Закрыть" @click="close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>

      <figure class="lb__figure" @click.self="close">
        <!-- :key — новый кадр проявляется заново при листании -->
        <img :key="current.src" :src="current.src" :alt="current.alt" class="lb__img" decoding="async" />
        <figcaption v-if="current.alt || many" class="lb__caption">
          <span v-if="current.alt" class="lb__alt">{{ current.alt }}</span>
          <span v-if="many" class="lb__count" aria-live="polite">{{ curIndex! + 1 }} / {{ images.length }}</span>
        </figcaption>
      </figure>

      <template v-if="many">
        <button type="button" class="lb__btn lb__nav lb__nav--prev" aria-label="Предыдущее фото" @click="go(-1)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" class="lb__btn lb__nav lb__nav--next" aria-label="Следующее фото" @click="go(1)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
/* Отступы окна учитывают вырезы экрана (safe-area) */
.lb {
  --lb-pad: max(1rem, env(safe-area-inset-left, 0rem));
  --lb-btn: 3rem;
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding:
    calc(env(safe-area-inset-top, 0rem) + var(--lb-btn) + 1.5rem)
    var(--lb-pad)
    calc(env(safe-area-inset-bottom, 0rem) + 1.25rem);
  background: color-mix(in srgb, var(--color-slate-950) 94%, transparent);
  color: var(--color-white);
  animation: lb-fade 180ms var(--ease-out);
}

.lb__figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
}
.lb__img {
  display: block;
  max-width: min(100%, 90rem);
  max-height: calc(100dvh - 12rem);
  border-radius: 1.25rem;
  object-fit: contain;
  animation: lb-in 240ms var(--ease-out);
}

/* Подпись и номер — одной строкой под фото */
.lb__caption {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 1rem;
  max-width: 40rem;
  font-size: 0.875rem;
  line-height: 1.45;
  text-align: center;
  color: var(--color-slate-300);
}
.lb__count { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--color-slate-400); }

.lb__btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: var(--lb-btn);
  height: var(--lb-btn);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-white) 14%, transparent);
  color: var(--color-white);
  cursor: pointer;
  transition: background-color 180ms var(--ease-out);
}
.lb__btn:hover { background: color-mix(in srgb, var(--color-white) 26%, transparent); }
.lb__btn:focus-visible { outline: 0.125rem solid var(--color-secondary-300); outline-offset: 0.125rem; }
.lb__btn svg {
  width: 1.375rem;
  height: 1.375rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.lb__close { top: calc(env(safe-area-inset-top, 0rem) + 1rem); right: var(--lb-pad); }
.lb__nav { top: 50%; translate: 0 -50%; }
.lb__nav--prev { left: var(--lb-pad); }
.lb__nav--next { right: var(--lb-pad); }

/* Телефон: стрелки внизу по краям — не закрывают фото, листать удобнее свайпом */
@media (max-width: 43.6875rem) {
  .lb { padding-bottom: calc(env(safe-area-inset-bottom, 0rem) + var(--lb-btn) + 2rem); }
  .lb__nav { top: auto; bottom: calc(env(safe-area-inset-bottom, 0rem) + 1rem); translate: none; }
  .lb__img { border-radius: 0.75rem; }
}

@keyframes lb-fade { from { opacity: 0; } }
@keyframes lb-in   { from { opacity: 0; scale: 0.97; } }

@media (prefers-reduced-motion: reduce) {
  .lb, .lb__img { animation: none; }
}
</style>
