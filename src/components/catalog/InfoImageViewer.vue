<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface InfoImage {
  src: string
  caption: string
  alt: string
}

const props = withDefaults(defineProps<{
  images: InfoImage[]
  /** diagram (по умолчанию) — небольшой канвас с потолком высоты, под мелкие
      схемы; photo — постеры/фото на всю карточку, кадрируются (object-fit:
      cover) по aspectRatio — для реальных фото, где кроп не страшен; wide —
      во всю ширину контейнера БЕЗ кропа (object-fit:contain) по aspectRatio
      — для инфографики/презентаций с текстом внутри, где обрезать нельзя. */
  variant?: 'diagram' | 'photo' | 'wide'
  aspectRatio?: string
  /** Колонок в сетке на десктопе (мобайл всегда 1). По умолчанию 2 — под
      привычные пары/четвёрки фото; 3 — под нечётные наборы вроде триптиха
      постеров, чтобы последняя карточка не повисала одна в пустой строке. */
  columns?: 2 | 3
}>(), {
  variant: 'diagram',
  aspectRatio: '16 / 9',
  columns: 2,
})

const active = ref<InfoImage | null>(null)

const open = (img: InfoImage) => {
  active.value = img
  document.body.style.overflow = 'hidden'
}
const close = () => {
  active.value = null
  document.body.style.overflow = ''
}
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="iiv-host">
    <div
      class="iiv"
      :class="{ 'iiv--photo': variant === 'photo', 'iiv--wide': variant === 'wide', 'iiv--cols-3': columns === 3 }"
      :style="variant !== 'diagram' ? { '--iiv-ar': aspectRatio } : {}"
    >
      <figure v-for="img in images" :key="img.src" class="iiv-card">
        <figcaption class="iiv-head">
          <span class="iiv-caption">{{ img.caption }}</span>
          <button
            type="button"
            class="iiv-zoom"
            :aria-label="`Увеличить: ${img.caption}`"
            @click="open(img)"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.75"/>
              <path d="M13.5 13.5l3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <path d="M9 6.5v5M6.5 9h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
            Увеличить
          </button>
        </figcaption>

        <button
          type="button"
          class="iiv-imgbtn"
          :aria-label="`Открыть изображение: ${img.caption}`"
          @click="open(img)"
        >
          <img :src="img.src" :alt="img.alt" loading="lazy" decoding="async" />
        </button>
      </figure>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="iiv-fade">
        <div
          v-if="active"
          class="iiv-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="active.caption"
          @click.self="close"
        >
          <button class="iiv-close" type="button" aria-label="Закрыть" @click="close">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <figure class="iiv-figure" @click.self="close">
            <img :src="active.src" :alt="active.alt" class="iiv-modal-img" decoding="async" />
            <figcaption class="iiv-figcap">{{ active.caption }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Cards ── */
.iiv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
}
/* Один элемент — карточка на всю ширину, а не половина с пустым местом рядом */
.iiv:has(.iiv-card:only-child) { grid-template-columns: 1fr; }
.iiv--cols-3 { grid-template-columns: repeat(3, 1fr); }

.iiv-card {
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  background: #fff;
}

/* Header */
.iiv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid #f1f5f9;
}
.iiv-caption {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #334155;
}
.iiv-zoom {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  background: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 150ms ease, color 150ms ease;
}
.iiv-zoom:hover { border-color: #94a3b8; color: #0f172a; }
.iiv-zoom svg { width: 0.875rem; height: 0.875rem; flex-shrink: 0; }

/* Image area */
.iiv-imgbtn {
  display: block;
  width: 100%;
  flex: 1;
  padding: 1.25rem;
  border: none;
  background: #f8fafc;
  cursor: zoom-in;
}
.iiv-imgbtn img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 22rem;
  object-fit: contain;
  transition: transform 300ms ease;
}
.iiv-imgbtn:hover img { transform: scale(1.015); }

/* ── Photo variant — постеры/фото без канваса, кадрируются под фикс.
   пропорцию (--iiv-ar), а не вписываются в фикс. высоту с летербоксингом ── */
.iiv--photo .iiv-imgbtn {
  padding: 0;
  background: transparent;
}
.iiv--photo .iiv-imgbtn img {
  height: auto;
  max-height: none;
  aspect-ratio: var(--iiv-ar, 16 / 9);
  object-fit: cover;
}

/* ── Wide variant — инфографика/презентация на всю ширину карточки, без
   кропа (там текст, обрезать нельзя, в отличие от photo-варианта). Лёгкий
   канвас — на случай если пропорция aspectRatio не идеально совпадёт с
   реальной, летербоксинг не будет выглядеть как баг. ── */
.iiv--wide .iiv-imgbtn {
  padding: 0;
  background: #f8fafc;
}
.iiv--wide .iiv-imgbtn img {
  height: auto;
  max-height: none;
  aspect-ratio: var(--iiv-ar, 16 / 9);
  object-fit: contain;
}

/* ── Overlay ── */
.iiv-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.90);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.iiv-close {
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
.iiv-close:hover { background: rgba(255, 255, 255, 0.22); }
.iiv-close svg { width: 1.375rem; height: 1.375rem; }

.iiv-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
}
.iiv-modal-img {
  max-width: min(95vw, 1100px);
  max-height: 85vh;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.iiv-figcap {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

/* ── Transition ── */
.iiv-fade-enter-active,
.iiv-fade-leave-active { transition: opacity 180ms ease; }
.iiv-fade-enter-from,
.iiv-fade-leave-to   { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 720px) {
  .iiv { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .iiv-imgbtn img,
  .iiv-fade-enter-active,
  .iiv-fade-leave-active { transition: none; }
}
</style>
