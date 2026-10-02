<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'
import { PHONE, SITE } from '../../config/site'

/* ============================================================
   Data
   ============================================================ */
const year = new Date().getFullYear()

const NAV_LINKS = [
  { href: '/',           label: 'Главная' },
  { href: '/catalog/',    label: 'Каталог' },
  { href: '/partitions/', label: 'Перегородки' },
  { href: '/designers/',  label: 'Дизайнерам' },
  { href: '/about/',      label: 'О нас' },
  ...(SITE.features.reviews ? [{ href: '/reviews/', label: 'Отзывы' }] : []),
  { href: '/contacts/',   label: 'Контакты' },
] as const

const LEGAL_LINKS = [
  { href: '/promo-archive/', label: 'Архив акций' },
] as const

const CATEGORY_LINKS = [
  { href: '/catalog/',                label: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/',  label: 'Скрытые двери' },
  { href: '/vhodnye-dveri/',          label: 'Входные' },
  { href: '/partitions/',             label: 'Перегородки' },
  { href: '/catalog/decor/',          label: 'Декор' },
] as const

const CONTACTS = {
  phones:  companyLegalInfo.contacts.phone,
  email:   companyLegalInfo.contacts.email,
  address: companyLegalInfo.address.legal,
}

/* Раньше здесь был живой iframe Yandex Maps (свой JS + тайлы) — карта
   декоративная (pointer-events:none, aria-hidden, клик ведёт по MAP_LINK
   отдельной ссылкой), но футер общий для всех ~400 страниц сайта, так что
   iframe грузился на каждой. Заменён на статичный скриншот Static Maps API
   (см. scripts/gen-footer-map.mjs) — то же визуально, без JS-рантайма. */
const MAP_PREVIEW_IMAGE = '/renders/footer-map.webp'
const MAP_LINK = 'https://yandex.ru/maps/-/CPTwZPi-'

/* ============================================================
   Legal modal
   ============================================================ */
const isModalOpen  = ref(false)
const legalTrigger = useTemplateRef<HTMLButtonElement>('legalTriggerEl')
const legalPanel   = useTemplateRef<HTMLDivElement>('legalPanelEl')

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
  // Фокус внутрь модала после рендера
  requestAnimationFrame(() => {
    legalPanel.value
      ?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      ?.focus()
  })
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
  legalTrigger.value?.focus()   // возвращаем фокус на триггер
}

/* ============================================================
   Developer modal — контакты разработчика сайта
   ============================================================ */
const isDevModalOpen = ref(false)
const devTrigger = useTemplateRef<HTMLButtonElement>('devTriggerEl')
const devPanel    = useTemplateRef<HTMLDivElement>('devPanelEl')

const DEV_CONTACTS = {
  telegram: 'https://t.me/tolyalipin',
  email:    'ttolyalipin@gmail.com',
  github:   'https://github.com/lipintolya',
}

/* ── Живой замер Core Web Vitals текущей страницы (в модалке разработчика) ──
   Не маркетинговые цифры, а реальные значения из Performance API браузера
   посетителя: сайт сам себе портфолио. Метрика, которую браузер не
   поддерживает (Safari/Firefox — без layout-shift и т.п.), просто не
   показывается — никаких заглушек и выдуманных значений.
   Пороги «хорошо» — официальные Core Web Vitals (web.dev). */
interface Vital { key: string; label: string; abbr: string; value: string; good: boolean }
const vitals = ref<Vital[]>([])
const VITAL_ORDER = ['ttfb', 'fcp', 'lcp', 'cls']
let vitalObservers: PerformanceObserver[] = []

const fmtMs = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} мс` : `${(ms / 1000).toFixed(1).replace('.', ',')} с`

const measureVitals = () => {
  const found: Record<string, Vital> = {}
  const publish = () => {
    vitals.value = VITAL_ORDER.map(k => found[k]).filter((v): v is Vital => Boolean(v))
  }

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (nav && nav.responseStart > 0) {
    found.ttfb = { key: 'ttfb', label: 'Ответ сервера', abbr: 'TTFB', value: fmtMs(nav.responseStart), good: nav.responseStart <= 800 }
  }
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]
  if (fcp) {
    found.fcp = { key: 'fcp', label: 'Первая отрисовка', abbr: 'FCP', value: fmtMs(fcp.startTime), good: fcp.startTime <= 1800 }
  }
  publish()

  const supported = PerformanceObserver.supportedEntryTypes ?? []
  if (supported.includes('largest-contentful-paint')) {
    const obs = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1)
      if (!last) return
      found.lcp = { key: 'lcp', label: 'Основной контент', abbr: 'LCP', value: fmtMs(last.startTime), good: last.startTime <= 2500 }
      publish()
    })
    obs.observe({ type: 'largest-contentful-paint', buffered: true })
    vitalObservers.push(obs)
  }
  if (supported.includes('layout-shift')) {
    let cls = 0
    const setCls = () => {
      found.cls = { key: 'cls', label: 'Стабильность макета', abbr: 'CLS', value: cls.toFixed(2).replace('.', ','), good: cls <= 0.1 }
      publish()
    }
    setCls() // сдвигов могло не быть вовсе — тогда честный 0
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) cls += e.value
      }
      setCls()
    })
    obs.observe({ type: 'layout-shift', buffered: true })
    vitalObservers.push(obs)
  }
}

const stopVitals = () => {
  vitalObservers.forEach(o => o.disconnect())
  vitalObservers = []
}

/* Реальный стек этого сайта (package.json) — не список «умею всё». */
const DEV_STACK = ['Astro', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Supabase']
const DEV_SERVICES = [
  'Сайты и веб-сервисы',
  'Мобильные приложения',
  'Боты',
  'Автоматизация аналитики и бизнес-процессов',
  'SEO-основа и подключение CRM',
]

const openDevModal = () => {
  isDevModalOpen.value = true
  document.body.style.overflow = 'hidden'
  measureVitals()
  requestAnimationFrame(() => {
    devPanel.value
      ?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      ?.focus()
  })
}

const closeDevModal = () => {
  isDevModalOpen.value = false
  stopVitals()
  document.body.style.overflow = ''
  devTrigger.value?.focus()
}

/* Общий keydown/фокус-ловушка на оба модала — открыт максимум один
   за раз (оба триггера — обычные кнопки в одном футере), поэтому
   достаточно проверить, какой сейчас активен, и применить ловушку
   к его панели. */
const onKeydown = (e: KeyboardEvent) => {
  const activePanel = isModalOpen.value ? legalPanel.value : isDevModalOpen.value ? devPanel.value : null
  if (!activePanel) return

  if (e.key === 'Escape') {
    e.preventDefault()
    if (isModalOpen.value) closeModal()
    else closeDevModal()
    return
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(
      activePanel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    if (!focusable.length) return
    const first = focusable[0]!
    const last  = focusable[focusable.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }
}

onMounted(()  => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  stopVitals()
})
</script>

<template>
  <footer class="bg-fg text-white/80" aria-label="Подвал сайта">
    <div class="container">
      <div class="pt-16 pb-10">

        <!-- ── 4-колонка grid ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <!-- Brand -->
          <div>
            <a href="/" class="flex items-center gap-2 mb-4 w-fit" aria-label="ВФД на Кашириных — главная">
              <span class="text-lg font-semibold text-white tracking-wide">VFD</span>
              <span class="text-xs text-white/40 uppercase tracking-widest">Кашириных</span>
            </a>
            <p class="text-sm leading-relaxed text-white/60 max-w-xs">
              Фирменный салон дверей и интерьерных решений в Челябинске.
              Работаем с 2014 года.
            </p>
            <!-- Socials -->
            <div class="flex gap-4 mt-5" role="list" aria-label="Социальные сети">
              <div role="listitem">
                <a
                  :href="SITE.social.vk"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/icons/w_vk.webp" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
              <div role="listitem">
                <a
                  :href="SITE.social.telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/svg/w_tg_logo.svg" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
              <div role="listitem">
                <a
                  :href="SITE.social.max"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Max (открывается в новой вкладке)"
                  class="opacity-60 hover:opacity-100 transition-opacity duration-200 block"
                >
                  <img src="/icons/w_max.webp" alt="" class="w-6 h-6" width="24" height="24" loading="eager" fetchpriority="high" />
                </a>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav aria-label="Навигация футера">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Навигация
            </h2>
            <ul class="space-y-2.5 text-sm">
              <li v-for="link in NAV_LINKS" :key="link.href + link.label">
                <a
                  :href="link.href"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Categories -->
          <nav aria-label="Категории товаров">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Категории
            </h2>
            <ul class="space-y-2.5 text-sm">
              <li v-for="link in CATEGORY_LINKS" :key="link.label">
                <a
                  :href="link.href"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Contacts -->
          <address class="not-italic">
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Контакты
            </h2>
            <ul class="space-y-3 text-sm">
              <li v-for="p in CONTACTS.phones" :key="p.raw">
                <a
                  :href="`tel:${p.raw}`"
                  class="text-white hover:text-teal-400 transition-colors duration-200 font-medium"
                >
                  {{ p.label }}
                </a>
              </li>
              <li>
                <a
                  :href="`mailto:${CONTACTS.email}`"
                  class="text-white/60 hover:text-white transition-colors duration-200"
                >
                  {{ CONTACTS.email }}
                </a>
              </li>
              <li class="text-white/40 leading-relaxed">
                {{ CONTACTS.address }}
              </li>
            </ul>
          </address>

        </div>

        <!-- ── Как нас найти: адрес + мини-карта ── -->
        <div class="mt-12 pt-10 border-t border-white/10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-10">
          <div>
            <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-widest">
              Как нас найти
            </h2>
            <p class="text-base font-medium text-white">{{ CONTACTS.address }}</p>
            <p class="mt-1 text-sm text-white/50">{{ companyLegalInfo.address.entrance }}</p>
            <a
              :href="MAP_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              Построить маршрут
              <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
          <div class="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img
              :src="MAP_PREVIEW_IMAGE"
              alt=""
              width="650"
              height="450"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 w-full h-full object-cover"
              aria-hidden="true"
            />
            <a
              :href="MAP_LINK"
              target="_blank"
              rel="noopener noreferrer"
              class="absolute inset-0"
              aria-label="Открыть карту с расположением салона на Яндекс Картах (открывается в новой вкладке)"
            />
          </div>
        </div>

        <!-- Дисклеймер оферты — вынесен из-под клика по «Правовая информация»
             в модалку: там тот же текст остаётся полностью, но для защиты
             от претензий по ст. 437 ГК РФ дисклеймер должен быть явно виден
             на странице, а не только доступен по дополнительному действию. -->
        <p class="mt-8 pt-6 border-t border-white/10 text-xs leading-relaxed text-white/35">
          Информация и цены на сайте носят справочный характер и не являются публичной офертой
          (ст. 437 ГК РФ). Актуальную стоимость и наличие уточняйте в салоне или у менеджера.
        </p>

        <!-- ── Bottom bar ── -->
        <div class="mt-4
                    flex flex-col sm:flex-row gap-3
                    sm:items-center sm:justify-between
                    text-xs text-white/40">
          <span>
            © {{ year }} VFD. Все права защищены.
            <a href="/privacy/" class="text-white/60 hover:text-white transition-colors duration-200 ml-3">
              Политика конфиденциальности
            </a>
            <a
              v-for="link in LEGAL_LINKS"
              :key="link.href"
              :href="link.href"
              class="text-white/60 hover:text-white transition-colors duration-200 ml-3"
            >
              {{ link.label }}
            </a>
          </span>
          <span>
            Разработка и дизайн —
            <button
              ref="devTriggerEl"
              type="button"
              aria-haspopup="dialog"
              :aria-expanded="isDevModalOpen"
              class="text-white/60 underline underline-offset-2 decoration-white/20 transition-colors duration-200 hover:text-white hover:decoration-white/40"
              @click="openDevModal"
            >
              Анатолий Липин
            </button>
          </span>
        </div>

        <!-- Legal trigger -->
        <div class="mt-4 text-center">
          <button
            ref="legalTriggerEl"
            type="button"
            class="text-xs text-white/30 hover:text-white/60 transition-colors duration-200 underline underline-offset-2"
            aria-haspopup="dialog"
            :aria-expanded="isModalOpen"
            @click="openModal"
          >
            Правовая информация
          </button>
        </div>

      </div>
    </div>

    <!-- ── Legal modal ── -->
    <Transition name="modal">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        role="presentation"
        @click="closeModal"
      >
        <div
          ref="legalPanelEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
          @click.stop
        >
          <!-- Close -->
          <button
            type="button"
            class="absolute top-4 right-4 w-8 h-8 rounded-full
                   bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                   transition-colors duration-200"
            aria-label="Закрыть окно правовой информации"
            @click="closeModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="space-y-6 text-sm">

            <h3 id="legal-title" class="text-base font-medium text-gray-900">Правовая информация</h3>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Авторские права</h4>
              <p class="text-gray-600 leading-relaxed">
                Все изображения, тексты и дизайн сайта являются объектами авторского права VFD Кашириных.
                Любое использование материалов возможно только с письменного разрешения правообладателя
                и обязательным указанием источника:
                <a :href="SITE.url" class="text-teal-600 hover:underline">{{ SITE.host }}</a>
              </p>
            </div>

            <div class="border-t border-gray-100 pt-5">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Публичная оферта</h4>
              <p class="text-gray-600 leading-relaxed">
                Сайт не является публичной офертой в соответствии со ст. 437 ГК РФ.
                Цены указаны для ознакомления. Актуальную стоимость уточняйте в салоне
                или у менеджеров компании.
              </p>
            </div>

            <div class="border-t border-gray-100 pt-5">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Контакты</h4>
              <p class="text-gray-600 leading-relaxed">
                г. Челябинск, ул. Братьев Кашириных, 131Б<br />
                Телефон: <a :href="`tel:${PHONE.raw}`" class="text-teal-600 hover:underline">{{ PHONE.label }}</a><br />
                Email: <a :href="`mailto:${SITE.email}`" class="text-teal-600 hover:underline">{{ SITE.email }}</a><br />
                Сайт: <a :href="SITE.url" class="text-teal-600 hover:underline">{{ SITE.host }}</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Developer modal ──
         Тёмная карточка в тон футеру, из которого открывается. Главный
         аргумент — не слова, а сам сайт: живой замер Core Web Vitals
         этой страницы в браузере посетителя. Дальше — факты (опыт,
         образование, стек, направления) и контакты. На мобильном —
         bottom sheet (удобно большим пальцем), на ПК — по центру. -->
    <Transition name="dev-modal">
      <div
        v-if="isDevModalOpen"
        class="fixed inset-0 z-100 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
        role="presentation"
        @click="closeDevModal"
      >
        <div
          ref="devPanelEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dev-modal-title"
          class="dev-panel relative w-full max-w-md overflow-hidden rounded-t-3xl bg-graphite text-white ring-1 ring-white/10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl"
          @click.stop
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors duration-200 hover:bg-white/15 hover:text-white"
            aria-label="Закрыть окно разработчика"
            @click="closeDevModal"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="max-h-[88dvh] overflow-y-auto overscroll-contain px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-6 sm:max-h-[85vh] sm:px-7 sm:pb-7 sm:pt-7">

            <!-- Хват-полоска bottom sheet (только мобильный) -->
            <div class="mx-auto -mt-2 mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" aria-hidden="true" />

            <!-- Шапка -->
            <div class="flex items-center gap-4 pr-10">
              <img
                src="/renders/about/avatar-al-2-160.webp"
                alt="Анатолий Липин"
                width="160"
                height="160"
                loading="lazy"
                decoding="async"
                class="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
              />
              <div class="min-w-0">
                <h3 id="dev-modal-title" class="m-0 text-xl font-medium tracking-tight text-white">Анатолий Липин</h3>
                <p class="m-0 mt-0.5 text-sm text-white/55">Разработчик сайтов и сервисов</p>
              </div>
            </div>

            <!-- Главный аргумент: этот сайт -->
            <p class="m-0 mt-6 text-[0.9375rem] leading-relaxed text-white/80">
              Этот сайт — моя работа. Вот как он загрузился у вас:
            </p>

            <div v-if="vitals.length" class="mt-3 overflow-hidden rounded-2xl bg-graphite-card ring-1 ring-white/8">
              <dl class="m-0 grid grid-cols-2">
                <div
                  v-for="(v, i) in vitals"
                  :key="v.key"
                  class="px-4 py-3.5"
                  :class="[
                    i % 2 === 1 ? 'border-l border-white/8' : '',
                    i > 1 ? 'border-t border-white/8' : '',
                  ]"
                >
                  <dt class="m-0 text-xs text-white/50">
                    {{ v.label }} <span class="font-mono text-white/30">{{ v.abbr }}</span>
                  </dt>
                  <dd class="m-0 mt-1 flex items-baseline gap-2">
                    <span class="font-mono text-xl font-medium tabular-nums text-white">{{ v.value }}</span>
                    <span v-if="v.good" class="text-xs font-medium text-teal-400">хорошо</span>
                  </dd>
                </div>
              </dl>
              <p class="m-0 border-t border-white/8 px-4 py-2.5 text-[0.6875rem] leading-snug text-white/40">
                Core Web Vitals этой страницы, измерены в вашем браузере прямо сейчас.
              </p>
            </div>

            <!-- Стек этого сайта -->
            <p class="m-0 mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40">Стек этого сайта</p>
            <ul class="m-0 mt-2.5 flex list-none flex-wrap gap-1.5 p-0" role="list">
              <li
                v-for="tech in DEV_STACK"
                :key="tech"
                class="rounded-lg px-2.5 py-1 font-mono text-xs text-white/75 ring-1 ring-white/12"
              >{{ tech }}</li>
            </ul>

            <!-- Опыт и образование -->
            <div class="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 border-t border-white/8 pt-5">
              <p class="m-0 font-mono text-2xl font-medium leading-none tabular-nums text-white">5+</p>
              <p class="m-0 self-center text-sm text-white/70">лет опыта в разработке</p>
              <p class="m-0 font-mono text-2xl font-medium leading-none text-white">ПМИ</p>
              <p class="m-0 text-sm leading-relaxed text-white/70">
                Прикладная математика и информатика — бакалавриат и магистратура,
                направление «Математическое моделирование и искусственный интеллект»
              </p>
            </div>

            <!-- Направления -->
            <p class="m-0 mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40">Что разрабатываю</p>
            <ul class="m-0 mt-2 list-none p-0" role="list">
              <li
                v-for="item in DEV_SERVICES"
                :key="item"
                class="flex items-start gap-3 border-b border-white/8 py-2 text-sm text-white/80 last:border-b-0"
              >
                <span class="mt-[0.6em] h-px w-3 shrink-0 bg-teal-400" aria-hidden="true" />
                <span>{{ item }}</span>
              </li>
            </ul>

            <!-- Контакты -->
            <div class="mt-6 flex flex-col gap-2">
              <a
                :href="DEV_CONTACTS.telegram"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center justify-between gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-teal-400"
              >
                Написать в Telegram
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-200 group-hover:translate-x-0.5">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </a>
              <div class="grid grid-cols-2 gap-2">
                <a
                  :href="`mailto:${DEV_CONTACTS.email}`"
                  :title="DEV_CONTACTS.email"
                  :aria-label="`Написать на почту ${DEV_CONTACTS.email}`"
                  class="flex h-11 items-center justify-center rounded-full text-sm font-medium text-white/80 ring-1 ring-white/15 transition-colors duration-200 hover:bg-white/8 hover:text-white"
                >Почта</a>
                <a
                  :href="DEV_CONTACTS.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex h-11 items-center justify-center rounded-full text-sm font-medium text-white/80 ring-1 ring-white/15 transition-colors duration-200 hover:bg-white/8 hover:text-white"
                >GitHub</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>

  </footer>
</template>

<style scoped>
/* Модалка разработчика: на мобильном выезжает снизу (bottom sheet),
   на ПК — лёгкий подъём с прозрачностью. */
.dev-modal-enter-active,
.dev-modal-leave-active {
  transition: opacity 220ms ease;
}
.dev-modal-enter-active .dev-panel,
.dev-modal-leave-active .dev-panel {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.dev-modal-enter-from,
.dev-modal-leave-to {
  opacity: 0;
}
.dev-modal-enter-from .dev-panel,
.dev-modal-leave-to .dev-panel {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .dev-modal-enter-from .dev-panel,
  .dev-modal-leave-to .dev-panel {
    transform: translateY(12px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dev-modal-enter-active .dev-panel,
  .dev-modal-leave-active .dev-panel {
    transition: none;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
/* Модальное окно тоже анимируем — лёгкий scale */
.modal-enter-from :deep(.bg-white),
.modal-leave-to   :deep(.bg-white) {
  transform: scale(0.97);
}
.modal-enter-active :deep(.bg-white),
.modal-leave-active :deep(.bg-white) {
  transition: transform 200ms ease;
}
</style>