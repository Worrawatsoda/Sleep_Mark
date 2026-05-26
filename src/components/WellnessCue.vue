<template>
  <div class="rounded-2xl p-4 border"
       style="background: linear-gradient(135deg, #E8F7F2 0%, #F5FBF8 100%); border-color: rgba(29,158,117,.2)">
    <div class="flex gap-3 items-start">
      <!-- Moon badge -->
      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
           :style="{ backgroundColor: score >= 85 ? '#1D9E75' : '#085041' }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
      <div class="flex flex-col gap-0.5 min-w-0">
        <p class="text-[10px] font-bold text-[#085041] tracking-[0.14em] uppercase">Sleep Tip</p>
        <p class="text-sm text-gray-700 leading-relaxed">{{ text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cue:   { type: String, default: '' },
  score: { type: Number, default: 0  },
})

const text = computed(() => {
  if (props.cue) return props.cue
  if (props.score >= 85) return 'Your sleep environment is well-optimised. Good night!'
  return 'Connect your SLEEPMARK device to begin monitoring your sleep environment.'
})
</script>
