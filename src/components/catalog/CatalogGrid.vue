<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import CatalogProductCard from './CatalogProductCard.vue'
import type { CatalogCardItem } from './types'

defineProps<{
  cards: CatalogCardItem[]
}>()

/* «Что входит в комплект» открыт у одной карточки за раз; клик мимо или
   Esc закрывают */
const openKitId = ref<string | null>(null)

const closeOnOutsideClick = (event: MouseEvent) => {
  if (openKitId.value === null) return
  const card = (event.target as HTMLElement).closest<HTMLElement>('[data-kit-card]')
  if (!card || card.dataset.kitCard !== openKitId.value) openKitId.value = null
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') openKitId.value = null
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <ul class="cg" role="list">
    <li v-for="(card, index) in cards" :key="card.id">
      <CatalogProductCard
        :card="card"
        :priority="index < 4"
        :is-kit-open="openKitId === card.id"
        @kit-toggle="openKitId = openKitId === card.id ? null : card.id"
      />
    </li>
  </ul>
</template>

<style scoped>
/* Колонки — от ширины места под сетку, а не экрана: на /catalog/ рядом
   фильтры, на странице серии их нет */
.cg {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
  gap: 2.5rem var(--h-tile-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}
/* Широкий монитор: не больше четырёх в ряд — 24 на странице делятся ровно */
@media (width >= 1920px) {
  .cg { grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); }
}
@media (max-width: 35.9375rem) {
  .cg { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 0.75rem; }
}
</style>
