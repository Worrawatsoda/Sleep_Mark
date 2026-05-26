<template>
  <div class="flex flex-col gap-2.5">
    <p class="text-[11px] font-semibold text-gray-400 text-center tracking-[0.12em] uppercase">
      How do you feel?
    </p>
    <div class="grid grid-cols-3 gap-2">
      <button v-for="m in MOODS" :key="m.id"
              @click="pick(m.id)"
              :aria-pressed="active === m.id"
              class="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 transition-all duration-200 active:scale-95 focus:outline-none"
              :style="{
                borderColor:     active === m.id ? m.color : 'transparent',
                backgroundColor: active === m.id ? m.bg    : '#F3F4F6',
              }">
        <span class="text-[26px] leading-none">{{ m.emoji }}</span>
        <span class="text-[11px] font-bold"
              :style="{ color: active === m.id ? m.color : '#6B7280' }">
          {{ m.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const MOODS = [
  { id: 'stressed', label: 'Stressed', emoji: '😟', color: '#E24B4A', bg: '#FDEAEA' },
  { id: 'normal',   label: 'Normal',   emoji: '😐', color: '#EF9F27', bg: '#FEF3DC' },
  { id: 'relaxed',  label: 'Relaxed',  emoji: '😌', color: '#1D9E75', bg: '#E8F7F2' },
]

const emit  = defineEmits(['select'])
const active = ref(null)

function pick(id) {
  active.value = id
  emit('select', id)
  setTimeout(() => { active.value = null }, 4000)
}
</script>
