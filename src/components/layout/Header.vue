<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { companyLegalInfo, HAS_EMAIL } from '../../lib/contacts-data'
import { useScrollLock } from '../../lib/scroll-lock'
import { openingStatus } from '../../lib/opening-status'
import { typograph } from '../../lib/typograph'
import { SITE } from '../../config/site'
import { whatsappUrl, WHATSAPP, TELEGRAM_CHAT, telegramChatUrl, MAX_CHAT, maxChatUrl, CONSULT_MESSAGE } from '../../lib/messengers'
import { MAP_URL, ROUTE_URL } from '../../lib/map-links'
import { MESSENGER_ICONS } from '../../lib/messenger-icons'

/* ============================================================
   Constants
   ============================================================ */
const LOGO_URL = '/svg/logo.svg'

/* Брейкпоинт полной шапки — тот же, что в стилях ниже (80rem = xl). */
const DESKTOP_MQ = '(min-width: 80rem)'

/* Написать Константину — WhatsApp и личный Telegram (src/lib/messengers.ts);
   Telegram-канал салона — только читать */
const WHATSAPP_URL = whatsappUrl()
const TELEGRAM_CHAT_URL = telegramChatUrl()
const MAX_CHAT_URL = maxChatUrl()

/* Круглые кнопки мессенджеров в мобильном меню — написать */
const SOCIAL_NETWORKS = [
  ...(WHATSAPP ? [{
    name: 'WhatsApp',
    label: `Написать в WhatsApp на ${WHATSAPP.label}`,
    url: WHATSAPP_URL,
    icon: MESSENGER_ICONS.whatsapp.onLight,
  }] : []),
  ...(TELEGRAM_CHAT ? [{
    name: 'Telegram',
    label: `Написать в Telegram: @${TELEGRAM_CHAT}`,
    url: TELEGRAM_CHAT_URL,
    icon: MESSENGER_ICONS.telegram.onLight,
  }] : []),
  ...(MAX_CHAT ? [{
    name: 'MAX',
    label: 'Написать в MAX (текст скопируется)',
    url: maxChatUrl(),
    icon: MESSENGER_ICONS.max.onLight,
    copy: CONSULT_MESSAGE,
  }] : []),
]

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

/* desc — пояснение пункта в мобильном меню (у разделов с подменю —
   пояснения у его пунктов) */
const NAV_LINKS = [
  { href: '/',            label: 'Главная',     desc: '' },
  { href: '/catalog/',    label: 'Каталог',     desc: '' },
  { href: '/partitions/', label: 'Перегородки', desc: '' },
  { href: '/designers/',  label: 'Дизайнерам',  desc: 'Условия и материалы для проектов' },
  { href: '/about/',      label: 'О нас',       desc: `${SITE.studioName} и фабрика ${SITE.name}` },
  { href: '/contacts/',   label: 'Контакты',    desc: 'Адрес, часы и как добраться' },
] as const

/* На десктопе «Главная» не выводится — на главную ведёт логотип, а
   освободившееся место держит навигацию строго по центру панели. */
const DESKTOP_NAV = NAV_LINKS.filter(l => l.href !== '/')

const CATALOG_DROPDOWN = [
  { href: '/catalog/',               label: 'Все двери',      desc: 'Межкомнатные' },
  { href: '/catalog/skrytye-dveri/', label: 'Скрытые двери', desc: 'Скрытый монтаж' },
  { href: '/catalog/vhodnye-dveri/', label: 'Входные двери', desc: 'Стальные, с терморазрывом' },
  { href: '/catalog/stenovye-paneli/', label: 'Стеновые панели', desc: 'Шпон и покрытия дверей' },
  { href: '/catalog/decor/',         label: 'Декор',         desc: 'Плинтус, фрамуги, рейки' },
  { href: '/catalog/plintus/',       label: 'Плинтус', desc: 'Напольный, скрытый, с подсветкой' },
] as const

const PARTITIONS_DROPDOWN = [
  { href: '/partitions/',            label: 'Перегородки ВФД',   desc: 'GRAFIA: раздвижные, распашные' },
  { href: '/partitions/alum/', label: 'Перегородки ALUM', desc: '10 раскладок и конструктор' },
] as const

const SUBMENU: Record<string, readonly { href: string; label: string; desc: string }[]> = {
  '/catalog/':    CATALOG_DROPDOWN,
  '/partitions/': PARTITIONS_DROPDOWN,
}

/* Мобильное меню — группы-карточки: разделы с подменю (заголовок — название
   раздела, строки — его пункты) и «Студия» — остальные страницы. «Главная»
   не выводится: на неё ведёт бренд в верхней строке меню. */
const MOBILE_GROUPS = [
  ...NAV_LINKS.filter((l) => SUBMENU[l.href]).map((l) => ({ title: l.label, items: SUBMENU[l.href]! })),
  { title: 'Студия', items: NAV_LINKS.filter((l) => !SUBMENU[l.href] && l.href !== '/') },
]


/* ============================================================
   State
   ============================================================ */
const mobileOpen   = ref(false)
const contactsOpen = ref(false)
const catalogOpen  = ref(false)
let   catalogTimer: ReturnType<typeof setTimeout> | null = null
const partitionsOpen = ref(false)
let   partitionsTimer: ReturnType<typeof setTimeout> | null = null
const logoLoaded   = ref(false)
const logoError    = ref(false)

const now          = ref(new Date())
const currentPath  = ref('/')

const contactsBtnRef   = ref<HTMLButtonElement | null>(null)
const contactsPanelRef = ref<HTMLDivElement | null>(null)
const mobileMenuRef    = ref<HTMLDivElement | null>(null)
const burgerBtnRef     = ref<HTMLButtonElement | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null
let desktopMql: MediaQueryList | null = null

/* ============================================================
   Active link
   ============================================================ */
const isActive = (href: string) => currentPath.value === href

/* Активный раздел для точки под пунктом: каталог подсвечивается
   и на вложенных страницах (/catalog/series/…, /models/…), перегородки —
   и на /partitions/alum/. */
const isSection = (href: string) => {
  if (href === '/catalog/') return currentPath.value.startsWith('/catalog') || currentPath.value.startsWith('/models')
  if (href === '/partitions/') return currentPath.value.startsWith('/partitions')
  return isActive(href)
}

/* ============================================================
   Work-hours logic
   ============================================================ */
/* Часы — из contacts-data (единственный источник), время — московское:
   посетитель из другого часового пояса видит статус салона, а не свой.
   Расчёт с минутами (закрываемся в 19:30) — src/lib/opening-status.ts. */
const status = computed(() => openingStatus(now.value, companyLegalInfo.workingHours, SITE.hours.timeZone))
const isOpen = computed(() => status.value.open)

/* Статус — обычным текстом: закрытый вечером салон — штатная ситуация,
   а не ошибка, поэтому «закрыто» не красим в красный. «Открыто» —
   голубым (тот же цвет, что «В наличии» в каталоге). */
const statusTitle = computed(() => (isOpen.value ? 'Сейчас открыто' : 'Сейчас закрыто'))
/* «до 19:30» не разрывается переносом */
const statusDetail = computed(() => typograph(status.value.detail))

/* ============================================================
   Handlers
   ============================================================ */
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

  if (e.shiftKey && (active === first || active === mobileMenuRef.value || !inside)) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus() }
}

const onKeydown = (e: KeyboardEvent) => {
  lastInput = 'keyboard'
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

const menuLock = useScrollLock()

/* Последний способ ввода. Фокус, возвращённый после закрытия пальцем или
   мышью, — без обводки: iOS считает программный фокус «видимым» и обводил
   бургер после нажатия на крестик. С клавиатуры обводка остаётся. */
let lastInput: 'keyboard' | 'pointer' = 'pointer'
const onPointerDown = () => { lastInput = 'pointer' }
const returnFocusTo = (el: HTMLElement | null | undefined) => {
  if (!el) return
  if (lastInput === 'pointer') {
    el.dataset.focusQuiet = ''
    el.addEventListener('blur', () => { delete el.dataset.focusQuiet }, { once: true })
  }
  el.focus({ preventScroll: true })
}

const openMobileMenu = async () => {
  mobileOpen.value = true
  menuLock.lock()
  await nextTick()
  /* Фокус — на само окно (WAI-ARIA, модальный диалог), а не на «Закрыть»:
     программный фокус на кнопке iOS рисует обводкой, хотя меню открыли
     пальцем. С клавиатуры Tab идёт по порядку: бренд, «Закрыть», разделы. */
  mobileMenuRef.value?.focus({ preventScroll: true })
}
/* Фокус возвращается на кнопку меню — клавиатурный пользователь
   продолжает с того же места, а не с начала страницы. */
const closeMobileMenu = (returnFocus = true) => {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  menuLock.unlock()
  if (returnFocus) returnFocusTo(burgerBtnRef.value)
}
const toggleMobileMenu = () => mobileOpen.value ? closeMobileMenu() : openMobileMenu()

const openCatalog  = () => { if (catalogTimer !== null) clearTimeout(catalogTimer); catalogOpen.value = true }
const closeCatalog = () => { catalogTimer = setTimeout(() => { catalogOpen.value = false }, 150) }

const openPartitions  = () => { if (partitionsTimer !== null) clearTimeout(partitionsTimer); partitionsOpen.value = true }
const closePartitions = () => { partitionsTimer = setTimeout(() => { partitionsOpen.value = false }, 150) }

const isDropOpen = (href: string) => (href === '/catalog/' ? catalogOpen.value : partitionsOpen.value)
const openDrop   = (href: string) => (href === '/catalog/' ? openCatalog() : openPartitions())
const closeDrop  = (href: string) => (href === '/catalog/' ? closeCatalog() : closePartitions())

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
  if (returnFocus) returnFocusTo(contactsBtnRef.value)
}
const toggleContacts = () => contactsOpen.value ? closeContacts() : openContacts()

/* ============================================================
   Lifecycle
   ============================================================ */
onMounted(() => {
  currentPath.value = window.location.pathname
  desktopMql = window.matchMedia(DESKTOP_MQ)
  desktopMql.addEventListener('change', onDesktopChange)
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside, { capture: true })
  document.addEventListener('pointerdown', onPointerDown, { capture: true })
  timerId = setInterval(() => { now.value = new Date() }, 30_000)
})

onUnmounted(() => {
  desktopMql?.removeEventListener('change', onDesktopChange)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  if (timerId !== null) clearInterval(timerId)
  if (catalogTimer !== null) clearTimeout(catalogTimer)
  if (partitionsTimer !== null) clearTimeout(partitionsTimer)
})
</script>

<template>
  <header class="site-header">
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
            <span v-else class="hdr-mark__fallback">{{ SITE.name }}</span>
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

            <!-- Каталог / Перегородки — с выпадающим списком ссылок -->
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
                      @click="catalogOpen = false; partitionsOpen = false"
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
                <div class="hdr-pop__phones">
                  <a
                    v-for="p in CONTACTS.phones"
                    :key="p.raw"
                    :href="`tel:${p.raw}`"
                    class="hdr-pop__phone"
                  >
                    <span class="hdr-pop__phone-num hdr-num">{{ p.label }}</span>
                    <span class="hdr-pop__muted">{{ p.title }}</span>
                  </a>
                </div>

                <dl class="hdr-pop__list">
                  <div>
                    <dt>Адрес</dt>
                    <dd>
                      {{ CONTACTS.address }}<span class="hdr-pop__muted">{{ CONTACTS.entrance }}</span>
                      <a :href="MAP_URL" target="_blank" rel="noopener noreferrer" class="hdr-pop__link hdr-pop__map">На Яндекс Картах</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Часы</dt>
                    <dd aria-live="polite" aria-atomic="true">
                      {{ CONTACTS.worktime }}
                      <span class="hdr-pop__status" :class="{ 'is-open': isOpen }">{{ statusTitle }}. {{ statusDetail }}</span>
                    </dd>
                  </div>
                  <div v-if="WHATSAPP">
                    <dt>WhatsApp</dt>
                    <dd>
                      <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        Написать в чат
                      </a>
                    </dd>
                  </div>
                  <div v-if="TELEGRAM_CHAT">
                    <dt>Telegram</dt>
                    <dd>
                      <a :href="TELEGRAM_CHAT_URL" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        Написать @{{ TELEGRAM_CHAT }}
                      </a>
                    </dd>
                  </div>
                  <div v-if="MAX_CHAT">
                    <dt>MAX</dt>
                    <dd>
                      <a :href="MAX_CHAT_URL" target="_blank" rel="noopener noreferrer" class="hdr-pop__link" :data-copy-text="CONSULT_MESSAGE">
                        Написать в чат
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Канал</dt>
                    <dd>
                      <a :href="SITE.social.telegram" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        {{ SITE.social.telegramHandle }}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>YouTube</dt>
                    <dd>
                      <a :href="SITE.social.youtube" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        {{ SITE.social.youtubeHandle }}
                      </a>
                    </dd>
                  </div>
                  <div v-if="SITE.social.vk">
                    <dt>ВКонтакте</dt>
                    <dd>
                      <a :href="SITE.social.vk" target="_blank" rel="noopener noreferrer" class="hdr-pop__link">
                        {{ SITE.social.vkHandle }}
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
        tabindex="-1"
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

        <div class="mnav__body">
          <div class="container">
            <!-- Салон: открыто ли сейчас — первым, крупно; куда ехать — под ним -->
            <section class="mnav__visit" :class="isOpen ? 'is-open' : 'is-closed'" aria-label="Салон">
              <p class="mnav__state" aria-live="polite" aria-atomic="true">
                <span class="mnav__dot" aria-hidden="true" />
                <span class="mnav__state-title">{{ isOpen ? 'Открыто' : 'Закрыто' }}</span>
                <span class="mnav__state-detail">{{ statusDetail }}</span>
              </p>
              <div class="mnav__where">
                <p class="mnav__where-text">
                  <span class="mnav__where-main">{{ CONTACTS.entrance }}</span>
                  <span class="mnav__muted">{{ SITE.address.street }}</span>
                  <span class="mnav__muted">{{ CONTACTS.worktime }}</span>
                </p>
                <a :href="ROUTE_URL" target="_blank" rel="noopener noreferrer" class="mnav__route" aria-label="Маршрут до салона в Яндекс Картах (откроется в новой вкладке)">
                  Маршрут
                  <svg class="hdr-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </section>

            <!-- Разделы — группы-карточки: заголовок группы, строки с пояснением.
                 Текущая страница — красная черта слева и тёмный текст. -->
            <nav class="mnav__nav" aria-label="Разделы сайта">
              <section v-for="(g, gi) in MOBILE_GROUPS" :key="g.title" class="mnav__group" :aria-labelledby="`mnav-g${gi}`">
                <h2 :id="`mnav-g${gi}`" class="mnav__group-title">{{ g.title }}</h2>
                <ul class="mnav__list" role="list">
                  <li v-for="item in g.items" :key="item.href">
                    <a
                      :href="item.href"
                      class="mnav__row"
                      :class="{ 'is-active': isActive(item.href) }"
                      :aria-current="isActive(item.href) ? 'page' : undefined"
                      @click="closeMobileMenu(false)"
                    >
                      <span class="mnav__row-text">
                        <span class="mnav__row-title">{{ item.label }}</span>
                        <span v-if="item.desc" class="mnav__row-desc">{{ item.desc }}</span>
                      </span>
                      <svg class="hdr-ico mnav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>
                      </svg>
                    </a>
                  </li>
                </ul>
              </section>
            </nav>

            <!-- Оба номера — в конце списка; внизу закреплена кнопка звонка в салон -->
            <section class="mnav__group" aria-labelledby="mnav-phones">
              <h2 id="mnav-phones" class="mnav__group-title">Телефоны</h2>
              <ul class="mnav__list" role="list">
                <li v-for="p in CONTACTS.phones" :key="p.raw">
                  <a :href="`tel:${p.raw}`" class="mnav__row" :aria-label="`Позвонить: ${p.label}, ${p.title}`" @click="closeMobileMenu(false)">
                    <span class="mnav__row-text" aria-hidden="true">
                      <span class="mnav__row-title hdr-num">{{ p.label }}</span>
                      <span class="mnav__row-desc">{{ p.title }}</span>
                    </span>
                    <svg class="hdr-ico mnav__row-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Внизу закреплено главное действие: звонок в салон и мессенджеры
             с логотипами — крупно, по ним узнают сервис, а не по подписи -->
        <div class="mnav__foot">
          <div class="container mnav__bar">
            <a
              v-if="CONTACTS.phones[0]"
              :href="`tel:${CONTACTS.phones[0].raw}`"
              class="mnav__call"
              :aria-label="`Позвонить в салон: ${CONTACTS.phones[0].label}`"
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
              :data-copy-text="s.copy"
              class="mnav__msg"
            >
              <img :src="s.icon" alt="" width="26" height="26" />
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
   1. Шапка — тёмная плашка по ширине контейнера (знак VFD светлый,
      «Связаться» белая), одна на всю страницу: при прокрутке не
      меняется. Тонкий контур и мягкая тень отделяют её и от светлых,
      и от тёмных блоков. Выпадающие панели и мобильное меню — светлые.
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
  /* Статус салона: открыто — зелёный, закрыто — красный; *-tint — точка
     и подсветка карточки, текст — тёмный оттенок (контраст ≥ 5:1) */
  --hdr-open:          var(--color-success-800);
  --hdr-open-tint:     var(--color-success-500);
  --hdr-closed:        var(--color-accent-800);
  --hdr-closed-tint:   var(--color-accent-500);
  --hdr-shadow:        color-mix(in srgb, var(--color-slate-950) 10%, transparent);
  --hdr-focus:         var(--color-secondary-600);
  --hdr-hair:          0.0625rem;
  --hdr-tap:           2.75rem;
  --hdr-h:             var(--header-bar);       /* global.css — общая с отступом страницы */
  --hdr-ease:          var(--ease-out);
  --hdr-ease-soft:     cubic-bezier(0.16, 1, 0.3, 1);  /* мягкое торможение в конце */
}

/* Плашка шапки — всегда тёмная, при прокрутке не меняется (одно
   состояние — без мигания цветов и рассинхрона на проде). Выпадающие
   панели внутри неё переопределяют токены обратно на светлые (см. выше). */
.site-header .hdr {
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
  /* Контур — чтобы плашка не сливалась с тёмными блоками страницы
     (шаги, подвал), тень — отделяет её от светлых */
  box-shadow: inset 0 0 0 var(--hdr-hair) var(--hdr-line), 0 0.75rem 2rem -1.25rem var(--hdr-shadow);
}
@media (min-width: 80rem) {
  .hdr { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
}
/* Телефон: плашка на ~7 % выше (3.5 → 3.75rem) за счёт поля вокруг
   кнопок — кнопки и текст прежние; полоса --header-bar (4.5rem) та же,
   плашка в неё помещается, отступ страницы под шапкой не меняется */
@media (max-width: 47.9375rem) {
  .hdr { --hdr-pill-gap: 0.5rem; }
}

.site-header :is(a, button):focus-visible,
.mnav :is(a, button):focus-visible {
  outline: 0.125rem solid var(--hdr-focus);
  outline-offset: 0.125rem;
}
/* Фокус, возвращённый после закрытия пальцем, — без обводки (returnFocusTo) */
.site-header [data-focus-quiet]:focus-visible { outline: none; }

.hdr-ico { flex: none; width: 1rem; height: 1rem; }
.hdr-ico--lg { width: 1.25rem; height: 1.25rem; }
.hdr-num { font-variant-numeric: tabular-nums; }

/* ── Бренд ── */
/* max-width — не шире своей колонки: иначе на 320–350 px текст бренда
   (nowrap) уходил под кнопки справа, а не сокращался многоточием */
.hdr-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  max-width: 100%;
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
  transition: opacity 300ms var(--hdr-ease);
}
/* На тёмной плашке знак инвертирован: светлый круг, тёмные буквы VFD */
.site-header .hdr-mark img { filter: invert(1); }
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
/* Телефоны — одним блоком: общая подложка, между номерами — линия */
.hdr-pop__phones {
  overflow: hidden;
  border-radius: 0.875rem;
  background: var(--hdr-fill);
}
.hdr-pop__phone {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.875rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.hdr-pop__phone + .hdr-pop__phone { box-shadow: inset 0 var(--hdr-hair) 0 var(--hdr-line); }
.hdr-pop__phone:hover { background: var(--hdr-fill-hover); }
.hdr-pop__phone:focus-visible { outline-offset: -0.125rem; }
.hdr-pop__phone-num { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; }
.hdr-pop__map { display: inline-block; margin-top: 0.25rem; }
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

.mnav:focus { outline: none; }
.mnav__top { flex: none; border-bottom: var(--hdr-hair) solid var(--hdr-line); }

/* Середина прокручивается, панель звонка внизу закреплена */
.mnav__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: 1.5rem;
}

/* ── Салон: статус крупно, адрес и маршрут ── */
.mnav__visit {
  --tint: var(--hdr-closed-tint);
  --state: var(--hdr-closed);
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  /* Подсветка статуса — из угла со статусом, к середине уходит в серый */
  background: linear-gradient(135deg, color-mix(in srgb, var(--tint) 16%, var(--hdr-fill)) 0%, var(--hdr-fill) 70%);
}
.mnav__visit.is-open { --tint: var(--hdr-open-tint); --state: var(--hdr-open); }
.mnav__state {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.625rem;
  margin: 0;
}
.mnav__dot {
  flex: none;
  align-self: center;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--tint);
  box-shadow: 0 0 0 0.25rem color-mix(in srgb, var(--tint) 22%, transparent);
}
.mnav__state-title { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.01em; color: var(--state); }
.mnav__state-detail { font-size: 0.9375rem; font-weight: 500; color: var(--hdr-fg); }
.mnav__where {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: var(--hdr-hair) solid var(--hdr-line);
}
/* Не уже 11 rem: на узком экране «Маршрут» уходит под адрес, а не сжимает его */
.mnav__where-text { display: flex; flex: 1 1 11rem; flex-direction: column; gap: 0.125rem; min-width: 0; margin: 0; }
.mnav__where-main { font-size: 0.9375rem; font-weight: 600; }
.mnav__muted { font-size: 0.8125rem; line-height: 1.4; color: var(--hdr-fg-soft); }
.mnav__route {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.375rem;
  min-height: var(--hdr-tap);
  padding: 0 1rem;
  border-radius: 999rem;
  background: var(--hdr-bg);
  color: var(--hdr-fg);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: inset 0 0 0 var(--hdr-hair) var(--hdr-line);
}
.mnav__route:active { background: var(--hdr-fill-hover); }

/* ── Разделы: группы-карточки, строки — название и пояснение ── */
.mnav__group { margin-top: 1.5rem; }
.mnav__group-title {
  margin: 0 0 0.5rem 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--hdr-fg-muted);
}
.mnav__list {
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
  border-radius: 1rem;
  background: var(--hdr-fill);
}
/* Линия между строками — с отступом слева, как в системных списках */
.mnav__list > li { position: relative; }
.mnav__list > li + li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 1rem;
  right: 0;
  height: var(--hdr-hair);
  background: var(--hdr-line);
}
.mnav__row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.625rem 0.875rem 0.625rem 1rem;
  color: var(--hdr-fg);
  text-decoration: none;
  transition: background-color 150ms var(--hdr-ease);
}
.mnav__row:active { background: var(--hdr-fill-hover); }
.mnav__row:focus-visible { outline-offset: -0.125rem; border-radius: 1rem; }
.mnav__row-text { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
.mnav__row-title { font-size: 1rem; font-weight: 600; line-height: 1.3; }
/* Пояснения на серой карточке — на ступень темнее подписей: slate-500 на
   slate-100 даёт 4,3 при норме 4,5 (WCAG AA), slate-600 — 6,6 */
.mnav__row-desc { font-size: 0.8125rem; line-height: 1.35; color: var(--hdr-fg-soft); }
.mnav__chev { color: var(--hdr-fg-muted); }
.mnav__row-ico { width: 1.125rem; height: 1.125rem; color: var(--hdr-fg); }
/* Текущая страница — красная черта слева */
.mnav__row.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.75rem;
  bottom: 0.75rem;
  width: 0.1875rem;
  border-radius: 0 0.125rem 0.125rem 0;
  background: var(--hdr-signal);
}

/* ── Внизу: звонок в салон и мессенджеры ── */
.mnav__foot {
  flex: none;
  padding-block: 0.75rem calc(0.75rem + env(safe-area-inset-bottom, 0rem));
  border-top: var(--hdr-hair) solid var(--hdr-line);
  background: var(--hdr-bg);
}
.mnav__bar { display: flex; align-items: center; gap: 0.5rem; }
.mnav__call {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  min-height: 3.25rem;
  border-radius: 999rem;
  background: var(--hdr-primary);
  color: var(--hdr-on-primary);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 180ms var(--hdr-ease);
}
.mnav__call:active { background: var(--hdr-primary-hover); }
.mnav__msg {
  display: grid;
  place-items: center;
  flex: none;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  background: var(--hdr-fill);
  transition: background-color 150ms var(--hdr-ease);
}
.mnav__msg:active { background: var(--hdr-fill-hover); }
.mnav__msg img { display: block; width: 1.625rem; height: 1.625rem; }
/* Узкий телефон (320–359 px): кнопки мессенджеров — минимальная зона
   нажатия, чтобы «Позвонить» с иконкой помещалась в строку */
@media (max-width: 22.4375rem) {
  .mnav__msg { width: var(--hdr-tap); height: var(--hdr-tap); }
  .mnav__msg img { width: 1.5rem; height: 1.5rem; }
  .mnav__call { min-height: var(--hdr-tap); font-size: 0.9375rem; }
}

@media (prefers-reduced-motion: reduce) {
  .hdr, .hdr-link, .hdr-link__chev, .hdr-phone, .hdr-cta, .hdr-round,
  .hdr-mark img, .burger-icon__line, .mnav__row, .mnav__call, .mnav__msg {
    transition: none;
  }
  .hdr-brand__text.is-intro .hdr-brand__line > span { animation: none; }
}
</style>
