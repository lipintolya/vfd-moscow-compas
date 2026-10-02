<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import { REFLEX_IMAGE, REFLEX_MIN_BLADE_PRICE, REFLEX_MIN_KIT_PRICE } from '../../data/skrytye-dveri-products'
import BenefitList from './BenefitList.vue'
import PromoBadge from './PromoBadge.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

// Локальные копии 1300w (scripts/gen-home-images.mjs) вместо CDN-оригиналов.
const SLIDES = [
  '/renders/home/reflex-1.webp',
  '/renders/home/reflex-2.webp',
  '/renders/home/reflex-3.webp',
  REFLEX_IMAGE,
]

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="reflex-promo-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1fr_1.1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <!-- Контент — тот же приём, что в HiddenDoorsPromo/TehnoPromo:
             список преимуществ в 2 колонки, цена одной строкой. -->
        <div class="order-2 flex flex-col gap-3.5 p-6 sm:gap-4 sm:p-7 lg:order-1">
          <div>
            <PromoBadge tone="new">Новинка</PromoBadge>
            <h2
              id="reflex-promo-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Скрытая дверь с зеркалом «Рефлекс»
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Зеркало во всю высоту полотна визуально расширяет пространство и добавляет
              комнате света. Дверь устанавливается вровень со стеной — тот же эффект
              скрытности, что и у «Секрета», плюс полноценное зеркало вместо глухого полотна.
            </p>
          </div>

          <BenefitList :items="['Зеркало во всю высоту полотна', 'Вровень со стеной — эффект скрытности', 'Индивидуальные размеры, высота до 2,5 м', 'Кромка: чёрная, серебро или золото']" />

          <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
              Полотно
              <span class="text-lg font-medium text-slate-900">{{ fmt(REFLEX_MIN_BLADE_PRICE) }}</span>
            </span>
            <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
              Комплект
              <span class="text-lg font-medium text-slate-900">{{ fmt(REFLEX_MIN_KIT_PRICE) }}</span>
            </span>
          </div>

          <a href="/catalog/skrytye-dveri/#reflex" class="group/link mt-1 inline-flex w-full items-center justify-between gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Смотреть «Рефлекс»
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-teal-500">
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </a>
        </div>

        <!-- Фото — lg:aspect-auto + items-stretch на родителе тянет фото на
             всю высоту текстовой колонки (без зазора сверху/снизу) — после
             сокращения отступов колонки высота уже соразмерна Hero,
             растяжка больше не выглядит непропорционально вытянутой. -->
        <div class="order-1 relative aspect-4/3 sm:aspect-video lg:order-2 lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Скрытая дверь с зеркалом «Рефлекс» — полотно заподлицо со стеной"
          />
        </div>
      </div>
    </div>
  </section>
</template>
