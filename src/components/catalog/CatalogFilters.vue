<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import type { CatalogFilterOption } from './types'

defineProps<{
  series: CatalogFilterOption[]
  coatings: CatalogFilterOption[]
  colors: CatalogFilterOption[]
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
}>()

const activeSeries = defineModel<string>('activeSeries', { required: true })
const activeCoating = defineModel<string>('activeCoating', { required: true })
const activeColor = defineModel<string>('activeColor', { required: true })
const glassOnly = defineModel<boolean>('glassOnly', { required: true })
const searchQuery = defineModel<string>('searchQuery', { required: true })

const emit = defineEmits<{
  reset: []
}>()

/* Поиск — единственное поле с debounce: печатать посимвольно и сразу
   перефильтровывать сетку на каждую букву дёргано. Остальные фильтры
   (серия/покрытие/цвет/теги) применяются мгновенно по клику — раньше был
   общий черновик + кнопка «Применить» на все поля разом, из-за которой
   клик по фильтру не менял сетку, пока не нажмёшь ещё раз — на клиентской
   фильтрации без роутинга это лишний шаг, а не защита от лишних запросов. */
const searchDraft = ref(searchQuery.value)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchDraft, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { searchQuery.value = value.trim() }, 300)
})
watch(searchQuery, (value) => {
  if (value !== searchDraft.value) searchDraft.value = value
})
onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })

const openSections = ref({
  series: true,
  coating: false,
  color: false,
  tags: true,
})

type SectionName = keyof typeof openSections.value

const toggleSection = (name: SectionName) => {
  openSections.value[name] = !openSections.value[name]
}

const resetAll = () => {
  /* Отменяем незавершённый debounce поиска — иначе после сброса фильтров
     кликом «Сбросить» старое напечатанное значение (ещё не улетевшее в
     searchQuery из-за 300ms задержки) молча возвращалось бы через таймер,
     который уже тикал на момент клика. */
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
  searchDraft.value = ''
  emit('reset')
}
</script>

<template>
  <aside class="@container rounded-2xl bg-slate-50 p-5" aria-label="Фильтры каталога">
    <div class="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <h2 class="m-0 text-lg font-medium text-ink">Фильтры</h2>
      <button v-if="hasActiveFilters" type="button" class="text-xs font-semibold text-teal-600 hover:text-teal-700" @click="resetAll">Сбросить</button>
    </div>

    <label class="mt-4 mb-2.5 block">
      <span class="sr-only">Поиск по каталогу</span>
      <input
        v-model="searchDraft"
        type="search"
        inputmode="search"
        autocomplete="off"
        placeholder="Поиск"
        class="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-step-0 text-ink placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15"
      />
    </label>

    <div class="border-b border-slate-200">
      <button type="button" class="flex w-full items-center justify-between py-3.5 text-step-1 font-medium text-ink" @click="toggleSection('series')">
        <span>Серия</span>
        <svg class="h-4 w-4 text-slate-400 transition-transform" :class="{ 'rotate-180': openSections.series }" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-if="openSections.series" class="mb-3.5 grid max-h-56 gap-1 overflow-y-auto">
        <button
          type="button"
          class="rounded-lg px-2.5 py-3 text-left text-step-0 text-slate-600 transition hover:bg-slate-100"
          :class="activeSeries === '' ? 'bg-teal-50 text-teal-700' : ''"
          @click="activeSeries = ''"
        >
          Все серии
        </button>
        <button
          v-for="item in series"
          :key="item.value"
          type="button"
          class="rounded-lg px-2.5 py-3 text-left text-step-0 text-slate-600 transition hover:bg-slate-100"
          :class="activeSeries === item.value ? 'bg-teal-50 text-teal-700' : ''"
          @click="activeSeries = activeSeries === item.value ? '' : item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="border-b border-slate-200">
      <button type="button" class="flex w-full items-center justify-between py-3.5 text-step-1 font-medium text-ink" @click="toggleSection('coating')">
        <span>Покрытие</span>
        <svg class="h-4 w-4 text-slate-400 transition-transform" :class="{ 'rotate-180': openSections.coating }" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-if="openSections.coating" class="mb-3.5 grid max-h-56 gap-1 overflow-y-auto">
        <button
          v-for="item in coatings"
          :key="item.value"
          type="button"
          class="rounded-lg px-2.5 py-3 text-left text-step-0 text-slate-600 transition hover:bg-slate-100"
          :class="activeCoating === item.value ? 'bg-teal-50 text-teal-700' : ''"
          @click="activeCoating = activeCoating === item.value ? '' : item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="border-b border-slate-200">
      <button type="button" class="flex w-full items-center justify-between py-3.5 text-step-1 font-medium text-ink" @click="toggleSection('color')">
        <span>Цвет</span>
        <svg class="h-4 w-4 text-slate-400 transition-transform" :class="{ 'rotate-180': openSections.color }" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-if="openSections.color" class="mb-3.5 grid max-h-56 gap-1 overflow-y-auto">
        <button
          v-for="item in colors"
          :key="item.value"
          type="button"
          class="flex items-center gap-2 rounded-lg px-2.5 py-3 text-left text-step-0 text-slate-600 transition hover:bg-slate-100"
          :class="activeColor === item.value ? 'bg-teal-50 text-teal-700' : ''"
          @click="activeColor = activeColor === item.value ? '' : item.value"
        >
          <span class="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10" :style="{ backgroundColor: item.color }"></span>
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="border-b border-slate-200">
      <button type="button" class="flex w-full items-center justify-between py-3.5 text-step-1 font-medium text-ink" @click="toggleSection('tags')">
        <span>Теги</span>
        <svg class="h-4 w-4 text-slate-400 transition-transform" :class="{ 'rotate-180': openSections.tags }" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-if="openSections.tags" class="mb-3.5">
        <label class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600">
          <input v-model="glassOnly" type="checkbox" class="h-4 w-4 accent-teal-600" />
          <span>Со стеклом</span>
        </label>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 pt-3.5 text-step-0 text-slate-500">
      <div class="inline-flex items-center gap-1">
        <strong class="font-medium text-ink">{{ filteredCount }}</strong>
        <span>из {{ totalCount }}</span>
      </div>
    </div>
  </aside>
</template>
