<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  visiblePages: Array<number | string>
}>()

defineEmits<{
  change: [page: number]
}>()
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-2 flex flex-wrap items-center justify-center gap-2" aria-label="Навигация по каталогу">
    <button
      type="button"
      class="min-h-11 rounded-lg border-2 border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
      :disabled="currentPage <= 1"
      @click="$emit('change', currentPage - 1)"
    >
      Назад
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      class="min-h-11 min-w-11 rounded-lg border-2 text-sm font-medium transition disabled:cursor-default"
      :class="page === currentPage
        ? 'border-teal-600 bg-teal-600 text-white'
        : page === '...'
          ? 'border-transparent text-slate-400 opacity-45'
          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
      :disabled="page === '...'"
      @click="typeof page === 'number' && $emit('change', page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="min-h-11 rounded-lg border-2 border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-default disabled:opacity-45 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      Далее
    </button>
  </nav>
</template>
