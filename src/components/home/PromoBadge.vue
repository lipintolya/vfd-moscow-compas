<script setup lang="ts">
/**
 * src/components/home/PromoBadge.vue
 * Статус-бейдж над заголовком в промо-блоках главной (Техно, Штрих,
 * скрытые двери, «Рефлекс») — раньше был обычным текстом на .t-eyebrow
 * (серый, того же веса, что и остальные надзаголовки секций сайта) и
 * терялся на белом фоне. Теперь — плашка с цветным фоном, крупнее и
 * заметнее, тот же принцип, что у бейджей на карточках каталога
 * (CatalogProductCard.vue): фирменный красный (accent) для новинок,
 * фирменный голубой (secondary) для наличия.
 */
withDefaults(defineProps<{
  tone?: 'new' | 'stock'
}>(), { tone: 'new' })
</script>

<template>
  <p
    class="mb-3 inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold tracking-wide sm:text-[0.9375rem]"
    :class="tone === 'stock' ? 'bg-secondary-50 text-secondary-700' : 'bg-accent-50 text-accent-600'"
  >
    <slot />
  </p>
</template>
