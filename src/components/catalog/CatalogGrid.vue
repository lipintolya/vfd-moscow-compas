<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import CatalogProductCard from './CatalogProductCard.vue'
import type { CatalogCardItem } from './types'

defineProps<{
  cards: CatalogCardItem[]
}>()

/* Только одна карточка может показывать попап "Что входит в комплект" за раз —
   соседние карточки притемняются, чтобы попап не выглядел слипшимся с рядом снизу */
const openKitId = ref<string | null>(null)

const closeOnOutsideClick = (event: MouseEvent) => {
  if (openKitId.value === null) return
  const target = event.target as HTMLElement
  const card = target.closest('[data-kit-card]') as HTMLElement | null
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
  <div class="grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4" aria-live="polite">
    <CatalogProductCard
      v-for="(card, index) in cards"
      :key="card.id"
      :card="card"
      :priority="index < 4"
      :is-kit-open="openKitId === card.id"
      :is-dimmed="openKitId !== null && openKitId !== card.id"
      @kit-toggle="openKitId = openKitId === card.id ? null : card.id"
    />
  </div>
</template>

