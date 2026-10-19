<script setup lang="ts">
/**
 * Карточки напольного плинтуса и окно «Запросить цену» (/catalog/plintus/).
 * По кнопке — окно с фото и описанием позиции, телефоном салона и ссылками
 * на WhatsApp, Telegram и ВКонтакте (ВК — когда задан social.vk в site.ts).
 * В WhatsApp текст уже в ссылке; в Telegram и ВКонтакте он копируется по клику.
 */
import { nextTick, onMounted, ref } from 'vue'
import type { PlintusItem } from '../../data/plintus'
import { PHONE, SITE } from '../../config/site'
import { telegramWithText, textWithBody, whatsappWithText } from '../../lib/messengers'
import { useScrollLock } from '../../lib/scroll-lock'

defineProps<{ items: PlintusItem[] }>()

/* Текст запроса — одна фраза про позицию; приветствие добавляет messengers.ts */
const requestBody = (item: PlintusItem) =>
  `Интересует напольный плинтус из МДФ: ${item.text.toLowerCase()}. Подскажите, пожалуйста, цену и наличие.`

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
</script>

<template>
  <div>
    <ul class="pl-grid" role="list">
      <li v-for="item in items" :key="item.photo" class="pl-card">
        <img
          class="pl-card__img"
          :src="item.photo"
          :alt="`Напольный плинтус из МДФ: ${item.text.toLowerCase()}`"
          width="1000"
          height="1000"
          loading="lazy"
          decoding="async"
        />
        <p class="pl-card__text">{{ item.text }}</p>
        <button type="button" class="h-pill h-pill--line pl-card__btn" @click="open(item, $event)">Запросить цену</button>
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
              <p class="pm__item">{{ active.text }}</p>
            </div>
          </header>

          <p class="pm__call">
            Позвонить салону:
            <a class="pm__phone" :href="`tel:${PHONE.raw}`">{{ PHONE.label }}</a>
          </p>

          <ul class="pm__links" role="list">
            <li>
              <a class="h-pill pm__link pm__link--main" :href="whatsappWithText(requestBody(active))" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </li>
            <li>
              <a
                class="h-pill h-pill--line pm__link"
                :href="telegramWithText(requestBody(active))"
                :data-copy-text="textWithBody(requestBody(active))"
                target="_blank"
                rel="noopener noreferrer"
              >Telegram</a>
            </li>
            <li v-if="SITE.social.vk">
              <a
                class="h-pill h-pill--line pm__link"
                :href="SITE.social.vk"
                :data-copy-text="textWithBody(requestBody(active))"
                target="_blank"
                rel="noopener noreferrer"
              >ВКонтакте</a>
            </li>
          </ul>

          <p class="pm__hint">
            В WhatsApp текст уже в ссылке. В Telegram<template v-if="SITE.social.vk"> и ВКонтакте</template> он копируется при нажатии — вставьте его в чат.
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Карточки: фото без подписи-названия, описание цветом и профилем */
.pl-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem var(--h-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 43.75rem) { .pl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 62.5rem) { .pl-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

.pl-card { display: flex; flex-direction: column; min-width: 0; }
.pl-card__img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--h-radius);
  background: var(--h-media-bg);
}
.pl-card__text { margin: 0.75rem 0 0; font-size: 0.9375rem; font-weight: 600; color: var(--h-ink); }
.pl-card__btn { align-self: flex-start; margin-top: 0.625rem; font: inherit; cursor: pointer; }

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
.pm__call { margin: 1.25rem 0 0; color: var(--h-muted); }
.pm__phone {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--h-ink);
  text-decoration: none;
}
.pm__links { display: grid; gap: 0.5rem; margin: 1.25rem 0 0; padding: 0; list-style: none; }
.pm__link { justify-content: center; width: 100%; }
.pm__link--main,
.pm__link--main:hover { background: var(--color-slate-900); border-color: var(--color-slate-900); color: var(--color-white); }
.pm__link--main:hover { background: var(--color-slate-700); border-color: var(--color-slate-700); }
.pm__hint { margin: 1rem 0 0; font-size: 0.8125rem; color: var(--h-muted); line-height: 1.5; }
</style>
