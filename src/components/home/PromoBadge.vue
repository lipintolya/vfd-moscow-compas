<script setup lang="ts">
/**
 * src/components/home/PromoBadge.vue
 * Статус-бейдж над заголовком в промо-блоках главной (Техно, Штрих,
 * скрытые двери, «Рефлекс») — раньше был обычным текстом на .t-eyebrow
 * (серый, того же веса, что и остальные надзаголовки секций сайта) и
 * терялся на белом фоне. Теперь — плашка с цветным фоном, крупнее и
 * заметнее, тот же принцип, что у бейджей на карточках каталога
 * (CatalogProductCard.vue): красный для новинок, синий для наличия.
 */
withDefaults(defineProps<{
  tone?: 'new' | 'stock'
}>(), { tone: 'new' })
</script>

<template>
  <p
    class="mb-3 inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold tracking-wide sm:text-[0.9375rem]"
    :class="tone === 'stock' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'"
  >
    <slot />
  </p>
</template>
