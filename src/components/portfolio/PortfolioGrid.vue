<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { PortfolioWork, WorkCategory } from '../../data/portfolio-works'
import { CATEGORY_LABELS, CATEGORY_PAGES } from '../../data/portfolio-works'

const props = defineProps<{ works: PortfolioWork[] }>()

type FilterKey = WorkCategory | 'all'

/* Категории — из данных (CATEGORY_LABELS): новый раздел появляется здесь сам */
const CATEGORIES = Object.keys(CATEGORY_LABELS) as WorkCategory[]
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все работы' },
  ...CATEGORIES.map((key) => ({ key, label: CATEGORY_LABELS[key] })),
]

const active = ref<FilterKey>('all')

const filtered = computed(() =>
  active.value === 'all'
    ? props.works
    : props.works.filter(w => w.category === active.value)
)

const countOf = (key: WorkCategory) => props.works.filter(w => w.category === key).length

const gridEl = ref<HTMLElement | null>(null)
function selectAndScroll(key: FilterKey) {
  active.value = key
  nextTick(() => gridEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

/* Обложка категории — обложка самой свежей работы этой категории (копия
   из Strapi); пока работ нет — снимок модели из каталога (честнее пустого
   квадрата). */
const CATEGORY_FALLBACK: Record<WorkCategory, string> = {
  interior:   '/renders/home/tehno-1.webp',
  hidden:     '/renders/home/secret-2.webp',
  partitions: '/renders/alum-covers/3.webp',
  walls:      '/renders/home/videos/work-panel-door.webp',
}
const coverOf = (key: WorkCategory) => {
  const work = props.works.find((w) => w.category === key)
  return work ? work.cover : { src: CATEGORY_FALLBACK[key], srcset: undefined }
}
const worksWord = (n: number) => {
  const d = n % 10, h = n % 100
  if (d === 1 && h !== 11) return 'работа'
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'работы'
  return 'работ'
}
const CATEGORY_HREF: Partial<Record<WorkCategory, string>> = {
  partitions: '/partitions/',
}
/* Плитка ведёт на страницу раздела (CATEGORY_PAGES), иначе — на фильтр ниже */
const hrefOf = (key: WorkCategory) => CATEGORY_PAGES[key] ?? CATEGORY_HREF[key]
</script>

<template>
  <div class="pf-root">
    <!-- Фильтр — тихие текстовые вкладки, не заливные пилюли: активная
         состояние читается подчёркиванием, а не блоком чёрного цвета. -->
    <div class="pf-tabs" role="tablist">
      <button
        v-for="f in FILTERS"
        :key="f.key"
        role="tab"
        :aria-selected="active === f.key"
        @click="active = f.key"
        class="pf-tab"
        :class="{ 'pf-tab--active': active === f.key }"
      >
        {{ f.label }}
      </button>
    </div>

    <p class="pf-count">Показано {{ filtered.length }} из {{ works.length }} {{ works.length % 10 === 1 && works.length % 100 !== 11 ? 'работы' : 'работ' }}</p>

    <!-- Строка категорий — квадратные образцы (снимок + подпись + счётчик),
         не постеры с градиентом: это навигация, а не витрина. -->
    <ul class="pf-cat-row" role="list">
      <li v-for="key in CATEGORIES" :key="key">
        <a
          :href="hrefOf(key)"
          class="pf-cat"
          @click="(e) => { if (!hrefOf(key)) { e.preventDefault(); selectAndScroll(key) } }"
        >
          <span class="pf-cat__thumb">
            <img :src="coverOf(key).src" :srcset="coverOf(key).srcset" sizes="(min-width: 640px) 25vw, 50vw" :alt="CATEGORY_LABELS[key]" loading="lazy" decoding="async" />
          </span>
          <span class="pf-cat__label">{{ CATEGORY_LABELS[key] }}</span>
          <span class="pf-cat__count">{{ CATEGORY_HREF[key] ? 'В каталоге' : `${countOf(key)} ${worksWord(countOf(key))}` }}</span>
        </a>
      </li>
    </ul>

    <!-- Архивная сетка: фото без затемнения, подпись под кадром, как в
         печатном портфолио — не постер с текстом поверх снимка. Портретная
         пропорция 3:4 стабильна для всех карточек — ряд карточек читается
         как ряд дверных полотен, а не произвольная фотогалерея. -->
    <div ref="gridEl" class="pf-grid scroll-mt-24">
      <a v-for="(work, index) in filtered" :key="work.id" :href="`/portfolio/${work.id}/`" class="pf-card group h-card">
        <span class="pf-card__frame">
          <img
            :src="work.cover.src"
            :srcset="work.cover.srcset"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            :alt="work.title"
            :loading="index < 4 ? 'eager' : 'lazy'"
            :fetchpriority="index < 4 ? 'high' : undefined"
            decoding="async"
            class="pf-card__img"
          />
          <span v-if="work.images.length > 1" class="h-photocount" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><rect x="5" y="2.5" width="9" height="9" rx="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M3 5.5v6.2a1.8 1.8 0 0 0 1.8 1.8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            {{ work.images.length }} фото
          </span>
          <span class="h-go" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M5 11 11 5M6 5h5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </span>
        <span class="pf-card__caption">
          <span class="pf-card__title">{{ work.title }}</span>
          <span class="pf-card__meta">
            <span class="pf-card__cat">{{ CATEGORY_LABELS[work.category] }}</span>
            <span class="pf-card__date">{{ work.label }}</span>
          </span>
          <span class="h-more">
            {{ work.images.length > 1 ? `Смотреть ${work.images.length} фото` : 'Смотреть работу' }}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </span>
      </a>
    </div>

    <p v-if="filtered.length === 0" class="pf-empty">Работ по этой категории пока нет.</p>
  </div>
</template>

<style scoped>
/* Токены и типографика — дизайн-система (home.css, класс .home на странице):
   цвета — --h-*, шрифт — --h-font, поля — --h-gutter. Сетка — по тем же
   брейкпоинтам, что у блоков главной (56.25rem = 900px). */
.pf-root { font-family: var(--h-font); color: var(--h-ink); }

/* ── Фильтр-вкладки: тихие текстовые, активная — подчёркиванием ── */
.pf-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.75rem;
  border-bottom: 0.0625rem solid var(--h-rule);
  margin-bottom: 1.5rem;
}
.pf-tab {
  position: relative;
  padding: 0.75rem 0.125rem;
  font: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--h-muted);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 150ms ease;
}
.pf-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.0625rem;
  height: 0.125rem;
  background: var(--h-signal);
  transform: scaleX(0);
  transition: transform 200ms ease;
}
.pf-tab:hover { color: var(--h-ink); }
.pf-tab:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; border-radius: 0.25rem; }
.pf-tab--active { color: var(--h-ink); }
.pf-tab--active::after { transform: scaleX(1); }

.pf-count { margin: 0 0 2rem; }

/* ── Строка категорий: плитки-навигация со снимком ── */
.pf-cat-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem var(--h-gutter);
  margin: 0 0 3rem;
  padding: 0;
  list-style: none;
}
.pf-cat-row > li { min-width: 0; }
/* Категорий четыре: две колонки на планшете, четыре в ряд на компьютере */
@media (min-width: 40rem) { .pf-cat-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 80rem) { .pf-cat-row { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.pf-cat {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  padding: 0.5rem;
  border: 0.0625rem solid var(--h-rule);
  border-radius: var(--h-radius);
  color: var(--h-ink);
  text-decoration: none;
  transition: border-color 200ms ease, background-color 200ms ease;
}
.pf-cat:hover {
  border-color: var(--h-signal);
  background: var(--h-wall);
}
.pf-cat:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.125rem; }
.pf-cat__thumb {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--h-media-bg);
}
.pf-cat__thumb img { width: 100%; height: 100%; object-fit: cover; }
.pf-cat__label {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pf-cat__count {
  display: none;
  flex-shrink: 0;
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--h-muted);
  white-space: nowrap;
}
@media (min-width: 30rem) { .pf-cat__count { display: inline; } }

/* ── Сетка работ: портретные кадры 3:4, подпись под каждым ── */
.pf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem var(--h-gutter);
}
@media (min-width: 56.25rem) { .pf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.pf-card {
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}
.pf-card__frame {
  display: block;
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--h-radius);
  background: var(--h-media-bg);
}
.pf-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pf-card:hover .pf-card__img { transform: scale(1.025); }
.pf-card:focus-visible { outline: 0.125rem solid var(--color-secondary-500); outline-offset: 0.25rem; border-radius: var(--h-radius); }

.pf-card__caption { display: block; padding-top: 0.875rem; }
.pf-card__title {
  display: block;
  overflow-wrap: break-word;
  text-wrap: balance;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--h-ink);
  transition: color 150ms ease;
}
.pf-card:hover .pf-card__title { color: var(--h-signal); }

.pf-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
  margin-top: 0.5rem;
}
@media (min-width: 40rem) { .pf-card__meta { flex-wrap: nowrap; justify-content: space-between; } }
.pf-card__cat {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--h-soft);
}
.pf-card__date {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--h-muted);
}

.pf-empty {
  margin: 0;
  padding: 3rem 0;
  text-align: center;
  font-size: 1rem;
  color: var(--h-soft);
}
</style>
