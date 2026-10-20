<!-- Знак MAX — официальный символ из файлов бренда: чёрный на светлом фоне,
     белый на тёмном. Знак не меняем (ни цвет, ни форму), размер задаёт класс
     снаружи. tone — цвет фона, на котором стоит знак. -->
<script setup lang="ts">
import { MESSENGER_ICONS } from '../../lib/messenger-icons'
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <img
    :src="tone === 'dark' ? MESSENGER_ICONS.max.onDark : MESSENGER_ICONS.max.onLight"
    alt=""
    aria-hidden="true"
    width="24"
    height="24"
    decoding="async"
  />
</template>
