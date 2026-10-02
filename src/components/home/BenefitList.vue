<script setup lang="ts">
/**
 * src/components/home/BenefitList.vue
 * Список преимуществ в промо-блоках главной (Техно, Штрих, скрытые двери,
 * «Рефлекс») — строгий «спек-лист»: пункты через тонкие разделители,
 * короткий бирюзовый штрих вместо иконки.
 *
 * Раньше у каждого пункта была декоративная линейная SVG-иконка — читалось
 * шаблонно и несерьёзно. Один компонент на все блоки — чтобы оформление
 * не разъезжалось между ними.
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  items: string[]
  /** 2 — две колонки от sm (короткие пункты), 1 — всегда столбик (длинные). */
  cols?: 1 | 2
}>(), { cols: 2 })

/* При нечётном числе пунктов последний висел бы один во втором ряду с
   обрезанной линией — тогда столбик. */
const twoCols = computed(() => props.cols === 2 && props.items.length % 2 === 0)
</script>

<template>
  <ul
    class="grid grid-cols-1 border-t border-slate-200"
    :class="twoCols ? 'sm:grid-cols-2 sm:gap-x-6' : ''"
    role="list"
  >
    <li
      v-for="item in items"
      :key="item"
      class="flex items-start gap-3 border-b border-slate-200 py-2.5 text-[0.9375rem] leading-snug text-slate-800"
    >
      <span class="mt-[0.68em] h-px w-3 shrink-0 bg-accent-600" aria-hidden="true" />
      <span>{{ item }}</span>
    </li>
  </ul>
</template>
