<script setup lang="ts">
/**
 * Каталог моделей: переключатель покрытий, фильтры, сортировка, сетка и
 * страницы. Всё считается в браузере (src/lib/catalog-filter.ts), без
 * перезагрузки; серия, покрытие, цвет и «со стеклом» пишутся в адрес
 * (?series=&coating=&color=&glass=1) — ссылкой можно поделиться.
 * Язык — дизайн-система сайта (styles/home.css): нужен предок .home.
 *
 * Компьютер: фильтры колонкой слева, липкие. Телефон: кнопка «Фильтры»
 * открывает шторку снизу; кнопка внизу шторки сразу говорит, сколько
 * моделей останется.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import CatalogEmptyState from './CatalogEmptyState.vue'
import CatalogFilters from './CatalogFilters.vue'
import CatalogGrid from './CatalogGrid.vue'
import CatalogPagination from './CatalogPagination.vue'
import type { CatalogCardItem, CatalogFilterOption, CatalogSort } from './types'
import { filterCards, sortCards, facetCounts, coatingRank, byLightness, type CatalogFilterState } from '../../lib/catalog-filter'
import { useScrollLock } from '../../lib/scroll-lock'
import { pluralRu } from '../../lib/plural'

const props = withDefaults(defineProps<{
  cards: CatalogCardItem[]
  series: CatalogFilterOption[]
  coatings: CatalogFilterOption[]
  colors: CatalogFilterOption[]
  initialSeries: string
  initialCoating: string
  initialColor: string
  /** Заголовок над каталогом */
  title?: string
  /** Заголовок только для экранных читалок — у страницы свой H1 прямо над каталогом */
  hideTitle?: boolean
}>(), {
  title: 'Каталог межкомнатных дверей',
  hideTitle: false,
})

const modelsWord = (n: number) => pluralRu(n, ['модель', 'модели', 'моделей'])

/* ── Состояние фильтров ── */
const activeSeries  = ref(props.initialSeries)
const activeCoating = ref(props.initialCoating)
const activeColor   = ref(props.initialColor)
const glassOnly     = ref(false)
const searchQuery   = ref('')
const sortBy        = ref<CatalogSort>('popular')
const currentPage   = ref(1)
/* 24 делится на 2, 3 и 4 колонки — последний ряд страницы всегда полный */
const ITEMS_PER_PAGE = 24

/* Сайт статический: на сборке адрес без параметров, поэтому фильтры из
   ссылки (?series=…, ?glass=1 из статей) читаем уже в браузере */
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  activeSeries.value  = params.get('series')  ?? activeSeries.value
  activeCoating.value = params.get('coating') ?? activeCoating.value
  activeColor.value   = params.get('color')   ?? activeColor.value
  glassOnly.value     = params.get('glass') === '1'
})

const filters = computed<CatalogFilterState>(() => ({
  series: activeSeries.value,
  coating: activeCoating.value,
  color: activeColor.value,
  glass: glassOnly.value,
  query: searchQuery.value,
}))

const filteredCards = computed(() => sortCards(filterCards(props.cards, filters.value), sortBy.value))

/* ── Варианты фильтров со счётчиками ── */
const coatingOfSeries = new Map(props.cards.map((c) => [c.seriesSlug, c.coatingSlug]))

const coatingCounts = computed(() => facetCounts(props.cards, filters.value, 'coating'))
const coatingTotal  = computed(() => filterCards(props.cards, filters.value, 'coating').length)
const coatingOptions = computed(() =>
  [...props.coatings]
    .sort((a, b) => coatingRank(a.value) - coatingRank(b.value))
    .map((o) => ({ ...o, count: coatingCounts.value.get(o.value) ?? 0 }))
    .filter((o) => o.count > 0 || o.value === activeCoating.value),
)

const seriesOptions = computed(() => {
  const counts = facetCounts(props.cards, filters.value, 'series')
  return props.series
    .map((o) => ({ ...o, count: counts.get(o.value) ?? 0 }))
    .filter((o) => o.count > 0 || o.value === activeSeries.value)
    .sort((a, b) =>
      coatingRank(coatingOfSeries.get(a.value) ?? '') - coatingRank(coatingOfSeries.get(b.value) ?? '') ||
      a.label.localeCompare(b.label, 'ru'))
})

const colorOptions = computed(() => {
  const counts = facetCounts(props.cards, filters.value, 'color')
  return props.colors
    .map((o) => ({ ...o, count: counts.get(o.value) ?? 0 }))
    .filter((o) => o.count > 0 || o.value === activeColor.value)
    .sort(byLightness)
})

const glassCount = computed(() => filterCards(props.cards, { ...filters.value, glass: true }).length)

/* ── Выбранные фильтры — снимаются по одному (покрытие видно в переключателе) ── */
const chips = computed(() => {
  const list: { key: 'series' | 'color' | 'glass' | 'query'; label: string }[] = []
  const series = props.series.find((s) => s.value === activeSeries.value)
  if (series) list.push({ key: 'series', label: `Серия ${series.label}` })
  if (activeColor.value) list.push({ key: 'color', label: activeColor.value })
  if (glassOnly.value) list.push({ key: 'glass', label: 'Со стеклом' })
  if (searchQuery.value) list.push({ key: 'query', label: `«${searchQuery.value}»` })
  return list
})
const removeChip = (key: (typeof chips.value)[number]['key']) => {
  if (key === 'series') activeSeries.value = ''
  else if (key === 'color') activeColor.value = ''
  else if (key === 'glass') glassOnly.value = false
  else searchQuery.value = ''
}
const panelFilterCount = computed(() => chips.value.length)

const resetFilters = () => {
  activeSeries.value  = ''
  activeCoating.value = ''
  activeColor.value   = ''
  glassOnly.value     = false
  searchQuery.value   = ''
}
const hasActiveFilters = computed(() => panelFilterCount.value > 0 || Boolean(activeCoating.value))

/* ── Страницы ── */
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCards.value.length / ITEMS_PER_PAGE)))
const pageStart = computed(() => (currentPage.value - 1) * ITEMS_PER_PAGE)
const paginatedCards = computed(() => filteredCards.value.slice(pageStart.value, pageStart.value + ITEMS_PER_PAGE))

const visiblePages = computed<Array<number | string>>(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
})

/* Новая страница — к началу сетки: иначе после «Далее» внизу страницы
   человек остаётся под новыми карточками */
const rootRef = ref<HTMLElement | null>(null)
const goToPage = async (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  await nextTick()
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
  rootRef.value?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}

watch([activeSeries, activeCoating, activeColor, glassOnly], ([series, coating, color, glass]) => {
  const url = new URL(window.location.href)
  const set = (key: string, value: string) => (value ? url.searchParams.set(key, value) : url.searchParams.delete(key))
  set('series', series)
  set('coating', coating)
  set('color', color)
  set('glass', glass ? '1' : '')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
})

watch([activeSeries, activeCoating, activeColor, glassOnly, searchQuery, sortBy], () => {
  currentPage.value = 1
})

/* ── Шторка фильтров на телефоне — модальный диалог ── */
const mobileFiltersOpen = ref(false)
const filtersLock = useScrollLock()
const filtersToggleRef = ref<HTMLButtonElement | null>(null)
const filtersCloseRef  = ref<HTMLButtonElement | null>(null)
watch(mobileFiltersOpen, async (open) => {
  if (open) {
    filtersLock.lock()
    await nextTick()
    filtersCloseRef.value?.focus()
  } else {
    filtersLock.unlock()
    filtersToggleRef.value?.focus({ preventScroll: true })
  }
})
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mobileFiltersOpen.value) mobileFiltersOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/* Teleport в серверно-отрисованном острове — только после монтирования,
   иначе гидратация не сходится (CLAUDE.md, Runtime conventions) */
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })
</script>

<template>
  <section ref="rootRef" class="cat" aria-labelledby="catalog-title">
    <h2 id="catalog-title" class="h-h2 cat__title" :class="{ 'sr-only': hideTitle }">{{ title }}</h2>

    <!-- Покрытие — главный выбор, поэтому переключателем над сеткой -->
    <div v-if="coatingOptions.length > 1" class="cat__coatings" role="group" aria-label="Покрытие">
      <button type="button" class="cat__coating" :aria-pressed="!activeCoating" @click="activeCoating = ''">
        Все <span class="cat__coating-count">{{ coatingTotal }}</span>
      </button>
      <button
        v-for="o in coatingOptions"
        :key="o.value"
        type="button"
        class="cat__coating"
        :aria-pressed="activeCoating === o.value"
        @click="activeCoating = activeCoating === o.value ? '' : o.value"
      >
        {{ o.label }} <span class="cat__coating-count">{{ o.count }}</span>
      </button>
    </div>

    <div class="cat__bar">
      <p class="cat__found" aria-live="polite">
        <strong>{{ filteredCards.length }}</strong> {{ modelsWord(filteredCards.length) }}
      </p>

      <ul v-if="chips.length" class="cat__chips" role="list" aria-label="Выбранные фильтры">
        <li v-for="chip in chips" :key="chip.key">
          <button type="button" class="cat__chip" :aria-label="`Убрать фильтр: ${chip.label}`" @click="removeChip(chip.key)">
            {{ chip.label }}
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
        </li>
        <li v-if="chips.length > 1">
          <button type="button" class="cat__reset" @click="resetFilters">Сбросить всё</button>
        </li>
      </ul>

      <div class="cat__tools">
        <button
          ref="filtersToggleRef"
          type="button"
          class="cat__tool cat__filters-btn"
          aria-haspopup="dialog"
          @click="mobileFiltersOpen = true"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M3 5.5h14M5.5 10h9M8 14.5h4" stroke-linecap="round" />
          </svg>
          Фильтры
          <span v-if="panelFilterCount" class="cat__badge">{{ panelFilterCount }}</span>
        </button>
        <label class="cat__tool cat__sort">
          <span class="sr-only">Порядок</span>
          <select v-model="sortBy" class="cat__select">
            <option value="popular">Популярные</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="name">По названию</option>
          </select>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </label>
      </div>
    </div>

    <div class="cat__layout">
      <aside class="cat__aside" aria-label="Фильтры каталога">
        <CatalogFilters
          v-model:active-series="activeSeries"
          v-model:active-color="activeColor"
          v-model:glass-only="glassOnly"
          v-model:search-query="searchQuery"
          :series="seriesOptions"
          :colors="colorOptions"
          :glass-count="glassCount"
        />
        <button v-if="hasActiveFilters" type="button" class="cat__reset cat__reset--aside" @click="resetFilters">Сбросить фильтры</button>
      </aside>

      <div class="cat__results">
        <CatalogEmptyState v-if="filteredCards.length === 0" @reset="resetFilters" />
        <CatalogGrid v-else :cards="paginatedCards" />

        <div v-if="totalPages > 1" class="cat__pages">
          <CatalogPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :visible-pages="visiblePages"
            @change="goToPage"
          />
          <p class="h-meta cat__range">
            {{ pageStart + 1 }}–{{ pageStart + paginatedCards.length }} из {{ filteredCards.length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Шторка фильтров на телефоне -->
    <Teleport v-if="isMounted" to="body">
      <Transition name="cat-fade">
        <div v-if="mobileFiltersOpen" class="cat-sheet__backdrop" @click="mobileFiltersOpen = false" />
      </Transition>
      <Transition name="cat-sheet">
        <div v-if="mobileFiltersOpen" class="home cat-sheet" role="dialog" aria-modal="true" aria-labelledby="cat-sheet-title">
          <div class="cat-sheet__head">
            <h2 id="cat-sheet-title" class="cat-sheet__title">Фильтры</h2>
            <button ref="filtersCloseRef" type="button" class="cat-sheet__close" aria-label="Закрыть фильтры" @click="mobileFiltersOpen = false">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
            </button>
          </div>
          <div class="cat-sheet__body">
            <CatalogFilters
              v-model:active-series="activeSeries"
              v-model:active-color="activeColor"
              v-model:glass-only="glassOnly"
              v-model:search-query="searchQuery"
              :series="seriesOptions"
              :colors="colorOptions"
              :glass-count="glassCount"
            />
          </div>
          <div class="cat-sheet__foot">
            <button v-if="panelFilterCount" type="button" class="h-btn h-btn--quiet cat-sheet__btn" @click="resetFilters">Сбросить</button>
            <button type="button" class="h-btn h-btn--ink cat-sheet__btn cat-sheet__btn--main" @click="mobileFiltersOpen = false">
              Показать {{ filteredCards.length }} {{ modelsWord(filteredCards.length) }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.cat { scroll-margin-top: calc(var(--header-height) + 1rem); }
.cat__title { margin-bottom: clamp(1.5rem, 3vw, 2rem); }

/* ── Переключатель покрытий ── */
.cat__coatings { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.cat__coating {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  min-height: 2.75rem;
  padding: 0 1.125rem;
  border: 0.0625rem solid var(--color-slate-300);
  border-radius: 999rem;
  background: none;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--h-ink);
  cursor: pointer;
  transition: background-color 180ms var(--ease-out), border-color 180ms var(--ease-out), color 180ms var(--ease-out);
}
.cat__coating:hover { border-color: var(--h-signal); color: var(--h-signal); }
.cat__coating[aria-pressed='true'] { border-color: var(--h-ink); background: var(--h-ink); color: var(--color-white); cursor: default; }
.cat__coating-count { font-size: 0.8125rem; font-weight: 500; color: var(--h-muted); font-variant-numeric: tabular-nums; transition: color 180ms var(--ease-out); }
.cat__coating:hover .cat__coating-count { color: inherit; }
.cat__coating[aria-pressed='true'] .cat__coating-count { color: var(--color-slate-400); }

/* ── Строка над сеткой: найдено, выбранные фильтры, порядок ── */
.cat__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin-top: 1.25rem;
  padding-block: 0.875rem;
  border-block: 0.0625rem solid var(--h-rule);
}
.cat__found { margin: 0; font-size: 0.9375rem; color: var(--h-soft); font-variant-numeric: tabular-nums; }
.cat__found strong { font-weight: 600; color: var(--h-ink); }

.cat__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: 0; padding: 0; list-style: none; }
.cat__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.25rem;
  padding: 0 0.625rem 0 0.875rem;
  border: 0;
  border-radius: 999rem;
  background: var(--h-wall);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--h-ink);
  cursor: pointer;
  transition: background-color 150ms var(--ease-out);
}
.cat__chip:hover { background: var(--color-slate-200); }
.cat__chip svg { width: 0.875rem; height: 0.875rem; color: var(--h-soft); }
.cat__reset {
  padding: 0.5rem 0.25rem;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--h-ink);
  text-decoration: underline;
  text-decoration-color: var(--color-slate-300);
  text-underline-offset: 0.3em;
  cursor: pointer;
}
.cat__reset:hover { text-decoration-color: var(--h-signal); }
.cat__reset--aside { margin-top: 1.25rem; padding-inline: 0; font-size: 0.875rem; }

.cat__tools { display: flex; gap: 0.5rem; margin-left: auto; }
.cat__tool {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  border: 0.0625rem solid var(--color-slate-300);
  border-radius: 999rem;
  background: var(--h-paper);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--h-ink);
  transition: border-color 180ms var(--ease-out);
}
.cat__tool:hover, .cat__tool:focus-within { border-color: var(--h-ink); }
.cat__tool svg { flex: none; width: 1.125rem; height: 1.125rem; }
.cat__filters-btn { padding: 0 1.125rem; font-family: inherit; cursor: pointer; }
.cat__badge {
  display: inline-grid;
  place-items: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 999rem;
  background: var(--h-ink);
  font-size: 0.75rem;
  color: var(--color-white);
  font-variant-numeric: tabular-nums;
}
.cat__sort { padding: 0; }
.cat__select {
  min-height: 2.75rem;
  padding: 0 2.5rem 0 1.125rem;
  border: 0;
  border-radius: 999rem;
  background: none;
  font: inherit;
  color: inherit;
  appearance: none;
  cursor: pointer;
}
.cat__select:focus-visible { outline: none; }
.cat__sort:has(.cat__select:focus-visible) { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }
.cat__sort svg { position: absolute; right: 1rem; width: 1rem; height: 1rem; pointer-events: none; }

/* ── Колонка фильтров и сетка ── */
.cat__layout { display: grid; gap: 2rem var(--h-gutter); align-items: start; margin-top: clamp(1.5rem, 3vw, 2rem); }
.cat__aside { display: none; }
@media (min-width: 62.5rem) {
  .cat__layout { grid-template-columns: 15rem minmax(0, 1fr); }
  .cat__filters-btn { display: none; }
  /* Липкая колонка; длиннее экрана — прокручивается сама */
  .cat__aside {
    position: sticky;
    top: calc(var(--header-height) + 1.25rem);
    display: block;
    max-height: calc(100dvh - var(--header-height) - 2.5rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    padding: 0.25rem 0.25rem 1rem;
    margin: -0.25rem;
  }
}
.cat__results { min-width: 0; }
.cat__pages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
  padding-top: clamp(1.5rem, 3vw, 2rem);
  border-top: 0.0625rem solid var(--h-rule);
}
.cat__range { margin: 0; }

/* Телефон: «Фильтры» и порядок — две равные кнопки во всю ширину */
@media (max-width: 47.9375rem) {
  .cat__bar { gap: 0.75rem; }
  .cat__tools { order: -1; width: 100%; margin-left: 0; }
  .cat__tool { flex: 1; justify-content: center; font-size: 0.875rem; }
  .cat__select { width: 100%; text-align: center; text-align-last: center; padding-inline: 1rem 2.25rem; }
  .cat__coatings { gap: 0.375rem; }
  .cat__coating { min-height: 2.5rem; padding: 0 0.875rem; font-size: 0.875rem; }
}

.cat :is(button):focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.1875rem; }

@media (prefers-reduced-motion: reduce) {
  .cat__coating, .cat__coating-count, .cat__chip, .cat__tool { transition: none; }
}
</style>

<!-- Шторка уходит в <body> через Teleport — scoped-стили до неё не
     достают, поэтому отдельный блок с уникальным префиксом -->
<style>
.cat-sheet__backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: color-mix(in srgb, var(--color-slate-950) 40%, transparent);
}
.cat-sheet {
  position: fixed;
  inset: auto 0 0;
  z-index: 61;
  display: flex;
  flex-direction: column;
  max-height: 88dvh;
  border-radius: 1.25rem 1.25rem 0 0;
  background: var(--color-white);
}
.cat-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  border-bottom: 0.0625rem solid var(--color-slate-200);
}
.cat-sheet__title { margin: 0; font-size: 1.1875rem; font-weight: 600; letter-spacing: -0.015em; color: var(--color-slate-900); }
.cat-sheet__close {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--color-slate-600);
  cursor: pointer;
}
.cat-sheet__close:hover { background: var(--color-slate-100); }
.cat-sheet__close svg { width: 1.25rem; height: 1.25rem; }
.cat-sheet__body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 1rem 1.25rem 1.5rem; }
.cat-sheet__foot {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem max(0.75rem, env(safe-area-inset-bottom));
  border-top: 0.0625rem solid var(--color-slate-200);
}
.cat-sheet__btn { border: 0.0625rem solid transparent; font-family: inherit; cursor: pointer; }
.cat-sheet__btn.h-btn--quiet { border-color: var(--color-slate-300); background: none; }
.cat-sheet__btn--main { flex: 1; }
.cat-sheet :is(button):focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }

.cat-sheet-enter-active, .cat-sheet-leave-active { transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1); }
.cat-sheet-enter-from, .cat-sheet-leave-to { transform: translateY(100%); }
.cat-fade-enter-active, .cat-fade-leave-active { transition: opacity 250ms ease; }
.cat-fade-enter-from, .cat-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .cat-sheet-enter-active, .cat-sheet-leave-active, .cat-fade-enter-active, .cat-fade-leave-active { transition: none; }
}
</style>
