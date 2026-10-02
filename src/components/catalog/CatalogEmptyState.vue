<script setup lang="ts">
defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="grid min-h-96 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-[clamp(3rem,8vw,5.5rem)] text-center" role="status">
    <div class="grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-600" aria-hidden="true">
      <svg class="h-7.5 w-7.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M6 7v13h12V7M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    </div>
    <h2 class="mb-1.5 mt-4 text-[1.35rem] font-medium text-ink">Ничего не найдено</h2>
    <p class="mb-5 max-w-100 text-sm leading-relaxed text-slate-500">Попробуйте изменить поисковый запрос или убрать часть фильтров.</p>
    <button type="button" class="btn btn-primary" @click="$emit('reset')">
      Сбросить фильтры
    </button>
  </div>
</template>
