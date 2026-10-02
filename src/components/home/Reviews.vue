<script setup lang="ts">
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useScrollReveal } from '../../composables/useScrollReveal'
import { reviews, type ReviewPlatform, type Review } from '../../data/reviews'

/* headingTag — на главной секция идёт под общим h1 страницы, поэтому её
   заголовок h2 (по умолчанию). На отдельной /reviews/ этот заголовок —
   единственный и главный на странице, поэтому там передаём 'h1'. */
/* eagerFirst — на /reviews/ карусель идёт первым контентом страницы (видна
   без скролла), первые фото должны грузиться eager. На главной секция
   Reviews ниже сгиба (client:visible) — там всё должно оставаться lazy,
   поэтому дефолт false и включаем только явно на странице отзывов. */
const props = withDefaults(defineProps<{ headingTag?: 'h1' | 'h2'; eagerFirst?: boolean }>(), {
  headingTag: 'h2',
  eagerFirst: false,
})

const PLATFORM_META: Record<ReviewPlatform, { label: string; logo: string }> = {
  yandex: { label: 'Яндекс Карты', logo: '/renders/home/logo-yandex.webp' },
  '2gis':  { label: '2ГИС',        logo: '/renders/home/logo-2gis.webp' },
}

const formatDate = (dateStr?: string): string =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

/* Свежие отзывы — первыми. Отзывы без даты (если появятся) уходят в конец,
   а не в начало/вперемешку. */
const sortedReviews = computed(() =>
  [...reviews].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
)

const { sectionRef, visible } = useScrollReveal(0.1)

/* Горизонтальная карусель-«стена отзывов»: карточек много (15+) и их число
   будет расти — вертикальная сетка на все отзывы сделала бы блок на главной
   огромным. Скролл нативный (свайп/трекпад), стрелки — для мыши/доступности. */
const trackRef = ref<HTMLElement | null>(null)
const scrollByCards = (dir: 1 | -1) => {
  const el = trackRef.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('[data-review-card]')
  const step = (card?.offsetWidth ?? 320) + 16
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

/* ── Фото у отзыва: на карточке показываем ОДНО фото за раз (единый размер,
   не мозаика из фото разных пропорций) — если их несколько, свайпом внутри
   превью переключаем между ними, точки снизу показывают, что фото ещё есть.
   Клик — открывает то же самое фото в полноэкранном лайтбоксе. ── */
const activePhotoIdx = reactive<Record<string, number>>({})
const getActiveIdx = (id: string) => activePhotoIdx[id] ?? 0

const SWIPE_THRESHOLD = 40
const touchStartX = new Map<string, number>()
const onPhotoTouchStart = (id: string, e: TouchEvent) => {
  touchStartX.set(id, e.touches[0]?.clientX ?? 0)
}
const onPhotoTouchEnd = (review: Review, e: TouchEvent) => {
  const total = review.photos?.length ?? 0
  const startX = touchStartX.get(review.id)
  if (total < 2 || startX == null || !e.changedTouches[0]) return
  const dx = startX - e.changedTouches[0].clientX
  if (Math.abs(dx) <= SWIPE_THRESHOLD) return
  const cur = getActiveIdx(review.id)
  activePhotoIdx[review.id] = dx > 0 ? (cur + 1) % total : (cur - 1 + total) % total
}

/* ── Лайтбокс ── */
const lightbox = ref<{ photos: string[]; name: string; index: number } | null>(null)

/* SSR рендерит лайтбокс закрытым (lightbox=null), но сам Teleport-в-body с
   Transition вокруг v-if всё равно попадает в SSR-разметку как placeholder —
   и на конкретно этой странице коллизирует с местом, куда Astro вставляет
   свой служебный <style> для astro-island/astro-slot, из-за чего Vue при
   гидратации ловит "Hydration node mismatch" (эффект есть, крэша нет, но
   предупреждение в консоли и лишний re-render). Лайтбокс всё равно нужен
   только после клика пользователя — держим Teleport вне SSR/гидратации
   вовсе, включая после маунта. */
const mounted = ref(false)

const openLightbox = (review: Review) => {
  if (!review.photos?.length) return
  lightbox.value = { photos: review.photos, name: review.name, index: getActiveIdx(review.id) }
  document.body.style.overflow = 'hidden'
}
const closeLightbox = () => {
  lightbox.value = null
  document.body.style.overflow = ''
}
const lightboxStep = (dir: 1 | -1) => {
  if (!lightbox.value) return
  const total = lightbox.value.photos.length
  lightbox.value.index = (lightbox.value.index + dir + total) % total
}
let lightboxTouchStartX = 0
const onLightboxTouchStart = (e: TouchEvent) => { lightboxTouchStartX = e.touches[0]?.clientX ?? 0 }
const onLightboxTouchEnd = (e: TouchEvent) => {
  if (!lightbox.value || lightbox.value.photos.length < 2 || !e.changedTouches[0]) return
  const dx = lightboxTouchStartX - e.changedTouches[0].clientX
  if (Math.abs(dx) <= SWIPE_THRESHOLD) return
  lightboxStep(dx > 0 ? 1 : -1)
}
const onKeydown = (e: KeyboardEvent) => {
  if (!lightbox.value) return
  if (e.key === 'Escape')     closeLightbox()
  if (e.key === 'ArrowRight') lightboxStep(1)
  if (e.key === 'ArrowLeft')  lightboxStep(-1)
}
onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section
    ref="sectionEl"
    class="section bg-white"
    aria-labelledby="reviews-heading"
  >
    <div class="container">

      <!-- Header -->
      <header
        class="mb-10 flex flex-wrap items-end justify-between gap-6 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:mb-12"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
      >
        <div class="max-w-2xl">
          <p class="t-eyebrow mb-3">
            Отзывы клиентов
          </p>
          <component :is="headingTag" id="reviews-heading" class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
            Репутация, подтверждённая фактами
          </component>
          <p class="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            Публикуем только верифицированные отзывы с Яндекс Карт и 2ГИС. Сохраняем оригинальные фотографии работ и даты публикаций для полной прозрачности.
          </p>
        </div>

        <!-- Стрелки карусели — скрыты на мобильном, там свайп -->
        <div class="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-ink"
            aria-label="Предыдущие отзывы"
            @click="scrollByCards(-1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/>
            </svg>
          </button>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-ink"
            aria-label="Следующие отзывы"
            @click="scrollByCards(1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Carousel -->
      <ul
        ref="trackRef"
        class="scrollbar-none [&::-webkit-scrollbar]:hidden flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:gap-5"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        role="list"
        itemscope
        itemtype="https://schema.org/ItemList"
      >
        <li
          v-for="(review, index) in sortedReviews"
          :key="review.id"
          data-review-card
          class="flex w-70 shrink-0 snap-start flex-col gap-3 rounded-2xl bg-graphite p-6 sm:w-80"
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/Review"
        >
          <!-- Платформа + дата -->
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5">
              <img
                :src="PLATFORM_META[review.platform].logo"
                :alt="PLATFORM_META[review.platform].label"
                class="h-5 w-5 shrink-0 rounded-md"
                width="20"
                height="20"
                loading="lazy"
                decoding="async"
              />
              <span class="text-xs font-semibold text-slate-300">{{ PLATFORM_META[review.platform].label }}</span>
            </span>
            <time
              v-if="review.date"
              :datetime="review.date"
              class="shrink-0 text-xs text-slate-500"
              itemprop="datePublished"
            >{{ formatDate(review.date) }}</time>
          </div>

          <!-- Stars -->
          <div class="flex gap-0.5" aria-label="Оценка: 5 из 5" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
            <meta itemprop="ratingValue" content="5" />
            <meta itemprop="bestRating" content="5" />
            <svg
              v-for="i in 5"
              :key="i"
              class="h-4 w-4 fill-amber-400"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>

          <!-- Author -->
          <span
            class="text-sm font-semibold text-white"
            itemprop="author"
            itemscope
            itemtype="https://schema.org/Person"
          >
            <span itemprop="name">{{ review.name }}</span>
          </span>

          <!-- Что рецензируется — обязательное поле для валидности Review-разметки -->
          <span itemprop="itemReviewed" itemscope itemtype="https://schema.org/LocalBusiness" class="hidden">
            <span itemprop="name">ВФД (Фирменный салон Владимирской фабрики дверей)</span>
          </span>

          <!-- Text -->
          <p
            class="line-clamp-6 flex-1 text-sm leading-relaxed text-slate-400"
            itemprop="reviewBody"
          >{{ review.text }}</p>

          <!-- Фото от клиента — одно превью за раз (единый размер), свайп между
               фото, если их несколько; клик — открыть в лайтбоксе -->
          <div
            v-if="review.photos?.length"
            class="relative aspect-square touch-pan-y overflow-hidden rounded-lg bg-slate-200"
            @touchstart.passive="onPhotoTouchStart(review.id, $event)"
            @touchend="onPhotoTouchEnd(review, $event)"
          >
            <button
              type="button"
              class="block h-full w-full cursor-zoom-in"
              :aria-label="`Открыть фото от клиента ${review.name} на весь экран`"
              @click="openLightbox(review)"
            >
              <img
                :src="review.photos[getActiveIdx(review.id)]"
                :alt="`Фото от клиента ${review.name} — отзыв о ВФД`"
                :loading="props.eagerFirst && index < 5 ? 'eager' : 'lazy'"
                decoding="async"
                width="320"
                height="320"
                class="h-full w-full object-cover"
              />
            </button>
            <div
              v-if="review.photos.length > 1"
              class="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1"
              aria-hidden="true"
            >
              <span
                v-for="(photo, i) in review.photos"
                :key="photo"
                class="dot-nav__item"
                :class="{ 'dot-nav__item--active': i === getActiveIdx(review.id) }"
              />
            </div>
          </div>
        </li>
      </ul>

      <!-- Ссылки на внешние платформы отзывов -->
      <div
        class="mt-8 flex flex-wrap items-center gap-3 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:mt-10"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
      >
        <span class="text-sm font-medium text-slate-500">Читайте больше отзывов и оставляйте свои:</span>
        <a
          href="https://2gis.ru/chelyabinsk/search/ВФД%20Владимирская%20фабрика%20дверей%20Братьев%20Кашириных%20131Б"
          target="_blank"
          rel="noopener"
          class="btn btn-outline"
        >
          <img
            :src="PLATFORM_META['2gis'].logo"
            alt=""
            class="h-5 w-5 shrink-0 rounded-md"
            width="20"
            height="20"
            loading="lazy"
            decoding="async"
          />
          2ГИС
        </a>
        <a
          href="https://yandex.ru/maps/?text=ВФД%20Владимирская%20фабрика%20дверей%20Челябинск%20Братьев%20Кашириных%20131Б"
          target="_blank"
          rel="noopener"
          class="btn btn-outline"
        >
          <img
            :src="PLATFORM_META.yandex.logo"
            alt=""
            class="h-5 w-5 shrink-0 rounded-md"
            width="20"
            height="20"
            loading="lazy"
            decoding="async"
          />
          Яндекс Карты
        </a>
      </div>

    </div>

    <!-- Лайтбокс — полноэкранный просмотр фото от клиента. mounted-гейт см.
         комментарий у объявления lightbox выше: убирает SSR/гидратацию
         hydration mismatch для этого Teleport целиком. -->
    <Teleport v-if="mounted" to="body">
      <Transition name="menu-fade">
        <div
          v-if="lightbox"
          class="fixed inset-0 z-10000 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          :aria-label="`Фото от клиента ${lightbox.name}`"
          @click.self="closeLightbox"
          @touchstart.passive="onLightboxTouchStart"
          @touchend="onLightboxTouchEnd"
        >
          <button
            type="button"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Закрыть"
            @click="closeLightbox"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <button
            v-if="lightbox.photos.length > 1"
            type="button"
            class="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
            aria-label="Предыдущее фото"
            @click="lightboxStep(-1)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/>
            </svg>
          </button>
          <button
            v-if="lightbox.photos.length > 1"
            type="button"
            class="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
            aria-label="Следующее фото"
            @click="lightboxStep(1)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
            </svg>
          </button>

          <figure class="m-0 flex max-w-full flex-col items-center gap-3">
            <img
              :src="lightbox.photos[lightbox.index]"
              :alt="`Фото от клиента ${lightbox.name} — отзыв о ВФД`"
              class="max-h-[80vh] max-w-[92vw] rounded-lg object-contain shadow-2xl sm:max-w-[85vw]"
            />
            <figcaption v-if="lightbox.photos.length > 1" class="text-sm font-medium text-white/70">
              {{ lightbox.index + 1 }} / {{ lightbox.photos.length }}
            </figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
