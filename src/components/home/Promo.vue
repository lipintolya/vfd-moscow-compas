<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Promo } from '../../data/promos'
import { PHONE, SITE } from '../../config/site'
import { telegramWithText, TELEGRAM_CHAT } from '../../lib/messengers'
import { sortPromos, isPromoActive, getDaysLeft, formatDate } from '../../lib/promo-dates'

/* ============================================================
   Props — акции из Strapi (коллекция promos; страница передаёт их
   при сборке). Блок показывает действующие; пока их нет, на главной
   блока нет, а на /akcii/ (page) — короткий ответ вместо пустоты.
   ============================================================ */
const props = defineProps<{
  promos: Promo[]
  /** Страница /akcii/: заголовок h1, все акции, ссылка на архив */
  page?: boolean
}>()

/** На главной — не больше стольких карточек (первая крупная); остальные на /akcii/ */
const HOME_LIMIT = 6

/* Число дней «осталось» и «акция уже закончилась» зависят от new Date() — на
   сервере это момент сборки, у клиента момент захода на сайт, обычно разные
   дни. Считать это прямо в первом рендере нельзя: хайдрейшн не совпадёт с
   серверным ("Hydration completed but contains mismatches"). Страница
   передаёт уже отфильтрованные при сборке акции; «осталось» и уход истёкшей
   (статическая страница живёт дольше акции) — только после mounted, как
   обычное реактивное обновление. */
const clientReady = ref(false)
onMounted(() => { clientReady.value = true })

const activePromos = computed(() => {
  const sorted = sortPromos(props.promos)
  return clientReady.value ? sorted.filter((p) => isPromoActive(p.validUntil)) : sorted
})
const shown = computed(() => (props.page ? activePromos.value : activePromos.value.slice(0, HOME_LIMIT)))
const hasMore = computed(() => !props.page && activePromos.value.length > HOME_LIMIT)

/* Последний день из показанных акций — для подзаголовка («до 31 декабря 2026 года») */
const lastDay = computed(() => shown.value.map((p) => p.validUntil).sort().at(-1) ?? '')
const sameDeadline = computed(() => shown.value.length > 0 && shown.value.every((p) => p.validUntil === lastDay.value))

const askText = computed(() => `Хочу уточнить условия акций${lastDay.value ? ` до ${formatDate(lastDay.value)}` : ''}.`)
const askUrl = computed(() => telegramWithText(askText.value))
</script>

<template>
  <!-- Оформление — по дизайн-системе главной (src/styles/home.css): без рамок
       и теней, подпись под баннером, графит. Баннер показывается целиком, по
       своим пропорциям: на нём текст акции, обрезка недопустима. Без баннера
       карточка — графитовая плашка со скидкой крупно. -->
  <section
    v-if="shown.length || page"
    id="promo"
    class="h-sec h-sec--wall"
    aria-labelledby="promo-heading"
  >
    <div class="container">
      <header class="h-head">
        <component :is="page ? 'h1' : 'h2'" id="promo-heading" :class="page ? 'h-h1' : 'h-h2'">Акции салона</component>
        <p v-if="shown.length" class="h-lead">
          Действуют в салоне {{ SITE.name }} в {{ SITE.address.mall }}<template v-if="sameDeadline"> до {{ formatDate(lastDay) }}</template>.
          Условия и&nbsp;сроки — в&nbsp;описании каждой акции.
        </p>
        <p v-else class="h-lead">
          Сейчас действующих акций нет. Новые появятся здесь; завершённые — в <a href="/promo-archive/" class="h-link">архиве</a>.
        </p>
      </header>

      <ul v-if="shown.length" class="offers" :class="{ 'offers--single': shown.length === 1 }" role="list">
        <template v-for="(promo, i) in shown" :key="promo.id">
          <li class="offer" :class="{ 'offer--lead': i === 0 && shown.length > 1 }">
            <span class="offer__media" :class="{ 'offer__media--poster': !promo.image }">
              <img
                v-if="promo.image"
                :src="promo.image"
                :srcset="promo.imageSrcset"
                :sizes="i === 0 ? '(max-width: 56.1875rem) 90vw, 40vw' : '(max-width: 43.6875rem) 82vw, (max-width: 68.6875rem) 50vw, 33vw'"
                :alt="promo.title"
                :loading="props.page && i < 3 ? 'eager' : 'lazy'"
                decoding="async"
                :width="promo.imageWidth"
                :height="promo.imageHeight"
              />
              <span v-else class="offer__poster">{{ promo.discount || promo.title }}</span>
            </span>

            <div class="offer__body">
              <p class="offer__meta h-meta">
                <time :datetime="promo.validUntil">
                  до {{ formatDate(promo.validUntil) }}<template v-if="clientReady">, осталось {{ getDaysLeft(promo.validUntil) }} дн.</template>
                </time>
              </p>
              <h3 class="h-h3 offer__title">{{ promo.title }}</h3>
              <p class="h-body offer__sub">{{ promo.subtitle }}</p>
              <p v-if="promo.description" class="h-body offer__desc">{{ promo.description }}</p>
              <p v-if="promo.ctaText" class="offer__actions">
                <a :href="promo.ctaLink || '#'" class="h-link">{{ promo.ctaText }}</a>
              </p>
            </div>
          </li>
        </template>

        <!-- Последняя ячейка — как получить: условия называет менеджер -->
        <li v-if="shown.length > 1" class="offer offer--ask">
          <h3 class="h-h3 offer__title">Расскажем, какая акция подойдёт</h3>
          <p class="h-body offer__sub">Позвоните или напишите: уточним условия и&nbsp;посчитаем ваш заказ.</p>
          <p class="offer__ask-actions">
            <a :href="`tel:${PHONE.raw}`" class="h-btn h-btn--ink">Позвонить {{ PHONE.label }}</a>
            <a v-if="TELEGRAM_CHAT" :href="askUrl" class="h-link" target="_blank" rel="noopener">Написать в Telegram</a>
          </p>
        </li>
      </ul>

      <p v-if="hasMore" class="offers__all">
        <a href="/akcii/" class="h-link">Все акции</a>
      </p>
      <p v-if="page && shown.length" class="offers__all">
        Завершённые акции — в <a href="/promo-archive/" class="h-link">архиве</a>.
      </p>
    </div>
  </section>
</template>

<style scoped>
.offers {
  display: grid;
  gap: 3rem var(--h-gutter);
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 43.75rem) { .offers { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 68.75rem) { .offers { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.offer { display: flex; flex-direction: column; min-width: 0; }
.offer__media { display: block; overflow: hidden; background: var(--color-slate-200); }
.offer__media img { display: block; width: 100%; height: auto; }

/* Без баннера — графитовая плашка: скидка крупно, в углу, как на ценнике */
.offer__media--poster {
  display: flex;
  align-items: flex-end;
  aspect-ratio: 3 / 2;
  padding: clamp(1rem, 2.2vw, 1.5rem);
  background: var(--h-ink);
  color: var(--color-white);
}
.offer__poster {
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.offer__meta { margin: 1.25rem 0 0; }
.offer__title { margin-top: 0.5rem; }
.offer__sub { margin-top: 0.375rem; font-size: 0.9375rem; font-weight: 600; color: var(--h-ink); }
.offer__desc { margin-top: 0.625rem; font-size: 0.9375rem; }
.offer__actions { margin: 1rem 0 0; font-size: 0.9375rem; }

/* Первая акция — разворот на всю ширину: баннер слева, текст справа */
@media (min-width: 56.25rem) {
  .offer--lead,
  .offers--single .offer {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--h-gutter);
    align-items: center;
  }
  .offer--lead .offer__media,
  .offers--single .offer__media { grid-column: 1 / span 5; }
  .offer--lead .offer__media--poster,
  .offers--single .offer__media--poster { aspect-ratio: 5 / 4; }
  .offer--lead .offer__body,
  .offers--single .offer__body { grid-column: 7 / span 6; }
  .offer--lead .offer__meta,
  .offers--single .offer__meta { margin-top: 0; }
  .offer--lead .offer__title,
  .offers--single .offer__title { font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing: -0.03em; }
  .offer--lead .offer__sub,
  .offers--single .offer__sub { font-size: 1.125rem; }
  .offer--lead .offer__poster,
  .offers--single .offer__poster { font-size: clamp(2.5rem, 5vw, 4rem); }
}

/* Ячейка «как получить» — тот же столбец, без картинки; ссылка и кнопка в ряд */
.offer--ask { justify-content: flex-start; }
.offer--ask .offer__title { margin-top: 0; }
.offer__ask-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; margin: 1.25rem 0 0; font-size: 0.9375rem; }

.offers__all { margin: 2.5rem 0 0; }
.offers__all + .offers__all { margin-top: 1rem; }

/* Телефон: лента с прокруткой вбок вместо длинного столбика — край следующей
   карточки подсказывает, что ряд листается. */
@media (max-width: 43.6875rem) {
  .offers {
    grid-auto-flow: column;
    grid-auto-columns: 82%;
    gap: 0.75rem;
    margin-inline: calc(-1 * var(--h-pad));
    padding-inline: var(--h-pad);
    scroll-padding-inline: var(--h-pad);
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .offers::-webkit-scrollbar { display: none; }
  .offers > li { scroll-snap-align: start; }
  .offers--single { grid-auto-columns: 100%; }
}
</style>
