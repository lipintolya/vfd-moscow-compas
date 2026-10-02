<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Promo } from '../../data/promos'
import { isPromoActive, formatDate } from '../../lib/promo-dates'

/* ============================================================
   Всплывающий баннер акции — дублирует карточку из Promo.vue
   на профильной странице товара, чтобы посетитель не пропустил
   скидку, даже если пришёл не с главной (поиск, соцсети, реклама).

   client:only="vue": страница уже полностью содержит цены и акцию
   текстом в описании ("Секрет" по кромке...) — баннер чисто
   декоративный триггер, не несёт уникального SEO-контента, поэтому
   не нужен в SSR-разметке. Заодно обходит класс hydration-mismatch
   багов у Teleport/условного рендера на SSR-компонентах (см. фикс
   Reviews.vue) — тут его просто нет по конструкции.
   ============================================================ */
const props = defineProps<{
  promo: Promo
  /** Якорь на этой же странице, куда ведёт «Подробнее» — без хэша */
  anchor?: string
}>()

const STORAGE_KEY = `promo-banner-dismissed-${props.promo.id}`
const visible = ref(false)

onMounted(() => {
  if (!isPromoActive(props.promo.validUntil)) return
  if (sessionStorage.getItem(STORAGE_KEY)) return
  setTimeout(() => { visible.value = true }, 1200)
})

const dismiss = () => {
  visible.value = false
  sessionStorage.setItem(STORAGE_KEY, '1')
}

const onDetailsClick = () => {
  sessionStorage.setItem(STORAGE_KEY, '1')
  visible.value = false
}
</script>

<template>
  <Transition name="promo-banner-fade">
    <div
      v-if="visible"
      class="promo-banner"
      role="dialog"
      aria-labelledby="promo-banner-title"
    >
      <button type="button" class="promo-banner__close" aria-label="Закрыть" @click="dismiss">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <span v-if="promo.discount" class="promo-banner__badge">{{ promo.discount }}</span>

      <p id="promo-banner-title" class="promo-banner__title">{{ promo.title }}</p>
      <p class="promo-banner__subtitle">{{ promo.subtitle }}</p>
      <p class="promo-banner__note">До {{ formatDate(promo.validUntil) }}</p>

      <a
        v-if="anchor"
        :href="`#${anchor}`"
        class="promo-banner__cta"
        @click="onDetailsClick"
      >
        Смотреть цены
        <svg viewBox="0 0 16 16" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>
  </Transition>
</template>

<style scoped>
.promo-banner {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 9000;
  width: min(21rem, calc(100vw - 2rem));
  padding: 1.25rem 1.5rem 1.5rem;
  border-radius: 1.25rem;
  background: var(--color-graphite);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.promo-banner__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.promo-banner__close:hover { background: rgba(255, 255, 255, 0.16); color: #fff; }
.promo-banner__close svg { width: 1rem; height: 1rem; }

.promo-banner__badge {
  display: inline-flex;
  padding: 0.3rem 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 9999px;
  background: #0d9488;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
}
.promo-banner__title {
  margin: 0 0 0.25rem;
  padding-right: 1.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.25;
  color: #fff;
}
.promo-banner__subtitle {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #2dd4bf;
  font-weight: 500;
}
.promo-banner__note {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}
.promo-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding: 0.6rem 1.1rem;
  border-radius: 9999px;
  background: #fff;
  color: #0f172a;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 150ms ease;
}
.promo-banner__cta:hover { background: #2dd4bf; }

.promo-banner-fade-enter-active,
.promo-banner-fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}
.promo-banner-fade-enter-from,
.promo-banner-fade-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
@media (prefers-reduced-motion: reduce) {
  .promo-banner-fade-enter-active,
  .promo-banner-fade-leave-active { transition: none; }
}

/* Не перекрывает cookie-баннер (bottom-left) — держим справа всегда,
   но на узких экранах, если оба видны, банер акции должен быть выше
   по стеку и не залезать за пределы экрана. */
@media (max-width: 480px) {
  .promo-banner { left: 1rem; right: 1rem; width: auto; bottom: 5.5rem; }
}
</style>
