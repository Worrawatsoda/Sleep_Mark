// ─────────────────────────────────────────────────────────────────────────────
// Sensor thresholds and scoring weights
//
// Arduino team: the score formula the app expects is:
//   score = Σ (weight_i × normalised_sensor_score_i)  scaled to 0–100
// These weights and optimal ranges must match what the UNO Q firmware computes.
// ─────────────────────────────────────────────────────────────────────────────

// Contribution of each sensor to the overall SLEEPMARK Score (must sum to 1.0)
export const SCORING_WEIGHTS = {
  temp:     0.30,   // 30 % — Temperature
  lux:      0.25,   // 25 % — Light level
  motion:   0.20,   // 20 % — Motion / vibration
  humidity: 0.15,   // 15 % — Relative humidity
  distance: 0.10,   // 10 % — Distance to nearest obstacle / light source
}

// Threshold bands for each sensor
// optimal → status "ok"    (progress bar: green)
// warn    → status "warn"  (progress bar: yellow)
// outside both → "critical" (progress bar: red)
export const SENSOR_THRESHOLDS = {
  temp: {
    // Source: Modulino Thermo (°C)
    optimalLow:  18,  optimalHigh: 20,
    warnLow:     15,  warnHigh:    26,
  },
  humidity: {
    // Source: Modulino Thermo (%)
    optimalLow:  40,  optimalHigh: 60,
    warnLow:     30,  warnHigh:    70,
  },
  lux: {
    // Source: APDS9960 on Nano 33 BLE (lux)
    // Lower is better — one-sided thresholds
    optimalLow:   0,  optimalHigh:  5,
    warnLow:      0,  warnHigh:    30,
  },
  motion: {
    // Source: LSM9DS1 IMU on Nano 33 BLE (g — resultant magnitude)
    // Lower is better — one-sided thresholds
    optimalLow:   0,  optimalHigh: 0.03,
    warnLow:      0,  warnHigh:    0.10,
  },
  distance: {
    // Source: Modulino Distance (mm)
    // Higher is better — one-sided thresholds
    optimalLow: 200,  optimalHigh: Infinity,
    warnLow:    100,  warnHigh:    Infinity,
  },
}

// Score tier boundaries — must match the firmware tier strings
export const SCORE_TIERS = [
  { min: 85,  label: 'Optimal',    color: '#1D9E75', bg: '#E8F7F2' },
  { min: 70,  label: 'Good',       color: '#5BC89A', bg: '#EDF9F4' },
  { min: 50,  label: 'Needs Fix',  color: '#EF9F27', bg: '#FEF3DC' },
  { min:  0,  label: 'Critical',   color: '#E24B4A', bg: '#FDEAEA' },
]
