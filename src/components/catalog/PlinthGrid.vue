<script setup lang="ts">
/**
 * Карточки напольного плинтуса (/catalog/plintus/): переключатель профиля,
 * фото, номер, описание, размеры и кнопка «Запросить цену».
 * Фото — кнопка: открывает общий просмотрщик сайта (PhotoLightbox) с
 * отрисовками белого варианта в интерьере. «Запросить цену» — окно с
 * телефонами менеджера и ссылками на WhatsApp, Telegram, MAX и ВКонтакте
 * (ВК — когда задан social.vk). В WhatsApp текст уже в ссылке; в Telegram,
 * MAX и ВКонтакте он копируется по клику. Карточки отрисованы на сервере
 * все — переключатель только скрывает лишние.
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import { itemName, itemSizes, PROFILE_LABELS, type PlintusItem, type PlintusProfile } from '../../data/plintus'
import { SITE } from '../../config/site'
import { openLightbox } from '../../lib/lightbox'
import { maxChatUrl, telegramWithText, textWithBody, whatsappWithText } from '../../lib/messengers'
import { useScrollLock } from '../../lib/scroll-lock'
import { upperFirst } from '../../lib/typograph'
import WhatsAppIcon from '../ui/WhatsAppIcon.vue'
import TelegramIcon from '../ui/TelegramIcon.vue'
import MaxIcon from '../ui/MaxIcon.vue'
import { VK_ICON } from '../../lib/messenger-icons'

const props = defineProps<{ items: PlintusItem[] }>()

/* Переключатель: «Все» и профили, которые есть в списке */
const profile = ref<PlintusProfile | ''>('')
const profiles = (Object.keys(PROFILE_LABELS) as PlintusProfile[])
  .map((value) => ({ value, label: PROFILE_LABELS[value], count: props.items.filter((i) => i.profile === value).length }))
  .filter((p) => p.count)
const shown = computed(() => (profile.value ? props.items.filter((i) => i.profile === profile.value) : props.items))

const photoAlt = (item: PlintusItem) => `Напольный плинтус из МДФ, ${itemName(item)}: ${item.text.toLowerCase()}`

/* Текст запроса — одна фраза про позицию; приветствие добавляет messengers.ts */
const requestBody = (item: PlintusItem) =>
  `Интересует напольный плинтус из МДФ, ${itemName(item)} (на фото ${item.text.toLowerCase()}). Подскажите, пожалуйста, цену и наличие.`

const copyHint = SITE.social.vk
  ? 'В WhatsApp текст уже в ссылке. В Telegram, MAX и ВКонтакте он копируется при нажатии — вставьте его в чат.'
  : 'В WhatsApp текст уже в ссылке. В Telegram и MAX он копируется при нажатии — вставьте его в чат.'

const active = ref<PlintusItem | null>(null)
const dialog = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
/* Окно переносим в body — только в браузере (как в CLAUDE.md для островов) */
const mounted = ref(false)
const { lock, unlock } = useScrollLock()

onMounted(() => { mounted.value = true })

function open(item: PlintusItem, event: MouseEvent) {
  trigger.value = event.currentTarget as HTMLElement
  active.value = item
  lock()
  nextTick(() => dialog.value?.focus())
}

function close() {
  if (!active.value) return
  active.value = null
  unlock()
  trigger.value?.focus()
}

/* Отрисовки в интерьере — в общем просмотрщике: листание, номер, возврат фокуса на кнопку */
function openInterior(item: PlintusItem) {
  openLightbox(item.interior.map((src) => ({ src, alt: `${upperFirst(itemName(item))} в интерьере, белый вариант` })), 0)
}
</script>

<template>
  <div>
    <div v-if="profiles.length > 1" class="h-toggles pl-toggles" role="group" aria-label="Профиль">
      <button type="button" class="h-toggle" :aria-pressed="!profile" @click="profile = ''">
        Все <span class="h-toggle__count">{{ items.length }}</span>
      </button>
      <button
        v-for="p in profiles"
        :key="p.value"
        type="button"
        class="h-toggle"
        :aria-pressed="profile === p.value"
        @click="profile = profile === p.value ? '' : p.value"
      >
        {{ p.label }} <span class="h-toggle__count">{{ p.count }}</span>
      </button>
    </div>

    <ul class="pl-grid" role="list">
      <li v-for="item in shown" :key="item.num" class="pl-card">
        <button
          type="button"
          class="pl-card__media"
          :aria-label="`${upperFirst(itemName(item))} в интерьере: ${item.interior.length} фото`"
          @click="openInterior(item)"
        >
          <img
            class="pl-card__img"
            :src="item.photo"
            :srcset="item.photoSrcset"
            sizes="(min-width: 62.5rem) 18rem, (min-width: 43.75rem) 30vw, 46vw"
            :alt="photoAlt(item)"
            width="1000"
            height="1000"
            loading="lazy"
            decoding="async"
          />
          <span class="h-status h-meta h-status--photo pl-card__tag" data-status="order" aria-hidden="true">В интерьере</span>
        </button>
        <h3 class="pl-card__title">Профиль № {{ item.num }}</h3>
        <p class="pl-card__text">{{ item.text }}</p>
        <p class="h-meta pl-card__sizes">{{ itemSizes(item) }}</p>
        <button type="button" class="h-pill pl-card__btn" @click="open(item, $event)">Запросить цену</button>
      </li>
    </ul>

    <Teleport v-if="mounted" to="body">
      <div v-if="active" class="home pm" @click.self="close" @keydown.esc="close">
        <div ref="dialog" class="pm__dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabindex="-1">
          <button type="button" class="pm__close" aria-label="Закрыть" @click="close">×</button>

          <header class="pm__head">
            <img class="pm__photo" :src="active.photo" alt="" width="96" height="96" />
            <div>
              <h2 id="pm-title" class="pm__title">Запросить цену</h2>
              <p class="pm__item">Профиль № {{ active.num }}, {{ active.text.toLowerCase() }}</p>
              <p class="pm__sizes">{{ itemSizes(active) }}</p>
            </div>
          </header>

          <div class="pm__call">
            <p class="pm__call-title">Позвонить менеджеру:</p>
            <a v-for="phone in SITE.phones" :key="phone.raw" class="pm__phone" :href="`tel:${phone.raw}`">{{ phone.label }}</a>
          </div>

          <ul class="pm__links" role="list">
            <li>
              <a class="h-pill pm__link pm__link--main" :href="whatsappWithText(requestBody(active))" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon tone="dark" class="pm__icon" />WhatsApp
              </a>
            </li>
            <li>
              <a
                class="h-pill h-pill--line pm__link"
                :href="telegramWithText(requestBody(active))"
                :data-copy-text="textWithBody(requestBody(active))"
                target="_blank"
                rel="noopener noreferrer"
              ><TelegramIcon class="pm__icon" />Telegram</a>
            </li>
            <li>
              <a
                class="h-pill h-pill--line pm__link"
                :href="maxChatUrl()"
                :data-copy-text="textWithBody(requestBody(active))"
                target="_blank"
                rel="noopener noreferrer"
              ><MaxIcon class="pm__icon" />MAX</a>
            </li>
            <li v-if="SITE.social.vk">
              <a
                class="h-pill h-pill--line pm__link"
                :href="SITE.social.vk"
                :data-copy-text="textWithBody(requestBody(active))"
                target="_blank"
                rel="noopener noreferrer"
              ><img :src="VK_ICON" alt="" class="pm__icon pm__icon--vk" width="20" height="20" />ВКонтакте</a>
            </li>
          </ul>

          <p class="pm__hint">{{ copyHint }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pl-toggles { margin-bottom: clamp(1.5rem, 3vw, 2rem); }

/* Карточки: фото-кнопка, номер, описание, размеры, одна кнопка */
.pl-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem var(--h-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (max-width: 23.4375rem) { .pl-grid { column-gap: 0.75rem; } }
@media (min-width: 43.75rem) { .pl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 62.5rem) { .pl-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

.pl-card { display: flex; flex-direction: column; min-width: 0; }
.pl-card__media {
  position: relative;
  display: block;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--h-radius);
  background: var(--h-media-bg);
  cursor: zoom-in;
}
.pl-card__img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  transition: transform 400ms var(--ease-out);
}
.pl-card__media:hover .pl-card__img { transform: scale(1.04); }
.pl-card__tag { position: absolute; left: 0.5rem; bottom: 0.5rem; font-size: 0.75rem; }
.pl-card__title { margin: 0.75rem 0 0; font-size: 1rem; font-weight: 600; color: var(--h-ink); }
.pl-card__text { margin: 0.125rem 0 0; font-size: 0.9375rem; color: var(--h-soft); }
.pl-card__sizes { margin: 0.375rem 0 0.75rem; color: var(--h-muted); }
/* Кнопка прижата к низу: ряд карточек ровный при описаниях в одну и две строки */
.pl-card__btn {
  justify-content: center;
  width: 100%;
  margin-top: auto;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: normal;
  cursor: pointer;
}
.pl-card__btn,
.pl-card__btn:hover { background: var(--h-ink); border-color: var(--h-ink); color: var(--color-white); }
.pl-card__btn:hover { background: var(--color-slate-700); border-color: var(--color-slate-700); }
@media (prefers-reduced-motion: reduce) {
  .pl-card__img { transition: none; }
  .pl-card__media:hover .pl-card__img { transform: none; }
}

/* Окно «Запросить цену»: поверх страницы, прокрутка страницы заблокирована */
.pm {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: color-mix(in oklab, var(--color-slate-900) 55%, transparent);
}
.pm__dialog {
  position: relative;
  width: min(30rem, 100%);
  max-height: 88dvh;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--color-white);
  border-radius: var(--h-radius);
  outline: none;
}
.pm__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  font: inherit;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--h-ink);
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}
.pm__close:hover { background: var(--color-slate-100); }
.pm__head { display: flex; gap: 1rem; align-items: center; padding-right: 2rem; }
.pm__photo {
  flex: none;
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: var(--h-radius);
  background: var(--h-media-bg);
}
.pm__title { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--h-ink); }
.pm__item { margin: 0.25rem 0 0; font-weight: 600; color: var(--h-ink); }
.pm__sizes { margin: 0.125rem 0 0; font-size: 0.875rem; color: var(--h-muted); }
.pm__call { margin: 1.25rem 0 0; }
.pm__call-title { margin: 0; color: var(--h-muted); }
.pm__phone {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--h-ink);
  text-decoration: none;
}
.pm__links { display: grid; gap: 0.5rem; margin: 1.25rem 0 0; padding: 0; list-style: none; }
.pm__link { justify-content: center; width: 100%; min-height: 3rem; }
.pm__icon { width: 1.25rem; height: 1.25rem; }
.pm__icon--vk { border-radius: 0.3125rem; }
.pm__link--main,
.pm__link--main:hover { background: var(--h-ink); border-color: var(--h-ink); color: var(--color-white); }
.pm__link--main:hover { background: var(--color-slate-700); border-color: var(--color-slate-700); }
.pm__hint { margin: 1rem 0 0; font-size: 0.8125rem; color: var(--h-muted); line-height: 1.5; }
</style>
