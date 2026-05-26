<template>
  <div v-if="show"
       class="flex items-center gap-2 px-3 py-2 mt-3 bg-amber-50 border border-amber-200/80 rounded-xl">
    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
    <p class="text-xs text-amber-700">
      Offline — showing cached data
      <span v-if="timeStr" class="text-amber-500"> · last at {{ timeStr }}</span>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show:        { type: Boolean, default: false },
  lastUpdated: { type: Number,  default: null  },
})

const timeStr = computed(() =>
  props.lastUpdated
    ? new Date(props.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null
)
</script>
