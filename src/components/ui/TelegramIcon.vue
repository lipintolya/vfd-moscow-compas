<!-- Знак Telegram — официальный значок из файлов бренда (PNG с прозрачным фоном):
     чёрный на светлом фоне, белый на тёмном. Знак не меняем, размер задаёт класс
     снаружи. tone — цвет фона, на котором стоит знак. -->
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <img
    :src="tone === 'dark' ? '/icons/telegram-white.png' : '/icons/telegram-black.png'"
    alt=""
    aria-hidden="true"
    width="24"
    height="24"
    decoding="async"
  />
</template>
