// ─────────────────────────────────────────────────────────────────────────────
// BLE constants — single source of truth for both app and Arduino firmware
//
// Arduino team checklist:
//   1. Advertise device name exactly as DEVICE_NAME below
//   2. Expose a primary service with SERVICE_UUID
//   3. Add a notify characteristic at TX_CHAR_UUID  (Arduino → App)
//   4. Add a write  characteristic at RX_CHAR_UUID  (App → Arduino, future use)
//   5. Send JSON frames on TX; see README.md §BLE Protocol for full spec
// ─────────────────────────────────────────────────────────────────────────────

// Advertised device name scanned by the browser picker
export const DEVICE_NAME = 'SLEEPMARK-UNO'

// Nordic UART Service (NUS) — widely supported on Arduino / nRF libraries
export const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'

// TX: Arduino → App  (properties: NOTIFY)
export const TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

// RX: App → Arduino  (properties: WRITE WITHOUT RESPONSE) — reserved for future commands
export const RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'

// Recommended TX interval (ms) — balance between responsiveness and power draw
export const TX_INTERVAL_MS = 2000
