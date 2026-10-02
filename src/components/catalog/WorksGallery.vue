<script setup lang="ts">
import { computed } from 'vue'
import type { InvisibleWork } from '../../data/skrytye-dveri-works'
import WorkDetailCard from './WorkDetailCard.vue'

const props = defineProps<{
  works: InvisibleWork[]
  tgHref: string
  limit?: number
  archiveHref?: string
}>()

const featured = computed(() => (props.limit ? props.works.slice(0, props.limit) : props.works))
const hiddenCount = computed(() => props.works.length - featured.value.length)
const hasMore = computed(() => !!props.archiveHref && hiddenCount.value > 0)
</script>

<template>
  <div class="flex flex-col gap-10 sm:gap-14">
    <WorkDetailCard v-for="work in featured" :key="work.id" :work="work" :tg-href="tgHref" />

    <div v-if="hasMore" class="flex justify-center">
      <a :href="archiveHref" class="btn btn-outline">
        Смотреть все работы ({{ works.length }}) →
      </a>
    </div>
  </div>
</template>
