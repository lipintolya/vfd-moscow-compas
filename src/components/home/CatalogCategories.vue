<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'

interface Category {
  title:    string
  subtitle: string
  image:    string
  href:     string
  cta:      string
}

const CATEGORIES: Category[] = [
  {
    title:    'Межкомнатные двери',
    subtitle: 'Широкий выбор моделей, покрытий и цветов от официального дилера ВФД',
    image:    'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/cover_doors.webp',
    href:     '/catalog/',
    cta:      'Смотреть каталог',
  },
  {
    title:    'Входные двери',
    subtitle: 'Стальные двери с накладкой изнутри под интерьер — с монтажом в Челябинске',
    image:    'https://storage.yandexcloud.net/vfd74ru/metal_doors/Optima/render_optima.webp',
    href:     '/vhodnye-dveri/',
    cta:      'Смотреть входные',
  },
  {
    title:    'Алюминиевые перегородки',
    subtitle: 'Стеклянные перегородки с алюминиевым профилем — под ключ за 45 дней',
    image:    'https://storage.yandexcloud.net/catalog-vfd/catalog_preview/catalog-preview3.webp',
    href:     '/partitions/',
    cta:      'Смотреть перегородки',
  },
]

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section
    ref="sectionEl"
    class="section bg-white"
    aria-labelledby="cat-heading"
  >
    <div class="container">

      <!-- ── Header ── -->
      <header
        class="mb-10 max-w-3xl transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none md:mb-16"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'"
      >
        <p class="t-eyebrow mb-3">
          Что мы предлагаем
        </p>
        <h2 id="cat-heading" class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          Каталог
        </h2>
        <p class="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          Межкомнатные и входные двери, алюминиевые перегородки
          от официального дилера Владимирской фабрики дверей
        </p>
      </header>

      <!-- ── Bento grid ──
           Double-bezel: внешняя белая рамка (p-1.5, тень, hover-подъём)
           имитирует физическую оправу вокруг фото-полотна — карточки
           раньше были плоским фото с overlay прямо на фоне секции, без
           ощущения объекта. Внутренний блок скруглён на padding меньше
           внешнего (концентрические радиусы), поэтому рамка равномерна
           по всему периметру. -->
      <div
        class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-[1fr_2fr] lg:gap-5"
      >

        <!-- Hero card -->
        <article
          class="rounded-[1.75rem] bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-[opacity,transform,box-shadow] duration-600 ease-out hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)] motion-reduce:transition-none"
          :class="visible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-6 opacity-0 blur-sm'"
        >
          <a
            :href="CATEGORIES[0]!.href"
            class="group relative flex h-full aspect-4/3 flex-col overflow-hidden rounded-[1.375rem] no-underline md:aspect-auto md:min-h-105 lg:min-h-135 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-3"
            :aria-label="CATEGORIES[0]!.title"
          >
            <!-- Background -->
            <div
              class="absolute inset-0 bg-cover bg-center transition-transform duration-600 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              :style="{ backgroundImage: `url(${CATEGORIES[0]!.image})` }"
              aria-hidden="true"
            />
            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/5"
              aria-hidden="true"
            />
            <!-- Content -->
            <div class="relative z-10 mt-auto flex flex-col gap-4 p-5 sm:p-8">
              <div class="flex flex-col gap-2">
                <h3 class="text-xl font-medium leading-snug text-white">{{ CATEGORIES[0]!.title }}</h3>
                <p class="max-w-md text-sm leading-relaxed text-white/80">{{ CATEGORIES[0]!.subtitle }}</p>
              </div>
              <span
                class="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full bg-white py-1.5 pl-4 pr-1.5 text-step-0 font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.15)] transition-transform duration-200 ease-out group-hover:-translate-y-px"
                aria-hidden="true"
              >
                {{ CATEGORIES[0]!.cta }}
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:bg-teal-500 group-hover:text-white">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </span>
            </div>
          </a>
        </article>

        <!-- Right column — 2 cards -->
        <div class="grid grid-rows-2 gap-4 lg:gap-5">
          <article
            v-for="(cat, idx) in CATEGORIES.slice(1)"
            :key="cat.href"
            class="rounded-[1.75rem] bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5 transition-[opacity,transform,box-shadow] duration-600 ease-out hover:shadow-[0_1px_2px_rgba(15,23,42,0.08),0_20px_44px_-10px_rgba(15,23,42,0.24)] motion-reduce:transition-none"
            :class="visible ? 'translate-y-0 opacity-100 blur-none' : 'translate-y-6 opacity-0 blur-sm'"
            :style="{ transitionDelay: visible ? `${(idx + 1) * 130}ms` : '0ms' }"
          >
            <a
              :href="cat.href"
              class="group relative flex h-full aspect-3/2 flex-col overflow-hidden rounded-[1.375rem] no-underline md:aspect-auto md:min-h-50 lg:min-h-63.75 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-3"
              :aria-label="cat.title"
            >
              <!-- Background -->
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-600 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                :style="{ backgroundImage: `url(${cat.image})` }"
                aria-hidden="true"
              />
              <!-- Overlay -->
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/5"
                aria-hidden="true"
              />
              <!-- Content -->
              <div class="relative z-10 mt-auto flex flex-col gap-3 p-5 sm:p-6">
                <div class="flex flex-col gap-1.5">
                  <h3 class="text-lg font-medium leading-snug text-white">{{ cat.title }}</h3>
                  <p class="max-w-md text-sm leading-relaxed text-white/80">{{ cat.subtitle }}</p>
                </div>
                <span
                  class="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full bg-white py-1.5 pl-4 pr-1.5 text-step-0 font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.15)] transition-transform duration-200 ease-out group-hover:-translate-y-px"
                  aria-hidden="true"
                >
                  {{ cat.cta }}
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/5 transition-[transform,background-color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:bg-teal-500 group-hover:text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </span>
              </div>
            </a>
          </article>
        </div>

      </div>
    </div>
  </section>
</template>
