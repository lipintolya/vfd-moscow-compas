<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useScrollReveal } from '../../composables/useScrollReveal'

/* ============================================================
   Types
   ============================================================ */
interface Feature {
  id:      number
  title:   string
  text:    string
  /** 1–3 фото для слайдера карточки. Можно добавить ссылки с Yandex Cloud — стрелки и точки появятся автоматически, когда их больше одной. */
  images:  string[]
  cta:     { label: string; href: string; external?: boolean }
  /** Короткий факт + подпись в подвале карточки — тот же приём, что "автор
      статьи" в блог-карточках (лицо + подпись), но без выдуманных персон:
      реальная цифра/адрес, уже упомянутые в копирайтинге секции. */
  stat:    string
  caption: string
}

/* ============================================================
   Data — вынесено за пределы setup, не пересоздаётся
   ============================================================ */
const WORDS: string[] = [
  'салон дверей VFD в Челябинске',
  'дилера, где двери в наличии',
  'салон с крупнейшей выставкой',
  'установку дверей «под ключ»',
]

/* Локальные копии (scripts/gen-home-images.mjs): оригиналы на CDN — портреты
   до 1440×2560 и 1 МБ, а контейнер фото — aspect-[16/12.65] ~400px шириной.
   Файлы заранее кадрированы тем же центральным кропом, что даёт object-cover. */
const IMG = '/renders/home/features-'

const FEATURES: (Feature & { eyebrow: string })[] = [
  {
    id: 1,
    eyebrow: 'Фабрика',
    title: 'Двери напрямую с фабрики',
    text: 'Официальный дилер Владимирской фабрики дверей — без посредников и переплат.',
    images: [
      `${IMG}card-1.webp`,
      `${IMG}f1.webp`,
      `${IMG}f2.webp`,
      `${IMG}f3.webp`,
      `${IMG}f4.webp`,
    ],
    cta: { label: 'Выбрать двери', href: '/catalog/' },
    stat: 'С 2014 года',
    caption: 'напрямую с фабрики',
  },
  {
    id: 2,
    eyebrow: 'Сервис',
    title: 'Всё — от выбора до монтажа',
    text: 'Консультация, замер, доставка и установка под ключ. Одна команда с 2014 года.',
    images: [
      `${IMG}card-2.webp`,
      `${IMG}t1.webp`,
      `${IMG}t2.webp`,
      `${IMG}t3.webp`,
    ],
    cta: { label: 'Посмотреть монтажи', href: '/portfolio/' },
    stat: 'Под ключ',
    caption: 'замер и монтаж',
  },
  {
    id: 3,
    eyebrow: 'Шоурум',
    title: 'Большая выставка ВФД',
    text: '60+ моделей вживую на Кашириных, 131Б — сравните, не по фото.',
    images: [
      `${IMG}card-3.webp`,
      `${IMG}foto1.webp`,
      `${IMG}foto2.webp`,
      `${IMG}foto3.webp`,
      `${IMG}foto4.webp`,
      `${IMG}foto6.webp`,
    ],
    cta: { label: 'Построить маршрут', href: 'https://yandex.ru/maps/-/CPTwZPi-', external: true },
    stat: '60+ моделей',
    caption: 'Кашириных, 131Б',
  },
]

/** Иконка подвала — по индексу карточки (фабрика / сервис / шоурум), общий teal-акцент. */
const FOOTER_ICONS = [
  'M3 7l9-4 9 4-9 4-9-4Z M3 7v10l9 4 9-4V7 M12 11v10', // Фабрика — короб/поставка
  'M14.5 3.5l6 6-8.5 8.5H5.5v-6.5l9-8Z M13 5l6 6',       // Сервис — инструмент/монтаж
  'M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', // Шоурум — метка на карте
]

/* ============================================================
   State
   ============================================================ */
const { sectionRef, visible } = useScrollReveal(0.2)
const currentWord = ref(WORDS[0])
const wordVisible = ref(true)
const activeImage = ref<number[]>(FEATURES.map(() => 0))

let wordIndex   = 0
let wordTimer:  ReturnType<typeof setTimeout>  | null = null
let cycleTimer: ReturnType<typeof setInterval> | null = null

/* ============================================================
   Card image slider — статичный, переключение стрелками или точкой
   ============================================================ */
const setImage = (cardIdx: number, imgIdx: number) => {
  activeImage.value[cardIdx] = imgIdx
}
const prevImage = (cardIdx: number) => {
  const total = FEATURES[cardIdx]!.images.length
  activeImage.value[cardIdx] = (activeImage.value[cardIdx]! - 1 + total) % total
}
const nextImage = (cardIdx: number) => {
  const total = FEATURES[cardIdx]!.images.length
  activeImage.value[cardIdx] = (activeImage.value[cardIdx]! + 1) % total
}

/* Свайп по фото на тач-устройствах — стрелки/точки кликом, но на мобиле
   ожидают жест пальцем (тот же порог, что в HeroSlider.vue) */
const SWIPE_THRESHOLD = 40
let touchStartX = 0
let touchStartY = 0
let touchCardIdx = -1

const onImageTouchStart = (e: TouchEvent, cardIdx: number) => {
  if (!e.touches[0]) return
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchCardIdx = cardIdx
}
const onImageTouchEnd = (e: TouchEvent, cardIdx: number) => {
  if (!e.changedTouches[0] || touchCardIdx !== cardIdx) return
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    dx > 0 ? nextImage(cardIdx) : prevImage(cardIdx)
  }
}

/* ============================================================
   Word animation
   ============================================================ */
const advanceWord = () => {
  wordVisible.value = false
  wordTimer = setTimeout(() => {
    wordIndex = (wordIndex + 1) % WORDS.length
    currentWord.value = WORDS[wordIndex]!
    wordVisible.value = true
  }, 300)
}

const startCycle = () => {
  if (cycleTimer !== null) return
  cycleTimer = setInterval(advanceWord, 2800)
}

const stopCycle = () => {
  if (cycleTimer !== null) { clearInterval(cycleTimer); cycleTimer = null }
  if (wordTimer  !== null) { clearTimeout(wordTimer);  wordTimer  = null }
}

/* ============================================================
   Start word cycle once section enters viewport
   ============================================================ */
watch(visible, (v) => {
  if (v && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) startCycle()
}, { once: true })

onBeforeUnmount(stopCycle)
</script>

<template>
  <section
    ref="sectionEl"
    class="section"
    aria-labelledby="features-heading"
    itemscope
    itemtype="https://schema.org/ItemList"
  >
    <div class="container">

      <!-- ── Header ── -->
      <div class="mb-10 md:mb-16">
        <header class="max-w-3xl">
          <p class="t-eyebrow mb-3" aria-hidden="true">
            Почему выбирают нас
          </p>

          <h2 id="features-heading" class="mb-4 text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
            Вы нашли
            <span class="sr-only">официальный салон ВФД</span>
            <span
              class="inline-block text-teal-600 transition-all duration-300 ease-out"
              :class="wordVisible ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'"
              aria-hidden="true"
            >{{ currentWord }}</span>
          </h2>
        </header>

        <p class="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          Более 60 моделей дверей в выставочном зале — выбирайте не по картинке, а вживую.
          Поможем подобрать идеальный вариант под ваш интерьер, сделаем замер и выполним качественную установку.
        </p>
      </div>

      <!-- ── Cards ── -->
      <ul
        class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        role="list"
        itemprop="itemListElement"
      >
        <li
          v-for="(feature, idx) in FEATURES"
          :key="feature.id"
          class="group rounded-[1.75rem] bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-[opacity,transform,box-shadow] duration-700 ease-out hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)] motion-reduce:transition-none"
          :class="visible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-6 opacity-0 blur-sm'"
          :style="{ transitionDelay: visible ? `${idx * 130}ms` : '0ms' }"
          itemprop="item"
          itemscope
          itemtype="https://schema.org/Thing"
        >
        <!-- Double-bezel: внешняя белая рамка (p-1.5, тень, hover-подъём на
             <li>) имитирует физическую оправу вокруг тёмного graphite-блока
             с фото+текстом — раньше карточка была плоским graphite-прямоугольником
             прямо на белом фоне секции, без ощущения объекта. Внутренний
             блок скруглён на padding меньше внешнего (концентрические
             радиусы), поэтому рамка равномерна по всему периметру. -->
        <div class="relative flex h-full flex-col overflow-hidden rounded-[1.375rem] bg-graphite">
          <!-- Фото — во всю ширину карточки, без отступов, статично, переключение
               по клику на точку/стрелку или свайпом на тач (мобайл-фёрст: фото
               задаёт форму карточки, текст под ним в своём паддинге). -->
          <div
            class="relative aspect-[16/12.65] w-full shrink-0 overflow-hidden"
            @touchstart.passive="onImageTouchStart($event, idx)"
            @touchend="onImageTouchEnd($event, idx)"
          >
            <img
              v-for="(img, imgIdx) in feature.images"
              :key="img"
              :src="img"
              alt=""
              class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"
              :class="{ 'opacity-100': imgIdx === activeImage[idx] }"
              loading="lazy"
              decoding="async"
              width="400"
              height="375"
            />

            <template v-if="feature.images.length > 1">
              <button
                type="button"
                class="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/65 group-hover:opacity-100 focus-visible:opacity-100 active:scale-90"
                aria-label="Предыдущее фото"
                @click.stop="prevImage(idx)"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                  <path d="M12.5 15 7.5 10l5-5" />
                </svg>
              </button>
              <button
                type="button"
                class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/65 group-hover:opacity-100 focus-visible:opacity-100 active:scale-90"
                aria-label="Следующее фото"
                @click.stop="nextImage(idx)"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                  <path d="M7.5 5 12.5 10l-5 5" />
                </svg>
              </button>

              <div class="absolute inset-x-0 bottom-2 flex justify-center gap-1">
                <button
                  v-for="(img, imgIdx) in feature.images"
                  :key="img"
                  type="button"
                  class="dot-nav__btn flex h-6 w-6 items-center justify-center"
                  :aria-label="`Фото ${imgIdx + 1}`"
                  @click.stop="setImage(idx, imgIdx)"
                >
                  <span
                    class="dot-nav__item"
                    :class="{ 'dot-nav__item--active': imgIdx === activeImage[idx] }"
                  />
                </button>
              </div>
            </template>
          </div>

          <!-- Контент под фото — свой паддинг, фото само в отступы не заворачиваем -->
          <div class="relative flex flex-1 flex-col p-6 sm:p-7">
            <p class="relative mb-3 text-xs font-medium uppercase tracking-widest text-teal-400" aria-hidden="true">
              {{ feature.eyebrow }}
            </p>

            <h3
              class="relative mb-3 text-xl font-medium leading-[1.15] tracking-tight text-white sm:text-[1.375rem]"
              itemprop="name"
            >
              {{ feature.title }}
            </h3>

            <p class="relative mb-5 text-sm leading-relaxed text-slate-400" itemprop="description">{{ feature.text }}</p>

            <!-- Подвал: факт+подпись слева (тот же ритм, что «автор + должность»
                 в референс-карточках блога), ссылка справа — вместо pill-кнопки
                 простая текстовая ссылка со стрелкой, как в референсе. -->
            <div class="relative mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-4.5 w-4.5" aria-hidden="true">
                    <path :d="FOOTER_ICONS[idx]" />
                  </svg>
                </span>
                <span class="min-w-0 leading-tight">
                  <span class="block truncate text-sm font-medium text-white">{{ feature.stat }}</span>
                  <span class="block truncate text-xs text-slate-500">{{ feature.caption }}</span>
                </span>
              </div>

              <a
                :href="feature.cta.href"
                class="group/link inline-flex shrink-0 items-center gap-1 text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
                :target="feature.cta.external ? '_blank' : undefined"
                :rel="feature.cta.external ? 'noopener noreferrer' : undefined"
                :aria-label="feature.cta.external
                  ? `${feature.cta.label} (открывается в новой вкладке)`
                  : undefined"
              >
                {{ feature.cta.label }}
                <svg class="h-3.5 w-3.5 shrink-0 transition-transform group-hover/link:translate-x-0.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        </li>
      </ul>

    </div>
  </section>
</template>
