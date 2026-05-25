import React, { useState, useCallback, useEffect } from 'react'
import { BluetoothConnect }  from './components/BluetoothConnect.jsx'
import { OfflineIndicator }  from './components/OfflineIndicator.jsx'
import { ScoreRing }         from './components/ScoreRing.jsx'
import { ScoreHistory }      from './components/ScoreHistory.jsx'
import { SensorCard }        from './components/SensorCard.jsx'
import { SelfReportButtons } from './components/SelfReportButtons.jsx'
import { WellnessCue }       from './components/WellnessCue.jsx'
import { useBluetooth }      from './hooks/useBluetooth.js'
import { getLastReading }    from './utils/db.js'

const SENSORS = ['temp', 'humidity', 'lux', 'motion', 'distance']

const EMPTY = {
  score: 0, temp: 0, humidity: 0, lux: 0,
  motion: 0, distance: 0, tier: 'Critical', cue: '',
}

export default function App() {
  const [data,        setData]        = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [history,     setHistory]     = useState([])
  const [mood,        setMood]        = useState(null)

  // ── BLE data handler ────────────────────────────────────────────────────────
  const handleData = useCallback((incoming) => {
    setData(incoming)
    setLastUpdated(Date.now())
    setHistory((prev) => [
      ...prev.slice(-49),
      { score: incoming.score, t: Date.now() },
    ])
  }, [])

  const { status, error, connect, disconnect } = useBluetooth(handleData)
  const isConnected = status === 'connected'

  // ── Load cached reading on mount ────────────────────────────────────────────
  useEffect(() => {
    getLastReading()
      .then((cached) => {
        if (cached) {
          setData(cached)
          setLastUpdated(cached.timestamp)
        }
      })
      .catch(console.warn)
  }, [])

  const display     = data ?? EMPTY
  const showOffline = !isConnected && !!data

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="max-w-mobile mx-auto w-full min-h-dvh flex flex-col">

        {/* ── Header ── */}
        <header className="px-4 pt-10 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-[#085041] tracking-tight leading-none">
                SLEEPMARK
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Sleep Environment Dashboard</p>
            </div>
            <BluetoothConnect
              status={status}
              error={error}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>

          <OfflineIndicator show={showOffline} lastUpdated={lastUpdated} />
        </header>

        {/* ── Score ring ── */}
        <section className="flex flex-col items-center pt-6 pb-4 px-4 gap-3">
          <ScoreRing score={display.score} />
          {/* Trend chart (visible once 2+ readings accumulated this session) */}
          <div className="w-full px-2">
            <ScoreHistory history={history} />
          </div>
          {history.length >= 2 && (
            <p className="text-[10px] text-gray-300 tracking-wide">Score trend · last {history.length} readings</p>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Sensor cards grid ── */}
        <section className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-gray-400 tracking-[0.12em] uppercase mb-3">
            Sensors
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SENSORS.map((key, i) => (
              <div
                key={key}
                className={
                  // Last card spans full width when odd total
                  SENSORS.length % 2 !== 0 && i === SENSORS.length - 1
                    ? 'col-span-2'
                    : ''
                }
              >
                <SensorCard sensorKey={key} value={display[key] ?? 0} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Self-report ── */}
        <section className="px-4 pt-4 pb-2">
          <SelfReportButtons onSelect={setMood} />
          {mood && (
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Logged: <span className="font-semibold capitalize">{mood}</span>
            </p>
          )}
        </section>

        {/* ── Wellness cue ── */}
        <section className="px-4 pt-2 pb-6">
          <WellnessCue cue={display.cue} score={display.score} />
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto px-4 pb-8 pt-2 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-300 tracking-widest uppercase">
            SLEEPMARK · {new Date().getFullYear()}
          </p>
        </footer>

      </div>
    </div>
  )
}
