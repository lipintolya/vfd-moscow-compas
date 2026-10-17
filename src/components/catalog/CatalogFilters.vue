<script setup lang="ts">
/**
 * Фильтры каталога: поиск, серия, цвет, «со стеклом». Покрытие — не здесь,
 * а переключателем над сеткой (CatalogClient): это главный выбор, он
 * должен быть виден сразу. У вариантов — сколько моделей останется при
 * остальных выбранных фильтрах; варианты без моделей не показываются.
 * Один и тот же компонент — в колонке на компьютере и в шторке на телефоне.
 */
import { computed, ref, watch, onUnmounted, useId } from 'vue'
import type { CatalogFilterOption } from './types'

const props = defineProps<{
  series: CatalogFilterOption[]
  colors: CatalogFilterOption[]
  glassCount: number
}>()

const activeSeries = defineModel<string>('activeSeries', { required: true })
const activeColor = defineModel<string>('activeColor', { required: true })
const glassOnly = defineModel<boolean>('glassOnly', { required: true })
const searchQuery = defineModel<string>('searchQuery', { required: true })

const uid = useId()

/* Поиск — с задержкой: перефильтровывать сетку на каждую букву дёргано.
   Остальные фильтры применяются сразу по нажатию. */
const searchDraft = ref(searchQuery.value)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchDraft, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { searchQuery.value = value.trim() }, 300)
})
/* Сброс снаружи — чистим и поле, и незавершённый таймер: иначе старый
   текст вернулся бы через 300 мс */
watch(searchQuery, (value) => {
  if (value === searchDraft.value.trim()) return
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
  searchDraft.value = value
})
onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })

/* Серий до двух десятков — показываем первые, остальные по кнопке.
   Выбранная серия видна всегда, даже если она дальше в списке. */
const SERIES_VISIBLE = 8
const seriesExpanded = ref(false)
const visibleSeries = computed(() => {
  if (seriesExpanded.value || props.series.length <= SERIES_VISIBLE + 1) return props.series
  const head = props.series.slice(0, SERIES_VISIBLE)
  const active = props.series.find((s) => s.value === activeSeries.value)
  return active && !head.includes(active) ? [...head, active] : head
})
const hiddenSeriesCount = computed(() => props.series.length - visibleSeries.value.length)

const activeColorLabel = computed(() => props.colors.find((c) => c.value === activeColor.value)?.label ?? '')
</script>

<template>
  <div class="cf">
    <label class="cf__search">
      <span class="sr-only">Поиск по каталогу</span>
      <svg class="cf__search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13.5 13.5 3 3" stroke-linecap="round" />
      </svg>
      <input
        v-model="searchDraft"
        type="search"
        inputmode="search"
        autocomplete="off"
        placeholder="Модель, серия или цвет"
        class="cf__input"
      />
    </label>

    <section v-if="series.length" class="cf__group" :aria-labelledby="`${uid}-series`">
      <h3 :id="`${uid}-series`" class="cf__title">Серия</h3>
      <ul class="cf__options" role="list">
        <li v-for="item in visibleSeries" :key="item.value">
          <button
            type="button"
            class="cf__option"
            :aria-pressed="activeSeries === item.value"
            @click="activeSeries = activeSeries === item.value ? '' : item.value"
          >
            <span class="cf__mark" aria-hidden="true" />
            <span class="cf__label">{{ item.label }}</span>
            <span class="cf__count">{{ item.count }}</span>
          </button>
        </li>
      </ul>
      <button
        v-if="hiddenSeriesCount > 0 || seriesExpanded"
        type="button"
        class="cf__more"
        :aria-expanded="seriesExpanded"
        @click="seriesExpanded = !seriesExpanded"
      >
        {{ seriesExpanded ? 'Свернуть' : `Ещё ${hiddenSeriesCount}` }}
      </button>
    </section>

    <section v-if="colors.length" class="cf__group" :aria-labelledby="`${uid}-color`">
      <h3 :id="`${uid}-color`" class="cf__title">
        Цвет<span v-if="activeColorLabel" class="cf__picked">{{ activeColorLabel }}</span>
      </h3>
      <ul class="cf__swatches" role="list">
        <li v-for="item in colors" :key="item.value">
          <button
            type="button"
            class="cf__swatch"
            :style="{ backgroundColor: item.color }"
            :title="`${item.label} — ${item.count}`"
            :aria-label="`${item.label}, моделей: ${item.count}`"
            :aria-pressed="activeColor === item.value"
            @click="activeColor = activeColor === item.value ? '' : item.value"
          />
        </li>
      </ul>
    </section>

    <section v-if="glassCount > 0 || glassOnly" class="cf__group">
      <label class="cf__check">
        <input v-model="glassOnly" type="checkbox" class="cf__checkbox" />
        <span class="cf__label">Со стеклом</span>
        <span class="cf__count">{{ glassCount }}</span>
      </label>
    </section>
  </div>
</template>

<style scoped>
.cf { display: flex; flex-direction: column; }

.cf__search { position: relative; display: block; }
.cf__search-icon {
  position: absolute;
  top: 50%;
  left: 0.875rem;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--h-muted);
  transform: translateY(-50%);
  pointer-events: none;
}
.cf__input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.875rem 0 2.5rem;
  border: 0.0625rem solid var(--color-slate-300);
  border-radius: 0.75rem;
  background: var(--h-paper);
  font: inherit;
  font-size: 0.9375rem;
  color: var(--h-ink);
  transition: border-color 180ms var(--ease-out);
}
.cf__input::placeholder { color: var(--h-muted); }
.cf__input:hover { border-color: var(--color-slate-400); }
.cf__input:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; border-color: var(--h-ink); }

/* Группы — под линейками, как данные на остальных страницах */
.cf__group { margin-top: 1.25rem; padding-top: 1rem; border-top: 0.0625rem solid var(--h-rule); }
.cf__title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 0 0.5rem;
  font-family: var(--h-font);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--h-ink);
}
.cf__picked { overflow: hidden; font-size: 0.8125rem; font-weight: 500; color: var(--h-soft); text-overflow: ellipsis; white-space: nowrap; }

.cf__options { margin: 0; padding: 0; list-style: none; }
.cf__option,
.cf__check {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.5rem;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  text-align: left;
  color: var(--h-soft);
  cursor: pointer;
  transition: color 150ms var(--ease-out);
}
.cf__option:hover, .cf__check:hover { color: var(--h-ink); }
.cf__option[aria-pressed='true'] { font-weight: 600; color: var(--h-ink); }
.cf__label { flex: 1; min-width: 0; }
.cf__count { flex: none; font-size: 0.8125rem; font-weight: 500; color: var(--h-muted); font-variant-numeric: tabular-nums; }

/* Отметка выбора: кружок, выбранный — с графитовой точкой */
.cf__mark {
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  border: 0.0625rem solid var(--color-slate-300);
  border-radius: 50%;
  background: var(--h-paper);
  transition: border-color 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
}
.cf__option:hover .cf__mark { border-color: var(--color-slate-500); }
.cf__option[aria-pressed='true'] .cf__mark { border-color: var(--h-ink); box-shadow: inset 0 0 0 0.25rem var(--h-paper), inset 0 0 0 0.6rem var(--h-ink); }

.cf__more {
  margin-top: 0.25rem;
  padding: 0.5rem 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--h-ink);
  text-decoration: underline;
  text-decoration-color: var(--color-slate-300);
  text-underline-offset: 0.3em;
  cursor: pointer;
}
.cf__more:hover { text-decoration-color: var(--h-signal); }

.cf__swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, 2.25rem);
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}
.cf__swatch {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0.0625rem solid color-mix(in srgb, var(--color-slate-950) 14%, transparent);
  border-radius: 50%;
  cursor: pointer;
  transition: box-shadow 150ms var(--ease-out);
}
.cf__swatch:hover { box-shadow: 0 0 0 0.125rem var(--h-paper), 0 0 0 0.25rem var(--color-slate-300); }
.cf__swatch[aria-pressed='true'] { box-shadow: 0 0 0 0.125rem var(--h-paper), 0 0 0 0.25rem var(--h-ink); }

.cf__checkbox { flex: none; width: 1.125rem; height: 1.125rem; margin: 0; accent-color: var(--h-ink); }

.cf :is(button, input):focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }

@media (prefers-reduced-motion: reduce) {
  .cf__input, .cf__option, .cf__mark, .cf__swatch { transition: none; }
}
</style>
