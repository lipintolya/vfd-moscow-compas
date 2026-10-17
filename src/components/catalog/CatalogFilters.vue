<script setup lang="ts">
/**
 * Фильтры каталога — списки с галочками: цена, серия, цвет, остекление.
 * Внутри группы можно отметить несколько вариантов («белые» и «серые»),
 * группы складываются. Цвет — словами, по группам (src/data/color-families.ts):
 * названия цветов в базе привязаны к покрытию, и кружки по точному
 * названию находили лишь часть дверей. Варианты, при которых ничего не
 * найдётся, не показываются — их отбирает CatalogClient.
 * Один компонент — в колонке на компьютере и в шторке на телефоне.
 */
import { computed, ref, useId } from 'vue'

export interface FilterOption {
  value: string
  label: string
  /** Образец цвета рядом с подписью */
  color?: string
}

/* Варианты — *Options; выбранное — v-model с теми же именами без суффикса */
const props = defineProps<{
  priceOptions: FilterOption[]
  seriesOptions: FilterOption[]
  colorGroups: { title: string; items: FilterOption[] }[]
  glassOptions: FilterOption[]
}>()

const prices = defineModel<string[]>('prices', { required: true })
const series = defineModel<string[]>('series', { required: true })
const colors = defineModel<string[]>('colors', { required: true })
const glass = defineModel<string[]>('glass', { required: true })

const uid = useId()

const models = { prices, series, colors, glass }
const toggle = (key: keyof typeof models, value: string) => {
  const model = models[key]
  model.value = model.value.includes(value) ? model.value.filter((v) => v !== value) : [...model.value, value]
}

/* Группы раскрыты; заголовок группы сворачивает её */
const collapsed = ref<Record<string, boolean>>({})
const flip = (key: string) => { collapsed.value[key] = !collapsed.value[key] }

/* Серий около двадцати — первые шесть, остальные по кнопке. Отмеченная
   серия видна всегда, даже если она дальше в списке. */
const SERIES_VISIBLE = 6
const seriesExpanded = ref(false)
const visibleSeries = computed(() => {
  if (seriesExpanded.value || props.seriesOptions.length <= SERIES_VISIBLE + 1) return props.seriesOptions
  return props.seriesOptions.filter((s, i) => i < SERIES_VISIBLE || series.value.includes(s.value))
})
const hiddenSeriesCount = computed(() => props.seriesOptions.length - visibleSeries.value.length)

const groups = computed(() => [
  { key: 'prices', title: 'Цена за полотно', show: props.priceOptions.length > 0 },
  { key: 'series', title: 'Серия', show: props.seriesOptions.length > 0 },
  { key: 'colors', title: 'Цвет', show: props.colorGroups.length > 0 },
  { key: 'glass',  title: 'Остекление', show: props.glassOptions.length > 1 },
].filter((g) => g.show))
</script>

<template>
  <div class="cf">
    <section v-for="g in groups" :key="g.key" class="cf__group">
      <h3 class="cf__heading">
        <button
          type="button"
          class="cf__head"
          :aria-expanded="!collapsed[g.key]"
          :aria-controls="`${uid}-${g.key}`"
          @click="flip(g.key)"
        >
          {{ g.title }}
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 10 4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </h3>

      <div v-show="!collapsed[g.key]" :id="`${uid}-${g.key}`" class="cf__body">
        <template v-if="g.key === 'prices'">
          <label v-for="o in priceOptions" :key="o.value" class="cf__row">
            <input type="checkbox" class="cf__input" :checked="prices.includes(o.value)" @change="toggle('prices', o.value)" />
            <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <span class="cf__text">{{ o.label }}</span>
          </label>
        </template>

        <template v-else-if="g.key === 'series'">
          <label v-for="o in visibleSeries" :key="o.value" class="cf__row">
            <input type="checkbox" class="cf__input" :checked="series.includes(o.value)" @change="toggle('series', o.value)" />
            <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <span class="cf__text">{{ o.label }}</span>
          </label>
          <button
            v-if="hiddenSeriesCount > 0 || seriesExpanded"
            type="button"
            class="cf__more"
            @click="seriesExpanded = !seriesExpanded"
          >
            {{ seriesExpanded ? 'Свернуть' : `Показать ещё ${hiddenSeriesCount}` }}
          </button>
        </template>

        <template v-else-if="g.key === 'colors'">
          <div v-for="cg in colorGroups" :key="cg.title" class="cf__sub">
            <p v-if="colorGroups.length > 1" class="cf__subtitle">{{ cg.title }}</p>
            <label v-for="o in cg.items" :key="o.value" class="cf__row">
              <input type="checkbox" class="cf__input" :checked="colors.includes(o.value)" @change="toggle('colors', o.value)" />
              <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
              <span v-if="o.color" class="cf__sample" :style="{ backgroundColor: o.color }" aria-hidden="true" />
              <span class="cf__text">{{ o.label }}</span>
            </label>
          </div>
        </template>

        <template v-else>
          <label v-for="o in glassOptions" :key="o.value" class="cf__row">
            <input type="checkbox" class="cf__input" :checked="glass.includes(o.value)" @change="toggle('glass', o.value)" />
            <span class="cf__box" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <span class="cf__text">{{ o.label }}</span>
          </label>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cf { display: flex; flex-direction: column; }

/* Группы под линейками — как данные на остальных страницах */
.cf__group { border-top: 0.0625rem solid var(--h-rule); }
.cf__group:first-child { border-top: 0; }
.cf__heading { margin: 0; }
.cf__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--h-ink);
  text-align: left;
  cursor: pointer;
}
.cf__head svg { flex: none; width: 1rem; height: 1rem; color: var(--h-muted); transition: transform 200ms var(--ease-out); }
.cf__head[aria-expanded='false'] svg { transform: rotate(180deg); }
.cf__body { padding-bottom: 1rem; }

.cf__sub + .cf__sub { margin-top: 0.75rem; }
.cf__subtitle { margin: 0.25rem 0 0.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--h-muted); }

/* Строка-галочка: настоящий checkbox (клавиатура, читалки) спрятан,
   рисуется квадрат рядом */
.cf__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.25rem;
  font-size: 0.9375rem;
  line-height: 1.3;
  color: var(--h-soft);
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}
.cf__row:hover { color: var(--h-ink); }
.cf__input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; pointer-events: none; }
.cf__box {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 0.0625rem solid var(--color-slate-400);
  border-radius: 0.1875rem;
  background: var(--h-paper);
  color: transparent;
  transition: background-color 150ms var(--ease-out), border-color 150ms var(--ease-out);
}
.cf__box svg { width: 0.875rem; height: 0.875rem; }
.cf__row:hover .cf__box { border-color: var(--h-ink); }
.cf__input:checked + .cf__box { border-color: var(--h-ink); background: var(--h-ink); color: var(--color-white); }
.cf__input:checked ~ .cf__text { color: var(--h-ink); }
.cf__input:focus-visible + .cf__box { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }
.cf__sample {
  flex: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 0.0625rem solid color-mix(in srgb, var(--color-slate-950) 16%, transparent);
}

.cf__more {
  margin-top: 0.25rem;
  padding: 0.375rem 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  color: var(--h-muted);
  cursor: pointer;
}
.cf__more:hover { color: var(--h-ink); }
.cf :is(button):focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }

@media (prefers-reduced-motion: reduce) {
  .cf__head svg, .cf__row, .cf__box { transition: none; }
}
</style>
