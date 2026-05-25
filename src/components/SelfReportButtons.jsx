import React, { useState } from 'react'

const MOODS = [
  { id: 'stressed', label: 'Stressed', emoji: '😟', color: '#E24B4A', bg: '#FDEAEA', btnA: 'A' },
  { id: 'normal',   label: 'Normal',   emoji: '😐', color: '#EF9F27', bg: '#FEF3DC', btnA: 'B' },
  { id: 'relaxed',  label: 'Relaxed',  emoji: '😌', color: '#1D9E75', bg: '#E8F7F2', btnA: 'C' },
]

const RESET_MS = 4000

export function SelfReportButtons({ onSelect }) {
  const [active, setActive] = useState(null)

  function pick(id) {
    setActive(id)
    onSelect?.(id)
    setTimeout(() => setActive(null), RESET_MS)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold text-gray-400 text-center tracking-[0.12em] uppercase">
        How do you feel?
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((m) => {
          const sel = active === m.id
          return (
            <button
              key={m.id}
              onClick={() => pick(m.id)}
              aria-pressed={sel}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2"
              style={{
                borderColor:     sel ? m.color : 'transparent',
                backgroundColor: sel ? m.bg    : '#F3F4F6',
                focusRingColor:  m.color,
              }}
            >
              <span className="text-[26px] leading-none">{m.emoji}</span>
              <span className="text-[11px] font-bold" style={{ color: sel ? m.color : '#6B7280' }}>
                {m.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
