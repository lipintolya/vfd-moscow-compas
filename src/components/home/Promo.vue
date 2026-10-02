<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { PROMOS, type Promo } from '../../data/promos'
import { isPromoActive, getDaysLeft, formatDate } from '../../lib/promo-dates'

/* ============================================================
   Props — можно переопределить список извне, иначе берём общий
   PROMOS (тот же источник, что и /promo-archive для истёкших)
   ============================================================ */
const props = withDefaults(defineProps<{
  promos?: Promo[]
}>(), {
  promos: () => PROMOS,
})

/* ============================================================
   Computed & State
   ============================================================ */
const activePromos = computed(() => props.promos.filter(p => isPromoActive(p.validUntil)))

/* Число дней "осталось" зависит от new Date() — на сервере это момент сборки,
   у клиента момент захода на сайт, обычно разные дни. Если считать прямо в
   шаблоне, первый клиентский рендер (хайдрейшн) не совпадёт с серверным —
   Vue ругается "Hydration completed but contains mismatches". Показываем
   плейсхолдер, пока не смонтировались, тогда серверный и первый клиентский
   рендер идентичны — а разница появляется уже после хайдрейшна, как обычное
   реактивное обновление, а не расхождение. */
const clientReady = ref(false)
onMounted(() => { clientReady.value = true })


/* Секция показывает только первые 3 акции (остальные — на /akcii/), но
   раньше рендерились все activePromos через v-show="index < 3": скрытые
   карточки оставались в DOM, а их <img loading="lazy"> всё равно грузились
   браузером в части случаев (display:none не всегда исключает элемент из
   lazy-loading intersection). Срез по .slice() не создаёт лишний DOM и не
   качает картинки, которые пользователь не увидит. */
const visiblePromos = computed(() => activePromos.value.slice(0, 3))

/* Описание скрыто за кнопкой «Узнать больше» — карточки короче и не давят
   текстом, картинка при этом крупнее (см. h-96 ниже), чтобы карточка не
   выглядела куце. Set пересоздаём целиком на каждый toggle — мутация
   add/delete на месте не триггерит реактивность ref(Set). */
const expandedIds = ref(new Set<string>())
function toggleExpanded(id: string) {
  const next = new Set(expandedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedIds.value = next
}

</script>

<template>
  <!-- Оформление — по дизайн-системе главной (src/styles/home.css):
       подпись под фото, без рамок/теней, ссылки графитовые. -->
  <section
    id="promo"
    class="h-sec h-sec--wall"
    aria-labelledby="promo-heading"
  >
    <div class="container">
      <header class="h-head">
        <h2 id="promo-heading" class="h-h2">Акции салона</h2>
        <p class="h-lead">Действуют в салоне ВФД в ТЦ «Компас». Условия и сроки — в описании каждой акции.</p>
      </header>

      <p v-if="activePromos.length === 0" class="h-lead">
        Сейчас акций нет. Актуальные цены — в <a href="/catalog/" class="h-link">каталоге</a>.
      </p>

      <ul v-else class="offers" :class="{ 'offers--single': visiblePromos.length === 1 }" role="list">
        <li v-for="promo in visiblePromos" :key="promo.id" class="offer">
          <span class="h-media offer__media" :class="{ 'offer__media--empty': !promo.image }">
            <span v-if="!promo.image" class="offer__noimg">Фото акции</span>
            <img
              v-else
              :src="promo.image"
              :srcset="promo.imageSrcset"
              sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 33vw"
              :alt="promo.title"
              loading="lazy"
              decoding="async"
              width="600"
              height="450"
            />
          </span>

          <div class="offer__body">
          <p v-if="!promo.placeholder" class="offer__meta h-meta">
            <span v-if="promo.discount" class="offer__discount">{{ promo.discount }}</span>
            <time :datetime="promo.validUntil">
              до {{ formatDate(promo.validUntil) }}<template v-if="clientReady">, осталось {{ getDaysLeft(promo.validUntil) }} дн.</template>
            </time>
          </p>
          <!-- Заглушка — не заголовок: «Название акции» не должно попасть
               в структуру страницы для поисковиков -->
          <component :is="promo.placeholder ? 'p' : 'h3'" class="h-h3 offer__title" :class="{ 'offer__title--first': promo.placeholder }">{{ promo.title }}</component>
          <p class="h-body offer__sub">{{ promo.subtitle }}</p>

          <p v-if="expandedIds.has(promo.id)" class="h-body offer__desc">{{ promo.description }}</p>

          <div v-if="!promo.placeholder" class="offer__actions">
            <button
              type="button"
              class="h-link offer__toggle"
              :aria-expanded="expandedIds.has(promo.id)"
              @click="toggleExpanded(promo.id)"
            >
              {{ expandedIds.has(promo.id) ? 'Скрыть условия' : 'Условия акции' }}
            </button>
            <a v-if="promo.ctaText" :href="promo.ctaLink || '#'" class="h-link">{{ promo.ctaText }}</a>
          </div>
          </div>
        </li>
      </ul>

      <!-- Секция показывает первые 3 акции — остальные на /akcii/. -->
      <p v-if="activePromos.length > 3" class="offers__all">
        <a href="/akcii/" class="h-link">Все акции</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.offers {
  display: grid;
  gap: 3rem var(--h-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 700px) { .offers { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .offers { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.offer { display: flex; flex-direction: column; }
/* Одна акция — не одинокая карточка в трети ширины, а разворот:
   фото на 7 колонок, текст — справа по нижнему краю. */
@media (min-width: 900px) {
  .offers--single { grid-template-columns: 1fr; }
  .offers--single .offer {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--h-gutter);
    align-items: end;
  }
  .offers--single .offer__media { grid-column: 1 / span 7; aspect-ratio: 16 / 10; }
  .offers--single .offer__body { grid-column: 9 / span 4; }
  .offers--single .offer__title { font-size: clamp(1.5rem, 2.4vw, 2rem); letter-spacing: -0.025em; }
}
.offer__media { aspect-ratio: 4 / 3; }
.offer__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin: 1.25rem 0 0; }
.offer__discount {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: var(--color-slate-900);
  color: #fff;
  font-weight: 600;
}
.offer__title { margin-top: 0.5rem; }
.offer__title--first { margin-top: 1.25rem; }
.offer__media--empty { display: grid; place-items: center; background: var(--color-slate-200); }
.offer__noimg { font-size: 0.875rem; font-weight: 500; color: var(--color-slate-500); }
.offer__sub { margin-top: 0.375rem; font-size: 0.9375rem; }
.offer__desc { margin-top: 0.75rem; font-size: 0.9375rem; }
.offer__actions { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; margin-top: 1rem; font-size: 0.9375rem; }
.offer__toggle { padding: 0; border: 0; background: none; font: inherit; font-weight: 600; cursor: pointer; }
.offers__all { margin: 2.5rem 0 0; }
/* Телефон: лента с прокруткой вбок вместо столбика карточек — край
   следующей карточки подсказывает, что ряд листается. */
@media (max-width: 699px) {
  .offers {
    grid-auto-flow: column;
    grid-auto-columns: 82%;
    gap: 0.75rem;
    margin-inline: calc(-1 * var(--h-pad));
    padding-inline: var(--h-pad);
    scroll-padding-inline: var(--h-pad);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .offers::-webkit-scrollbar { display: none; }
  .offers > li { scroll-snap-align: start; }
}
@media (max-width: 699px) { .offers--single { grid-auto-columns: 100%; } }

</style>
