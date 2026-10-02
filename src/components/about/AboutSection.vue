<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  companyInfo,
  director,
  galleryImages,
  requisites,
  paymentMethods,
} from './about-data'
import { companyLegalInfo, getFormattedHours } from '../../lib/contacts-data'

/* Часы работы — из единого источника (contacts-data.ts), не статичной
   строкой на карточке, чтобы график не расходился между страницами. */
const workingHoursDisplay = computed(() => {
  const [weekdays, saturday, sunday] = getFormattedHours()
  // Сб и Вс сейчас работают по одному графику — не дублируем время дважды
  // («Сб: 10:00–18:00, 10:00–18:00»), а объединяем в один диапазон дней.
  const weekendLabel = saturday.time === sunday.time
    ? `${saturday.day}–${sunday.day}: ${saturday.time}`
    : `${saturday.day}: ${saturday.time}, ${sunday.day}: ${sunday.time}`
  return `${weekdays.day}: ${weekdays.time}, ${weekendLabel}`
})

/* Разделы каталога для блока «Что можно выбрать в салоне». */
const CATEGORIES = [
  { href: '/catalog/',               title: 'Межкомнатные двери',      text: 'Эмалекс, эмаль, ПЭТ, Протач и экошпон — десятки серий и цветов' },
  { href: '/catalog/skrytye-dveri/', title: 'Скрытые двери',           text: 'Полотно вровень со стеной, под покраску, штукатурку или с зеркалом' },
  { href: '/vhodnye-dveri/',         title: 'Входные двери',           text: 'Для квартиры и частного дома, в том числе с терморазрывом' },
  { href: '/partitions/',            title: 'Алюминиевые перегородки', text: 'Раздвижные и распашные системы в профиле GRAFIA, 13 цветов' },
  { href: '/catalog/decor/',         title: 'Погонаж и декор',         text: 'Коробки, наличники, доборы, плинтус, фальшфрамуги, рейки' },
  { href: '/portfolio/',             title: 'Наши работы',             text: 'Фотоотчёты монтажей в квартирах, домах и офисах Челябинска' },
]

/* ============================================================
   Lightbox
============================================================ */
const lightboxIndex = ref<number | null>(null)

/* SSR рендерит лайтбокс закрытым, но Teleport-в-body всё равно попадает в
   SSR-разметку как placeholder и коллизирует со служебной разметкой Astro
   (astro-island/astro-slot) — Vue при гидратации ловит "Hydration node
   mismatch" (см. тот же фикс в Reviews.vue). Лайтбокс нужен только после
   клика, поэтому держим Teleport вне SSR/гидратации вовсе. */
const mounted = ref(false)

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

const prevImage = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + galleryImages.length) % galleryImages.length
}

const nextImage = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % galleryImages.length
}

const handleKeydown = (e: KeyboardEvent) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="bg-white overflow-x-hidden">

    <!-- ======================================================
         HERO — фото рядом с текстом, тот же паттерн, что на
         /o-fabrike/: мобайл-фёрст, фото первым на узких экранах.
    ======================================================= -->
    <section class="section">
      <div class="container">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">

          <div class="order-2 lg:order-1">
            <p class="t-eyebrow mb-3">Официальный дилер Владимирской фабрики дверей</p>

            <h1 class="t-h1 mb-5">
              Салон дверей ВФД в Челябинске — <span class="text-teal-600">всё начинается с дверей</span>
            </h1>

            <p class="m-0 mb-4 t-lead text-slate-600">
              С {{ companyInfo.founded }} года мы работаем напрямую с
              <a href="/o-fabrike/" class="text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700">Владимирской фабрикой дверей</a>
              и собираем в одном салоне всё для интерьера: межкомнатные, скрытые и входные двери,
              алюминиевые перегородки, погонаж и фурнитуру.
            </p>
            <p class="m-0 mb-6 t-lead text-slate-600">
              Здесь не выбирают «по картинке» — вы сравниваете материалы вживую, видите реальные
              оттенки при разном освещении и сразу понимаете, как это будет смотреться в вашем
              интерьере. Помогаем частным клиентам, дизайнерам и студиям, реализуем проекты
              для коммерческих объектов — от квартир до офисов.
            </p>

            <div class="mb-8 flex flex-wrap items-center gap-2.5">
              <a
                href="https://t.me/vfddoors74"
                target="_blank"
                rel="noopener"
                class="group/link inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-accent"
              >
                Написать в Telegram
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </a>

              <a
                href="https://vk.com/vfddoors74"
                target="_blank"
                rel="noopener"
                aria-label="Написать в VK"
                class="btn btn-outline btn-icon"
              >
                <img src="/icons/b_vk_logo.webp" alt="" width="18" height="18" />
              </a>

              <a
                href="https://max.ru/id452402308842_biz"
                target="_blank"
                rel="noopener"
                aria-label="Написать в MAX"
                class="btn btn-outline btn-icon"
              >
                <img src="/icons/b_max_logo.webp" alt="" width="18" height="18" />
              </a>

              <a
                href="https://yandex.ru/maps/-/CPTwZPi-"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline"
              >
                Построить маршрут
              </a>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3.5">
              <div class="rounded-2xl border border-slate-200 p-4">
                <span class="block text-2xl font-medium leading-none text-ink sm:text-3xl">{{ companyInfo.founded }}</span>
                <span class="mt-1.5 block text-xs leading-snug text-slate-500">год основания</span>
              </div>
              <div class="rounded-2xl border border-slate-200 p-4">
                <span class="block text-2xl font-medium leading-none text-ink sm:text-3xl">60+</span>
                <span class="mt-1.5 block text-xs leading-snug text-slate-500">моделей в выставочном зале</span>
              </div>
              <div class="rounded-2xl border border-slate-200 p-4">
                <span class="block text-2xl font-medium leading-none text-ink sm:text-3xl">12 мес.</span>
                <span class="mt-1.5 block text-xs leading-snug text-slate-500">гарантия на монтаж</span>
              </div>
            </div>
          </div>

          <!-- Photo + address/hours как подписи под фото (не абсолютным
               floating card с вылетом за контейнер — на мобильном это
               раньше просто пряталось, теперь адрес/часы всегда видны). -->
          <div class="order-1 lg:order-2">
            <button
              type="button"
              class="group block w-full overflow-hidden rounded-3xl"
              @click="openLightbox(0)"
              aria-label="Открыть галерею салона"
            >
              <img
                :src="galleryImages[0]?.src"
                :alt="galleryImages[0]?.alt"
                width="900"
                height="675"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                class="aspect-4/3 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 lg:aspect-auto lg:h-full"
              />
            </button>

            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-slate-50 p-3.5">
                <p class="m-0 mb-1 text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400">Адрес</p>
                <p class="m-0 text-sm font-medium leading-snug text-ink">{{ companyLegalInfo.address.legal }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3.5">
                <p class="m-0 mb-1 text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400">Режим работы</p>
                <p class="m-0 text-sm font-medium leading-snug text-ink">{{ workingHoursDisplay }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================
         ЧТО ЕСТЬ В САЛОНЕ — ассортимент со ссылками на разделы
         каталога: для посетителя это быстрый переход, для поиска —
         перелинковка «О нас» → товарные разделы.
    ======================================================= -->
    <section class="section bg-white">
      <div class="container">
        <p class="t-eyebrow mb-3">Ассортимент</p>
        <h2 class="t-h2 mb-8 md:mb-10">Что можно выбрать в салоне</h2>
        <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="c in CATEGORIES"
            :key="c.href"
            :href="c.href"
            class="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span>
              <span class="mb-1 block text-base font-medium text-ink">{{ c.title }}</span>
              <span class="block text-sm leading-relaxed text-slate-500">{{ c.text }}</span>
            </span>
            <span class="mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ======================================================
         ЭКСПОЗИЦИЯ — те же double-bezel карточки, что в Features/
         CatalogCategories на главной, вместо текста-поверх-фото.
    ======================================================= -->
    <section class="section bg-white">
      <div class="container">
        <p class="t-eyebrow mb-3 text-center">Пространство салона</p>
        <h2 class="t-h2 mb-3 text-center">Большой выбор</h2>
        <p class="mx-auto mb-10 max-w-2xl text-center t-lead text-slate-600 md:mb-14">
          Обширная экспозиция дверей и перегородок в одном из самых крупных салонов Владимирской
          фабрики дверей в Челябинске.
        </p>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <button
            type="button"
            class="group relative overflow-hidden rounded-[1.75rem] bg-white p-1.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)] lg:col-span-1 lg:row-span-2"
            @click="openLightbox(1)"
          >
            <div class="relative aspect-4/5 w-full overflow-hidden rounded-[1.375rem] bg-slate-100 lg:h-full lg:aspect-auto">
              <img
                :src="galleryImages[1]?.src"
                :alt="galleryImages[1]?.alt"
                width="700"
                height="933"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/10 to-transparent"></div>
              <div class="absolute inset-x-0 bottom-0 p-6 text-white">
                <span class="mb-2 inline-block text-xs font-semibold uppercase tracking-widest opacity-80">Экспозиция</span>
                <h3 class="m-0 mb-1 text-xl font-medium leading-tight sm:text-2xl">Большой выставочный зал</h3>
                <p class="m-0 text-sm opacity-85">Реальные образцы дверей из наличия и под заказ</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            class="group relative overflow-hidden rounded-[1.75rem] bg-white p-1.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)]"
            @click="openLightbox(2)"
          >
            <div class="relative aspect-4/3 w-full overflow-hidden rounded-[1.375rem] bg-slate-100">
              <img
                :src="galleryImages[2]?.src"
                :alt="galleryImages[2]?.alt"
                width="700"
                height="933"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/10 to-transparent"></div>
              <div class="absolute inset-x-0 bottom-0 p-5 text-white">
                <span class="mb-1.5 inline-block text-xs font-semibold uppercase tracking-widest opacity-80">Консультация</span>
                <h3 class="m-0 text-lg font-medium leading-tight">Подбор под интерьер</h3>
              </div>
            </div>
          </button>

          <button
            type="button"
            class="group relative overflow-hidden rounded-[1.75rem] bg-white p-1.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)]"
            @click="openLightbox(3)"
          >
            <div class="relative aspect-4/3 w-full overflow-hidden rounded-[1.375rem] bg-slate-100">
              <img
                :src="galleryImages[3]?.src"
                :alt="galleryImages[3]?.alt"
                width="700"
                height="933"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-linear-to-t from-slate-900/85 via-slate-900/10 to-transparent"></div>
              <div class="absolute inset-x-0 bottom-0 p-5 text-white">
                <span class="mb-1.5 inline-block text-xs font-semibold uppercase tracking-widest opacity-80">Материалы</span>
                <h3 class="m-0 text-lg font-medium leading-tight">Цвета и покрытия</h3>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================
         DIRECTOR
    ======================================================= -->
    <section class="section bg-slate-50">
      <div class="container">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">

          <div class="mx-auto w-full max-w-xs overflow-hidden rounded-3xl lg:mx-0 lg:max-w-none">
            <img
              :src="director.photo"
              :alt="director.name"
              width="500"
              height="667"
              loading="lazy"
              decoding="async"
              class="aspect-3/4 w-full object-cover"
              style="object-position: 50% 22%"
            />
          </div>

          <div>
            <p class="t-eyebrow mb-3">Руководитель салона</p>
            <h2 class="t-h2 mb-1.5">{{ director.name }}</h2>
            <p class="m-0 mb-6 text-slate-500">{{ director.position }}</p>

            <blockquote class="m-0 mb-6 rounded-2xl border border-slate-200 bg-white p-6 leading-relaxed text-slate-700">
              {{ director.quote }}
            </blockquote>

            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <strong class="mb-1 block text-ink">{{ director.experience }}</strong>
                <span class="text-sm text-slate-500">опыт в индустрии</span>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <strong class="mb-1 block text-ink">Индивидуальный подход</strong>
                <span class="text-sm text-slate-500">к каждому проекту</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================
         GALLERY
    ======================================================= -->
    <section class="section bg-white">
      <div class="container">
        <p class="t-eyebrow mb-3 text-center">Галерея</p>
        <h2 class="t-h2 mb-10 text-center md:mb-14">Интерьер салона</h2>

        <div class="grid grid-cols-2 gap-3.5 lg:grid-cols-3 lg:gap-4">
          <button
            v-for="(img, index) in galleryImages"
            :key="img.id"
            type="button"
            class="group relative aspect-4/5 overflow-hidden rounded-2xl bg-slate-100"
            @click="openLightbox(index)"
          >
            <img
              :src="img.srcThumb"
              :alt="img.alt"
              loading="lazy"
              decoding="async"
              width="480"
              height="600"
              class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div class="absolute inset-0 flex items-end bg-linear-to-t from-slate-900/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span class="text-sm font-semibold text-white">Открыть фото</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================
         PAYMENT
    ======================================================= -->
    <section class="section bg-slate-50">
      <div class="container">
        <p class="t-eyebrow mb-3 text-center">Оплата</p>
        <h2 class="t-h2 mb-10 text-center md:mb-14">Удобные способы оплаты</h2>

        <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="method in paymentMethods"
            :key="method.id"
            class="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-graphite">
              <img
                :src="method.iconPath"
                :alt="method.title"
                width="26"
                height="26"
                class="h-6.5 w-6.5 object-contain"
              />
            </div>
            <h3 class="m-0 mb-2 text-base font-medium text-ink">{{ method.title }}</h3>
            <p class="m-0 text-sm leading-relaxed text-slate-500">{{ method.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ======================================================
         REQUISITES
    ======================================================= -->
    <section class="section bg-white">
      <div class="container">
        <p class="t-eyebrow mb-3 text-center">Реквизиты</p>
        <h2 class="t-h2 mb-10 text-center md:mb-14">Официальная информация</h2>

        <div class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200">
          <div class="flex flex-col gap-1 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <span class="text-sm text-slate-500">Наименование</span>
            <strong class="text-sm font-medium text-ink sm:text-base">{{ requisites.legalName }}</strong>
          </div>
          <div class="flex flex-col gap-1 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <span class="text-sm text-slate-500">ИНН</span>
            <strong class="text-sm font-medium text-ink sm:text-base">{{ requisites.inn }}</strong>
          </div>
          <div class="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <span class="text-sm text-slate-500">ОГРНИП</span>
            <strong class="text-sm font-medium text-ink sm:text-base">{{ requisites.ogrnip }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================
         LIGHTBOX
    ======================================================= -->
    <Teleport v-if="mounted" to="body">
      <div
        v-if="lightboxIndex !== null"
        class="fixed inset-0 z-9999 flex items-center justify-center bg-black/92"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl text-white transition-colors hover:bg-white/25 sm:right-8 sm:top-8"
          aria-label="Закрыть галерею"
          @click="closeLightbox"
        >
          ✕
        </button>

        <button
          type="button"
          class="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition-colors hover:bg-white/25 sm:left-8"
          aria-label="Предыдущее фото"
          @click="prevImage"
        >
          ‹
        </button>

        <img
          :src="galleryImages[lightboxIndex]?.srcFull"
          :alt="galleryImages[lightboxIndex]?.alt"
          decoding="async"
          class="max-h-[88vh] max-w-[92vw] rounded-2xl"
        />

        <button
          type="button"
          class="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition-colors hover:bg-white/25 sm:right-8"
          aria-label="Следующее фото"
          @click="nextImage"
        >
          ›
        </button>
      </div>
    </Teleport>

  </div>
</template>
