<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { accessoriesByCoating, type CoatingSlug } from '../../data/accessories'
import {
  HINGE_PRICE, HINGE_LABEL, HINGE_QTY, HINGE_IMAGES,
  LOCK_PRICE, LOCK_LABEL, LOCK_QTY, LOCK_IMAGES,
  WC_PRICE, WC_LABEL, WC_QTY, WC_IMAGES,
  type HingeType, type HardwareImages,
} from '../../data/hardware'

/* ============================================================
   mounted — гейт для Teleport ниже, прокинут пропом от родителя
   (ProductColorPicker уже маунтит один mounted-ref сам, не плодим
   второй onMounted-обработчик на то же самое). Без гейта Teleport
   попадает в SSR-разметку client:load-компонента как placeholder и
   конфликтует с местом, куда Astro вставляет свой служебный <style>
   для astro-island — Vue при гидратации ловит hydration node mismatch,
   и первый клик после этого не открывает модалку (помогает только
   полная перезагрузка страницы). Тот же паттерн, что в Reviews.vue и
   FigureLightbox.vue.
   ============================================================ */
const props = defineProps<{
  open:        boolean
  mounted:     boolean
  modelName:   string
  photo:       string
  coatingSlug: string
  colorName:   string
  bladePrice:  number
}>()

const emit = defineEmits<{ close: [] }>()

const BOX_QTY       = 3   // 2 стойки + верхняя перекладина
const NALICHNIK_QTY = 5   // с обеих сторон
const DOBOR_QTY      = 3  // по количеству коробных элементов
const DOBOR_DEPTHS   = [100, 150, 200] as const

/* ============================================================
   Выбор — расчёт на одну дверь (комплект)
   ============================================================ */
const boxChecked        = ref(true)
const nalichnikChecked  = ref(true)
const doborChecked      = ref(false)
const doborDepth        = ref<typeof DOBOR_DEPTHS[number]>(100)
const hingeType         = ref<HingeType>('standard')
const lockChecked       = ref(true)
const wcChecked         = ref(false)

/* ============================================================
   Позиции из прайса — базовый (первый в списке) SKU короба и
   наличника для покрытия; добор — по подстроке размера в имени
   (формат "…ШИРИНАх10хВЫСОТА" одинаковый во всех покрытиях).
   ============================================================ */
const accessories = computed(() => accessoriesByCoating[props.coatingSlug as CoatingSlug] ?? [])

const boxItem = computed(() => accessories.value.find(a => a.category === 'box') ?? null)
const nalichnikItem = computed(() => accessories.value.find(a => a.category === 'nalichnik') ?? null)
const doborItem = computed(() =>
  accessories.value.find(a => a.category === 'dobor' && a.name.includes(`${doborDepth.value}х10х`)) ?? null
)

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU') + ' ₽'

/* ============================================================
   Итог
   ============================================================ */
interface Line { label: string; total: number }

const lines = computed<Line[]>(() => {
  const result: Line[] = []
  if (boxChecked.value && boxItem.value?.price != null) {
    result.push({ label: `Короб (${BOX_QTY} шт)`, total: boxItem.value.price * BOX_QTY })
  }
  if (nalichnikChecked.value && nalichnikItem.value?.price != null) {
    result.push({ label: `Наличники с обеих сторон (${NALICHNIK_QTY} шт)`, total: nalichnikItem.value.price * NALICHNIK_QTY })
  }
  if (doborChecked.value && doborItem.value?.price != null) {
    result.push({ label: `Добор ${doborDepth.value} мм (${DOBOR_QTY} шт)`, total: doborItem.value.price * DOBOR_QTY })
  }
  result.push({ label: `${HINGE_LABEL[hingeType.value]} (${HINGE_QTY} шт)`, total: HINGE_PRICE[hingeType.value] * HINGE_QTY })
  if (lockChecked.value) {
    result.push({ label: LOCK_LABEL, total: LOCK_PRICE * LOCK_QTY })
  }
  if (wcChecked.value) {
    result.push({ label: WC_LABEL, total: WC_PRICE * WC_QTY })
  }
  return result
})

const total = computed(() => props.bladePrice + lines.value.reduce((sum, l) => sum + l.total, 0))

/* ============================================================
   "Отправить запрос" — бэкенда нет, поэтому собираем расчёт текстом
   и открываем мессенджер с готовым сообщением. Telegram поддерживает
   ?text= — подставляется прямо в диалог. У VK/MAX такого URL-параметра
   нет (для VK проверяли оба диплинка, vk.me/<screen_name> и
   vk.ru/write-<id> — ни один текст не подставляет; официальный способ —
   JS-виджет CommunityMessages, отдельный скрипт, не стали тащить ради
   этого). Поэтому для всех трёх кнопок клик ещё и копирует текст расчёта
   в буфер — в Telegram это просто подстраховка (вдруг ?text= не сработает
   в конкретном браузере), а для VK/MAX это единственный способ передать
   готовый текст: пользователь открывает диалог и вставляет вручную.
   ============================================================ */
const calcMessage = computed(() => {
  const parts: string[] = [
    `Расчёт стоимости — ${props.modelName}${props.colorName ? ` (${props.colorName})` : ''}`,
    `Полотно: ${fmt(props.bladePrice)}`,
  ]
  for (const l of lines.value) parts.push(`${l.label}: ${fmt(l.total)}`)
  parts.push(`Итого: ${fmt(total.value)}`)
  parts.push('')
  parts.push('Это предварительный расчёт с сайта, прошу уточнить точную стоимость.')
  return parts.join('\n')
})

const telegramHref = computed(() => `https://t.me/vfddoors74?text=${encodeURIComponent(calcMessage.value)}`)
const vkHref  = 'https://vk.com/vfddoors74'
const maxHref = 'https://max.ru/id452402308842_biz'

/** Best-effort — если буфер недоступен (нет разрешения/старый браузер),
    просто ничего не происходит, переход по ссылке всё равно сработает. */
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null
const copyCalcMessage = () => {
  navigator.clipboard?.writeText(calcMessage.value)
    .then(() => {
      copied.value = true
      if (copiedTimer) clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => { copied.value = false }, 3000)
    })
    .catch(() => {})
}

/* ============================================================
   Фото + схема с размерами для петель/замка/WC — своя лёгкая
   Teleport-модалка поверх калькулятора (z-index выше), а не
   переиспользование InfoImageViewer: там своя инлайн-сетка карточек,
   тут нужен только триггер-иконка внутри строки чекбокса.
   ============================================================ */
interface HardwareView { title: string; photo: string; schema: string }
const hardwareView = ref<HardwareView | null>(null)
const openHardwareView = (title: string, images: HardwareImages) => {
  hardwareView.value = { title, ...images }
}
const closeHardwareView = () => { hardwareView.value = null }

/* ============================================================
   Модалка
   ============================================================ */
const close = () => emit('close')
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (hardwareView.value) { closeHardwareView(); return }
  if (props.open) close()
}

watch(() => props.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (!isOpen) hardwareView.value = null
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="calc-fade">
      <div
        v-if="open"
        class="calc-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Калькулятор стоимости — ${modelName}`"
        @click.self="close"
      >
        <div class="calc-panel">
          <button class="calc-close" type="button" aria-label="Закрыть" @click="close">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>

          <h2 class="calc-title">Калькулятор стоимости</h2>
          <p class="calc-subtitle">{{ modelName }}<span v-if="colorName"> — {{ colorName }}</span></p>

          <div class="calc-body">
            <!-- Опции -->
            <div class="calc-options">
              <label class="calc-row">
                <span class="calc-row__control">
                  <input type="checkbox" v-model="boxChecked" :disabled="!boxItem?.price" />
                  Короб
                </span>
                <span class="calc-row__price">{{ boxItem?.price ? fmt(boxItem.price * BOX_QTY) : 'уточняется' }}</span>
              </label>

              <label class="calc-row">
                <span class="calc-row__control">
                  <input type="checkbox" v-model="nalichnikChecked" :disabled="!nalichnikItem?.price" />
                  Наличники с обеих сторон
                </span>
                <span class="calc-row__price">{{ nalichnikItem?.price ? fmt(nalichnikItem.price * NALICHNIK_QTY) : 'уточняется' }}</span>
              </label>

              <div>
                <label class="calc-row calc-row--wrap">
                  <span class="calc-row__control">
                    <input type="checkbox" v-model="doborChecked" :disabled="!doborItem?.price" />
                    Добор
                  </span>
                  <select v-if="doborChecked" v-model.number="doborDepth" class="calc-select" aria-label="Глубина добора">
                    <option v-for="d in DOBOR_DEPTHS" :key="d" :value="d">{{ d }} мм</option>
                  </select>
                  <span class="calc-row__price">{{ doborItem?.price ? fmt(doborItem.price * DOBOR_QTY) : 'уточняется' }}</span>
                </label>
                <p class="calc-hint">Короб — 32 мм. Если стена глубже — добор компенсирует разницу, выбирайте по факту глубины проёма.</p>
              </div>

              <div class="calc-divider" />

              <fieldset class="calc-fieldset">
                <legend class="calc-legend">Петли</legend>
                <label class="calc-row calc-row--radio">
                  <span class="calc-row__control">
                    <input type="radio" name="hinge" value="standard" v-model="hingeType" />
                    {{ HINGE_LABEL.standard }}
                    <button
                      type="button" class="calc-hw-view"
                      :aria-label="`Фото и схема: ${HINGE_LABEL.standard}`"
                      @click.stop.prevent="openHardwareView(HINGE_LABEL.standard, HINGE_IMAGES.standard)"
                    ><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg></button>
                  </span>
                  <span class="calc-row__price">{{ fmt(HINGE_PRICE.standard * HINGE_QTY) }}</span>
                </label>
                <label class="calc-row calc-row--radio">
                  <span class="calc-row__control">
                    <input type="radio" name="hinge" value="hidden" v-model="hingeType" />
                    {{ HINGE_LABEL.hidden }}
                    <button
                      type="button" class="calc-hw-view"
                      :aria-label="`Фото и схема: ${HINGE_LABEL.hidden}`"
                      @click.stop.prevent="openHardwareView(HINGE_LABEL.hidden, HINGE_IMAGES.hidden)"
                    ><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg></button>
                  </span>
                  <span class="calc-row__price">{{ fmt(HINGE_PRICE.hidden * HINGE_QTY) }}</span>
                </label>
              </fieldset>

              <div class="calc-divider" />

              <label class="calc-row">
                <span class="calc-row__control">
                  <input type="checkbox" v-model="lockChecked" />
                  {{ LOCK_LABEL }}
                  <button
                    type="button" class="calc-hw-view"
                    :aria-label="`Фото и схема: ${LOCK_LABEL}`"
                    @click.stop.prevent="openHardwareView(LOCK_LABEL, LOCK_IMAGES)"
                  ><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg></button>
                </span>
                <span class="calc-row__price">{{ fmt(LOCK_PRICE * LOCK_QTY) }}</span>
              </label>

              <label class="calc-row">
                <span class="calc-row__control">
                  <input type="checkbox" v-model="wcChecked" />
                  {{ WC_LABEL }}
                  <button
                    type="button" class="calc-hw-view"
                    :aria-label="`Фото и схема: ${WC_LABEL}`"
                    @click.stop.prevent="openHardwareView(WC_LABEL, WC_IMAGES)"
                  ><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none"/></svg></button>
                </span>
                <span class="calc-row__price">{{ fmt(WC_PRICE * WC_QTY) }}</span>
              </label>
            </div>

            <!-- Итог -->
            <div class="calc-summary">
              <img v-if="photo" :src="photo" :alt="modelName" class="calc-summary__photo" loading="lazy" decoding="async" />
              <div class="calc-summary__lines">
                <div class="calc-summary__line">
                  <span class="calc-summary__line-label">Полотно</span>
                  <span class="calc-summary__line-price">{{ fmt(bladePrice) }}</span>
                </div>
                <div v-for="l in lines" :key="l.label" class="calc-summary__line">
                  <span class="calc-summary__line-label">{{ l.label }}</span>
                  <span class="calc-summary__line-price">{{ fmt(l.total) }}</span>
                </div>
              </div>
              <div class="calc-summary__total">
                <span>Итого</span>
                <span>{{ fmt(total) }}</span>
              </div>
              <p class="calc-summary__note">
                Итоговая стоимость рассчитывается после замера и согласования модели, цвета и фурнитуры.
                Расчёт на сайте — предварительный.
              </p>

              <div class="calc-send">
                <p class="calc-send__label">Отправить запрос менеджеру</p>
                <div class="calc-send__row">
                  <a
                    :href="telegramHref" target="_blank" rel="noopener"
                    class="calc-send__btn" aria-label="Отправить запрос в Telegram"
                    @click="copyCalcMessage"
                  >
                    <img src="/icons/b_tg_logo.webp" alt="" width="20" height="20" />
                    Telegram
                  </a>
                  <a
                    :href="vkHref" target="_blank" rel="noopener"
                    class="calc-send__btn" aria-label="Написать в VK (текст расчёта скопируется в буфер)"
                    @click="copyCalcMessage"
                  >
                    <img src="/icons/b_vk_logo.webp" alt="" width="20" height="20" />
                    VK
                  </a>
                  <a
                    :href="maxHref" target="_blank" rel="noopener"
                    class="calc-send__btn" aria-label="Написать в MAX (текст расчёта скопируется в буфер)"
                    @click="copyCalcMessage"
                  >
                    <img src="/icons/b_max_logo.webp" alt="" width="20" height="20" />
                    MAX
                  </a>
                </div>
                <p class="calc-send__hint" :class="{ 'calc-send__hint--copied': copied }">
                  {{ copied ? 'Текст расчёта скопирован — вставьте в сообщение' : 'Текст расчёта скопируется в буфер — вставьте в сообщение' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Фото + схема с размерами для петель/замка/WC — тот же Teleport,
             что и калькулятор (второй независимый Teleport-в-body от одного
             клиентского компонента ловит "Cannot read properties of null
             (reading insertBefore)" — тот же класс бага, что у WorksGallery,
             только через два РАЗНЫХ Teleport вместо нескольких копий одного).
             z-index выше calc-panel, поэтому просто рисуется поверх. -->
        <Transition name="calc-fade">
          <div
            v-if="hardwareView"
            class="hw-overlay"
            role="dialog"
            aria-modal="true"
            :aria-label="hardwareView.title"
            @click.self="closeHardwareView"
          >
            <button class="hw-close" type="button" aria-label="Закрыть" @click="closeHardwareView">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="hw-panel">
              <p class="hw-panel__title">{{ hardwareView.title }}</p>
              <div class="hw-panel__images">
                <figure class="hw-figure">
                  <img :src="hardwareView.photo" :alt="`${hardwareView.title} — фото`" decoding="async" />
                  <figcaption>Фото</figcaption>
                </figure>
                <figure class="hw-figure">
                  <img :src="hardwareView.schema" :alt="`${hardwareView.title} — схема с размерами`" decoding="async" />
                  <figcaption>Схема с размерами</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.calc-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.calc-panel {
  position: relative;
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
.calc-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  color: #334155;
  cursor: pointer;
  transition: background 150ms ease;
}
.calc-close:hover { background: #e2e8f0; }
.calc-close svg { width: 1.25rem; height: 1.25rem; }

.calc-title {
  margin: 0 0 0.25rem;
  font-size: 1.375rem;
  font-weight: 500;
  color: #0f172a;
  padding-right: 2.5rem;
}
.calc-subtitle {
  margin: 0 0 1.25rem;
  font-size: 0.9375rem;
  color: #64748b;
}

.calc-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
}
@media (min-width: 640px) {
  .calc-body { grid-template-columns: 1.1fr 1fr; }
}

.calc-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.calc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #1e293b;
}
.calc-row--wrap { flex-wrap: wrap; }
.calc-row--radio { padding: 0.375rem 0; }
.calc-row__control {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}
.calc-row__control input[type='checkbox'],
.calc-row__control input[type='radio'] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #0d9488;
  flex-shrink: 0;
}
.calc-row__price {
  flex-shrink: 0;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

.calc-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
}

.calc-hint {
  margin: -0.125rem 0 0.375rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #94a3b8;
}

.calc-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.25rem 0;
}

.calc-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}
.calc-legend {
  padding: 0;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.calc-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.25rem;
  align-self: start;
}
.calc-summary__photo {
  width: 100%;
  max-height: 15rem;
  object-fit: contain;
  border-radius: 0.75rem;
  background: #fff;
}
.calc-summary__lines {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.calc-summary__line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
}
.calc-summary__line-label {
  min-width: 0;
}
.calc-summary__line-price {
  flex-shrink: 0;
  white-space: nowrap;
}
.calc-summary__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding-top: 0.625rem;
  border-top: 1px solid #e2e8f0;
  font-size: 1.375rem;
  font-weight: 600;
  color: #0f172a;
}
.calc-summary__note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #94a3b8;
}

.calc-send {
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}
.calc-send__label {
  margin: 0 0 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
}
.calc-send__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}
.calc-send__btn {
  flex: 1 1 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 3rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  transition: border-color 150ms ease, transform 150ms ease;
}
.calc-send__btn:hover {
  border-color: #99f6e4;
  transform: translateY(-1px);
}
.calc-send__btn img { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
.calc-send__hint {
  margin: 0.625rem 0 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #94a3b8;
}
.calc-send__hint--copied {
  color: #0d9488;
  font-weight: 600;
}

.calc-fade-enter-active,
.calc-fade-leave-active { transition: opacity 180ms ease; }
.calc-fade-enter-from,
.calc-fade-leave-to { opacity: 0; }

/* ── Иконка "показать фото/схему" в строках петель/замка/WC ── */
.calc-hw-view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 150ms ease, background-color 150ms ease;
}
.calc-hw-view:hover { color: #0d9488; background: #f0fdfa; }
.calc-hw-view svg { width: 1rem; height: 1rem; }

/* ── Модалка "фото + схема" для петель/замка/WC — z-index выше
   .calc-overlay, чтобы всегда рисоваться поверх калькулятора. ── */
.hw-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.hw-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease;
}
.hw-close:hover { background: rgba(255, 255, 255, 0.22); }
.hw-close svg { width: 1.375rem; height: 1.375rem; }

.hw-panel {
  width: 100%;
  max-width: 44rem;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 1.25rem;
  padding: 1.5rem;
}
.hw-panel__title {
  margin: 0 0 1rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #0f172a;
  padding-right: 2rem;
}
.hw-panel__images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .hw-panel__images { grid-template-columns: 1fr; }
}
.hw-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hw-figure img {
  width: 100%;
  max-height: 22rem;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 0.75rem;
}
.hw-figure figcaption {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .calc-fade-enter-active,
  .calc-fade-leave-active { transition: none; }
}
</style>
