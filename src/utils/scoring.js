import { SCORE_TIERS, SENSOR_THRESHOLDS } from '../constants/sensors.js'

// Returns the tier object { min, label, color, bg } for a given score
export function scoreTier(score) {
  return SCORE_TIERS.find((t) => score >= t.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1]
}

// Returns 'ok' | 'warn' | 'critical' for a sensor reading
export function sensorStatus(key, value) {
  const t = SENSOR_THRESHOLDS[key]
  if (!t) return 'ok'
  if (value >= t.optimalLow && value <= t.optimalHigh) return 'ok'
  if (value >= t.warnLow    && value <= t.warnHigh)    return 'warn'
  return 'critical'
}

// Returns a 0–1 "goodness" value used for the progress bar fill
// 1.0 = fully in optimal range, 0.0 = worst observed extreme
export function sensorGoodness(key, value) {
  switch (key) {
    case 'temp':
      // Bi-directional: peaks at centre of optimal band (19 °C)
      return Math.max(0, 1 - Math.abs(value - 19) / 14)
    case 'humidity':
      // Bi-directional: peaks at centre of optimal band (50 %)
      return Math.max(0, 1 - Math.abs(value - 50) / 40)
    case 'lux':
      // Lower is better; 60 lux → 0 goodness
      return Math.max(0, 1 - value / 60)
    case 'motion':
      // Lower is better; 0.15 g → 0 goodness
      return Math.max(0, 1 - value / 0.15)
    case 'distance':
      // Higher is better; 400 mm → full goodness
      return Math.min(1, value / 400)
    default:
      return 0.5
  }
}
