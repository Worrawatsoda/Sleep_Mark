<template>
  <svg v-if="history.length >= 2"
       :viewBox="`0 0 ${W} ${H}`"
       class="w-full"
       :style="{ height: H + 'px' }"
       preserveAspectRatio="none">
    <defs>
      <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#1D9E75" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#1D9E75" stop-opacity="0"    />
      </linearGradient>
    </defs>
    <!-- Area fill -->
    <path :d="areaPath" fill="url(#histGrad)" />
    <!-- Line -->
    <path :d="linePath" fill="none" stroke="#1D9E75" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  history: { type: Array, default: () => [] },
})

const W = 358
const H = 56

const points = computed(() => {
  const data = props.history
  if (data.length < 2) return []
  return data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (Math.min(Math.max(d.score, 0), 100) / 100) * H,
  }))
})

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  if (!points.value.length) return ''
  const last = points.value[points.value.length - 1]
  return `${linePath.value} L${last.x},${H} L0,${H} Z`
})
</script>
