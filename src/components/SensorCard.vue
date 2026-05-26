<template>
  <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
             :style="{ backgroundColor: style.bg }">
          <component :is="icon" :color="style.text" />
        </div>
        <p class="text-[11px] text-gray-400 font-medium truncate">{{ display.label }}</p>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: style.bg, color: style.text }">
        {{ style.label }}
      </span>
    </div>

    <!-- Value -->
    <p class="text-2xl font-bold text-gray-800 tabular-nums leading-none">
      {{ display.format(value) }}
      <span class="text-sm font-normal text-gray-400 ml-1">{{ display.unit }}</span>
    </p>

    <!-- Goodness bar -->
    <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div class="h-full rounded-full transition-all duration-700 ease-out"
           :style="{ width: pct + '%', backgroundColor: style.bar }" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, h } from 'vue'
import { sensorStatus, sensorGoodness } from '../utils/scoring.js'

// ── Display config (UI only) ──────────────────────────────────────────────────
const DISPLAY = {
  temp:     { label: 'Temperature', unit: '°C',  format: (v) => v.toFixed(1),             icon: 'TempIcon'   },
  humidity: { label: 'Humidity',    unit: '%',   format: (v) => Math.round(v).toString(),  icon: 'HumidIcon'  },
  lux:      { label: 'Light',       unit: 'lux', format: (v) => Math.round(v).toString(),  icon: 'LightIcon'  },
  motion:   { label: 'Motion',      unit: 'g',   format: (v) => v.toFixed(3),              icon: 'MotionIcon' },
  distance: { label: 'Distance',    unit: 'mm',  format: (v) => Math.round(v).toString(),  icon: 'DistIcon'   },
}

const STATUS_STYLE = {
  ok:       { label: 'Optimal',  bg: '#E8F7F2', text: '#085041', bar: '#1D9E75' },
  warn:     { label: 'Warn',     bg: '#FEF3DC', text: '#92580A', bar: '#EF9F27' },
  critical: { label: 'Critical', bg: '#FDEAEA', text: '#9B2525', bar: '#E24B4A' },
}

// ── SVG icon components ───────────────────────────────────────────────────────
const TempIcon   = (props) => h('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'none', stroke:props.color, 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [h('path', { d:'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z' })])
const HumidIcon  = (props) => h('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'none', stroke:props.color, 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [h('path', { d:'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })])
const LightIcon  = (props) => h('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'none', stroke:props.color, 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [h('circle',{cx:'12',cy:'12',r:'5'}), h('line',{x1:'12',y1:'1',x2:'12',y2:'3'}), h('line',{x1:'12',y1:'21',x2:'12',y2:'23'}), h('line',{x1:'4.22',y1:'4.22',x2:'5.64',y2:'5.64'}), h('line',{x1:'18.36',y1:'18.36',x2:'19.78',y2:'19.78'}), h('line',{x1:'1',y1:'12',x2:'3',y2:'12'}), h('line',{x1:'21',y1:'12',x2:'23',y2:'12'})])
const MotionIcon = (props) => h('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'none', stroke:props.color, 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [h('path',{d:'M5 12h14'}), h('path',{d:'M12 5c0 0 3 3.5 3 7s-3 7-3 7'}), h('path',{d:'M12 5c0 0-3 3.5-3 7s3 7 3 7'})])
const DistIcon   = (props) => h('svg', { width:14, height:14, viewBox:'0 0 24 24', fill:'none', stroke:props.color, 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [h('path',{d:'M21 3H3v18h18V3z'}), h('path',{d:'M9 3v18'}), h('path',{d:'M3 9h6'}), h('path',{d:'M3 15h6'})])

const ICONS = { TempIcon, HumidIcon, LightIcon, MotionIcon, DistIcon }

// ── Props & computed ──────────────────────────────────────────────────────────
const props = defineProps({
  sensorKey: { type: String, required: true },
  value:     { type: Number, required: true },
})

const display   = computed(() => DISPLAY[props.sensorKey])
const icon      = computed(() => ICONS[display.value?.icon])
const statusKey = computed(() => sensorStatus(props.sensorKey, props.value))
const style     = computed(() => STATUS_STYLE[statusKey.value])
const pct       = computed(() => Math.round(sensorGoodness(props.sensorKey, props.value) * 100))
</script>
