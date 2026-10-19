<!-- Знак MAX — официальный символ из файлов бренда: чёрный на светлом фоне,
     белый на тёмном. Знак не меняем (ни цвет, ни форму), размер задаёт класс
     снаружи. tone — цвет фона, на котором стоит знак. -->
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <img
    :src="tone === 'dark' ? '/icons/max-white.svg' : '/icons/max-dark.svg'"
    alt=""
    aria-hidden="true"
    width="24"
    height="24"
    decoding="async"
  />
</template>
