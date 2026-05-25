# SLEEPMARK Dashboard

Progressive Web App dashboard for the SLEEPMARK sleep environment awareness platform.
Connects to **SLEEPMARK-UNO** over BLE and displays live sensor data, a weighted score, and wellness cues.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production bundle → dist/
npm run preview    # serve the production build locally
```

> **Web Bluetooth requirement:** Chrome or Edge on HTTPS (or `localhost`). Safari is not supported.

---

## BLE Protocol — Arduino team reference

Everything the firmware needs to know is in one place: [`src/constants/ble.js`](src/constants/ble.js)

### 1. Advertise as

```
Device name: SLEEPMARK-UNO
```

### 2. GATT layout

| Role | UUID | Properties |
|---|---|---|
| Primary service | `6e400001-b5a3-f393-e0a9-e50e24dcca9e` | — |
| TX characteristic (Arduino → App) | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` | **NOTIFY** |
| RX characteristic (App → Arduino) | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` | WRITE WITHOUT RESPONSE *(reserved)* |

These are the **Nordic UART Service (NUS)** UUIDs, supported by the `ArduinoBLE` library out of the box.

### 3. TX packet format

Send a **UTF-8 JSON string** over the TX characteristic at the recommended interval of **2 000 ms**.

```json
{
  "score":    78,
  "temp":     22.4,
  "humidity": 54,
  "lux":      3,
  "motion":   0.02,
  "distance": 240,
  "tier":     "Good",
  "cue":      "Lower room temp by 2°C"
}
```

#### Field definitions

| Field | Type | Unit | Source hardware | Notes |
|---|---|---|---|---|
| `score` | int 0–100 | — | computed | Weighted sleep quality score (see §Scoring) |
| `temp` | float | °C | Modulino Thermo | 1 decimal place |
| `humidity` | float | % | Modulino Thermo | 0–100 |
| `lux` | float | lux | APDS9960 on Nano 33 BLE | 0 = dark |
| `motion` | float | g | LSM9DS1 IMU on Nano 33 BLE | resultant vector magnitude |
| `distance` | int | mm | Modulino Distance | distance to nearest object |
| `tier` | string | — | computed | `"Optimal"` / `"Good"` / `"Needs Fix"` / `"Critical"` |
| `cue` | string | — | computed | Short human-readable wellness tip |

### 4. Scoring algorithm

All constants are mirrored in [`src/constants/sensors.js`](src/constants/sensors.js).

#### Weights

| Sensor | Weight |
|---|---|
| Temperature | 30 % |
| Light (lux) | 25 % |
| Motion | 20 % |
| Humidity | 15 % |
| Distance | 10 % |

#### Optimal ranges

| Sensor | Optimal | Warn | Critical |
|---|---|---|---|
| `temp` | 18–20 °C | 15–26 °C | outside warn |
| `humidity` | 40–60 % | 30–70 % | outside warn |
| `lux` | 0–5 lux | 0–30 lux | > 30 lux |
| `motion` | < 0.03 g | < 0.10 g | ≥ 0.10 g |
| `distance` | ≥ 200 mm | ≥ 100 mm | < 100 mm |

#### Tier thresholds

| Score | Tier |
|---|---|
| 85–100 | Optimal |
| 70–84 | Good |
| 50–69 | Needs Fix |
| 0–49 | Critical |

### 5. Arduino library recommendation

```cpp
#include <ArduinoBLE.h>

BLEService uartService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
BLEStringCharacteristic txChar("6e400003-b5a3-f393-e0a9-e50e24dcca9e",
                                BLERead | BLENotify, 128);
BLEStringCharacteristic rxChar("6e400002-b5a3-f393-e0a9-e50e24dcca9e",
                                BLEWrite, 64);

void setup() {
  BLE.begin();
  BLE.setLocalName("SLEEPMARK-UNO");   // must match DEVICE_NAME in ble.js
  BLE.setAdvertisedService(uartService);
  uartService.addCharacteristic(txChar);
  uartService.addCharacteristic(rxChar);
  BLE.addService(uartService);
  BLE.advertise();
}

void loop() {
  BLE.poll();
  // Build and send JSON every 2 000 ms
  String json = buildJson(score, temp, humidity, lux, motion, distance, tier, cue);
  txChar.writeValue(json);
  delay(2000);
}
```

---

## Project structure

```
sleepmark/
├── index.html
├── public/
│   ├── manifest.json        # PWA manifest — name, theme, icons
│   ├── sw.js                # Service Worker — cache-first offline support
│   ├── icon-192.svg
│   └── icon-512.svg
└── src/
    ├── constants/
    │   ├── ble.js           # ← BLE UUIDs, device name, TX interval
    │   └── sensors.js       # ← Thresholds, scoring weights, tier bands
    ├── utils/
    │   ├── db.js            # IndexedDB — persist and retrieve readings
    │   └── scoring.js       # scoreTier · sensorStatus · sensorGoodness
    ├── hooks/
    │   └── useBluetooth.js  # Web Bluetooth connect / notify / chunk-buffer
    ├── components/
    │   ├── BluetoothConnect.jsx   # Scan / connect / disconnect button
    │   ├── OfflineIndicator.jsx   # Amber banner when BLE disconnected
    │   ├── ScoreRing.jsx          # Animated SVG arc ring + tier pill
    │   ├── ScoreHistory.jsx       # Recharts area chart — session trend
    │   ├── SensorCard.jsx         # Value · status badge · goodness bar
    │   ├── SelfReportButtons.jsx  # Stressed / Normal / Relaxed
    │   └── WellnessCue.jsx        # Sleep tip card from BLE cue field
    ├── App.jsx              # Page layout and state wiring
    ├── index.css
    └── main.jsx             # React root + SW registration
```

### Data flow

```
Arduino (SLEEPMARK-UNO)
  └─ BLE Notify (JSON string, every 2 s)
       └─ useBluetooth.js  (chunks → JSON.parse)
            ├─ IndexedDB   (persist via db.js)
            └─ App state   (live display)
                 ├─ ScoreRing     (score + tier)
                 ├─ ScoreHistory  (Recharts trend)
                 ├─ SensorCard ×5 (per-sensor status)
                 ├─ SelfReportButtons (mood log)
                 └─ WellnessCue   (cue string from BLE)
```

---

## PWA / offline behaviour

- Service Worker caches all static assets at install time.
- On disconnect, the last BLE reading is loaded from IndexedDB and displayed with an offline banner.
- The app is installable via *Add to Home Screen* on Android (Chrome) and iOS (Safari — limited BLE support).

---

## Tech stack

| Layer | Library |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| BLE | Web Bluetooth API (browser native) |
| Offline storage | IndexedDB (browser native) |
| Offline support | Service Worker (browser native) |
