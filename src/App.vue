<template>
  <div class="min-h-dvh bg-gray-50">
    <div class="max-w-[390px] mx-auto w-full min-h-dvh flex flex-col">

      <!-- Header -->
      <header class="px-4 pt-10 pb-2">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-extrabold text-[#085041] tracking-tight leading-none">SLEEPMARK</h1>
            <p class="text-xs text-gray-400 mt-0.5">Sleep Environment Dashboard</p>
          </div>
          <BluetoothConnect
            :status="status"
            :error="error"
            @connect="connect"
            @disconnect="disconnect"
          />
        </div>
        <OfflineIndicator :show="showOffline" :last-updated="lastUpdated" />
      </header>

      <!-- Score ring + history -->
      <section class="flex flex-col items-center pt-6 pb-4 px-4 gap-3">
        <ScoreRing :score="display.score" />
        <div class="w-full px-2">
          <ScoreHistory :history="history" />
        </div>
        <p v-if="history.length >= 2"
           class="text-[10px] text-gray-300 tracking-wide">
          Score trend · last {{ history.length }} readings
        </p>
      </section>

      <div class="mx-4 border-t border-gray-100" />

      <!-- Sensor cards -->
      <section class="px-4 pt-4 pb-2">
        <p class="text-[11px] font-semibold text-gray-400 tracking-[0.12em] uppercase mb-3">Sensors</p>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="(key, i) in SENSORS" :key="key"
               :class="SENSORS.length % 2 !== 0 && i === SENSORS.length - 1 ? 'col-span-2' : ''">
            <SensorCard :sensor-key="key" :value="display[key] ?? 0" />
          </div>
        </div>
      </section>

      <!-- Self-report -->
      <section class="px-4 pt-4 pb-2">
        <SelfReportButtons @select="mood = $event" />
        <p v-if="mood" class="text-[10px] text-center text-gray-400 mt-2">
          Logged: <span class="font-semibold capitalize">{{ mood }}</span>
        </p>
      </section>

      <!-- Wellness cue -->
      <section class="px-4 pt-2 pb-6">
        <WellnessCue :cue="display.cue" :score="display.score" />
      </section>

      <!-- Footer -->
      <footer class="mt-auto px-4 pb-8 pt-2 text-center border-t border-gray-100">
        <p class="text-[10px] text-gray-300 tracking-widest uppercase">
          SLEEPMARK · {{ year }}
        </p>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BluetoothConnect   from './components/BluetoothConnect.vue'
import OfflineIndicator   from './components/OfflineIndicator.vue'
import ScoreRing          from './components/ScoreRing.vue'
import ScoreHistory       from './components/ScoreHistory.vue'
import SensorCard         from './components/SensorCard.vue'
import SelfReportButtons  from './components/SelfReportButtons.vue'
import WellnessCue        from './components/WellnessCue.vue'
import { useBluetooth }   from './composables/useBluetooth.js'
import { getLastReading } from './utils/db.js'

// ── Constants ─────────────────────────────────────────────────────────────────
const SENSORS = ['temp', 'humidity', 'lux', 'motion', 'distance']
const EMPTY   = { score: 0, temp: 0, humidity: 0, lux: 0, motion: 0, distance: 0, tier: 'Critical', cue: '' }
const year    = new Date().getFullYear()

// ── State ─────────────────────────────────────────────────────────────────────
const data        = ref(null)
const lastUpdated = ref(null)
const history     = ref([])
const mood        = ref(null)

// ── BLE ───────────────────────────────────────────────────────────────────────
function handleData(incoming) {
  data.value        = incoming
  lastUpdated.value = Date.now()
  history.value     = [...history.value.slice(-49), { score: incoming.score, t: Date.now() }]
}

const { status, error, connect, disconnect } = useBluetooth(handleData)

// ── Computed ──────────────────────────────────────────────────────────────────
const display     = computed(() => data.value ?? EMPTY)
const isConnected = computed(() => status.value === 'connected')
const showOffline = computed(() => !isConnected.value && !!data.value)

// ── Load cached data on mount ─────────────────────────────────────────────────
onMounted(async () => {
  const cached = await getLastReading().catch(console.warn)
  if (cached) {
    data.value        = cached
    lastUpdated.value = cached.timestamp
  }
})
</script>
