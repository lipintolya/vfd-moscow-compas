<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { InvisibleWork } from '../../data/skrytye-dveri-works'

const props = defineProps<{ work: InvisibleWork; tgHref: string }>()

type Spec = { label: string; value: string }

const specsFor = (work: InvisibleWork): Spec[] => {
  const specs: Spec[] = []
  if (work.series)           specs.push({ label: 'Серия',         value: `«${work.series}»` })
  if (work.edge)              specs.push({ label: 'Кромка',        value: work.edge })
  if (work.coating)           specs.push({ label: 'Покрытие',      value: work.coating })
  if (work.features?.length)  specs.push({ label: 'Монтаж',        value: work.features.join(' · ') })
  if (work.location)          specs.push({ label: 'Город',         value: work.location })
  specs.push({ label: 'Дата монтажа', value: work.label })
  return specs
}

const altFor = (i: number) =>
  `Скрытые двери «${props.work.series ?? props.work.title}» — фото ${i + 1} из ${props.work.images.length}, ${props.work.location ?? 'Челябинск'}`

/* ── Активная фотография в герое карточки ── */
const activeIndex = ref(0)
const setActive = (i: number) => { activeIndex.value = i }

let heroTouchX = 0
const onHeroTouchStart = (e: TouchEvent) => { heroTouchX = e.touches[0].clientX }
const onHeroTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - heroTouchX
  if (Math.abs(dx) < 40) return
  const len = props.work.images.length
  activeIndex.value = (activeIndex.value + (dx > 0 ? -1 : 1) + len) % len
}

/* ── Lightbox (полноэкранный просмотр фото) ── */
const lightboxIndex = ref<number | null>(null)

const openLightbox = (i: number) => {
  lightboxIndex.value = i
  document.body.style.overflow = 'hidden'
}
const closeLightbox = () => {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}
const go = (dir: -1 | 1) => {
  if (lightboxIndex.value === null) return
  const len = props.work.images.length
  const next = (lightboxIndex.value + dir + len) % len
  lightboxIndex.value = next
  activeIndex.value = next
}
const jumpTo = (i: number) => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = i
  activeIndex.value = i
}

let lightboxTouchX = 0
const onLightboxTouchStart = (e: TouchEvent) => { lightboxTouchX = e.touches[0].clientX }
const onLightboxTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - lightboxTouchX
  if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1)
}

const onKey = (e: KeyboardEvent) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape')     closeLightbox()
  if (e.key === 'ArrowLeft')  go(-1)
  if (e.key === 'ArrowRight') go(1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <article
    class="overflow-hidden rounded-3xl border border-slate-200 bg-white"
    itemscope
    itemtype="https://schema.org/CreativeWork"
  >
    <!-- Header -->
    <header class="flex flex-wrap items-start justify-between gap-4 p-5 pb-0 sm:p-7 sm:pb-0">
      <div class="min-w-0">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span
            v-if="work.series"
            class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
          >
            Серия «{{ work.series }}»
          </span>
          <span
            v-if="work.edge"
            class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            Кромка {{ work.edge.toLowerCase() }}
          </span>
        </div>
        <h3 class="m-0 text-xl font-medium tracking-tight text-slate-900 sm:text-2xl" itemprop="name">
          {{ work.title }}
        </h3>
        <p v-if="work.location" class="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true" class="shrink-0 text-slate-400">
            <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z" stroke="currentColor" stroke-width="1.2" fill="none"/>
            <circle cx="6" cy="4.5" r="1.25" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          {{ work.location }}
        </p>
      </div>
      <time
        class="shrink-0 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-600"
        :datetime="work.date"
        itemprop="dateCreated"
      >
        {{ work.label }}
      </time>
    </header>

    <!-- Hero + specs -->
    <div class="grid gap-6 p-5 sm:p-7 lg:grid-cols-[3fr_2fr] lg:gap-8">
      <!-- Hero column -->
      <div>
        <div
          class="group relative aspect-4/3 overflow-hidden rounded-2xl bg-slate-100 sm:aspect-16/11"
          @touchstart="onHeroTouchStart"
          @touchend="onHeroTouchEnd"
        >
          <button
            v-for="(img, i) in work.images"
            :key="img"
            type="button"
            class="absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none"
            :class="i === activeIndex ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'"
            :aria-hidden="i !== activeIndex"
            :tabindex="i === activeIndex ? 0 : -1"
            :aria-label="`Открыть фото ${i + 1} из ${work.images.length} в полноэкранном режиме`"
            @click="openLightbox(i)"
          >
            <img
              :src="img"
              :alt="altFor(i)"
              itemprop="image"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span
              class="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none"
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 2.5h-3a2 2 0 0 0-2 2v3M12.5 2.5h3a2 2 0 0 1 2 2v3M7.5 17.5h-3a2 2 0 0 1-2-2v-3M12.5 17.5h3a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>

          <span
            v-if="work.images.length > 1"
            class="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
            aria-hidden="true"
          >
            {{ activeIndex + 1 }} / {{ work.images.length }}
          </span>
        </div>

        <!-- Filmstrip -->
        <div
          v-if="work.images.length > 1"
          class="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
        >
          <button
            v-for="(img, i) in work.images"
            :key="img"
            type="button"
            class="relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-colors duration-200 motion-reduce:transition-none sm:h-20 sm:w-20"
            :class="i === activeIndex ? 'border-teal-600' : 'border-transparent hover:border-slate-300'"
            :aria-current="i === activeIndex"
            :aria-label="`Показать фото ${i + 1} из ${work.images.length}`"
            @click="setActive(i)"
          >
            <img :src="img" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async" />
          </button>
        </div>
      </div>

      <!-- Specs column -->
      <div class="flex flex-col">
        <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Спецификация</p>
        <dl class="m-0 flex flex-col">
          <div
            v-for="spec in specsFor(work)"
            :key="spec.label"
            class="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0"
          >
            <dt class="text-sm text-slate-500">{{ spec.label }}</dt>
            <dd class="m-0 text-right text-sm font-semibold text-slate-900">{{ spec.value }}</dd>
          </div>
        </dl>
        <p v-if="work.story" class="mb-0 mt-4 text-sm leading-relaxed text-slate-600" itemprop="description">
          {{ work.story }}
        </p>
        <a :href="tgHref" target="_blank" rel="noopener" class="btn btn-primary mt-5 self-start">
          Хочу такой же результат
        </a>
      </div>
    </div>
  </article>

  <!-- Lightbox -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
      leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="lightboxIndex !== null"
        class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-950 p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="`Просмотр фото: ${work.title}`"
        @click.self="closeLightbox"
        @touchstart="onLightboxTouchStart"
        @touchend="onLightboxTouchEnd"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Закрыть"
          @click="closeLightbox"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>

        <span
          v-if="work.images.length > 1"
          class="absolute left-4 top-4 z-20 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {{ (lightboxIndex ?? 0) + 1 }} / {{ work.images.length }}
        </span>

        <figure class="m-0 flex flex-col items-center">
          <div class="relative inline-flex max-h-[68vh] max-w-[92vw] sm:max-h-[74vh] sm:max-w-250">
            <img
              v-if="lightboxIndex !== null"
              :src="work.images[lightboxIndex]"
              :alt="altFor(lightboxIndex)"
              class="max-h-[68vh] max-w-[92vw] rounded-lg object-contain shadow-2xl sm:max-h-[74vh] sm:max-w-250"
              decoding="async"
            />

            <template v-if="work.images.length > 1">
              <button
                type="button"
                class="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
                aria-label="Предыдущее фото"
                @click.stop="go(-1)"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
              <button
                type="button"
                class="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
                aria-label="Следующее фото"
                @click.stop="go(1)"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
            </template>
          </div>

          <figcaption class="mt-3 max-w-[92vw] text-center text-sm font-medium text-white/70">
            {{ work.title }}
          </figcaption>
        </figure>

        <div
          v-if="work.images.length > 1"
          class="mt-4 flex max-w-[92vw] gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          <button
            v-for="(img, i) in work.images"
            :key="img"
            type="button"
            class="h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200 sm:h-14 sm:w-14"
            :class="i === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'"
            :aria-current="i === lightboxIndex"
            :aria-label="`Перейти к фото ${i + 1}`"
            @click.stop="jumpTo(i)"
          >
            <img :src="img" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
