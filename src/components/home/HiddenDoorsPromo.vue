<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import {
  SECRET_MIN_BLADE_PRICE, SECRET_MIN_KIT_PRICE,
  SECRET_MIN_BLADE_PRICE_ORIGINAL, SECRET_MIN_KIT_PRICE_ORIGINAL,
  SECRET_PROMO_ACTIVE,
} from '../../data/skrytye-dveri-products'
import BenefitList from './BenefitList.vue'
import PromoBadge from './PromoBadge.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

const INVISIBLE_CDN = 'https://storage.yandexcloud.net/vfd74ru/invisible/'

// Локальные копии 1300w (scripts/gen-home-images.mjs); последний слайд —
// оригинал, он и так лёгкий (15КБ).
const SLIDES = [
  '/renders/home/secret-cover.webp',
  '/renders/home/secret-2.webp',
  '/renders/home/secret-3.webp',
  `${INVISIBLE_CDN}reverse_render_11zon.webp`,
]

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="hidden-doors-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1.1fr_1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Фото — без текстового оверлея, суть продукта в том, что дверь
             сливается со стеной. lg:aspect-auto + items-stretch на родителе
             тянет фото на всю высоту текстовой колонки (без зазора сверху/
             снизу) — после сокращения отступов колонки (p-8, компактный
             чек-лист) высота уже соразмерна Hero, растяжка больше не
             выглядит непропорционально вытянутой. -->
        <div class="relative aspect-4/3 sm:aspect-video lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Скрытая дверь серии «Секрет» — полотно заподлицо со стеной"
          />
        </div>

        <!-- Контент — раньше 6 блоков (eyebrow/h2/p, ul на 4 строки,
             бейдж, 2 отдельных ряда цены, кнопка) шли плотным вертикальным
             стеком с полными gap/padding на каждом — карточка выходила
             заметно выше фото рядом. Список преимуществ — в 2 колонки
             (2 строки вместо 4), цена — одной строкой с двумя цифрами
             рядом вместо двух отдельных "justify-between" рядов. -->
        <div class="flex flex-col gap-3.5 p-6 sm:gap-4 sm:p-7">
          <div>
            <PromoBadge tone="stock">В наличии</PromoBadge>
            <h2
              id="hidden-doors-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Скрытые двери из наличия в Москве
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Полотно заподлицо со стеной. Алюминиевый короб без наличников и видимых петель — под покраску, штукатурку или обои в цвет стены.
            </p>
          </div>

          <BenefitList :items="['Полностью алюминиевый короб', 'Реверсивный монтаж — сторона на выбор', 'Полотна нестандартной высоты', 'Грунт — готово под покраску']" />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div
              v-if="SECRET_PROMO_ACTIVE"
              class="inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
            >
              Акция −8% до 31 августа
            </div>
            <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Полотно
                <span v-if="SECRET_PROMO_ACTIVE" class="text-slate-400 line-through">{{ fmt(SECRET_MIN_BLADE_PRICE_ORIGINAL) }}</span>
                <span class="text-lg font-medium text-slate-900">{{ fmt(SECRET_MIN_BLADE_PRICE) }}</span>
              </span>
              <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Комплект
                <span v-if="SECRET_PROMO_ACTIVE" class="text-slate-400 line-through">{{ fmt(SECRET_MIN_KIT_PRICE_ORIGINAL) }}</span>
                <span class="text-lg font-medium text-slate-900">{{ fmt(SECRET_MIN_KIT_PRICE) }}</span>
              </span>
            </div>
          </div>

          <a href="/catalog/skrytye-dveri/" class="group/link mt-1 inline-flex w-full items-center justify-between gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Смотреть скрытые двери
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500">
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
