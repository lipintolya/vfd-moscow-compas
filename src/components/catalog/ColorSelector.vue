<script setup lang="ts">
import { ref, computed } from 'vue'

interface FrameColor {
  id:          'black' | 'silver' | 'gold'
  label:       string
  badge:       string
  mainHex:     string
  highlightHex:string
  shadowHex:   string
  isGradient:  boolean
}

const FRAME_COLORS: FrameColor[] = [
  {
    id:           'black',
    label:        'Кромка чёрная',
    badge:        'Чёрный анод',
    mainHex:      '#1a1a1a',
    highlightHex: '#363636',
    shadowHex:    '#0a0a0a',
    isGradient:   false,
  },
  {
    id:           'silver',
    label:        'Кромка серебро',
    badge:        'Натуральный алюминий',
    mainHex:      '#b4bcc6',
    highlightHex: '#dde3ea',
    shadowHex:    '#8a9099',
    isGradient:   true,
  },
  {
    id:           'gold',
    label:        'Кромка золото',
    badge:        'Золотой анод',
    mainHex:      '#c5a84a',
    highlightHex: '#e8c96e',
    shadowHex:    '#9e8236',
    isGradient:   true,
  },
]

const activeId = ref<'black' | 'silver' | 'gold'>('black')
const current  = computed(() => FRAME_COLORS.find(c => c.id === activeId.value)!)
</script>

<template>
  <div class="cs">

    <!-- ── Swatches ── -->
    <div class="cs-swatches" role="group" aria-label="Выберите цвет кромки">
      <button
        v-for="color in FRAME_COLORS"
        :key="color.id"
        type="button"
        class="cs-swatch"
        :class="{ 'cs-swatch--active': activeId === color.id }"
        :aria-pressed="activeId === color.id"
        @click="activeId = color.id"
      >
        <span
          class="cs-swatch__dot"
          :style="{
            background: color.isGradient
              ? `linear-gradient(135deg, ${color.highlightHex} 0%, ${color.mainHex} 45%, ${color.shadowHex} 100%)`
              : `linear-gradient(135deg, ${color.highlightHex} 0%, ${color.mainHex} 100%)`,
            boxShadow: `0 0 0 1.5px ${color.mainHex}44`,
          }"
          aria-hidden="true"
        />
        <span class="cs-swatch__label">{{ color.label }}</span>
        <span class="cs-swatch__badge">{{ color.badge }}</span>
      </button>
    </div>

    <!-- ── Door preview SVG ── -->
    <div class="cs-preview" aria-label="Превью цвета кромки двери" role="img">
      <Transition name="cs-fade" mode="out-in">
        <div :key="activeId" class="cs-door-wrap">
          <svg
            class="cs-door"
            viewBox="0 0 280 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <!-- Wall background -->
            <rect width="280" height="360" fill="#F1F5F9"/>
            <!-- Wall sections (left + right) -->
            <rect x="0"   y="0" width="62"  height="360" fill="#E8EDF3"/>
            <rect x="218" y="0" width="62"  height="360" fill="#E8EDF3"/>
            <!-- Wall texture hint -->
            <line x1="0" y1="180" x2="58" y2="180" stroke="#D4DAE2" stroke-width="0.75"/>
            <line x1="222" y1="180" x2="280" y2="180" stroke="#D4DAE2" stroke-width="0.75"/>

            <!-- Frame: top bar -->
            <rect
              x="62" y="38" width="156" height="13"
              :fill="current.mainHex"
            />
            <!-- Frame top: inner highlight -->
            <rect x="62" y="38" width="156" height="2"
              :fill="current.highlightHex" opacity="0.7"/>

            <!-- Frame: left strip -->
            <rect
              x="62" y="38" width="13" height="312"
              :fill="current.mainHex"
            />
            <!-- Frame left: inner highlight -->
            <rect x="62" y="38" width="2.5" height="312"
              :fill="current.highlightHex" opacity="0.6"/>

            <!-- Frame: right strip -->
            <rect
              x="205" y="38" width="13" height="312"
              :fill="current.mainHex"
            />
            <!-- Frame right: inner highlight -->
            <rect x="205" y="38" width="2.5" height="312"
              :fill="current.highlightHex" opacity="0.6"/>

            <!-- Door panel (грунтованное полотно) -->
            <rect x="75" y="51" width="130" height="299" fill="#FAFBFC"/>
            <!-- Panel subtle shading -->
            <rect x="75" y="51" width="130" height="299"
              fill="url(#panelGrad)" opacity="0.5"/>
            <!-- Panel inner contour -->
            <rect x="79" y="55" width="122" height="291"
              stroke="#E4E9EF" stroke-width="0.75" fill="none"/>

            <!-- Handle (скрытый монтаж, заподлицо) -->
            <rect
              x="186" y="168" width="14" height="30" rx="2"
              :fill="current.mainHex" opacity="0.92"
            />
            <!-- Handle slot -->
            <rect x="188" y="173" width="10" height="20" rx="1.5"
              fill="white" opacity="0.14"/>
            <!-- Handle inner highlight -->
            <rect x="186" y="168" width="2" height="30" rx="1"
              :fill="current.highlightHex" opacity="0.55"/>

            <!-- "Заподлицо со стеной" annotation -->
            <line x1="62" y1="12" x2="62" y2="30" stroke="#14B8A6" stroke-width="1.5" stroke-dasharray="2 2.5"/>
            <line x1="218" y1="12" x2="218" y2="30" stroke="#14B8A6" stroke-width="1.5" stroke-dasharray="2 2.5"/>
            <line x1="57"  y1="21" x2="223" y2="21" stroke="#14B8A6" stroke-width="1"/>
            <text
              x="140" y="17"
              text-anchor="middle"
              fill="#14B8A6"
              font-size="7.5"
              font-family="system-ui,sans-serif"
              font-weight="700"
              letter-spacing="0.7"
            >ЗАПОДЛИЦО СО СТЕНОЙ</text>

            <!-- "Кромка" side label -->
            <line x1="62" y1="90" x2="44" y2="90" stroke="#94A3B8" stroke-width="0.75"/>
            <line x1="62" y1="270" x2="44" y2="270" stroke="#94A3B8" stroke-width="0.75"/>
            <line x1="44" y1="90" x2="44" y2="270" stroke="#94A3B8" stroke-width="0.75"/>
            <text
              x="38" y="180"
              text-anchor="middle"
              fill="#94A3B8"
              font-size="7"
              font-family="system-ui,sans-serif"
              font-weight="600"
              transform="rotate(-90 38 180)"
            >КРОМКА</text>

            <!-- Gradient defs -->
            <defs>
              <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stop-color="#fff"    stop-opacity="0.8"/>
                <stop offset="60%"  stop-color="#fff"    stop-opacity="0"/>
                <stop offset="100%" stop-color="#C8D0DA" stop-opacity="0.4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </Transition>
    </div>

    <!-- ── Active color label ── -->
    <div class="cs-label" aria-live="polite" aria-atomic="true">
      <span
        class="cs-label__dot"
        :style="{
          background: current.isGradient
            ? `linear-gradient(135deg, ${current.highlightHex} 0%, ${current.mainHex} 100%)`
            : current.mainHex,
          boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${current.mainHex}55`,
        }"
        aria-hidden="true"
      />
      <span>{{ current.label }} · {{ current.badge }}</span>
    </div>

  </div>
</template>

<style scoped>
.cs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* ── Swatches ──
   Грид, а не flex-wrap: flex-wrap пакует карточки «журнальной вёрсткой»
   (2 в строке + 1 отдельно), из-за чего flex-grow распределял лишнее
   место неравномерно и карточки получались разной ширины. */
.cs-swatches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  max-width: 34rem;
  margin-inline: auto;
}
@media (max-width: 30rem) {
  .cs-swatches { grid-template-columns: 1fr; }
}
.cs-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.375rem;
  border: 2px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #fff;
  cursor: pointer;
  min-height: 7.75rem;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease;
}
.cs-swatch:hover { border-color: #99f6e4; transform: translateY(-2px); }
.cs-swatch--active { border-color: #14b8a6; }
.cs-swatch__dot {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
}
.cs-swatch__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1;
}
.cs-swatch__badge {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
}

/* ── Door preview ── */
.cs-preview {
  width: 100%;
  max-width: 20rem;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.10));
}
.cs-door-wrap { display: flex; justify-content: center; }
.cs-door { width: 100%; height: auto; display: block; }

/* ── Label ── */
.cs-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}
.cs-label__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  transition: background 300ms ease, box-shadow 300ms ease;
}

/* ── Transition ── */
.cs-fade-enter-active,
.cs-fade-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.cs-fade-enter-from { opacity: 0; transform: scale(0.96); }
.cs-fade-leave-to   { opacity: 0; transform: scale(1.04); }

@media (prefers-reduced-motion: reduce) {
  .cs-swatch,
  .cs-label__dot,
  .cs-fade-enter-active,
  .cs-fade-leave-active { transition: none; }
}
</style>
