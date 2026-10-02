<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo } from '../../lib/contacts-data'
import { SITE } from '../../config/site'

/* ============================================================
   Constants
   ============================================================ */
const headerEl = ref<HTMLElement | null>(null)

const LOGO_URL = '/svg/logo.svg'

/* Единственная соцсеть салона — Telegram-канал (см. SITE.social) */
const SOCIAL_NETWORKS = [
  {
    name: 'Telegram',
    label: 'Telegram-канал',
    url: SITE.social.telegram,
    icon: '/icons/b_tg_logo.webp',
  },
] as const

const CONTACTS = {
  phones:  companyLegalInfo.contacts.phone,
  address: companyLegalInfo.address.postal,
  entrance: companyLegalInfo.address.entrance,
  /** Салон работает ежедневно по одному графику — одна строка */
  worktime: companyLegalInfo.workingHours.shortDisplay,
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

/* На десктопе «Главная» не выводится — на главную ведёт логотип, а
   освободившееся место держит навигацию строго по центру панели. */
const DESKTOP_NAV = NAV_LINKS.filter(l => l.href !== '/')

const CATALOG_DROPDOWN = [
  { href: '/catalog/',               label: 'Все двери',      desc: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери', desc: 'Скрытый монтаж' },
  { href: '/catalog/decor/',         label: 'Декор',         desc: 'Плинтус, фрамуги, рейки' },
] as const

const ABOUT_DROPDOWN = [
  { href: '/about/',     label: 'О салоне',   desc: 'Шоу-рум в ТЦ «Компас»' },
  { href: '/o-fabrike/', label: 'О фабрике',  desc: 'Производитель дверей ВФД' },
] as const

/* Часы — из contacts-data (единственный источник), а не числами здесь:
   раньше тут жил старый график 10–20/10–18, расходившийся с остальным сайтом. */
const hourOf = (hhmm: string) => Number(hhmm.split(':')[0])
const WORK_SCHEDULE = {
  weekday: { open: hourOf(companyLegalInfo.workingHours.weekdays.opens), close: hourOf(companyLegalInfo.workingHours.weekdays.closes) },
  weekend: { open: hourOf(companyLegalInfo.workingHours.saturday.opens), close: hourOf(companyLegalInfo.workingHours.saturday.closes) },
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

/* Активный раздел для точки под пунктом: каталог и «О нас» подсвечиваются
   и на вложенных страницах (/catalog/series/…, /o-fabrike/). */
const isSection = (href: string) => {
  if (href === '/catalog/') return currentPath.value.startsWith('/catalog') || currentPath.value.startsWith('/models')
  if (href === '/about/')   return currentPath.value.startsWith('/about') || currentPath.value.startsWith('/o-fabrike')
  return isActive(href)
}

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
      top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
      paddingLeft:  'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    }"
  >
    <div class="container">

      <!-- ── Графитовая панель. Ширина = контейнер, как у сцены hero под ней:
           шапка и первый экран читаются одним блоком. Сетка 1fr / auto / 1fr
           держит навигацию строго по центру независимо от ширины краёв. ── -->
      <div class="hdr" :class="{ 'hdr--scrolled': scrolled }">

        <!-- Бренд: знак + две строки -->
        <a href="/" class="hdr-brand" :aria-label="`${SITE.studioName} — салон ВФД в ТЦ «Компас», главная`">
          <span class="hdr-mark" aria-hidden="true">
            <img
              v-if="!logoError"
              :src="LOGO_URL"
              alt=""
              width="36"
              height="36"
              loading="eager"
              decoding="async"
              :class="logoLoaded ? 'opacity-100' : 'opacity-0'"
              @load="logoLoaded = true"
              @error="logoError = true"
            />
            <span v-else class="hdr-mark__fallback">ВФД</span>
          </span>
          <span class="hdr-brand__text">
            <span class="hdr-brand__name">{{ SITE.studioName }}</span>
            <span class="hdr-brand__sub">Салон ВФД в {{ SITE.address.mall }}</span>
          </span>
        </a>

        <!-- Навигация (десктоп) -->
        <nav class="hdr-nav" aria-label="Основная навигация">
          <template v-for="link in DESKTOP_NAV" :key="link.href">

            <a
              v-if="link.href !== '/catalog/' && link.href !== '/about/'"
              :href="link.href"
              class="hdr-link"
              :class="{ 'is-active': isSection(link.href) }"
              :aria-current="isActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</a>

            <!-- Каталог / О нас — с выпадающим списком -->
            <div
              v-else
              class="relative"
              @mouseenter="link.href === '/catalog/' ? openCatalog() : openAbout()"
              @mouseleave="link.href === '/catalog/' ? closeCatalog() : closeAbout()"
              @focusin="link.href === '/catalog/' ? openCatalog() : openAbout()"
              @focusout="link.href === '/catalog/' ? closeCatalog() : closeAbout()"
            >
              <a
                :href="link.href"
                class="hdr-link"
                :class="{ 'is-active': isSection(link.href) }"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                aria-haspopup="true"
                :aria-expanded="link.href === '/catalog/' ? catalogOpen : aboutOpen"
              >
                {{ link.label }}
                <svg
                  class="hdr-link__chev"
                  :class="{ 'rotate-180': link.href === '/catalog/' ? catalogOpen : aboutOpen }"
                  viewBox="0 0 24 24" fill="none" aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <Transition name="fade-slide">
                <div
                  v-if="link.href === '/catalog/' ? catalogOpen : aboutOpen"
                  class="hdr-drop"
                  role="menu"
                  :aria-label="link.href === '/catalog/' ? 'Категории каталога' : 'О компании'"
                >
                  <a
                    v-for="item in (link.href === '/catalog/' ? CATALOG_DROPDOWN : ABOUT_DROPDOWN)"
                    :key="item.href"
                    :href="item.href"
                    class="hdr-drop__item"
                    :class="{ 'is-active': isActive(item.href) }"
                    role="menuitem"
                    @click="catalogOpen = false; aboutOpen = false"
                  >
                    <span class="hdr-drop__label">{{ item.label }}</span>
                    <span class="hdr-drop__desc">{{ item.desc }}</span>
                  </a>
                </div>
              </Transition>
            </div>

          </template>
        </nav>

        <!-- Действия -->
        <div class="hdr-actions">

          <!-- Десктоп: телефон + «Связаться» -->
          <a
            v-if="CONTACTS.phones[0]"
            :href="`tel:${CONTACTS.phones[0].raw}`"
            class="hdr-phone"
            :aria-label="`Позвонить: ${CONTACTS.phones[0].label}`"
          >
            <svg class="hdr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span class="tabular-nums">{{ CONTACTS.phones[0].label }}</span>
          </a>

          <div class="relative hidden xl:block">
            <button
              ref="contactsBtnRef"
              type="button"
              class="hdr-cta"
              aria-haspopup="dialog"
              :aria-expanded="contactsOpen"
              aria-controls="contacts-panel"
              @click="toggleContacts"
            >
              Связаться
            </button>

            <Transition name="fade-slide">
              <div
                v-if="contactsOpen"
                id="contacts-panel"
                ref="contactsPanelRef"
                role="dialog"
                aria-label="Контактная информация"
                aria-modal="false"
                class="hdr-pop"
              >
                <a
                  v-for="p in CONTACTS.phones"
                  :key="p.raw"
                  :href="`tel:${p.raw}`"
                  class="hdr-pop__phone"
                >
                  <span class="hdr-pop__phone-num tabular-nums">{{ p.label }}</span>
                  <span class="hdr-pop__muted">{{ p.title }}</span>
                </a>

                <dl class="hdr-pop__list">
                  <div>
                    <dt>Адрес</dt>
                    <dd>{{ CONTACTS.address }}<span class="hdr-pop__muted">{{ CONTACTS.entrance }}</span></dd>
                  </div>
                  <div>
                    <dt>Часы</dt>
                    <dd aria-live="polite" aria-atomic="true">
                      {{ CONTACTS.worktime }}
                      <span class="hdr-pop__status" :class="{ 'is-open': isOpen }">{{ statusTitle }}. {{ statusDetail }}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Telegram</dt>
                    <dd>
                      <a :href="SITE.social.telegram" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        Канал {{ SITE.social.telegramHandle }}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd><a :href="`mailto:${CONTACTS.email}`" class="hdr-pop__link">{{ CONTACTS.email }}</a></dd>
                  </div>
                </dl>

                <a href="/contacts/" class="hdr-pop__cta" @click="closeContacts(false)">Все контакты и схема проезда</a>
              </div>
            </Transition>
          </div>

          <!-- Мобильные: звонок + меню -->
          <a
            v-if="CONTACTS.phones[0]"
            :href="`tel:${CONTACTS.phones[0].raw}`"
            class="hdr-round hdr-round--mobile"
            :aria-label="`Позвонить: ${CONTACTS.phones[0].label}`"
          >
            <svg class="hdr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <button
            ref="burgerBtnRef"
            type="button"
            class="hdr-round hdr-round--light hdr-round--mobile burger-btn"
            :class="{ 'is-open': mobileOpen }"
            :aria-expanded="mobileOpen"
            :aria-label="mobileOpen ? 'Закрыть меню' : 'Открыть меню'"
            aria-controls="mobile-menu"
            @click="toggleMobileMenu"
          >
            <span class="burger-icon" aria-hidden="true">
              <span class="burger-icon__line" />
              <span class="burger-icon__line" />
              <span class="burger-icon__line" />
            </span>
          </button>
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
        class="xl:hidden fixed inset-0 z-10000 flex flex-col bg-slate-900"
        :style="{
          top:           '-100px',
          paddingTop:    'calc(env(safe-area-inset-top, 0px) + 100px)',
          paddingLeft:   'env(safe-area-inset-left)',
          paddingRight:  'env(safe-area-inset-right)',
        }"
      >
        <!-- Верхняя строка повторяет закрытую панель шапки (та же геометрия:
             контейнер, отступ 0.75rem, высота) — при открытии меню бренд
             остаётся на месте, а бургер превращается в «закрыть». -->
        <div class="container shrink-0" style="margin-top: 0.75rem">
          <div class="hdr hdr--flat">
            <a href="/" class="hdr-brand" @click="closeMobileMenu">
              <span class="hdr-mark" aria-hidden="true">
                <img :src="LOGO_URL" alt="" width="36" height="36" />
              </span>
              <span class="hdr-brand__text">
                <span class="hdr-brand__name">{{ SITE.studioName }}</span>
                <span class="hdr-brand__sub">Салон ВФД в {{ SITE.address.mall }}</span>
              </span>
            </a>
            <div class="hdr-actions">
              <button
                type="button"
                class="hdr-round hdr-round--light burger-btn is-open"
                aria-label="Закрыть меню"
                @click="closeMobileMenu"
              >
                <span class="burger-icon" aria-hidden="true">
                  <span class="burger-icon__line" />
                  <span class="burger-icon__line" />
                  <span class="burger-icon__line" />
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Адрес -->
        <p class="px-[clamp(1rem,4vw,2rem)] pt-5 pb-4 m-0 text-sm text-white/55 shrink-0">
          {{ SITE.address.full }}
        </p>

        <!-- Звонок + соцсети -->
        <div class="flex items-center gap-2.5 px-[clamp(1rem,4vw,2rem)] pb-4 shrink-0">
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
        <nav class="flex-1 overflow-y-auto px-[clamp(1rem,4vw,2rem)]" aria-label="Мобильная навигация">
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
                :class="isOpen ? 'bg-accent-400/15 text-accent-300' : 'bg-white/10 text-white'"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="font-semibold" :class="isOpen ? 'text-accent-300' : 'text-white'">{{ statusTitle }}</p>
                <p class="text-white/55">{{ statusDetail }}</p>
              </div>
            </div>
            <p class="mt-3 flex flex-wrap gap-x-4 gap-y-0.5 border-t border-white/10 pt-2.5 text-xs text-white/45 tabular-nums">
              <span>{{ CONTACTS.worktime }}</span>
            </p>
          </div>
        </nav>

        <!-- Телефоны — закреплены внизу. Каждый номер — отдельная
             кнопка звонка: подпись + иконка трубки, чтобы было видно,
             что это действие, а не просто текст. -->
        <div
          class="shrink-0 border-t border-white/10 bg-slate-900 px-[clamp(1rem,4vw,2rem)] pt-3 flex flex-col gap-2"
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
/* ============================================================
   Шапка — графитовая панель в ширину контейнера (как сцена hero).
   Мобильные: бренд + звонок + меню; ≥1280px: бренд | навигация | действия.
   Цвета — токены палитры; белый текст с прозрачностью задаёт иерархию.
   ============================================================ */
.hdr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  height: 3.5rem;
  padding: 0 0.5rem 0 0.625rem;
  border-radius: 1rem;
  background: var(--color-slate-900);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.05);
  transition: background-color 250ms var(--ease-out), box-shadow 250ms var(--ease-out);
}
@media (min-width: 1280px) {
  .hdr {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    height: 4rem;
    padding: 0 0.75rem 0 0.875rem;
    border-radius: 1.25rem;
  }
}
/* После прокрутки — лёгкая прозрачность с размытием и тень: панель
   отделяется от светлого контента под ней. */
.hdr--scrolled {
  background: color-mix(in srgb, var(--color-slate-900) 90%, transparent);
  backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.07), 0 18px 40px -18px rgb(19 19 22 / 0.6);
}
.hdr--flat { box-shadow: none; }

.hdr :is(a, button):focus-visible {
  outline: 2px solid var(--color-secondary-400);
  outline-offset: 2px;
}

/* ── Бренд ── */
.hdr-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  justify-self: start;
  color: #fff;
  text-decoration: none;
}
.hdr-mark {
  display: block;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.1);
}
/* Знак ВФД — тёмный круг; на графите инвертируем в светлый */
.hdr-mark img {
  display: block;
  width: 100%;
  height: 100%;
  filter: invert(1);
  transition: opacity 300ms ease;
}
.hdr-mark__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: 0.6875rem;
  font-weight: 700;
}
.hdr-brand__text { display: flex; flex-direction: column; min-width: 0; line-height: 1.15; }
.hdr-brand__name {
  overflow: hidden;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.hdr-brand__sub {
  margin-top: 0.1875rem;
  overflow: hidden;
  font-size: 0.75rem;
  color: rgb(255 255 255 / 0.5);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ── Навигация ── */
.hdr-nav { display: none; }
@media (min-width: 1280px) {
  .hdr-nav { display: flex; align-items: center; gap: 0.125rem; }
}
.hdr-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(255 255 255 / 0.62);
  text-decoration: none;
  white-space: nowrap;
  transition: color 180ms var(--ease-out), background-color 180ms var(--ease-out);
}
.hdr-link:hover { color: #fff; background: rgb(255 255 255 / 0.06); }
.hdr-link.is-active { color: #fff; }
/* Текущий раздел — красная точка под пунктом */
.hdr-link.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0.0625rem;
  width: 0.25rem;
  height: 0.25rem;
  margin-left: -0.125rem;
  border-radius: 50%;
  background: var(--color-accent-500);
}
.hdr-link__chev {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.6;
  transition: transform 200ms var(--ease-out);
}

/* Выпадающий список — тот же графит, что и панель. Центрируем через
   margin, а не transform: transform занят анимацией fade-slide. */
.hdr-drop {
  position: absolute;
  top: calc(100% + 1.375rem);
  left: 50%;
  z-index: 50;
  width: 15rem;
  margin-left: -7.5rem;
  padding: 0.375rem;
  border-radius: 1rem;
  background: var(--color-slate-900);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 24px 48px -16px rgb(19 19 22 / 0.6);
}
/* Невидимый мост через зазор до панели — иначе курсор «падает» в щель
   и список закрывается по пути к нему. */
.hdr-drop::before {
  content: '';
  position: absolute;
  inset: -1.375rem 0 auto;
  height: 1.375rem;
}
.hdr-drop__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: background-color 150ms ease;
}
.hdr-drop__item:hover,
.hdr-drop__item.is-active { background: rgb(255 255 255 / 0.07); }
.hdr-drop__label { font-size: 0.875rem; font-weight: 600; color: #fff; }
.hdr-drop__desc  { font-size: 0.75rem; color: rgb(255 255 255 / 0.5); }

/* ── Действия ── */
.hdr-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  justify-self: end;
}
.hdr-ico { flex: none; width: 1rem; height: 1rem; }

.hdr-phone { display: none; }
@media (min-width: 1280px) {
  .hdr-phone {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 1rem;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.07);
    color: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 180ms var(--ease-out);
  }
  .hdr-phone:hover { background: rgb(255 255 255 / 0.13); }
}

.hdr-cta {
  height: 2.5rem;
  padding: 0 1.125rem;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: var(--color-slate-900);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 180ms var(--ease-out);
}
.hdr-cta:hover,
.hdr-cta[aria-expanded='true'] { background: var(--color-slate-200); }

/* Круглые кнопки мобильной шапки: звонок (на графите) и меню (белая) */
.hdr-round {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.08);
  color: #fff;
  cursor: pointer;
  transition: background-color 180ms var(--ease-out);
}
.hdr-round:hover { background: rgb(255 255 255 / 0.14); }
.hdr-round--light { background: #fff; color: var(--color-slate-900); }
.hdr-round--light:hover { background: var(--color-slate-200); }
@media (min-width: 1280px) {
  .hdr-round--mobile { display: none; }
}

/* ── Панель «Связаться» (десктоп) ── */
.hdr-pop {
  position: absolute;
  top: calc(100% + 1.25rem);
  right: 0;
  z-index: 50;
  width: 20rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: #fff;
  color: var(--color-slate-900);
  text-align: left;
  box-shadow: 0 0 0 1px rgb(19 19 22 / 0.06), 0 24px 60px -16px rgb(19 19 22 / 0.35);
}
.hdr-pop__phone {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: var(--color-slate-100);
  color: inherit;
  text-decoration: none;
  transition: background-color 150ms ease;
}
.hdr-pop__phone:hover { background: var(--color-slate-200); }
.hdr-pop__phone-num { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; }
.hdr-pop__muted { display: block; font-size: 0.8125rem; font-weight: 400; color: var(--color-slate-500); }
.hdr-pop__list { margin: 0.75rem 0 0; }
.hdr-pop__list > div {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.625rem 0.125rem;
  border-top: 1px solid var(--color-slate-200);
}
.hdr-pop__list dt { font-size: 0.8125rem; color: var(--color-slate-500); }
.hdr-pop__list dd { margin: 0; font-size: 0.875rem; font-weight: 500; line-height: 1.4; }
.hdr-pop__status { display: block; font-size: 0.8125rem; font-weight: 400; color: var(--color-slate-500); }
.hdr-pop__status.is-open { color: var(--color-secondary-700); }
.hdr-pop__link {
  color: inherit;
  overflow-wrap: anywhere;
  text-decoration: underline;
  text-decoration-color: var(--color-slate-300);
  text-underline-offset: 0.2em;
}
.hdr-pop__link:hover { text-decoration-color: currentColor; }
.hdr-pop__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  margin-top: 0.5rem;
  border-radius: 0.75rem;
  background: var(--color-slate-900);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms ease;
}
.hdr-pop__cta:hover { background: var(--color-slate-700); }

@media (prefers-reduced-motion: reduce) {
  .hdr, .hdr-link, .hdr-link__chev, .hdr-phone, .hdr-cta, .hdr-round { transition: none; }
}

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
  left: -0.75rem;
  top: 0.875rem;
  bottom: 0.875rem;
  width: 3px;
  border-radius: 2px;
  background: var(--color-accent, var(--color-accent-500));
}
</style>
