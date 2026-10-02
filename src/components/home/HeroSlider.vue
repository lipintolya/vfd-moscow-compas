<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { HERO_COVER_IMAGE, HERO_COVER_IMAGE_SRCSET } from '../../data/hero-image'

const SLIDER_INTERVAL_MS = 9000
const SWIPE_THRESHOLD    = 50

interface Slide {
  id:          number
  image:       string
  title:       string
  subtitle:    string
  description: string
  cta?:        string
  ctaHref?:    string
  /** object-position картинки, если главный объект не в центре кадра
      (по умолчанию — center). */
  imagePosition?: string
}

const slides: Slide[] = [
  {
    /* Первый слайд — единственный <h1> на главной (см. шаблон ниже), поэтому
       именно он должен нести ключевые запросы. "ВФД Москва" — самый частый
       брендовый запрос (по нему в органике выше нас страница самой фабрики,
       не салона — см. обсуждение), поэтому фраза идёт слитно в начале H1,
       а не разбита "ВФД в ТЦ «Компас» ... в Москве" как раньше. Штрих-промо
       ушёл на 2-й слайд (крутится через 9с и доступен по точкам навигации),
       сам по себе он никуда не делся. */
    id: 1,
    image: HERO_COVER_IMAGE,
    /* Дверь на рендере у левого края: при центральном кропе на узком
       экране (телефон, DPR 3 берёт полный оригинал из srcset) она
       уходила из кадра — прижимаем кадр влево. */
    imagePosition: 'left center',
    title: 'ВФД Москва — двери в ТЦ «Компас»',
    subtitle: 'Официальный дилер',
    description: 'Подберём дверь для дома или квартиры: каталог моделей, цены и установка',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    /* Сезонное промо — начался сезон входных дверей для частных домов,
       второй слайд (сразу после H1) для максимальной видимости. */
    id: 6,
    image: '/renders/hero/comforttermo-promo.webp',
    title: 'Входные двери с терморазрывом',
    subtitle: 'Уличная дверь «Комфорт Термо» для частного дома',
    description: 'Полотно 110 мм, короб с терморазрывом 150 мм, 3 контура EPDM-уплотнения, цвет «Букле графит» — от 42 660 ₽',
    cta: 'Смотреть дверь',
    ctaHref: '/vhodnye-dveri/#comforttermo',
  },
  {
    id: 5,
    image: 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/strix_render.webp',
    title: 'Премиум дизайн по доступной цене',
    subtitle: 'Новинка — «Штрих» уже в каталоге',
    description: 'Серия Урбан: алюминиевая кромка с графичным акцентом, покрытие Эмалекс — от 14 300 ₽ за полотно',
    cta: 'Смотреть модель',
    ctaHref: '/models/shtrih-2a-urban-78543d/',
  },
  {
    id: 2,
    image: 'https://storage.yandexcloud.net/vfd74ru/Main_page_perfomance-covers/innova_render.webp',
    title: 'Серия «Иннова» уже в салоне',
    subtitle: 'Не оставляет отпечатков пальцев',
    description: 'Новинка в инновационном покрытии ПЭТ',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    id: 3,
    image: 'https://storage.yandexcloud.net/catalog-vfd/covers/linea-1.webp',
    title: 'Серия «Линеа» уже в салоне',
    subtitle: 'Современный дизайн по доступной цене',
    description: 'Светостойкая эмаль с фрезерованными элементами и алюминиевым декором',
    cta: 'Смотреть каталог',
    ctaHref: '/catalog/',
  },
  {
    id: 4,
    image: 'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/render_urban2.webp',
    title: 'Урбан — городской стиль для вашего интерьера',
    subtitle: 'Двери от 18 000 ₽ за комплект',
    description: 'Лаконичные формы, полипропиленовое покрытие Ренолит (Германия) с эффектом эмали',
    cta: 'Смотреть модель',
    ctaHref: '/models/urban-2gr-urban-a2d505/',
  },
]

/* ── Slider state ── */
const activeIndex     = ref(0)
const touchStartX     = ref(0)
const touchStartY     = ref(0)
const isPaused        = ref(false)
const autoplayEnabled = ref(true)

const currentSlide = computed(() => slides[activeIndex.value] ?? slides[0])

let timer: ReturnType<typeof setInterval> | null = null

const next  = () => { activeIndex.value = (activeIndex.value + 1) % slides.length }
const prev  = () => { activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length }
const stop  = () => { if (timer !== null) { clearInterval(timer); timer = null } }
const start = () => { stop(); timer = setInterval(next, SLIDER_INTERVAL_MS) }

const goTo = (i: number) => { activeIndex.value = i; start() }

const onMouseEnter = () => { isPaused.value = true;  stop() }
const onMouseLeave = () => { isPaused.value = false; start() }

const onTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) return
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isPaused.value = true
  stop()
}

const onTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches[0]) return
  const dx = touchStartX.value - e.changedTouches[0].clientX
  const dy = touchStartY.value - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    dx > 0 ? next() : prev()
  }
  setTimeout(() => { isPaused.value = false; start() }, 400)
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft')  { prev(); start() }
  if (e.key === 'ArrowRight') { next(); start() }
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  autoplayEnabled.value = !prefersReduced
  if (!prefersReduced) start()
})
onUnmounted(stop)
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 lg:min-h-125 xl:min-h-140">

        <!-- ══ HERO SLIDER ══ -->
        <div
          class="lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-4/5 sm:aspect-3/4 md:aspect-16/11 lg:aspect-auto lg:h-auto"
          role="region"
          aria-label="Слайдер акций и новинок"
          aria-roledescription="carousel"
          tabindex="0"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @keydown="onKeyDown"
        >
          <!-- Backgrounds — все слайды смонтированы всегда, активный переключается
               прозрачностью. Раньше 1-й слайд жил на v-if (жёсткое размонтирование
               без анимации), остальные — на v-show (display toggle, transition на
               opacity не срабатывал, т.к. opacity не менялся). Из-за этого переход
               был рваным. Теперь у всех один и тот же кросс-фейд. -->
          <div class="absolute inset-0">
            <img
              v-for="(slide, i) in slides"
              :key="slide.id"
              :src="slide.image"
              :srcset="i === 0 ? HERO_COVER_IMAGE_SRCSET : undefined"
              :sizes="i === 0 ? '(max-width: 1023px) 100vw, 55vw' : undefined"
              alt=""
              :fetchpriority="i === 0 ? 'high' : undefined"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :decoding="i === 0 ? 'sync' : 'async'"
              class="hero-slide absolute inset-0 w-full h-full object-cover object-center"
              :style="slide.imagePosition ? { objectPosition: slide.imagePosition } : undefined"
              :class="{ 'hero-slide-active': i === activeIndex }"
              aria-hidden="true"
            />
          </div>

          <!-- Overlay — z-10, т.к. активный слайд в .hero-slide-active получил
               z-index:1 для кросс-фейда и без явного z-index здесь оказывался
               бы поверх затемнения ── -->
          <div class="absolute inset-0 z-10 bg-linear-to-t from-black/55 via-black/20 to-black/5" aria-hidden="true" />

          <!-- Slide counter -->
          <div class="absolute top-5 left-5 sm:top-8 sm:left-8 z-10 flex items-center gap-2 text-white/70 text-sm tabular-nums">
            <span class="text-white">{{ String(activeIndex + 1).padStart(2, '0') }}</span>
            <span class="w-5 h-px bg-white/40" aria-hidden="true" />
            <span>{{ String(slides.length).padStart(2, '0') }}</span>
          </div>

          <!-- Content -->
          <div class="relative z-10 flex h-full items-end">
            <Transition name="hero-content" mode="out-in">
              <div :key="currentSlide.id" class="hero-content-text p-5 sm:p-8 lg:p-10 max-w-2xl text-white pb-14 sm:pb-16" aria-live="polite" aria-atomic="true">
                <p class="text-xs uppercase tracking-widest text-white/75 mb-2 sm:mb-3">
                  {{ currentSlide.subtitle }}
                </p>
                <h1 class="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-medium mb-3 sm:mb-4 leading-tight">
                  {{ currentSlide.title }}
                </h1>
                <p class="text-sm sm:text-base text-white/85 mb-5 sm:mb-6 leading-relaxed max-w-lg">
                  {{ currentSlide.description }}
                </p>
                <a
                  v-if="currentSlide.cta && currentSlide.ctaHref"
                  :href="currentSlide.ctaHref"
                  class="group/link inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out hover:-translate-y-px"
                >
                  {{ currentSlide.cta }}
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500 group-hover/link:text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </a>
              </div>
            </Transition>
          </div>

          <!-- Dots -->
          <div
            class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2"
            role="tablist"
            aria-label="Навигация слайдера"
          >
            <button
              v-for="(slide, i) in slides"
              :key="i"
              type="button"
              role="tab"
              :aria-label="`Слайд ${i + 1}: ${slide.title}`"
              :aria-selected="i === activeIndex"
              class="dot-nav__btn"
              @click="goTo(i)"
            >
              <span
                class="dot-nav__item dot-nav__item--progress"
                :class="{ 'dot-nav__item--active': i === activeIndex }"
              >
                <span
                  v-if="i === activeIndex && autoplayEnabled && !isPaused"
                  :key="activeIndex"
                  class="dot-nav__progress"
                  :style="{ animationDuration: `${SLIDER_INTERVAL_MS}ms` }"
                />
              </span>
            </button>
          </div>
        </div>

        <!-- ══ RIGHT BENTO ══ -->
        <div class="lg:col-span-5 grid grid-rows-2 gap-4 sm:gap-5 lg:gap-6">

          <!-- Перегородки -->
          <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-16/10 sm:aspect-2/1 lg:aspect-auto lg:h-full">
            <img
              src="/renders/hero/partitions-tg1-960.webp"
              srcset="/renders/hero/partitions-tg1-640.webp 640w, /renders/hero/partitions-tg1-960.webp 960w"
              sizes="(max-width: 1023px) 100vw, 40vw"
              width="960"
              height="1197"
              alt=""
              loading="lazy"
              decoding="async"
              class="absolute inset-0 w-full h-full object-cover object-center"
              aria-hidden="true"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/5" aria-hidden="true" />
            <div class="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end text-white">
              <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Дизайнерские решения</p>
              <h3 class="text-lg sm:text-xl font-medium mb-2 leading-snug">
                Алюминиевые перегородки и системы открывания
              </h3>
              <p class="text-sm text-white/80 mb-4">
                Изготовление в течение 45 дней после оформления заказа
              </p>
              <a href="/partitions/" class="group/link inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out hover:-translate-y-px">
                Узнать больше
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500 group-hover/link:text-white">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          </div>

          <!-- Bottom row -->
          <div class="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6">

            <!-- Портфолио — тёмная карточка с фото рендера (та же схема
                 фото+градиент, что у «Перегородок» выше), а не инструмент
                 на сером фоне: инструмент выбивался из ряда «интерьер /
                 текст на графите» и не читался как часть бренда. Локальные
                 640w/960w срезы через gen-hero-bento.mjs — оригинал с
                 Yandex Cloud 1024×1536/117KB кратно крупнее реального
                 размера показа карточки. -->
            <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-4/5 lg:aspect-auto lg:h-full">
              <img
                src="/renders/hero/portfolio-cover-960.webp"
                srcset="/renders/hero/portfolio-cover-640.webp 640w, /renders/hero/portfolio-cover-960.webp 960w"
                sizes="(max-width: 1023px) 50vw, 20vw"
                width="960"
                height="1440"
                alt=""
                loading="lazy"
                decoding="async"
                class="absolute inset-0 w-full h-full object-cover object-center"
                aria-hidden="true"
              />
              <div class="absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-black/10" aria-hidden="true" />
              <div class="relative z-10 h-full p-4 sm:p-6 flex flex-col justify-end text-white">
                <div class="min-h-18 sm:min-h-21">
                  <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Портфолио</p>
                  <h4 class="font-medium text-sm sm:text-base leading-snug mb-1 line-clamp-2">Фотоотчёты с объектов</h4>
                  <p class="text-sm text-white/75 line-clamp-2">
                    <span class="sm:hidden">Живые фото с объектов</span>
                    <span class="hidden sm:inline">Живые фото с монтажей — помогут определиться с выбором</span>
                  </p>
                </div>
                <a href="/portfolio/" class="group/link mt-4 inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out hover:-translate-y-px">
                  Смотреть
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500 group-hover/link:text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            <!-- О компании — плоская графит-карточка, тот же тон, что у
                 остальных тёмных плашек по сайту (см. --color-graphite). -->
            <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-4/5 lg:aspect-auto lg:h-full bg-graphite">
              <div class="relative z-10 h-full p-4 sm:p-6 flex flex-col justify-end text-white">
                <div class="min-h-18 sm:min-h-21">
                  <p class="text-xs uppercase tracking-widest text-white/60 mb-1">Салон ВФД</p>
                  <h4 class="font-medium text-sm sm:text-base mb-1 leading-snug line-clamp-2">Полный цикл: от замера до монтажа</h4>
                  <p class="text-sm text-white/75 line-clamp-2">ТЦ «Компас», 3 этаж</p>
                </div>
                <a href="/about/" class="group/link mt-4 inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.2)] transition-transform duration-200 ease-out hover:-translate-y-px">
                  Подробнее
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500 group-hover/link:text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ════ SLIDER OPTIMIZATION ════ */
/* Container optimization for LCP */
.lg\:col-span-7 {
  content-visibility: auto;
  contain-intrinsic-size: auto 37.5rem;
}

/* Подпись/заголовок/описание держатся на градиент-оверлее для контраста,
   но на светлых участках фото (например, светлая дверь в кадре) этого
   недостаточно — лёгкая тень подстраховывает читаемость независимо
   от того, что именно на фото под текстом у конкретного слайда. */
.hero-content-text {
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
}

/* Кросс-фейд фона — все слайды в стеке, активный получает opacity:1 */
.hero-slide {
  opacity: 0;
  z-index: 0;
  will-change: opacity;
  transition: opacity 900ms ease-in-out;
}
.hero-slide-active {
  opacity: 1;
  z-index: 1;
}

/* Плавная смена текста (заголовок/описание/CTA) синхронно с фоном */
.hero-content-enter-active,
.hero-content-leave-active {
  transition: opacity 350ms ease, transform 350ms ease;
}
.hero-content-enter-from,
.hero-content-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Точки-навигация — общий вид и прогресс-бар вынесены в global.css
   (.dot-nav__btn/.dot-nav__item/.dot-nav__progress), единая система для
   всех автослайдеров сайта (Hero, HiddenDoorsPromo, SherwoodPromo). */
@media (prefers-reduced-motion: reduce) {
  .hero-slide,
  .hero-content-enter-active,
  .hero-content-leave-active {
    transition: none;
    animation: none;
  }
}
</style>