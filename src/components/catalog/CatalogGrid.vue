<script setup lang="ts">
import CatalogProductCard from './CatalogProductCard.vue'
import type { CatalogCardItem } from './types'
import type { ColorFamilySlug } from '../../data/color-families'

withDefaults(defineProps<{
  cards: CatalogCardItem[]
  /** Выбранные в фильтре группы цветов — карточки показывают такой цвет */
  preferFamilies?: ColorFamilySlug[]
}>(), {
  preferFamilies: () => [],
})
</script>

<template>
  <ul class="cg" role="list">
    <li v-for="(card, index) in cards" :key="card.id">
      <CatalogProductCard :card="card" :prefer-families="preferFamilies" :priority="index < 4" />
    </li>
  </ul>
</template>

<style scoped>
/* Колонки — от ширины места под сетку, а не экрана: на /catalog/ рядом
   фильтры, на странице серии их нет. 24 на странице делятся на 2, 3 и 4. */
.cg {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
  gap: 3rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (width >= 1920px) {
  .cg { grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); }
}
@media (max-width: 35.9375rem) {
  .cg { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2.5rem 1rem; }
}
</style>
