<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'
import { SITE } from '../../config/site'

/* ============================================================
   Constants
   ============================================================ */
const headerEl = ref<HTMLElement | null>(null)

const LOGO_URL = '/svg/logo.svg'

const SOCIAL_NETWORKS = [
  {
    name: 'VK',
    label: 'ВКонтакте',
    url: SITE.social.vk,
    icon: '/icons/b_vk_logo.webp',
  },
  {
    name: 'Telegram',
    label: 'Telegram',
    url: SITE.social.telegram,
    icon: '/icons/b_tg_logo.webp',
  },
  {
    name: 'MAX',
    label: 'Max',
    url: SITE.social.max,
    icon: '/icons/b_max_logo.webp',
  },
] as const

const CONTACTS = {
  phones:  companyLegalInfo.contacts.phone,
  address: companyLegalInfo.address.legal,
  entrance: companyLegalInfo.address.entrance,
  /** Будни/выходные — отдельные строки, а не одна склеенная через «·»:
      на узкой карточке попапа она переносилась посередине слова, неровно. */
  worktimeWeekdays: companyLegalInfo.workingHours.weekdays.label,
  worktimeWeekend:  `Сб–Вс: ${companyLegalInfo.workingHours.saturday.opens}–${companyLegalInfo.workingHours.saturday.closes}`,
  email:   companyLegalInfo.contacts.email,
}

const NAV_LINKS = [
  { href: '/',            label: 'Главная' },
  { href: '/catalog/',    label: 'Каталог' },
  { href: '/partitions/', label: 'Перегородки' },
  { href: '/designers/',  label: 'Дизайнерам' },
  { href: '/about/',      label: 'О нас' },
  { href: '/contacts/',   label: 'Контакты' },
] as const

const CATALOG_DROPDOWN = [
  { href: '/catalog/',               label: 'Все двери',      desc: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери', desc: 'Скрытый монтаж' },
  { href: '/vhodnye-dveri/',         label: 'Входные двери', desc: 'С монтажом' },
  { href: '/catalog/decor/',         label: 'Декор',         desc: 'Плинтус, фрамуги, рейки' },
] as const

const ABOUT_DROPDOWN = [
  { href: '/about/',     label: 'О салоне',   desc: 'Адрес, реквизиты, руководство' },
  { href: '/o-fabrike/', label: 'О фабрике',  desc: 'Производитель дверей ВФД' },
] as const

const WORK_SCHEDULE = {
  weekday: { open: 10, close: 20 }, // Пн-Пт: 10:00-20:00
  weekend: { open: 10, close: 18 }, // Сб-Вс: 10:00-18:00
} as const

/* ============================================================
   State
   ============================================================ */
const scrolled     = ref(false)
const mobileOpen   = ref(false)
const contactsOpen = ref(false)
const catalogOpen  = ref(false)
let   catalogTimer: ReturnType<typeof setTimeout> | null = null
const aboutOpen    = ref(false)
let   aboutTimer: ReturnType<typeof setTimeout> | null = null
const logoLoaded   = ref(false)
const logoError    = ref(false)

const now          = ref(new Date())
const currentPath  = ref('/')

const contactsBtnRef   = ref<HTMLButtonElement | null>(null)
const contactsPanelRef = ref<HTMLDivElement | null>(null)
const mobileMenuRef    = ref<HTMLDivElement | null>(null)
const burgerBtnRef     = ref<HTMLButtonElement | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null

/* ============================================================
   Active link
   ============================================================ */
const isActive = (href: string) => currentPath.value === href

/* ============================================================
   Work-hours logic
   ============================================================ */
const getScheduleForDay = (date: Date) => {
  const day = date.getDay()
  if (day === 0 || day === 6) return WORK_SCHEDULE.weekend // Сб-Вс
  return WORK_SCHEDULE.weekday                               // Пн-Пт
}

const schedule = computed(() => getScheduleForDay(now.value))

const isOpen = computed(() => {
  const h = now.value.getHours()
  const s = schedule.value
  return h >= s.open && h < s.close
})

const pad2 = (h: number) => `${String(h).padStart(2, '0')}:00`

/* Статус — обычным текстом, без индикатора-точки и тревожной красной
   заливки: закрытый вечером салон — штатная ситуация, а не ошибка.
   Посекундный обратный отсчёт убран — полезнее время закрытия. */
const statusTitle = computed(() => (isOpen.value ? 'Сейчас открыто' : 'Сейчас закрыто'))

const statusDetail = computed(() => {
  const s = schedule.value
  if (isOpen.value) return `Работаем до ${pad2(s.close)}`

  // Ещё не наступило время открытия сегодня
  if (now.value.getHours() < s.open) return `Откроемся сегодня в ${pad2(s.open)}`

  // Уже закрылись — смотрим на завтра
  const tomorrow = new Date(now.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `Откроемся завтра в ${pad2(getScheduleForDay(tomorrow).open)}`
})

/* ============================================================
   Handlers
   ============================================================ */
/* Раньше высота считалась хардкодом (72 + 16px top-offset), без учёта
   env(safe-area-inset-top) — на iOS с чёлкой/Dynamic Island реальный низ
   шапки оказывался кратно ниже расчётных 88px, и SectionNav (плавающая
   пилюля-навигация на /catalog, /partitions), позиционированный по
   --header-height, наслаивался прямо на шапку вместо появления под ней.
   Меряем реальный DOM-элемент — единственный источник истины, учитывающий
   safe-area, перенос строк и любые будущие правки разметки шапки. */
const setHeaderVar = () => {
  if (!headerEl.value) return
  const rect = headerEl.value.getBoundingClientRect()
  document.documentElement.style.setProperty('--header-height', `${Math.ceil(rect.bottom)}px`)
}

const onScroll = () => { scrolled.value = window.scrollY > 20 }

const onResize = () => {
  setHeaderVar()
  if (window.innerWidth >= 1280) {
    closeMobileMenu()
    // Закрываем contacts-попап тоже — он hidden на мобильном через CSS,
    // но state может остаться true если resized с открытым мобильным меню
    closeContacts(false)
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  // Закрываем только верхний слой
  if (contactsOpen.value) { closeContacts(); return }
  if (mobileOpen.value)   { closeMobileMenu() }
}

const onClickOutside = (e: MouseEvent) => {
  const t = e.target as Node

  if (
    contactsOpen.value &&
    contactsPanelRef.value &&
    !contactsPanelRef.value.contains(t) &&
    !contactsBtnRef.value?.contains(t)
  ) closeContacts(false)

  if (
    mobileOpen.value &&
    mobileMenuRef.value &&
    !mobileMenuRef.value.contains(t) &&
    !burgerBtnRef.value?.contains(t)
  ) closeMobileMenu()
}

const openMobileMenu   = () => { mobileOpen.value = true;  document.body.style.overflow = 'hidden' }
const closeMobileMenu  = () => { mobileOpen.value = false; document.body.style.overflow = '' }
const toggleMobileMenu = () => mobileOpen.value ? closeMobileMenu() : openMobileMenu()

const openCatalog  = () => { if (catalogTimer !== null) clearTimeout(catalogTimer); catalogOpen.value = true }
const closeCatalog = () => { catalogTimer = setTimeout(() => { catalogOpen.value = false }, 150) }

const openAbout  = () => { if (aboutTimer !== null) clearTimeout(aboutTimer); aboutOpen.value = true }
const closeAbout = () => { aboutTimer = setTimeout(() => { aboutOpen.value = false }, 150) }

const openContacts = async () => {
  contactsOpen.value = true
  await nextTick()
  contactsPanelRef.value
    ?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')
    ?.focus()
}
const closeContacts = (returnFocus = true) => {
  contactsOpen.value = false
  // Возвращаем фокус на кнопку только при закрытии с клавиатуры (Escape) —
  // иначе после клика мышью (вне попапа или по ссылке внутри) на кнопке
  // повисает focus-visible обводка, хотя пользователь работал мышью.
  if (returnFocus) contactsBtnRef.value?.focus()
}
const toggleContacts = () => contactsOpen.value ? closeContacts() : openContacts()

// Используем первый телефон — optional chaining страхует от пустого массива
const callPrimary = () => {
  const phone = CONTACTS.phones[0]
  if (phone) window.location.href = `tel:${phone.raw}`
}

/* ============================================================
   Lifecycle
   ============================================================ */
onMounted(() => {
  currentPath.value = window.location.pathname
  setHeaderVar()
  nextTick(setHeaderVar)
  window.addEventListener('scroll',  onScroll,       { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize',  onResize,       { passive: true })
  document.addEventListener('click', onClickOutside, { capture: true })
  timerId = setInterval(() => { now.value = new Date() }, 30_000)
})

onUnmounted(() => {
  window.removeEventListener('scroll',  onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize',  onResize)
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.body.style.overflow = ''
  if (timerId !== null) clearInterval(timerId)
  if (catalogTimer !== null) clearTimeout(catalogTimer)
  if (aboutTimer !== null) clearTimeout(aboutTimer)
})
</script>

<template>
  <header
    ref="headerEl"
    class="fixed inset-x-0 z-50"
    :style="{
      top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
      paddingLeft:  'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    }"
  >
    <div class="container">

      <!-- ── Pill bar ── -->
      <div
        class="flex items-center justify-between rounded-full border px-5 py-3 transition-all duration-300"
        :class="scrolled
          ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)]'
          : 'bg-white/88 backdrop-blur-sm border-gray-200'"
      >

        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 shrink-0 group" aria-label="ВФД на Кашириных — главная">
          <div class="relative w-9 h-9 flex items-center justify-center">
            <div
              v-if="!logoLoaded && !logoError"
              class="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"
              aria-hidden="true"
            />
            <img
              v-if="!logoError"
              :src="LOGO_URL"
              alt=""
              class="h-9 w-auto object-contain transition-opacity duration-300"
              :class="logoLoaded ? 'opacity-100' : 'opacity-0'"
              width="36"
              height="36"
              loading="eager"
              decoding="async"
              @load="logoLoaded = true"
              @error="logoError = true"
            />
            <!-- Fallback если картинка не загрузилась -->
            <div
              v-if="logoError"
              class="w-9 h-9 rounded-lg bg-linear-to-br from-gray-700 to-gray-900
                     text-white flex items-center justify-center text-xs font-semibold"
              aria-hidden="true"
            >
              ВФД
            </div>
          </div>
          <span
            class="hidden sm:block overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide
                   transition-colors duration-300 ease-in-out
                   group-hover:text-teal-600"
          >
            ДВЕРИ НА КАШИРИНЫХ
          </span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden xl:flex gap-7 text-sm" aria-label="Основная навигация">
          <template v-for="link in NAV_LINKS" :key="link.href">

            <!-- Обычная ссылка — та же приподнятая подложка на hover, что
                 у пунктов дропдаунов ниже: голый color-transition терялся
                 на фоне остального сайта, где hover почти everywhere несёт
                 фон, а не только смену цвета текста. -->
            <a
              v-if="link.href !== '/catalog/' && link.href !== '/about/'"
              :href="link.href"
              class="-mx-2.5 -my-1.5 rounded-lg px-2.5 py-1.5 transition-colors duration-200"
              :class="isActive(link.href)
                ? 'text-gray-900 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
              :aria-current="isActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</a>

            <!-- Каталог с дропдауном -->
            <div
              v-else-if="link.href === '/catalog/'"
              class="relative"
              @mouseenter="openCatalog"
              @mouseleave="closeCatalog"
              @focusin="openCatalog"
              @focusout="closeCatalog"
            >
              <a
                :href="link.href"
                class="group/nav flex items-center gap-0.5 -mx-2.5 -my-1.5 rounded-lg px-2.5 py-1.5 transition-colors duration-200"
                :class="currentPath.startsWith('/catalog')
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                :aria-haspopup="true"
                :aria-expanded="catalogOpen"
              >
                {{ link.label }}
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200 group-hover/nav:translate-y-px"
                  :class="{ 'rotate-180': catalogOpen }"
                  viewBox="0 0 24 24" fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <Transition name="fade-slide">
                <div
                  v-if="catalogOpen"
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl
                         bg-white border border-gray-100 shadow-lg shadow-black/5 p-1.5 z-50"
                  role="menu"
                  aria-label="Категории каталога"
                >
                  <a
                    v-for="item in CATALOG_DROPDOWN"
                    :key="item.href"
                    :href="item.href"
                    class="flex flex-col px-3.5 py-2.5 rounded-xl hover:bg-gray-50
                           transition-colors duration-150 text-left"
                    role="menuitem"
                    @click="catalogOpen = false"
                  >
                    <span class="text-sm font-semibold text-gray-900">{{ item.label }}</span>
                    <span class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</span>
                  </a>
                </div>
              </Transition>
            </div>

            <!-- О нас с дропдауном (О салоне / О фабрике) -->
            <div
              v-else
              class="relative"
              @mouseenter="openAbout"
              @mouseleave="closeAbout"
              @focusin="openAbout"
              @focusout="closeAbout"
            >
              <a
                :href="link.href"
                class="group/nav flex items-center gap-0.5 -mx-2.5 -my-1.5 rounded-lg px-2.5 py-1.5 transition-colors duration-200"
                :class="currentPath.startsWith('/about') || currentPath.startsWith('/o-fabrike')
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                :aria-haspopup="true"
                :aria-expanded="aboutOpen"
              >
                {{ link.label }}
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200 group-hover/nav:translate-y-px"
                  :class="{ 'rotate-180': aboutOpen }"
                  viewBox="0 0 24 24" fill="none"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <Transition name="fade-slide">
                <div
                  v-if="aboutOpen"
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl
                         bg-white border border-gray-100 shadow-lg shadow-black/5 p-1.5 z-50"
                  role="menu"
                  aria-label="О компании"
                >
                  <a
                    v-for="item in ABOUT_DROPDOWN"
                    :key="item.href"
                    :href="item.href"
                    class="flex flex-col px-3.5 py-2.5 rounded-xl hover:bg-gray-50
                           transition-colors duration-150 text-left"
                    role="menuitem"
                    @click="aboutOpen = false"
                  >
                    <span class="text-sm font-semibold text-gray-900">{{ item.label }}</span>
                    <span class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</span>
                  </a>
                </div>
              </Transition>
            </div>

          </template>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">

          <!-- Desktop actions -->
          <div class="hidden xl:flex items-center gap-3">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
              class="flex h-9 w-9 items-center justify-center rounded-full transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-gray-50"
            >
              <img :src="s.icon" :alt="s.label" class="w-7 h-7" width="28" height="28" loading="eager" fetchpriority="high" />
            </a>

            <!-- Contacts dropdown -->
            <div class="relative">
              <button
                ref="contactsBtnRef"
                type="button"
                class="btn btn-primary"
                aria-haspopup="dialog"
                :aria-expanded="contactsOpen"
                aria-controls="contacts-panel"
                @click="toggleContacts"
              >
                Связаться
              </button>

              <!-- Contacts popover — outer shell (double-bezel) держит мягкую
                   подложку и hairline-рамку, inner-карточки внутри группируют
                   телефоны/адрес отдельно от статуса и CTA. -->
              <Transition name="fade-slide">
                <div
                  v-if="contactsOpen"
                  id="contacts-panel"
                  ref="contactsPanelRef"
                  role="dialog"
                  aria-label="Контактная информация"
                  aria-modal="false"
                  class="absolute top-full right-0 mt-2.5 w-80 rounded-3xl
                         bg-white/95 backdrop-blur-xl ring-1 ring-black/5
                         shadow-[0_24px_60px_-16px_rgba(15,23,42,0.22)] p-1.5 z-50"
                >
                  <div class="rounded-[1.25rem] bg-white p-5 space-y-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">

                    <div>
                      <p class="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-2">Телефоны</p>
                      <div class="flex flex-col gap-1">
                        <a
                          v-for="p in CONTACTS.phones"
                          :key="p.raw"
                          :href="`tel:${p.raw}`"
                          class="group flex items-center gap-3 rounded-xl px-2 py-2 -mx-2
                                 font-semibold text-gray-800 hover:bg-teal-50/70 hover:text-teal-700
                                 transition-colors duration-200"
                        >
                          <img src="/icons/phone-call.webp" alt="" class="w-8 h-8 shrink-0" loading="eager" fetchpriority="high" />
                          {{ p.label }}
                        </a>
                      </div>
                    </div>

                    <!-- Раньше это были две узкие колонки (grid-cols-2) —
                         пятистрочный адрес с "вход со стороны" и часы работы
                         в одну склеенную через «·» строку рвались неровно на
                         такой ширине. Вертикальный стек читается спокойнее. -->
                    <div class="flex flex-col gap-2.5">
                      <div class="rounded-xl bg-gray-50 p-3.5">
                        <p class="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Адрес</p>
                        <p class="text-gray-800 leading-snug text-step-0">{{ CONTACTS.address }}</p>
                        <p class="text-gray-500 leading-snug text-xs mt-0.5">{{ CONTACTS.entrance }}</p>
                      </div>
                      <div class="rounded-xl bg-gray-50 p-3.5">
                        <p class="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Часы работы</p>
                        <p class="text-gray-800 leading-snug text-step-0">{{ CONTACTS.worktimeWeekdays }}</p>
                        <p class="text-gray-500 leading-snug text-xs mt-0.5">{{ CONTACTS.worktimeWeekend }}</p>
                        <p
                          class="mt-3 border-t border-gray-200/80 pt-2.5 text-sm leading-snug"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <span class="font-semibold" :class="isOpen ? 'text-teal-700' : 'text-gray-900'">{{ statusTitle }}</span>
                          <span class="block text-gray-500">{{ statusDetail }}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p class="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1.5">Email</p>
                      <a
                        :href="`mailto:${CONTACTS.email}`"
                        class="font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-teal-600 hover:decoration-teal-400 transition-colors duration-200"
                      >
                        {{ CONTACTS.email }}
                      </a>
                    </div>

                    <a
                      href="/contacts/"
                      class="group flex items-center justify-between gap-3 rounded-full bg-ink pl-5 pr-1.5 py-1.5
                             font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
                      @click="closeContacts(false)"
                    >
                      Перейти к контактам
                      <span
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15
                               transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </a>

                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Mobile: socials + burger -->
          <div class="xl:hidden flex items-center gap-2.5 ml-auto">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (открывается в новой вкладке)`"
            >
              <img :src="s.icon" :alt="s.label" class="w-7 h-7" width="28" height="28" loading="eager" fetchpriority="high" />
            </a>

            <button
              ref="burgerBtnRef"
              type="button"
              class="burger-btn w-10 h-10 flex items-center justify-center rounded-xl
                     hover:bg-gray-100 transition-colors shrink-0"
              :class="{ 'is-open': mobileOpen }"
              :aria-expanded="mobileOpen"
              :aria-label="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
              aria-controls="mobile-menu"
              @click="toggleMobileMenu"
            >
              <!-- Три линии, трансформируются в крестик через CSS вместо
                   переключения двух разных svg — плавная анимация вместо
                   резкой замены иконки. aria-hidden — смысл несёт
                   aria-label кнопки. -->
              <span class="burger-icon" aria-hidden="true">
                <span class="burger-icon__line" />
                <span class="burger-icon__line" />
                <span class="burger-icon__line" />
              </span>
            </button>
          </div>

        </div>
      </div>

    </div><!-- /container -->

    <!-- ── Mobile menu — полноэкранная тёмная панель (не плавающая карточка):
         своя шапка (метка города + закрыть), звонок и соцсети сверху,
         прокручиваемая навигация в середине, номер телефона закреплён внизу.
         Teleport на body: внутри <header z-50> собственный z-index панели
         (10000) сравнивался бы только относительно других детей header —
         cookie-баннер (z-index:9999) висит в root, вне header, и перекрывал
         бы панель, будь она вложена. -->
    <!-- top:-100px + компенсирующий paddingTop ниже: iOS Safari закрашивает
         зону safe-area (чёлку) отдельным композитинг-проходом, привязанным
         к границе вьюпорта — если фон fixed-элемента начинается ровно на
         top:0, при появлении элемента эта полоса на кадр-два остаётся
         непрокрашенной (виден фон страницы под меню). translateZ(0)/GPU-слой
         это не чинит — проблема не в промоутинге слоя, а в самой границе.
         Уводим фон на 100px выше вьюпорта (граница исчезает, чёлка — уже
         середина закрашенной области, а не край) и добавляем те же 100px
         к paddingTop, чтобы контент визуально остался на прежнем месте. -->
    <Teleport to="body">
    <Transition name="menu-fade">
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        ref="mobileMenuRef"
        role="dialog"
        aria-label="Мобильное меню"
        aria-modal="true"
        class="xl:hidden fixed inset-0 z-10000 flex flex-col bg-zinc-900"
        :style="{
          top:           '-100px',
          paddingTop:    'calc(env(safe-area-inset-top, 0px) + 100px)',
          paddingLeft:   'env(safe-area-inset-left)',
          paddingRight:  'env(safe-area-inset-right)',
        }"
      >
        <!-- Верхняя строка: город + адрес + закрыть -->
        <div class="flex items-start justify-between px-5 pt-4 pb-6 shrink-0">
          <span class="flex flex-col gap-0.5">
            <span class="flex items-center gap-1.5 text-sm font-medium text-white/70">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/>
                <circle cx="12" cy="9.5" r="2.25" stroke-linecap="round"/>
              </svg>
              Челябинск
            </span>
            <span class="pl-5.5 text-xs text-white/40">ул. Братьев Кашириных, 131Б</span>
          </span>
          <button
            type="button"
            class="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Закрыть меню"
            @click="closeMobileMenu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Звонок + соцсети -->
        <div class="flex items-center gap-2.5 px-5 pb-4 shrink-0">
          <a
            :href="`tel:${CONTACTS.phones[0]?.raw}`"
            class="flex-1 flex items-center justify-center gap-2 rounded-full bg-white text-ink font-semibold text-sm py-3 transition-opacity active:opacity-80"
            @click="closeMobileMenu"
          >
            <img src="/icons/phone-call.webp" alt="" class="w-5 h-5" width="20" height="20" loading="eager" fetchpriority="high" />
            Позвонить
          </a>
          <a
            v-for="s in SOCIAL_NETWORKS"
            :key="s.name"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${s.label} (открывается в новой вкладке)`"
            class="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-white transition-opacity active:opacity-80"
          >
            <img :src="s.icon" :alt="s.label" class="w-5 h-5" width="20" height="20" loading="eager" fetchpriority="high" />
          </a>
        </div>

        <!-- Навигация — прокручиваемая середина. Активный пункт получает
             акцентную полоску слева (не только смену цвета текста — на
             белом-по-серому разница слишком тонкая для беглого взгляда).
             Стрелка вправо — только у пунктов с реальным переходом (без
             подменю); у «Каталог»/«О нас» её нет — там ниже сразу видны
             дочерние ссылки, стрелка-«обещание перехода» была бы обманчива. -->
        <nav class="flex-1 overflow-y-auto px-5" aria-label="Мобильная навигация">
          <ul class="border-t border-white/10" role="list">
            <li v-for="link in NAV_LINKS" :key="link.href" class="nav-item border-b border-white/10" :class="{ 'nav-item--active': isActive(link.href) }">
              <a
                :href="link.href"
                class="flex items-center justify-between py-4 pl-3 -ml-3 text-base font-semibold transition-colors"
                :class="isActive(link.href) ? 'text-white' : 'text-white/85 hover:text-white'"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                @click="closeMobileMenu"
              >
                {{ link.label }}
                <svg
                  v-if="link.href !== '/catalog/' && link.href !== '/about/'"
                  class="w-4 h-4 shrink-0 text-white/30"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
                </svg>
              </a>
              <!-- Подразделы каталога -->
              <ul v-if="link.href === '/catalog/'" class="mb-3 -mt-1 space-y-0.5" role="list">
                <li v-for="item in CATALOG_DROPDOWN" :key="item.href">
                  <a
                    :href="item.href"
                    class="block rounded-xl px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90"
                    @click="closeMobileMenu"
                  >{{ item.label }}</a>
                </li>
              </ul>
              <!-- Подразделы «О нас» -->
              <ul v-if="link.href === '/about/'" class="mb-3 -mt-1 space-y-0.5" role="list">
                <li v-for="item in ABOUT_DROPDOWN" :key="item.href">
                  <a
                    :href="item.href"
                    class="block rounded-xl px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90"
                    @click="closeMobileMenu"
                  >{{ item.label }}</a>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Статус салона + график. Та же поверхность и круглая иконка,
               что у кнопок телефонов внизу — единый язык карточек меню. -->
          <div
            class="mt-4 mb-5 rounded-xl bg-white/[0.06] px-4 py-3.5 text-sm leading-snug"
            aria-live="polite"
            aria-atomic="true"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                :class="isOpen ? 'bg-teal-400/15 text-teal-300' : 'bg-white/10 text-white'"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="font-semibold" :class="isOpen ? 'text-teal-300' : 'text-white'">{{ statusTitle }}</p>
                <p class="text-white/55">{{ statusDetail }}</p>
              </div>
            </div>
            <p class="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 border-t border-white/10 pt-2.5 text-xs text-white/45 tabular-nums">
              <span>{{ CONTACTS.worktimeWeekdays }}</span>
              <span>{{ CONTACTS.worktimeWeekend }}</span>
            </p>
          </div>
        </nav>

        <!-- Телефоны — закреплены внизу. Каждый номер — отдельная
             кнопка звонка: подпись + иконка трубки, чтобы было видно,
             что это действие, а не просто текст. -->
        <div
          class="shrink-0 border-t border-white/10 bg-zinc-900 px-5 pt-3 flex flex-col gap-2"
          :style="{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }"
        >
          <a
            v-for="p in CONTACTS.phones"
            :key="p.raw"
            :href="`tel:${p.raw}`"
            :aria-label="`Позвонить: ${p.label}`"
            class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-4 py-2.5 transition-colors active:bg-white/[0.12]"
            @click="closeMobileMenu"
          >
            <span class="min-w-0">
              <span class="block text-base font-semibold text-white tabular-nums">{{ p.label }}</span>
              <span class="block text-xs text-white/45">{{ p.title }}</span>
            </span>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </Transition>
    </Teleport>

  </header>
</template>

<style scoped>
/* ── Burger → крестик: 3 линии transform'ятся вместо переключения svg ── */
.burger-icon {
  position: relative;
  display: block;
  width: 1.125rem;
  height: 0.8125rem;
}
.burger-icon__line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .2s ease, top .28s cubic-bezier(.4,0,.2,1);
}
.burger-icon__line:nth-child(1) { top: 0; }
.burger-icon__line:nth-child(2) { top: 50%; transform: translateY(-50%); }
.burger-icon__line:nth-child(3) { top: 100%; transform: translateY(-100%); }

.burger-btn.is-open .burger-icon__line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
.burger-btn.is-open .burger-icon__line:nth-child(2) {
  opacity: 0;
}
.burger-btn.is-open .burger-icon__line:nth-child(3) {
  top: 50%;
  transform: translateY(-50%) rotate(-45deg);
}

/* Уважение к prefers-reduced-motion — линии просто переключаются без анимации */
@media (prefers-reduced-motion: reduce) {
  .burger-icon__line { transition: none; }
}

/* ── Активный пункт мобильной навигации — акцентная полоска слева.
   Смены цвета текста (white/85 → white) недостаточно для быстрого
   сканирования списка — полоска даёт однозначный визуальный якорь. */
.nav-item {
  position: relative;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: -1.25rem;
  top: 0.875rem;
  bottom: 0.875rem;
  width: 3px;
  border-radius: 2px;
  background: var(--color-accent, #14b8a6);
}
</style>
