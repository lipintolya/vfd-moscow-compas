<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { PortfolioWork, WorkCategory } from '../../data/portfolio-works'
import { CATEGORY_LABELS } from '../../data/portfolio-works'

const props = defineProps<{ works: PortfolioWork[] }>()

type FilterKey = WorkCategory | 'all'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'Все работы' },
  { key: 'interior',   label: CATEGORY_LABELS.interior },
  { key: 'hidden',     label: CATEGORY_LABELS.hidden },
  { key: 'partitions', label: CATEGORY_LABELS.partitions },
  { key: 'entrance',   label: CATEGORY_LABELS.entrance },
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

/* Обложки для строки категорий — рендеры реальных работ (интерьер, скрытые
   двери) и, там где готовых фотоотчётов ещё нет (перегородки, входные),
   рендер модели из каталога — честнее пустого состояния фильтра. */
const CATEGORY_COVERS: Record<WorkCategory, string> = {
  interior:   '/renders/portfolio/2026-03-12-urban-1-beton-antik-loft.webp',
  hidden:     '/renders/portfolio/2026-01-05-sekret-chernaya-kromka.webp',
  partitions: '/renders/alum-covers/3.webp',
  entrance:   '/renders/portfolio/category-entrance.webp',
}
const CATEGORY_HREF: Partial<Record<WorkCategory, string>> = {
  partitions: '/partitions/',
  entrance:   '/vhodnye-dveri/',
}
</script>

<template>
  <div>
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

    <p class="pf-count">Показано {{ filtered.length }} из {{ works.length }} работ</p>

    <!-- Строка категорий — квадратные образцы (снимок + подпись + счётчик),
         не постеры с градиентом: это навигация, а не витрина. -->
    <ul class="pf-cat-row" role="list">
      <li v-for="key in (['interior','hidden','partitions','entrance'] as WorkCategory[])" :key="key">
        <a
          :href="CATEGORY_HREF[key]"
          class="pf-cat"
          @click="(e) => { if (!CATEGORY_HREF[key]) { e.preventDefault(); selectAndScroll(key) } }"
        >
          <span class="pf-cat__thumb">
            <img :src="CATEGORY_COVERS[key]" :alt="CATEGORY_LABELS[key]" loading="lazy" decoding="async" />
          </span>
          <span class="pf-cat__label">{{ CATEGORY_LABELS[key] }}</span>
          <span class="pf-cat__count">{{ CATEGORY_HREF[key] ? 'В каталоге' : `${countOf(key)} ${countOf(key) === 1 ? 'работа' : 'работ'}` }}</span>
        </a>
      </li>
    </ul>

    <!-- Архивная сетка: фото без затемнения, подпись под кадром, как в
         печатном портфолио — не постер с текстом поверх снимка. Портретная
         пропорция 3:4 стабильна для всех карточек — ряд карточек читается
         как ряд дверных полотен, а не произвольная фотогалерея. -->
    <div ref="gridEl" class="pf-grid scroll-mt-24">
      <a v-for="(work, index) in filtered" :key="work.id" :href="`/portfolio/${work.id}/`" class="pf-card group">
        <span class="pf-card__frame">
          <img
            :src="`/renders/portfolio/${work.id}.webp`"
            :alt="work.title"
            :loading="index < 4 ? 'eager' : 'lazy'"
            :fetchpriority="index < 4 ? 'high' : undefined"
            decoding="async"
            class="pf-card__img"
          />
        </span>
        <span class="pf-card__caption">
          <span class="pf-card__title">{{ work.title }}</span>
          <span class="pf-card__meta">
            <span class="pf-card__cat">{{ CATEGORY_LABELS[work.category] }}</span>
            <span class="pf-card__date">{{ work.label }}</span>
          </span>
        </span>
      </a>
    </div>

    <p v-if="filtered.length === 0" class="pf-empty">Работ по этой категории пока нет.</p>
  </div>
</template>

<style scoped>
/* ── Фильтр-вкладки ── */
.pf-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}
.pf-tab {
  position: relative;
  padding: 0.625rem 0.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-fg-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 150ms ease;
}
.pf-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transition: transform 200ms ease;
}
.pf-tab:hover { color: var(--color-ink); }
.pf-tab--active { color: var(--color-ink); }
.pf-tab--active::after { transform: scaleX(1); }

.pf-count {
  font-size: 0.8125rem;
  color: var(--color-fg-subtle);
  margin-bottom: 2rem;
}

/* ── Строка категорий ── */
.pf-cat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 3rem;
  padding: 0;
  list-style: none;
}
.pf-cat-row > li { min-width: 0; }
@media (min-width: 640px) {
  .pf-cat-row { grid-template-columns: repeat(4, 1fr); }
}
.pf-cat {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  padding: 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  text-decoration: none;
  transition: border-color 200ms ease, background-color 200ms ease;
}
.pf-cat:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}
.pf-cat__thumb {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f1f0ec;
}
.pf-cat__thumb img { width: 100%; height: 100%; object-fit: cover; }
.pf-cat__label {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  min-width: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pf-cat__count {
  display: none;
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-fg-subtle);
  white-space: nowrap;
}
@media (min-width: 480px) {
  .pf-cat__count { display: inline; margin-left: auto; }
}

/* ── Архивная сетка ── */
.pf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem 1.25rem;
}
@media (min-width: 640px) { .pf-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .pf-grid { grid-template-columns: repeat(4, 1fr); } }

.pf-card {
  display: block;
  min-width: 0;
  text-decoration: none;
}
.pf-card__frame {
  display: block;
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #f1f0ec;
}
.pf-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pf-card:hover .pf-card__img { transform: scale(1.045); }

.pf-card__caption {
  display: block;
  padding-top: 0.75rem;
}
.pf-card__title {
  display: block;
  overflow-wrap: break-word;
  text-wrap: balance;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-ink);
  transition: color 150ms ease;
}
.pf-card:hover .pf-card__title { color: var(--color-accent-hover); }

.pf-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
  margin-top: 0.375rem;
}
@media (min-width: 640px) { .pf-card__meta { flex-wrap: nowrap; justify-content: space-between; } }
.pf-card__cat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-fg-subtle);
}
.pf-card__date {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-fg-subtle);
}

.pf-empty {
  padding: 3rem 0;
  text-align: center;
  font-size: 1rem;
  color: var(--color-fg-muted);
}
</style>
