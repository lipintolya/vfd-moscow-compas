<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useScrollReveal } from '../../composables/useScrollReveal'
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

const { sectionRef, visible } = useScrollReveal(0.1)

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
  <section
    id="promo"
    ref="sectionEl"
    class="section bg-white"
    aria-labelledby="promo-heading"
  >
    <div class="container">

      <!-- ── Header ── -->
      <header
        class="mx-auto mb-10 max-w-3xl text-center transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:mb-16"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
      >
        <p class="t-eyebrow mb-3">
          Специальные предложения
        </p>
        <h2 id="promo-heading" class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          Акции и специальные предложения
        </h2>
        <p class="mt-3 text-sm font-semibold uppercase tracking-wide text-teal-600">
          Только в салоне ВФД на Кашириных
        </p>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          Получите лучшие условия для вашего заказа — следите за нашими акциями
          и не упустите возможность сэкономить
        </p>
      </header>

      <!-- ── Empty state ── -->
      <div v-if="activePromos.length === 0" class="py-20 text-center bg-gray-50 rounded-3xl">
        <p class="text-lg text-gray-500">Нет активных акций. Следите за обновлениями 👀</p>
      </div>

      <!-- ── Promos grid — картинка крупная (h-96), описание свёрнуто за
           кнопкой «Узнать больше» (текста было много, карточки давили
           текстом). CTA-переход и разворачивание текста — разные действия,
           поэтому карточка больше не единая <a>: кнопка тоггла — <button>,
           переход по промо — отдельная <a> внизу с ctaText/ctaLink. ── -->
      <ul
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0"
        role="list"
      >
        <li
          v-for="(promo, index) in visiblePromos"
          :key="promo.id"
        >
          <div
            class="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-[opacity,transform,border-color,box-shadow] duration-600 ease-out hover:border-teal-400 hover:shadow-lg motion-reduce:transition-none"
            :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
            :style="{ transitionDelay: visible ? `${index * 100}ms` : '0ms' }"
          >
            <!-- Image — аспект вместо фикс. высоты: карточка одной ширины
                 на каждом брейкпоинте (grid-cols-1/2/3), но h-96 давал бы
                 разное соотношение сторон на разной ширине карточки. -->
            <div class="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
              <img
                :src="promo.image"
                :srcset="promo.imageSrcset"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                :alt="promo.title"
                loading="lazy"
                decoding="async"
                width="600"
                height="450"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <!-- Discount badge -->
              <span
                v-if="promo.discount"
                class="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm"
                :aria-label="`Скидка: ${promo.discount}`"
              >
                {{ promo.discount }}
              </span>

              <!-- Days left badge — считается от new Date(), см. clientReady выше -->
              <span
                v-if="clientReady"
                class="absolute bottom-3 left-3 bg-white/95 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                :aria-label="`Осталось ${getDaysLeft(promo.validUntil)} дней`"
              >
                {{ getDaysLeft(promo.validUntil) }} дн.
              </span>
            </div>

            <!-- Content -->
            <div class="p-5 sm:p-6 flex flex-col flex-1">
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ promo.title }}</h3>
              <p class="text-sm text-teal-600 font-medium mt-1 mb-3">{{ promo.subtitle }}</p>

              <button
                type="button"
                class="inline-flex w-fit items-center gap-1 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-2"
                :aria-expanded="expandedIds.has(promo.id)"
                @click="toggleExpanded(promo.id)"
              >
                {{ expandedIds.has(promo.id) ? 'Скрыть' : 'Узнать больше' }}
                <svg
                  class="h-3 w-3 shrink-0 transition-transform duration-200"
                  :class="expandedIds.has(promo.id) ? 'rotate-180' : ''"
                  viewBox="0 0 16 16" fill="none" aria-hidden="true"
                >
                  <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <p v-if="expandedIds.has(promo.id)" class="mt-3 text-sm text-gray-600 leading-relaxed">{{ promo.description }}</p>

              <!-- Footer -->
              <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <time
                  :datetime="promo.validUntil"
                  class="text-xs text-gray-500"
                >
                  До {{ formatDate(promo.validUntil) }}
                </time>

                <a
                  v-if="promo.ctaText"
                  :href="promo.ctaLink || '#'"
                  class="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 transition-transform hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-2"
                >
                  {{ promo.ctaText }}
                  <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- Секция показывает первые 3 акции — остальные на отдельной
           странице /akcii/ (весь список активных акций). -->
      <div v-if="activePromos.length > 3" class="mt-8 text-center">
        <a
          href="/akcii/"
          class="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          Все акции
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>

    </div>
  </section>
</template>
