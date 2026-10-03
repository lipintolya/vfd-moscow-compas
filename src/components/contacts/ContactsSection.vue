<script setup lang="ts">
import { ref } from 'vue'
import { companyLegalInfo, getFormattedHours } from '../../lib/contacts-data'
import { paymentMethods } from '../about/about-data'
import { SITE } from '../../config/site'
import { MEASURE_TERMS } from '../../data/services'

/* Все контакты — из contacts-data.ts (единый источник для футера, шапки,
   /about/ и структурированных данных), а не хардкодом: раньше номера, часы
   и реквизиты здесь были вписаны руками и успели разойтись с остальным сайтом. */
const phones   = companyLegalInfo.contacts.phone
const email    = companyLegalInfo.contacts.email
const address  = companyLegalInfo.address
const director = companyLegalInfo.director
const req      = companyLegalInfo.requisites

const TG  = SITE.social.telegram
const ROUTE = SITE.address.mapUrl

/* Одинаковый график всю неделю — одна строка «Ежедневно»; если выходные
   разойдутся с буднями, строки разделятся сами. */
const [weekdays, saturday, sunday] = getFormattedHours()
const hours = weekdays!.time === saturday!.time && saturday!.time === sunday!.time
  ? [{ day: 'Ежедневно', time: weekdays!.time }]
  : saturday!.time === sunday!.time
    ? [weekdays!, { day: 'Сб–Вс', time: saturday!.time }]
    : [weekdays!, saturday!, sunday!]

/* Yandex-карта — тяжёлый сторонний iframe (свой JS + тайлы): до клика
   показываем статичный снимок карты с меткой салона (тот же, что в футере). */
const mapLoaded = ref(false)
const { lat, lng } = address.coordinates
const MAP_SRC = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=17&pt=${lng}%2C${lat}&l=map`
</script>

<template>
  <section class="section">
    <div class="container">

      <!-- ── Шапка + быстрые действия ── -->
      <header class="mb-10 max-w-3xl lg:mb-14">
        <p class="t-eyebrow mb-3">Салон в ТЦ «Компас»</p>
        <h1 class="t-h1 mb-4">Контакты салона дверей ВФД в Москве</h1>
        <p class="m-0 mb-6 t-lead text-slate-600">
          Позвоните или приезжайте в салон — покажем двери и перегородки вживую
          и выедем на замер.
        </p>

        <div class="flex flex-wrap items-center gap-2.5">
          <a
            :href="`tel:${phones[0]!.raw}`"
            class="group/link inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-accent"
          >
            Позвонить
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5">
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </a>
          <a :href="TG" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Telegram-канал {{ SITE.social.telegramHandle }}</a>
        </div>
      </header>

      <!-- ── Контакты + карта ── -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">

        <!-- Левая колонка: как связаться -->
        <div class="flex flex-col gap-3.5">
          <a
            v-for="p in phones"
            :key="p.raw"
            :href="`tel:${p.raw}`"
            class="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-graphite text-white">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-lg font-medium text-ink tabular-nums">{{ p.label }}</span>
              <span class="block text-sm text-slate-500">{{ p.title }}</span>
            </span>
            <span class="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>

          <a
            :href="`mailto:${email}`"
            class="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-graphite text-white">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-lg font-medium text-ink">{{ email }}</span>
              <span class="block text-sm text-slate-500">Для документов, смет и проектов</span>
            </span>
            <span class="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </a>

          <!-- Часы работы -->
          <div class="rounded-2xl bg-graphite p-6 text-white">
            <p class="m-0 mb-4 text-sm text-white/60">Часы работы — без выходных</p>
            <div class="flex flex-col gap-2.5">
              <div v-for="h in hours" :key="h.day" class="flex items-baseline justify-between gap-3">
                <span class="text-sm text-white/60">{{ h.day }}</span>
                <span class="text-2xl font-medium tracking-tight tabular-nums">{{ h.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая колонка: адрес + карта -->
        <div class="flex flex-col overflow-hidden rounded-2xl border border-slate-200">
          <div class="p-6">
            <p class="m-0 mb-1 text-sm text-slate-500">Адрес салона</p>
            <p class="m-0 mb-1 text-lg font-medium text-ink">{{ address.postal }}</p>
            <p class="m-0 mb-5 text-sm text-slate-600">{{ address.entrance }}</p>
            <a :href="ROUTE" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Построить маршрут</a>
          </div>

          <div class="relative min-h-72 flex-1 bg-slate-100">
            <iframe
              v-if="mapLoaded"
              :src="MAP_SRC"
              title="Салон ВФД на Яндекс Картах"
              class="absolute inset-0 h-full w-full border-0"
            />
            <button
              v-else
              type="button"
              class="group absolute inset-0 h-full w-full"
              aria-label="Открыть интерактивную карту"
              @click="mapLoaded = true"
            >
              <img
                src="/renders/footer-map.webp"
                alt=""
                width="650"
                height="450"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover"
              />
              <span class="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-md ring-1 ring-slate-900/5 transition-colors group-hover:bg-white">
                Открыть интерактивную карту
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Оплата + реквизиты ── -->
      <div class="mt-5 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-2 lg:gap-6">
        <div class="rounded-2xl border border-slate-200 p-6">
          <h2 class="m-0 mb-4 text-lg font-medium text-ink">Способы оплаты</h2>
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            <li v-for="m in paymentMethods" :key="m.id" class="flex gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0 text-accent-600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 5 5 9-10"/>
              </svg>
              <span>
                <span class="block text-sm font-medium text-ink">{{ m.title }}</span>
                <span class="block text-sm text-slate-500">{{ m.description }}</span>
              </span>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-slate-200 p-6">
          <h2 class="m-0 mb-4 text-lg font-medium text-ink">Реквизиты</h2>
          <dl class="m-0 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div class="sm:col-span-2">
              <dt class="text-slate-500">Индивидуальный предприниматель</dt>
              <dd class="m-0 font-medium text-ink">{{ director.fullName }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">ИНН</dt>
              <dd class="m-0 font-medium text-ink tabular-nums">{{ req.inn }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">ОГРНИП</dt>
              <dd class="m-0 font-medium text-ink tabular-nums">{{ req.ogrnip }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Дата регистрации</dt>
              <dd class="m-0 font-medium text-ink">{{ companyLegalInfo.activity.registered }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Регистрирующий орган</dt>
              <dd class="m-0 font-medium text-ink">{{ companyLegalInfo.taxation.tax_office }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- ── Что вы получаете — стек карточек, "переворот" на скролле (мобайл) ── -->
      <div class="mt-14 border-t border-slate-200 pt-12">
        <h2 class="t-h2 mb-6">Что вы получаете</h2>
        <div class="wtg-stack">
          <article class="wtg-card wtg-card--1" style="--wtg-i: 0">
            <div class="wtg-card__body">
              <h3 class="wtg-card__title">Бесплатные консультации</h3>
              <div class="wtg-card__tags">
                <span>Подбор моделей</span>
                <span>Образцы покрытий</span>
                <span>Помощь дизайнера</span>
              </div>
              <p class="wtg-card__text">
                Специалист салона поможет подобрать модель, покрытие и цвет под ваш интерьер и бюджет — вживую, с образцами материалов на руках. Консультация ни к чему не обязывает.
              </p>
            </div>
          </article>

          <article class="wtg-card wtg-card--2" style="--wtg-i: 1">
            <div class="wtg-card__body">
              <h3 class="wtg-card__title">Выезд на замер</h3>
              <div class="wtg-card__tags">
                <span>Москва и область</span>
                <span>Точные размеры</span>
                <span>Расчёт сметы</span>
              </div>
              <p class="wtg-card__text">
                Мастер выезжает на объект, снимает точные размеры проёма и учитывает особенности стен — от этого зависят итоговая смета и корректность монтажа. {{ MEASURE_TERMS }}, стоимость выезда за город уточнит менеджер.
              </p>
            </div>
          </article>

          <article class="wtg-card wtg-card--3" style="--wtg-i: 2">
            <div class="wtg-card__body">
              <h3 class="wtg-card__title">Гарантия на монтаж и материалы</h3>
              <div class="wtg-card__tags">
                <span>12 месяцев на работы</span>
                <span>Гарантия производителя</span>
                <span>Постгарантийная поддержка</span>
              </div>
              <p class="wtg-card__text">
                На монтажные работы даём гарантию 12 месяцев, на сами двери и перегородки — по условиям производителя. Если после установки что-то потребует внимания, обращайтесь напрямую в салон, без посредников.
              </p>
            </div>
          </article>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── «Что вы получаете» — стек карточек ──
   Мобайл: карточки залипают (position: sticky) на разных отступах сверху
   и с ростом z-index — при скролле каждая следующая карточка наезжает на
   предыдущую, оставляя виден верхний край (эффект "переворота колоды").
   Десктоп: обычная сетка в 3 колонки, без sticky. */
.wtg-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border-radius: 1.5rem;
  min-height: 20rem;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.35);
}
.wtg-card--1 { background: var(--color-slate-700); }
.wtg-card--2 { background: var(--color-slate-800); }
.wtg-card--3 { background: var(--color-graphite); }

.wtg-card__body {
  position: relative;
  z-index: 1;
  padding: 2rem;
}
.wtg-card__title {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #fff;
  margin: 0 0 1rem;
}
.wtg-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.wtg-card__tags span {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}
.wtg-card__text {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
  max-width: 34rem;
  margin: 0;
}

@media (max-width: 767px) {
  .wtg-stack {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .wtg-card {
    position: sticky;
    top: calc(5.5rem + var(--wtg-i) * 1.75rem);
    z-index: calc(var(--wtg-i) + 1);
    min-height: 16rem;
    margin-bottom: 1.75rem;
  }
}

@media (min-width: 768px) {
  .wtg-stack {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}
</style>
