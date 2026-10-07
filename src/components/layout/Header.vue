<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo, HAS_EMAIL } from '../../lib/contacts-data'
import { SITE } from '../../config/site'

/* ============================================================
   Constants
   ============================================================ */
const LOGO_URL = '/svg/logo.svg'

/* Брейкпоинт полной шапки — тот же, что в стилях ниже (80rem = xl). */
const DESKTOP_MQ = '(min-width: 80rem)'

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

/* Бренд — две строки капсом: что и где («Двери в Москве», город — из
   site.ts) и чьё («Студия Зизевского»). Капс — через CSS: в разметке
   обычный регистр, его читают скринридеры и поисковики. */
const BRAND_TITLE = `Двери ${SITE.city.in}`

/* Появление названия — один раз за визит и без повтора: при каждом
   переходе между страницами оно бы раздражало. Считается до первого
   рендера (шапка — client:only), поэтому текст не мелькает перед анимацией. */
const brandIntro = (() => {
  try {
    if (sessionStorage.getItem('hdr-intro')) return false
    sessionStorage.setItem('hdr-intro', '1')
    return true
  } catch {
    return false
  }
})()

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

const SUBMENU: Record<string, readonly { href: string; label: string; desc: string }[]> = {
  '/catalog/': CATALOG_DROPDOWN,
}

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
const menuCloseRef     = ref<HTMLButtonElement | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null
let desktopMql: MediaQueryList | null = null

/* ============================================================
   Active link
   ============================================================ */
const isActive = (href: string) => currentPath.value === href

/* Активный раздел для точки под пунктом: каталог подсвечивается
   и на вложенных страницах (/catalog/series/…, /models/…). */
const isSection = (href: string) => {
  if (href === '/catalog/') return currentPath.value.startsWith('/catalog') || currentPath.value.startsWith('/models')
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

/* Статус — обычным текстом: закрытый вечером салон — штатная ситуация,
   а не ошибка, поэтому «закрыто» не красим в красный. «Открыто» —
   голубым (тот же цвет, что «В наличии» в каталоге). */
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
const onScroll = () => { scrolled.value = window.scrollY > 0 }

/* Переход на широкий экран с открытым мобильным меню (поворот планшета) —
   меню и панель контактов закрываются, иначе осталась бы блокировка прокрутки. */
const onDesktopChange = (e: MediaQueryListEvent) => {
  if (!e.matches) return
  closeMobileMenu(false)
  closeContacts(false)
}

/* Меню на телефоне — модальное окно: Tab и Shift+Tab ходят по кругу
   внутри него и не уходят на страницу под ним. */
const focusables = () =>
  [...(mobileMenuRef.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])]

const trapFocus = (e: KeyboardEvent) => {
  const items = focusables()
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null
  const inside = !!active && !!mobileMenuRef.value?.contains(active)

  if (e.shiftKey && (active === first || !inside)) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus() }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' && mobileOpen.value) { trapFocus(e); return }
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
}

const openMobileMenu = async () => {
  mobileOpen.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  menuCloseRef.value?.focus({ preventScroll: true })
}
/* Фокус возвращается на кнопку меню — клавиатурный пользователь
   продолжает с того же места, а не с начала страницы. */
const closeMobileMenu = (returnFocus = true) => {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  document.body.style.overflow = ''
  if (returnFocus) burgerBtnRef.value?.focus({ preventScroll: true })
}
const toggleMobileMenu = () => mobileOpen.value ? closeMobileMenu() : openMobileMenu()

const openCatalog  = () => { if (catalogTimer !== null) clearTimeout(catalogTimer); catalogOpen.value = true }
const closeCatalog = () => { catalogTimer = setTimeout(() => { catalogOpen.value = false }, 150) }

const openAbout  = () => { if (aboutTimer !== null) clearTimeout(aboutTimer); aboutOpen.value = true }
const closeAbout = () => { aboutTimer = setTimeout(() => { aboutOpen.value = false }, 150) }

const isDropOpen = (href: string) => (href === '/catalog/' ? catalogOpen.value : aboutOpen.value)
const openDrop   = (href: string) => (href === '/catalog/' ? openCatalog() : openAbout())
const closeDrop  = (href: string) => (href === '/catalog/' ? closeCatalog() : closeAbout())

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

/* ============================================================
   Lifecycle
   ============================================================ */
onMounted(() => {
  currentPath.value = window.location.pathname
  onScroll()
  desktopMql = window.matchMedia(DESKTOP_MQ)
  desktopMql.addEventListener('change', onDesktopChange)
  window.addEventListener('scroll',  onScroll,     { passive: true })
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside, { capture: true })
  timerId = setInterval(() => { now.value = new Date() }, 30_000)
})

onUnmounted(() => {
  desktopMql?.removeEventListener('change', onDesktopChange)
  window.removeEventListener('scroll',  onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.body.style.overflow = ''
  if (timerId !== null) clearInterval(timerId)
  if (catalogTimer !== null) clearTimeout(catalogTimer)
  if (aboutTimer !== null) clearTimeout(aboutTimer)
})
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled }">
    <div class="container">

      <!-- ── Шапка — плашка по ширине контейнера (как сцена
           hero под ней). Сетка 1fr / auto / 1fr держит навигацию строго
           по центру независимо от ширины краёв. ── -->
      <div class="hdr">

        <!-- Бренд: знак + две строки -->
        <a href="/" class="hdr-brand" :aria-label="`${BRAND_TITLE}, ${SITE.studioName} — на главную`">
          <span class="hdr-mark" aria-hidden="true">
            <img
              v-if="!logoError"
              :src="LOGO_URL"
              alt=""
              loading="eager"
              decoding="async"
              :class="{ 'is-loaded': logoLoaded }"
              @load="logoLoaded = true"
              @error="logoError = true"
            />
            <span v-else class="hdr-mark__fallback">ВФД</span>
          </span>
          <span class="hdr-brand__text" :class="{ 'is-intro': brandIntro }">
            <span class="hdr-brand__line hdr-brand__name"><span>{{ BRAND_TITLE }}</span></span>
            <span class="hdr-brand__line hdr-brand__sub"><span>{{ SITE.studioName }}</span></span>
          </span>
        </a>

        <!-- Навигация (десктоп) -->
        <nav class="hdr-nav" aria-label="Основная навигация">
          <template v-for="link in DESKTOP_NAV" :key="link.href">

            <a
              v-if="!SUBMENU[link.href]"
              :href="link.href"
              class="hdr-link"
              :class="{ 'is-active': isSection(link.href) }"
              :aria-current="isActive(link.href) ? 'page' : undefined"
            >{{ link.label }}</a>

            <!-- Каталог / О нас — с выпадающим списком ссылок -->
            <div
              v-else
              class="hdr-dropwrap"
              @mouseenter="openDrop(link.href)"
              @mouseleave="closeDrop(link.href)"
              @focusin="openDrop(link.href)"
              @focusout="closeDrop(link.href)"
            >
              <a
                :href="link.href"
                class="hdr-link"
                :class="{ 'is-active': isSection(link.href) }"
                :aria-current="isActive(link.href) ? 'page' : undefined"
                :aria-expanded="isDropOpen(link.href)"
              >
                {{ link.label }}
                <svg
                  class="hdr-link__chev"
                  :class="{ 'is-open': isDropOpen(link.href) }"
                  viewBox="0 0 24 24" fill="none" aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </a>

              <Transition name="fade-slide">
                <ul v-if="isDropOpen(link.href)" class="hdr-drop" role="list">
                  <li v-for="item in SUBMENU[link.href]" :key="item.href">
                    <a
                      :href="item.href"
                      class="hdr-drop__item"
                      :class="{ 'is-active': isActive(item.href) }"
                      :aria-current="isActive(item.href) ? 'page' : undefined"
                      @click="catalogOpen = false; aboutOpen = false"
                    >
                      <span class="hdr-drop__label">{{ item.label }}</span>
                      <span class="hdr-drop__desc">{{ item.desc }}</span>
                    </a>
                  </li>
                </ul>
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
            <span class="hdr-num">{{ CONTACTS.phones[0].label }}</span>
          </a>

          <div class="hdr-contacts">
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
                  <span class="hdr-pop__phone-num hdr-num">{{ p.label }}</span>
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
                  <div v-if="HAS_EMAIL">
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
            <svg class="hdr-ico hdr-ico--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <button
            ref="burgerBtnRef"
            type="button"
            class="hdr-round hdr-round--primary hdr-round--mobile burger-btn"
            :class="{ 'is-open': mobileOpen }"
            :aria-expanded="mobileOpen"
            aria-label="Меню"
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

    <!-- ── Мобильное меню — полноэкранная белая панель, модальное окно.
         Teleport на body: внутри <header> собственный z-index панели
         сравнивался бы только с другими детьми header, и cookie-баннер
         в корне документа перекрыл бы её. -->
    <Teleport to="body">
    <Transition name="menu-fade">
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        ref="mobileMenuRef"
        class="mnav"
        role="dialog"
        aria-modal="true"
        aria-label="Меню сайта"
      >
        <!-- Верхняя строка повторяет закрытую панель шапки (та же геометрия:
             контейнер, отступ сверху, высота) — при открытии меню бренд
             остаётся на месте, а бургер превращается в «закрыть». -->
        <div class="container mnav__top">
          <div class="hdr">
            <a href="/" class="hdr-brand" @click="closeMobileMenu(false)">
              <span class="hdr-mark" aria-hidden="true">
                <img :src="LOGO_URL" alt="" class="is-loaded" />
              </span>
              <span class="hdr-brand__text">
                <span class="hdr-brand__line hdr-brand__name"><span>{{ BRAND_TITLE }}</span></span>
                <span class="hdr-brand__line hdr-brand__sub"><span>{{ SITE.studioName }}</span></span>
              </span>
            </a>
            <div class="hdr-actions">
              <button
                ref="menuCloseRef"
                type="button"
                class="hdr-round hdr-round--primary burger-btn is-open"
                aria-label="Закрыть меню"
                @click="closeMobileMenu()"
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

        <div class="container mnav__body">
          <p class="mnav__address">{{ SITE.address.full }}</p>

          <!-- Звонок + Telegram-канал -->
          <div class="mnav__actions">
            <a
              v-if="CONTACTS.phones[0]"
              :href="`tel:${CONTACTS.phones[0].raw}`"
              class="mnav__call"
              @click="closeMobileMenu(false)"
            >
              <svg class="hdr-ico hdr-ico--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Позвонить
            </a>
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${s.label} (откроется в новой вкладке)`"
              class="hdr-round mnav__social"
            >
              <img :src="s.icon" alt="" class="hdr-ico hdr-ico--lg" />
            </a>
          </div>

          <!-- Навигация. Активный пункт — красная черта слева (не только
               цвет текста: так его видно и при беглом взгляде). Стрелка —
               только у пунктов без подразделов: у «Каталог»/«О нас» ниже
               сразу видны вложенные ссылки. -->
          <nav class="mnav__nav" aria-label="Разделы сайта">
            <ul class="mnav__list" role="list">
              <li
                v-for="link in NAV_LINKS"
                :key="link.href"
                class="mnav__item"
                :class="{ 'is-active': isSection(link.href) }"
              >
                <a
                  :href="link.href"
                  class="mnav__link"
                  :aria-current="isActive(link.href) ? 'page' : undefined"
                  @click="closeMobileMenu(false)"
                >
                  {{ link.label }}
                  <svg v-if="!SUBMENU[link.href]" class="hdr-ico mnav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
                  </svg>
                </a>
                <ul v-if="SUBMENU[link.href]" class="mnav__sub" role="list">
                  <li v-for="item in SUBMENU[link.href]" :key="item.href">
                    <a
                      :href="item.href"
                      class="mnav__sublink"
                      :aria-current="isActive(item.href) ? 'page' : undefined"
                      @click="closeMobileMenu(false)"
                    >{{ item.label }}</a>
                  </li>
                </ul>
              </li>
            </ul>

            <!-- Статус салона + график -->
            <div class="mnav__status" aria-live="polite" aria-atomic="true">
              <span class="mnav__status-ico" :class="{ 'is-open': isOpen }" aria-hidden="true">
                <svg class="hdr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <span class="mnav__status-text">
                <span class="mnav__status-title" :class="{ 'is-open': isOpen }">{{ statusTitle }}</span>
                <span class="mnav__muted">{{ statusDetail }}. {{ CONTACTS.worktime }}</span>
              </span>
            </div>
          </nav>
        </div>

        <!-- Телефоны — закреплены внизу: номер + подпись + иконка трубки,
             чтобы было видно, что это действие, а не просто текст. -->
        <div class="mnav__foot">
          <div class="container mnav__phones">
            <a
              v-for="p in CONTACTS.phones"
              :key="p.raw"
              :href="`tel:${p.raw}`"
              :aria-label="`Позвонить: ${p.label}, ${p.title}`"
              class="mnav__phone"
              @click="closeMobileMenu(false)"
            >
              <span class="mnav__phone-text" aria-hidden="true">
                <span class="mnav__phone-num hdr-num">{{ p.label }}</span>
                <span class="mnav__muted">{{ p.title }}</span>
              </span>
              <span class="mnav__phone-ico" aria-hidden="true">
                <svg class="hdr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

  </header>
</template>

<style scoped>
/* ============================================================
   Шапка — белая полоса во всю ширину, содержимое по контейнеру.
   Телефон: бренд + звонок + меню; ≥80rem: бренд | навигация | действия.

   Принципы
   1. Шапка — плашка по ширине контейнера, в двух состояниях. Наверху
      страницы — тёмная (знак VFD светлый, «Связаться» белая); после
      прокрутки — белая, полупрозрачная с размытием, с тонким контуром
      и мягкой тенью. Меняются только цвета (токены ниже) и фон слоя
      плашки — геометрия одинакова, при переходе ничего не сдвигается.
   2. Красный — только подчёркивание текущего раздела.
   3. Все цвета — токены ниже, они ссылаются на палитру global.css.
      Контраст текста на белом: ссылки slate-600 (7.4:1), подписи
      slate-500 (5.0:1) — не ниже WCAG AA.
   4. Зона нажатия — не меньше 2.75rem (WCAG 2.5.5 / Apple HIG).
      Все размеры — в rem: шапка растёт с системным размером шрифта.
   ============================================================ */
/* Светлая палитра — у шапки, мобильного меню и у выпадающих панелей:
   панели объявлены здесь отдельно, чтобы над тёмной плашкой они оставались
   светлыми (переменная, заданная на самом элементе, сильнее унаследованной) */
.site-header,
.mnav,
.hdr-drop,
.hdr-pop {
  --hdr-bg:            var(--color-white);
  --hdr-fg:            var(--color-slate-900);
  --hdr-fg-soft:       var(--color-slate-600);   /* пункты меню */
  --hdr-fg-muted:      var(--color-slate-500);   /* подписи */
  --hdr-fg-faint:      var(--color-slate-300);   /* только иконки-стрелки */
  --hdr-fill:          var(--color-slate-100);   /* серые кнопки, плашки */
  --hdr-fill-hover:    var(--color-slate-200);
  --hdr-line:          var(--color-slate-200);
  --hdr-primary:       var(--color-slate-900);   /* единственная тёмная кнопка */
  --hdr-primary-hover: var(--color-slate-700);
  --hdr-on-primary:    var(--color-white);
  --hdr-signal:        var(--color-accent-500);  /* текущий раздел */
  --hdr-open:          var(--color-secondary-700); /* «Сейчас открыто» */
  --hdr-shadow:        color-mix(in srgb, var(--color-slate-950) 10%, transparent);
  --hdr-focus:         var(--color-secondary-600);
  --hdr-hair:          0.0625rem;
  --hdr-tap:           2.75rem;
  --hdr-h:             var(--header-bar);       /* global.css — общая с отступом страницы */
  --hdr-ease:          var(--ease-out);
  --hdr-ease-soft:     cubic-bezier(0.16, 1, 0.3, 1);  /* мягкое торможение в конце */
  --hdr-swap:          200ms var(--ease-out);   /* смена тёмного и белого состояний — коротко, чтобы цвет текста и фон менялись вместе */
  --hdr-pill:          color-mix(in srgb, var(--color-white) 90%, transparent); /* фон плашки после прокрутки */
}

/* Тёмная палитра плашки — только для полосы шапки наверху страницы.
   Выпадающие панели внутри неё переопределяют токены обратно (см. выше). */
.site-header:not(.is-scrolled) .hdr {
  --hdr-pill:          var(--color-slate-900);
  --hdr-fg:            var(--color-white);
  --hdr-fg-soft:       var(--color-slate-300);
  --hdr-fg-muted:      var(--color-slate-400);
  --hdr-fg-faint:      var(--color-slate-600);
  --hdr-fill:          var(--color-slate-800);
  --hdr-fill-hover:    var(--color-slate-700);
  --hdr-line:          var(--color-slate-700);
  --hdr-primary:       var(--color-white);
  --hdr-primary-hover: var(--color-slate-200);
  --hdr-on-primary:    var(--color-slate-900);
  --hdr-focus:         var(--color-secondary-300);
}

.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  padding-top: env(safe-area-inset-top, 0rem);
  padding-inline: env(safe-area-inset-left, 0rem) env(safe-area-inset-right, 0rem);
  /* Сама полоса прозрачная — видна только плашка (.hdr::before);
     по бокам от неё просматривается страница */
  background: transparent;
}

.hdr {
  /* Поле плашки вокруг содержимого: круглые кнопки (--hdr-tap) стоят
     в ней с равным зазором сверху, снизу и по краям. Края плашки — ровно
     по контейнеру (как сцена hero под ней), поле — внутрь */
  --hdr-pill-gap: 0.375rem;
  position: relative;
  padding-inline: var(--hdr-pill-gap);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  height: var(--hdr-h);
  color: var(--hdr-fg);
  transition: color var(--hdr-swap);
}
/* Плашка — отдельный слой: по ширине — контейнер, по высоте — ровно
   вокруг кнопок. z-index: -1 кладёт её под содержимое
   внутри контекста наложения .site-header (fixed + z-index), то есть
   всё равно поверх страницы. Переход — только цвет фона и тень слоя,
   без пересчёта вёрстки.
   Только у шапки: мобильное меню повторяет разметку .hdr, но плашки там нет. */
.site-header .hdr::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset-block: calc((var(--hdr-h) - var(--hdr-tap)) / 2 - var(--hdr-pill-gap));
  inset-inline: 0;
  /* Скругление — как у сцен первого экрана: 1.25rem (сцена hero на
     телефоне, панель направлений на главной). Капсула (999rem) на такой
     низкой полосе выглядела бы другим элементом, не родственным hero */
  border-radius: 1.25rem;
  background: var(--hdr-pill);
  box-shadow: inset 0 0 0 var(--hdr-hair) transparent, 0 0.75rem 2rem -1.25rem transparent;
  transition: background-color var(--hdr-swap), box-shadow var(--hdr-swap);
}
/* Белая плашка: контент под ней размыт, тонкий контур и мягкая тень
   отделяют её от белой страницы */
.site-header.is-scrolled .hdr::before {
  -webkit-backdrop-filter: blur(0.875rem) saturate(1.4);
  backdrop-filter: blur(0.875rem) saturate(1.4);
  box-shadow: inset 0 0 0 var(--hdr-hair) var(--hdr-line), 0 0.75rem 2rem -1.25rem var(--hdr-shadow);
}
@media (min-width: 80rem) {
  .hdr { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
}

.site-header :is(a, button):focus-visible,
.mnav :is(a, button):focus-visible {
  outline: 0.125rem solid var(--hdr-focus);
  outline-offset: 0.125rem;
}

.hdr-ico { flex: none; width: 1rem; height: 1rem; }
.hdr-ico--lg { width: 1.25rem; height: 1.25rem; }
.hdr-num { font-variant-numeric: tabular-nums; }

/* ── Бренд ── */
.hdr-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  min-height: var(--hdr-tap);
  justify-self: start;
  color: var(--hdr-fg);
  text-decoration: none;
  border-radius: 0.75rem;
}
/* Знак ВФД (тёмный круг) — того же размера, что круглые кнопки справа */
.hdr-mark {
  display: block;
  flex: none;
  width: var(--hdr-tap);
  height: var(--hdr-tap);
  border-radius: 50%;
  background: var(--hdr-primary);
}
.hdr-mark img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 300ms var(--hdr-ease), filter var(--hdr-swap);
}
/* На тёмной плашке знак инвертирован: светлый круг, тёмные буквы VFD */
.site-header:not(.is-scrolled) .hdr-mark img { filter: invert(1); }
.hdr-mark img.is-loaded { opacity: 1; }
.hdr-mark__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--hdr-on-primary);
}
.hdr-brand__text { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
/* Строка — маска (overflow: hidden), текст внутри выезжает из-под неё */
.hdr-brand__line { display: block; overflow: hidden; text-transform: uppercase; }
.hdr-brand__line > span {
  display: block;
  overflow: hidden;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.hdr-brand__name {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.hdr-brand__sub {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--hdr-fg-muted);
}
/* Появление (один раз за визит): строки по очереди выезжают снизу из-под
   маски и мягко тормозят. Только transform — считается на видеокарте,
   без пересчёта вёрстки; после анимации ничего не повторяется. */
.hdr-brand__text.is-intro .hdr-brand__line > span {
  animation: hdr-line-in 900ms var(--hdr-ease-soft) 150ms both;
}
.hdr-brand__text.is-intro .hdr-brand__sub > span { animation-delay: 270ms; }
@keyframes hdr-line-in {
  from { transform: translateY(110%); }
}

/* ── Навигация (десктоп) ── */
.hdr-nav { display: none; }
@media (min-width: 80rem) {
  .hdr-nav { display: flex; align-items: center; gap: 0.125rem; }
}
.hdr-dropwrap { position: relative; }
.hdr-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border-radius: 999rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--hdr-fg-soft);
  text-decoration: none;
  white-space: nowrap;
  transition: color 180ms var(--hdr-ease), background-color 180ms var(--hdr-ease);
}
.hdr-link:hover { color: var(--hdr-fg); background: var(--hdr-fill); }
/* Текущий раздел — подчёркивание текста пункта (стрелку «Каталога» не
   задевает: text-decoration рисуется только под буквами). Тот же приём,
   что у ссылок и наведения на карточки на страницах. */
.hdr-link.is-active {
  color: var(--hdr-fg);
  text-decoration: underline;
  text-decoration-color: var(--hdr-signal);
  text-decoration-thickness: 0.125rem;
  text-underline-offset: 0.5em;
}
.hdr-link__chev {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.6;
  transition: transform 200ms var(--hdr-ease);
}
.hdr-link__chev.is-open { transform: rotate(180deg); }

/* Выпадающий список — тот же графит, что и панель. Центрируем через
   margin, а не transform: transform занят анимацией fade-slide. */
.hdr-drop {
  --drop-w: 15rem;
  --drop-gap: 1.125rem; /* от пункта до края списка = до низа панели + зазор */
  position: absolute;
  top: calc(100% + var(--drop-gap));
  left: 50%;
  z-index: 50;
  width: var(--drop-w);
  margin: 0 0 0 calc(var(--drop-w) / -2);
  padding: 0.375rem;
  list-style: none;
  border-radius: 1rem;
  background: var(--hdr-bg);
  box-shadow: inset 0 0 0 var(--hdr-hair) var(--hdr-line), 0 1.5rem 3rem -1rem var(--hdr-shadow);
}
/* Невидимый мост через зазор до панели — иначе курсор «падает» в щель
   и список закрывается по пути к нему. */
.hdr-drop::before {
  content: '';
  position: absolute;
  inset: calc(var(--drop-gap) * -1) 0 auto;
  height: var(--drop-gap);
}
.hdr-drop__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.hdr-drop__item:hover,
.hdr-drop__item.is-active { background: var(--hdr-fill); }
.hdr-drop__label { font-size: 0.875rem; font-weight: 600; color: var(--hdr-fg); }
.hdr-drop__desc  { font-size: 0.75rem; color: var(--hdr-fg-muted); }

/* ── Действия ── */
.hdr-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  justify-self: end;
}

.hdr-phone,
.hdr-contacts { display: none; }
@media (min-width: 80rem) {
  .hdr-contacts { display: block; position: relative; }
  .hdr-phone {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: var(--hdr-tap);
    padding: 0 1rem;
    border-radius: 999rem;
    background: var(--hdr-fill);
    color: var(--hdr-fg);
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 180ms var(--hdr-ease);
  }
  .hdr-phone:hover { background: var(--hdr-fill-hover); }
}

.hdr-cta {
  height: var(--hdr-tap);
  padding: 0 1.25rem;
  border: 0;
  border-radius: 999rem;
  background: var(--hdr-primary);
  color: var(--hdr-on-primary);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 180ms var(--hdr-ease);
}
.hdr-cta:hover,
.hdr-cta[aria-expanded='true'] { background: var(--hdr-primary-hover); }

/* Круглые кнопки: звонок и Telegram — серые, меню — тёмная */
.hdr-round {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--hdr-tap);
  height: var(--hdr-tap);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--hdr-fill);
  color: var(--hdr-fg);
  cursor: pointer;
  transition: background-color 180ms var(--hdr-ease);
}
.hdr-round:hover { background: var(--hdr-fill-hover); }
.hdr-round--primary { background: var(--hdr-primary); color: var(--hdr-on-primary); }
.hdr-round--primary:hover { background: var(--hdr-primary-hover); }
@media (min-width: 80rem) {
  .hdr-round--mobile { display: none; }
}

/* ── Панель «Связаться» (десктоп) ── */
.hdr-pop {
  position: absolute;
  top: calc(100% + 1.125rem);
  right: 0;
  z-index: 50;
  width: 20rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: var(--hdr-bg);
  color: var(--hdr-fg);
  text-align: left;
  box-shadow: 0 0 0 var(--hdr-hair) var(--hdr-line), 0 1.5rem 3.5rem -1rem var(--hdr-shadow);
}
.hdr-pop__phone {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: var(--hdr-fill);
  color: inherit;
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.hdr-pop__phone:hover { background: var(--hdr-fill-hover); }
.hdr-pop__phone-num { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; }
.hdr-pop__muted { display: block; font-size: 0.8125rem; font-weight: 400; color: var(--hdr-fg-muted); }
.hdr-pop__list { margin: 0.75rem 0 0; }
.hdr-pop__list > div {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.625rem 0.125rem;
  border-top: var(--hdr-hair) solid var(--hdr-line);
}
.hdr-pop__list dt { font-size: 0.8125rem; color: var(--hdr-fg-muted); }
.hdr-pop__list dd { margin: 0; font-size: 0.875rem; font-weight: 500; line-height: 1.4; }
.hdr-pop__status { display: block; font-size: 0.8125rem; font-weight: 400; color: var(--hdr-fg-muted); }
.hdr-pop__status.is-open { color: var(--hdr-open); }
.hdr-pop__link {
  color: inherit;
  overflow-wrap: anywhere;
  text-decoration: underline;
  text-decoration-color: var(--hdr-fg-faint);
  text-underline-offset: 0.2em;
}
.hdr-pop__link:hover { text-decoration-color: currentColor; }
.hdr-pop__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--hdr-tap);
  margin-top: 0.5rem;
  border-radius: 0.75rem;
  background: var(--hdr-primary);
  color: var(--hdr-on-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.hdr-pop__cta:hover { background: var(--hdr-primary-hover); }

/* ── Бургер → крестик: 3 линии transform'ятся вместо переключения svg ── */
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
  height: 0.125rem;
  border-radius: 0.0625rem;
  background: currentColor;
  transition:
    transform 280ms var(--hdr-ease),
    opacity 200ms var(--hdr-ease),
    top 280ms var(--hdr-ease);
}
.burger-icon__line:nth-child(1) { top: 0; }
.burger-icon__line:nth-child(2) { top: 50%; transform: translateY(-50%); }
.burger-icon__line:nth-child(3) { top: 100%; transform: translateY(-100%); }

.burger-btn.is-open .burger-icon__line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
.burger-btn.is-open .burger-icon__line:nth-child(2) { opacity: 0; }
.burger-btn.is-open .burger-icon__line:nth-child(3) {
  top: 50%;
  transform: translateY(-50%) rotate(-45deg);
}

/* ============================================================
   Мобильное меню
   Фон уходит на --mnav-bleed выше вьюпорта и компенсируется таким же
   верхним отступом: iOS Safari закрашивает зону чёлки отдельным
   проходом, и если фон fixed-элемента начинается ровно на top:0, при
   появлении меню полоса на кадр-два остаётся непрокрашенной.
   ============================================================ */
.mnav {
  --mnav-bleed: 6.25rem;
  position: fixed;
  inset: calc(var(--mnav-bleed) * -1) 0 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  padding-top: calc(env(safe-area-inset-top, 0rem) + var(--mnav-bleed));
  padding-inline: env(safe-area-inset-left, 0rem) env(safe-area-inset-right, 0rem);
  background: var(--hdr-bg);
  color: var(--hdr-fg);
}
@media (min-width: 80rem) {
  .mnav { display: none; }
}

.mnav__top { flex: none; border-bottom: var(--hdr-hair) solid var(--hdr-line); }

/* Середина прокручивается, телефон внизу закреплён */
.mnav__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mnav__address {
  margin: 1.25rem 0 1rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--hdr-fg-muted);
}

.mnav__actions { display: flex; align-items: center; gap: 0.625rem; }
.mnav__call {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: var(--hdr-tap);
  border-radius: 999rem;
  background: var(--hdr-primary);
  color: var(--hdr-on-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 180ms var(--hdr-ease);
}
.mnav__call:active { background: var(--hdr-primary-hover); }
.mnav__social img { display: block; }

.mnav__list {
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
  border-top: var(--hdr-hair) solid var(--hdr-line);
}
.mnav__item {
  position: relative;
  border-bottom: var(--hdr-hair) solid var(--hdr-line);
}
/* Активный раздел — красная черта слева, в поле контейнера */
.mnav__item.is-active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 1rem;
  height: 1.5rem;
  width: 0.1875rem;
  border-radius: 0.125rem;
  background: var(--hdr-signal);
}
.mnav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--hdr-fg-soft);
  text-decoration: none;
  transition: color 150ms var(--hdr-ease);
}
.mnav__link:hover,
.mnav__item.is-active > .mnav__link { color: var(--hdr-fg); }
.mnav__chev { color: var(--hdr-fg-faint); }

.mnav__sub {
  margin: -0.25rem 0 0.75rem;
  padding: 0;
  list-style: none;
}
.mnav__sublink {
  display: flex;
  align-items: center;
  min-height: var(--hdr-tap);
  margin-inline: -0.75rem;
  padding-inline: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--hdr-fg-muted);
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease), color 150ms var(--hdr-ease);
}
.mnav__sublink:hover,
.mnav__sublink[aria-current='page'] { background: var(--hdr-fill); color: var(--hdr-fg); }

/* Статус салона: та же поверхность и круглая иконка, что у телефона внизу */
.mnav__status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;
  padding: 0.875rem 1rem;
  border-radius: 0.875rem;
  background: var(--hdr-fill);
  font-size: 0.875rem;
  line-height: 1.4;
}
.mnav__status-ico,
.mnav__phone-ico {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--hdr-fill);
  color: var(--hdr-fg);
}
.mnav__status-ico.is-open { color: var(--hdr-open); }
.mnav__status-text { display: flex; flex-direction: column; min-width: 0; }
.mnav__status-title { font-weight: 600; }
.mnav__status-title.is-open { color: var(--hdr-open); }
.mnav__muted { font-size: 0.8125rem; color: var(--hdr-fg-muted); }

.mnav__foot {
  flex: none;
  padding-block: 0.75rem calc(0.75rem + env(safe-area-inset-bottom, 0rem));
  border-top: var(--hdr-hair) solid var(--hdr-line);
  background: var(--hdr-bg);
}
.mnav__phones { display: flex; flex-direction: column; gap: 0.5rem; }
.mnav__phone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.5rem 0.625rem 0.5rem 1rem;
  border-radius: 0.875rem;
  background: var(--hdr-fill);
  color: var(--hdr-fg);
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.mnav__phone:active { background: var(--hdr-fill-hover); }
.mnav__phone-text { display: flex; flex-direction: column; min-width: 0; }
.mnav__phone-num { font-size: 1rem; font-weight: 600; }

@media (prefers-reduced-motion: reduce) {
  .hdr, .hdr-link, .hdr-link__chev, .hdr-phone, .hdr-cta, .hdr-round,
  .hdr-mark img, .burger-icon__line, .mnav__link, .mnav__sublink, .mnav__call, .mnav__phone {
    transition: none;
  }
  .hdr-brand__text.is-intro .hdr-brand__line > span { animation: none; }
}
</style>
