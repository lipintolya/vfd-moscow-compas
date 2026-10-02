<script setup lang="ts">
import { useScrollReveal } from '../../composables/useScrollReveal'
import { coatingGroupCopy } from '../../data/series-descriptions'
import BenefitList from './BenefitList.vue'
import PromoBadge from './PromoBadge.vue'
import PhotoAutoplaySlider from '../ui/PhotoAutoplaySlider.vue'

/* Цена — пропы из index.astro (живой запрос к Supabase через getCatalogCards,
   тот же путь, что у каталога), не хардкод: если цена в базе поменяется,
   плитка на главной обновится сама при следующей сборке. */
const props = defineProps<{
  bladePrice: number | null
  kitPrice:   number | null
}>()

// Локальные копии 1300w (scripts/gen-home-images.mjs) вместо CDN-оригиналов.
const SLIDES = [
  '/renders/home/tehno-1.webp',
  '/renders/home/tehno-2.webp',
  '/renders/home/tehno-3.webp',
]

/* Эмалекс — те же 3 официальных преимущества покрытия, что и на /catalog/
   (coatingGroupCopy), не отдельный маркетинговый текст под эту плитку. */
const benefits = coatingGroupCopy.emalex?.benefits ?? []
const benefitItems = [
  benefits[0]?.title,
  benefits[1]?.title,
  benefits[2] ? 'Защита от УФ-лучей' : undefined,
].filter((t): t is string => Boolean(t))

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

const { sectionRef, visible } = useScrollReveal(0.15)
</script>

<template>
  <section ref="sectionEl" class="section bg-white" aria-labelledby="tehno-heading">
    <div class="container">
      <div
        class="grid grid-cols-1 items-start overflow-hidden rounded-2xl border border-slate-200 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:grid-cols-[1.1fr_1fr] lg:items-stretch"
        :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
      >
        <div class="relative aspect-4/3 sm:aspect-video lg:aspect-auto">
          <PhotoAutoplaySlider
            :images="SLIDES"
            alt="Межкомнатная дверь серии «Техно» в цвете Эмалекс белый"
          />
        </div>

        <!-- Контент — тот же приём, что в HiddenDoorsPromo/MirrorDoorPromo:
             список преимуществ в 2 колонки, цена одной строкой. -->
        <div class="flex flex-col gap-3.5 p-6 sm:gap-4 sm:p-7">
          <div>
            <PromoBadge tone="new">Новинка</PromoBadge>
            <h2
              id="tehno-heading"
              class="text-3xl font-medium leading-tight tracking-tight text-slate-900 md:text-4xl"
            >
              Серия Техно
            </h2>
            <p class="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Новая коллекция на покрытии Эмалекс для тех, кто ищет сдержанный,
              технологичный характер интерьера.
            </p>
          </div>

          <BenefitList :items="benefitItems" />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="inline-flex w-fit items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
              Техно 1 белый — в наличии на складе
            </div>
            <div v-if="bladePrice" class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Полотно
                <span class="text-lg font-medium text-slate-900">{{ fmt(bladePrice) }}</span>
              </span>
              <span v-if="kitPrice" class="flex items-baseline gap-1.5 text-sm text-slate-500">
                Комплект
                <span class="text-lg font-medium text-slate-900">{{ fmt(kitPrice) }}</span>
              </span>
            </div>
          </div>

          <a href="/catalog/series/tehno/" class="group/link mt-1 inline-flex w-full items-center justify-between gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent">
            Смотреть серию Техно
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-[transform,background-color] duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:bg-accent-500">
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
