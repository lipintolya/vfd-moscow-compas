<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { InvisibleWork } from '../../data/skrytye-dveri-works'
import WorkDetailCard from './WorkDetailCard.vue'

defineProps<{ works: InvisibleWork[]; tgHref: string }>()

const openWork = ref<InvisibleWork | null>(null)

const open = (work: InvisibleWork) => {
  openWork.value = work
  document.body.style.overflow = 'hidden'
}
const close = () => {
  openWork.value = null
  document.body.style.overflow = ''
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      <button
        v-for="work in works"
        :key="work.id"
        type="button"
        class="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-shadow duration-200 hover:shadow-lg"
        @click="open(work)"
      >
        <div class="relative aspect-4/3 overflow-hidden bg-slate-100">
          <img
            :src="work.images[0]"
            :alt="`Скрытые двери «${work.series ?? work.title}», ${work.location ?? 'Челябинск'}`"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <span
            v-if="work.series"
            class="absolute left-2.5 top-2.5 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
          >
            «{{ work.series }}»
          </span>
          <span
            v-if="work.images.length > 1"
            class="absolute bottom-2.5 right-2.5 rounded-full bg-slate-900/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
          >
            {{ work.images.length }} фото
          </span>
        </div>
        <div class="p-3.5">
          <p class="m-0 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{{ work.title }}</p>
          <p class="mt-1.5 mb-0 text-xs font-semibold text-slate-400">
            {{ work.label }}{{ work.location ? ` · ${work.location}` : '' }}
          </p>
        </div>
      </button>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
        leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="openWork"
          class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 py-8 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          :aria-label="openWork.title"
          @click.self="close"
        >
          <div class="w-full max-w-5xl">
            <div class="mb-3 flex justify-end">
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Закрыть"
                @click="close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <WorkDetailCard :work="openWork" :tg-href="tgHref" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
