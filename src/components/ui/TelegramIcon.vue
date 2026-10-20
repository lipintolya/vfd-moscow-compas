<!-- Знак Telegram — официальный значок из файлов бренда (PNG с прозрачным фоном):
     чёрный на светлом фоне, белый на тёмном. Знак не меняем, размер задаёт класс
     снаружи. tone — цвет фона, на котором стоит знак. -->
<script setup lang="ts">
import { MESSENGER_ICONS } from '../../lib/messenger-icons'
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })
</script>

<template>
  <img
    :src="tone === 'dark' ? MESSENGER_ICONS.telegram.onDark : MESSENGER_ICONS.telegram.onLight"
    alt=""
    aria-hidden="true"
    width="24"
    height="24"
    decoding="async"
  />
</template>
