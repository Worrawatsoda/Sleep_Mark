<template>
  <div class="flex flex-col items-end gap-1.5">
    <button
      @click="connected ? $emit('disconnect') : $emit('connect')"
      :disabled="connecting"
      :class="[
        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none',
        connected  ? 'bg-[#E8F7F2] text-[#085041] border border-[#1D9E75]/40' :
        connecting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                     'bg-[#1D9E75] text-white shadow-md active:scale-95',
      ]"
    >
      <!-- Bluetooth icon -->
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           :stroke="connected ? '#085041' : connecting ? '#9CA3AF' : 'white'"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           :class="connecting ? 'animate-pulse' : ''">
        <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
      </svg>
      <span class="whitespace-nowrap">
        {{ connecting ? 'Scanning…' : connected ? 'Connected' : 'Connect' }}
      </span>
    </button>
    <p v-if="error" class="text-[11px] text-red-500 text-right max-w-[200px] leading-tight">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  error:  { type: String, default: null },
})

defineEmits(['connect', 'disconnect'])

const connected  = computed(() => props.status === 'connected')
const connecting = computed(() => props.status === 'connecting')
</script>
