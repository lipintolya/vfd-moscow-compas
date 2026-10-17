<script setup lang="ts">
defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="ce" role="status">
    <p class="h-h3">Таких моделей нет</p>
    <p class="h-body ce__text">Уберите часть фильтров или измените запрос — или позвоните в салон: подберём похожую дверь.</p>
    <button type="button" class="h-btn h-btn--ink ce__btn" @click="$emit('reset')">Сбросить фильтры</button>
  </div>
</template>

<style scoped>
.ce {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(2rem, 5vw, 3.5rem);
  background: var(--h-wall);
}
.ce__text { margin-top: 0.5rem; max-width: 28rem; font-size: 0.9375rem; }
.ce__btn { margin-top: 1.5rem; border: 0; cursor: pointer; font-family: inherit; }
</style>
