import React from 'react'
import { sensorStatus, sensorGoodness } from '../utils/scoring.js'

// ── Display config (UI-only — not shared with firmware) ───────────────────────
const DISPLAY = {
  temp:     { label: 'Temperature', unit: '°C',  Icon: TempIcon,   format: (v) => v.toFixed(1)          },
  humidity: { label: 'Humidity',    unit: '%',   Icon: HumidIcon,  format: (v) => Math.round(v).toString() },
  lux:      { label: 'Light',       unit: 'lux', Icon: LightIcon,  format: (v) => Math.round(v).toString() },
  motion:   { label: 'Motion',      unit: 'g',   Icon: MotionIcon, format: (v) => v.toFixed(3)           },
  distance: { label: 'Distance',    unit: 'mm',  Icon: DistIcon,   format: (v) => Math.round(v).toString() },
}

const STATUS_STYLE = {
  ok:       { label: 'Optimal',  bg: '#E8F7F2', text: '#085041', bar: '#1D9E75' },
  warn:     { label: 'Warn',     bg: '#FEF3DC', text: '#92580A', bar: '#EF9F27' },
  critical: { label: 'Critical', bg: '#FDEAEA', text: '#9B2525', bar: '#E24B4A' },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SensorCard({ sensorKey, value }) {
  const display = DISPLAY[sensorKey]
  if (!display) return null

  const statusKey = sensorStatus(sensorKey, value)
  const style     = STATUS_STYLE[statusKey]
  const pct       = Math.round(sensorGoodness(sensorKey, value) * 100)
  const { label, unit, Icon, format } = display

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: style.bg }}
          >
            <Icon color={style.text} />
          </div>
          <p className="text-[11px] text-gray-400 font-medium truncate">{label}</p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {style.label}
        </span>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-800 tabular-nums leading-none">
        {format(value)}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>

      {/* Goodness bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: style.bar }}
        />
      </div>
    </div>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function TempIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}

function HumidIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}

function LightIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MotionIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5c0 0 3 3.5 3 7s-3 7-3 7" />
      <path d="M12 5c0 0-3 3.5-3 7s3 7 3 7" />
    </svg>
  )
}

function DistIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3H3v18h18V3z" />
      <path d="M9 3v18" />
      <path d="M3 9h6" />
      <path d="M3 15h6" />
    </svg>
  )
}
