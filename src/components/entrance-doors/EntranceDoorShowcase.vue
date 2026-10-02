<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { getSkin, type EntranceDoorModel } from '../../data/entrance-doors'
import { companyLegalInfo } from '../../lib/contacts-data'

const props = withDefaults(defineProps<{
  model:  EntranceDoorModel
  /** true — только для первой карточки в списке /vhodnye-dveri/, если она
      попадает в первый экран; остальные ниже по странице остаются lazy. */
  eager?: boolean
}>(), { eager: false })

const phone = companyLegalInfo.contacts.phone[0]!

/* Мессенджеры — те же иконки/ссылки, что в шапке сайта (Header.vue SOCIAL_NETWORKS) */
const SOCIAL_NETWORKS = [
  { name: 'VK',       label: 'ВК',       url: 'https://vk.com/vfddoors74',              icon: '/icons/b_vk_logo.webp' },
  { name: 'Telegram', label: 'Телеграм', url: 'https://t.me/vfddoors74',                icon: '/icons/b_tg_logo.webp' },
  { name: 'MAX',      label: 'Макс',     url: 'https://max.ru/id452402308842_biz',      icon: '/icons/b_max_logo.webp' },
] as const

type View = 'outside' | 'render' | 'inside'
const VIEW_ORDER: View[] = ['outside', 'render', 'inside']
const view = ref<View>('outside')
const selectedIdx = ref(0)

const selectedOption = computed(() => props.model.skinOptions[selectedIdx.value]!)
const selectedSkin   = computed(() => getSkin(selectedOption.value.skinId))
const currentPrice   = computed(() => selectedOption.value.price)

const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

/* Есть ли выбор накладки — у некоторых моделей (БалансПрайм) накладка одна
   фиксированная, шаги "модель"/"цвет" в этом случае скрываются */
const hasSkinChoice = computed(() => props.model.skinOptions.length > 1)

/* Название накладки для подписи/сообщения — без хвостовой запятой,
   если у накладки нет отдельного цвета (например, накладка "Сектор") */
const skinLabel = computed(() => {
  if (!selectedSkin.value) return ''
  return selectedSkin.value.color ? `${selectedSkin.value.name}, ${selectedSkin.value.color}` : selectedSkin.value.name
})

/* Готовое сообщение в Telegram — модель, накладка и цена уже в тексте,
   не нужно печатать это самому при переходе */
const telegramHref = computed(() => {
  const skinPart = selectedSkin.value ? `, накладка ${skinLabel.value}` : ''
  const text = `Здравствуйте! Хочу узнать про дверь «${props.model.name}»${skinPart} — ${formatPrice(currentPrice.value)}`
  return `https://t.me/vfddoors74?text=${encodeURIComponent(text)}`
})

/* Накладки — двухшаговый выбор (сначала модель — Niuta, ER 1, Atum Pro 28…,
   потом цвет внутри модели). 37 вариантов плоским списком — стена на весь
   экран. Ряды переносятся (flex-wrap), а не скроллятся — скрытый
   overflow-x без видимого скролл-бара недостижим мышью/тачем. */
interface SkinItem { idx: number; skin: NonNullable<ReturnType<typeof getSkin>>; price: number }
interface SkinGroup { name: string; items: SkinItem[] }

const groupedSkins = computed<SkinGroup[]>(() => {
  const groups = new Map<string, SkinGroup>()
  props.model.skinOptions.forEach((opt, idx) => {
    const skin = getSkin(opt.skinId)
    if (!skin) return
    const group = groups.get(skin.name) ?? { name: skin.name, items: [] }
    group.items.push({ idx, skin, price: opt.price })
    groups.set(skin.name, group)
  })
  return [...groups.values()]
})

const activeGroup = computed(() =>
  groupedSkins.value.find(g => g.name === selectedSkin.value?.name) ?? groupedSkins.value[0]
)

/* View Transitions API — плавная смена фото/цены при выборе накладки,
   вместо резкого скачка. Не поддерживается — просто применяем состояние
   как раньше, ничего не ломается (progressive enhancement). */
const withViewTransition = (apply: () => void) => {
  const doc = document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => void }
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(async () => {
      apply()
      await nextTick()
    })
  } else {
    apply()
  }
}

const selectSeries = (group: SkinGroup) => {
  withViewTransition(() => {
    selectedIdx.value = group.items[0]!.idx
    view.value = 'inside'
  })
}
const selectColor = (idx: number) => {
  withViewTransition(() => {
    selectedIdx.value = idx
    view.value = 'inside'
  })
}
const selectView = (v: View) => {
  withViewTransition(() => { view.value = v })
}

/* Свайп по фото листает "Снаружи → Визуализация → Изнутри" — на мобиле
   от фото ожидают жест пальцем, не только тап по табам */
const SWIPE_THRESHOLD = 40
let touchStartX = 0
let touchStartY = 0

const onPhotoTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) return
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
const onPhotoTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches[0]) return
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    const curIdx = VIEW_ORDER.indexOf(view.value)
    const nextIdx = dx > 0 ? Math.min(curIdx + 1, VIEW_ORDER.length - 1) : Math.max(curIdx - 1, 0)
    selectView(VIEW_ORDER[nextIdx]!)
  }
}

/* Характеристики и фурнитура — за аккордеоном, свёрнуты по умолчанию.
   Вынесены ЗА ПРЕДЕЛЫ грида фото+инфо (см. ниже) — иначе раскрытие
   аккордеона растягивает grid-row и тянет фото-карточку вниз/вширь. */
type InfoTab = 'specs' | 'hardware'
const infoTab = ref<InfoTab | null>(null)
const toggleTab = (tab: InfoTab) => { infoTab.value = infoTab.value === tab ? null : tab }
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- ── Фото+инфо. Колонки выравниваются по верху: высоту фото задаёт
         его собственная пропорция, а не длина текста в соседней колонке. ── -->
    <div class="flex flex-col gap-5 md:grid md:grid-cols-[21.25rem_1fr] md:items-start md:gap-10">

      <!-- Фото. Бокс держит пропорцию накладок (699×1500 = 7:15) — их 37 из 39,
           они заполняют его пиксель в пиксель. Два фото самих дверей чуть шире
           (0.49 и 0.525), поэтому object-contain, а не cover: cover срезал бы у
           них ~9% ширины, а у этих кадров петли и кромка короба стоят вплотную
           к краю — срезается именно они. Contain просто центрирует их чуть
           меньшего размера. Подложки у бокса нет: при contain она вылезла бы
           серыми полосками по краям — фон остаётся только под заглушкой.
           На мобиле бокс сужен: 7:15 во всю ширину экрана — это ~750px высоты,
           цена и CTA уехали бы за первый экран. -->
      <div
        class="relative mx-auto aspect-7/15 w-[62%] max-w-70 overflow-hidden rounded-2xl md:mx-0 md:w-full md:max-w-none"
        @touchstart.passive="onPhotoTouchStart"
        @touchend="onPhotoTouchEnd"
      >
        <!-- Плавный кроссфейд смены фото — Vue Transition, а не View Transitions API:
             последний не поддержан во всех браузерах (даёт резкий скачок без
             fallback-анимации), а этот работает одинаково everywhere. -->
        <Transition name="photo-fade">
          <img
            v-if="view === 'outside'"
            key="outside"
            :src="model.doorImage"
            :alt="`${model.name} — вид снаружи`"
            class="absolute inset-0 h-full w-full object-contain"
            :loading="props.eager ? 'eager' : 'lazy'"
            :fetchpriority="props.eager ? 'high' : undefined"
            decoding="async"
          />
          <img
            v-else-if="view === 'render'"
            key="render"
            :src="model.coverImage"
            :alt="`${model.name} — визуализация в интерьере`"
            class="absolute inset-0 h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
          <img
            v-else-if="selectedSkin?.photo"
            :key="selectedSkin.photo"
            :src="selectedSkin.photo"
            :alt="`${model.name} — накладка ${skinLabel}`"
            class="absolute inset-0 h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
          <div v-else key="placeholder" class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 p-6 text-center">
            <span v-if="selectedSkin" class="text-step-2-medium text-slate-600">{{ skinLabel }}</span>
            <span class="t-meta">Фото скоро появится — образец можно посмотреть в салоне</span>
          </div>
        </Transition>

        <div
          class="absolute inset-x-2 top-2 flex gap-0.5 rounded-full bg-white/90 p-1 backdrop-blur-sm sm:inset-x-3 sm:top-3 sm:w-fit sm:gap-1"
          role="tablist" aria-label="Вид двери"
        >
          <button
            type="button" role="tab"
            class="flex-1 rounded-full px-2 py-1.5 text-center text-[0.6875rem] font-medium transition-colors active:scale-95 sm:flex-none sm:px-3.5 sm:text-xs"
            :class="view === 'outside' ? 'bg-ink text-white' : 'text-slate-500'"
            :aria-selected="view === 'outside'"
            @click="selectView('outside')"
          >
            Снаружи
          </button>
          <button
            type="button" role="tab"
            class="flex-1 rounded-full px-2 py-1.5 text-center text-[0.6875rem] font-medium transition-colors active:scale-95 sm:flex-none sm:px-3.5 sm:text-xs"
            :class="view === 'render' ? 'bg-ink text-white' : 'text-slate-500'"
            :aria-selected="view === 'render'"
            @click="selectView('render')"
          >
            Рендер
          </button>
          <button
            type="button" role="tab"
            class="flex-1 rounded-full px-2 py-1.5 text-center text-[0.6875rem] font-medium transition-colors active:scale-95 sm:flex-none sm:px-3.5 sm:text-xs"
            :class="view === 'inside' ? 'bg-ink text-white' : 'text-slate-500'"
            :aria-selected="view === 'inside'"
            @click="selectView('inside')"
          >
            Изнутри
          </button>
        </div>
      </div>

      <!-- Инфо-карточка: название, цена, выбор накладки, CTA -->
      <div class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-6">
        <div class="flex flex-col gap-3.5 border-b border-slate-200 pb-4.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h3 class="t-h3 m-0 mb-1.5 flex flex-wrap items-center gap-2">
              {{ model.name }}
              <span v-if="model.isHit" class="rounded-full bg-rose-600 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-white">Хит</span>
            </h3>
            <p class="t-body m-0">{{ model.tagline }}</p>
          </div>
          <div class="flex flex-col gap-1 sm:items-end sm:text-right" :style="{ viewTransitionName: `door-price-${model.id}` }">
            <span class="t-price">{{ formatPrice(currentPrice) }}</span>
            <span class="t-meta">{{ skinLabel }}</span>
          </div>
        </div>

        <!-- Шаг 1: модель накладки. На мобиле — горизонтальный свайп (нативный
             тач-скролл, не wrap): 13 моделей в wrap-сетке — 5-6 строк на узком
             экране, неудобно сканировать. На sm+ — обычный wrap кликом.
             Скрыт целиком, если у модели только одна фиксированная накладка
             (БалансПрайм) — показывать выбор там, где выбирать нечего, только
             сбивает с толку. -->
        <div v-if="hasSkinChoice">
          <p class="t-label m-0 mb-2.5">Накладка изнутри — модель</p>
          <div class="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
            <button
              v-for="group in groupedSkins"
              :key="group.name"
              type="button"
              class="shrink-0 snap-start rounded-full border-[1.5px] px-4 py-2 text-step-0 font-medium transition-colors active:scale-95"
              :class="group.name === activeGroup?.name
                ? 'border-teal-600 bg-teal-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
              :aria-pressed="group.name === activeGroup?.name"
              @click="selectSeries(group)"
            >
              {{ group.name }}
            </button>
          </div>
        </div>

        <!-- Шаг 2: цвет внутри модели — тот же приём: свайп на мобиле, wrap на sm+.
             Показывается всегда, даже при единственной накладке (БалансПрайм) —
             это не только селектор, но и превью того, что входит в комплект. -->
        <div>
          <p class="t-label m-0 mb-2.5">Цвет</p>
          <div class="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
            <button
              v-for="item in activeGroup?.items ?? []"
              :key="item.idx"
              type="button"
              class="flex w-20 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border-[1.5px] p-2 transition-colors active:scale-95"
              :class="item.idx === selectedIdx ? 'border-teal-600 shadow-[0_0_0_3px_rgba(20,184,166,0.14)]' : 'border-slate-200 hover:border-slate-300'"
              :aria-pressed="item.idx === selectedIdx"
              @click="selectColor(item.idx)"
            >
              <!-- Фото накладки — целая дверь изнутри, снята край-в-край. Пропорция
                   превью = пропорция ассета (699×1500 = 7:15), поэтому cover заполняет
                   точно. При квадратном боксе кроп срезал бы дверь до середины полотна. -->
              <span class="flex aspect-7/15 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                <img
                  v-if="item.skin.photo"
                  :src="item.skin.photo"
                  :alt="item.skin.color || item.skin.name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <svg v-else class="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.3" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="1.5" />
                  <path d="M15 12h.01" stroke-linecap="round" />
                </svg>
              </span>
              <span class="text-center text-[0.6875rem] font-medium leading-tight" :class="item.idx === selectedIdx ? 'text-ink' : 'text-slate-500'">
                {{ item.skin.color || item.skin.name }}
              </span>
            </button>
          </div>
        </div>

        <!-- CTA: на мобиле — компактный ряд иконок (мессенджеры из шапки + телефон
             иконкой), текстовые кнопки там не адаптируются под узкий экран.
             На sm+ — обычные кнопки с текстом, места достаточно. -->
        <div>
          <p class="t-label m-0 mb-2.5 sm:hidden">Узнать больше</p>
          <div class="flex justify-start gap-6 sm:hidden">
            <a
              v-for="s in SOCIAL_NETWORKS"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-col items-center gap-1 active:scale-90"
            >
              <img :src="s.icon" :alt="s.label" class="h-10 w-10" width="40" height="40" />
              <span class="text-[0.6875rem] font-medium text-slate-500">{{ s.label }}</span>
            </a>
            <a
              :href="`tel:${phone.raw}`"
              :title="phone.label"
              class="flex flex-col items-center gap-1 active:scale-90"
            >
              <img src="/icons/phone-call.webp" alt="" class="h-10 w-10" width="40" height="40" />
              <span class="text-[0.6875rem] font-medium text-slate-500">Звонок</span>
            </a>
          </div>
          <div class="hidden flex-wrap items-center gap-2.5 sm:flex">
            <a :href="telegramHref" target="_blank" rel="noopener" class="btn btn-primary active:scale-95">Написать в Telegram</a>
            <a :href="`tel:${phone.raw}`" class="btn btn-outline active:scale-95">{{ phone.label }}</a>
            <a
              v-for="s in SOCIAL_NETWORKS.filter(n => n.name !== 'Telegram')"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`Написать в ${s.label}`"
              class="btn btn-outline entrance-social-btn active:scale-95"
            >
              <img :src="s.icon" alt="" width="18" height="18" />
            </a>
          </div>
        </div>

        <!-- ── Характеристики / комплектация. Раньше блок жил ВНЕ грида фото+инфо:
             при items-stretch раскрытие аккордеона растягивало grid-row и тянуло
             фото-карточку за собой. Теперь колонки выровнены по верху, а высота
             фото задана его собственной пропорцией — раскрытие соседа на неё не
             влияет. Поэтому блок вернулся в правую колонку: закрыл пустоту,
             которая оставалась справа от высокой двери под CTA, и карточка
             читается одним товаром, а не полосой во всю ширину под ним. ── -->
        <div class="mt-1 flex flex-col border-t border-slate-200">
          <div class="border-b border-slate-200">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 py-3.5 text-left text-step-1 font-medium text-ink active:opacity-60"
              :aria-expanded="infoTab === 'specs'"
              @click="toggleTab('specs')"
            >
              Характеристики
              <svg
                class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
                :class="{ 'rotate-180': infoTab === 'specs' }"
                viewBox="0 0 16 16" fill="none" aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <dl v-if="infoTab === 'specs'" class="mb-4 overflow-hidden rounded-xl border border-slate-200">
              <div
                v-for="s in model.specs"
                :key="s.label"
                class="grid grid-cols-1 gap-0.5 px-3.5 py-2.5 odd:bg-slate-50 sm:grid-cols-[11.875rem_1fr] sm:gap-0"
              >
                <dt class="text-xs font-medium text-slate-500">{{ s.label }}</dt>
                <dd class="m-0 text-step-0 leading-relaxed text-ink">{{ s.value }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 py-3.5 text-left text-step-1 font-medium text-ink active:opacity-60"
              :aria-expanded="infoTab === 'hardware'"
              @click="toggleTab('hardware')"
            >
              Комплектация и фурнитура
              <svg
                class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
                :class="{ 'rotate-180': infoTab === 'hardware' }"
                viewBox="0 0 16 16" fill="none" aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <ul v-if="infoTab === 'hardware'" class="m-0 mb-4 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
              <li v-for="h in model.hardware" :key="h" class="relative pl-5 text-step-0 leading-relaxed text-slate-700">
                <span class="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
                {{ h }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* Компактная квадратная кнопка-иконка для VK/MAX рядом с текстовой
   Telegram-кнопкой — тот же .btn-outline, что и остальные CTA, просто
   без текста и с уменьшенным паддингом под 18px иконку. */
.entrance-social-btn {
  flex: 0 0 auto;
  padding: 0.65rem;
}
.entrance-social-btn img { width: 1.125rem; height: 1.125rem; }

.photo-fade-enter-active,
.photo-fade-leave-active { transition: opacity 200ms ease; }
.photo-fade-enter-from,
.photo-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .photo-fade-enter-active,
  .photo-fade-leave-active { transition: none; }
}
</style>
