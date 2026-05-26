<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Ring -->
    <div class="relative" :style="{ width: SIZE + 'px', height: SIZE + 'px' }">
      <svg :width="SIZE" :height="SIZE" style="transform: rotate(-90deg)"
           :aria-label="`Sleep score ${score} — ${tier.label}`">
        <!-- Track -->
        <circle :cx="SIZE/2" :cy="SIZE/2" :r="R"
                fill="none" stroke="#ECECEC" :stroke-width="STROKE" />
        <!-- Progress arc -->
        <circle :cx="SIZE/2" :cy="SIZE/2" :r="R"
                fill="none"
                :stroke="tier.color"
                :stroke-width="STROKE"
                :stroke-dasharray="CIRC"
                :stroke-dashoffset="offset"
                stroke-linecap="round"
                style="transition: stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1), stroke 0.4s ease" />
      </svg>

      <!-- Centre label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span class="text-5xl font-bold tabular-nums leading-none"
              :style="{ color: tier.color, transition: 'color 0.4s ease' }">
          {{ score }}
        </span>
        <span class="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase">Score</span>
      </div>
    </div>

    <!-- Tier pill -->
    <div class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
         :style="{ backgroundColor: tier.bg, color: tier.color }">
      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: tier.color }" />
      {{ tier.label }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { scoreTier } from '../utils/scoring.js'

const props = defineProps({
  score: { type: Number, required: true },
})

const SIZE   = 188
const STROKE = 14
const R      = (SIZE - STROKE) / 2
const CIRC   = 2 * Math.PI * R

const tier   = computed(() => scoreTier(props.score))
const offset = computed(() =>
  CIRC - (Math.min(Math.max(props.score, 0), 100) / 100) * CIRC
)
</script>
